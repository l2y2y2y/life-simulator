/**
 * AttributeSystem.js
 * 角色属性系统：管理6大基础属性和隐藏属性
 */

class AttributeSystem {
  constructor() {
    // 6大基础属性
    this.attributes = {
      appearance: 5,  // 颜值
      intelligence: 5, // 智力
      constitution: 5, // 体质
      family: 5,       // 家境
      eq: 5,           // 情商
      luck: 5          // 运气
    };

    // 隐藏属性
    this.hidden = {
      happiness: 50,   // 快乐值 0-100
      stress: 0,       // 压力值 0-100
      health: 100,     // 健康值 0-100
      wealth: 0        // 财富值
    };

    // 属性上限（可被天赋修正）
    this.maxAttributes = {
      appearance: 10,
      intelligence: 10,
      constitution: 10,
      family: 10,
      eq: 10,
      luck: 10
    };

    // 属性名称映射（中文）
    this.attributeNames = {
      appearance: '颜值',
      intelligence: '智力',
      constitution: '体质',
      family: '家境',
      eq: '情商',
      luck: '运气'
    };

    // 历史记录（用于计算平均值）
    this.happinessHistory = [];
  }

  /**
   * 重置所有属性
   */
  reset() {
    this.attributes = {
      appearance: 5,
      intelligence: 5,
      constitution: 5,
      family: 5,
      eq: 5,
      luck: 5
    };
    this.hidden = {
      happiness: 50,
      stress: 0,
      health: 100,
      wealth: this.attributes.family * 10000
    };
    this.happinessHistory = [];
    this.maxAttributes = {
      appearance: 10,
      intelligence: 10,
      constitution: 10,
      family: 10,
      eq: 10,
      luck: 10
    };
  }

  /**
   * 设置初始属性（从属性分配界面）
   * @param {Object} attrs - 属性对象
   */
  setInitialAttributes(attrs) {
    Object.keys(attrs).forEach(key => {
      if (this.attributes.hasOwnProperty(key)) {
        this.attributes[key] = Math.min(attrs[key], this.maxAttributes[key]);
      }
    });
    // 根据家境初始化财富
    this.hidden.wealth = this.attributes.family * 10000;
    this.hidden.health = this.attributes.constitution * 10;
  }

  /**
   * 应用天赋效果
   * @param {Array} talents - 天赋数组
   */
  applyTalents(talents) {
    if (!talents || !Array.isArray(talents)) return;

    talents.forEach(talent => {
      if (talent.effects) {
        Object.keys(talent.effects).forEach(key => {
          if (key.endsWith('_max')) {
            // 修正上限
            const attrKey = key.replace('_max', '');
            if (this.maxAttributes.hasOwnProperty(attrKey)) {
              this.maxAttributes[attrKey] += talent.effects[key];
            }
          } else if (this.attributes.hasOwnProperty(key)) {
            // 修正属性值
            this.attributes[key] = Math.min(
              this.attributes[key] + talent.effects[key],
              this.maxAttributes[key]
            );
            this.attributes[key] = Math.max(this.attributes[key], 0);
          }
        });
      }
    });
  }

  /**
   * 修改属性值
   * @param {Object} effects - 属性变化对象
   */
  modifyAttributes(effects) {
    if (!effects) return;

    Object.keys(effects).forEach(key => {
      if (this.attributes.hasOwnProperty(key)) {
        this.attributes[key] += effects[key];
        this.attributes[key] = Math.min(this.attributes[key], this.maxAttributes[key]);
        this.attributes[key] = Math.max(this.attributes[key], 0);
      } else if (this.hidden.hasOwnProperty(key)) {
        this.hidden[key] += effects[key];
        if (key === 'happiness' || key === 'stress' || key === 'health') {
          this.hidden[key] = Math.min(this.hidden[key], 100);
          this.hidden[key] = Math.max(this.hidden[key], 0);
        }
      }
    });

    // 记录快乐值历史
    if (effects.happiness !== undefined) {
      this.happinessHistory.push(this.hidden.happiness);
    }
  }

  /**
   * 年龄增长时的自然衰减
   * @param {number} age - 当前年龄
   */
  ageEffect(age) {
    // 健康值随年龄自然下降
    if (age > 30) {
      const decline = Math.floor((age - 30) / 10);
      this.hidden.health = Math.max(this.hidden.health - decline, 0);
    }

    // 压力值自然衰减
    this.hidden.stress = Math.max(this.hidden.stress - 2, 0);

    // 记录当前快乐值
    this.happinessHistory.push(this.hidden.happiness);
  }

  /**
   * 检查是否满足属性条件
   * @param {Object} conditions - 条件对象 {attr: {min, max}}
   * @returns {boolean}
   */
  checkConditions(conditions) {
    if (!conditions) return true;

    return Object.keys(conditions).every(key => {
      const condition = conditions[key];
      const value = this.attributes[key];

      if (condition.min !== undefined && value < condition.min) return false;
      if (condition.max !== undefined && value > condition.max) return false;
      return true;
    });
  }

  /**
   * 计算事件触发权重修正
   * @param {string} eventType - 事件类型
   * @returns {number} 修正系数
   */
  getEventWeightModifier(eventType) {
    const modifiers = {
      'health': this.attributes.constitution / 5,
      'education': this.attributes.intelligence / 5,
      'social': (this.attributes.eq + this.attributes.appearance) / 10,
      'family': this.attributes.family / 5,
      'career': (this.attributes.intelligence + this.attributes.eq) / 10,
      'adventure': this.attributes.luck / 5,
      'special': this.attributes.luck / 5
    };

    return modifiers[eventType] || 1.0;
  }

  /**
   * 计算死亡概率
   * @param {number} age - 当前年龄
   * @returns {number} 0-1之间的概率
   */
  calculateDeathProbability(age) {
    let baseProbability = 0;

    if (age <= 10) baseProbability = 0.02;
    else if (age <= 30) baseProbability = 0.01;
    else if (age <= 50) baseProbability = 0.03;
    else if (age <= 70) baseProbability = 0.08;
    else if (age <= 90) baseProbability = 0.20;
    else if (age <= 100) baseProbability = 0.40;
    else baseProbability = 0.60;

    // 体质修正
    const constitutionModifier = this.attributes.constitution < 5 ? 2 : 1;
    // 健康值修正
    const healthModifier = this.hidden.health < 30 ? 2 : 1;
    // 压力修正
    const stressModifier = this.hidden.stress > 80 ? 1.5 : 1;

    return Math.min(baseProbability * constitutionModifier * healthModifier * stressModifier, 1.0);
  }

  /**
   * 获取平均快乐值
   * @returns {number}
   */
  getAverageHappiness() {
    if (this.happinessHistory.length === 0) return this.hidden.happiness;
    const sum = this.happinessHistory.reduce((a, b) => a + b, 0);
    return sum / this.happinessHistory.length;
  }

  /**
   * 获取当前属性快照
   * @returns {Object}
   */
  getSnapshot() {
    return {
      attributes: { ...this.attributes },
      hidden: { ...this.hidden },
      maxAttributes: { ...this.maxAttributes }
    };
  }

  /**
   * 序列化（用于保存）
   * @returns {Object}
   */
  serialize() {
    return {
      attributes: this.attributes,
      hidden: this.hidden,
      maxAttributes: this.maxAttributes,
      happinessHistory: this.happinessHistory
    };
  }

  /**
   * 反序列化
   * @param {Object} data
   */
  deserialize(data) {
    if (data.attributes) this.attributes = data.attributes;
    if (data.hidden) this.hidden = data.hidden;
    if (data.maxAttributes) this.maxAttributes = data.maxAttributes;
    if (data.happinessHistory) this.happinessHistory = data.happinessHistory;
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AttributeSystem;
}
