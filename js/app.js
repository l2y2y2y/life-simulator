/**
 * app.js
 * 人生模拟器 - 主应用逻辑
 */

const PAST_LIFE_ENDINGS = [
  { age: 67, death: '死于心脏病', regret: '一生碌碌无为，临终前最大的遗憾是没对她说出那句话。' },
  { age: 23, death: '死于车祸', regret: '明明还有那么多梦想没有实现。' },
  { age: 89, death: '在睡梦中安详离世', regret: '回顾一生，虽然平淡，但家人都在身边，也算圆满。' },
  { age: 45, death: '死于过劳', regret: '拼命赚钱，却忘了为什么出发。' },
  { age: 31, death: '死于意外', regret: '上个月刚计划好要去旅行，可惜再也没有机会了。' },
  { age: 78, death: '死于癌症', regret: '年轻时总说以后，后来才发现，很多事已经没有以后了。' },
  { age: 55, death: '死于抑郁症', regret: '如果当初能勇敢一点，人生会不会不一样？' },
  { age: 102, death: '寿终正寝', regret: '活了整整一个世纪，看尽了人间冷暖，已无遗憾。' },
  { age: 18, death: '死于溺水', regret: '明明那天天气那么好，谁能想到那是最后一次游泳。' },
  { age: 38, death: '创业失败后跳楼', regret: '如果能重来，一定不会再那么逞强。' },
  { age: 72, death: '死于阿尔茨海默症', regret: '到最后，连最亲的人都不认识了。' },
  { age: 28, death: '死于突发疾病', regret: '体检报告还放在桌上没来得及看。' },
];

// Haptic feedback helper (P2)
function hapticFeedback(pattern = 10) {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

class LifeSimulatorApp {
  constructor() {
    this.gameManager = new GameManager();
    this.selectedTalents = [];
    this.attributePoints = {
      appearance: 5,
      intelligence: 5,
      constitution: 5,
      family: 5,
      eq: 5,
      luck: 5
    };
    this.remainingPoints = 20;
    this.currentTalentsPool = [];
    this._lastStage = null;
    this.fateCoins = 0;
    this.dailyGoals = [];
    this.consecutiveBadDraws = 0; // 天赋保底计数
    this.isFirstPlay = !localStorage.getItem('lifeSimulator_firstPlayDone');
    this.shareCardGenerator = new ShareCardGenerator();
    this.currentSeedCode = '';

    this.init();
  }

  /**
   * 初始化应用
   */
  init() {
    // 模拟加载进度
    this.simulateLoading();
    
    // 初始化游戏管理器
    this.gameManager.init({
      events: EVENTS_DATA,
      achievements: ACHIEVEMENTS_DATA
    });

    // 绑定事件监听
    this.bindEvents();
    
    // 注册游戏回调
    this.registerGameCallbacks();
    
    // 加载玩家数据并生成每日目标
    this.loadPlayerData();
    this.generateDailyGoals();
    
    // 更新首页统计
    this.updateHomeStatistics();

    // 新手引导
    this.showTutorial();
    // Pull-to-rebirth on mobile
    this.initPullToRebirth();
  }

  /**
   * 模拟加载进度
   */
  simulateLoading() {
    const loadingBar = document.getElementById('loadingBar');
    const loadingScreen = document.getElementById('loadingScreen');
    let progress = 0;
    
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          loadingScreen.classList.add('hidden');
        }, 300);
      }
      loadingBar.style.width = progress + '%';
    }, 200);
  }

  /**
   * 绑定UI事件
   */
  bindEvents() {
    // 首页
    document.getElementById('startBtn').addEventListener('click', () => this.showRebirthPage());
    document.getElementById('achievementBtn').addEventListener('click', () => this.showAchievementPage());

    // 开场过渡页
    document.getElementById('rebirthBtn').addEventListener('click', () => this.showTalentPage());

    // 天赋页
    document.getElementById('refreshTalentsBtn').addEventListener('click', () => this.refreshTalents());
    document.getElementById('confirmTalentsBtn').addEventListener('click', () => this.confirmTalents());
    document.getElementById('backFromTalentBtn').addEventListener('click', () => this.showHomePage());

    // 属性页
    document.getElementById('randomAttrBtn').addEventListener('click', () => this.randomAttributes());
    document.getElementById('confirmAttrBtn').addEventListener('click', () => this.confirmAttributes());
    document.getElementById('backFromAttrBtn').addEventListener('click', () => this.showTalentPage());

    // 游戏页
    document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
    document.getElementById('skipBtn').addEventListener('click', () => this.skipToNextChoice());
    document.getElementById('toggleSidebarBtn').addEventListener('click', () => this.toggleGameSidebar());
    document.getElementById('historyToggle').addEventListener('click', () => this.toggleHistory());
    // Speed control
    document.querySelectorAll('.speed-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.setGameSpeed(parseFloat(e.target.dataset.speed));
      });
    });

    // 侧边栏遮罩点击关闭
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    if (sidebarOverlay) {
      sidebarOverlay.addEventListener('click', () => {
        const sidebar = document.querySelector('.game-sidebar');
        if (sidebar) sidebar.classList.remove('expanded');
        sidebarOverlay.classList.remove('active');
      });
    }

    // 结局页
    document.getElementById('restartBtn').addEventListener('click', () => this.showTalentPage());
    document.getElementById('downloadCardBtn').addEventListener('click', () => this.downloadShareCard());
    document.getElementById('challengeBtn').addEventListener('click', () => this.challengeMode());
    document.getElementById('shareBtn').addEventListener('click', () => this.shareResult());
    document.getElementById('homeBtn').addEventListener('click', () => this.showHomePage());

    // 成就页
    document.getElementById('backFromAchievementBtn').addEventListener('click', () => this.showHomePage());

    // 每日目标折叠
    const dailyGoalsCard = document.querySelector('.daily-goals-card');
    if (dailyGoalsCard) {
      const title = dailyGoalsCard.querySelector('.card-title');
      if (title) {
        title.addEventListener('click', () => {
          dailyGoalsCard.classList.toggle('expanded');
        });
      }
    }

    // Mobile tab switching
    const tabBtns = document.querySelectorAll('.mobile-tab-btn');
    const tabPanels = document.querySelectorAll('.mobile-tab-panel');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        // Update buttons
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // Update panels
        tabPanels.forEach(p => p.classList.remove('active'));
        const targetPanel = document.querySelector(`.mobile-tab-panel[data-tab="${tab}"]`);
        if (targetPanel) targetPanel.classList.add('active');
        // Clear history badge when switching to event tab
        if (tab === 'event') {
          this.clearHistoryBadge();
        }
      });
    });
  }

  /**
   * 注册游戏回调
   */
  registerGameCallbacks() {
    this.gameManager.on('onAgeChange', (data) => {
      const prevStage = this._lastStage;
      const currentStage = data.stage;

      // 阶段变化时显示过渡动画
      if (prevStage && prevStage !== currentStage) {
        this.showStageTransition(currentStage, data.stageName);
      }
      this._lastStage = currentStage;

      this.updateAgeDisplay(data);
      this.updateHiddenAttrsPanel();
      // 更新移动端属性概览条
      this.updateAttrOverviewBar();
    });

    this.gameManager.on('onEvent', (event) => {
      this.displayEvent(event);
    });

    this.gameManager.on('onChoice', (result) => {
      hapticFeedback(10);
      this.displayChoiceResult(result);
    });

    this.gameManager.on('onGameOver', (result) => {
      hapticFeedback([50, 30, 50]);
      this.showResultPage(result);
    });

    this.gameManager.on('onAchievement', (achievements) => {
      this.showAchievementPopup(achievements);
    });
  }

  // ==================== 页面切换 ====================

  showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
  }

  showHomePage() {
    this.updateHomeStatistics();
    this.showPage('homePage');
  }

  showTalentPage() {
    this.selectedTalents = [];
    this.refreshTalents();
    this.showPage('talentPage');
  }

  showAttributePage() {
    this.resetAttributes();
    this.renderAttributeList();
    this.showPage('attributePage');
  }

  showGamePage() {
    this._lastStage = null;
    this.showPage('gamePage');
    this.clearGameDisplay();
  }

  showResultPage(result) {
    this.showDeathReview(() => {
      this.renderResult(result);
      this.showPage('resultPage');
    });
  }

  showAchievementPage() {
    this.renderAchievementList();
    this.showPage('achievementPage');
  }

  showRebirthPage() {
    const ending = PAST_LIFE_ENDINGS[Math.floor(Math.random() * PAST_LIFE_ENDINGS.length)];
    document.getElementById('rebirthAge').textContent = ending.age + '岁';
    document.getElementById('rebirthDeath').textContent = '上辈子，你' + ending.death + '。';
    document.getElementById('rebirthRegret').textContent = ending.regret;
    this.showPage('rebirthPage');
  }

  showStageTransition(stage, stageName) {
    const stageTitles = {
      'infant': '婴幼儿期', 'child': '童年期', 'teenager': '青少年期',
      'youth': '青年期', 'adult': '壮年期', 'middle_aged': '中老年期', 'elderly': '老年期'
    };
    const subtitles = {
      'infant': '一切的开始', 'child': '纯真年代', 'teenager': '风起云涌',
      'youth': '大展宏图', 'adult': '中流砥柱', 'middle_aged': '岁月静好', 'elderly': '夕阳无限'
    };

    const overlay = document.createElement('div');
    overlay.className = `stage-transition stage-${stage}`;
    overlay.innerHTML = `
      <div class="stage-transition-bg"></div>
      <div class="stage-transition-content">
        <div class="stage-transition-label">—— 人生篇章 ——</div>
        <div class="stage-transition-title">${stageTitles[stage] || stageName}</div>
        <div class="stage-transition-subtitle">${subtitles[stage] || ''}</div>
      </div>
    `;
    document.body.appendChild(overlay);

    setTimeout(() => {
      overlay.classList.add('fade-out');
      setTimeout(() => overlay.remove(), 600);
    }, 2000);
  }

  showDeathReview(callback) {
    const keyEvents = this.gameManager.eventEngine.getKeyEvents();
    const topEvents = keyEvents.slice(-6);

    if (topEvents.length === 0) {
      callback();
      return;
    }

    const overlay = document.createElement('div');
    overlay.className = 'death-review';

    let eventsHtml = topEvents.map((e, i) => `
      <div class="death-review-item" style="animation-delay: ${i * 0.4}s">
        <span class="review-age">${e.age}岁</span>${e.title}
      </div>
    `).join('');

    overlay.innerHTML = `
      <div class="death-review-title">人 生 走 马 灯</div>
      <div class="death-review-events">${eventsHtml}</div>
      <div class="death-review-final" style="animation-delay: ${topEvents.length * 0.4 + 0.5}s">
        ${this.gameManager.gameState.age}岁，你的人生画上了句号。
      </div>
    `;
    document.body.appendChild(overlay);

    setTimeout(() => {
      overlay.remove();
      callback();
    }, topEvents.length * 400 + 1500);
  }

  // ==================== 首页 ====================

  updateHomeStatistics() {
    const stats = this.gameManager.getStatistics();
    document.getElementById('statLifeCount').textContent = stats.lifeCount;
    document.getElementById('statHighScore').textContent = stats.highestScore;
    document.getElementById('statAchievements').textContent = stats.achievementProgress.unlocked;
    // 更新命运币显示
    const coinEl = document.getElementById('statFateCoins');
    if (coinEl) coinEl.textContent = this.fateCoins;
    // 更新每日目标
    this.renderDailyGoals();
  }

  renderDailyGoals() {
    const container = document.getElementById('dailyGoalsContainer');
    if (!container) return;
    container.innerHTML = '';
    this.dailyGoals.forEach(goal => {
      const div = document.createElement('div');
      div.className = `daily-goal-item ${goal.completed ? 'completed' : ''}`;
      div.innerHTML = `
        <span class="goal-text">${goal.completed ? '✓' : '○'} ${goal.text}</span>
        <span class="goal-reward">${goal.coinReward} 币</span>
      `;
      container.appendChild(div);
    });
  }

  // ==================== 每日目标系统 ====================

  generateDailyGoals() {
    const goalTemplates = [
      { text: '活到80岁以上', check: (r) => r.age >= 80 },
      { text: '评分超过80分', check: (r) => r.totalScore >= 80 },
      { text: '评分超过100分', check: (r) => r.totalScore >= 100 },
      { text: '活到60岁以上', check: (r) => r.age >= 60 },
      { text: '财富超过10万', check: (r) => this.gameManager.attrSystem.hidden.wealth >= 100000 },
      { text: '颜值达到8以上', check: (r) => this.gameManager.attrSystem.attributes.appearance >= 8 },
      { text: '活到30岁以下结束', check: (r) => r.age <= 30 && r.age >= 18 },
      { text: '触发隐藏剧情线', check: (r) => Object.values(this.gameManager.eventEngine.specialLines).some(v => v) },
    ];

    const today = new Date().toDateString();
    const savedDate = localStorage.getItem('lifeSimulator_dailyDate');

    if (savedDate === today) {
      const saved = localStorage.getItem('lifeSimulator_dailyGoals');
      if (saved) {
        this.dailyGoals = JSON.parse(saved);
        return;
      }
    }

    // 生成3个随机不重复的目标
    const shuffled = goalTemplates.sort(() => Math.random() - 0.5);
    this.dailyGoals = shuffled.slice(0, 3).map(g => ({ ...g, completed: false, coinReward: 10 }));

    localStorage.setItem('lifeSimulator_dailyGoals', JSON.stringify(this.dailyGoals));
    localStorage.setItem('lifeSimulator_dailyDate', today);
  }

  checkDailyGoals(result) {
    let newCompleted = 0;
    this.dailyGoals.forEach(goal => {
      if (!goal.completed && goal.check(result)) {
        goal.completed = true;
        this.fateCoins += goal.coinReward;
        newCompleted++;
      }
    });

    if (newCompleted > 0) {
      localStorage.setItem('lifeSimulator_dailyGoals', JSON.stringify(this.dailyGoals));
      this.savePlayerData();
      setTimeout(() => {
        this.showToast(`完成 ${newCompleted} 个每日目标！获得 ${newCompleted * 10} 命运币！`, 'success');
      }, 500);
    }
  }

  // ==================== 玩家数据持久化 ====================

  savePlayerData() {
    const data = {
      fateCoins: this.fateCoins,
      totalGames: this.gameManager.gameState.lifeCount
    };
    localStorage.setItem('lifeSimulator_player', JSON.stringify(data));
  }

  loadPlayerData() {
    try {
      const data = JSON.parse(localStorage.getItem('lifeSimulator_player'));
      if (data) {
        this.fateCoins = data.fateCoins || 0;
      }
    } catch (e) {}
  }

  // ==================== 天赋选择 ====================

  refreshTalents() {
    const shuffled = [...TALENTS_DATA].sort(() => Math.random() - 0.5);
    this.currentTalentsPool = shuffled.slice(0, 10);
    this.selectedTalents = [];

    // 保底检查
    const hasEpicOrAbove = this.currentTalentsPool.some(t =>
      t.quality === 'epic' || t.quality === 'legendary'
    );

    if (!hasEpicOrAbove) {
      this.consecutiveBadDraws++;
      if (this.consecutiveBadDraws >= 3) {
        // 保底：替换一个普通天赋为史诗
        const epicTalents = TALENTS_DATA.filter(t => t.quality === 'epic');
        if (epicTalents.length > 0) {
          const epicTalent = epicTalents[Math.floor(Math.random() * epicTalents.length)];
          // 替换最后一个普通天赋
          for (let i = this.currentTalentsPool.length - 1; i >= 0; i--) {
            if (this.currentTalentsPool[i].quality === 'common') {
              this.currentTalentsPool[i] = epicTalent;
              break;
            }
          }
          this.consecutiveBadDraws = 0;
        }
      }
    } else {
      this.consecutiveBadDraws = 0;
    }

    this.renderTalentGrid();
    this.updateTalentCounter();
  }

  renderTalentGrid() {
    const grid = document.getElementById('talentGrid');
    grid.innerHTML = '';

    this.currentTalentsPool.forEach(talent => {
      const card = document.createElement('div');
      card.className = 'talent-card';
      card.dataset.talentId = talent.id;
      
      const qualityClass = `quality-${talent.quality}`;
      const qualityName = TALENT_QUALITY_CONFIG[talent.quality].name;
      
      // 构建效果描述
      let effectsText = '';
      if (talent.effects) {
        const effects = [];
        for (const [key, value] of Object.entries(talent.effects)) {
          if (key.endsWith('_max')) continue;
          const attrNames = {
            appearance: '颜值', intelligence: '智力', constitution: '体质',
            family: '家境', eq: '情商', luck: '运气'
          };
          if (attrNames[key]) {
            effects.push(`${attrNames[key]}${value > 0 ? '+' : ''}${value}`);
          }
        }
        effectsText = effects.join('，');
      }

      card.innerHTML = `
        <div class="talent-quality ${qualityClass}">${qualityName}</div>
        <div class="talent-name">${talent.name}</div>
        <div class="talent-desc">${talent.description}</div>
        ${effectsText ? `<div class="talent-effects">${effectsText}</div>` : ''}
      `;

      card.addEventListener('click', () => this.toggleTalentSelection(talent, card));
      grid.appendChild(card);
    });
  }

  toggleTalentSelection(talent, card) {
    const index = this.selectedTalents.findIndex(t => t.id === talent.id);
    
    if (index > -1) {
      // 取消选择
      this.selectedTalents.splice(index, 1);
      card.classList.remove('selected');
    } else {
      // 选择
      if (this.selectedTalents.length >= 3) {
        return; // 最多选3个
      }
      this.selectedTalents.push(talent);
      card.classList.add('selected');
    }

    this.updateTalentCounter();
  }

  updateTalentCounter() {
    const count = this.selectedTalents.length;
    const badge = document.getElementById('talentCount');
    const text = document.getElementById('talentCountText');
    if (badge) badge.textContent = count;
    if (text) text.textContent = count;
    const btn = document.getElementById('confirmTalentsBtn');
    if (btn) btn.disabled = count !== 3;
  }

  confirmTalents() {
    if (this.selectedTalents.length === 3) {
      this.showAttributePage();
    }
  }

  // ==================== 属性分配 ====================

  resetAttributes() {
    this.attributePoints = {
      appearance: 5,
      intelligence: 5,
      constitution: 5,
      family: 5,
      eq: 5,
      luck: 5
    };
    this.remainingPoints = 20;
    this.updatePointsDisplay();
  }

  renderAttributeList() {
    const list = document.getElementById('attributeList');
    list.innerHTML = '';

    const attrNames = {
      appearance: { name: '颜值', desc: '影响社交、恋爱、演艺机会' },
      intelligence: { name: '智力', desc: '影响学业、科研、职场晋升' },
      constitution: { name: '体质', desc: '影响寿命、运动、疾病抵抗' },
      family: { name: '家境', desc: '影响教育资源、起点高度' },
      eq: { name: '情商', desc: '影响人际关系、领导力、谈判' },
      luck: { name: '运气', desc: '影响随机事件偏向、奇遇触发' }
    };

    for (const [key, info] of Object.entries(attrNames)) {
      const item = document.createElement('div');
      item.className = 'attribute-item';
      item.innerHTML = `
        <div class="attribute-info">
          <div class="attribute-name">${info.name}</div>
          <div class="attribute-desc">${info.desc}</div>
        </div>
        <div class="attribute-controls">
          <button class="attr-btn" data-attr="${key}" data-action="decrease">-</button>
          <div class="attribute-value" id="attr-${key}">${this.attributePoints[key]}</div>
          <button class="attr-btn" data-attr="${key}" data-action="increase">+</button>
        </div>
      `;
      list.appendChild(item);
    }

    // 绑定增减按钮事件
    list.querySelectorAll('.attr-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const attr = e.target.dataset.attr;
        const action = e.target.dataset.action;
        this.modifyAttribute(attr, action);
      });
    });
  }

  modifyAttribute(attr, action) {
    if (action === 'increase') {
      if (this.remainingPoints > 0 && this.attributePoints[attr] < 10) {
        this.attributePoints[attr]++;
        this.remainingPoints--;
      }
    } else {
      if (this.attributePoints[attr] > 0) {
        this.attributePoints[attr]--;
        this.remainingPoints++;
      }
    }

    document.getElementById(`attr-${attr}`).textContent = this.attributePoints[attr];
    this.updatePointsDisplay();
  }

  updatePointsDisplay() {
    document.getElementById('pointsRemaining').textContent = this.remainingPoints;
  }

  randomAttributes() {
    this.resetAttributes();
    
    // 随机分配20点
    const attrs = Object.keys(this.attributePoints);
    for (let i = 0; i < 20; i++) {
      const randomAttr = attrs[Math.floor(Math.random() * attrs.length)];
      if (this.attributePoints[randomAttr] < 10) {
        this.attributePoints[randomAttr]++;
        this.remainingPoints--;
      }
    }

    // 更新显示
    for (const [key, value] of Object.entries(this.attributePoints)) {
      document.getElementById(`attr-${key}`).textContent = value;
    }
    this.updatePointsDisplay();
  }

  confirmAttributes() {
    this.showGamePage();
    this.gameManager.startNewGame(this.selectedTalents, this.attributePoints, 'normal');
  }

  // ==================== 游戏进行 ====================

  clearGameDisplay() {
    document.getElementById('ageDisplay').textContent = '0岁';
    document.getElementById('stageDisplay').textContent = '婴幼儿期';
    document.getElementById('eventArea').innerHTML = '';
    document.getElementById('historyArea').innerHTML = '';
    const historyAreaDesktop = document.getElementById('historyAreaDesktop');
    if (historyAreaDesktop) historyAreaDesktop.innerHTML = '';
    this.clearHistoryBadge();
    this.renderAttributesPanel({
      attributes: this.attributePoints,
      hidden: { happiness: 50, stress: 0, health: 100, wealth: 0 }
    });
  }

  updateAgeDisplay(data) {
    document.getElementById('ageDisplay').textContent = data.age + '岁';
    document.getElementById('stageDisplay').textContent = data.stageName;
    this.renderAttributesPanel(data.attributes);
  }

  renderAttributesPanel(attributesData) {
    const panel = document.getElementById('attributesPanel');
    const attrs = attributesData.attributes || attributesData;
    
    const attrNames = {
      appearance: '颜值',
      intelligence: '智力',
      constitution: '体质',
      family: '家境',
      eq: '情商',
      luck: '运气'
    };

    panel.innerHTML = '';
    for (const [key, name] of Object.entries(attrNames)) {
      const box = document.createElement('div');
      box.className = 'attr-box';
      box.innerHTML = `
        <div class="attr-box-name">${name}</div>
        <div class="attr-box-value">${attrs[key] !== undefined ? attrs[key] : 5}</div>
      `;
      panel.appendChild(box);
    }
  }

  displayEvent(event) {
    const eventArea = document.getElementById('eventArea');
    
    const card = document.createElement('div');
    card.className = 'event-card';
    
    let choicesHtml = '';
    if (event.choices && event.choices.length > 0) {
      const choices = event.choices.map((choice, index) => {
        let effectsText = '';
        if (choice.effects) {
          // 叙事风格模糊描述
          const effects = [];
          const entries = Object.entries(choice.effects);
          let netPositive = entries.reduce((sum, [, v]) => sum + (v > 0 ? 1 : v < 0 ? -1 : 0), 0);
          const hasPositive = entries.some(([, v]) => v > 0);
          const hasNegative = entries.some(([, v]) => v < 0);
          const maxAbs = Math.max(...entries.map(([, v]) => Math.abs(v)));
          
          if (hasPositive && hasNegative) {
            // 有利有弊
            const narratives = [
              '这件事有利有弊，结果难以预料',
              '也许会带来改变，但也要付出代价',
              '你隐约觉得这不是个简单的选择'
            ];
            effects.push(narratives[Math.floor(Math.random() * narratives.length)]);
            if (maxAbs >= 15) effects.push('影响可能比较深远');
          } else if (hasPositive) {
            // 可能是好事
            const narratives = [
              '直觉告诉你，这似乎是个好主意',
              '也许会带来一些好的改变',
              '你感觉事情可能会往好的方向发展'
            ];
            effects.push(narratives[Math.floor(Math.random() * narratives.length)]);
            if (maxAbs >= 15) effects.push('可能会产生显著影响');
          } else {
            // 可能有风险
            const narratives = [
              '你隐约感到有些不安',
              '也许这并不是最好的选择',
              '你犹豫了一下，但还是决定面对'
            ];
            effects.push(narratives[Math.floor(Math.random() * narratives.length)]);
            if (maxAbs >= 15) effects.push('后果可能比较严重');
          }
          effectsText = effects.join(' — ');
        }
        
        return `
          <button class="choice-btn" data-choice="${index}">
            ${choice.text}
            ${effectsText ? `<div class="choice-effects fuzzy">${effectsText}</div>` : ''}
          </button>
        `;
      }).join('');
      
      choicesHtml = `<div class="choice-buttons">${choices}</div>`;
    }

    card.innerHTML = `
      <div class="event-age">${this.gameManager.gameState.age}岁</div>
      <div class="event-title">${event.title}</div>
      <div class="event-desc">${event.description}</div>
      ${choicesHtml}
    `;

    eventArea.appendChild(card);
    
    // 滚动到底部
    eventArea.scrollTop = eventArea.scrollHeight;

    // 绑定选择按钮事件
    if (event.choices && event.choices.length > 0) {
      // Auto-switch to event tab when new event with choices arrives
      this.switchToEventTab();
      card.querySelectorAll('.choice-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const choiceIndex = parseInt(e.target.closest('.choice-btn').dataset.choice);
          this.gameManager.makeChoice(choiceIndex);
        });
      });
    }

    // 添加到历史
    this.addToHistory(event);
  }

  displayChoiceResult(result) {
    if (result.outcomeText) {
      const eventArea = document.getElementById('eventArea');
      const outcomeDiv = document.createElement('div');
      outcomeDiv.className = 'event-card';
      outcomeDiv.style.borderLeftColor = 'var(--success-color)';
      outcomeDiv.innerHTML = `
        <div class="event-title">结果</div>
        <div class="event-desc">${result.outcomeText}</div>
      `;
      eventArea.appendChild(outcomeDiv);
      eventArea.scrollTop = eventArea.scrollHeight;
    }
  }

  updateHiddenAttrsPanel() {
    try {
      const hidden = this.gameManager.attrSystem.hidden;
      if (!hidden) return;
      
      const happiness = Math.max(0, Math.min(100, hidden.happiness || 50));
      const stress = Math.max(0, Math.min(100, hidden.stress || 30));
      const health = Math.max(0, Math.min(100, hidden.health || 70));
      
      // 更新快乐条
      const hBar = document.getElementById('happinessBar');
      const hVal = document.getElementById('happinessVal');
      if (hBar) { hBar.style.width = happiness + '%'; }
      if (hVal) { hVal.textContent = Math.round(happiness); }

      // 更新压力条
      const sBar = document.getElementById('stressBar');
      const sVal = document.getElementById('stressVal');
      if (sBar) { sBar.style.width = stress + '%'; }
      if (sVal) { sVal.textContent = Math.round(stress); }

      // 更新健康条
      const hlBar = document.getElementById('healthBar');
      const hlVal = document.getElementById('healthVal');
      if (hlBar) {
        hlBar.style.width = health + '%';
        if (health < 30) {
          hlBar.classList.add('danger');
          if (hlVal) hlVal.classList.add('danger');
        } else {
          hlBar.classList.remove('danger');
          if (hlVal) hlVal.classList.remove('danger');
        }
      }
      if (hlVal) { hlVal.textContent = Math.round(health); }
    } catch(e) {}
  }

  addToHistory(event) {
    const historyArea = document.getElementById('historyArea');
    const historyAreaDesktop = document.getElementById('historyAreaDesktop');
    const itemHtml = `
      <span class="history-age">${this.gameManager.gameState.age}岁</span>
      ${event.title}
    `;
    const itemClassName = 'history-item';

    // Mobile history (inside tab)
    if (historyArea) {
      const item = document.createElement('div');
      item.className = itemClassName;
      item.innerHTML = itemHtml;
      historyArea.appendChild(item);
      historyArea.scrollTop = historyArea.scrollHeight;
    }

    // Desktop history
    if (historyAreaDesktop) {
      const item = document.createElement('div');
      item.className = itemClassName;
      item.innerHTML = itemHtml;
      historyAreaDesktop.appendChild(item);
      historyAreaDesktop.scrollTop = historyAreaDesktop.scrollHeight;
    }

    // Update desktop toggle button count
    const toggle = document.getElementById('historyToggle');
    if (toggle && historyAreaDesktop) {
      toggle.textContent = `查看历史记录 (${historyAreaDesktop.children.length}) ▼`;
    }

    // Update mobile history badge
    if (historyArea) {
      this.updateHistoryBadge(historyArea.children.length);
    }
  }

  togglePause() {
    const btn = document.getElementById('pauseBtn');
    if (this.gameManager.gameState.isPaused) {
      this.gameManager.resume();
      btn.textContent = '暂停';
    } else {
      this.gameManager.pause();
      btn.textContent = '继续';
    }
  }

  toggleGameSidebar() {
    const sidebar = document.querySelector('.game-sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) {
      sidebar.classList.toggle('expanded');
    }
    if (overlay) {
      overlay.classList.toggle('active');
    }
  }

  toggleHistory() {
    const historyArea = document.getElementById('historyAreaDesktop');
    const toggle = document.getElementById('historyToggle');
    if (historyArea) {
      historyArea.classList.toggle('expanded');
      const isExpanded = historyArea.classList.contains('expanded');
      toggle.textContent = isExpanded ? '收起历史记录 ▲' : `查看历史记录 (${historyArea.children.length}) ▼`;
    }
  }

  setGameSpeed(speed) {
    // Adjust game manager event interval based on speed
    if (this.gameManager && this.gameManager.eventInterval) {
      const baseInterval = this.gameManager.eventInterval._baseInterval || 3000;
      this.gameManager.eventInterval.interval = baseInterval / speed;
    }
  }

  skipToNextChoice() {
    this.gameManager.skipToNextChoice();
  }

  // ==================== 移动端属性概览条 ====================

  updateAttrOverviewBar() {
    if (!this.gameManager || !this.gameManager.attributeSystem) return;
    // 兼容：检查 attributeSystem 或 attrSystem
    const attrSystem = this.gameManager.attributeSystem || this.gameManager.attrSystem;
    if (!attrSystem) return;
    const attrs = attrSystem.attributes || {};
    const row = document.getElementById('attrOverviewRow');
    if (!row) return;
    
    const attrNames = {
      appearance: '颜值', intelligence: '智力', constitution: '体质',
      family: '家境', eq: '情商', luck: '运气'
    };
    
    // 只在第一次渲染时创建DOM
    if (row.children.length === 0) {
      Object.keys(attrNames).forEach(key => {
        const item = document.createElement('div');
        item.className = 'attr-overview-item';
        item.id = `overview-${key}`;
        item.innerHTML = `<span class="attr-overview-name">${attrNames[key]}</span><span class="attr-overview-value" id="overviewVal-${key}">${attrs[key] || 0}</span>`;
        row.appendChild(item);
      });
    } else {
      // 后续只更新数值
      Object.keys(attrNames).forEach(key => {
        const valEl = document.getElementById(`overviewVal-${key}`);
        if (valEl) {
          const oldVal = parseInt(valEl.textContent);
          const newVal = attrs[key] || 0;
          if (oldVal !== newVal) {
            valEl.textContent = newVal;
            const item = valEl.closest('.attr-overview-item');
            if (item) {
              item.classList.remove('changed-up', 'changed-down');
              void item.offsetWidth; // 强制重绘
              item.classList.add(newVal > oldVal ? 'changed-up' : 'changed-down');
            }
          }
        }
      });
    }
    
    // 更新隐藏属性
    const hidden = attrSystem.hidden || attrSystem.hiddenAttributes || {};
    const happiness = hidden.happiness ?? 50;
    const stress = hidden.stress ?? 0;
    const health = hidden.health ?? 70;
    const wealth = hidden.wealth ?? 0;
    
    const hBar = document.getElementById('overviewHappinessBar');
    const sBar = document.getElementById('overviewStressBar');
    const hlBar = document.getElementById('overviewHealthBar');
    const wVal = document.getElementById('overviewWealthVal');
    if (hBar) hBar.style.width = `${Math.min(100, Math.max(0, happiness))}%`;
    if (sBar) sBar.style.width = `${Math.min(100, Math.max(0, stress))}%`;
    if (hlBar) hlBar.style.width = `${Math.min(100, Math.max(0, health))}%`;
    if (wVal) wVal.textContent = this.formatWealth(wealth);
    
    // 健康危险状态
    if (hlBar) {
      if (health < 30) hlBar.parentElement.classList.add('danger');
      else hlBar.parentElement.classList.remove('danger');
    }

    // Also update desktop overview bar elements (if they exist)
    const hBarDesktop = document.getElementById('overviewHappinessBarDesktop');
    const sBarDesktop = document.getElementById('overviewStressBarDesktop');
    const hlBarDesktop = document.getElementById('overviewHealthBarDesktop');
    const wValDesktop = document.getElementById('overviewWealthValDesktop');
    if (hBarDesktop) hBarDesktop.style.width = `${Math.min(100, Math.max(0, happiness))}%`;
    if (sBarDesktop) sBarDesktop.style.width = `${Math.min(100, Math.max(0, stress))}%`;
    if (hlBarDesktop) hlBarDesktop.style.width = `${Math.min(100, Math.max(0, health))}%`;
    if (wValDesktop) wValDesktop.textContent = this.formatWealth(wealth);
    if (hlBarDesktop) {
      if (health < 30) hlBarDesktop.parentElement.classList.add('danger');
      else hlBarDesktop.parentElement.classList.remove('danger');
    }

    // Also update mobile tab-specific values
    const hValMobile = document.getElementById('overviewHappinessVal');
    const sValMobile = document.getElementById('overviewStressVal');
    const hlValMobile = document.getElementById('overviewHealthVal');
    if (hValMobile) hValMobile.textContent = Math.round(happiness);
    if (sValMobile) sValMobile.textContent = Math.round(stress);
    if (hlValMobile) hlValMobile.textContent = Math.round(health);
  }

  /**
   * 格式化财富显示
   */
  formatWealth(wealth) {
    if (wealth >= 100000000) return (wealth / 100000000).toFixed(1) + '亿';
    if (wealth >= 10000) return (wealth / 10000).toFixed(0) + '万';
    return wealth.toLocaleString();
  }

  // ==================== 结局页 ====================

  renderResult(result) {
    document.getElementById('resultTitle').textContent = result.title;
    document.getElementById('resultSubtitle').textContent = result.subTitle || '';
    document.getElementById('scoreDisplay').textContent = result.totalScore;

    // 计算等级
    let grade = 'D';
    const totalScore = result.totalScore || result.scores?.total || 0;
    if (totalScore >= 90) grade = 'S';
    else if (totalScore >= 80) grade = 'A';
    else if (totalScore >= 60) grade = 'B';
    else if (totalScore >= 40) grade = 'C';
    const gradeEl = document.getElementById('resultGrade');
    if (gradeEl) {
      gradeEl.textContent = grade;
      gradeEl.className = `result-grade grade-${grade}`;
    }

    // 标签
    const tagsContainer = document.getElementById('resultTags');
    tagsContainer.innerHTML = '';
    result.tags.forEach(tag => {
      const span = document.createElement('span');
      span.className = 'result-tag';
      span.textContent = tag;
      tagsContainer.appendChild(span);
    });

    // 评分详情
    const breakdown = document.getElementById('scoreBreakdown');
    breakdown.innerHTML = `
      <div class="breakdown-item">
        <span class="breakdown-label">基础分</span>
        <span class="breakdown-value">${result.baseScore || 0}</span>
      </div>
      <div class="breakdown-item">
        <span class="breakdown-label">寿命加分</span>
        <span class="breakdown-value">${result.lifespanScore || 0}</span>
      </div>
      <div class="breakdown-item">
        <span class="breakdown-label">成就加分</span>
        <span class="breakdown-value">${result.achievementScore || 0}</span>
      </div>
      <div class="breakdown-item">
        <span class="breakdown-label">财富加分</span>
        <span class="breakdown-value">${result.wealthScore || 0}</span>
      </div>
      <div class="breakdown-item">
        <span class="breakdown-label">幸福加分</span>
        <span class="breakdown-value">${result.happinessScore || 0}</span>
      </div>
      <div class="breakdown-item">
        <span class="breakdown-label">难度加成</span>
        <span class="breakdown-value">${result.difficultyModifier || '×1'}</span>
      </div>
    `;

    // 分享卡片内容
    const talentsText = this.selectedTalents.map(t => t.name).join('、');
    document.getElementById('shareContent').innerHTML = `
      我活了${result.age}岁，获得了"${result.title}"的评价！<br>
      天赋：${talentsText}<br>
      标签：${result.tags.join('、')}
    `;
    document.getElementById('shareScore').textContent = result.totalScore + '分';

    // 显示新成就
    if (result.newAchievements && result.newAchievements.length > 0) {
      this.showAchievementPopup(result.newAchievements);
    }

    // 检查每日目标
    this.checkDailyGoals(result);

    // 生成分享卡片
    this.generateShareCard(result);
    
    // 生成种子码
    this.currentSeedCode = this.generateSeedCode();
  }

  shareResult() {
    const result = {
      title: document.getElementById('resultTitle').textContent,
      score: document.getElementById('scoreDisplay').textContent,
      age: this.gameManager.gameState.age
    };

    const shareText = `我在【人生模拟器】中活了${result.age}岁，得了${result.score}分！获得了"${result.title}"的评价。你能超过我吗？`;

    // 尝试使用Web Share API
    if (navigator.share) {
      navigator.share({
        title: '人生模拟器',
        text: shareText,
        url: window.location.href
      }).catch(err => console.log('分享失败:', err));
    } else {
      // 复制到剪贴板
      navigator.clipboard.writeText(shareText).then(() => {
        this.showToast('分享文案已复制到剪贴板！', 'success');
      }).catch(() => {
        this.showToast(shareText, 'info');
      });
    }
  }

  generateShareCard(result) {
    const canvas = document.getElementById('shareCanvas');
    const ctx = canvas.getContext('2d');
    const generator = this.shareCardGenerator;
    
    const cardData = {
      title: result.title,
      age: this.gameManager.gameState.age,
      score: result.totalScore,
      attributes: this.gameManager.attrSystem.attributes,
      keyEvents: this.gameManager.eventEngine.getKeyEvents(),
      tags: result.tags,
      seedCode: this.currentSeedCode || ''
    };
    
    const imgData = generator.generate(cardData);
    
    const img = new Image();
    img.onload = () => {
      canvas.width = generator.width;
      canvas.height = generator.height;
      ctx.drawImage(img, 0, 0);
    };
    img.src = imgData;
    // Auto-show as img for mobile long-press save
    setTimeout(() => {
      const shareImage = document.getElementById('shareImage');
      if (shareImage) {
        shareImage.src = canvas.toDataURL('image/png');
        shareImage.style.display = 'block';
      }
    }, 300);
  }

  generateSeedCode() {
    const attrs = this.gameManager.attrSystem.attributes;
    const talents = this.selectedTalents.map(t => t.id).sort().join(',');
    const seed = `${attrs.appearance}${attrs.intelligence}${attrs.constitution}${attrs.family}${attrs.eq}${attrs.luck}`;
    // 简单编码
    return btoa(seed + talents).substring(0, 12).toUpperCase();
  }

  downloadShareCard() {
    const canvas = document.getElementById('shareCanvas');
    const shareImage = document.getElementById('shareImage');
    // Show as img for long-press save on mobile
    if (shareImage && canvas) {
      shareImage.src = canvas.toDataURL('image/png');
      shareImage.style.display = 'block';
    }
    // Also trigger download
    const link = document.createElement('a');
    link.download = `人生模拟器_${this.gameManager.gameState.age}岁_${this.currentSeedCode || 'share'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  challengeMode() {
    if (this.currentSeedCode) {
      const text = `我在【人生模拟器】中活了${this.gameManager.gameState.age}岁，得了${document.getElementById('scoreDisplay').textContent}分！用种子码 ${this.currentSeedCode} 来挑战我吧！`;
      navigator.clipboard.writeText(text).then(() => {
        this.showToast('挑战种子码已复制！发给朋友让他们来挑战你的分数吧！', 'success');
      }).catch(() => {
        prompt('复制以下内容发给朋友：', text);
      });
    }
  }

  // ==================== 成就系统 ====================

  renderAchievementList() {
    const list = document.getElementById('achievementList');
    if (!list) return;
    list.innerHTML = '';
    const achievements = this.gameManager.achievements || [];
    let unlockedCount = 0;
    achievements.forEach(achievement => {
      const isUnlocked = achievement.unlocked;
      if (isUnlocked) unlockedCount++;
      const item = document.createElement('div');
      item.className = `achievement-item ${isUnlocked ? '' : 'locked'}`;
      item.innerHTML = `
        <div class="achievement-item-icon">${achievement.icon}</div>
        <div class="achievement-item-info">
          <div class="achievement-item-name">${achievement.name}</div>
          <div class="achievement-item-desc">${achievement.description}</div>
        </div>
      `;
      list.appendChild(item);
    });
    const countEl = document.getElementById('achievementCount');
    const totalEl = document.getElementById('achievementTotal');
    if (countEl) countEl.textContent = unlockedCount;
    if (totalEl) totalEl.textContent = achievements.length;
  }

  showAchievementPopup(achievements) {
    const container = document.getElementById('achievementPopupContainer');
    
    achievements.forEach(achievement => {
      const popup = document.createElement('div');
      popup.className = 'achievement-popup';
      popup.innerHTML = `
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-name">解锁成就：${achievement.name}</div>
        <div class="achievement-desc">${achievement.description}</div>
      `;
      container.appendChild(popup);

      // 3秒后移除
      setTimeout(() => {
        popup.remove();
      }, 3000);
    });
  }

  // ==================== Toast 提示 ====================

  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    // 触发动画
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });
    // 自动消失
    setTimeout(() => {
      toast.classList.remove('show');
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  showTutorial() {
    if (!this.isFirstPlay) return;
    localStorage.setItem('lifeSimulator_firstPlayDone', 'true');
    const overlay = document.createElement('div');
    overlay.className = 'tutorial-overlay';
    overlay.innerHTML = `
      <div class="tutorial-content">
        <h3>欢迎来到人生模拟器</h3>
        <p>你将体验从出生到死亡的完整人生。每个选择都会影响你的命运。</p>
        <p><strong>6大属性</strong>：颜值、智力、体质、家境、情商、运气</p>
        <p>合理分配属性点，选择合适的天赋，是成功的关键！</p>
        <button class="btn btn-primary" id="tutorialCloseBtn">开始体验</button>
      </div>
    `;
    document.body.appendChild(overlay);
    document.getElementById('tutorialCloseBtn').addEventListener('click', () => overlay.remove());
  }

  // ==================== Mobile Tab Navigation ====================

  switchToEventTab() {
    const eventBtn = document.querySelector('.mobile-tab-btn[data-tab="event"]');
    if (eventBtn) {
      document.querySelectorAll('.mobile-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.mobile-tab-panel').forEach(p => p.classList.remove('active'));
      eventBtn.classList.add('active');
      const panel = document.querySelector('.mobile-tab-panel[data-tab="event"]');
      if (panel) panel.classList.add('active');
    }
  }

  updateHistoryBadge(count) {
    const badge = document.getElementById('historyBadge');
    if (badge) {
      if (count > 0) {
        badge.style.display = 'flex';
        badge.textContent = count > 99 ? '99+' : count;
      } else {
        badge.style.display = 'none';
      }
    }
  }

  clearHistoryBadge() {
    const badge = document.getElementById('historyBadge');
    if (badge) {
      badge.style.display = 'none';
    }
  }

  initPullToRebirth() {
    let touchStartY = 0;
    let touchStartTime = 0;
    
    document.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      const diff = e.changedTouches[0].clientY - touchStartY;
      const elapsed = Date.now() - touchStartTime;
      const isHomePage = document.getElementById('homePage').classList.contains('active');
      
      if (diff > 120 && elapsed < 500 && isHomePage && window.scrollY <= 5) {
        hapticFeedback(10);
        this.showRebirthPage();
      }
    }, { passive: true });
  }
}

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
  window.app = new LifeSimulatorApp();
});
