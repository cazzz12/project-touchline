import {availablePlayers,injuryFor,unavailablePlayer} from './fitness.js';
import {expireIncoming} from './club-market-state.js';
// Local negotiations only; no real offers or money leave the browser.
export const openOffer = offer => ['accepted','counter'].includes(offer.status);
export function ensureTransferDesk(game){
  if(game.transferDesk===undefined)game.transferDesk={schema:1,nextId:1,offers:[]};
  return game;
}
export function expireTransferOffers(game){
  expireIncoming(game);
  for(const offer of game.transferDesk?.offers||[])if(openOffer(offer))offer.status='expired';
}

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
