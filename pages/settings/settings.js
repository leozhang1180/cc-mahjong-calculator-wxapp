// pages/settings/settings.js
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

Page({
  data: {
    rules: {},
    // Stepper display values
    baseScoreOptions: [1, 2, 5, 10],
    maxFanOptions: [3, 4, 5, 6, 7, 8],
    fanOptions: [1, 2, 3, 4, 5, 6]
  },

  onShow() {
    const rules = Object.assign({}, getApp().globalData.rules);
    this.setData({ rules });
  },

  onToggle(e) {
    const key = e.currentTarget.dataset.key;
    const rules = Object.assign({}, this.data.rules);
    rules[key] = !rules[key];
    this.setData({ rules });
    this._save();
  },

  onStepperChange(e) {
    const { key, delta } = e.currentTarget.dataset;
    const rules = Object.assign({}, this.data.rules);
    const minMap = {
      baseScore: 1,
      maxFan: 3,
      qingyiseFan: 1,
      qiduiFan: 1,
      luxuryQiduiFan: 1,
      tongbaoFan: 1,
      mingGangScore: 1,
      anGangScore: 1
    };
    const maxMap = {
      baseScore: 100,
      maxFan: 10,
      qingyiseFan: 8,
      qiduiFan: 8,
      luxuryQiduiFan: 10,
      tongbaoFan: 6,
      mingGangScore: 5,
      anGangScore: 5
    };
    const newVal = Math.max(minMap[key] || 1, Math.min(maxMap[key] || 10, rules[key] + delta));
    rules[key] = newVal;
    this.setData({ rules });
    this._save();
  },

  onResetRules() {
    wx.showModal({
      title: '重置规则',
      content: '确定要将所有规则恢复到默认设置吗？',
      confirmColor: '#059669',
      success: (res) => {
        if (res.confirm) {
          const rules = Object.assign({}, DEFAULT_RULES);
          this.setData({ rules });
          this._save();
          wx.showToast({ title: '已恢复默认', icon: 'success' });
        }
      }
    });
  },

  _save() {
    getApp().globalData.rules = Object.assign({}, this.data.rules);
    getApp().saveRules();
  }
});
