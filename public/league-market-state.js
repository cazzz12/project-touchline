import {roundNumber} from './fitness.js';

// Migration records a starting point; it never performs retroactive transfers.
export function ensureLeagueMarket(game){
  if(game.leagueMarket===undefined)game.leagueMarket={schema:1,sinceSeason:game.season,sinceRound:game.round,lastRound:roundNumber(game),nextId:1,totalVolume:0,archivedVolume:0,history:[]};
  return game;
}
export const desiredDepth={GK:3,DEF:8,MID:7,ATT:5};
export const retainedDepth={GK:2,DEF:5,MID:5,ATT:3};
