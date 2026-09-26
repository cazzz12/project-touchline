import {overall,transferValue} from './management.js';
import {unavailablePlayer,recommendedSquad,roundNumber} from './fitness.js';
import {releaseReason} from './transfer-state.js';
import {clubBudget,recordClubBudget,MAX_CLUB_BUDGET} from './club-market-state.js';
import {broadRole} from './scouting-state.js';
import {ensureLeagueMarket,desiredDepth,retainedDepth} from './league-market-state.js';

// One deterministic decision per completed round, using only existing players.
// The manager's club (index 0) is never a buyer or seller in this system.
export function leagueCandidate(game,buyer){
  if(!Number.isInteger(buyer)||buyer<1||buyer>5||game.pending||game.clubs[buyer].players.length>=55)return null;
  const transferred=new Set((game.leagueMarket?.history||[]).filter(t=>t.season===game.season).map(t=>t.playerId));
  const club=game.clubs[buyer],candidates=[];
  for(let seller=1;seller<game.clubs.length;seller++){
    if(seller===buyer)continue;
    const source=game.clubs[seller],starters=new Set(recommendedSquad(game,seller,'4-3-3').lineupIds);
    for(const p of source.players){
      const role=broadRole(p),price=Math.max(1000,Math.round(transferValue(p)*1.05));
      if(transferred.has(p.id)||starters.has(p.id)||unavailablePlayer(game,p.id)||releaseReason(game,seller,p.id)
        ||source.players.filter(v=>broadRole(v)===role).length<=retainedDepth[role]
        ||price>clubBudget(game,buyer)||clubBudget(game,seller)+price>MAX_CLUB_BUDGET)continue;
      const peers=club.players.filter(v=>broadRole(v)===role),average=peers.length?peers.reduce((n,v)=>n+overall(v),0)/peers.length:0;
      const improvement=overall(p)-average,depth=peers.length<desiredDepth[role];
      if(depth?improvement < -5:improvement < 3)continue;
      candidates.push({player:p,buyer,seller,role,price,reason:depth?'depth':'quality',score:improvement+(depth?20:0)});
    }
  }
  return candidates.sort((a,b)=>b.score-a.score||a.price-b.price||a.player.id.localeCompare(b.player.id)||a.seller-b.seller)[0]||null;
}

export function settleLeagueMarket(game,rules){
  if(rules!==1||game.pending||game.round<1||game.results.filter(r=>r.round===game.round).length!==3)return null;
  ensureLeagueMarket(game);const market=game.leagueMarket,stamp=roundNumber(game);
  // The existing club-market settlement must grant allowances first.
  if(market.lastRound>=stamp||game.clubMarket.lastRound!==stamp)return null;
  market.lastRound=stamp;
  let q=null;
  for(let n=0;n<5&&!q;n++)q=leagueCandidate(game,1+(stamp-1+n)%5);
  if(!q)return null;
  const {player,buyer,seller,role,price,reason}=q,buyerClub=game.clubs[buyer],sellerClub=game.clubs[seller];
  const moved={...player};delete moved.number;
  recordClubBudget(game,buyer,-price,`${player.name} gekocht van ${sellerClub.name}`);
  recordClubBudget(game,seller,price,`${player.name} verkocht aan ${buyerClub.name}`);
  sellerClub.players=sellerClub.players.filter(p=>p.id!==player.id);buyerClub.players.push(moved);
  const entry={id:market.nextId++,season:game.season,round:game.round,playerId:player.id,name:player.name,buyer,seller,
    buyerName:buyerClub.name,sellerName:sellerClub.name,role,price,reason,rating:overall(player)};
  market.history.push(entry);market.totalVolume+=price;
  if(market.history.length>50)market.archivedVolume+=market.history.shift().price;
  game.news.unshift(`${buyerClub.name} neemt ${player.name} over van ${sellerClub.name} voor ${price.toLocaleString('nl-NL')} credits. Bekijk het transferjournaal.`);
  // Injury, discipline, development and career records stay keyed by player ID.
  return entry;
}
