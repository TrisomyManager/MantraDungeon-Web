# 维度12：合规、数据隐私与上线策略

## 《真言地牢》(Dungeon of Lexicon) 全球发布法律合规与上线策略研究报告

**研究日期**: 2026年4月22日
**研究范围**: COPPA、GDPR、中国PIPL、内容分级、语音数据合规、平台审核、知识产权、全球同步上线

---

## 1. COPPA（美国儿童在线隐私保护法）对教育游戏的数据收集要求

### 1.1 核心要求概览

COPPA适用于面向13岁以下儿童或明知收集13岁以下儿童个人信息的网站和在线服务。2025年FTC发布了十余年来最大规模的COPPA规则修订，全面合规截止日期为**2026年4月22日**[^954^]。

**关键合规要求**:

| 要求项 | 具体内容 |
|--------|----------|
| 家长同意 | 收集儿童个人信息前须获得**可验证的家长同意** |
| 数据最小化 | 仅收集参与活动合理必要的信息 |
| 隐私政策 | 必须发布清晰、全面的隐私政策 |
| 数据安全 | 2025年新规要求建立**书面儿童个人信息安全计划**[^967^] |
| 第三方共享 | 2025年新规要求对第三方披露获得**单独的、肯定性的家长同意**[^966^] |
| 数据保留 | 禁止无限期保留，只能在合理必要期限内保留[^954^] |

### 1.2 2025年COPPA重大更新：语音与生物识别数据

**最关键的变化**：COPPA现在正式将生物识别标识符纳入"个人信息"的定义范围，包括：
- 语音印记(voiceprints)
- 面部模板和面部印记
- 指纹、掌纹
- 视网膜/虹膜模式
- 步态模式[^954^][^967^][^968^]

这意味着使用语音功能、面部识别或摄像头功能的儿童应用——包括《真言地牢》这类采集语音数据的教育游戏——现在直接落入COPPA的全面监管范围。

### 1.3 对教育游戏的具体影响

```
Claim: COPPA 2025年更新正式将语音数据纳入"个人信息"定义，要求可验证的家长同意
Source: Finnegan Law
URL: https://www.finnegan.com/en/insights/articles/the-ftcs-updated-coppa-rule-redefining-childrens-digital-privacy-protection.html
Date: 2025-07-25
Excerpt: "Enhanced Privacy Definitions: The amendments to COPPA now include biometric identifiers such as fingerprints, iris patterns, and voiceprints, alongside government-issued identifiers like passport numbers, as 'personal information.'"
Context: FTC对COPPA的十余年最大修订
Confidence: high
```

```
Claim: 向第三方共享儿童数据用于AI训练需要单独的家长同意
Source: Public Interest Privacy Center
URL: https://publicinterestprivacy.org/coppa-rule-training-algorithms/
Date: 2025-12-04
Excerpt: "Disclosures of a child's personal information to third parties...to train or otherwise develop artificial intelligence technologies, are not integral to the website or online service and would require consent."
Context: FTC明确排除AI训练作为"必要披露"
Confidence: high
```

**COPPA违规处罚**: 每次违规最高可达**$43,607-$51,744**[^766^][^895^]。

### 1.4 COPPA 2.0（2024年7月通过）

COPPA 2.0将保护范围从13岁以下扩展至**17岁以下青少年**，要求：
- 17岁以下用户的数据收集需要家长/本人同意[^768^]
- 包含"橡皮擦按钮"(Eraser Button)功能，允许删除数据
- 禁止针对儿童或青少年的营销定向数据收集

---

## 2. GDPR（欧盟通用数据保护条例）下的语音数据处理和存储要求

### 2.1 语音数据的法律分类

在GDPR下，用于识别个人身份的语音数据被归类为**Article 9"特殊类别个人数据"**(special category data)，与遗传数据、健康数据等享有同等最高级别的保护[^955^][^956^][^957^]。

**双重法律基础要求**：
1. **Article 6法律基础**：如合法利益、同意、合同履行等
2. **Article 9(2)特殊类别条件**：最常用的是**明确同意**(explicit consent)[^955^]

### 2.2 处理儿童语音数据的特殊要求

- GDPR Article 8规定，16岁以下（成员国可降至13岁）儿童的数据处理需要**家长或监护人的可验证同意**[^760^][^762^]
- 隐私政策必须以**儿童可理解的语言**撰写[^760^]
- 违反GDPR的儿童数据处理可面临高达**全球年营业额4%或2000万欧元**的罚款[^761^]

### 2.3 语音数据合规架构要求

| 合规要素 | 具体要求 |
|----------|----------|
| 明确同意 | 自由给予、具体、知情、不含糊的明确肯定行动[^955^] |
| DPIA | Article 35要求对大规模特殊类别数据处理进行数据保护影响评估 |
| 隐私设计 | Article 25要求从系统设计阶段嵌入隐私保护 |
| 数据处理协议 | 使用第三方语音处理服务须签署DPA (Article 28) |
| 跨境传输 | 向欧盟外传输语音数据需要SCC或其他合法机制 |
| 数据主体权利 | 30天内响应访问、更正、删除请求 |

```
Claim: GDPR将用于识别身份的语音数据归类为Article 9特殊类别数据，需要双重法律基础
Source: GDPRLocal
URL: https://gdprlocal.com/biometric-data-gdpr-compliance-made-simple/
Date: 2026-03-17
Excerpt: "GDPR classifies biometric data as a special category under Article 9 when it is processed for the purpose of uniquely identifying a natural person. This triggers stricter legal requirements that go beyond standard personal data obligations."
Context: 权威GDPR合规指南
Confidence: high
```

```
Claim: GDPR违规处理生物识别数据最高可罚4%全球营业额
Source: Vista Infosec
URL: https://vistainfosec.com/blog/gdpr-biometric-data-ethical-privacy/
Date: 2026-01-05
Excerpt: "GDPR fines for Article 9 violations aren't theoretical. Special category data breaches typically trigger the higher tier: up to 20 million euros or 4% of global annual turnover, whichever is greater."
Context: 信息安全与合规分析
Confidence: high
```

---

## 3. 中国《个人信息保护法》对教育类App的特殊要求

### 3.1 核心法律框架

中国PIPL（2021年生效）建立了与GDPR相似的个人信息保护体系，但对未成年人有特殊强化规定[^759^][^770^]：

| 要素 | PIPL要求 |
|------|----------|
| 敏感个人信息 | 14岁以下未成年人个人信息属于**敏感个人信息**，需增强保护[^759^] |
| 监护人同意 | 处理14岁以下儿童个人信息须获得**监护人明确同意** |
| 专项规则 | 须制定专门的儿童个人信息处理规则 |
| 年度审计 | 2025年12月新规要求每年1月底前提交未成年人PI合规审计报告[^770^] |

### 3.2 未成年人网络游戏防沉迷系统（对《真言地牢》的直接影响）

2021年8月，国家新闻出版署(NPPA)发布史上最严"防沉迷通知"，所有在线游戏必须遵守[^831^][^832^][^896^]：

**时间限制**:
- 未成年人仅可在**周五、周六、周日及法定节假日20:00-21:00**进行游戏
- 每周总计**最多3小时**
- 工作日完全禁止

**消费限制**:
| 年龄段 | 单次限额 | 月度限额 |
|--------|----------|----------|
| 8岁以下 | 禁止消费 | 禁止消费 |
| 8-16岁 | 50元 | 200元 |
| 16-18岁 | 100元 | 400元 |

**实名验证要求**:
- 所有在线游戏必须接入**NPPA防沉迷实名验证系统**
- 不得以任何形式（包括访客模式）向未完成实名注册的用户提供游戏服务[^832^][^896^]
- 必须使用真实有效身份信息注册

**CADPA年龄分级系统**:
- **8+（绿色标签）**: 最简单内容，最广泛受众
- **12+（蓝色标签）**: 中等复杂度内容
- **16+（黄色标签）**: 更复杂内容，含竞技要素[^896^]

```
Claim: 中国所有在线游戏必须接入NPPA实名验证系统，未成年人每周限玩3小时
Source: AppInChina
URL: https://appinchina.co/blog/the-complete-guide-to-chinas-age-verification-system/
Date: 2025-10-27
Excerpt: "All gaming platforms must integrate with the National Anti-Addiction Real-Name Verification System. Non-compliance results in immediate service suspension, license revocation, and significant fines."
Context: 中国游戏出海权威合规指南
Confidence: high
```

```
Claim: 2024年中国未成年人保护法修订强化了对网络游戏服务商的要求
Source: 36Kr/HKEX filings
URL: https://www1.hkexnews.hk/listedco/listconews/sehk/2025/0415/2025041501189.pdf
Date: 2025-04-15
Excerpt: "The Law of the PRC on the Protection of Minors...last amended on April 26, 2024, online game service providers are required to classify game products in accordance with relevant regulations and standards."
Context: 网易等游戏公司年报中披露的监管合规要求
Confidence: high
```

### 3.3 对教育游戏的影响评估

《真言地牢》若在中国上线，作为面向未成年人的教育游戏：
- 必须接入NPPA实名验证系统
- 必须实施严格的游戏时长限制
- 必须实施消费限制
- 需要考虑教育属性是否可获得特殊豁免（目前防沉迷政策对教育类游戏无明确豁免）
- **关键争议点**：教育游戏是否属于"网络游戏"范畴存在监管解释空间

---

## 4. 教育游戏的内容分级

### 4.1 各平台分级系统对比

| 分级系统 | 最低评级 | 教育游戏适用评级 | 关键标准 |
|----------|----------|------------------|----------|
| **ESRB** (北美) | E (Everyone) | **E** 或 **E10+** | 无暴力、无粗俗语言、无成人内容[^472^][^765^] |
| **PEGI** (欧洲) | PEGI 3 | **PEGI 3** | 适合所有年龄，无令人不安内容[^472^] |
| **App Store** | 4+ | **4+** | 无可反对内容，无暴力/恐怖/赌博[^463^][^396^] |
| **Google Play** | ESRB Everyone | **ESRB Everyone** | 通过IARC系统评级，内容描述符为"教育"[^765^] |

### 4.2 各平台分级差异的关键影响

**App Store特殊要求**：
- Kids Category仅适用于**11岁及以下**儿童专属设计的应用[^768^]
- 一旦选择Kids Category，后续更新也必须持续符合要求
- "For Kids"和"For Children"等术语仅限Kids Category使用[^396^]

**Google Play特殊要求**：
- 使用IARC（国际年龄评级联盟）系统，在不同地区显示对应评级[^472^]
- 面向儿童的应用必须加入"Designed for Families"计划或符合Families Policy[^849^][^850^]
- 需要教师审核计划(Teacher Approved)才能出现在Kids标签页

```
Claim: Apple App Store的Kids Category严格限制第三方分析和广告
Source: Apple Developer - App Review Guidelines
URL: https://developer.apple.com/app-store/review/guidelines/
Date: 2026年当前版本
Excerpt: "Apps in the Kids Category should not include third-party analytics or third-party advertising. This provides a safer experience for kids."
Context: Apple官方审核指南第1.3条
Confidence: high
```

```
Claim: Google Play将Designed for Families计划要求合并入Families Policy
Source: TechCrunch/Google
URL: https://techcrunch.com/2022/11/16/google-play-streamlines-policies-around-kids-apps-as-regulations-tighten/
Date: 2022-11-16
Excerpt: "The additional policy requirements for the Designed for Families program are being rolled into the Play Store's broader Families Policy."
Context: Google Play政策重大更新
Confidence: high
```

---

## 5. 语音数据本地存储 vs 云端处理的合规性对比

### 5.1 合规架构对比分析

| 合规维度 | 本地存储/端侧处理 | 云端处理 |
|----------|------------------|----------|
| **GDPR合规复杂度** | 低 - 无数据传输，无需DPA | 高 - 需DPA、SCC、DPIA |
| **跨境数据传输** | 无此问题 | 需 adequacy decision 或 SCC |
| **第三方处理器关系** | 无 | 需建立Article 28关系 |
| **COPPA家长同意** | 简化 - 数据不离开设备 | 完整同意流程必要 |
| **数据泄露风险** | 极低（仅限单设备） | 需72小时通报机制 |
| **数据主体权利响应** | 简单（本地删除即可） | 需协调云端删除流程 |
| **隐私设计(Art.25)** | 自然满足 | 需额外架构设计 |
| **技术实现复杂度** | 中 - 需模型压缩/量化 | 低 - 利用云端算力 |
| **功能丰富度** | 可能受限（设备算力） | 高 - 可利用云端AI能力 |

### 5.2 端侧处理的合规优势

端侧/本地语音处理在合规方面具有根本性优势[^773^][^995^][^998^]：

1. **架构级隐私保障**：数据从未离开设备，不是"信任承诺"而是"技术不可能"
2. **无需数据处理协议**：无第三方处理器关系，GDPR Article 28不适用
3. **无跨境传输合规负担**：数据不跨越司法管辖区
4. **COPPA合规简化**：家长对数据去向的担忧大幅降低
5. **删除权天然满足**：用户卸载应用即完全删除数据

```
Claim: 端侧AI语音处理从根本上消除了GDPR合规中的数据传输风险
Source: Weesper/Edge AI Analysis
URL: https://weesperneonflow.ai/en/blog/2025-10-17-edge-ai-local-processing-future-private-voice-dictation/
Date: 2025-10-17
Excerpt: "Edge AI offers architecture-based privacy: it's technically impossible for your voice data to reach external servers because the application never transmits it. This isn't a promise—it's a mathematical certainty verified through network monitoring."
Context: 端侧AI语音技术隐私分析
Confidence: high
```

```
Claim: 儿童语音数据唯一确保完全隐私的方案是不向云端传输任何个人语音数据
Source: Voicebot.ai
URL: https://voicebot.ai/2020/03/28/lets-talk-voice-tech-data-privacy-and-kids/
Date: 2020-03-28
Excerpt: "To ensure complete data privacy, the only solution is to transmit NO personal voice data to the cloud and perform all processing at the edge i.e. in an embedded, on-device manner."
Context: 儿童语音技术隐私深度分析
Confidence: high
```

### 5.3 《真言地牢》推荐架构

**强烈建议采用端侧语音处理架构**：
- 语音识别(ASR)完全在设备上运行（如使用Whisper.cpp等端侧模型）
- 发音评分/评估算法本地执行
- 仅将匿名化学习进度数据（非语音原始数据）同步至云端
- 若必须使用云端语音处理，须获得单独的明确同意并实施完整的GDPR/COPPA合规框架

---

## 6. App Store和Google Play对教育类应用的审核特殊要求

### 6.1 Apple App Store审核要求

**Kids Category（11岁及以下）**[^396^][^999^][^1000^]：

| 要求项 | 具体规定 |
|--------|----------|
| 第三方分析 | **禁止**（有限例外：不收集任何可识别信息） |
| 第三方广告 | **禁止**（有限例外：需人工审核广告创意） |
| 数据传输 | 不得向第三方发送PII或设备信息 |
| 外部链接 | 不得链接至应用外内容 |
| 应用内购 | 需设家长门保护 |
| 隐私政策 | **必须包含** |
| 家长同意 | 家长门不等于COPPA下的家长同意[^396^] |
| 教育声明 | 标注"教育"的应用须有证据支持教育声称[^764^] |

**2025年App Store年龄评级更新**[^463^]：
- **4+**: 无可反对内容（适合所有年龄）
- **9+**: 可能含轻微卡通暴力等
- **13+**: 可能含频繁/强烈的卡通或幻想暴力（原12+更新）
- **17+**: 含成人内容

《真言地牢》作为教育游戏应申请**4+**评级。

### 6.2 Google Play审核要求

**Families Policy要求**[^849^][^850^][^865^]：

| 要求项 | 具体规定 |
|--------|----------|
| 法律合规 | 须遵守COPPA、GDPR等所有适用儿童隐私法 |
| 内容评级 | 须为ESRB Everyone或Everyone 10+ |
| 精确位置 | **禁止**获取儿童精确位置数据 |
| 设备标识符 | **禁止**传输儿童设备标识符 |
| SDK限制 | 仅可使用 Families 认证广告网络和SDK |
| 广告要求 | 仅可使用Google Play认证的广告网络，广告内容须适龄 |
| 数据删除 | 2023年12月7日前须提供数据删除选项 |

**Teacher Approved计划**[^849^][^850^]：
- 由200+美国教师组成的专家小组审核
- 审核维度：适龄性、体验质量、教育价值、儿童喜爱度
- 通过审核的应用可在Play Store Kids标签页展示

```
Claim: Google Play将Designed for Families并入Families Policy，所有符合该政策的应用都有资格申请Teacher Approved
Source: Android Developers Blog
URL: https://android-developers.googleblog.com/2022/11/helping-kids-and-families-find-high-quality-apps-for-kids.html
Date: 2022-11-16
Excerpt: "We're excited to expand the program so that all apps that meet Play's Families Policy will be eligible to be reviewed and shown on the Kids tab."
Context: Google官方开发者博客
Confidence: high
```

### 6.3 教育声称的举证要求

Fairplay for Kids的研究强调[^764^]：
- 标为"教育"的应用必须有证据支持其教育声称
- 2020年对171款学龄前教育应用的研究发现，几乎无一真正符合儿童发展规律的教育设计
- Apple和Google都有责任确保标注为教育的应用真正具有教育价值

**对《真言地牢》的建议**：
- 准备教育效果研究或专家评估报告
- 考虑与教育学专家合作验证设计
- 在游戏描述中引用具体的学习目标和教育理论依据

---

## 7. Steam平台独立教育游戏的发布流程和审核标准

### 7.1 Steam发布流程

Steam采用"一次审核，随时更新"的模式[^767^][^770^]：

| 步骤 | 说明 | 时间线 |
|------|------|--------|
| 1. 创建商店页面 | 填写游戏信息、上传素材 | 开发者控制 |
| 2. 提交商店页面审核 | Valve审核团队审查 | **3-5个工作日** |
| 3. 提交构建版本审核 | 游戏二进制文件审核 | 在商店页面审核通过后 |
| 4. 定价配置 | 设置价格和区域 | 开发者控制 |
| 5. 标记为待审 | 两个核对清单都完成后提交 | - |
| 6. 正式发布 | 两个审核都通过后发布 | 开发者自行选择日期 |

**Steam审核重点**[^767^]：
- 商店页面只包含发布时可用的功能和内容
- Capsule图片须包含可读的产品标题或logo
- 截图只能包含实际游戏画面（不含概念艺术）
- 描述须详细且连贯
- 不得包含外部网站链接

### 7.2 Steam收入分成

Steam采用阶梯式收入分成[^854^][^857^][^859^]：

| 收入区间 | 开发者分成 | Steam分成 |
|----------|------------|-----------|
| 首$10M | 70% | 30% |
| $10M - $50M | 75% | 25% |
| $50M以上 | 80% | 20% |

**独立开发者注意事项**：
- 绝大多数独立游戏难以达到$10M门槛，实际按70/30分成
- 2018年此政策调整曾引发独立开发者强烈不满[^855^][^856^]
- Steam Keys可免费生成并在其他渠道销售（Valve不抽成）[^866^]

```
Claim: Steam采用阶梯式收入分成，$10M以上75/25，$50M以上80/20
Source: The Verge
URL: https://www.theverge.com/2018/11/30/18120577/valve-steam-game-marketplace-revenue-split-new-rules-competition
Date: 2018-11-30
Excerpt: "For all sales between $10 million and $50 million, the split goes to 25 percent. And for every sale after the initial $50 million, Steam will take just a 20 percent cut."
Context: Steam历史上最大财务政策调整
Confidence: high
```

### 7.3 教育游戏在Steam的特殊考量

- Steam没有专门的"教育游戏"审核类别
- 教育内容自动获得ESRB-equivalent的"Everyone"评级
- Steam社区功能（论坛、评论）对未成年人的保护需要开发者自行管理
- 建议在游戏描述中清楚标注适合年龄段和教育目标

---

## 8. 游戏内购和订阅在各平台的抽成比例和政策差异

### 8.1 各平台抽成对比（2024-2025）

| 平台 | 标准抽成 | 优惠方案 | 订阅抽成 | 开发者账户费用 |
|------|----------|----------|----------|----------------|
| **Apple App Store** | 30% | 小企业计划15%（<$1M/年） | 首年30%，第二年15% | $99/年 |
| **Google Play** | 前$1M 15%，之后30% | 自动适用 | 15%（从第一天起） | $25一次性 |
| **Steam** | 70/30 | >$10M: 75/25; >$50M: 80/20 | 不适用（PC买断制） | $100一次性 |

```
Claim: Google Play订阅从第一天起仅收取15%，远低于Apple首年30%
Source: RevenueCat
URL: https://www.revenuecat.com/blog/engineering/small-business-program/
Date: 2026-01-26
Excerpt: "For all auto-renewing subscriptions on Google Play, the service fee is 15% from day one. It doesn't matter if you're in the reduced fee program or not."
Context: 开发者平台费用分析权威来源
Confidence: high
```

```
Claim: Apple在欧盟因DMA合规已将标准抽成降至20%
Source: Adapty
URL: https://adapty.io/blog/alternative-payments-in-the-app-store/
Date: 2025-12-24
Excerpt: "Standard IAP in the EU now costs: 20% commission (reduced from 30%), 10% for Small Business Program members"
Context: 欧盟DMA合规影响下的App Store费用调整
Confidence: high
```

### 8.2 替代支付方式（2025年重大变化）

2025年因Epic v. Apple诉讼和欧盟DMA法规，Apple被迫在全球多个市场开放替代支付[^820^]：

| 地区 | 外部支付链接 | Apple外部销售佣金 |
|------|-------------|-------------------|
| **美国** | 允许 | 0%（暂时） |
| **欧盟** | 允许 | 12-20% |
| **韩国** | 允许 | 26% |
| **荷兰**（约会应用） | 允许 | 27% |
| **世界其他地区** | 不允许 | N/A |

**对《真言地牢》的策略建议**：
- 在美国和欧盟可考虑提供网页端订阅（绕过部分抽成）
- 但Apple要求IAP必须继续作为选项存在
- Google Play允许链接至外部支付，但24小时内完成交易收取"链接费"（订阅10%，其他数字商品20%）[^819^]

---

## 9. 面向未成年人的游戏时长限制政策

### 9.1 中国：全球最严格的未成年人游戏限制

| 政策维度 | 具体规定 |
|----------|----------|
| 可玩时间 | 周五、六、日及法定节假日 20:00-21:00 |
| 周总时长 | **3小时** |
| 实名验证 | 必须接入NPPA系统 |
| 消费限制 | 8-16岁月限200元，16-18岁月限400元 |
| 法律依据 | 《未成年人保护法》第75条（2024年4月修订）[^896^] |

**2024年成效**[^825^]：
- 每周游戏时间控制在3小时以内的未成年人比例达**75.1%**（增长37.2个百分点）
- "防沉迷"等关键词搜索量较政策首月下降**94-97%**
- 69.2%的超时未成年人使用家长身份信息绕过限制

### 9.2 全球趋势

中国引领全球未成年人游戏保护政策趋势[^825^]：

| 国家/地区 | 政策方向 | 状态 |
|-----------|----------|------|
| **澳大利亚** | 拟禁止16岁以下使用社交媒体 | 立法推进中 |
| **韩国** | 曾实施"灰姑娘法"（0-6时禁止游戏） | 已放宽 |
| **欧盟** | GDPR-Article 8儿童保护 | 已生效 |
| **英国** | 适龄设计规范(AADC) | 已生效 |

**对《真言地牢》的影响**：
- 作为一款**教育游戏**，可能需要评估是否被归类为"网络游戏"
- 若被归类为在线游戏，必须实施完整的防沉迷系统
- 教育属性可能在某些司法管辖区获得政策考量
- 建议在设计阶段就集成游戏时长管理功能

---

## 10. 知识产权：COCA词频数据、WordNet、GloVe词向量的许可协议

### 10.1 各数据源许可状况

| 数据源 | 许可类型 | 商业使用 | 关键限制 |
|--------|----------|----------|----------|
| **WordNet** (Princeton) | WordNet License | **允许** | 不得用Princeton名称做广告；保留版权声明[^918^] |
| **GloVe** (Stanford NLP) | Apache License 2.0 | **允许** | 需保留版权声明和免责声明[^927^] |
| **COCA词频数据** | 学术/商业许可 | 需购买许可 | 不得向许可协议外的组织分发；不得在网络上公开频率/排名数据[^830^][^46^] |

### 10.2 WordNet许可详情

WordNet采用Princeton University提供的开放许可[^918^]：

```
Permission to use, copy, modify and distribute this software and database 
and its documentation for any purpose and without fee or royalty is hereby 
granted, provided that you agree to comply with the following copyright 
notice and statements, including the disclaimer.
```

**关键条款**：
- 允许任何目的的使用、复制、修改和分发（包括商业用途）
- **禁止**在广告或宣传中使用Princeton University的名称
- 版权始终归Princeton University所有
- 按"原样"提供，无任何担保

```
Claim: WordNet允许在商业应用中使用，无需费用，但不得在广告中使用Princeton名称
Source: Princeton University
URL: https://wordnet.princeton.edu/license-and-commercial-use
Date: 当前版本
Excerpt: "Permission to use, copy, modify and distribute this software and database and its documentation for any purpose and without fee or royalty is hereby granted."
Context: WordNet官方网站许可页面
Confidence: high
```

### 10.3 GloVe许可详情

GloVe（Global Vectors for Word Representation）采用**Apache License 2.0**[^927^]：

- 允许商业使用
- 允许修改和分发
- 允许专利授权
- 需保留原始版权声明和许可文本
- 变更须注明

**注意**：GloVe学术论文本身（2014年前材料）采用CC BY-NC-SA 3.0，但软件和数据包采用Apache 2.0[^931^]。

```
Claim: GloVe软件和数据包采用Apache License 2.0，允许商业使用
Source: Stanford NLP GitHub
URL: https://github.com/stanfordnlp/glove
Date: 2015-09-01（持续更新）
Excerpt: "All work contained in this package is licensed under the Apache License, Version 2.0."
Context: Stanford NLP官方GitHub仓库
Confidence: high
```

### 10.4 COCA词频数据许可详情

COCA（Corpus of Contemporary American English）词频数据采用**分层许可**[^830^][^46^]：

| 数据量 | 学术许可 | 商业许可 |
|--------|----------|----------|
| 20,000词 | $60 | $120 |
| 60,000词 | $90 | $180 |

**关键使用限制**[^46^]：
- 不得向许可协议列出的组织之外分发大量全文数据（通常50,000词以上）
- 不得在互联网上公开频率、搭配、n-gram数据
- 派生数据不得包含原始频率数字或排名顺序
- 可使用频率"区间"（如1-1000词、1001-3000词等），但不应超过约20个区间
- 每个数据集有唯一"指纹"标记，用于追踪数据泄露

```
Claim: COCA词频数据许可禁止公开分发排名和原始频率数据
Source: University of Virginia Library
URL: http://library.virginia.edu/data/datasources/licensed/corpus-of-contemporary-american-english-coca
Date: 2023-03-24
Excerpt: "If portions of the derived data is made available to others, it cannot include substantial portions of the raw frequency of words or the rank order."
Context: 学术数据许可条款
Confidence: high
```

### 10.5 《真言地牢》知识产权合规建议

| 数据源 | 合规行动 | 优先级 |
|--------|----------|--------|
| WordNet | 保留版权声明；不在广告中使用Princeton名称 | 必须 |
| GloVe | 保留Apache 2.0许可文件；注明修改 | 必须 |
| COCA | 购买适当许可；设计频率区间而非原始排名显示 | 必须 |
| 综合 | 在游戏 credits 中列出来源和许可信息 | 建议 |

---

## 11. 全球同步上线的法律准备清单和时间线

### 11.1 推荐准备时间线（距离上线日）

| 阶段 | 时间 | 关键任务 |
|------|------|----------|
| **Phase 1: 法律架构设计** | D-180至D-120 | 确定目标市场清单；聘请各地隐私法律顾问；设计数据架构（本地vs云端） |
| **Phase 2: 隐私合规实施** | D-120至D-90 | 完成隐私政策（多语言）；实施COPPA/GDPR/PIPL合规机制；集成年龄验证系统 |
| **Phase 3: 平台准备** | D-90至D-60 | 完成所有平台开发者账户注册；准备商店素材和年龄评级问卷；提交预审（如可用） |
| **Phase 4: 测试与审核** | D-60至D-30 | 进行隐私合规测试；提交各平台审核；准备实名验证系统对接（中国） |
| **Phase 5: 预发布** | D-30至D-7 | 完成审核修改；配置定价和IAP；准备上线营销材料 |
| **Phase 6: 发布** | D-Day | 各平台同步上线；监控合规指标；准备用户支持 |

### 11.2 按市场法律准备清单

#### 美国 (COPPA合规)
- [ ] 实施可验证家长同意机制
- [ ] 完成COPPA合规隐私政策
- [ ] 建立数据保留和删除政策
- [ ] 禁止向第三方共享儿童数据用于AI训练（除非获单独同意）
- [ ] 建立书面儿童个人信息安全计划
- [ ] 测试语音数据的本地处理架构
- [ ] 准备家长联系和数据查看/删除流程

#### 欧盟/英国 (GDPR/UK GDPR合规)
- [ ] 确定数据处理法律基础（Article 6 + Article 9）
- [ ] 准备明确同意机制（语音数据作为特殊类别）
- [ ] 完成DPIA（数据保护影响评估）
- [ ] 指定欧盟代表（如非欧盟公司）
- [ ] 准备DPA（如使用第三方处理器）
- [ ] 建立SCC（如数据传输出欧盟）
- [ ] 确保隐私政策以儿童可理解语言提供

#### 中国 (PIPL + 防沉迷合规)
- [ ] 接入NPPA实名验证和防沉迷系统
- [ ] 实施未成年人游戏时长限制（周五六日20:00-21:00）
- [ ] 实施消费限制（按年龄段）
- [ ] 完成14岁以下监护人同意机制
- [ ] 准备年度合规审计框架
- [ ] 考虑数据本地化存储要求
- [ ] 获得游戏出版/运营许可（版号）

#### 全球通用
- [ ] 完成内容分级申请（ESRB/PEGI/IARC/App Store/Google Play）
- [ ] 准备知识产权声明（WordNet/GloVe/COCA）
- [ ] 建立数据泄露响应计划
- [ ] 配置用户数据导出和删除功能
- [ ] 建立多语言客户支持（含隐私相关咨询）

### 11.3 关键风险与缓解策略

| 风险 | 概率 | 影响 | 缓解策略 |
|------|------|------|----------|
| COPPA生物识别新规合规不足 | 中 | 极高 | 采用端侧语音处理；聘请儿童隐私法律顾问 |
| 中国版号审批延迟 | 高 | 高 | 提前6-12个月申请；考虑先上其他市场 |
| GDPR数据主体权利响应延迟 | 中 | 中 | 自动化数据管理工具；30天内响应SLA |
| 各平台审核被拒 | 中 | 高 | 预留充足审核时间；遵循各平台指南精确 |
| 第三方SDK不合规 | 中 | 高 | 仅使用Families/Kids Category认证SDK |
| COCA数据许可违规 | 低 | 中 | 购买适当许可；使用频率区间而非原始排名 |

---

## 12. 关键争议与反面论点

### 12.1 端侧处理的局限性

虽然端侧语音处理在隐私合规上具有显著优势，但也存在挑战：
- **模型大小限制**：端侧ASR模型（如Whisper Tiny/Base）准确率可能低于云端模型
- **设备算力差异**：低端设备可能无法流畅运行语音AI
- **更新延迟**：模型更新需要应用更新，无法实时迭代
- **多语言支持**：端侧模型可能无法覆盖所有目标语言

**平衡策略**：核心语音评估在端侧执行，可选的云端高级功能仅在获得明确同意后启用。

### 12.2 中国防沉迷对教育游戏的适用性

**争议点**：教育游戏是否属于"网络游戏"范畴？
- 中国法律未对教育类游戏提供明确豁免
- 实践中，部分教育类应用可能因"非纯娱乐"属性获得更灵活的监管处理
- **建议**：在申请版号时明确标注教育属性，争取监管部门的理解

### 12.3 COPPA与用户体验的张力

- 可验证家长同意流程可能导致高用户流失率
- 严格的第三方分析禁止使游戏优化困难
- **建议**：设计无缝的家长同意流程；使用第一方分析工具（Apple的App Analytics等）

---

## 13. 综合建议与行动优先级

### 最高优先级（上线前必须完成）

1. **采用端侧语音处理架构** - 从根本上简化全球隐私合规
2. **完成COPPA 2025合规** - 特别是生物识别数据相关的新要求（截止日期2026年4月22日）
3. **准备GDPR Article 9合规** - 语音数据作为特殊类别的双重法律基础
4. **中国版号申请** - 如目标包含中国市场，需提前6-12个月启动
5. **购买COCA数据商业许可** - 确保词频数据的合法使用

### 高优先级（上线后30天内完成）

6. 集成中国NPPA防沉迷系统
7. 完成各平台Kids/Families分类申请
8. 建立全球数据主体权利响应流程
9. 实施数据保留自动删除机制

### 中优先级（持续优化）

10. 考虑欧盟DMA合规下的替代支付选项
11. 建立年度PIPL未成年人合规审计流程
12. 准备教育效果评估报告（支撑"教育"声称）

---

## 参考来源汇总

| 来源 | URL | 日期 |
|------|-----|------|
| FTC COPPA 2025 Final Rule | https://www.ftc.gov (via citations) | 2025-04-22 |
| Apple App Review Guidelines | https://developer.apple.com/app-store/review/guidelines/ | 2026-current |
| Google Play Families Policy | https://play.google.com/developer-content-policy/ | 2026-current |
| Steam Review Process | https://partner.steamgames.com/doc/store/review_process | current |
| Princeton WordNet License | https://wordnet.princeton.edu/license-and-commercial-use | current |
| Stanford GloVe GitHub | https://github.com/stanfordnlp/glove | 2015-2024 |
| COCA Word Frequency Info | https://www.wordfrequency.info/ | current |
| Finnegan FTC COPPA Analysis | https://www.finnegan.com/en/insights/articles/the-ftcs-updated-coppa-rule-redefining-childrens-digital-privacy-protection.html | 2025-07-25 |
| China Age Verification Guide | https://appinchina.co/blog/the-complete-guide-to-chinas-age-verification-system/ | 2025-10-27 |
| Google Play Teacher Approved | https://android-developers.googleblog.com/2022/11/helping-kids-and-families-find-high-quality-apps-for-kids.html | 2022-11-16 |
| App Store Payment Changes | https://adapty.io/blog/alternative-payments-in-the-app-store/ | 2025-12-24 |
| RevenueCat Platform Pricing | https://www.revenuecat.com/blog/engineering/small-business-program/ | 2026-01-26 |
| Edge AI Privacy Analysis | https://weesperneonflow.ai/en/blog/2025-10-17-edge-ai-local-processing-future-private-voice-dictation/ | 2025-10-17 |
| Public Interest Privacy Center | https://publicinterestprivacy.org/coppa-rule-training-algorithms/ | 2025-12-04 |
| COPPA 2026 Compliance Guide | https://www.gblock.app/articles/coppa-updated-rule-april-2026-children-privacy | 2026-04-18 |

---

*本报告基于截至2026年4月22日的公开信息编制。法律法规持续演变，建议在具体实施前咨询目标市场的合格法律顾问。*
