// pages/players/players.js
const POSITIONS = ['East', 'South', 'West', 'North'];
const POSITION_LABELS = { East: '东', South: '南', West: '西', North: '北' };

Page({
  data: {
    players: [],
    editingIndex: -1,
    editingName: ''
  },

  onShow() {
    const players = getApp().globalData.players.map((p, i) => ({
      ...p,
      label: POSITION_LABELS[p.id]
    }));
    this.setData({ players, editingIndex: -1, editingName: '' });
  },

  onStartEdit(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      editingIndex: index,
      editingName: this.data.players[index].name
    });
  },

  onNameInput(e) {
    this.setData({ editingName: e.detail.value });
  },

  onSaveName() {
    const { editingIndex, editingName, players } = this.data;
    if (editingIndex < 0) return;
    const name = editingName.trim();
    if (!name) {
      wx.showToast({ title: '名字不能为空', icon: 'none' });
      return;
    }
    const newPlayers = players.map((p, i) =>
      i === editingIndex ? { ...p, name } : p
    );
    getApp().globalData.players = newPlayers.map(p => ({
      id: p.id,
      name: p.name,
      totalScore: p.totalScore
    }));
    getApp().savePlayers();
    this.setData({ players: newPlayers, editingIndex: -1, editingName: '' });
    wx.showToast({ title: '已保存', icon: 'success', duration: 1000 });
  },

  onCancelEdit() {
    this.setData({ editingIndex: -1, editingName: '' });
  }
});
