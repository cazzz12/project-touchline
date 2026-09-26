import {roundNumber} from './fitness.js';

// Transfer allowances are game credits, not the real clubs' finances.
export const START_BUDGET=120000, ROUND_ALLOWANCE=8000, MAX_CLUB_BUDGET=1e12;
export const incomingOpen=o=>o.status==='open';
export function ensureClubMarket(game){
  if(game.clubMarket===undefined)game.clubMarket={schema:1,lastRound:roundNumber(game),nextId:1,offers:[],clubs:game.clubs.slice(1).map(c=>({name:c.name,balance:START_BUDGET,opening:START_BUDGET,nextEntry:1,ledger:[]}))};
  return game;
}
export const clubBudget=(game,index)=>game.clubMarket?.clubs[index-1]?.balance??0;
export function recordClubBudget(game,index,amount,label){
  const account=game.clubMarket.clubs[index-1];
  account.balance+=amount;
  account.ledger.push({id:account.nextEntry++,season:game.season,round:game.round,amount,balance:account.balance,label});
  if(account.ledger.length>100)account.opening=account.ledger.shift().balance;
}
export function expireIncoming(game){
  for(const offer of game.clubMarket?.offers||[])if(incomingOpen(offer))offer.status='expired';
}
export function closePlayerOffers(game,id){
  for(const offer of game.clubMarket?.offers||[])if(incomingOpen(offer)&&offer.playerId===id)offer.status='unavailable';
}
