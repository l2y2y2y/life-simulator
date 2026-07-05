# 人生模拟器 UI 设计规范文档 v2.0

> 本文档为"人生模拟器"H5 游戏的完整 UI 设计规范，旨在为另一个 AI Agent 提供所有必要信息以独立进行前端 UI 优化。文档涵盖设计系统、页面结构、动画、事件绑定、数据模型、已知问题及优化建议。

---

## 1. 项目概述

### 1.1 技术栈
- **前端框架**: 无框架（Vanilla JS），纯原生 JavaScript + CSS
- **设计系统**: CSS Custom Properties (`:root` 变量) 主题系统
- **页面切换**: SPA 单页应用，通过 `.page` / `.page.active` 类名切换实现
- **字体**: Google Fonts（Noto Sans SC、Noto Serif SC），备用镜像 fonts.loli.net
- **无构建工具**: 直接引用 `.css` 和 `.js` 文件，无需编译打包

### 1.2 部署地址
- **线上地址**: https://l2y2y2y.github.io/life-simulator/
- **平台**: GitHub Pages 静态部署

### 1.3 项目目录结构

```
life-simulator/
├── index.html                        # 主入口 HTML（272行）
├── css/
│   └── style.css                      # 全部样式 + 设计系统 + 响应式（1949行）
├── js/
│   ├── app.js                         # 主应用逻辑 + UI控制（1110行）
│   ├── core/
│   │   ├── GameManager.js             # 游戏主管理器（~565行）
│   │   ├── EventEngine.js             # 事件引擎（~1486行）
│   │   ├── AttributeSystem.js         # 属性系统（~280行）
│   │   ├── ScoringSystem.js           # 评分系统（~417行）
│   │   └── ShareCardGenerator.js      # Canvas分享卡片生成器（244行）
│   └── data/
│       ├── talents.js                 # 天赋数据 + 品质配置（~234行）
│       ├── events.js                  # 1486个游戏事件数据
│       └── achievements.js            # 成就数据配置（194行）
├── UI-Design-Spec.md                  # 旧版UI设计文档
├── UI设计方案.md                       # 旧版UI方案文档
└── UI-Design-Spec-v2.md               # 本文档
```

### 1.4 脚本加载顺序
```html
<script src="js/data/talents.js"></script>
<script src="js/data/events.js"></script>
<script src="js/data/achievements.js"></script>
<script src="js/core/AttributeSystem.js"></script>
<script src="js/core/EventEngine.js"></script>
<script src="js/core/ScoringSystem.js"></script>
<script src="js/core/GameManager.js"></script>
<script src="js/core/ShareCardGenerator.js"></script>
<script src="js/app.js"></script>
```

### 1.5 已完成的迭代历史
1. **v1.0**: 初始版本，基础游戏功能
2. **v1.5**: UI 重新设计为"墨夜金"(Ink-Night-Gold) 高级暗色主题
3. **v2.0**: 手机端适配（可折叠侧边栏、横向滚动天赋选择、折叠历史记录等）

---

## 2. CSS 设计系统

### 2.1 设计令牌 (Design Tokens)

所有设计令牌定义在 `:root` 中，位于 `css/style.css` 第 7-71 行。

#### 2.1.1 背景层级（3级）
```css
--bg-base:      #0d0d12;    /* 最深层背景（页面底色） */
--bg-surface:   #16161e;    /* 卡片/面板表面 */
--bg-elevated:  #1e1e2a;    /* 浮起元素/按钮背景 */
```

#### 2.1.2 品牌强调色
```css
--accent-gold:       #c8a35f;               /* 主品牌金色 */
--accent-gold-dim:   rgba(200, 163, 95, 0.15);  /* 低透明度金色（hover背景） */
--accent-gold-glow:   rgba(200, 163, 95, 0.3);   /* 金色发光效果 */
```

#### 2.1.3 语义色彩
```css
--color-positive: #5cb589;    /* 正面/成功/绿色 — 快乐条 */
--color-negative: #c75c5c;    /* 负面/失败/红色 — 死亡、危险 */
--color-neutral:  #7a8899;    /* 中性/灰色 — 普通品质 */
--color-info:     #6b8fb5;    /* 信息/蓝色 — 稀有品质、健康条 */
--color-warning:  #c4a35a;    /* 警告/黄色 — 压力条 */
--color-special:  #9b7ec8;    /* 特殊/紫色 — 史诗品质 */
```

#### 2.1.4 文字层级（4级）
```css
--text-primary:   #e8e4dc;    /* 主文字（标题、正文） */
--text-secondary: #9a9590;    /* 次文字（描述、副标题） */
--text-tertiary:  #5e5a55;    /* 三级文字（标签、辅助） */
--text-accent:    #c8a35f;    /* 强调文字（金色，等同 accent-gold） */
```

#### 2.1.5 边框
```css
--border-subtle:  rgba(200, 163, 95, 0.08);   /* 微弱边框 */
--border-default: rgba(200, 163, 95, 0.15);    /* 默认边框 */
--border-strong:  rgba(200, 163, 95, 0.3);     /* 强边框 */
```

#### 2.1.6 阴影
```css
--shadow-sm:    0 2px 8px rgba(0, 0, 0, 0.3);     /* 小阴影 */
--shadow-md:    0 4px 16px rgba(0, 0, 0, 0.4);    /* 中阴影（卡片默认） */
--shadow-lg:    0 8px 32px rgba(0, 0, 0, 0.5);     /* 大阴影 */
--shadow-gold:  0 0 20px rgba(200, 163, 95, 0.15); /* 金色发光阴影 */
```

#### 2.1.7 圆角
```css
--radius-sm:  6px;    /* 小圆角（标签、小元素） */
--radius-md:  10px;   /* 中圆角（卡片次级、按钮） */
--radius-lg:  16px;   /* 大圆角（主卡片、面板） */
--radius-xl:  24px;   /* 超大圆角（主按钮、胶囊） */
```

#### 2.1.8 字体
```css
--font-display: 'Noto Serif SC', 'Source Han Serif CN', 'STSong', serif;    /* 展示字体（标题） */
--font-body:    'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif; /* 正文字体 */
--font-mono:    'JetBrains Mono', 'Fira Code', monospace;                     /* 等宽字体（数字） */
```

#### 2.1.9 兼容旧变量映射
以下变量为旧代码兼容保留，映射到新设计系统：
```css
--primary-color:   #c75c5c;              /* → color-negative */
--secondary-color: #5cb589;             /* → color-positive */
--accent-color:    #c8a35f;              /* → accent-gold */
--dark-color:      #0d0d12;              /* → bg-base */
--light-color:     #e8e4dc;              /* → text-primary */
--success-color:   #5cb589;              /* → color-positive */
--warning-color:   #c4a35a;              /* → color-warning */
--danger-color:    #c75c5c;              /* → color-negative */
--bg-color:        #0d0d12;              /* → bg-base */
--card-bg:         #16161e;              /* → bg-surface */
--text-color:      #e8e4dc;              /* → text-primary */
--text-muted:      #9a9590;              /* → text-secondary */
--border-color:    rgba(200,163,95,0.15); /* → border-default */
--font-family:     'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif; /* → font-body */
--border-radius:   10px;                 /* → radius-md */
--shadow:          0 4px 16px rgba(0,0,0,0.4); /* → shadow-md */
```

### 2.2 按钮系统

所有按钮共享 `.btn` 基类，位于 `css/style.css` 第 166-270 行。

#### 2.2.1 基类 `.btn`
```css
.btn {
  display: inline-block;
  padding: 12px 28px;
  border: none;
  border-radius: var(--radius-xl);  /* 24px */
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
  text-decoration: none;
  line-height: 1.4;
  min-height: 44px;                    /* 触控友好 */
}
```

#### 2.2.2 `.btn-primary` — 主要按钮
```css
.btn-primary {
  background: linear-gradient(135deg, #c8a35f, #a8854a);  /* 金色渐变 */
  color: #0d0d12;                      /* 深色文字 */
  box-shadow: var(--shadow-gold);
}
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 0 30px rgba(200, 163, 95, 0.3);
}
.btn-primary:active {
  transform: translateY(0);
}
```

#### 2.2.3 `.btn-secondary` — 次要按钮
```css
.btn-secondary {
  background: transparent;
  border: 1px solid var(--border-strong);
  color: var(--accent-gold);
  border-radius: var(--radius-lg);    /* 16px，比 primary 略小 */
  box-shadow: none;
}
.btn-secondary:hover {
  background: var(--accent-gold-dim);
  box-shadow: var(--shadow-gold);
  transform: translateY(-1px);
}
```

#### 2.2.4 `.btn-text` — 文本按钮
```css
.btn-text {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  border-radius: var(--radius-sm);    /* 6px */
  padding: 8px 16px;
  box-shadow: none;
  position: relative;
  min-height: 44px;
}
/* 下划线 hover 效果（通过 ::after 伪元素实现） */
.btn-text::after {
  content: '';
  position: absolute;
  bottom: 4px;
  left: 16px;
  right: 16px;
  height: 1px;
  background: transparent;
  transition: background 0.3s ease;
}
.btn-text:hover {
  color: var(--text-accent);
}
.btn-text:hover::after {
  background: var(--text-accent);
}
```

#### 2.2.5 `.btn-icon` — 图标按钮
```css
.btn-icon {
  width: 44px;
  height: 44px;
  padding: 0;
  border: none;
  border-radius: 50%;                   /* 圆形 */
  background: var(--bg-elevated);
  color: var(--text-secondary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
  box-shadow: none;
  letter-spacing: 0;
}
```

#### 2.2.6 `.control-btn` — 控制按钮（游戏页暂停/跳过）
```css
.control-btn {
  padding: 8px 16px;
  font-size: 13px;
  min-height: 44px;
}
```
> 继承 `.btn-secondary` 的样式

#### 2.2.7 `.attr-btn` — 属性增减按钮
```css
.attr-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;                   /* 圆形 */
  border: 1px solid var(--border-default);
  background: transparent;
  color: var(--text-secondary);
  font-size: 20px;                     /* +/- 字号 */
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.attr-btn:hover {
  background: var(--accent-gold-dim);
  border-color: var(--accent-gold);
  color: var(--accent-gold);
}
.attr-btn:disabled {
  opacity: 0.2;
  cursor: not-allowed;
}
```

#### 2.2.8 `.speed-btn` — 速度控制按钮
```css
.speed-btn {
  padding: 6px 10px;
  font-size: 12px;
  background: transparent;
  color: var(--text-tertiary);
  border: none;
  cursor: pointer;
  font-family: var(--font-body);
  transition: all 0.2s;
}
.speed-btn.active {
  background: var(--accent-gold);
  color: var(--bg-base);
  font-weight: 700;
}
```

#### 2.2.9 禁用状态
```css
.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}
```

### 2.3 卡片系统

位于 `css/style.css` 第 272-314 行。

#### 2.3.1 `.card` — 主卡片
```css
.card {
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);     /* 16px */
  padding: 24px;
  margin-bottom: 16px;
  box-shadow: var(--shadow-md);
}
```

#### 2.3.2 `.card-secondary` — 次级卡片
```css
.card-secondary {
  background: rgba(22, 22, 30, 0.6);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);     /* 10px */
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: var(--shadow-sm);
}
```

#### 2.3.3 `.card-tertiary` — 三级卡片
```css
.card-tertiary {
  background: rgba(22, 22, 30, 0.3);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);     /* 6px */
  padding: 12px;
  margin-bottom: 12px;
  box-shadow: none;                     /* 无阴影 */
}
```

#### 2.3.4 `.card-title` — 卡片标题
```css
.card-title {
  font-family: var(--font-display);     /* Noto Serif SC */
  font-size: 20px;
  font-weight: 700;
  color: var(--text-accent);            /* 金色 */
  margin-bottom: 16px;
  letter-spacing: 0.04em;
}
```

#### 2.3.5 `.card-subtitle` — 卡片副标题
```css
.card-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: -12px;
  margin-bottom: 16px;
}
```

### 2.4 品质系统 (Talent Quality)

位于 `css/style.css` 第 316-340 行。用于天赋卡片的品质标识，通过左侧彩色边框区分。

#### 2.4.1 `.quality-common` — 普通（灰色）
```css
.quality-common {
  border-left: 3px solid rgba(122, 136, 153, 0.5);
  background: rgba(122, 136, 153, 0.05);
  color: var(--color-neutral);         /* #7a8899 */
}
```

#### 2.4.2 `.quality-rare` — 稀有（蓝色）
```css
.quality-rare {
  border-left: 3px solid rgba(107, 143, 181, 0.5);
  background: rgba(107, 143, 181, 0.05);
  color: var(--color-info);             /* #6b8fb5 */
}
```

#### 2.4.3 `.quality-epic` — 史诗（紫色）
```css
.quality-epic {
  border-left: 3px solid rgba(155, 126, 200, 0.5);
  background: rgba(155, 126, 200, 0.05);
  color: var(--color-special);         /* #9b7ec8 */
}
```

#### 2.4.4 `.quality-legendary` — 传说（金色）
```css
.quality-legendary {
  border-left: 3px solid rgba(200, 163, 95, 0.6);
  background: rgba(200, 163, 95, 0.08);
  color: var(--accent-gold);           /* #c8a35f */
  box-shadow: 0 0 12px rgba(200, 163, 95, 0.1);  /* 金色发光 */
}
```

### 2.5 字体层级

位于 `css/style.css` 第 100-108 行。

| 类名 | 字号 | 用途 |
|------|------|------|
| `.text-xs` | 12px | 辅助文字、标签 |
| `.text-sm` | 14px | 正文描述、副标题 |
| `.text-base` | 16px | 标准正文 |
| `.text-md` | 20px | 小标题 |
| `.text-lg` | 24px | 区域标题 |
| `.text-xl` | 32px | 页面标题 |
| `.text-2xl` | 48px | 大标题（首页标题、评分） |
| `.text-hero` | 64px | 超大标题（重生年龄，移动端降为48px） |

### 2.6 进度条系统

```css
.progress-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 2px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 2.7 全局滚动条

```css
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--bg-base); }
::-webkit-scrollbar-thumb { background: var(--border-default); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--accent-gold); }
```

### 2.8 容器

```css
.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
  padding-left: max(24px, env(safe-area-inset-left));
  padding-right: max(24px, env(safe-area-inset-right));
}
```

---

## 3. 页面 DOM 结构

### 3.1 首页 (`homePage`)

**ID**: `homePage` | **类**: `.page.home-page.active`（默认显示）

```html
<div class="page home-page active" id="homePage">
  <div class="home-divider"></div>               <!-- 40px金色分隔线 -->
  <h1 class="game-title">人生模拟器</h1>        <!-- 48px display字体 -->
  <p class="game-subtitle letter-wide">重开你的人生，体验无限可能</p>

  <div class="card-tertiary statistics-bar">    <!-- 统计数据栏 -->
    <div class="stat-item">
      <div class="stat-value" id="statLifeCount">0</div>
      <div class="stat-label">已重开次数</div>
    </div>
    <div class="stat-item">
      <div class="stat-value" id="statHighScore">0</div>
      <div class="stat-label">最高评分</div>
    </div>
    <div class="stat-item">
      <div class="stat-value" id="statAchievements">0</div>
      <div class="stat-label">解锁成就</div>
    </div>
  </div>

  <div class="fate-coin-bar">
    <span class="coin-icon">G</span> 命运币：<span id="statFateCoins">0</span>
  </div>

  <button class="btn btn-primary start-btn" id="startBtn">开始新人生</button>
  <button class="btn btn-text" id="achievementBtn">查看成就</button>

  <div class="card-tertiary daily-goals-card">  <!-- 每日目标 -->
    <h3 class="card-title">每日目标</h3>
    <div id="dailyGoalsContainer"></div>        <!-- 动态渲染 -->
  </div>
</div>
```

**关键样式**:
- `.home-page`: `text-align: center; padding-top: 60px;`
- `.home-divider`: 40x1px 金色渐变线
- `.game-title`: `font-display, 48px, 700, color text-accent, letter-spacing 0.1em`
- `.statistics-bar`: `flex, justify-content center, gap 24px, flex-wrap wrap`
- `.stat-value`: `font-mono, 28px, 700, color accent-gold`
- `.fate-coin-bar`: `flex, center, gap 6px`
- `.coin-icon`: 20x20px 圆形，金色渐变背景，11px 字号
- `.daily-goals-card`: 左对齐，`card-title` 字号 12px

---

### 3.2 开场过渡页 (`rebirthPage`)

**ID**: `rebirthPage` | **类**: `.page.rebirth-page`

```html
<div class="page rebirth-page" id="rebirthPage">
  <div class="rebirth-overlay"></div>           <!-- 呼吸光效背景 -->
  <div class="rebirth-content">                <!-- 淡入内容 -->
    <div class="rebirth-age" id="rebirthAge"></div>      <!-- 64px mono -->
    <div class="rebirth-death" id="rebirthDeath"></div>   <!-- 红色，18px display -->
    <div class="rebirth-regret" id="rebirthRegret"></div> <!-- 14px, max-width 300px -->
    <div class="rebirth-question">你想重来一次吗？</div> <!-- 20px display, 慢闪 -->
    <div class="rebirth-buttons">
      <button class="btn btn-primary rebirth-btn" id="rebirthBtn">不甘重来</button>
    </div>
  </div>
</div>
```

**关键样式**:
- `.rebirth-page`: `position: fixed; top/left/right/bottom: 0; z-index: 100; background: bg-base;`
- `.rebirth-overlay`: `position: absolute; inset: 0; radial-gradient(ellipse, gold 0.03, transparent 70%); animation: rebirthBreathing 8s infinite;`
- `.rebirth-content`: `position: relative; text-align: center; z-index: 1; animation: rebirthFadeIn 2s;`
- `.rebirth-age`: `font-mono, 64px, 700, color text-tertiary`（移动端降为48px）
- `.rebirth-death`: `font-display, 18px, color color-negative`
- `.rebirth-question`: `font-display, 20px, color text-secondary, animation: rebirthSlowFade 4s infinite;`
- `.rebirth-btn`: `16px, padding 14px 40px, transparent bg, gold border, radius-lg`
- `.rebirth-page.active`: `display: flex !important;`（覆盖默认 `display: none`）

---

### 3.3 天赋选择页 (`talentPage`)

**ID**: `talentPage` | **类**: `.page.talent-page`

```html
<div class="page talent-page" id="talentPage">
  <div class="card">
    <div class="talent-page-header">           <!-- flex row -->
      <div>
        <h2 class="card-title">命运之手</h2>
        <p class="card-subtitle">选择三个天赋开启你的人生</p>
      </div>
      <div class="talent-counter-badge">
        <span id="talentCount">0</span> / 3   <!-- 注意：页面中有两个 id="talentCount" -->
      </div>
    </div>
    <div class="talent-counter">已选择：<span id="talentCount">0</span> / 3</div>
    <div class="talent-grid" id="talentGrid"></div>  <!-- 动态渲染 -->
    <button class="btn btn-secondary" id="refreshTalentsBtn">刷新天赋</button>
  </div>
  <button class="btn btn-primary" id="confirmTalentsBtn" disabled>确认选择</button>
  <button class="btn btn-text" id="backFromTalentBtn">返回</button>
</div>
```

**关键样式**:
- `.talent-page-header`: `flex, space-between, margin-bottom 16px`
- `.talent-counter-badge`: `inline-flex, gold-dim bg, border-default, radius-xl, 13px mono, white-space nowrap`
- `.talent-grid`（桌面）: `grid, auto-fill, minmax(280px, 1fr), gap 12px`
- `.talent-grid`（移动 <=768px）: `flex, overflow-x auto, scroll-snap-type x mandatory`
- `.talent-card`: `bg-surface, border-subtle, radius-md, padding 16px, cursor pointer`
- `.talent-card.selected`: `border-color accent-gold, shadow-gold, bg-elevated`
- `.talent-card.disabled`: `opacity 0.25, cursor not-allowed, pointer-events none`
- `.talent-card`（移动端）: `min-width 260px, scroll-snap-align start, .talent-desc hidden`
- 天赋卡片内结构: `.talent-quality`(品质标签) + `.talent-name`(名称) + `.talent-desc`(描述) + `.talent-effects`(效果)

---

### 3.4 属性分配页 (`attributePage`)

**ID**: `attributePage` | **类**: `.page.attribute-page`

```html
<div class="page attribute-page" id="attributePage">
  <div class="card">
    <div class="points-ring"></div>             <!-- 80px 装饰圆环 -->
    <h2 class="card-title">初始属性</h2>
    <p class="card-subtitle">塑造你的起点</p>
    <div class="points-remaining">剩余点数：<span id="pointsRemaining">20</span></div>
    <div class="attribute-list" id="attributeList"></div>  <!-- 动态渲染6个属性 -->
    <button class="btn btn-secondary random-btn" id="randomAttrBtn">随机分配</button>
  </div>
  <button class="btn btn-primary" id="confirmAttrBtn">开始人生</button>
  <button class="btn btn-text" id="backFromAttrBtn">返回</button>
</div>
```

**关键样式**:
- `.points-ring`: `80x80px, circle, border-default 2px, margin auto 20px`
- `.points-ring::before`: `inset 4px, border-subtle, 装饰内圈`
- `.points-remaining`: `text-align center, 18px display, color text-accent; span: 28px mono, bold, gold`
- `.attribute-list`: `margin-bottom 20px`
- `.attribute-item`: `flex, space-between, padding 14px 0, border-bottom border-subtle`
- `.attribute-info`: `flex: 1`（包含 `.attribute-name` + `.attribute-desc`）
- `.attribute-controls`: `flex, gap 16px`（包含 `-` 按钮、数值、`+` 按钮）
- `.attr-btn`: `44x44px circle, border-default, font-size 20px`
- `.attribute-value`: `22px, bold, min-width 40px, text-align center, mono, gold`

**动态渲染的属性项**:
```
颜值 — 影响社交、恋爱、演艺机会
智力 — 影响学业、科研、职场晋升
体质 — 影响寿命、运动、疾病抵抗
家境 — 影响教育资源、起点高度
情商 — 影响人际关系、领导力、谈判
运气 — 影响随机事件偏向、奇遇触发
```

---

### 3.5 游戏进行页 (`gamePage`)

**ID**: `gamePage` | **类**: `.page.game-page`

```html
<div class="page game-page" id="gamePage">
  <div class="game-layout">
    <!-- 左侧栏：属性面板 -->
    <div class="game-sidebar">
      <div class="attributes-panel" id="attributesPanel"></div>  <!-- 3x2 网格，动态渲染 -->

      <!-- 隐藏属性面板 -->
      <div class="hidden-attrs-panel" id="hiddenAttrsPanel">
        <div class="hidden-attr-item">
          <span class="hidden-attr-name">快乐</span>
          <div class="hidden-attr-bar">
            <div class="hidden-attr-fill happiness-fill" id="happinessBar"></div>
          </div>
          <span class="hidden-attr-val" id="happinessVal">--</span>
        </div>
        <div class="hidden-attr-item">
          <span class="hidden-attr-name">压力</span>
          <div class="hidden-attr-bar">
            <div class="hidden-attr-fill stress-fill" id="stressBar"></div>
          </div>
          <span class="hidden-attr-val" id="stressVal">--</span>
        </div>
        <div class="hidden-attr-item">
          <span class="hidden-attr-name">健康</span>
          <div class="hidden-attr-bar">
            <div class="hidden-attr-fill health-fill" id="healthBar"></div>
          </div>
          <span class="hidden-attr-val" id="healthVal">--</span>
        </div>
      </div>
    </div>

    <!-- 右侧主区域 -->
    <div class="game-main">
      <div class="game-header">
        <div>
          <div class="age-display" id="ageDisplay">0岁</div>
          <div class="stage-display" id="stageDisplay">婴幼儿期</div>
        </div>
        <div class="game-controls">
          <button class="btn btn-icon toggle-sidebar-btn" id="toggleSidebarBtn">📊</button>
          <button class="btn btn-secondary control-btn" id="pauseBtn">暂停</button>
          <button class="btn btn-secondary control-btn" id="skipBtn">跳过</button>
          <div class="speed-control" id="speedControl">
            <button class="speed-btn" data-speed="0.5">0.5x</button>
            <button class="speed-btn active" data-speed="1">1x</button>
            <button class="speed-btn" data-speed="2">2x</button>
          </div>
        </div>
      </div>

      <div class="event-area" id="eventArea"></div>      <!-- 动态渲染事件卡片 -->

      <div class="history-area" id="historyArea"></div>  <!-- 时间线 -->
      <div class="history-toggle" id="historyToggle">查看历史记录 (0) ▼</div>
    </div>
  </div>
</div>
```

**关键布局**:
- `.game-layout`（桌面 >1024px）: `grid-template-columns: 220px 1fr; gap: 20px;`
- `.game-layout`（平板 769-1024px）: `grid-template-columns: 180px 1fr; gap: 16px;`
- `.game-layout`（移动 <=768px）: `grid-template-columns: 1fr;`（单列）

**侧边栏**:
- 桌面: `position: sticky; top: 24px;`（随滚动固定）
- 移动端: `position: fixed; inset: 0; z-index: 50; transform: translateY(-100%); transition 0.3s;`
- 移动端展开: `.game-sidebar.expanded { transform: translateY(0); }`
- 移动端最大高度: `60vh, overflow-y auto`

**属性面板** (`.attributes-panel`):
- 桌面: `grid, 3x2 columns, gap 8px`
- 移动端: `grid, 2 columns`
- 每个属性盒 `.attr-box`: `bg-surface, border-subtle, radius-md, padding 12px, text-align center`
- `.attr-box-name`: 12px, text-tertiary
- `.attr-box-value`: `font-mono, 20px, bold, color-info, transition 0.3s`

**隐藏属性面板**:
- 桌面: `grid, 3 columns`
- 移动端: `grid, 1 column, flex rows`（name + bar + value 水平排列）
- `.happiness-fill`: `background: var(--color-positive)`（绿色）
- `.stress-fill`: `background: var(--color-warning)`（黄色）
- `.health-fill`: `background: var(--color-info)`（蓝色），`.danger` 时变红 + dangerPulse 动画

**游戏头部**:
- `.game-header`: `flex, space-between, margin-bottom 16px`
- `.age-display`: `font-mono, 24px, bold, gold`
- `.stage-display`: `13px, text-tertiary, letter-spacing 0.06em`
- `.game-controls`: `flex, gap 8px`（移动端 `gap 6px, flex-wrap`）

**事件卡片** (`.event-card`):
- `bg-surface, radius-lg, padding 24px, border-subtle, animation: eventSlideIn 0.4s`
- 移动端: `padding 16px`
- `.event-age`: `font-mono, 12px, text-tertiary, letter-spacing 0.06em`
- `.event-title`: `font-display, 18px, bold, text-accent`
- `.event-desc`: `15px, line-height 1.7, text-primary`
- `.choice-btn`: `padding 14px 18px, transparent bg, border-subtle, radius-md, min-height 48px`
  - hover: `bg-elevated, border-default, border-top gold`
  - active: `scale(0.98), gold-dim bg, gold border`
  - `.choice-effects.fuzzy`: `12px, text-tertiary, italic`（叙事风格模糊提示）

**历史区域**:
- 桌面: `max-height 320px, overflow-y auto, border-left border-subtle`
- 移动端: `max-height 0, overflow hidden, collapsed by default`
- `.history-toggle`: 仅移动端显示（桌面 `display: none`）
- `.history-item`: `padding 6px 0 6px 16px, ::before 圆点标记`
- `.history-age`: `text-accent, bold, mono, margin-right 8px`

---

### 3.6 结局页 (`resultPage`)

**ID**: `resultPage` | **类**: `.page.result-page`

```html
<div class="page result-page" id="resultPage">
  <h2 class="result-title" id="resultTitle">人生终章</h2>
  <p class="result-subtitle" id="resultSubtitle">你度过了平凡的一生</p>

  <div class="result-grade" id="resultGrade"></div>   <!-- 56px 圆形等级 -->

  <div class="score-display" id="scoreDisplay">0</div>
  <p class="score-label">人生评分</p>

  <div class="result-tags" id="resultTags"></div>      <!-- 动态渲染标签 -->

  <div class="card">
    <h3 class="card-title">评分详情</h3>
    <div class="score-breakdown" id="scoreBreakdown"></div>  <!-- 动态渲染 -->
  </div>

  <div class="share-card" id="shareCard">
    <div class="share-card-title">分享你的人生</div>
    <div class="share-card-content" id="shareContent"></div>
    <div class="share-card-score" id="shareScore">0分</div>
  </div>
  <div class="share-preview" id="sharePreview">       <!-- display:none（JS控制显示） -->
    <canvas id="shareCanvas" width="750" height="1000" style="display:none;"></canvas>
    <img id="shareImage" alt="分享卡片" style="max-width:100%;height:auto;border-radius:16px;">
  </div>
  <div class="result-actions-primary">
    <button class="btn btn-primary start-btn" id="restartBtn">重开人生</button>
    <button class="btn btn-secondary" id="challengeBtn">挑战模式</button>
  </div>
  <div class="result-actions-secondary">
    <button class="btn btn-text" id="downloadCardBtn">下载卡片</button>
    <button class="btn btn-text" id="shareBtn">分享结果</button>
    <button class="btn btn-text" id="homeBtn">返回首页</button>
  </div>
</div>
```

**关键样式**:
- `.result-page`: `text-align center, padding-top 20px`
- `.result-title`: `font-display, 32px, bold, text-primary, letter-spacing 0.06em`
- `.result-subtitle`: `16px, text-secondary, margin-bottom 32px`
- `.result-grade`: `56x56px circle, font-display, 28px, bold, border 2px`
  - `.grade-S`: `gold, gold-dim bg, shadow-gold`
  - `.grade-A`: `color-positive, positive bg`
  - `.grade-B`: `color-info, info bg`
  - `.grade-C`: `color-neutral, neutral bg`
  - `.grade-D`: `color-negative, negative bg`
- `.score-display`: `font-display, 48px, bold, text-primary`（移动端 40px）
- `.result-tags`: `flex wrap, center, gap 8px`
- `.result-tag`: `padding 6px 16px, gold-dim bg, border-default, radius-xl, 13px, text-accent`
- `.score-breakdown`: `text-align left`
  - `.breakdown-item`: `flex, space-between, padding 10px 0, border-bottom border-subtle`
  - `.breakdown-label`: `text-secondary, 14px`
  - `.breakdown-value`: `bold, color-info, mono, 14px`
  - `.breakdown-bar-track`: `flex 1, height 4px, margin 0 12px`
  - `.breakdown-bar-fill`: `color-info, transition 0.8s`
- `.share-card`: `gradient bg(135deg, #0d0d12→#16161e), border-default, radius-lg, padding 30px`
- `.share-card-title`: `font-display, 24px, bold, text-accent`
- `.share-card-score`: `font-mono, 36px, bold, gold`
- `.share-preview`: `display none`（JS 控制显示/隐藏）
- `.result-actions-primary`: `flex, gap 12px, center, flex-wrap`
- `.result-actions-secondary`: `flex, gap 8px, center, flex-wrap`

---

### 3.7 成就页 (`achievementPage`)

**ID**: `achievementPage` | **类**: `.page.achievement-page`

```html
<div class="page achievement-page" id="achievementPage">
  <div class="card">
    <h2 class="card-title">成就系统</h2>
    <div class="talent-counter">已解锁：<span id="achievementCount">0</span> / <span id="achievementTotal">0</span></div>
    <div id="achievementList"></div>              <!-- 动态渲染 -->
  </div>
  <button class="btn btn-text" id="backFromAchievementBtn">返回</button>
</div>
```

**渲染逻辑注意**: 当前 `renderAchievementList()` (app.js 第1018行) 使用 `.attribute-item` 类名而不是 `.achievement-item`，存在类名不匹配的已知问题。

**CSS 中定义的 `.achievement-item` 样式**:
```css
.achievement-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  margin-bottom: 10px;
}
.achievement-item.locked {
  background: rgba(22, 22, 30, 0.3);
  border-color: var(--border-subtle);
  filter: blur(2px);
  opacity: 0.6;
}
.achievement-item-icon: width 40px, height 40px, circle, gold-dim bg
.achievement-item-info: flex 1
.achievement-item-name: bold, 14px, text-primary
.achievement-item-desc: 12px, text-tertiary
```

---

## 4. Overlays（6 个覆盖层）

### 4.1 加载画面 (`loadingScreen`)

**位置**: `index.html` 内联样式（第 17-55 行）
**ID**: `loadingScreen`

```html
<div class="loading-screen" id="loadingScreen">
  <div class="loading-text">正在加载人生...</div>
  <div class="loading-bar">
    <div class="loading-bar-inner" id="loadingBar"></div>
  </div>
</div>
```

**样式**:
- `position: fixed; inset: 0; bg-base; z-index: 9999; flex center column`
- `.loading-text`: `font-display, 18px, gold, letter-spacing 0.1em`
- `.loading-bar`: `200x4px, border-subtle bg`
- `.loading-bar-inner`: `gold gradient, transition width 0.3s`
- `.hidden`: `opacity 0, pointer-events none, transition 0.5s`
- 加载逻辑: `simulateLoading()` (app.js 第88行)，随机递增进度，完成后 300ms 延迟后添加 `.hidden`

---

### 4.2 新手引导 (`tutorial-overlay`)

**位置**: JS 动态创建 (`showTutorial()` app.js 第1067行)
**类**: `.tutorial-overlay`

```html
<div class="tutorial-overlay">
  <div class="tutorial-content">
    <h3>欢迎来到人生模拟器</h3>
    <p>你将体验从出生到死亡的完整人生。每个选择都会影响你的命运。</p>
    <p><strong>6大属性</strong>：颜值、智力、体质、家境、情商、运气</p>
    <p>合理分配属性点，选择合适的天赋，是成功的关键！</p>
    <button class="btn btn-primary" id="tutorialCloseBtn">开始体验</button>
  </div>
</div>
```

**样式**:
- `position: fixed; inset: 0; rgba(13,13,18,0.92); z-index: 500; flex center`
- `.tutorial-content`: `bg-surface, border-default, radius-lg, padding 40px, max-width 400px, text-align center`
- `h3`: `text-accent, font-display, 22px`
- `p`: `text-secondary, 14px, line-height 1.7`
- 仅首次游戏显示（通过 `localStorage.lifeSimulator_firstPlayDone` 控制）

---

### 4.3 阶段过渡 (`stage-transition`)

**位置**: JS 动态创建 (`showStageTransition()` app.js 第241行)
**类**: `.stage-transition.stage-{阶段名}`

```html
<div class="stage-transition stage-{stage}">
  <div class="stage-transition-bg"></div>
  <div class="stage-transition-content">
    <div class="stage-transition-label">—— 人生篇章 ——</div>
    <div class="stage-transition-title">{阶段标题}</div>
    <div class="stage-transition-subtitle">{阶段副标题}</div>
  </div>
</div>
```

**样式**:
- `position: fixed; inset: 0; z-index: 200; flex center column; animation: stageTransitionIn 0.5s`
- `pointer-events: none`（不阻塞交互）
- `.fade-out`: `animation: stageTransitionOut 0.5s forwards`
- 2秒后自动添加 `.fade-out` 并移除

**7个阶段对应颜色（均为 0.08 透明度）**:

| 阶段 | CSS类 | 背景色 |
|------|-------|--------|
| 婴幼儿期 | `.stage-infant` | `rgba(252, 211, 180, 0.08)` — 粉色 |
| 童年期 | `.stage-child` | `rgba(180, 220, 220, 0.08)` — 青色 |
| 青少年期 | `.stage-teenager` | `rgba(140, 150, 200, 0.08)` — 靛蓝 |
| 青年期 | `.stage-youth` | `rgba(200, 160, 180, 0.08)` — 粉色 |
| 壮年期 | `.stage-adult` | `rgba(130, 190, 210, 0.08)` — 蓝色 |
| 中老年期 | `.stage-middle_aged` | `rgba(160, 200, 170, 0.08)` — 绿色 |
| 老年期 | `.stage-elderly` | `rgba(210, 180, 150, 0.08)` — 橙色 |

**阶段标题和副标题**:
```
infant: "婴幼儿期" — "一切的开始"
child: "童年期" — "纯真年代"
teenager: "青少年期" — "风起云涌"
youth: "青年期" — "大展宏图"
adult: "壮年期" — "中流砥柱"
middle_aged: "中老年期" — "岁月静好"
elderly: "老年期" — "夕阳无限"
```

---

### 4.4 死亡走马灯 (`death-review`)

**位置**: JS 动态创建 (`showDeathReview()` app.js 第269行)
**类**: `.death-review`

```html
<div class="death-review">
  <div class="death-review-title">人 生 走 马 灯</div>
  <div class="death-review-events">
    <!-- 最多6个关键事件，交错淡入 -->
    <div class="death-review-item" style="animation-delay: 0s">
      <span class="review-age">{年龄}岁</span>{事件标题}
    </div>
    <!-- ...更多事件 -->
  </div>
  <div class="death-review-final" style="animation-delay: {最终延迟}s">
    {年龄}岁，你的人生画上了句号。
  </div>
</div>
```

**样式**:
- `position: fixed; inset: 0; rgba(13,13,18,0.95); z-index: 300; flex center column`
- `animation: deathFadeIn 1.5s`
- `.death-review-title`: `16px, text-tertiary, letter-spacing 0.3em, margin-bottom 48px`
- `.death-review-events`: `max-width 500px, width 90%`
- `.death-review-item`: `text-align center, padding 10px 0, 15px, text-secondary, animation: deathItemFade 0.8s, 初始 opacity 0`
- `.review-age`: `text-accent, bold, mono, margin-right 8px`
- `.death-review-final`: `margin-top 48px, 16px, text-tertiary, animation: deathItemFade 1s`
- 自动移除时间: `事件数 × 400ms + 1500ms`

---

### 4.5 成就弹窗 (`achievement-popup`)

**位置**: JS 动态创建 (`showAchievementPopup()` app.js 第1047行)
**容器**: `#achievementPopupContainer`
**类**: `.achievement-popup`

```html
<div class="achievement-popup">
  <div class="achievement-icon">{icon}</div>
  <div class="achievement-name">解锁成就：{name}</div>
  <div class="achievement-desc">{description}</div>
</div>
```

**样式（桌面）**:
- `position: fixed; top: 20px; right: 20px; z-index: 1000; animation: slideInRight 0.5s`
- `bg-surface, border accent-gold, radius-lg, padding 16px 20px`
- `box-shadow: shadow-lg + shadow-gold`
- `max-width: 280px`

**样式（移动 <=768px）**:
- `top: auto; bottom: 80px; left: 5%; right: 5%; max-width: 90vw; width: auto`
- `animation: slideUp 0.5s`

**行为**: 3秒后自动移除

---

### 4.6 横屏警告 (`landscape-warning`)

**ID**: `landscapeWarning` | **类**: `.landscape-warning`

```html
<div class="landscape-warning" id="landscapeWarning">
  <div class="rotate-icon">🔄</div>
  <p>请竖屏使用以获得最佳体验</p>
</div>
```

**样式**:
- `position: fixed; inset: 0; z-index: 9999; bg-base; flex center column; gap 16px`
- `display: none`（默认隐藏）
- `.rotate-icon`: `48px, gold`
- **仅显示条件**: `@media (max-width: 768px) and (orientation: landscape)`

---

## 5. 动画列表（16个 @keyframes）

以下为 `css/style.css` 中定义的全部动画关键帧：

| 序号 | 动画名称 | CSS位置 | 描述 |
|------|----------|---------|------|
| 1 | `pageEnter` | L147 | 页面切换进入：opacity 0→1, translateY 12px→0, blur 4px→0, 0.5s ease-out |
| 2 | `fadeIn` | L160 | 通用淡入：opacity 0→1, translateY 20px→0 |
| 3 | `rebirthBreathing` | L1323 | 重生背景呼吸：opacity 0.3→0.8→0.3, 8s ease-in-out infinite |
| 4 | `rebirthFadeIn` | L1341 | 重生内容淡入：opacity 0→1, translateY 30px→0, 2s ease |
| 5 | `rebirthSlowFade` | L1377 | 重生问题文字慢闪：opacity 0.5→1→0.5, 4s ease-in-out infinite |
| 6 | `rebirthPulse` | L1329 | 旧版脉冲（兼容保留）：opacity 0.6→1→0.6 |
| 7 | `rebirthGlow` | L1383 | 旧版发光（兼容保留）：opacity 0.6→1→0.6 |
| 8 | `stageTransitionIn` | L1426 | 阶段过渡淡入：opacity 0→1, 0.5s ease |
| 9 | `stageTransitionOut` | L1435 | 阶段过渡淡出：opacity 1→0, 0.5s ease forwards |
| 10 | `eventSlideIn` | L893 | 事件卡片滑入：opacity 0→1, translateX 8px→0, blur 2px→0, 0.4s cubic-bezier |
| 11 | `slideIn` | L906 | 通用左滑入：opacity 0→1, translateX -20px→0 |
| 12 | `slideInRight` | L1227 | 成就弹窗右滑入：opacity 0→1, translateX 100px→0, 0.5s cubic-bezier |
| 13 | `slideUp` | L1927 | 成就弹窗上滑入（移动端）：opacity 0→1, translateY 40px→0, 0.5s ease |
| 14 | `deathFadeIn` | L1522 | 死亡走马灯淡入：opacity 0→1, 1.5s ease |
| 15 | `deathItemFade` | L1555 | 走马灯事件项淡入：opacity 0→1, translateY 10px→0, 0.8s ease |
| 16 | `dangerPulse` | L840 | 健康危险脉冲：opacity 1→0.4→1, 2s ease-in-out infinite |
| 17 | `valueUp` | L1606 | 属性值上升：color positive, scale 1.15→1, 0.4s ease-out |
| 18 | `valueDown` | L1618 | 属性值下降：color negative, scale 0.9→1, 0.4s ease-out |
| 19 | `talentSelect` | L1628 | 天赋选中脉冲：box-shadow 0→20px→shadow-gold, 0.4s |

---

## 6. 事件绑定表

### 6.1 静态事件绑定（`bindEvents()` app.js 第109行）

| DOM元素 ID | 事件类型 | 处理函数 | 所在文件行号 |
|-----------|----------|----------|-------------|
| `startBtn` | click | `this.showRebirthPage()` | app.js L111 |
| `achievementBtn` | click | `this.showAchievementPage()` | app.js L112 |
| `rebirthBtn` | click | `this.showTalentPage()` | app.js L115 |
| `refreshTalentsBtn` | click | `this.refreshTalents()` | app.js L118 |
| `confirmTalentsBtn` | click | `this.confirmTalents()` | app.js L119 |
| `backFromTalentBtn` | click | `this.showHomePage()` | app.js L120 |
| `randomAttrBtn` | click | `this.randomAttributes()` | app.js L123 |
| `confirmAttrBtn` | click | `this.confirmAttributes()` → `this.showGamePage()` → `this.gameManager.startNewGame()` | app.js L124 |
| `backFromAttrBtn` | click | `this.showTalentPage()` | app.js L125 |
| `pauseBtn` | click | `this.togglePause()` | app.js L128 |
| `skipBtn` | click | `this.skipToNextChoice()` | app.js L129 |
| `toggleSidebarBtn` | click | `this.toggleGameSidebar()` | app.js L130 |
| `historyToggle` | click | `this.toggleHistory()` | app.js L131 |
| `.speed-btn[data-speed]` | click | `this.setGameSpeed(parseFloat(speed))` | app.js L133-138 |
| `restartBtn` | click | `this.showTalentPage()` | app.js L142 |
| `downloadCardBtn` | click | `this.downloadShareCard()` | app.js L143 |
| `challengeBtn` | click | `this.challengeMode()` | app.js L144 |
| `shareBtn` | click | `this.shareResult()` | app.js L145 |
| `homeBtn` | click | `this.showHomePage()` | app.js L146 |
| `backFromAchievementBtn` | click | `this.showHomePage()` | app.js L149 |
| `tutorialCloseBtn` | click | `overlay.remove()`（动态创建后绑定） | app.js L1082 |

### 6.2 动态事件绑定

| 动态元素 | 事件类型 | 处理函数 | 创建位置 |
|----------|----------|----------|----------|
| `.talent-card` | click | `this.toggleTalentSelection(talent, card)` | app.js L475 (`renderTalentGrid`) |
| `.attr-btn[data-attr]` | click | `this.modifyAttribute(attr, action)` | app.js L557 (`renderAttributeList`) |
| `.choice-btn[data-choice]` | click | `this.gameManager.makeChoice(choiceIndex)` | app.js L730 (`displayEvent`) |

### 6.3 触摸手势

| 手势 | 条件 | 处理函数 | 创建位置 |
|------|------|----------|----------|
| touchend (下拉 >120px, <500ms) | `homePage.active` && `scrollY <= 5` | `this.showRebirthPage()` | app.js L1085 (`initPullToRebirth`) |

### 6.4 游戏回调（通过 `GameManager.on()` 注册）

| 回调名 | 注册位置(app.js) | 触发时机 | 处理逻辑 |
|--------|-----------------|----------|----------|
| `onAgeChange` | L156 | 每年推进时 | 阶段过渡检测、年龄显示更新、隐藏属性面板更新 |
| `onEvent` | L170 | 事件触发时 | 渲染事件卡片、添加到历史 |
| `onChoice` | L174 | 选择处理后 | 触觉反馈、显示结果卡片 |
| `onGameOver` | L179 | 游戏结束时 | 触觉反馈、死亡走马灯、渲染结局页 |
| `onAchievement` | L184 | 成就解锁时 | 显示成就弹窗 |

---

## 7. 数据模型

### 7.1 属性系统

#### 7.1.1 6大可见属性 (0-10, 可被天赋突破上限)
| 属性键 | 中文名 | 初始值 | 描述 |
|--------|--------|--------|------|
| `appearance` | 颜值 | 5 | 影响社交、恋爱、演艺机会 |
| `intelligence` | 智力 | 5 | 影响学业、科研、职场晋升 |
| `constitution` | 体质 | 5 | 影响寿命、运动、疾病抵抗 |
| `family` | 家境 | 5 | 影响教育资源、起点高度 |
| `eq` | 情商 | 5 | 影响人际关系、领导力、谈判 |
| `luck` | 运气 | 5 | 影响随机事件偏向、奇遇触发 |

**属性分配**: 初始各5，玩家可分配20点自由点数（总计50点分布在6个属性上，每个属性初始5 + 最多额外分配，上限10）

#### 7.1.2 4个隐藏属性
| 属性键 | 中文名 | 范围 | 初始值 | 说明 |
|--------|--------|------|--------|------|
| `happiness` | 快乐 | 0-100 | 50 | 影响评分 |
| `stress` | 压力 | 0-100 | 0 | 自然衰减 -2/年，>80时死亡概率 ×1.5 |
| `health` | 健康 | 0-100 | 70-100 | 按体质初始化，<30危险，<25严重 |
| `wealth` | 财富 | 无上限 | 家境×10000 | 数值型，影响评分 |

#### 7.1.3 属性联动被动效果 (GameManager L223-255)
- 智力>=8: 每5年 +1智力（学霸模式）
- 颜值+情商>=15: 每5年 +5快乐（万人迷）
- 运气>=10: 每3年随机正面效果（锦鲤附体）
- 体质<=2: 每年 -5健康（体弱多病）
- 情商<=2: 每年 -3快乐（社交困难）

### 7.2 天赋品质配置

定义在 `js/data/talents.js` 的 `TALENT_QUALITY_CONFIG`：

| 品质 | 英文键 | 名称 | 颜色 | 概率 |
|------|--------|------|------|------|
| 普通 | `common` | 普通 | #9e9e9e（灰） | 50% |
| 稀有 | `rare` | 稀有 | #2196f3（蓝） | 30% |
| 史诗 | `epic` | 史诗 | #9c27b0（紫） | 15% |
| 传说 | `legendary` | 传说 | #ff9800（橙） | 5% |

**保底机制**: 连续3次刷新没有史诗或传说品质天赋时，自动将一个普通天赋替换为史诗品质。计数器 `consecutiveBadDraws`（app.js L45）。

**天赋类型**:
- **属性型**: 直接修改属性值（如 `appearance: 2`）
- **上限型**: 修改属性上限（如 `constitution_max: 5`），键名以 `_max` 结尾
- **机制型**: 特殊游戏机制效果（`type: 'mechanic'`）
- **成长型**: 随游戏进程触发效果（`type: 'growth'`）

**天赋数量**: 共 23 个（3 传说 + 4 史诗 + 4 稀有 + 8 普通 + 4 机制/成长型）

### 7.3 评分系统

定义在 `js/core/ScoringSystem.js`。

#### 7.3.1 评分维度

| 维度 | 满分 | 计算方式 |
|------|------|----------|
| 基础分 | 20 | 固定 20 分 |
| 寿命分 | 15 | `min(15, floor(age × 15 / 100))` |
| 财富分 | 15 | `min(15, floor(log10(wealth + 1) × 7.5))` |
| 幸福分 | 10 | `min(10, floor(happiness / 10))` |
| 人际分 | 15 | 基于记忆：已婚+5, 有子+3, 未离婚+2, 兄弟姐妹+2/1, 在世父母+max3 |
| 事业分 | 15 | 基于记忆：学历+3/5/8, 高财富+4/3 |
| 探索分 | 10 | 基于特殊线+碎片收集 |
| **总计** | **100** | 乘以难度修正 |

#### 7.3.2 难度修正
| 模式 | 修正系数 |
|------|----------|
| normal | ×1.0 |
| hard | ×1.5 |
| hell | ×2.0 |

#### 7.3.3 等级评定（基于总分）
| 等级 | 分数范围 | CSS 类 |
|------|----------|--------|
| S | >=90 | `.grade-S`（金色） |
| A | >=80 | `.grade-A`（绿色） |
| B | >=60 | `.grade-B`（蓝色） |
| C | >=40 | `.grade-C`（灰色） |
| D | <40 | `.grade-D`（红色） |

> **注意**: `ScoringSystem` 中实际没有 `getGrade()` 方法返回等级，等级由 `renderResult()` 动态计算。当前 `resultPage` 中 `.result-grade` 的等级标签和样式虽然已定义，但在 `app.js` 的 `renderResult()` 中未看到赋值逻辑。这可能是遗漏或通过其他方式实现。

#### 7.3.4 称号系统
| 总分 | 称号 |
|------|------|
| >=120 | 传奇人生 |
| >=100 | 精彩人生 |
| >=80 | 幸福人生 |
| >=60 | 平凡人生 |
| >=40 | 坎坷人生 |
| >=20 | 悲惨人生 |
| <20 | 地狱人生 |

### 7.4 成就系统

定义在 `js/data/achievements.js`，共 18 个成就，分为 5 类：

| 类型 | 数量 | 成就列表 |
|------|------|----------|
| 寿命类 | 3 | 长寿之星(80岁)、百岁老人(100岁)、英年早逝(30岁前) |
| 属性类 | 6 | 绝世美颜(颜值10)、天才少年(智力10)、运动健将(体质10)、富二代(家境10)、社交达人(情商10)、锦鲤附体(运气10) |
| 财富类 | 3 | 百万富翁(100万)、亿万富翁(1000万)、破产清算(归零) |
| 特殊类 | 4 | 修仙成功(渡劫成仙)、寒门贵子(家境2+智力9)、万人迷(颜值9+情商9)、天选之子(运气10) |
| 分数类 | 3 | 及格人生(60分)、优秀人生(80分)、完美人生(100分) |

---

## 8. Canvas 分享卡片

### 8.1 ShareCardGenerator 类

定义在 `js/core/ShareCardGenerator.js`（244行）。

```javascript
class ShareCardGenerator {
  constructor() {
    this.width = 750;    // Canvas 宽度
    this.height = 1000;  // Canvas 高度
  }
  generate(data) { /* 返回 base64 PNG */ }
}
```

### 8.2 卡片布局结构

| 区域 | Y坐标范围 | 内容 |
|------|----------|------|
| 标题区 | 0-190px | 游戏名称 + 副标题 + 分隔线 + 称号 + 享年年龄 |
| 雷达图 | 230-430px | 六轴属性雷达图 + 标签 |
| 时间轴 | 470-720px | "人生轨迹"标题 + 最后5个关键事件 |
| 评分区 | 770-920px | 分隔线 + 大号分数 + 标签 + 种子码 |
| 底部 | 950-1000px | 分享引导文字 + 生成标记 |

### 8.3 Canvas 配色方案

> **注意**: Canvas 使用独立配色，与 CSS 设计系统不一致（见已知问题 #1）

| 用途 | Canvas 颜色 | CSS 设计系统对应 |
|------|------------|-----------------|
| 背景渐变 | `#1a1a2e` → `#16213e` → `#0f3460` | `--bg-base` #0d0d12 |
| 标题文字 | `#ffe66d` | `--accent-gold` #c8a35f |
| 分隔线 | `rgba(255, 230, 109, 0.3)` | `--border-strong` |
| 称号/分数 | `#ff6b6b` | `--color-negative` #c75c5c |
| 年龄/雷达 | `#4ecdc4` | `--color-info` #6b8fb5 |
| 雷达填充 | `rgba(78, 205, 196, 0.25)` | 无对应 |
| 装饰圆点 | `rgba(255, 230, 109, 0.03)` | `--accent-gold-dim` |
| 事件圆点 | `#ff6b6b` | `--color-negative` |
| 标签文字 | `#aaa` | `--text-secondary` #9a9590 |
| 事件文字 | `#ddd` | `--text-primary` #e8e4dc |
| 种子码 | `#666` | 无对应 |
| 底部文字 | `#555` / `#333` | `--text-tertiary` #5e5a55 |

### 8.4 雷达图规格
- 中心位置: `(375, 330)`（Canvas 中心水平）
- 半径: 100px
- 6轴: 颜值、智力、体质、家境、情商、运气
- 5层网格线（radius × ring/5）
- 标签偏移: 半径 + 25px

### 8.5 生成流程

1. `renderResult()` (app.js L948) 调用 `generateShareCard(result)`
2. 构造 `cardData` 对象
3. 调用 `ShareCardGenerator.generate(cardData)` → base64 PNG
4. 创建 Image 对象加载 base64
5. 将 Image 绘制到 `#shareCanvas`
6. 延迟 300ms 后将 canvas 转为 dataURL 设置到 `#shareImage`（支持手机长按保存）
7. `downloadShareCard()` 同时触发 `<a>` 标签下载

### 8.6 种子码
- 由 `generateSeedCode()` (app.js L982) 生成
- 编码内容: 6属性值 + 天赋ID列表
- Base64 编码后取前12字符，大写化
- 示例: `A2B3C4D5E6F7`

---

## 9. 响应式断点

### 9.1 断点定义

| 断点名称 | 宽度范围 | CSS 位置 |
|----------|----------|----------|
| Mobile | <= 768px | `@media (max-width: 768px)` L1739 |
| Tablet | 769-1024px | `@media (min-width: 769px) and (max-width: 1024px)` L1933 |
| Desktop | > 1024px | `@media (min-width: 1025px)` L1945 |

### 9.2 Mobile (<=768px) 适配详情

| 组件 | 桌面行为 | 移动端行为 |
|------|----------|-----------|
| 容器 padding | 24px | 16px（含 safe-area） |
| 游戏标题字号 | 48px | 36px |
| 副标题间距 | margin-bottom 40px | 24px→20px |
| 首页 padding-top | 60px | 24px |
| 统计栏间距 | gap 24px | gap 16px |
| 统计值字号 | 28px | 22px |
| **游戏布局** | `220px 1fr` | `1fr`（单列） |
| **侧边栏** | sticky | fixed, 可折叠面板（translateY 动画） |
| **属性面板** | 3列 | 2列 |
| **隐藏属性** | 3列 | 1列 flex rows |
| **天赋网格** | grid auto-fill | flex 水平滚动（snap） |
| 天赋卡片描述 | 显示 | 隐藏 |
| 天赋卡片宽度 | auto | min-width 260px |
| **历史区域** | 展开 | 折叠（max-height 0） |
| **历史折叠按钮** | 隐藏 | 显示 |
| 事件卡片 padding | 24px | 16px |
| 重生年龄字号 | 64px | 48px |
| 评分显示字号 | 48px | 40px |
| text-hero | 64px | 48px |
| text-2xl | 48px | 36px |
| **成就弹窗** | 右上角 slideInRight | 底部居中 slideUp, 90vw |
| **游戏头部** | 普通 | sticky, bg-base, margin-bottom 8px |
| 游戏控制间距 | gap 8px | gap 6px, flex-wrap |
| 开始按钮 | 14px 48px | 12px 36px, 15px |

### 9.3 Tablet (769-1024px)
- 游戏布局: `180px 1fr, gap 16px`
- 天赋网格: `grid-template-columns: repeat(2, 1fr)`

### 9.4 移动端安全区域适配
```css
body {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}
.container {
  padding-left: max(24px, env(safe-area-inset-left));
  padding-right: max(24px, env(safe-area-inset-right));
}
.game-sidebar {
  padding-top: calc(12px + env(safe-area-inset-top));
}
```

### 9.5 移动端触控规范
- 所有可交互按钮: `min-height: 44px`
- 属性增减按钮: 44x44px 圆形
- 选择按钮: `min-height: 48px`
- `-webkit-tap-highlight-color: transparent`（choice-btn）

---

## 10. 已知 UI 问题

### 问题 1: Canvas 分享卡片配色与 CSS 设计系统不一致
- **严重程度**: 中
- **位置**: `js/core/ShareCardGenerator.js`
- **描述**: Canvas 使用 `#ffe66d` 金色、`#1a1a2e→#0f3460` 蓝紫渐变背景，而 CSS 设计系统使用 `#c8a35f` 金色、`#0d0d12` 纯深色背景。导致分享卡片视觉风格与游戏内体验割裂。
- **修复方向**: 将 Canvas 颜色统一为 CSS 设计系统的 `--accent-gold`、`--bg-base` 等值。

### 问题 2: 游戏速度控制可能失效
- **严重程度**: 中
- **位置**: `js/app.js` L840-846 (`setGameSpeed`)
- **描述**: `setGameSpeed()` 依赖 `this.gameManager.eventInterval._baseInterval`，但 `GameManager.startAutoPlay()` 中使用 `setInterval` 返回的是 `autoPlayInterval`，没有 `_baseInterval` 属性。速度控制可能在某些代码路径下不生效。
- **修复方向**: 在 `GameManager` 中保存基础间隔值，或在 `setGameSpeed` 中使用 `this.gameManager.autoPlayInterval`。

### 问题 3: 分享功能使用原生 alert
- **严重程度**: 低
- **位置**: `js/app.js` L378, L941-943, L1011
- **描述**: `checkDailyGoals()` 和 `shareResult()` 使用 `alert()` 弹窗通知，视觉上与游戏风格不一致。
- **修复方向**: 替换为 styled toast 或 modal 组件。

### 问题 4: 成就列表使用错误的 CSS 类名
- **严重程度**: 中
- **位置**: `js/app.js` L1032 (`renderAchievementList`)
- **描述**: `renderAchievementList()` 中创建的成就项使用 `.attribute-item` 类名，而 CSS 中定义了完整的 `.achievement-item` 样式（包含 icon、info 布局、locked 模糊效果）。导致成就列表样式与设计意图不符。
- **修复方向**: 将 `item.className = 'attribute-item'` 改为 `item.className = 'achievement-item'`，并调整内部结构为 `.achievement-item-icon` + `.achievement-item-info(.achievement-item-name + .achievement-item-desc)`。

### 问题 5: 分享预览 canvas 可能短暂闪烁
- **严重程度**: 低
- **位置**: `index.html` L233, `css/style.css` L1196-1206
- **描述**: `#sharePreview` 默认 `display: none`，canvas 也是 `style="display:none"`，但 img 元素默认可见。JS 在 300ms 后才设置 img src。在切换到结局页的瞬间，img 元素可能短暂显示为空白或旧图片。
- **修复方向**: 将 img 初始设为 `style="display:none"`，仅在图片加载完成后显示。

### 问题 6: 移动端侧边栏展开缺少过渡动画
- **严重程度**: 低
- **位置**: `css/style.css` L1783
- **描述**: 侧边栏的 `transform: translateY(-100%)` → `translateY(0)` 有 `transition: 0.3s`，但内部内容可能因 overflow/y-auto 而出现跳动。
- **修复方向**: 可添加 `will-change: transform` 或使用 `opacity` 辅助过渡。

### 问题 7: 天赋计数器存在重复 ID
- **严重程度**: 低
- **位置**: `index.html` L131, L134
- **描述**: `talentCount` ID 在页面中出现两次（`.talent-counter-badge` 内和 `.talent-counter` 内）。`getElementById` 只会获取第一个，导致计数器显示可能不同步。
- **修复方向**: 使用不同 ID（如 `talentCountBadge` 和 `talentCountText`），或使用 `querySelectorAll` 更新。

### 问题 8: 结果页面等级未渲染
- **严重程度**: 中
- **位置**: `js/app.js` `renderResult()` 方法
- **描述**: `.result-grade` 元素存在于 DOM 中，且有 S/A/B/C/D 五个等级样式，但 `renderResult()` 中没有计算和赋值等级的逻辑。该元素始终为空。
- **修复方向**: 在 `renderResult()` 中添加等级计算和渲染逻辑。

---

## 11. UI 优化建议（给另一个 Agent 的方向）

### P0 — 视觉一致性（最高优先级）

#### 建议 1: 统一 Canvas 分享卡片配色
- **修改文件**: `js/core/ShareCardGenerator.js`
- **具体方案**: 将以下颜色替换为 CSS 设计系统对应值：
  - `#ffe66d` → `#c8a35f`（标题、分隔线、装饰）
  - `#1a1a2e` → `#0d0d12`（背景起始色）
  - `#16213e` → `#16161e`（背景中间色）
  - `#0f3460` → `#1e1e2a`（背景结束色）
  - `#ff6b6b` → `#c75c5c`（称号、分数、事件圆点）
  - `#4ecdc4` → `#6b8fb5`（雷达图、年龄）
  - `#aaa` → `#9a9590`（副标题、标签）
  - `#ddd` → `#e8e4dc`（事件文字）

#### 建议 2: 修复成就列表类名
- **修改文件**: `js/app.js`
- **具体方案**: 在 `renderAchievementList()` (L1018-1045) 中，将 DOM 结构改为使用 `.achievement-item` 系列类名：
```javascript
const item = document.createElement('div');
item.className = `achievement-item ${isUnlocked ? '' : 'locked'}`;
item.innerHTML = `
  <div class="achievement-item-icon">${achievement.icon}</div>
  <div class="achievement-item-info">
    <div class="achievement-item-name">${achievement.name}</div>
    <div class="achievement-item-desc">${achievement.description}</div>
  </div>
`;
```

#### 建议 3: 替换所有 alert() 为 styled toast
- **修改文件**: `js/app.js` + `css/style.css` + `index.html`
- **具体方案**: 创建一个通用的 `.toast` 组件系统：
  - 在 `index.html` 添加 `<div id="toastContainer"></div>`
  - 在 `css/style.css` 添加 toast 样式（底部居中、滑入动画、自动消失）
  - 在 `app.js` 添加 `showToast(message, type)` 工具函数
  - 替换 L378、L941-943、L1011 三处 `alert()` 调用

#### 建议 4: 修复结果页面等级渲染
- **修改文件**: `js/app.js`
- **具体方案**: 在 `renderResult()` 中添加等级计算：
```javascript
let grade = 'D';
if (result.totalScore >= 90) grade = 'S';
else if (result.totalScore >= 80) grade = 'A';
else if (result.totalScore >= 60) grade = 'B';
else if (result.totalScore >= 40) grade = 'C';
const gradeEl = document.getElementById('resultGrade');
gradeEl.textContent = grade;
gradeEl.className = `result-grade grade-${grade}`;
```

---

### P1 — 视觉增强（高优先级）

#### 建议 5: 首页背景粒子/星空动画
- **修改文件**: `css/style.css` + `js/app.js`（或新建 `js/particles.js`）
- **具体方案**: 在首页添加微妙的粒子动画背景，使用 CSS animation 或 Canvas 实现。粒子应为金色小点，缓慢飘动，营造"命运星空"氛围。

#### 建议 6: 事件卡片添加类型指示器
- **修改文件**: `js/app.js` `displayEvent()` + `css/style.css`
- **具体方案**: 为事件卡片添加颜色编码的左侧边框或图标，按事件类型区分（职业/社交/健康/学业/感情等），使用已有的语义色彩变量。

#### 建议 7: 添加当前生命阶段进度条
- **修改文件**: `index.html` + `js/app.js` + `css/style.css`
- **具体方案**: 在 `.game-header` 中添加一个细进度条，显示当前年龄在当前生命阶段中的进度（如青少年期 12-18岁，当前14岁则显示 33%）。

#### 建议 8: 改进选择按钮视觉差异
- **修改文件**: `js/app.js` `displayEvent()` + `css/style.css`
- **具体方案**: 为选项按钮添加风险/收益的视觉提示（如绿色高光=正面倾向、红色高光=负面风险、金色=混合），使用图标或色块增强可读性。

#### 建议 9: 评分显示数字动画
- **修改文件**: `js/app.js` `renderResult()` + `css/style.css`
- **具体方案**: 使用 CSS `@property` 或 JS `requestAnimationFrame` 实现评分数字从 0 到最终分数的滚动计数动画，持续约 1.5s。

---

### P2 — 交互增强（中优先级）

#### 建议 10: 天赋卡片滑动选择（移动端）
- **修改文件**: `js/app.js`（扩展 `renderTalentGrid` 或新建手势处理）
- **具体方案**: 在移动端天赋水平滚动视图中，添加左右滑动 + 点击选择的手势组合。

#### 建议 11: 覆盖层下拉关闭
- **修改文件**: `js/app.js`
- **具体方案**: 为新手引导等全屏覆盖层添加下拉关闭手势（类似首页的 pull-to-rebirth）。

#### 建议 12: 高分庆祝动画
- **修改文件**: `css/style.css` + `js/app.js`
- **具体方案**: 当评分 >= 80 时在结局页触发撒花/confetti 动画效果。

#### 建议 13: 暗/亮主题切换
- **修改文件**: `css/style.css` + `js/app.js` + `index.html`
- **具体方案**: 添加亮色主题变量集，在首页或设置中添加主题切换按钮，通过 `data-theme` 属性或类名切换。

---

### P3 — 组件升级（低优先级）

#### 建议 14: 加载动画升级为骨架屏/闪光效果
- **修改文件**: `index.html` + `css/style.css` + `js/app.js`
- **具体方案**: 将简单的进度条替换为主题化的骨架屏 shimmer 动画，与墨夜金主题风格一致。

#### 建议 15: 属性值变更微交互
- **修改文件**: `css/style.css` + `js/app.js`
- **具体方案**: 为 `.attr-box-value` 的数值变化添加涟漪效果（ripple），已有 `.value-up` / `.value-down` 动画类，需在 UI 更新时动态添加。

#### 建议 16: 死亡走马灯电影效果增强
- **修改文件**: `css/style.css`
- **具体方案**: 为死亡走马灯添加电影胶片颗粒效果（CSS noise filter）和缓慢缩放（Ken Burns 效果），增强沉浸感。

#### 建议 17: 音效占位符
- **修改文件**: `js/app.js`
- **具体方案**: 在关键交互点（选择确认、成就解锁、阶段过渡、游戏结束）添加视觉音效指示器（如脉冲波纹图标），为未来添加实际音效预留入口。

#### 建议 18: 修复天赋计数器重复 ID
- **修改文件**: `index.html`
- **具体方案**: 将第二个 `id="talentCount"` 改为 `id="talentCountText"`，在 `app.js` 中更新 `updateTalentCounter()` 方法同步更新两个元素。

---

## 12. 文件清单与修改指南

| 文件 | 行数 | 职责 | UI 修改涉及 |
|------|------|------|------------|
| `index.html` | 272 | DOM 结构、页面布局、脚本加载、viewport 元数据 | 新增覆盖层/组件、修改 DOM 结构、修复重复 ID |
| `css/style.css` | 1949 | 全部视觉样式、设计系统令牌、响应式断点、动画 | 所有视觉变更、新组件样式、动画添加 |
| `js/app.js` | 1110 | UI 逻辑、事件绑定、页面切换、动态渲染 | 新交互逻辑、修复已知问题、Toast 系统 |
| `js/core/GameManager.js` | 565 | 游戏流程、事件循环、状态管理 | 速度控制修复 |
| `js/core/EventEngine.js` | ~1486 | 1486个事件、记忆系统、隐藏线 | 不需要 UI 变更 |
| `js/core/ScoringSystem.js` | 417 | 7维评分、成就检查、称号 | 不需要 UI 变更 |
| `js/core/AttributeSystem.js` | 280 | 6+4属性系统、死亡概率 | 不需要 UI 变更 |
| `js/core/ShareCardGenerator.js` | 244 | Canvas 卡片生成 | 配色统一 |
| `js/data/talents.js` | 234 | 23个天赋、品质配置 | 不需要 UI 变更 |
| `js/data/events.js` | ~2000+ | 1486个游戏事件 | 不需要 UI 变更 |
| `js/data/achievements.js` | 194 | 18个成就 | 不需要 UI 变更 |

**重点修改文件**: `css/style.css`（所有视觉变更）、`js/app.js`（交互逻辑修复）、`js/core/ShareCardGenerator.js`（配色统一）

---

## 13. 给 UI Agent 的约束条件

1. **必须保持所有现有功能正常运作**: 游戏核心流程（首页 → 重生 → 天赋 → 属性 → 游戏 → 结局）不能被破坏。所有事件绑定和回调必须保持正常。
2. **修改后的文件需通过浏览器测试验证**: 建议使用 Chrome DevTools 的设备模拟模式测试 <=768px / 769-1024px / >1024px 三个断点。
3. **保持 CSS 设计令牌系统**: 所有颜色、间距、圆角等必须使用 `:root` 中定义的 CSS 自定义属性，不要硬编码颜色值。
4. **保持现有响应式断点结构**: `<=768px`（移动端）、`769-1024px`（平板）、`>1024px`（桌面）三个断点必须保留。
5. **保持 SPA 页面切换机制**: 使用 `.page` / `.page.active` 类名控制页面显示隐藏，不要引入路由库。
6. **不要引入任何新的外部依赖**: 包括字体、CSS 框架、JavaScript 库、第三方图标库等。仅使用现有已加载的 Google Fonts（Noto Sans SC、Noto Serif SC）和 JetBrains Mono。
7. **所有新增动画必须尊重 `prefers-reduced-motion`**: 添加 `@media (prefers-reduced-motion: reduce)` 媒体查询，在该条件下禁用或简化动画。
8. **保持 viewport-fit=cover 和 safe-area 适配**: 不要移除 `<meta name="viewport" content="viewport-fit=cover">` 和相关的 `env(safe-area-inset-*)` 处理。
9. **Canvas 分享卡片尺寸保持 750x1000**: 不要修改 `ShareCardGenerator` 的 `width` 和 `height` 属性，否则会导致分享图片变形。
10. **保持所有触控目标最小 44px**: 新增的任何可交互元素在移动端必须保持 `min-height: 44px` 或等效的触控区域。
11. **不要修改游戏数据文件**: `js/data/` 目录下的 `events.js`、`talents.js`、`achievements.js` 不需要 UI 变更，不要修改。
12. **代码注释使用中文**: 保持与现有代码风格一致，注释使用中文。

---

> 文档版本: v2.0
> 最后更新: 2026-06-28
> 基于源码版本: life-simulator（GitHub Pages 部署版）
