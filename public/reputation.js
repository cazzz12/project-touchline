import {roundNumber} from './fitness.js';

// Earned in this career only: these are not rankings of the real clubs.
export const reputationLevels=[{name:'In opbouw',points:0},{name:'Gevestigd',points:100},{name:'Toonaangevend',points:300}];
export const resultPoints={win:12,draw:5,loss:1,forfeit:0};
export const seasonPoints=[50,30,20,10,5,0];
export const reputationLevel=points=>reputationLevels.findLast(level=>points>=level.points)||reputationLevels[0];
export function ensureReputation(game){
  if(game.reputation===undefined)game.reputation={schema:1,sinceSeason:game.season,sinceRound:game.round,
    lastRound:roundNumber(game),lastSeason:game.season-1,points:0,openingPoints:0,
    totals:{win:0,draw:0,loss:0,forfeit:0,seasons:0,seasonPoints:0},
    current:{season:game.season,matches:0},history:[]};
  return game;
}
export function reputationOutcome(match){
  const side=match.home===0?0:1;
  return match.forfeit?.includes(side)?'forfeit':match.goals[side]>match.goals[1-side]?'win':match.goals[side]===match.goals[1-side]?'draw':'loss';
}
function award(game,kind,gain,round,extra={}){
  const r=game.reputation,before=reputationLevel(r.points);
  r.points+=gain;
  const entry={season:game.season,round,kind,gain,total:r.points,...extra};
  r.history.push(entry);
  if(r.history.length>40)r.openingPoints=r.history.shift().total;
  const after=reputationLevel(r.points);
  if(after!==before)game.news.unshift(`Clubreputatie: ${after.name} bereikt. Er is een nieuw sponsorcontract beschikbaar bij Clubzaken.`);
  return {gain,total:r.points};
}
export function settleReputation(game,match,pending){
  if(!pending||pending!==game.pending||pending.reputationRules!==1||(pending.minute!==90&&!pending.abandoned?.length))return null;
  ensureReputation(game);const r=game.reputation,stamp=roundNumber(game)+1;
  if(r.lastRound>=stamp||r.current.season!==game.season)return null;
  r.lastRound=stamp;r.current.matches++;
  const outcome=reputationOutcome(match);r.totals[outcome]++;
  return award(game,outcome,resultPoints[outcome],game.round+1);
}
export function closeReputationSeason(game,place){
  ensureReputation(game);const r=game.reputation;
  if(game.pending||game.round!==10||!Number.isInteger(place)||place<1||place>6||r.lastSeason>=game.season)return null;
  r.lastSeason=game.season;
  // No full-season award for a partially migrated or legacy live season.
  if(r.current.season!==game.season||r.current.matches!==10)return null;
  const gain=seasonPoints[place-1];r.totals.seasons++;r.totals.seasonPoints+=gain;
  return award(game,'season',gain,11,{place});
}
