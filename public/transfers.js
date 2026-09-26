import {overall,transferValue,recordCash} from './management.js';
import {availablePlayers,injuryFor,unavailablePlayer,recommendedSquad} from './fitness.js';
import {ensureTransferDesk,openOffer} from './transfer-state.js';

export function releaseReason(game,index,id){
  const club=game.clubs[index],p=club?.players.find(p=>p.id===id);
  if(!p)return 'Deze speler speelt hier niet meer.';
  if(club.players.length<=18)return 'De club wil minimaal achttien spelers houden.';
  if(p.position==='GK'&&club.players.filter(p=>p.position==='GK').length<=2)return 'De club wil minimaal twee keepers houden.';
  const healthy=club.players.filter(p=>!injuryFor(game,p.id));
  if(!injuryFor(game,id)&&(healthy.length<=18||(p.position==='GK'&&healthy.filter(p=>p.position==='GK').length<=2)))return 'De club heeft te weinig fitte vervangers.';
  const available=availablePlayers(game,index);
  if(!unavailablePlayer(game,id)&&(available.length<=18||(p.position==='GK'&&available.filter(p=>p.position==='GK').length<=2)))return 'De club heeft te weinig inzetbare vervangers.';
  return '';
}
export function clubTransferQuote(game,seller,id){
  if(!Number.isInteger(seller)||seller<1||seller>=game.clubs.length)return null;
  const club=game.clubs[seller],player=club.players.find(p=>p.id===id);if(!player)return null;
  const starter=recommendedSquad(game,seller,'4-3-3').lineupIds.includes(id);
  const asking=Math.max(1000,Math.round(transferValue(player)*(starter?1.25:1.05)));
  const reason=game.pending?'Rond eerst de lopende wedstrijd af.':game.clubs[0].players.length>=55?'Je selectie zit vol (55 spelers).':releaseReason(game,seller,id);
  return {player,seller,sellerName:club.name,asking,starter,salary:Math.max(100,(overall(player)-40)*15),untilSeason:game.season+2,reason};
}
export function submitClubBid(game,seller,id,amount){
  const q=clubTransferQuote(game,seller,id);
  if(!q||q.reason||!Number.isSafeInteger(amount)||amount<1||amount>1e9||amount>game.credits)return null;
  ensureTransferDesk(game);const desk=game.transferDesk;
  const same=desk.offers.filter(o=>openOffer(o)&&o.playerId===id);
  if(desk.offers.filter(openOffer).length-same.length>=5)return null;
  for(const o of same)o.status='superseded';
  const status=amount>=Math.ceil(q.asking*.9)?'accepted':amount>=Math.ceil(q.asking*.65)?'counter':'rejected';
  const offer={id:desk.nextId++,playerId:id,name:q.player.name,seller,sellerName:q.sellerName,season:game.season,round:game.round,
    asking:q.asking,amount,price:status==='counter'?Math.ceil(q.asking*.95):status==='accepted'?amount:0,
    salary:q.salary,untilSeason:q.untilSeason,status};
  desk.offers.push(offer);
  while(desk.offers.length>25)desk.offers.splice(desk.offers.findIndex(o=>!openOffer(o)),1);
  return offer;
}
export function cancelClubBid(game,id){
  const offer=game.transferDesk?.offers.find(o=>o.id===id);
  if(game.pending||!offer||!openOffer(offer))return false;
  offer.status='withdrawn';return true;
}
export function purchaseReason(game,offer){
  if(!offer||!openOffer(offer))return 'Deze onderhandeling is gesloten.';
  if(offer.season!==game.season||offer.round!==game.round)return 'Het aanbod is verlopen.';
  const q=clubTransferQuote(game,offer.seller,offer.playerId);
  if(!q)return 'De speler is niet meer beschikbaar.';
  if(q.reason)return q.reason;
  if(game.credits<offer.price)return 'Je hebt onvoldoende credits voor deze aankoop.';
  return '';
}
export function confirmClubPurchase(game,id){
  const offer=game.transferDesk?.offers.find(o=>o.id===id);
  if(purchaseReason(game,offer))return false;
  const seller=game.clubs[offer.seller],player=seller.players.find(p=>p.id===offer.playerId);
  const moved={...player};delete moved.number;
  recordCash(game,-offer.price,'transfer',`${player.name} gekocht van ${seller.name}`);
  seller.players=seller.players.filter(p=>p.id!==player.id);game.clubs[0].players.push(moved);
  game.management.contracts[player.id]={salary:offer.salary,untilSeason:offer.untilSeason};
  offer.status='completed';
  game.news.unshift(`${player.name} overgenomen van ${seller.name} voor ${offer.price.toLocaleString('nl-NL')} credits.`);
  // Selection is a manager choice. Identity-keyed history, injuries and bans stay.
  return true;
}
