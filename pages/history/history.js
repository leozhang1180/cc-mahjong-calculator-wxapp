// pages/history/history.js
const POSITIONS = ['East', 'South', 'West', 'North'];
const POSITION_LABELS = { East: '东', South: '南', West: '西', North: '北' };

Page({
  data: {
    historyItems: [],
    players: [],
    showResetConfirm: false
  },

  onShow() {
    const app = getApp();
    const players = app.globalData.players;
    const history = app.globalData.history;

    const historyItems = history.map(round => {
      const scores = POSITIONS.map(pos => {
        const player = players.find(p => p.id === pos) || { name: pos };
        const net = round.netScores[pos] || 0;
        return {
          pos,
          label: POSITION_LABELS[pos],
          name: player.name,
          net,
          netStr: net > 0 ? `+${net}` : String(net),
          scoreClass: net > 0 ? 'score-positive' : net < 0 ? 'score-negative' : 'score-zero',
          isWinner: round.hu && round.hu.winner === pos,
          isLoser: round.hu && round.hu.loser === pos
        };
      });

      const timeStr = formatTime(round.timestamp);
      const dealerName = (players.find(p => p.id === round.dealer) || { name: round.dealer }).name;

      return {
        id: round.id,
        timeStr,
        dealerName,
        hu: round.hu,
        eggs: round.eggs,
        scores
      };
    });

    this.setData({ historyItems, players });
  },

  onDeleteRound(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '删除确认',
      content: '确定要删除这条记录吗？',
      confirmColor: '#dc2626',
      success: (res) => {
        if (res.confirm) {
          getApp().deleteRound(id);
          this.onShow();
        }
      }
    });
  },

  onShowResetConfirm() {
    this.setData({ showResetConfirm: true });
  },

  onCancelReset() {
    this.setData({ showResetConfirm: false });
  },

  onConfirmReset() {
    getApp().resetGame();
    this.setData({ showResetConfirm: false });
    this.onShow();
    wx.showToast({ title: '已重置', icon: 'success' });
  }
});

function formatTime(timestamp) {
  const d = new Date(timestamp);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
