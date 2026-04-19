// pages/index/index.js
const { calculateHuScore, calculateNetScores } = require('../../utils/mahjongLogic');
const { POSITIONS, POSITION_LABELS, FAN_DEFINITIONS, EXCLUSIONS, FAN_GROUPS } = require('../../utils/constants');

const SELF_DRAWN_ONLY = ['杠上开花', '海底捞月', '摸宝'];

Page({
  onload: function(options){
    //页面加载时开启分享菜单
    wx.showShareMenu({
      withShareTicket:true,
      menus: ['shareAppMessage','shareTimeline']
    })  
  },
  onShareAppMessage(){
    return{
      title:'🀄️ 雀实准：这局算得清清楚楚，谁也别想赖账！',
      imageUrl: '/images/icon.png'

    }
  },
  // 设置分享到朋友圈的标题
  onShareTimeline() {
    return {
      title: '打麻将怕算错分？用「雀实准」就完事了！🀄️✨',
      query: 'from=timeline'
    }
  },

  data: {
    
    players: [],
    dealer: 'East',
    rules: {},

    // Calculator state
    winner: null,
    loser: null,
    isSelfDrawn: false,
    selectedFans: [],
    isManGuan: false,
    eggScores: { East: 0, South: 0, West: 0, North: 0 },

    // Derived display data
    fanGroups: [],
    previewScores: [],
    currentHuInfo: null,
    totalEggs: 0,
    POSITIONS: POSITIONS,
    POSITION_LABELS: POSITION_LABELS,

    positionItems: []
  },

  onShow() {
    const app = getApp();
    this.setData({
      players: app.globalData.players,
      dealer: app.globalData.dealer,
      rules: app.globalData.rules
    });
    this._rebuildPositionItems();
    this._rebuildFanGroups();
    this._recalcPreview();
  },

  _rebuildPositionItems() {
    const { players, dealer } = this.data;
    const items = POSITIONS.map(pos => {
      const player = players.find(p => p.id === pos) || { name: pos };
      return {
        id: pos,
        label: POSITION_LABELS[pos],
        name: player.name,
        isDealer: pos === dealer
      };
    });
    this.setData({ positionItems: items });
  },

  _rebuildFanGroups() {
    const { selectedFans, isSelfDrawn, isManGuan } = this.data;
    const groups = FAN_GROUPS.map(group => ({
      title: group.title,
      fans: group.keys.map(key => {
        const def = FAN_DEFINITIONS[key];
        if (!def) return null;
        const isSelected = selectedFans.includes(def.name);
        const isDisabled = this._isFanDisabled(def.name, selectedFans, isSelfDrawn) || isManGuan;
        return {
          key,
          name: def.name,
          fan: def.fan,
          isSelected,
          isDisabled
        };
      }).filter(Boolean)
    }));
    this.setData({ fanGroups: groups });
  },

  _isFanDisabled(fanName, selectedFans, isSelfDrawn) {
    if (selectedFans.some(f => EXCLUSIONS[f] && EXCLUSIONS[f].includes(fanName))) return true;
    if (!isSelfDrawn && SELF_DRAWN_ONLY.includes(fanName)) return true;
    return false;
  },

  _recalcPreview() {
    const { winner, loser, isSelfDrawn, selectedFans, isManGuan, eggScores, players, dealer, rules } = this.data;

    let currentHu = null;
    if (winner && loser) {
      const { huScore, totalFans } = calculateHuScore(
        rules, selectedFans, isManGuan, isSelfDrawn, dealer, winner, loser
      );
      currentHu = {
        winner, loser, isSelfDrawn,
        fans: isManGuan ? ['满贯牌型'] : selectedFans,
        totalFans,
        huScore,
        isManGuan
      };
    }

    const currentEggs = POSITIONS
      .map(pos => ({ playerId: pos, points: eggScores[pos] }))
      .filter(e => e.points > 0);

    const totalEggs = POSITIONS.reduce((acc, pos) => acc + eggScores[pos], 0);

    const huOnlyNet = calculateNetScores(currentHu, [], dealer, rules);
    const eggsOnlyNet = calculateNetScores(null, currentEggs, dealer, rules);

    const previewScores = POSITIONS.map(pos => {
      const player = players.find(p => p.id === pos) || { name: pos };
      const huNet = huOnlyNet[pos];
      const eggNet = eggsOnlyNet[pos];
      const totalNet = huNet + eggNet;
      return {
        pos,
        name: player.name,
        isWinner: pos === winner,
        isLoser: pos === loser,
        isDealer: pos === dealer,
        huNet,
        eggNet,
        totalNet,
        totalNetStr: totalNet > 0 ? `+${totalNet}` : String(totalNet),
        scoreClass: totalNet > 0 ? 'score-positive' : totalNet < 0 ? 'score-negative' : 'score-zero'
      };
    });

    const canSubmit = winner || currentEggs.length > 0;
    const showPreview = !!(winner && loser) || currentEggs.length > 0;

    this.setData({
      currentHuInfo: currentHu,
      previewScores,
      totalEggs,
      canSubmit,
      showPreview,
      currentEggs
    });
  },

  onSelectWinner(e) {
    const pos = e.currentTarget.dataset.pos;
    const { winner } = this.data;
    if (pos === winner) {
      this.setData({ winner: null, loser: null, isSelfDrawn: false });
    } else {
      this.setData({ winner: pos, loser: null, isSelfDrawn: false });
    }
    this._rebuildFanGroups();
    this._recalcPreview();
  },

  onSelectSelfDrawn() {
    this.setData({ isSelfDrawn: true, loser: 'All' });
    this._rebuildFanGroups();
    this._recalcPreview();
  },

  onSelectDiscard() {
    const { selectedFans } = this.data;
    const newFans = selectedFans.filter(f => !SELF_DRAWN_ONLY.includes(f));
    this.setData({ isSelfDrawn: false, loser: null, selectedFans: newFans });
    this._rebuildFanGroups();
    this._recalcPreview();
  },

  onSelectLoser(e) {
    const pos = e.currentTarget.dataset.pos;
    this.setData({ loser: pos });
    this._recalcPreview();
  },

  onToggleFan(e) {
    const fanName = e.currentTarget.dataset.fan;
    let { selectedFans, isSelfDrawn } = this.data;
    if (this._isFanDisabled(fanName, selectedFans, isSelfDrawn)) return;

    if (selectedFans.includes(fanName)) {
      selectedFans = selectedFans.filter(f => f !== fanName);
    } else {
      const excluded = EXCLUSIONS[fanName] || [];
      selectedFans = selectedFans.filter(f => !excluded.includes(f));
      selectedFans.push(fanName);
    }
    this.setData({ selectedFans });
    this._rebuildFanGroups();
    this._recalcPreview();
  },

  onToggleManGuan() {
    const { isManGuan } = this.data;
    this.setData({ isManGuan: !isManGuan });
    this._rebuildFanGroups();
    this._recalcPreview();
  },

  onEggChange(e) {
    const { pos, delta } = e.currentTarget.dataset;
    const { eggScores } = this.data;
    const newVal = Math.max(0, eggScores[pos] + delta);
    const newEggScores = Object.assign({}, eggScores, { [pos]: newVal });
    this.setData({ eggScores: newEggScores });
    this._recalcPreview();
  },

  onSubmit() {
    const { winner, loser, isSelfDrawn, selectedFans, isManGuan, eggScores, dealer, rules, canSubmit, currentHuInfo, currentEggs } = this.data;
    if (!canSubmit) return;

    const { calculateNetScores } = require('../../utils/mahjongLogic');
    const hu = currentHuInfo;
    const eggs = POSITIONS.map(pos => ({ playerId: pos, points: eggScores[pos] })).filter(e => e.points > 0);
    const netScores = calculateNetScores(hu, eggs, dealer, rules);

    const round = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      dealer,
      hu: hu || null,
      eggs,
      netScores
    };

    getApp().addRound(round);

    // Reset
    this.setData({
      winner: null,
      loser: null,
      isSelfDrawn: false,
      selectedFans: [],
      isManGuan: false,
      eggScores: { East: 0, South: 0, West: 0, North: 0 },
      dealer: getApp().globalData.dealer,
      players: getApp().globalData.players
    });
    this._rebuildPositionItems();
    this._rebuildFanGroups();
    this._recalcPreview();

    wx.showToast({ title: '结算完成', icon: 'success', duration: 1500 });
  }
});
