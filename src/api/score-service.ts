export interface PlayerSet {
  p1: string;
  p2: string;
} 

export interface Game
{
  name: string;
  players: PlayerSet;
}

export interface SetScore
{
  p1: number;
  p2: number;
}

export interface MatchScore
{
  p1: number;
  p2: number;
}

export interface MatchScoreDisplay
{
  p1: string;
  p2: string;
}

export interface Score
{
  gameId: number;
  players: PlayerSet; 
  name: string;
  sets: Array<SetScore>;
  currentGame: MatchScore;
}

export interface ScoreDisplay extends Omit<Score, 'currentGame'> {
  currentGame: MatchScoreDisplay;
}

export interface Point
{
  gameId: number;
  point: string;
}

export interface ScoreDataStore {
  [key: number]: Score
}

const scoreDataStore: ScoreDataStore = {};
export function formatScore(score: Score): ScoreDisplay {
  const sets = score.sets;
  const currentSet = sets[sets.length - 1];
  const setp1 = currentSet.p1;
  const setp2 = currentSet.p2;
  const pointp1 = score.currentGame.p1;
  const pointp2 = score.currentGame.p2;
  const isTieBreaker = setp1 === 6 && setp2 === 6;
  let newPointp1 = pointp1.toString();
  let newPointp2 = pointp2.toString();
  const pointMap: {[key: number] : string} = {
    0: '0',
    1: '15',
    2: '30',
    3: '40',
  };
  if (!isTieBreaker) {
    // check if either point less than 4
    if((pointp1 <= 3 && pointp2 < 3)
       || (pointp2 <= 3 && pointp1 < 3)) {
      newPointp1 = pointMap[pointp1];
      newPointp2 = pointMap[pointp2];
    } else {
      // Check for Deuce
      if (pointp1 === pointp2) {
        newPointp1 = newPointp2 = 'Deuce';
      } else if (pointp1 > pointp2) {
        newPointp1 = 'Advantage';
        newPointp2 = '-';
      } else if (pointp2 > pointp1) {
        newPointp2 = 'Advantage';
        newPointp1 = '-';
      }
    }
  }
  const newCurrentGameScore = {
    p1: newPointp1,
    p2: newPointp2
  }
  return Object.assign({}, score, {currentGame: newCurrentGameScore})
}

export function getScore(gameId: number): ScoreDisplay {
  return formatScore(scoreDataStore[gameId]);
}

export function createGame(name: string, players: PlayerSet): number {
  const newId: number = Object.keys(scoreDataStore).length;
  // scoreDataStore[newId] = seedScore;
  scoreDataStore[newId] = {
    gameId: newId,
    name,
    players,
    sets: [{p1: 0, p2: 0}],
    currentGame: {
      p1: 0,
      p2: 0
    }
  };
  return newId;
}

function getMatchWinner(pointp1: number, pointp2: number, isTieBreaker: boolean): string | undefined {
  const winningThreshold = isTieBreaker ? 7 : 4;
  if(pointp1 >= winningThreshold || pointp2 >= winningThreshold) {
    if(pointp1 >= pointp2 + 2) {
      return 'p1';
    } else if(pointp2 >= pointp1 + 2) {
      return 'p2';
    }
  }
  return;
}

function getSetWinner(setp1: number, setp2: number): string | undefined {
  const winningThreshold = 6;
  if(setp1 >= winningThreshold || setp2 >= winningThreshold) {
    if(setp1 >= setp2 + 2) {
      return 'p1';
    } else if(setp2 >= setp2 + 2) {
      return 'p2';
    }
  }
  return;
}

export function recordPointForScore(currentScore: Score, pointWinner: string): Score {
  const sets = currentScore.sets;
  const pointp1 = currentScore.currentGame.p1;
  const pointp2 = currentScore.currentGame.p2;
  const currentGame = currentScore.currentGame;
  const currentSet = sets[sets.length - 1];
  const setp1 = currentSet.p1;
  const setp2 = currentSet.p2;
  // add match point and if over
  //  - add set point and if over
  //    - is game over if yes then update winner and return
  //    - if game not over
  //   - initialize a new Set
  //  - initialize a new game
  const newPointp1 = pointWinner === 'p1' ? pointp1 + 1 : pointp1;
  const newPointp2 = pointWinner === 'p2' ? pointp2 + 1 : pointp2;
  const isTieBreaker = setp1 === 6 && setp2 === 6;
  const matchWinner =  getMatchWinner(newPointp1, newPointp2 ,isTieBreaker);
  if(matchWinner) {
    const newSetp1 = matchWinner === 'p1' ? setp1 + 1 : setp1;
    const newSetp2 = matchWinner === 'p2' ? setp2 + 1 : setp2;
    if(isTieBreaker || getSetWinner(newSetp1, newSetp2)) {
      // initialize new set
      currentScore.sets.push({p1: 0, p2: 0});
    }
    // update the set point
    currentSet.p1 = newSetp1;
    currentSet.p2 = newSetp2;
    // initialize new match
    currentGame.p1 = 0;
    currentGame.p2 = 0;
  } else {
    // update just the match point
    currentGame.p1 = newPointp1;
    currentGame.p2 = newPointp2;
  }
  return currentScore;
}

export function recordPoint(gameId: number, pointWinner: string): ScoreDisplay | null {
  const currentScore = scoreDataStore[gameId];
  if (currentScore) {
    return formatScore(recordPointForScore(currentScore, pointWinner)) ;
  }
  return null;
}
