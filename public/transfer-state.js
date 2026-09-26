// Local negotiations only; no real offers or money leave the browser.
export const openOffer = offer => ['accepted','counter'].includes(offer.status);
export function ensureTransferDesk(game){
  if(game.transferDesk===undefined)game.transferDesk={schema:1,nextId:1,offers:[]};
  return game;
}
export function expireTransferOffers(game){
  for(const offer of game.transferDesk?.offers||[])if(openOffer(offer))offer.status='expired';
}
