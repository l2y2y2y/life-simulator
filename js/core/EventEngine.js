/**
 * EventEngine.js
 * 事件引擎：管理事件池、触发逻辑和选择分支
 */

class EventEngine {
  constructor() {
    this.events = [];           // 所有事件
    this.triggeredEvents = [];  // 本局已触发的事件
    this.eventHistory = [];     // 事件历史记录
    this.currentEvent = null;   // 当前事件
    this.specialLines = {       // 特殊事件线状态
      xiuxian: false,
      system: false,
      comeback: false,
      timetravel: false,
      rebirth: false,
      entertainment: false
    };
    this.fragments = { xiuxian: 0, system: 0, timetravel: 0, comeback: 0, rebirth: 0, entertainment: 0 };
    this.deathReduction = 1;
    this.memories = {
      married: false,
      divorced: false,
      hasChild: false,
      childCount: 0,
      siblings: null,  // null=未确定, true=有, false=无
      parentsAlive: 2,  // 0-2
      educationLevel: 'none', // none/primary/middle/high/college/graduate
      currentJob: null,
      maxWealth: 0,
      relationships: [], // 记录关系人
      keyLifeEvents: []   // 记录关键人生节点
    };
  }

  /**
   * 加载事件数据
   * @param {Array} eventsData - 事件数据数组
   */
  loadEvents(eventsData) {
    this.events = eventsData || [];
  }

  /**
   * 重置引擎状态
   */
  reset() {
    this.triggeredEvents = [];
    this.eventHistory = [];
    this.currentEvent = null;
    this.specialLines = {
      xiuxian: false,
      system: false,
      comeback: false,
      timetravel: false,
      rebirth: false,
      entertainment: false
    };
    this.fragments = { xiuxian: 0, system: 0, timetravel: 0, comeback: 0, rebirth: 0, entertainment: 0 };
    this.deathReduction = 1;
    this.memories = {
      married: false, divorced: false, hasChild: false, childCount: 0,
      siblings: null, parentsAlive: 2, educationLevel: 'none',
      currentJob: null, maxWealth: 0, relationships: [], keyLifeEvents: []
    };
  }

  /**
   * 获取人生阶段
   * @param {number} age - 年龄
   * @returns {string} 阶段名称
   */
  getLifeStage(age) {
    if (age <= 3) return 'infant';
    if (age <= 12) return 'child';
    if (age <= 18) return 'teenager';
    if (age <= 30) return 'youth';
    if (age <= 50) return 'adult';
    if (age <= 70) return 'middle_aged';
    if (age <= 100) return 'elderly';
    return 'immortal';
  }

  /**
   * 获取阶段中文名
   * @param {string} stage - 阶段代码
   * @returns {string}
   */
  getStageName(stage) {
    const names = {
      'infant': '婴幼儿期',
      'child': '童年期',
      'teenager': '青少年期',
      'youth': '青年期',
      'adult': '壮年期',
      'middle_aged': '中老年期',
      'elderly': '老年期',
      'immortal': '修仙期'
    };
    return names[stage] || '未知阶段';
  }

  /**
   * 筛选可触发的事件
   * @param {number} age - 当前年龄
   * @param {AttributeSystem} attrSystem - 属性系统
   * @param {Array} talents - 当前天赋
   * @returns {Array} 候选事件列表
   */
  getCandidateEvents(age, attrSystem, talents) {
    const stage = this.getLifeStage(age);
    const candidates = [];

    this.events.forEach(event => {
      // 检查年龄范围
      if (event.min_age !== undefined && age < event.min_age) return;
      if (event.max_age !== undefined && age > event.max_age) return;

      // 检查阶段匹配
      if (event.stage && event.stage !== stage && event.stage !== 'special') return;

      // 检查属性条件
      if (event.trigger_conditions && !attrSystem.checkConditions(event.trigger_conditions)) return;

      // 检查天赋条件
      if (event.talent_requirements) {
        const hasTalent = event.talent_requirements.some(req => 
          talents.some(t => t.id === req)
        );
        if (!hasTalent) return;
      }

      // 检查特殊事件线（通用检查，支持所有special_line）
      if (event.special_line) {
        if (!this.specialLines[event.special_line]) return;
      }

      // 检查是否已触发过（同类型事件降低权重）
      const triggeredCount = this.triggeredEvents.filter(e => e.id === event.id).length;
      if (triggeredCount > 0 && !event.repeatable) return;

      // 计算权重
      let weight = event.trigger_weight || 100;

      // 属性加成
      if (event.event_type) {
        weight *= attrSystem.getEventWeightModifier(event.event_type);
      }

      // 已触发惩罚
      if (triggeredCount > 0) {
        weight *= Math.pow(0.5, triggeredCount);
      }

      candidates.push({
        ...event,
        calculatedWeight: weight
      });
    });

    return candidates;
  }

  /**
   * 按权重随机抽取事件
   * @param {Array} candidates - 候选事件
   * @param {number} count - 抽取数量
   * @returns {Array} 抽取的事件
   */
  drawEvents(candidates, count = 1) {
    if (candidates.length === 0) return [];

    const result = [];
    const pool = [...candidates];

    for (let i = 0; i < count && pool.length > 0; i++) {
      const totalWeight = pool.reduce((sum, e) => sum + e.calculatedWeight, 0);
      let random = Math.random() * totalWeight;

      for (let j = 0; j < pool.length; j++) {
        random -= pool[j].calculatedWeight;
        if (random <= 0) {
          result.push(pool[j]);
          pool.splice(j, 1);
          break;
        }
      }
    }

    return result;
  }

  /**
   * 触发年度事件
   * @param {number} age - 当前年龄
   * @param {AttributeSystem} attrSystem - 属性系统
   * @param {Array} talents - 天赋数组
   * @returns {Array} 触发的事件数组
   */
  triggerYearEvents(age, attrSystem, talents) {
    const candidates = this.getCandidateEvents(age, attrSystem, talents);
    
    // 每年触发0-2个事件
    const eventCount = Math.random() < 0.3 ? 0 : (Math.random() < 0.7 ? 1 : 2);
    
    const events = this.drawEvents(candidates, eventCount);
    
    events.forEach(event => {
      this.triggeredEvents.push(event);
      this.eventHistory.push({
        age: age,
        event: event,
        timestamp: Date.now()
      });
    });

    return events;
  }

  /**
   * 处理玩家选择
   * @param {Object} event - 当前事件
   * @param {number} choiceIndex - 选择索引
   * @param {AttributeSystem} attrSystem - 属性系统
   * @returns {Object} 结果对象
   */
  makeChoice(event, choiceIndex, attrSystem) {
    if (!event || !event.choices || choiceIndex >= event.choices.length) {
      return null;
    }

    const choice = event.choices[choiceIndex];

    // 检查选择条件
    if (choice.requirements && !attrSystem.checkConditions(choice.requirements)) {
      return {
        success: false,
        message: '不满足选择条件'
      };
    }

    // 应用效果（带±30%随机波动）
    if (choice.effects) {
      const randomizedEffects = {};
      for (const [key, value] of Object.entries(choice.effects)) {
        const variance = value * 0.3;
        randomizedEffects[key] = Math.round(value + (Math.random() * 2 - 1) * variance);
      }
      attrSystem.modifyAttributes(randomizedEffects);
    }

    // 检查是否触发特殊事件线
    if (choice.unlock_special_line) {
      this.specialLines[choice.unlock_special_line] = true;
    }

    // 更新记忆系统
    this.updateMemories(event, choice, attrSystem);

    return {
      success: true,
      outcomeText: choice.outcome_text || '事件结束',
      nextEvents: choice.next_events || [],
      effects: choice.effects || {}
    };
  }

  /**
   * 获取事件历史摘要
   * @returns {Array}
   */
  getEventHistorySummary() {
    return this.eventHistory.map(h => ({
      age: h.age,
      title: h.event.title,
      description: h.event.description
    }));
  }

  /**
   * 获取关键事件（带选择的）
   * @returns {Array}
   */
  getKeyEvents() {
    return this.eventHistory
      .filter(h => h.event.is_key_event)
      .map(h => ({
        age: h.age,
        title: h.event.title,
        description: h.event.description
      }));
  }

  /**
   * 检查是否触发特殊事件线
   * @param {Array} talents - 天赋
   * @param {AttributeSystem} attrSystem - 属性系统
   * @param {number} age - 年龄
   */
  checkSpecialLines(talents, attrSystem, age) {
    const attrs = attrSystem.attributes;

    // 检查机制型天赋效果
    const mechanicTalents = talents.filter(t => t.type === 'mechanic');
    for (const talent of mechanicTalents) {
      if (talent.mechanic === 'death_reduction') {
        // 逆天改命：设置死亡降低标记
        this.deathReduction = (this.deathReduction || 1) * (1 - (talent.mechanic_value || 0.3));
      }
    }

    // 修仙线
    if (!this.specialLines.xiuxian) {
      const hasXiuxianTalent = talents.some(t => 
        t.id === 't_xiuxian' || t.id === 't_linggen'
      );
      if (hasXiuxianTalent && attrs.constitution >= 8 && attrs.appearance >= 5) {
        this.specialLines.xiuxian = true;
      }
    }

    // 系统流
    if (!this.specialLines.system) {
      const hasSystemTalent = talents.some(t => t.id === 't_tianxuan');
      if (hasSystemTalent && attrs.luck >= 9) {
        this.specialLines.system = true;
      }
    }

    // 逆袭线
    if (!this.specialLines.comeback) {
      if (attrs.family <= 2 && attrs.intelligence >= 7 && age >= 13 && age <= 18) {
        this.specialLines.comeback = true;
      }
    }

    // 穿越线 — 极低概率触发
    if (!this.specialLines.timetravel) {
      if (attrs.luck >= 10 && Math.random() < 0.03) {
        this.specialLines.timetravel = true;
      }
    }

    // 重生线 — 极低概率触发
    if (!this.specialLines.rebirth) {
      if (age >= 5 && Math.random() < 0.02) {
        this.specialLines.rebirth = true;
      }
    }

    // 娱乐圈线
    if (!this.specialLines.entertainment) {
      if (attrs.appearance >= 8 && attrs.eq >= 6 && age >= 16) {
        this.specialLines.entertainment = true;
      }
    }

    // 保底触发：如果没有任何隐藏线激活，且年龄>=10，3%概率触发一条随机线
    const activeLines = Object.values(this.specialLines).filter(v => v).length;
    if (activeLines === 0 && age >= 10 && Math.random() < 0.03) {
      const lines = ['xiuxian', 'system', 'comeback', 'entertainment'];
      const line = lines[Math.floor(Math.random() * lines.length)];
      this.specialLines[line] = true;
    }

    // 自动收集已激活线的碎片
    for (const [line, active] of Object.entries(this.specialLines)) {
      if (active) {
        this.fragments[line] = Math.min(this.fragments[line] + 1, 10);
      }
    }
  }

  /**
   * 更新记忆系统
   * @param {Object} event - 当前事件
   * @param {Object} choice - 选择的选项
   * @param {AttributeSystem} attrSystem - 属性系统
   */
  updateMemories(event, choice, attrSystem) {
    // 记录关键事件到记忆
    if (event.is_key_event) {
      this.memories.keyLifeEvents.push({
        age: -1, // age will be set by caller
        title: event.title,
        choice: choice.text
      });
    }

    // 基于事件标题关键词推断记忆
    const title = event.title || '';
    const desc = event.description || '';
    const combined = title + desc;

    // 婚姻相关
    if (combined.includes('结婚') || combined.includes('求婚') || combined.includes('婚礼')) {
      this.memories.married = true;
    }
    if (combined.includes('离婚') || combined.includes('分手')) {
      if (this.memories.married) this.memories.divorced = true;
    }

    // 子女相关
    if (combined.includes('孩子') || combined.includes('出生') || combined.includes('当爸爸') || combined.includes('当妈妈') || combined.includes('生子')) {
      this.memories.hasChild = true;
      this.memories.childCount++;
    }

    // 亲属相关
    if (combined.includes('哥哥') || combined.includes('姐姐') || combined.includes('弟弟') || combined.includes('妹妹')) {
      if (this.memories.siblings === null) this.memories.siblings = true;
    }
    if (combined.includes('独生子') || combined.includes('独生女') || combined.includes('只有你一个孩子')) {
      this.memories.siblings = false;
    }

    // 父母去世
    if (combined.includes('父亲去世') || combined.includes('母亲去世') || combined.includes('父亲走了') || combined.includes('母亲走了') || combined.includes('父母')) {
      if (combined.includes('父亲')) this.memories.parentsAlive = Math.max(0, this.memories.parentsAlive - 1);
      if (combined.includes('母亲')) this.memories.parentsAlive = Math.max(0, this.memories.parentsAlive - 1);
    }

    // 教育相关
    if (combined.includes('上大学') || combined.includes('高考') || combined.includes('考入大学')) {
      this.memories.educationLevel = 'college';
    }
    if (combined.includes('读研') || combined.includes('考研') || combined.includes('研究生')) {
      this.memories.educationLevel = 'graduate';
    }
    if (combined.includes('辍学') || combined.includes('退学')) {
      // 保持当前学历
    }

    // 工作相关
    if (choice.effects && choice.effects.wealth && Math.abs(choice.effects.wealth) >= 10000) {
      if (combined.includes('升职') || combined.includes('加薪') || combined.includes('创业成功') || combined.includes('投资')) {
        this.memories.currentJob = title;
      }
    }

    // 财富峰值
    const currentWealth = attrSystem.hidden.wealth || 0;
    if (currentWealth > this.memories.maxWealth) {
      this.memories.maxWealth = currentWealth;
    }
  }

  /**
   * 序列化
   * @returns {Object}
   */
  serialize() {
    return {
      triggeredEvents: this.triggeredEvents,
      eventHistory: this.eventHistory,
      specialLines: this.specialLines
    };
  }

  /**
   * 反序列化
   * @param {Object} data
   */
  deserialize(data) {
    if (data.triggeredEvents) this.triggeredEvents = data.triggeredEvents;
    if (data.eventHistory) this.eventHistory = data.eventHistory;
    if (data.specialLines) this.specialLines = data.specialLines;
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EventEngine;
}
