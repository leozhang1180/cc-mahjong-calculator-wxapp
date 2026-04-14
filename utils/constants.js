// utils/constants.js

const POSITIONS = ['East', 'South', 'West', 'North'];

const POSITION_LABELS = {
  East: '东',
  South: '南',
  West: '西',
  North: '北'
};

const FAN_DEFINITIONS = {
  PING_HU: { name: '平胡', fan: 0 },
  JIA_HU: { name: '夹胡', fan: 1 },
  BIAN_HU: { name: '边胡', fan: 1 },
  DING_HU: { name: '对倒', fan: 1 },
  MEN_QING: { name: '门清', fan: 1 },
  PIAO_HU: { name: '飘胡', fan: 2 },
  QING_YI_SE: { name: '清一色', fan: 3 },
  QI_DUI: { name: '七对', fan: 4 },
  LUXURY_QI_DUI: { name: '豪华七对', fan: 6 },
  GHKH: { name: '杠上开花', fan: 1 },
  HDLY: { name: '海底捞月', fan: 1 },
  QIANG_GANG: { name: '抢杠胡', fan: 1 },
  MO_BAO: { name: '摸宝', fan: 2 },
  TONG_BAO: { name: '通宝', fan: 2 }
};

const EXCLUSIONS = {
  '平胡': ['七对', '豪华七对', '飘胡'],
  '七对': ['平胡', '豪华七对', '飘胡', '夹胡', '边胡'],
  '豪华七对': ['平胡', '七对', '飘胡', '夹胡', '边胡'],
  '飘胡': ['平胡', '七对', '豪华七对', '门清', '夹胡'],
  '门清': ['飘胡'],
  '夹胡': ['七对', '豪华七对', '飘胡'],
  '边胡': ['七对', '豪华七对'],
  '杠上开花': ['海底捞月'],
  '海底捞月': ['杠上开花'],
  '抢杠胡': ['杠上开花', '海底捞月', '摸宝']
};

const FAN_GROUPS = [
  { title: '基本牌型', keys: ['PING_HU', 'QI_DUI', 'LUXURY_QI_DUI', 'QING_YI_SE', 'PIAO_HU'] },
  { title: '听牌方式', keys: ['JIA_HU', 'BIAN_HU', 'DING_HU'] },
  { title: '游戏状态', keys: ['MEN_QING', 'TONG_BAO'] },
  { title: '特殊事件', keys: ['GHKH', 'HDLY', 'QIANG_GANG', 'MO_BAO'] }
];

const DEFAULT_RULES = {
  baseScore: 1,
  maxFan: 5,
  qingyiseFan: 3,
  qiduiFan: 4,
  luxuryQiduiFan: 6,
  tongbaoFan: 2,
  mingGangScore: 1,
  anGangScore: 2,
  isBaoSanJia: true,
  isYaojiWildcard: true,
  isAllowMenQing: true
};

module.exports = {
  POSITIONS,
  POSITION_LABELS,
  FAN_DEFINITIONS,
  EXCLUSIONS,
  FAN_GROUPS,
  DEFAULT_RULES
};
