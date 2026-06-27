/**
 * GameManager.js
 * 游戏主管理器：协调各个系统，管理游戏流程
 */

class GameManager {
  constructor() {
    this.attrSystem = new AttributeSystem();
    this.eventEngine = new EventEngine();
    this.scoringSystem = new ScoringSystem();

    this.gameState = {
      isPlaying: false,
      isPaused: false,
      age: 0,
      talents: [],
      mode: 'normal',
      currentEvents: [],
      waitingForChoice: false,
      gameOver: false,
      lifeCount: 0
    };

    this.callbacks = {
      onAgeChange: null,
      onEvent: null,
      onChoice: null,
      onGameOver: null,
      onAchievement: null
    };

    this.autoPlayInterval = null;
  }

  /**
   * 初始化游戏
   * @param {Object} config - 配置对象
   */
  init(config = {}) {
    // 加载数据
    if (config.events) {
      this.eventEngine.loadEvents(config.events);
    }
    if (config.achievements) {
      this.scoringSystem.loadAchievements(config.achievements);
    }

    // 加载存档
    this.loadSaveData();
  }

  /**
   * 开始新游戏
   * @param {Array} talents - 选择的天赋
   * @param {Object} attributes - 分配的属性
   * @param {string} mode - 游戏模式
   */
  startNewGame(talents, attributes, mode = 'normal') {
    // 重置系统
    this.attrSystem.reset();
    this.eventEngine.reset();

    // 设置游戏状态
    this.gameState = {
      isPlaying: true,
      isPaused: false,
      age: 0,
      talents: talents || [],
      mode: mode,
      currentEvents: [],
      waitingForChoice: false,
      gameOver: false,
      lifeCount: this.gameState.lifeCount + 1
    };

    // 应用天赋效果
    this.attrSystem.applyTalents(talents);

    // 设置初始属性
    this.attrSystem.setInitialAttributes(attributes);

    // 触发出生事件
    this.triggerBirthEvent();

    // 开始自动推演
    this.startAutoPlay();
  }

  /**
   * 触发出生事件
   */
  triggerBirthEvent() {
    const birthEvent = {
      id: 'birth',
      title: '出生',
      description: `你出生了！${this.getBirthDescription()}`,
      choices: []
    };

    this.gameState.currentEvents = [birthEvent];
    this.notifyEvent(birthEvent);
  }

  /**
   * 获取出生描述
   * @returns {string}
   */
  getBirthDescription() {
    const attrs = this.attrSystem.attributes;
    const descriptions = [];

    if (attrs.family >= 8) {
      descriptions.push('家境优渥，含着金汤匙出生');
    } else if (attrs.family <= 2) {
      descriptions.push('家境贫寒，但父母对你充满期待');
    } else {
      descriptions.push('在一个普通的家庭中');
    }

    if (attrs.constitution >= 8) {
      descriptions.push('身体健康，哭声洪亮');
    } else if (attrs.constitution <= 2) {
      descriptions.push('体质较弱，需要精心照料');
    }

    if (attrs.luck >= 8) {
      descriptions.push('似乎天生就带着好运');
    }

    return descriptions.join('，') + '。';
  }

  /**
   * 开始自动推演
   */
  startAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }

    this.autoPlayInterval = setInterval(() => {
      if (!this.gameState.isPlaying || this.gameState.isPaused || this.gameState.waitingForChoice) {
        return;
      }

      this.advanceYear();
    }, 800); // 每年800毫秒
  }

  /**
   * 停止自动推演
   */
  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }

  /**
   * 推进一年
   */
  advanceYear() {
    if (this.gameState.gameOver) return;

    // 年龄增长
    this.gameState.age++;

    // 应用年龄效果
    this.attrSystem.ageEffect(this.gameState.age);

    // 检查特殊事件线
    this.eventEngine.checkSpecialLines(
      this.gameState.talents,
      this.attrSystem,
      this.gameState.age
    );

    // 属性联动：检查被动效果
    this.checkAttributeSynergies();

    // 死亡预警：健康<40时触发预警事件
    this.checkHealthWarning();

    // 检查死亡
    if (this.checkDeath()) {
      this.gameOver();
      return;
    }

    // 触发年度事件
    const events = this.eventEngine.triggerYearEvents(
      this.gameState.age,
      this.attrSystem,
      this.gameState.talents
    );

    // 处理事件
    if (events.length > 0) {
      // 检查是否有需要选择的事件
      const choiceEvents = events.filter(e => e.choices && e.choices.length > 0);
      
      if (choiceEvents.length > 0) {
        // 暂停自动推演，等待玩家选择
        this.gameState.waitingForChoice = true;
        this.gameState.currentEvents = choiceEvents;
        this.notifyEvent(choiceEvents[0]);
      } else {
        // 自动处理无选择事件
        events.forEach(event => {
          this.notifyEvent(event);
        });
      }
    }

    // 通知年龄变化
    this.notifyAgeChange();
  }

  /**
   * 检查属性联动被动效果
   */
  checkAttributeSynergies() {
    const attrs = this.attrSystem.attributes;
    
    // 学霸模式：智力>=8，每5年额外+1智力
    if (attrs.intelligence >= 8 && this.gameState.age % 5 === 0) {
      this.attrSystem.modifyAttributes({ intelligence: 1 });
    }
    
    // 万人迷：颜值+情商>=15，每5年快乐+5
    if (attrs.appearance + attrs.eq >= 15 && this.gameState.age % 5 === 0) {
      this.attrSystem.modifyAttributes({ happiness: 5 });
    }
    
    // 锦鲤附体：运气>=10，每3年随机获得正面效果
    if (attrs.luck >= 10 && this.gameState.age % 3 === 0) {
      const luckyEffects = [
        { wealth: 5000 }, { happiness: 8 }, { intelligence: 1 },
        { constitution: 1 }, { appearance: 1 }, { family: 1 }
      ];
      const effect = luckyEffects[Math.floor(Math.random() * luckyEffects.length)];
      this.attrSystem.modifyAttributes(effect);
    }
    
    // 体弱多病：体质<=2，每年健康-5
    if (attrs.constitution <= 2) {
      this.attrSystem.modifyAttributes({ health: -5 });
    }
    
    // 社交困难：情商<=2，每年快乐-3
    if (attrs.eq <= 2) {
      this.attrSystem.modifyAttributes({ happiness: -3 });
    }
  }

  /**
   * 健康预警检查
   */
  checkHealthWarning() {
    const health = this.attrSystem.hidden.health || 70;
    
    // 健康严重警告（<25）- 触发住院事件
    if (health < 25 && Math.random() < 0.3) {
      const warningEvent = {
        id: 'health_critical',
        title: '身体严重不适',
        description: '你的身体状况非常糟糕，感觉随时可能倒下。',
        is_key_event: true,
        choices: [
          {
            text: '去医院接受治疗（花费一些积蓄）',
            outcome_text: '你住院接受了治疗，虽然花了些钱，但身体状况有所好转。',
            effects: { health: 30, wealth: -5000, happiness: -5 }
          },
          {
            text: '咬牙硬撑',
            outcome_text: '你选择硬扛，但身体状况持续恶化...',
            effects: { health: -15, happiness: -10 }
          }
        ]
      };
      this.gameState.waitingForChoice = true;
      this.gameState.currentEvents = [warningEvent];
      this.notifyEvent(warningEvent);
    }
    // 健康警告（25-40）
    else if (health < 40 && Math.random() < 0.15) {
      const warningEvent = {
        id: 'health_warning',
        title: '身体不适',
        description: '你最近总觉得身体哪里不对劲，要不要去检查一下？',
        choices: [
          {
            text: '去医院体检',
            outcome_text: '医生说了一些注意事项，你开始注意保养身体。',
            effects: { health: 15, wealth: -1000 }
          },
          {
            text: '应该没什么大事，继续工作',
            outcome_text: '你选择了忽视身体的信号...',
            effects: { health: -5, stress: 5 }
          }
        ]
      };
      this.gameState.waitingForChoice = true;
      this.gameState.currentEvents = [warningEvent];
      this.notifyEvent(warningEvent);
    }
  }

  /**
   * 检查是否死亡
   * @returns {boolean}
   */
  checkDeath() {
    let deathProbability = this.attrSystem.calculateDeathProbability(this.gameState.age);
    // 应用逆天改命天赋效果
    const reduction = this.eventEngine.deathReduction || 1;
    deathProbability *= reduction;
    return Math.random() < deathProbability;
  }

  /**
   * 处理玩家选择
   * @param {number} choiceIndex - 选择索引
   */
  makeChoice(choiceIndex) {
    if (!this.gameState.waitingForChoice || this.gameState.currentEvents.length === 0) {
      return;
    }

    const currentEvent = this.gameState.currentEvents[0];
    const result = this.eventEngine.makeChoice(
      currentEvent,
      choiceIndex,
      this.attrSystem
    );

    if (result && result.success) {
      // 通知选择结果
      this.notifyChoice(result);

      // 继续推演
      this.gameState.waitingForChoice = false;
      this.gameState.currentEvents = [];

      // 检查是否触发连锁事件
      if (result.nextEvents && result.nextEvents.length > 0) {
        // 可以在这里处理连锁事件
      }
    }
  }

  /**
   * 游戏结束
   */
  gameOver() {
    this.gameState.gameOver = true;
    this.gameState.isPlaying = false;
    this.stopAutoPlay();

    // 计算最终评分
    const gameState = this.getCurrentGameState();
    const scoreResult = this.scoringSystem.calculateScore(gameState);

    // 检查成就
    const newAchievements = this.scoringSystem.checkAchievements(gameState);

    // 保存分数
    this.scoringSystem.saveScore(scoreResult);

    // 保存游戏数据
    this.saveGameData();

    // 通知游戏结束
    this.notifyGameOver({
      ...scoreResult,
      newAchievements,
      eventHistory: this.eventEngine.getEventHistorySummary(),
      keyEvents: this.eventEngine.getKeyEvents()
    });
  }

  /**
   * 获取当前游戏状态
   * @returns {Object}
   */
  getCurrentGameState() {
    return {
      age: this.gameState.age,
      attributes: this.attrSystem.attributes,
      hidden: this.attrSystem.hidden,
      eventHistory: this.eventEngine.eventHistory,
      talents: this.gameState.talents,
      mode: this.gameState.mode,
      achievements: this.scoringSystem.getUnlockedAchievements(),
      memories: this.eventEngine.memories,
      specialLines: this.eventEngine.specialLines,
      fragments: this.eventEngine.fragments
    };
  }

  /**
   * 暂停游戏
   */
  pause() {
    this.gameState.isPaused = true;
  }

  /**
   * 恢复游戏
   */
  resume() {
    this.gameState.isPaused = false;
  }

  /**
   * 快速跳过到下一个选择事件
   */
  skipToNextChoice() {
    if (!this.gameState.isPlaying || this.gameState.waitingForChoice) return;

    // 临时加快推演速度
    this.stopAutoPlay();

    const fastForward = setInterval(() => {
      if (this.gameState.waitingForChoice || this.gameState.gameOver) {
        clearInterval(fastForward);
        if (!this.gameState.gameOver) {
          this.startAutoPlay();
        }
        return;
      }

      this.advanceYear();
    }, 100);
  }

  /**
   * 注册回调函数
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  on(event, callback) {
    if (this.callbacks.hasOwnProperty(event)) {
      this.callbacks[event] = callback;
    }
  }

  /**
   * 通知年龄变化
   */
  notifyAgeChange() {
    if (this.callbacks.onAgeChange) {
      this.callbacks.onAgeChange({
        age: this.gameState.age,
        stage: this.eventEngine.getLifeStage(this.gameState.age),
        stageName: this.eventEngine.getStageName(this.eventEngine.getLifeStage(this.gameState.age)),
        attributes: this.attrSystem.getSnapshot()
      });
    }
  }

  /**
   * 通知事件
   * @param {Object} event
   */
  notifyEvent(event) {
    if (this.callbacks.onEvent) {
      this.callbacks.onEvent(event);
    }
  }

  /**
   * 通知选择结果
   * @param {Object} result
   */
  notifyChoice(result) {
    if (this.callbacks.onChoice) {
      this.callbacks.onChoice(result);
    }
  }

  /**
   * 通知游戏结束
   * @param {Object} result
   */
  notifyGameOver(result) {
    if (this.callbacks.onGameOver) {
      this.callbacks.onGameOver(result);
    }
  }

  /**
   * 通知成就解锁
   * @param {Array} achievements
   */
  notifyAchievement(achievements) {
    if (this.callbacks.onAchievement) {
      this.callbacks.onAchievement(achievements);
    }
  }

  /**
   * 保存游戏数据到本地存储
   */
  saveGameData() {
    try {
      const saveData = {
        scoringSystem: this.scoringSystem.serialize(),
        gameState: {
          lifeCount: this.gameState.lifeCount
        }
      };
      localStorage.setItem('lifeSimulator_save', JSON.stringify(saveData));
    } catch (e) {
      console.warn('保存游戏数据失败:', e);
    }
  }

  /**
   * 加载存档数据
   */
  loadSaveData() {
    try {
      const saveData = localStorage.getItem('lifeSimulator_save');
      if (saveData) {
        const parsed = JSON.parse(saveData);
        if (parsed.scoringSystem) {
          this.scoringSystem.deserialize(parsed.scoringSystem);
        }
        if (parsed.gameState) {
          this.gameState.lifeCount = parsed.gameState.lifeCount || 0;
        }
      }
    } catch (e) {
      console.warn('加载游戏数据失败:', e);
    }
  }

  /**
   * 获取游戏统计
   * @returns {Object}
   */
  getStatistics() {
    return {
      lifeCount: this.gameState.lifeCount,
      highestScore: this.scoringSystem.getHighestScore(),
      averageScore: this.scoringSystem.getAverageScore(),
      achievementProgress: this.scoringSystem.getAchievementProgress()
    };
  }

  /**
   * 销毁游戏
   */
  destroy() {
    this.stopAutoPlay();
    this.callbacks = {};
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GameManager;
}
