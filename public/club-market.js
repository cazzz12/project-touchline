import {overall,transferValue,saleReason,completePlayerSale} from './management.js';
import {settleLeagueMarket} from './league-market.js';
import {unavailablePlayer,roundNumber} from './fitness.js';
import {ensureClubMarket,incomingOpen,clubBudget,recordClubBudget,expireIncoming,ROUND_ALLOWANCE,MAX_CLUB_BUDGET} from './club-market-state.js';

export const playerRole=p=>p.position==='GK'?'GK':['DEF','RB','CB','LB'].includes(p.position)?'DEF':['ATT','RW','LW','ST'].includes(p.position)?'ATT':'MID';
const targetDepth={GK:3,DEF:8,MID:7,ATT:5};
function candidate(game,buyer,excluded){
  const club=game.clubs[buyer];
  return game.clubs[0].players.flatMap(p=>{
    if(excluded.has(p.id)||unavailablePlayer(game,p.id))return [];
    const valuation=Math.max(1000,transferValue(p)),price=Math.floor(valuation*.85);
    if(saleReason(game,p.id,buyer,price))return [];
    const role=playerRole(p),peers=club.players.filter(v=>playerRole(v)===role);
    const average=peers.length?peers.reduce((n,v)=>n+overall(v),0)/peers.length:0;
    const improvement=overall(p)-average,depth=peers.length<targetDepth[role];
    if(!depth&&improvement<1)return [];
    return [{player:p,valuation,price,role,reason:depth?'depth':'quality',score:improvement+(depth?20:0)}];
  }).sort((a,b)=>b.score-a.score||a.price-b.price||(a.player.id<b.player.id?-1:1))[0];
}
// Called only after a completed round. Reads and reloads never generate offers.
export function settleClubMarket(game,leagueRules=0){
  ensureClubMarket(game);const market=game.clubMarket,stamp=roundNumber(game);
  if(game.pending||game.round<1||market.lastRound>=stamp||game.results.filter(r=>r.round===game.round).length!==3)return 0;
  expireIncoming(game);market.lastRound=stamp;
  for(let buyer=1;buyer<game.clubs.length;buyer++){
    const allowance=Math.min(ROUND_ALLOWANCE,MAX_CLUB_BUDGET-clubBudget(game,buyer));
    if(allowance)recordClubBudget(game,buyer,allowance,'Transferbijdrage na speeldag');
  }
  settleLeagueMarket(game,leagueRules);
  let count=0;const excluded=new Set();
  // Rotate first choice between clubs; no randomness that can be rerolled by reload.
  for(let n=0;n<5&&count<3;n++){
    const buyer=1+(stamp-1+n)%5,q=candidate(game,buyer,excluded);if(!q)continue;
    market.offers.push({id:market.nextId++,buyer,buyerName:game.clubs[buyer].name,playerId:q.player.id,name:q.player.name,
      valuation:q.valuation,price:q.price,role:q.role,reason:q.reason,season:game.season,round:game.round,status:'open'});
    excluded.add(q.player.id);count++;
  }
  while(market.offers.length>25)market.offers.splice(market.offers.findIndex(o=>!incomingOpen(o)),1);
  if(count)game.news.unshift(`${count} ${count===1?'transferbod ontvangen':'transferbiedingen ontvangen'}. Bekijk Ontvangen biedingen bij Scouting & transfers.`);
  return count;
}
export function incomingSaleReason(game,offer){
  if(!offer||!incomingOpen(offer))return 'Dit bod is niet meer beschikbaar.';
  if(offer.season!==game.season||offer.round!==game.round)return 'Dit bod is verlopen.';
  return saleReason(game,offer.playerId,offer.buyer,offer.price);
}
export function rejectIncomingOffer(game,id){
  const o=game.clubMarket?.offers.find(o=>o.id===id);
  if(game.pending||!o||!incomingOpen(o)||o.season!==game.season||o.round!==game.round)return false;
  o.status='rejected';return true;
}
// The game wrapper repairs a lineup only after this confirmed sale succeeds.
export function completeIncomingSale(game,id){
  const o=game.clubMarket?.offers.find(o=>o.id===id);
  if(incomingSaleReason(game,o)||!completePlayerSale(game,o.playerId,o.buyer,o.price))return false;
  o.status='completed';return true;
}
