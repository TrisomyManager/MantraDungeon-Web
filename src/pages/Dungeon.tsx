import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sword,
  Scroll,
  Gem,
  Skull,
  Check,
  ArrowLeft,
  Lock,
  MapPin,
  X,
  Sparkles,
  Heart,
  Zap,
  BookOpen,
} from 'lucide-react';
import Layout from '@/components/Layout';
import { useGameStore, MONSTER_DATABASE } from '@/store/gameStore';
import { useGameText } from '@/hooks/useGameText';

/* ============================================================
   Tier Color Configuration
   ============================================================ */

const TIER_CONFIG: Record<number, {
  primary: string;
  secondary: string;
  accent: string;
  glow: string;
  name: string;
}> = {
  1: { primary: '#D4A017', secondary: '#8B4513', accent: '#FFD700', glow: 'rgba(212,160,23,0.6)', name: 'Ember' },
  2: { primary: '#2ECC71', secondary: '#1B6B2E', accent: '#39FF14', glow: 'rgba(46,204,113,0.6)', name: 'Verdant' },
  3: { primary: '#1ABC9C', secondary: '#0D4F4F', accent: '#00E5FF', glow: 'rgba(26,188,156,0.6)', name: 'Abyssal' },
  4: { primary: '#8E44AD', secondary: '#4A1A6B', accent: '#E040FB', glow: 'rgba(142,68,173,0.6)', name: 'Void' },
  5: { primary: '#2980B9', secondary: '#0C1445', accent: '#00BFFF', glow: 'rgba(41,128,185,0.6)', name: 'Deep Space' },
};

/* ============================================================
   Room Type Configuration
   ============================================================ */

interface RoomTypeConfig {
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
  label: string;
}

const ROOM_TYPE_MAP: Record<string, RoomTypeConfig> = {
  battle: {
    icon: Sword,
    color: '#E74C3C',
    bgColor: 'rgba(231,76,60,0.1)',
    borderColor: 'rgba(231,76,60,0.5)',
    glowColor: 'rgba(231,76,60,0.3)',
    label: 'Combat',
  },
  altar: {
    icon: Scroll,
    color: '#9B8B7A',
    bgColor: 'rgba(155,139,122,0.1)',
    borderColor: 'rgba(155,139,122,0.5)',
    glowColor: 'rgba(155,139,122,0.3)',
    label: 'Lore',
  },
  treasure: {
    icon: Gem,
    color: '#D4A017',
    bgColor: 'rgba(212,160,23,0.1)',
    borderColor: 'rgba(212,160,23,0.5)',
    glowColor: 'rgba(212,160,23,0.3)',
    label: 'Treasure',
  },
  boss: {
    icon: Skull,
    color: '#E040FB',
    bgColor: 'rgba(224,64,251,0.1)',
    borderColor: 'rgba(224,64,251,0.6)',
    glowColor: 'rgba(224,64,251,0.4)',
    label: 'Boss',
  },
};

/* ============================================================
   Node Position Calculator
   ============================================================ */

interface NodePosition {
  x: number;
  y: number;
  row: number;
  col: number;
}

function calculateNodePositions(roomCount: number): NodePosition[] {
  const positions: NodePosition[] = [];
  const roomsPerRow = Math.min(4, Math.ceil(roomCount / 2));

  for (let i = 0; i < roomCount; i++) {
    const row = Math.floor(i / roomsPerRow);
    const col = i % roomsPerRow;
    // Stagger odd rows
    const stagger = row % 2 === 1 ? 0.5 : 0;
    const x = ((col + stagger) / (roomsPerRow - 1 + stagger)) * 100;
    const y = (row / (Math.ceil(roomCount / roomsPerRow) - 1 || 1)) * 100;
    positions.push({
      x: Math.min(95, Math.max(5, x)),
      y: Math.min(90, Math.max(5, y)),
      row,
      col,
    });
  }

  return positions;
}

/* ============================================================
   Helper: Check if room is reachable
   ============================================================ */

function isRoomReachable(
  roomId: string,
  rooms: Array<{ id: string; connections: string[]; cleared: boolean }>,
  currentRoomId: string | null
): boolean {
  if (!currentRoomId) return roomId === rooms[0]?.id;
  const currentRoom = rooms.find(r => r.id === currentRoomId);
  if (!currentRoom) return false;

  // Room is reachable if it's connected from the current room
  const isConnected = currentRoom.connections.includes(roomId);

  // Or if it's the current room itself
  const isCurrent = roomId === currentRoomId;

  // Or if any cleared room connects to it (branching exploration)
  const connectedFromCleared = rooms.some(
    r => r.cleared && r.connections.includes(roomId)
  );

  return isCurrent || isConnected || connectedFromCleared;
}

function isRoomLocked(
  roomId: string,
  rooms: Array<{ id: string; connections: string[]; cleared: boolean }>,
  currentRoomId: string | null
): boolean {
  if (roomId === currentRoomId) return false;
  if (rooms.find(r => r.id === roomId)?.cleared) return false;
  return !isRoomReachable(roomId, rooms, currentRoomId);
}

/* ============================================================
   Main Dungeon Component
   ============================================================ */

const Dungeon: React.FC = React.memo(function Dungeon() {
  const navigate = useNavigate();
  const t = useGameText();
  const {
    dungeonRooms,
    currentRoomId,
    currentFloor,
    currentTier,
    playerHp,
    playerMaxHp,
    roomsCleared,
    totalRooms,
    enterRoom,
    returnToCamp,
    clearAltarRoom,
  } = useGameStore();

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [zoomingRoom, setZoomingRoom] = useState<string | null>(null);
  const [showAbandonModal, setShowAbandonModal] = useState(false);
  const [showAltarModal, setShowAltarModal] = useState(false);
  const [altarRoomId, setAltarRoomId] = useState<string | null>(null);

  const tierConfig = TIER_CONFIG[currentTier] || TIER_CONFIG[1];

  // Calculate node positions
  const nodePositions = useMemo(
    () => calculateNodePositions(dungeonRooms.length),
    [dungeonRooms.length]
  );

  // Selected room data
  const selectedRoom = useMemo(
    () => dungeonRooms.find(r => r.id === selectedRoomId),
    [dungeonRooms, selectedRoomId]
  );

  // Floor progress percentage
  const floorProgress = useMemo(
    () => (totalRooms > 0 ? (roomsCleared / totalRooms) * 100 : 0),
    [roomsCleared, totalRooms]
  );

  // Altar: find next monster's weakness hint
  const altarWeaknessHint = useMemo(() => {
    if (!altarRoomId) return null;
    const aRoom = dungeonRooms.find(r => r.id === altarRoomId);
    if (!aRoom) return null;
    // Find the next connected battle/boss room that is not cleared
    const nextRoom = dungeonRooms.find(r =>
      aRoom.connections.includes(r.id) &&
      !r.cleared &&
      (r.type === 'battle' || r.type === 'boss')
    );
    if (!nextRoom?.monsterId) return null;
    const monster = MONSTER_DATABASE.find(m => m.id === nextRoom.monsterId);
    if (!monster) return null;
    return {
      name: monster.displayName,
      weakness: monster.weaknessPool.slice(0, 2).join(' '),
    };
  }, [altarRoomId, dungeonRooms]);

  // Check if a room is the current room
  const isCurrentRoom = useCallback(
    (roomId: string) => roomId === currentRoomId,
    [currentRoomId]
  );

  // Handle room click
  const handleRoomClick = useCallback(
    (roomId: string) => {
      const room = dungeonRooms.find(r => r.id === roomId);
      if (!room) return;

      if (room.cleared) {
        setSelectedRoomId(roomId);
        return;
      }

      if (isRoomLocked(roomId, dungeonRooms, currentRoomId)) return;

      setSelectedRoomId(roomId);
    },
    [dungeonRooms, currentRoomId]
  );

  // Handle enter room
  const handleEnterRoom = useCallback(
    (roomId: string) => {
      const room = dungeonRooms.find(r => r.id === roomId);
      if (!room || room.cleared) return;
      if (isRoomLocked(roomId, dungeonRooms, currentRoomId)) return;

      if (room.type === 'battle' || room.type === 'boss') {
        setZoomingRoom(roomId);
        setTimeout(() => {
          enterRoom(roomId);
          navigate(`/battle/${roomId}`);
        }, 600);
      } else if (room.type === 'altar') {
        // In-dungeon altar: interact locally instead of navigating away
        enterRoom(roomId);
        setAltarRoomId(roomId);
        setShowAltarModal(true);
        setSelectedRoomId(null);
      } else {
        // Treasure room - auto-clear with effect
        enterRoom(roomId);
        setSelectedRoomId(null);
      }
    },
    [dungeonRooms, currentRoomId, enterRoom, navigate]
  );

  // Handle abandon run
  const handleAbandon = useCallback(() => {
    returnToCamp();
    navigate('/camp');
  }, [returnToCamp, navigate]);

  // Handle altar interaction complete
  const handleAltarComplete = useCallback(() => {
    if (altarRoomId) {
      clearAltarRoom(altarRoomId);
    }
    setShowAltarModal(false);
    setAltarRoomId(null);
  }, [altarRoomId, clearAltarRoom]);

  // Room type display name
  const getRoomDisplayType = (type: string): string => {
    return ROOM_TYPE_MAP[type]?.label || type;
  };

  // SVG connection lines between rooms
  const connectionLines = useMemo(() => {
    const lines: Array<{
      id: string;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      active: boolean;
      cleared: boolean;
    }> = [];

    dungeonRooms.forEach((room, i) => {
      const fromPos = nodePositions[i];
      if (!fromPos) return;

      room.connections.forEach(connId => {
        const connIndex = dungeonRooms.findIndex(r => r.id === connId);
        if (connIndex === -1) return;
        const toPos = nodePositions[connIndex];
        if (!toPos) return;

        const isActive = room.cleared || dungeonRooms[connIndex]?.cleared;
        const isClearedPath = room.cleared && dungeonRooms[connIndex]?.cleared;

        lines.push({
          id: `${room.id}-${connId}`,
          x1: fromPos.x,
          y1: fromPos.y,
          x2: toPos.x,
          y2: toPos.y,
          active: isActive,
          cleared: isClearedPath,
        });
      });
    });

    return lines;
  }, [dungeonRooms, nodePositions]);

  // Empty state: no active dungeon (e.g., direct URL visit, post-resetRun)
  if (dungeonRooms.length === 0) {
    return (
      <Layout>
        <div
          className="min-h-[100dvh] flex flex-col items-center justify-center relative overflow-hidden gap-6"
          style={{ backgroundColor: '#0A0A0F' }}
        >
          <MapPin className="w-12 h-12 text-text-muted" />
          <p className="font-cinzel text-body text-text-secondary text-center max-w-md">
            No active dungeon. Return to camp to start a new run.
          </p>
          <button
            onClick={() => navigate('/camp')}
            className="px-6 py-3 rounded-radius-md font-cinzel text-body-sm font-bold transition-all duration-200 cursor-pointer"
            style={{
              backgroundColor: tierConfig.primary,
              color: '#0A0A0F',
              boxShadow: `0 0 12px ${tierConfig.glow}`,
            }}
          >
            <ArrowLeft className="inline w-4 h-4 mr-2" />
            Return to Camp
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div
        className="min-h-[100dvh] flex flex-col items-center justify-center relative overflow-hidden"
        style={{
          backgroundColor: '#0A0A0F',
          backgroundImage: `radial-gradient(ellipse at 50% 40%, ${tierConfig.primary}15 0%, transparent 60%)`,
        }}
      >
        {/* Grid overlay texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(212,160,23,0.03) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(212,160,23,0.03) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />

        {/* Zoom transition overlay */}
        <AnimatePresence>
          {zoomingRoom && (
            <motion.div
              className="fixed inset-0 z-[200] pointer-events-none"
              style={{ backgroundColor: '#0A0A0F' }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            />
          )}
        </AnimatePresence>

        {/* Top Info Bar */}
        <motion.div
          className="absolute top-[48px] left-0 right-0 z-50 flex items-center justify-between px-4 py-2"
          style={{
            backgroundColor: 'rgba(10,10,15,0.85)',
            backdropFilter: 'blur(8px)',
            borderBottom: '1px solid rgba(232,224,208,0.08)',
          }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        >
          {/* Back to camp */}
          <button
            onClick={() => setShowAbandonModal(true)}
            className="flex items-center gap-1 text-text-muted hover:text-text-primary transition-colors duration-200 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-inter text-body-sm tracking-wide">{t('return_to_camp')}</span>
          </button>

          {/* Center: Floor info */}
          <div className="flex items-center gap-3">
            <span className="font-fira-code text-body-sm text-text-primary">
              {t('floor_label')} {currentFloor}
            </span>
            <span className="text-text-muted">|</span>
            <span className="font-fira-code text-body-sm text-text-gold">
              {roomsCleared}/{totalRooms} {t('rooms_label')}
            </span>
          </div>

          {/* Tier badge */}
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: `${tierConfig.primary}20`,
              border: `1px solid ${tierConfig.primary}50`,
            }}
          >
            <Sparkles className="w-3 h-3" style={{ color: tierConfig.primary }} />
            <span
              className="font-cinzel text-caption font-semibold tracking-wider"
              style={{ color: tierConfig.primary }}
            >
              T{tierConfig.name.toUpperCase()}
            </span>
          </div>
        </motion.div>

        {/* Floor Progress Bar (vertical, right side) */}
        <motion.div
          className="absolute right-4 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center gap-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div
            className="relative overflow-hidden rounded-full"
            style={{ width: '8px', height: '200px', backgroundColor: '#1E1E2E' }}
          >
            <motion.div
              className="absolute bottom-0 left-0 right-0 rounded-full"
              style={{ backgroundColor: tierConfig.accent }}
              initial={{ height: 0 }}
              animate={{ height: `${floorProgress}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            />
            {/* Segment ticks */}
            {[25, 50, 75].map(pct => (
              <div
                key={pct}
                className="absolute left-0 right-0"
                style={{
                  bottom: `${pct}%`,
                  height: '1px',
                  backgroundColor: 'rgba(232,224,208,0.15)',
                }}
              />
            ))}
          </div>
          <span className="font-cinzel text-caption text-text-secondary">
            {Math.round(floorProgress)}%
          </span>
        </motion.div>

        {/* Main Dungeon Map Area */}
        <motion.div
          className="relative w-full max-w-[800px] max-h-[65vh] aspect-[4/3] mx-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        >
          {/* SVG Connection Lines */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 1 }}
          >
            {connectionLines.map((line, i) => (
              <motion.line
                key={line.id}
                x1={`${line.x1}%`}
                y1={`${line.y1}%`}
                x2={`${line.x2}%`}
                y2={`${line.y2}%`}
                stroke={line.cleared ? tierConfig.accent : line.active ? 'rgba(232,224,208,0.2)' : 'rgba(232,224,208,0.06)'}
                strokeWidth={line.cleared ? 2.5 : 1.5}
                strokeDasharray={line.cleared ? 'none' : '6,4'}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                  pathLength: { duration: 0.5, delay: 0.3 + i * 0.05 },
                  opacity: { duration: 0.3, delay: 0.3 + i * 0.05 },
                }}
                style={{
                  filter: line.cleared ? `drop-shadow(0 0 4px ${tierConfig.glow})` : 'none',
                }}
              />
            ))}
          </svg>

          {/* Room Nodes */}
          {dungeonRooms.map((room, index) => {
            const pos = nodePositions[index];
            if (!pos) return null;

            const roomConfig = ROOM_TYPE_MAP[room.type] || ROOM_TYPE_MAP.battle;
            const RoomIcon = roomConfig.icon;
            const locked = isRoomLocked(room.id, dungeonRooms, currentRoomId);
            const current = isCurrentRoom(room.id);
            const reachable = isRoomReachable(room.id, dungeonRooms, currentRoomId);
            const cleared = room.cleared;

            return (
              <motion.button
                key={room.id}
                className="absolute z-10 flex flex-col items-center justify-center cursor-pointer"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.08,
                  ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
                }}
                onClick={() => handleRoomClick(room.id)}
                whileHover={!locked && !cleared ? { scale: 1.15 } : {}}
                whileTap={!locked && !cleared ? { scale: 0.95 } : {}}
              >
                {/* Pulsing glow for current room */}
                {current && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      boxShadow: `0 0 20px ${tierConfig.glow}, 0 0 40px ${tierConfig.glow}`,
                    }}
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.6, 0.3, 0.6],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: [0.37, 0, 0.63, 1] as [number, number, number, number],
                    }}
                  />
                )}

                {/* Room node circle */}
                <div
                  className="relative flex items-center justify-center rounded-full transition-all duration-300"
                  style={{
                    width: current ? '72px' : '64px',
                    height: current ? '72px' : '64px',
                    backgroundColor: cleared
                      ? 'rgba(46,204,113,0.08)'
                      : locked
                        ? 'rgba(30,30,46,0.5)'
                        : roomConfig.bgColor,
                    border: cleared
                      ? '2px solid rgba(46,204,113,0.3)'
                      : locked
                        ? '2px dashed rgba(232,224,208,0.08)'
                        : current
                          ? `2px solid ${tierConfig.accent}`
                          : `2px solid ${roomConfig.borderColor}`,
                    boxShadow: current
                      ? `0 0 15px ${tierConfig.glow}`
                      : cleared
                        ? 'none'
                        : reachable && !locked
                          ? `0 0 8px ${roomConfig.glowColor}`
                          : 'none',
                    opacity: locked ? 0.4 : 1,
                    cursor: locked ? 'not-allowed' : 'pointer',
                  }}
                >
                  {/* Icon or checkmark */}
                  {cleared ? (
                    <Check className="w-6 h-6 text-accent-heal" />
                  ) : locked ? (
                    <Lock className="w-5 h-5 text-text-muted" />
                  ) : (
                    <RoomIcon
                      className="w-7 h-7"
                      style={{
                        color: current ? tierConfig.accent : roomConfig.color,
                      }}
                    />
                  )}
                </div>

                {/* Room label */}
                <span
                  className="mt-2 font-cinzel text-caption tracking-wider whitespace-nowrap"
                  style={{
                    color: cleared
                      ? 'rgba(46,204,113,0.6)'
                      : locked
                        ? '#5C5346'
                        : current
                          ? tierConfig.accent
                          : '#9B8B7A',
                    fontSize: '10px',
                  }}
                >
                  {room.name.toUpperCase()}
                </span>

                {/* Current position indicator */}
                {current && (
                  <motion.div
                    className="absolute -bottom-1 flex items-center gap-0.5"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <MapPin className="w-3 h-3" style={{ color: tierConfig.accent }} />
                    <span
                      className="font-fira-code text-[9px] tracking-wider"
                      style={{ color: tierConfig.accent }}
                    >
                      YOU
                    </span>
                  </motion.div>
                )}

                {/* Zoom animation when entering */}
                <AnimatePresence>
                  {zoomingRoom === room.id && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{
                        backgroundColor: tierConfig.primary,
                        zIndex: 100,
                      }}
                      initial={{ scale: 1, opacity: 0.8 }}
                      animate={{ scale: 50, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                    />
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Room Preview Panel */}
        <AnimatePresence>
          {selectedRoom && (
            <motion.div
              className="fixed inset-0 z-[250] flex items-center justify-center px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Backdrop */}
              <div
                className="absolute inset-0"
                style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
                onClick={() => setSelectedRoomId(null)}
              />

              <motion.div
                className="relative w-full max-w-full mx-4 rounded-radius-lg p-5"
                style={{
                  background: 'linear-gradient(180deg, rgba(20,20,30,0.98) 0%, rgba(10,10,15,0.99) 100%)',
                  border: '1px solid rgba(232,224,208,0.15)',
                }}
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
              >
                {/* Close button */}
                <button
                  onClick={() => setSelectedRoomId(null)}
                  className="absolute top-2 right-2 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Room type badge */}
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="px-2 py-0.5 rounded-full font-cinzel text-[10px] tracking-wider"
                    style={{
                      backgroundColor: selectedRoom.cleared
                        ? 'rgba(46,204,113,0.15)'
                        : ROOM_TYPE_MAP[selectedRoom.type]?.bgColor || 'rgba(20,20,30,0.9)',
                      color: selectedRoom.cleared
                        ? '#2ECC71'
                        : ROOM_TYPE_MAP[selectedRoom.type]?.color || '#9B8B7A',
                      border: `1px solid ${selectedRoom.cleared
                        ? 'rgba(46,204,113,0.3)'
                        : ROOM_TYPE_MAP[selectedRoom.type]?.borderColor || 'rgba(232,224,208,0.12)'}`,
                    }}
                  >
                    {selectedRoom.cleared ? 'CLEARED' : getRoomDisplayType(selectedRoom.type).toUpperCase()}
                  </span>
                  {isCurrentRoom(selectedRoom.id) && (
                    <span
                      className="px-2 py-0.5 rounded-full font-cinzel text-[10px] tracking-wider"
                      style={{
                        backgroundColor: `${tierConfig.primary}15`,
                        color: tierConfig.accent,
                        border: `1px solid ${tierConfig.primary}30`,
                      }}
                    >
                      CURRENT
                    </span>
                  )}
                </div>

                {/* Room name */}
                <h3 className="font-cinzel text-heading text-text-primary tracking-wider mb-1">
                  {selectedRoom.name}
                </h3>

                {/* Room description */}
                <p className="font-inter text-body-sm text-text-secondary mb-3">
                  {selectedRoom.type === 'battle' && 'A hostile creature lurks within. Speak words of power to defeat it.'}
                  {selectedRoom.type === 'boss' && 'A powerful boss awaits. Beware its devastating attacks!'}
                  {selectedRoom.type === 'altar' && 'An ancient altar hums with arcane energy. Words of knowledge resonate here.'}
                  {selectedRoom.type === 'treasure' && 'Glinting objects catch the torchlight. Something valuable lies within.'}
                  {selectedRoom.cleared && 'This room has been cleared. The way forward is open.'}
                </p>

                {/* Action buttons */}
                <div className="flex items-center gap-3">
                  {!selectedRoom.cleared &&
                    !isRoomLocked(selectedRoom.id, dungeonRooms, currentRoomId) && (
                    <motion.button
                      onClick={() => handleEnterRoom(selectedRoom.id)}
                      className="flex items-center gap-2 px-4 py-3 rounded-radius-md font-cinzel text-sm tracking-wider transition-all duration-200 cursor-pointer"
                      style={{
                        backgroundColor: tierConfig.primary,
                        color: '#0A0A0F',
                      }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Zap className="w-4 h-4" />
                      {t('enter_room_btn')}
                    </motion.button>
                  )}

                  {isRoomLocked(selectedRoom.id, dungeonRooms, currentRoomId) && (
                    <div className="flex items-center gap-2 text-text-muted">
                      <Lock className="w-4 h-4" />
                      <span className="font-inter text-body-sm">{t('room_locked')}</span>
                    </div>
                  )}

                  {selectedRoom.cleared && (
                    <div className="flex items-center gap-2 text-accent-heal">
                      <Check className="w-4 h-4" />
                      <span className="font-inter text-body-sm">{t('room_cleared')}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Action Bar */}
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-[100] flex items-center justify-between px-4"
          style={{
            height: '56px',
            backgroundColor: 'rgba(10,10,15,0.92)',
            borderTop: '1px solid rgba(232,224,208,0.08)',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <button
            onClick={() => setShowAbandonModal(true)}
            className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors duration-200 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-inter text-body-sm tracking-wide">{t('return_to_camp')}</span>
          </button>

          {/* Center run stats */}
          <div className="hidden sm:flex items-center gap-3 font-fira-code text-caption text-text-secondary">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Rooms: {roomsCleared}/{totalRooms}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              Words: {useGameStore.getState().vocabulary.length}
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Wear: {useGameStore.getState().vocabulary.reduce((s, w) => s + w.wear, 0)}
            </span>
          </div>

          {/* Right: HP indicator */}
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-accent-damage" />
            <span className="font-fira-code text-caption text-text-secondary">
              {useGameStore.getState().playerHp}/{useGameStore.getState().playerMaxHp}
            </span>
          </div>
        </motion.div>

        {/* Abandon Run Modal */}
        <AnimatePresence>
          {showAbandonModal && (
            <motion.div
              className="fixed inset-0 z-[300] flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Backdrop */}
              <div
                className="absolute inset-0"
                style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
                onClick={() => setShowAbandonModal(false)}
              />

              {/* Modal panel */}
              <motion.div
                className="relative z-10 w-full max-w-full mx-4 rounded-radius-lg p-6"
                style={{
                  backgroundColor: '#14141E',
                  border: '1px solid rgba(232,224,208,0.12)',
                }}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              >
                <h3 className="font-cinzel text-heading text-text-primary tracking-wider mb-2 text-center">
                  {t('abandon_confirm_title')}
                </h3>
                <p className="font-inter text-body-sm text-text-secondary text-center mb-6">
                  {t('abandon_confirm_desc')}
                </p>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setShowAbandonModal(false)}
                    className="px-4 py-3 rounded-radius-md font-cinzel text-sm tracking-wider transition-all duration-200 cursor-pointer"
                    style={{
                      border: '1px solid rgba(232,224,208,0.12)',
                      color: '#9B8B7A',
                      backgroundColor: 'transparent',
                    }}
                  >
                    {t('abandon_no')}
                  </button>
                  <button
                    onClick={handleAbandon}
                    className="px-4 py-3 rounded-radius-md font-cinzel text-sm tracking-wider transition-all duration-200 cursor-pointer"
                    style={{
                      backgroundColor: '#E74C3C',
                      color: '#FFFFFF',
                    }}
                  >
                    {t('abandon_yes')}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* In-Dungeon Altar Modal */}
        <AnimatePresence>
          {showAltarModal && (
            <motion.div
              className="fixed inset-0 z-[300] flex items-center justify-center px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Backdrop */}
              <div
                className="absolute inset-0"
                style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }}
                onClick={handleAltarComplete}
              />

              {/* Panel */}
              <motion.div
                className="relative z-10 w-full max-w-full mx-4 rounded-radius-lg p-6"
                style={{
                  backgroundColor: '#14141E',
                  border: '1px solid rgba(155,139,122,0.3)',
                }}
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              >
                {/* Header */}
                <div className="flex items-center justify-center mb-4">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: 'rgba(155,139,122,0.15)',
                      border: '2px solid rgba(155,139,122,0.4)',
                    }}
                  >
                    <Scroll className="w-7 h-7" style={{ color: '#9B8B7A' }} />
                  </div>
                </div>

                <h3 className="font-cinzel text-heading text-text-primary tracking-wider mb-2 text-center">
                  Word Altar
                </h3>
                <p className="font-inter text-body-sm text-text-secondary text-center mb-4">
                  Ancient words of power resonate through the altar. Its light heals your wounds and reveals hidden truths.
                </p>

                {/* Heal info */}
                <div
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-radius-md mb-4"
                  style={{
                    backgroundColor: 'rgba(46,204,113,0.08)',
                    border: '1px solid rgba(46,204,113,0.2)',
                  }}
                >
                  <Heart className="w-4 h-4 text-accent-heal" />
                  <span className="font-fira-code text-body-sm text-accent-heal">
                    +{15 + currentTier * 5} HP Restored
                  </span>
                </div>

                {/* Weakness hint */}
                {altarWeaknessHint && (
                  <div
                    className="py-3 px-4 rounded-radius-md mb-4"
                    style={{
                      backgroundColor: 'rgba(212,160,23,0.06)',
                      border: '1px solid rgba(212,160,23,0.2)',
                    }}
                  >
                    <p className="font-cinzel text-caption text-text-gold tracking-wider mb-1 text-center">
                      VISION REVEALED
                    </p>
                    <p className="font-inter text-body-sm text-text-secondary text-center">
                      A vision shows the weakness of{' '}
                      <span className="text-text-primary font-semibold">{altarWeaknessHint.name}</span>:
                    </p>
                    <p className="font-fira-code text-mono-md text-text-gold text-center mt-1 uppercase tracking-wider">
                      {altarWeaknessHint.weakness}
                    </p>
                  </div>
                )}

                {/* HP bar */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-fira-code text-caption text-text-secondary">HP</span>
                    <span className="font-fira-code text-caption text-text-primary">
                      {playerHp}/{playerMaxHp} → {Math.min(playerMaxHp, playerHp + 15 + currentTier * 5)}/{playerMaxHp}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#1E1E2E' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(playerHp / playerMaxHp) * 100}%`,
                        backgroundColor: '#E74C3C',
                      }}
                    />
                  </div>
                </div>

                {/* Action button */}
                <div className="flex justify-center">
                  <motion.button
                    onClick={handleAltarComplete}
                    className="px-4 py-3 rounded-radius-md font-cinzel text-sm tracking-wider cursor-pointer"
                    style={{
                      backgroundColor: '#9B8B7A',
                      color: '#0A0A0F',
                    }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Absorb Power
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
});

export default Dungeon;
