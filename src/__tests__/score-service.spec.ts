import 'expect';
import 'jest';
import { formatScore, recordPointForScore } from '../api/score-service';

const seedScore = {
    gameId: 1234,
    name: 'Fed vs Nadal',
    players: {
      p1: 'fed',
      p2: 'nadal'
    },
    sets: [
      { p1: 0, p2: 0 },
    ],
    currentGame: {
      p1: 0,
      p2: 0
    } 
  };

// beforeAll(() => {
// });

describe('score formatting', () => {
  it('ongoing game points lower than match point', () => {
    const points = [
      [0 ,0],
      [0, 1],
      [1, 0],
      [3, 2],
      [2, 3],
    ];
    const expectedDisplayPoints = [
      ['0', '0'],
      ['0', '15'],
      ['15', '0'],
      ['40', '30'],
      ['30', '40'],
    ];
    points.forEach((points, index) => {
      const formattedScore = formatScore(Object.assign({}, seedScore, {
        currentGame: {
          p1: points[0],
          p2: points[1]
        }}));
      expect(formattedScore.currentGame.p1).toBe(expectedDisplayPoints[index][0]);
      expect(formattedScore.currentGame.p2).toBe(expectedDisplayPoints[index][1]);
    })
  });
  it('deuce and advantage', () => {
    const points = [
      [3 ,3],
      [3, 4],
      [4, 4],
      [5, 4],
      [5, 5],
    ];
    const expectedDisplayPoints = [
      ['Deuce', 'Deuce'],
      ['-', 'Advantage'],
      ['Deuce', 'Deuce'],
      ['Advantage', '-'],
      ['Deuce', 'Deuce'],
    ];
    points.forEach((points, index) => {
      const formattedScore = formatScore(Object.assign({}, seedScore, {
        currentGame: {
          p1: points[0],
          p2: points[1]
        }}));
      expect(formattedScore.currentGame.p1).toBe(expectedDisplayPoints[index][0]);
      expect(formattedScore.currentGame.p2).toBe(expectedDisplayPoints[index][1]);
    })
  });
});

describe('scoring', () => {
  it('ongoing game points lower than match point', () => {
    const currentScore = {...seedScore, 
      sets: [ {p1: 0, p2: 0} ],
      currentGame: {p1: 0, p2: 0}
    };
    const newScore = recordPointForScore(currentScore, 'p1');
    expect(newScore.currentGame.p1).toBe(1);
    expect(newScore.currentGame.p2).toBe(0);
  });
  it('deuce and advantage', () => {
    const currentScores = [
    {
      ...seedScore, 
      currentGame: {p1: 3, p2: 3} // deuce
    },
    { ...seedScore,
      currentGame: {p1: 4, p2: 3} // win after advantage
    },
    {
      ...seedScore,
      sets: [{p1: 5, p2: 4}],
      currentGame: {p1: 4, p2: 3} // match win and new set
    }
    ];
    const expectedScores = [{
      ...seedScore,
      currentGame: {p1: 4, p2: 3}
    },
    {
      ...seedScore,
      sets: [{p1: 1, p2: 0}],
      currentGame: {p1: 0, p2: 0}
    },
    {
      ...seedScore,
      sets: [{p1: 6, p2: 4}, {p1: 0, p2: 0}],
      currentGame: {p1: 0, p2: 0} // match win and new set
    }
    ];
    currentScores.forEach((currentScore, index) => {
      const newScore = recordPointForScore(currentScore, 'p1');
      expect(newScore).toEqual(expectedScores[index]);
    })
    expect(1).toBe(1);
  });
  it('set tie breaker', () => {
    const currentScores = [
    {
      ...seedScore,
      sets: [{p1: 6, p2: 5}],
      currentGame: {p1: 2, p2: 3} // lead to tie breaker
    },
    {
      ...seedScore,
      sets: [{p1: 6, p2: 6}],
      currentGame: {p1: 3, p2: 4} // beyond point 3
    },
    {
      ...seedScore,
      sets: [{p1: 6, p2: 6}],
      currentGame: {p1: 5, p2: 6} // win p2 by first reaching 7
    },
    {
      ...seedScore,
      sets: [{p1: 6, p2: 6}],
      currentGame: {p1: 9, p2: 10} // win p2 by more than 1 point
    }
    ];
    const expectedScores = [
    {
      ...seedScore,
      sets: [{p1: 6, p2: 6}],
      currentGame: {p1: 0, p2: 0} // match win and new set
    },
    {
      ...seedScore,
      sets: [{p1: 6, p2: 6}],
      currentGame: {p1: 3, p2: 5} // match win and new set
    },
    {
      ...seedScore,
      sets: [{p1: 6, p2: 7}, { p1: 0, p2: 0 }],
      currentGame: {p1: 0, p2: 0} // win p2 by first reaching 7
    },
    {
      ...seedScore,
      sets: [{p1: 6, p2: 7}, {p1: 0, p2: 0}],
      currentGame: {p1: 0, p2: 0} // win p2 by more than 1 point
    }];
    currentScores.forEach((currentScore, index) => {
      const newScore = recordPointForScore(currentScore, 'p2');
      expect(newScore).toEqual(expectedScores[index]);
    })
  });
});
