import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import Camp from './pages/Camp'
import Dungeon from './pages/Dungeon'
import Battle from './pages/Battle'
import Altar from './pages/Altar'
import Bestiary from './pages/Bestiary'
import GameOver from './pages/GameOver'

export default function App() {
  return (
    <div className="mobile-container">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/camp" element={<Camp />} />
        <Route path="/dungeon" element={<Dungeon />} />
        <Route path="/battle/:roomId" element={<Battle />} />
        <Route path="/altar" element={<Altar />} />
        <Route path="/bestiary" element={<Bestiary />} />
        <Route path="/gameover" element={<GameOver />} />
      </Routes>
    </div>
  )
}
