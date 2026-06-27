/**
 * ScoringSystem.js
 * 评分系统：计算人生综合评分和称号
 */

class ScoringSystem {
  constructor() {
    this.achievements = [];      // 所有成就定义
    this.unlockedAchievements = []; // 已解锁成就
    this.scoreHistory = [];      // 分数历史
  }

  /**
   * 加载成就数据
   * @param {Array} achievementsData
   */
  loadAchievements(achievementsData) {
    this.achievements = achievementsData || [];
  }

  /**
   * 计算综合评分
   * @param {Object} gameState - 游戏状态
   * @returns {Object} 评分结果
   */
  calculateScore(gameState) {
    const { age, attributes, hidden, memories, specialLines, fragments } = gameState;
    const scores = {};

    // 基础分
    scores.base = 20;

    // 寿命分 (0-15)
    scores.longevity = Math.min(15, Math.floor(age * 15 / 100));

    // 财富分 (0-15)
    scores.wealth = Math.min(15, Math.floor(Math.log10(Math.max(1, (hidden && hidden.wealth) || 0) + 1) * 7.5));

    // 幸福分 (0-10)
    scores.happiness = Math.min(10, Math.floor(((hidden && hidden.happiness) || 50) / 10));

    // 人际分 (0-15)
    let relationScore = 0;
    if (memories) {
      if (memories.married) relationScore += 5;
      if (memories.hasChild) relationScore += 3;
      if (memories.married && !memories.divorced) relationScore += 2;
      if (memories.siblings === true) relationScore += 2;
      if (memories.siblings === null) relationScore += 1;
      if (memories.parentsAlive > 0) relationScore += Math.min(3, memories.parentsAlive);
    }
    scores.relationship = Math.min(15, relationScore);

    // 事业分 (0-15)
    let careerScore = 0;
    if (memories) {
      if (memories.educationLevel === 'college') careerScore += 5;
      if (memories.educationLevel === 'graduate') careerScore += 8;
      if (memories.educationLevel === 'high') careerScore += 3;
      if ((memories.maxWealth || 0) > 100000) careerScore += 4;
      if ((memories.maxWealth || 0) > 500000) careerScore += 3;
    }
    scores.career = Math.min(15, careerScore);

    // 探索分 (0-10)
    let exploreScore = 0;
    if (specialLines) {
      const activeLines = Object.values(specialLines).filter(v => v).length;
      exploreScore += Math.min(6, activeLines * 2);
    }
    if (fragments) {
      const totalFragments = Object.values(fragments).reduce((s, v) => s + v, 0);
      exploreScore += Math.min(4, Math.floor(totalFragments / 5));
    }
    scores.exploration = Math.min(10, exploreScore);

    // 难度修正
    const modeMultiplier = { normal: 1, hard: 1.5, hell: 2.0 };
    const multiplier = modeMultiplier[gameState.mode] || 1;

    const totalScore = Math.round(
      (scores.base + scores.longevity + scores.wealth + scores.happiness +
       scores.relationship + scores.career + scores.exploration) * multiplier
    );

    // 结局称号
    const title = this.getTitle(totalScore, age, (hidden && hidden.wealth) || 0, gameState.achievements);

    // 标签
    const tags = this.generateTags(gameState);

    return {
      totalScore,
      scores,
      title: title.main,
      subTitle: title.sub,
      tags,
      breakdown: {
        '基础分': scores.base,
        '寿命': scores.longevity,
        '财富': scores.wealth,
        '幸福': scores.happiness,
        '人际': scores.relationship,
        '事业': scores.career,
        '探索': scores.exploration,
        '难度加成': multiplier > 1 ? `×${multiplier}` : '×1'
      }
    };
  }

  /**
   * 获取难度修正系数
   * @param {string} mode - 游戏模式
   * @returns {number}
   */
  getDifficultyModifier(mode) {
    const modifiers = {
      'normal': 1.0,
      'hard': 1.5,
      'hell': 2.0
    };
    return modifiers[mode] || 1.0;
  }

  /**
   * 获取人生称号
   * @param {number} score - 总分
   * @param {number} age - 年龄
   * @param {number} wealth - 财富
   * @param {Array} achievements - 成就
   * @returns {Object} {main, sub}
   */
  getTitle(score, age, wealth, achievements) {
    let main = '';
    let sub = '';

    // 主称号（基于总分）
    if (score >= 120) {
      main = '传奇人生';
    } else if (score >= 100) {
      main = '精彩人生';
    } else if (score >= 80) {
      main = '幸福人生';
    } else if (score >= 60) {
      main = '平凡人生';
    } else if (score >= 40) {
      main = '坎坷人生';
    } else if (score >= 20) {
      main = '悲惨人生';
    } else {
      main = '地狱人生';
    }

    // 副称号（基于特殊条件）
    if (age >= 100) {
      sub = '百岁老人';
    } else if (age <= 20) {
      sub = '英年早逝';
    } else if (wealth >= 1000000) {
      sub = '亿万富翁';
    } else if (wealth <= 0) {
      sub = '一贫如洗';
    }

    // 成就称号优先
    if (achievements && achievements.length > 0) {
      const specialAchievements = achievements.filter(a => a.type === 'special');
      if (specialAchievements.length > 0) {
        sub = specialAchievements[0].title;
      }
    }

    return { main, sub };
  }

  /**
   * 生成人生标签
   * @param {Object} gameState
   * @returns {Array}
   */
  generateTags(gameState) {
    const tags = [];
    const { age, attributes, hidden, eventHistory, talents, memories } = gameState;

    // 基于属性的标签
    if (attributes.appearance >= 8) tags.push('颜值担当');
    if (attributes.intelligence >= 8) tags.push('学霸');
    if (attributes.constitution >= 8) tags.push('运动健将');
    if (attributes.family >= 8) tags.push('富二代');
    if (attributes.eq >= 8) tags.push('社交达人');
    if (attributes.luck >= 8) tags.push('锦鲤附体');

    if (attributes.appearance <= 2) tags.push('其貌不扬');
    if (attributes.intelligence <= 2) tags.push('学渣');
    if (attributes.constitution <= 2) tags.push('病秧子');
    if (attributes.family <= 2) tags.push('寒门学子');

    // 基于年龄的标签
    if (age >= 100) tags.push('长寿之星');
    if (age <= 30) tags.push('英年早逝');

    // 基于财富的标签
    if (hidden.wealth >= 10000000) tags.push('富豪');
    if (hidden.wealth <= 0) tags.push('月光族');

    // 基于天赋的标签
    if (talents) {
      talents.forEach(t => {
        if (t.id === 't_xiuxian' || t.id === 't_linggen') tags.push('修仙者');
        if (t.id === 't_tianxuan') tags.push('天选之子');
      });
    }

    // 基于事件的标签
    if (eventHistory) {
      const hasMarriage = eventHistory.some(h => h.event.tags && h.event.tags.includes('婚姻'));
      const hasDivorce = eventHistory.some(h => h.event.tags && h.event.tags.includes('离婚'));
      const hasCrime = eventHistory.some(h => h.event.tags && h.event.tags.includes('犯罪'));

      if (hasMarriage && !hasDivorce) tags.push('婚姻美满');
      if (hasDivorce) tags.push('离婚大师');
      if (hasCrime) tags.push('法外狂徒');
    }

    // 基于记忆的标签
    if (memories) {
      // 计算简易人际分
      let relScore = 0;
      if (memories.married) relScore += 5;
      if (memories.hasChild) relScore += 3;
      if (memories.married && !memories.divorced) relScore += 2;
      if (memories.siblings === true) relScore += 2;
      if (memories.siblings === null) relScore += 1;
      if (memories.parentsAlive > 0) relScore += Math.min(3, memories.parentsAlive);

      // 计算简易事业分
      let carScore = 0;
      if (memories.educationLevel === 'college') carScore += 5;
      if (memories.educationLevel === 'graduate') carScore += 8;
      if (memories.educationLevel === 'high') carScore += 3;
      if ((memories.maxWealth || 0) > 100000) carScore += 4;
      if ((memories.maxWealth || 0) > 500000) carScore += 3;

      if (relScore >= 10) tags.push('人缘爆棚');
      if (relScore >= 7) tags.push('社交达人');
      if (carScore >= 10) tags.push('事业有成');
      if (carScore >= 7) tags.push('职场精英');
    }
    // 探索标签（基于 specialLines 和 fragments）
    const { specialLines, fragments } = gameState;
    if (specialLines) {
      const activeLines = Object.values(specialLines).filter(v => v).length;
      if (activeLines >= 3) tags.push('命运探索者');
      if (activeLines >= 2) tags.push('好奇心旺盛');
    }

    // 限制标签数量
    return tags.slice(0, 5);
  }

  /**
   * 检查成就解锁
   * @param {Object} gameState
   * @returns {Array} 新解锁的成就
   */
  checkAchievements(gameState) {
    const newAchievements = [];
    const { age, attributes, hidden, eventHistory, talents, mode } = gameState;

    this.achievements.forEach(achievement => {
      // 检查是否已解锁
      if (this.unlockedAchievements.some(a => a.id === achievement.id)) {
        return;
      }

      // 检查条件
      let unlocked = false;

      switch (achievement.condition_type) {
        case 'age':
          unlocked = age >= achievement.condition_value;
          break;
        case 'attribute':
          unlocked = attributes[achievement.condition_key] >= achievement.condition_value;
          break;
        case 'wealth':
          unlocked = hidden.wealth >= achievement.condition_value;
          break;
        case 'event':
          unlocked = eventHistory.some(h => 
            h.event.id === achievement.condition_event
          );
          break;
        case 'talent':
          unlocked = talents.some(t => t.id === achievement.condition_talent);
          break;
        case 'score':
          // 在游戏结束后检查
          break;
        case 'special':
          unlocked = this.checkSpecialAchievement(achievement, gameState);
          break;
      }

      if (unlocked) {
        this.unlockedAchievements.push(achievement);
        newAchievements.push(achievement);
      }
    });

    return newAchievements;
  }

  /**
   * 检查特殊成就
   * @param {Object} achievement
   * @param {Object} gameState
   * @returns {boolean}
   */
  checkSpecialAchievement(achievement, gameState) {
    const { age, attributes, eventHistory } = gameState;

    switch (achievement.id) {
      case 'a_xiuxian':
        return age >= 100 && attributes.constitution >= 15;
      case 'a_poor_genius':
        return attributes.family <= 2 && attributes.intelligence >= 9;
      case 'a_lucky_star':
        return attributes.luck >= 10;
      case 'a_all_love':
        return attributes.appearance >= 9 && attributes.eq >= 9;
      default:
        return false;
    }
  }

  /**
   * 获取已解锁成就
   * @returns {Array}
   */
  getUnlockedAchievements() {
    return this.unlockedAchievements;
  }

  /**
   * 获取成就进度
   * @returns {Object}
   */
  getAchievementProgress() {
    return {
      total: this.achievements.length,
      unlocked: this.unlockedAchievements.length,
      percentage: Math.round((this.unlockedAchievements.length / this.achievements.length) * 100)
    };
  }

  /**
   * 保存分数历史
   * @param {Object} scoreResult
   */
  saveScore(scoreResult) {
    this.scoreHistory.push({
      score: scoreResult.totalScore,
      age: scoreResult.age,
      title: scoreResult.title,
      date: new Date().toISOString()
    });

    // 只保留最近50条
    if (this.scoreHistory.length > 50) {
      this.scoreHistory = this.scoreHistory.slice(-50);
    }
  }

  /**
   * 获取最高分
   * @returns {number}
   */
  getHighestScore() {
    if (this.scoreHistory.length === 0) return 0;
    return Math.max(...this.scoreHistory.map(s => s.score));
  }

  /**
   * 获取平均分数
   * @returns {number}
   */
  getAverageScore() {
    if (this.scoreHistory.length === 0) return 0;
    const sum = this.scoreHistory.reduce((a, b) => a + b.score, 0);
    return Math.round(sum / this.scoreHistory.length);
  }

  /**
   * 序列化
   * @returns {Object}
   */
  serialize() {
    return {
      unlockedAchievements: this.unlockedAchievements,
      scoreHistory: this.scoreHistory
    };
  }

  /**
   * 反序列化
   * @param {Object} data
   */
  deserialize(data) {
    if (data.unlockedAchievements) this.unlockedAchievements = data.unlockedAchievements;
    if (data.scoreHistory) this.scoreHistory = data.scoreHistory;
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScoringSystem;
}
