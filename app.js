function getDeviceEnv() {
  let info = {};

  try {
    if (typeof wx.getDeviceInfo === 'function') {
      info = wx.getDeviceInfo() || {};
    } else if (typeof wx.getSystemInfoSync === 'function') {
      info = wx.getSystemInfoSync() || {};
    }
  } catch (e) {
    console.warn('get device info failed', e);
  }

  const platform = String(info.platform || '').toLowerCase();
  const system = String(info.system || '').toLowerCase();
  const brand = String(info.brand || '').toLowerCase();

  // Use multiple signals for compatibility in case platform/system values vary.
  const isHarmonyOS =
    platform === 'harmony' ||
    platform === 'ohos' ||
    system.indexOf('harmony') >= 0 ||
    system.indexOf('openharmony') >= 0 ||
    system.indexOf('hongmeng') >= 0 ||
    brand === 'huawei';

  return {
    platform,
    system: info.system || '',
    brand: info.brand || '',
    isHarmonyOS
  };
}
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
const POSITIONS = ['East', 'South', 'West', 'North'];
const DEFAULT_NAMES = ['玩家一', '玩家二', '玩家三', '玩家四'];

App({
  globalData: {
    rules: null,
    players: null,
    history: null,
    dealer: 'East'
  },

  onLaunch() {
    const deviceEnv = getDeviceEnv();
    this.globalData.deviceEnv = deviceEnv;
    console.log('app launch', deviceEnv);

    // Load rules
    try {
      const rulesStr = wx.getStorageSync('mj_rules');
      this.globalData.rules = rulesStr ? JSON.parse(rulesStr) : Object.assign({}, DEFAULT_RULES);
    } catch (e) {
      this.globalData.rules = Object.assign({}, DEFAULT_RULES);
    }

    // Load players
    try {
      const playersStr = wx.getStorageSync('mj_players');
      if (playersStr) {
        const parsed = JSON.parse(playersStr);
        this.globalData.players = parsed.map((p, index) => {
          if (POSITIONS.includes(p.name)) {
            return Object.assign({}, p, { name: DEFAULT_NAMES[index] });
          }
          return p;
        });
      } else {
        this.globalData.players = POSITIONS.map((pos, index) => ({
          id: pos,
          name: DEFAULT_NAMES[index],
          totalScore: 0
        }));
      }
    } catch (e) {
      this.globalData.players = POSITIONS.map((pos, index) => ({
        id: pos,
        name: DEFAULT_NAMES[index],
        totalScore: 0
      }));
    }

    // Load history
    try {
      const historyStr = wx.getStorageSync('mj_history');
      this.globalData.history = historyStr ? JSON.parse(historyStr) : [];
    } catch (e) {
      this.globalData.history = [];
    }

    // Load dealer
    try {
      const dealer = wx.getStorageSync('mj_dealer');
      this.globalData.dealer = dealer || 'East';
    } catch (e) {
      this.globalData.dealer = 'East';
    }
  },

  saveRules() {
    wx.setStorageSync('mj_rules', JSON.stringify(this.globalData.rules));
  },

  savePlayers() {
    wx.setStorageSync('mj_players', JSON.stringify(this.globalData.players));
  },

  saveHistory() {
    wx.setStorageSync('mj_history', JSON.stringify(this.globalData.history));
  },

  saveDealer() {
    wx.setStorageSync('mj_dealer', this.globalData.dealer);
  },

  addRound(round) {
    this.globalData.history.unshift(round);
    this.globalData.players = this.globalData.players.map(p => ({
      ...p,
      totalScore: p.totalScore + (round.netScores[p.id] || 0)
    }));

    // Rotate dealer if dealer didn't win
    if (!round.hu || round.hu.winner !== this.globalData.dealer) {
      const currentIndex = POSITIONS.indexOf(this.globalData.dealer);
      this.globalData.dealer = POSITIONS[(currentIndex + 1) % 4];
    }

    this.savePlayers();
    this.saveHistory();
    this.saveDealer();
  },

  deleteRound(id) {
    const roundToDelete = this.globalData.history.find(r => r.id === id);
    if (!roundToDelete) return;
    this.globalData.history = this.globalData.history.filter(r => r.id !== id);
    this.globalData.players = this.globalData.players.map(p => ({
      ...p,
      totalScore: p.totalScore - (roundToDelete.netScores[p.id] || 0)
    }));
    this.savePlayers();
    this.saveHistory();
  },

  resetGame() {
    this.globalData.history = [];
    this.globalData.players = POSITIONS.map((pos, index) => ({
      id: pos,
      name: DEFAULT_NAMES[index],
      totalScore: 0
    }));
    this.globalData.dealer = 'East';
    this.savePlayers();
    this.saveHistory();
    this.saveDealer();
  },
  
  globalData: {
    version: '1.0.0',
    deviceEnv: null
  }
});
