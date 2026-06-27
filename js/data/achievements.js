/**
 * achievements.js
 * 成就数据配置
 */

const ACHIEVEMENTS_DATA = [
  // 寿命类
  {
    id: 'a_longlife',
    name: '长寿之星',
    description: '活到80岁以上',
    type: 'lifespan',
    condition_type: 'age',
    condition_value: 80,
    icon: '⭐'
  },
  {
    id: 'a_centenarian',
    name: '百岁老人',
    description: '活到100岁以上',
    type: 'lifespan',
    condition_type: 'age',
    condition_value: 100,
    icon: '👴'
  },
  {
    id: 'a_young_death',
    name: '英年早逝',
    description: '30岁前去世',
    type: 'lifespan',
    condition_type: 'age',
    condition_value: 30,
    icon: '💀'
  },

  // 属性类
  {
    id: 'a_beauty',
    name: '绝世美颜',
    description: '颜值达到10',
    type: 'attribute',
    condition_type: 'attribute',
    condition_key: 'appearance',
    condition_value: 10,
    icon: '💎'
  },
  {
    id: 'a_genius',
    name: '天才少年',
    description: '智力达到10',
    type: 'attribute',
    condition_type: 'attribute',
    condition_key: 'intelligence',
    condition_value: 10,
    icon: '🧠'
  },
  {
    id: 'a_athlete',
    name: '运动健将',
    description: '体质达到10',
    type: 'attribute',
    condition_type: 'attribute',
    condition_key: 'constitution',
    condition_value: 10,
    icon: '💪'
  },
  {
    id: 'a_rich',
    name: '富二代',
    description: '家境达到10',
    type: 'attribute',
    condition_type: 'attribute',
    condition_key: 'family',
    condition_value: 10,
    icon: '💰'
  },
  {
    id: 'a_social',
    name: '社交达人',
    description: '情商达到10',
    type: 'attribute',
    condition_type: 'attribute',
    condition_key: 'eq',
    condition_value: 10,
    icon: '🤝'
  },
  {
    id: 'a_lucky',
    name: '锦鲤附体',
    description: '运气达到10',
    type: 'attribute',
    condition_type: 'attribute',
    condition_key: 'luck',
    condition_value: 10,
    icon: '🍀'
  },

  // 财富类
  {
    id: 'a_millionaire',
    name: '百万富翁',
    description: '财富达到100万',
    type: 'wealth',
    condition_type: 'wealth',
    condition_value: 1000000,
    icon: '💵'
  },
  {
    id: 'a_billionaire',
    name: '亿万富翁',
    description: '财富达到1000万',
    type: 'wealth',
    condition_type: 'wealth',
    condition_value: 10000000,
    icon: '🏦'
  },
  {
    id: 'a_bankrupt',
    name: '破产清算',
    description: '财富归零',
    type: 'wealth',
    condition_type: 'wealth',
    condition_value: 0,
    icon: '📉'
  },

  // 特殊成就
  {
    id: 'a_xiuxian',
    name: '修仙成功',
    description: '成功渡劫成为仙人',
    type: 'special',
    condition_type: 'special',
    icon: '☁️'
  },
  {
    id: 'a_poor_genius',
    name: '寒门贵子',
    description: '家境2以下且智力9以上',
    type: 'special',
    condition_type: 'special',
    icon: '📚'
  },
  {
    id: 'a_all_love',
    name: '万人迷',
    description: '颜值和情商都达到9以上',
    type: 'special',
    condition_type: 'special',
    icon: '❤️'
  },
  {
    id: 'a_lucky_star',
    name: '天选之子',
    description: '运气达到10且触发系统流',
    type: 'special',
    condition_type: 'special',
    icon: '✨'
  },

  // 分数类
  {
    id: 'a_score_60',
    name: '及格人生',
    description: '总分达到60',
    type: 'score',
    condition_type: 'score',
    condition_value: 60,
    icon: '📊'
  },
  {
    id: 'a_score_80',
    name: '优秀人生',
    description: '总分达到80',
    type: 'score',
    condition_type: 'score',
    condition_value: 80,
    icon: '🏆'
  },
  {
    id: 'a_score_100',
    name: '完美人生',
    description: '总分达到100',
    type: 'score',
    condition_type: 'score',
    condition_value: 100,
    icon: '👑'
  }
];

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ACHIEVEMENTS_DATA;
}
