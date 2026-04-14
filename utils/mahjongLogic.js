// utils/mahjongLogic.js

const POSITIONS = ['East', 'South', 'West', 'North'];

function calculateHuScore(rules, selectedFans, isManGuan, isSelfDrawn, dealer, winner, loser) {
  if (isManGuan) {
    const score = rules.baseScore * Math.pow(2, rules.maxFan);
    return { huScore: score, totalFans: rules.maxFan };
  }

  let totalFans = 0;

  const hasGHKH = selectedFans.includes('杠上开花');
  const hasHDLY = selectedFans.includes('海底捞月');

  if (isSelfDrawn && !hasGHKH && !hasHDLY) {
    totalFans += 1;
  }

  selectedFans.forEach(fanName => {
    switch (fanName) {
      case '夹胡': totalFans += 1; break;
      case '边胡': totalFans += 1; break;
      case '对倒': totalFans += 1; break;
      case '门清': totalFans += 1; break;
      case '飘胡': totalFans += 2; break;
      case '清一色': totalFans += rules.qingyiseFan; break;
      case '七对': totalFans += rules.qiduiFan; break;
      case '豪华七对': totalFans += rules.luxuryQiduiFan; break;
      case '杠上开花': totalFans += 1; break;
      case '海底捞月': totalFans += 1; break;
      case '抢杠胡': totalFans += 1; break;
      case '摸宝': totalFans += 2; break;
      case '通宝': totalFans += rules.tongbaoFan; break;
    }
  });

  const finalFans = Math.min(totalFans, rules.maxFan);
  const huScore = rules.baseScore * Math.pow(2, finalFans);

  return { huScore, totalFans: finalFans };
}

function calculateNetScores(hu, eggs, dealer, rules) {
  const netScores = { East: 0, South: 0, West: 0, North: 0 };

  if (hu) {
    const { winner, loser, huScore, isSelfDrawn } = hu;

    if (isSelfDrawn) {
      POSITIONS.forEach(pos => {
        if (pos === winner) return;
        let payment = huScore;
        if (winner === dealer || pos === dealer) {
          payment *= 2;
        }
        netScores[pos] -= payment;
        netScores[winner] += payment;
      });
    } else if (loser && loser !== 'All') {
      let payment = huScore;
      if (winner === dealer || loser === dealer) {
        payment *= 2;
      }
      if (rules.isBaoSanJia) {
        const totalPayment = payment * 3;
        netScores[loser] -= totalPayment;
        netScores[winner] += totalPayment;
      } else {
        netScores[loser] -= payment;
        netScores[winner] += payment;
      }
    }
  }

  if (eggs && eggs.length > 0) {
    eggs.forEach(egg => {
      const eggValue = egg.points;
      POSITIONS.forEach(pos => {
        if (pos === egg.playerId) return;
        netScores[pos] -= eggValue;
        netScores[egg.playerId] += eggValue;
      });
    });
  }

  return netScores;
}

module.exports = { calculateHuScore, calculateNetScores };
