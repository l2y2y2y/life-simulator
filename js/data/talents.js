/**
 * talents.js
 * 天赋数据配置
 */

const TALENTS_DATA = [
  // 传说品质 (金色)
  {
    id: 't_tianxuan',
    name: '天选之子',
    quality: 'legendary',
    description: '运气+5，随机事件总是偏向好结果',
    effects: { luck: 5 },
    special: { good_event_bias: 1.5 }
  },
  {
    id: 't_linggen',
    name: '灵根觉醒',
    quality: 'legendary',
    description: '开启修仙隐藏线，体质上限提升至15',
    effects: { constitution_max: 5 },
    special: { unlock_xiuxian_line: true }
  },
  {
    id: 't_baijia',
    name: '百家争鸣',
    quality: 'legendary',
    description: '智力+5，所有教育类事件效果翻倍',
    effects: { intelligence: 5 },
    special: { education_event_bonus: 2.0 }
  },

  // 史诗品质 (紫色)
  {
    id: 't_hongyan',
    name: '红颜薄命',
    quality: 'epic',
    description: '颜值+4，体质-2，30岁后健康风险增加',
    effects: { appearance: 4, constitution: -2 },
    special: { health_risk_after_30: 1.3 }
  },
  {
    id: 't_caifu',
    name: '财神附体',
    quality: 'epic',
    description: '家境+3，财富增长速度翻倍',
    effects: { family: 3 },
    special: { wealth_growth: 2.0 }
  },
  {
    id: 't_shejiao',
    name: '交际花',
    quality: 'epic',
    description: '情商+4，社交事件触发概率增加',
    effects: { eq: 4 },
    special: { social_event_weight: 1.5 }
  },

  // 稀有品质 (蓝色)
  {
    id: 't_shuxiang',
    name: '书香门第',
    quality: 'rare',
    description: '家境+2，智力+2，教育类事件概率增加',
    effects: { family: 2, intelligence: 2 },
    special: { education_event_weight: 1.5 }
  },
  {
    id: 't_yundong',
    name: '运动健将',
    quality: 'rare',
    description: '体质+3，健康事件偏向好结果',
    effects: { constitution: 3 },
    special: { health_event_bias: 1.3 }
  },
  {
    id: 't_yishu',
    name: '艺术天赋',
    quality: 'rare',
    description: '颜值+2，情商+2，艺术类事件概率增加',
    effects: { appearance: 2, eq: 2 },
    special: { art_event_weight: 1.5 }
  },
  {
    id: 't_shangren',
    name: '商业头脑',
    quality: 'rare',
    description: '智力+2，情商+1，财富增长速度提升',
    effects: { intelligence: 2, eq: 1 },
    special: { wealth_growth: 1.5 }
  },

  // 普通品质 (白色)
  {
    id: 't_putong',
    name: '普通人',
    quality: 'common',
    description: '所有属性+1',
    effects: { appearance: 1, intelligence: 1, constitution: 1, family: 1, eq: 1, luck: 1 },
    special: {}
  },
  {
    id: 't_piaoliang',
    name: '眉清目秀',
    quality: 'common',
    description: '颜值+2',
    effects: { appearance: 2 },
    special: {}
  },
  {
    id: 't_congming',
    name: '聪明伶俐',
    quality: 'common',
    description: '智力+2',
    effects: { intelligence: 2 },
    special: {}
  },
  {
    id: 't_jiankang',
    name: '身体健康',
    quality: 'common',
    description: '体质+2',
    effects: { constitution: 2 },
    special: {}
  },
  {
    id: 't_youqian',
    name: '小康之家',
    quality: 'common',
    description: '家境+2',
    effects: { family: 2 },
    special: {}
  },
  {
    id: 't_shanliang',
    name: '心地善良',
    quality: 'common',
    description: '情商+2',
    effects: { eq: 2 },
    special: {}
  },
  {
    id: 't_xingyun',
    name: '小确幸',
    quality: 'common',
    description: '运气+2',
    effects: { luck: 2 },
    special: {}
  },
  {
    id: 't_kunan',
    name: '吃苦耐劳',
    quality: 'common',
    description: '体质+1，压力值增长减缓',
    effects: { constitution: 1 },
    special: { stress_growth: 0.7 }
  },

  // ===== 机制型天赋 =====
  {
    id: 't_destiny',
    name: '逆天改命',
    description: '死亡概率降低30%，命运掌握在自己手中',
    quality: 'legendary',
    effects: { luck: 1 },
    type: 'mechanic',
    mechanic: 'death_reduction',
    mechanic_value: 0.3
  },
  {
    id: 't_protagonist',
    name: '主角光环',
    description: '每10年随机获得一项属性+1，天生不凡',
    quality: 'epic',
    effects: { luck: 1 },
    type: 'mechanic',
    mechanic: 'periodic_boost',
    mechanic_value: 10
  },
  {
    id: 't_businessGenius',
    name: '商界奇才',
    description: '所有财富相关事件收益翻倍',
    quality: 'epic',
    effects: { intelligence: 1, eq: 1 },
    type: 'mechanic',
    mechanic: 'wealth_multiplier',
    mechanic_value: 2
  },
  // ===== 成长型天赋 =====
  {
    id: 't_lateBloomer',
    name: '厚积薄发',
    description: '前30年所有属性-1，30岁后每年+1全属性',
    quality: 'legendary',
    effects: { constitution: -1 },
    type: 'growth',
    mechanic: 'late_bloom',
    mechanic_value: 30
  },
  {
    id: 't_survivor',
    name: '不死之身',
    description: '每次濒死时自动恢复30点健康（每局限3次）',
    quality: 'legendary',
    effects: { constitution: 2 },
    type: 'growth',
    mechanic: 'auto_revive',
    mechanic_value: 3
  },
  {
    id: 't_hardWork',
    name: '天道酬勤',
    description: '每次选择后，如果快乐<30，快乐自动恢复到30',
    quality: 'epic',
    effects: { intelligence: 1 },
    type: 'growth',
    mechanic: 'happiness_floor',
    mechanic_value: 30
  }
];

// 天赋品质配置
const TALENT_QUALITY_CONFIG = {
  common: { name: '普通', color: '#9e9e9e', probability: 0.50 },
  rare: { name: '稀有', color: '#2196f3', probability: 0.30 },
  epic: { name: '史诗', color: '#9c27b0', probability: 0.15 },
  legendary: { name: '传说', color: '#ff9800', probability: 0.05 }
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TALENTS_DATA, TALENT_QUALITY_CONFIG };
}
