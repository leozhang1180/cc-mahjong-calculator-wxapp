// 默认设置
var DEFAULT_SETTINGS = {
  baseScore: 1,
  capFan: 5,
  qingyiseFan: 4,
  qiduiFan: 4,
  haohuaQiduiFan: 6,
  dianpaoAll: true,
  yaojiBao: false,
  menqingAllowed: true,
  mingGangPrice: 2,
  anGangPrice: 4,
  tongBaoFan: 3
};

// 规则数据
var RULES = [
  {
    title: '📌 基本规则',
    lines: [
      '• 4人对局，共136张牌',
      '• 底分可调：0.5/1/2/5/10元',
      '• 翻数制：总额 = 底分 × 2^翻数',
      '• 可设封顶翻数（默认5番=32倍）'
    ]
  },
  {
    title: '🀄 胡牌方式',
    lines: [
      '• 自摸：+1番，三家均付',
      '• 摸宝：+2番，三家均付',
      '• 点炮：不加番，放炮者付（可设包三家）'
    ]
  },
  {
    title: '👤 庄闲规则',
    lines: [
      '• 庄家不额外加番',
      '• 闲家赢：庄家付翻倍，其他闲家正常付',
      '• 庄家赢：三个闲家各付翻倍',
      '• 翻倍仅影响支付金额，不影响翻数'
    ]
  },
  {
    title: '👂 听牌方式',
    lines: [
      '• 两头听：不加番，如45听3和6',
      '• 夹胡：+1番，如46胡5',
      '• 边胡：+1番，如12胡3或89胡7',
      '• 单吊：+1番，只听一张将牌'
    ]
  },
  {
    title: '🎴 牌型番数',
    lines: [
      '• 对对胡：+2番',
      '• 混一色：+2番',
      '• 清一色：+3或+4番（可设置）',
      '• 七对：+4或+6番（可设置）',
      '• 豪华七对：+6或+8番（可设置）',
      '• 门清（站立）：+1番（可关闭）'
    ]
  },
  {
    title: '⭐ 特殊加番',
    lines: [
      '• 杠上开花：+1番',
      '• 抢杠胡：+1番',
      '• 海底捞月：+1番',
      '• 宝中宝：+2番',
      '• 通宝翻番：+1/+2/+3番（宝牌即胡牌，可设置）',
      '• 天胡/地胡：直接满贯（封顶翻数）'
    ]
  },
  {
    title: '💰 杠牌结算',
    lines: [
      '• 明杠：点杠者付（默认2元/杠）',
      '• 暗杠：三家各付（默认4元/人/杠）',
      '• 补杠：三家各付（同明杠单价）',
      '• 杠牌即时结算，不受翻数影响'
    ]
  }
];

// 复制默认设置到目标对象
function applyDefaults(target) {
  target.baseScore = DEFAULT_SETTINGS.baseScore;
  target.capFan = DEFAULT_SETTINGS.capFan;
  target.qingyiseFan = DEFAULT_SETTINGS.qingyiseFan;
  target.qiduiFan = DEFAULT_SETTINGS.qiduiFan;
  target.haohuaQiduiFan = DEFAULT_SETTINGS.haohuaQiduiFan;
  target.dianpaoAll = DEFAULT_SETTINGS.dianpaoAll;
  target.yaojiBao = DEFAULT_SETTINGS.yaojiBao;
  target.menqingAllowed = DEFAULT_SETTINGS.menqingAllowed;
  target.mingGangPrice = DEFAULT_SETTINGS.mingGangPrice;
  target.anGangPrice = DEFAULT_SETTINGS.anGangPrice;
  target.tongBaoFan = DEFAULT_SETTINGS.tongBaoFan;
  return target;
}

Page({
  data: {
    currentTab: 0,

    // 设置
    baseScore: 1,
    capFan: 5,
    qingyiseFan: 4,
    qiduiFan: 4,
    haohuaQiduiFan: 6,
    dianpaoAll: true,
    yaojiBao: false,
    menqingAllowed: true,
    mingGangPrice: 2,
    anGangPrice: 4,
    tongBaoFan: 3,

    // 算分选项
    isDealer: false,
    winType: 0,
    waitType: 0,
    firedByDealer: false,

    // 牌型
    duiDuiHu: false,
    hunYiSe: false,
    qingYiSe: false,
    qiDui: false,
    haoHuaQiDui: false,
    menQing: false,

    // 杠
    mingGangCount: 0,
    anGangCount: 0,
    buGangCount: 0,

    // 特殊
    gangShangKaiHua: false,
    qiangGangHu: false,
    haiDiLaoYue: false,
    baoZhongBao: false,
    tongBao: false,
    tianHu: false,
    diHu: false,

    // 规则页展开
    expandedRule: -1,

    // 计算结果
    fanDetails: [],
    totalFan: 0,
    actualFan: 0,
    isCapped: false,
    huIncome: 0,
    gangIncome: 0,
    grandTotal: 0,
    formulaText: '',
    payDescription: '',
    dealerNote: '',

    // 规则列表
    rules: RULES
  },

  onLoad: function () {
    this.loadSettings();
    this.calculate();
  },

  // ========== 加载设置 ==========
  loadSettings: function () {
    try {
      var s = wx.getStorageSync('mj_settings');
      if (s) {
        var parsed = JSON.parse(s);
        var updates = {};
        applyDefaults(updates);
        var keys = Object.keys(parsed);
        for (var i = 0; i < keys.length; i++) {
          updates[keys[i]] = parsed[keys[i]];
        }
        this.setData(updates);
      }
    } catch (e) {
      console.log('加载设置失败', e);
    }
  },

  // ========== 核心计算 ==========
  calculate: function () {
    var d = this.data;
    var details = [];
    var totalFan = 0;

    // 庄家不再加番，改为支付时翻倍

    // 胡牌方式
    if (d.winType === 0) { details.push({ name: '自摸', fan: 1 }); totalFan += 1; }
    if (d.winType === 1) { details.push({ name: '摸宝', fan: 2 }); totalFan += 2; }
    // 听牌
    if (d.waitType === 1) { details.push({ name: '夹胡', fan: 1 }); totalFan += 1; }
    if (d.waitType === 2) { details.push({ name: '边胡', fan: 1 }); totalFan += 1; }
    if (d.waitType === 3) { details.push({ name: '单吊', fan: 1 }); totalFan += 1; }
    // 牌型
    if (d.duiDuiHu) { details.push({ name: '对对胡', fan: 2 }); totalFan += 2; }
    if (d.hunYiSe) { details.push({ name: '混一色', fan: 2 }); totalFan += 2; }
    if (d.qingYiSe) { details.push({ name: '清一色', fan: d.qingyiseFan }); totalFan += d.qingyiseFan; }
    if (d.qiDui) { details.push({ name: '七对', fan: d.qiduiFan }); totalFan += d.qiduiFan; }
    if (d.haoHuaQiDui) { details.push({ name: '豪华七对', fan: d.haohuaQiduiFan }); totalFan += d.haohuaQiduiFan; }
    if (d.menQing && d.menqingAllowed) { details.push({ name: '门清', fan: 1 }); totalFan += 1; }
    // 特殊
    if (d.gangShangKaiHua) { details.push({ name: '杠上开花', fan: 1 }); totalFan += 1; }
    if (d.qiangGangHu) { details.push({ name: '抢杠胡', fan: 1 }); totalFan += 1; }
    if (d.haiDiLaoYue) { details.push({ name: '海底捞月', fan: 1 }); totalFan += 1; }
    if (d.baoZhongBao) { details.push({ name: '宝中宝', fan: 2 }); totalFan += 2; }
    if (d.tongBao) { details.push({ name: '通宝翻番', fan: d.tongBaoFan }); totalFan += d.tongBaoFan; }

    // 天胡/地胡满贯
    var isManGuan = d.tianHu || d.diHu;
    if (d.tianHu) { details.push({ name: '天胡', fan: d.capFan }); }
    if (d.diHu) { details.push({ name: '地胡', fan: d.capFan }); }

    // 封顶
    var actualFan = isManGuan ? d.capFan : totalFan;
    var isCapped = !isManGuan && totalFan > d.capFan;
    if (isCapped) { actualFan = d.capFan; }

    // 每人基础注（不含庄家翻倍）
    var perPerson = d.baseScore * Math.pow(2, actualFan);

    // 胡牌收入 & 支付描述
    var huIncome = 0;
    var payDescription = '';
    var dealerNote = '';

    if (d.winType === 2) {
      // === 点炮 ===
      if (d.isDealer) {
        // 庄家赢：与庄翻倍，放炮闲家付2倍
        var dealerPer = perPerson * 2;
        if (d.dianpaoAll) {
          // 包三家：放炮者付3个闲家的份（每份都是2倍）
          huIncome = dealerPer * 3;
          payDescription = '放炮者付 ¥' + (dealerPer * 3) + '（包三家）';
        } else {
          huIncome = dealerPer;
          payDescription = '放炮者付 ¥' + dealerPer;
        }
        dealerNote = '庄家赢，与庄翻倍 ¥' + perPerson + '→¥' + dealerPer + '/人';
      } else {
        // 闲家赢
        if (d.dianpaoAll) {
          // 包三家：庄家份2倍+两闲家各1倍 = 4倍
          huIncome = perPerson * 4;
          payDescription = '放炮者付 ¥' + (perPerson * 4) + '（包三家）';
          dealerNote = '含庄家份翻倍：¥' + (perPerson * 2) + ' + 闲家2×¥' + perPerson;
        } else {
          // 不包三家：看谁点的炮
          if (d.firedByDealer) {
            huIncome = perPerson * 2;
            payDescription = '庄家点炮付 ¥' + (perPerson * 2) + '（翻倍）';
            dealerNote = '庄家点炮，与庄翻倍';
          } else {
            huIncome = perPerson;
            payDescription = '闲家点炮付 ¥' + perPerson;
            dealerNote = '闲家点炮，正常支付';
          }
        }
      }
    } else {
      // === 自摸 / 摸宝 ===
      if (d.isDealer) {
        // 庄家赢：三个闲家各付2倍
        var dealerPer2 = perPerson * 2;
        huIncome = dealerPer2 * 3;
        payDescription = '三家各付 ¥' + dealerPer2 + '（与庄翻倍）';
        dealerNote = '庄家赢，每人 ¥' + perPerson + '→¥' + dealerPer2;
      } else {
        // 闲家赢：庄家付2倍，其他两闲各付1倍
        var fromDealer = perPerson * 2;
        var fromXian = perPerson;
        huIncome = fromDealer + fromXian * 2;
        payDescription = '庄付 ¥' + fromDealer + '，闲家各付 ¥' + fromXian;
        dealerNote = '庄家翻倍 ¥' + perPerson + '→¥' + fromDealer;
      }
    }

    // 杠收入
    var gangIncome =
      d.mingGangCount * d.mingGangPrice +
      d.anGangCount * d.anGangPrice * 3 +
      d.buGangCount * d.mingGangPrice * 3;

    var grandTotal = huIncome + gangIncome;
    var formulaText = d.baseScore + ' × 2^' + actualFan + ' = ¥' + perPerson + '/人';

    this.setData({
      fanDetails: details,
      totalFan: isManGuan ? d.capFan : totalFan,
      actualFan: actualFan,
      isCapped: isCapped,
      huIncome: huIncome,
      gangIncome: gangIncome,
      grandTotal: grandTotal,
      formulaText: formulaText,
      payDescription: payDescription,
      dealerNote: dealerNote
    });
  },

  // ========== Tab 切换 ==========
  switchTab: function (e) {
    this.setData({ currentTab: parseInt(e.currentTarget.dataset.tab) });
  },

  // ========== 快速选择 ==========
  quickSelect: function (e) {
    var type = e.currentTarget.dataset.type;
    this.resetCalcData();
    var updates = {};
    switch (type) {
      case 'normal':
        updates.winType = 0;
        break;
      case 'jia':
        updates.winType = 0;
        updates.waitType = 1;
        break;
      case 'duidui':
        updates.winType = 0;
        updates.duiDuiHu = true;
        break;
      case 'hun':
        updates.winType = 0;
        updates.hunYiSe = true;
        break;
      case 'qing':
        updates.winType = 0;
        updates.qingYiSe = true;
        break;
      case 'qidui':
        updates.winType = 0;
        updates.qiDui = true;
        break;
    }
    this.setData(updates, function () {
      this.calculate();
      wx.showToast({ title: '已快速设置', icon: 'none', duration: 1200 });
    }.bind(this));
  },

  // ========== 身份 ==========
  setDealer: function (e) {
    this.setData({ isDealer: e.currentTarget.dataset.value === 'true' }, function () { this.calculate(); }.bind(this));
  },

  // ========== 胡牌方式 ==========
  setWinType: function (e) {
    this.setData({ winType: parseInt(e.currentTarget.dataset.value) }, function () { this.calculate(); }.bind(this));
  },

  // ========== 听牌方式 ==========
  setWaitType: function (e) {
    this.setData({ waitType: parseInt(e.currentTarget.dataset.value) }, function () { this.calculate(); }.bind(this));
  },

  // ========== 点炮者 ==========
  setFiredByDealer: function (e) {
    this.setData({ firedByDealer: e.currentTarget.dataset.value === 'true' }, function () { this.calculate(); }.bind(this));
  },

  // ========== 牌型切换 ==========
  togglePattern: function (e) {
    var field = e.currentTarget.dataset.field;
    if (field === 'menQing' && !this.data.menqingAllowed) { return; }
    var obj = {};
    obj[field] = !this.data[field];
    this.setData(obj, function () { this.calculate(); }.bind(this));
  },

  // ========== 特殊切换 ==========
  toggleSpecial: function (e) {
    var field = e.currentTarget.dataset.field;
    var obj = {};
    obj[field] = !this.data[field];
    this.setData(obj, function () { this.calculate(); }.bind(this));
  },

  // ========== 杠计数器 ==========
  adjustGang: function (e) {
    var field = e.currentTarget.dataset.field;
    var delta = parseInt(e.currentTarget.dataset.delta);
    var newVal = Math.max(0, Math.min(4, this.data[field] + delta));
    var obj = {};
    obj[field] = newVal;
    this.setData(obj, function () { this.calculate(); }.bind(this));
  },

  // ========== 重置算分 ==========
  resetCalcData: function () {
    this.setData({
      isDealer: false,
      winType: 0,
      waitType: 0,
      firedByDealer: false,
      duiDuiHu: false,
      hunYiSe: false,
      qingYiSe: false,
      qiDui: false,
      haoHuaQiDui: false,
      menQing: false,
      mingGangCount: 0,
      anGangCount: 0,
      buGangCount: 0,
      gangShangKaiHua: false,
      qiangGangHu: false,
      haiDiLaoYue: false,
      baoZhongBao: false,
      tongBao: false,
      tianHu: false,
      diHu: false
    });
  },

  resetAll: function () {
    this.resetCalcData();
    this.calculate();
    wx.showToast({ title: '已重置所有选项', icon: 'none', duration: 1200 });
  },

  // ========== 规则展开 ==========
  toggleRule: function (e) {
    var idx = parseInt(e.currentTarget.dataset.idx);
    this.setData({ expandedRule: this.data.expandedRule === idx ? -1 : idx });
  },

  // ========== 设置页操作 ==========
  setBaseScore: function (e) {
    this.setData({ baseScore: parseFloat(e.currentTarget.dataset.value) }, function () { this.calculate(); }.bind(this));
  },

  setCapFan: function (e) {
    this.setData({ capFan: parseInt(e.currentTarget.dataset.value) }, function () { this.calculate(); }.bind(this));
  },

  setQingyiseFan: function (e) {
    this.setData({ qingyiseFan: parseInt(e.currentTarget.dataset.value) }, function () { this.calculate(); }.bind(this));
  },

  setQiduiFan: function (e) {
    this.setData({ qiduiFan: parseInt(e.currentTarget.dataset.value) }, function () { this.calculate(); }.bind(this));
  },

  setHaohuaFan: function (e) {
    this.setData({ haohuaQiduiFan: parseInt(e.currentTarget.dataset.value) }, function () { this.calculate(); }.bind(this));
  },

  setTongBaoFan: function (e) {
    this.setData({ tongBaoFan: parseInt(e.currentTarget.dataset.value) }, function () { this.calculate(); }.bind(this));
  },

  toggleSetting: function (e) {
    var field = e.currentTarget.dataset.field;
    var obj = {};
    obj[field] = !this.data[field];
    this.setData(obj, function () { this.calculate(); }.bind(this));
  },

  onGangPriceInput: function (e) {
    var field = e.currentTarget.dataset.field;
    var v = parseFloat(e.detail.value);
    if (!isNaN(v) && v >= 0) {
      var obj = {};
      obj[field] = v;
      this.setData(obj, function () { this.calculate(); }.bind(this));
    }
  },

  saveSettings: function () {
    var d = this.data;
    var settings = {
      baseScore: d.baseScore,
      capFan: d.capFan,
      qingyiseFan: d.qingyiseFan,
      qiduiFan: d.qiduiFan,
      haohuaQiduiFan: d.haohuaQiduiFan,
      dianpaoAll: d.dianpaoAll,
      yaojiBao: d.yaojiBao,
      menqingAllowed: d.menqingAllowed,
      mingGangPrice: d.mingGangPrice,
      anGangPrice: d.anGangPrice,
      tongBaoFan: d.tongBaoFan
    };
    wx.setStorageSync('mj_settings', JSON.stringify(settings));
    wx.showToast({ title: '设置已保存', icon: 'success', duration: 1200 });
  },

  resetSettings: function () {
    var updates = {};
    applyDefaults(updates);
    this.setData(updates, function () {
      this.calculate();
      wx.removeStorageSync('mj_settings');
      wx.showToast({ title: '已恢复默认', icon: 'none', duration: 1200 });
    }.bind(this));
  }
});
