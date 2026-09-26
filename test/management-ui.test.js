import {unavailableSelection,applyRecommendedSquad} from '../public/fitness.js';
function playRound(game){if(unavailableSelection(game).length)applyRecommendedSquad(game);return playRoundWithoutRotation(game);}
import test from 'node:test';
import assert from 'node:assert/strict';
import {KEY,newGame,playRound as playRoundWithoutRotation,newSeason,beginMatch,advanceMatch} from '../public/game.js';
import {recordCash,saleOffer,renewExpiring} from '../public/management.js';
import {clubTransferQuote,releaseReason} from '../public/transfers.js';

let instance=0;
test('reputation UI explains progress, leaves saves unchanged and blocks unearned sponsorships',async t=>{
  const g=newGame(),h=await boot(t,g),before=h.state();
  h.click({office:'reputation'});assert.match(h.app.innerHTML,/Clubreputatie/);assert.match(h.app.innerHTML,/Nog 100 punten tot Gevestigd/);assert.deepEqual(h.state(),before);
  h.click({office:'sponsors'});assert.match(h.app.innerHTML,/data-sponsor="regional" disabled/);assert.match(h.app.innerHTML,/data-sponsor="national" disabled/);
  h.click({sponsor:'regional'});assert.deepEqual(h.state(),before);assert.match(h.app.innerHTML,/nu niet afsluiten/);
});
test('the reputation report links to preserved history and an earned sponsor remains active after reload',async t=>{
  const g=newGame();for(let i=0;i<100&&g.reputation.points<300;i++){if(g.round===10)newSeason(g);renewExpiring(g);playRound(g);}
  assert.ok(g.reputation.points>=300);if(g.round===10)newSeason(g);playRound(g);
  const h=await boot(t,g);assert.match(h.app.innerHTML,/Clubreputatie \+/);h.click({action:'view-reputation'});assert.match(h.app.innerHTML,/Recente reputatie/);assert.match(h.app.innerHTML,/Toonaangevend/);assert.equal(h.state().reportOpen,false);
  h.click({office:'sponsors'});assert.match(h.app.innerHTML,/data-sponsor="national" >/);const cash=h.state().credits;h.click({sponsor:'national'});
  assert.equal(h.state().management.sponsor.kind,'national');assert.equal(h.state().credits,cash);assert.match(h.app.innerHTML,/CONTRACT ACTIEF/);
  const reloaded=await boot(t,h.state());reloaded.click({office:'sponsors'});assert.match(reloaded.app.innerHTML,/ACTIEF CONTRACT/);const before=reloaded.state();reloaded.click({sponsor:'regional'});assert.deepEqual(reloaded.state(),before);
});
test('club transfer UI filters, previews, saves a counteroffer and completes a purchase only after confirmation',async t=>{
  const g=newGame();recordCash(g,1000000,'test','Synthetic UI budget');const h=await boot(t,g),p=g.clubs[1].players.find(p=>!releaseReason(g,1,p.id));
  h.click({tab:'transfers'});assert.match(h.app.innerHTML,/Openstaande aanbiedingen/);
  h.submit('club-transfer-filter',{seller:'1',role:'all',search:p.name});assert.match(h.app.innerHTML,/1 speler bij/);
  const before=h.state();h.click({clubBid:p.id,seller:'1'});assert.match(h.app.innerHTML,/aria-label="Transferbod"/);assert.deepEqual(h.state(),before);
  h.click({transferAction:'close-bid'});assert.deepEqual(h.state(),before);
  h.click({clubBid:p.id,seller:'1'});const amount=Math.floor(clubTransferQuote(g,1,p.id).asking*.75);
  h.submit('club-bid-form',{seller:'1',playerId:p.id,amount:String(amount)});
  const o=h.state().transferDesk.offers[0];assert.equal(o.status,'counter');assert.equal(h.state().credits,before.credits);assert.match(h.app.innerHTML,/Tegenbod ontvangen/);
  h.click({confirmClubPurchase:String(o.id)});assert.equal(h.state().credits,before.credits-o.price);assert.ok(h.state().clubs[0].players.some(v=>v.id===p.id));
  assert.match(h.app.innerHTML,/Aangekocht/);const complete=h.state();h.click({confirmClubPurchase:String(o.id)});assert.deepEqual(h.state(),complete);
});
test('club transfer UI can withdraw without payment and retains access to scouting',async t=>{
  const g=newGame();recordCash(g,1000000,'test','Synthetic UI budget');const h=await boot(t,g),p=g.clubs[1].players.find(p=>!releaseReason(g,1,p.id));
  h.click({tab:'transfers'});h.submit('club-bid-form',{seller:'1',playerId:p.id,amount:String(clubTransferQuote(g,1,p.id).asking)});
  const cash=h.state().credits;h.click({cancelClubBid:String(h.state().transferDesk.offers[0].id)});
  assert.equal(h.state().credits,cash);assert.equal(h.state().transferDesk.offers[0].status,'withdrawn');
  h.click({transferSection:'scouting'});assert.match(h.app.innerHTML,/STUUR SCOUTS/);h.click({action:'scout'});assert.equal(h.state().market.length,4);
});
test('received bid UI previews without changes, cancels and confirms one sale after reload',async t=>{
  const game=newGame();playRound(game);game.reportOpen=false;const h=await boot(t,game),original=h.state(),offer=original.clubMarket.offers[0];
  assert.match(h.app.innerHTML,/TRANSFERPOST/);h.click({transferInbox:'true'});assert.match(h.app.innerHTML,/Transferbudgetten/);
  h.click({confirmIncoming:String(offer.id)});assert.deepEqual(h.state(),original,'confirmation requires a preview');
  h.click({reviewIncoming:String(offer.id)});assert.match(h.app.innerHTML,/Ontvangen bod bevestigen/);assert.deepEqual(h.state(),original);
  h.click({incomingAction:'cancel'});assert.deepEqual(h.state(),original);assert.doesNotMatch(h.app.innerHTML,/Ontvangen bod bevestigen/);
  h.click({reviewIncoming:String(offer.id)});h.click({confirmIncoming:String(offer.id)});
  const sold=h.state();assert.equal(sold.credits,original.credits+offer.price);assert.equal(sold.clubMarket.offers[0].status,'completed');
  assert.equal(sold.clubMarket.clubs[offer.buyer-1].balance,original.clubMarket.clubs[offer.buyer-1].balance-offer.price);
  assert.ok(!sold.clubs[0].players.some(p=>p.id===offer.playerId));h.click({confirmIncoming:String(offer.id)});assert.deepEqual(h.state(),sold);
});
test('received bid UI rejects without moving money and keeps incoming, purchase and scouting tabs accessible',async t=>{
  const game=newGame();playRound(game);game.reportOpen=false;const h=await boot(t,game),before=h.state(),offer=before.clubMarket.offers[0];
  h.click({tab:'transfers'});h.click({transferSection:'incoming'});h.click({rejectIncoming:String(offer.id)});
  const after=h.state();assert.equal(after.clubMarket.offers[0].status,'rejected');assert.equal(after.credits,before.credits);assert.deepEqual(after.clubs,before.clubs);assert.deepEqual(after.clubMarket.clubs,before.clubMarket.clubs);
  h.click({transferSection:'clubs'});assert.match(h.app.innerHTML,/Spelers bij andere clubs/);h.click({transferSection:'scouting'});assert.match(h.app.innerHTML,/STUUR SCOUTS/);
});
test('development UI saves a goal without training, tracks training and shares the existing session limit',async t=>{
  const game=newGame(),p=game.clubs[0].players[0],h=await boot(t,game),before=h.state();
  h.click({tab:'training'});h.click({trainingSection:'development'});assert.match(h.app.innerHTML,/Spelerontwikkeling/);
  h.submit('development-plan-form',{playerId:p.id,attribute:'passing',target:String(p.passing+3)});
  const planned=h.state();assert.deepEqual(planned.clubs,before.clubs);assert.equal(planned.credits,before.credits);assert.equal(planned.management.developmentUsed,false);assert.match(h.app.innerHTML,/Groeiverwachting/);
  h.click({trainPlan:p.id});assert.equal(h.state().clubs[0].players[0].passing,p.passing+1);assert.equal(h.state().development.players[p.id].gains.individual,1);assert.match(h.app.innerHTML,/INDIVIDUELE SESSIE GEBRUIKT/);
  const trained=h.state();h.click({trainPlan:p.id});assert.deepEqual(h.state(),trained);
  h.click({trainingSection:'team'});h.submit('keeper-development-form',{playerId:p.id,attribute:'reflexes'});assert.deepEqual(h.state(),trained);
  h.click({openDevelopment:p.id});assert.match(h.app.innerHTML,/Vaardigheden & groei/);h.click({stopPlan:p.id});assert.equal(h.state().development.players[p.id].plan,null);assert.equal(h.state().development.players[p.id].gains.individual,1);
});
test('development UI rejects an invalid goal and renders keeper skills only for keepers',async t=>{
  const g=newGame(),p=g.clubs[0].players.find(p=>p.position!=='GK'),h=await boot(t,g);
  h.click({openDevelopment:p.id});const before=h.state();assert.doesNotMatch(h.app.innerHTML,/option value="reflexes"/);
  h.submit('development-plan-form',{playerId:p.id,attribute:'reflexes',target:'90'});assert.deepEqual(h.state(),before);
  h.submit('development-plan-form',{playerId:p.id,attribute:'passing',target:'100'});assert.deepEqual(h.state(),before);assert.match(h.app.innerHTML,/hoger doel tot 99/);
  h.click({openDevelopment:g.clubs[0].players.find(p=>p.position==='GK').id});assert.match(h.app.innerHTML,/option value="reflexes"/);
});
async function boot(t,game=newGame('PSV')){
  const handlers={},entries=new Map([[KEY,JSON.stringify(game)]]),app={innerHTML:'',addEventListener:(type,fn)=>handlers[type]=fn};
  const old={document:globalThis.document,localStorage:globalThis.localStorage,FormData:globalThis.FormData};
  globalThis.document={querySelector:selector=>selector==='#app'?app:null};
  globalThis.localStorage={getItem:key=>entries.get(key)??null,setItem:(key,value)=>entries.set(key,value)};
  globalThis.FormData=class{constructor(form){this.data=form.values;}get(key){return this.data[key]??null;}has(key){return key in this.data;}};
  t.after(()=>Object.assign(globalThis,old));
  const click=dataset=>handlers.click({target:{closest:()=>({dataset,disabled:false})}});
  const submit=(id,values)=>handlers.submit({target:{id,values},preventDefault(){}});
  await import(`../public/app.js?management-ui=${++instance}`);
  return {app,click,submit,state:()=>JSON.parse(entries.get(KEY))};
}
test('office actions keep sale preview separate, then book a confirmed transfer and render the ledger',async t=>{
  const h=await boot(t),initial=h.state();
  h.click({office:'sponsors'});h.click({sponsor:'steady'});assert.equal(h.state().management.sponsor.kind,'steady');
  h.click({office:'facilities'});h.click({upgrade:'training',group:'facilities'});
  assert.equal(h.state().management.facilities.training,2);assert.equal(h.state().credits,initial.credits-28000);
  h.click({office:'contracts'});const id=h.state().lineupIds.find(id=>saleOffer(h.state(),id,1)),before=h.state();
  h.click({sell:id});assert.match(h.app.innerHTML,/Verkoopvoorstel/);assert.deepEqual(h.state(),before);
  h.click({management:'cancel-sale'});assert.deepEqual(h.state(),before);
  h.click({sell:id});h.click({management:'confirm-sale'});assert.ok(!h.state().clubs[0].players.some(p=>p.id===id));
  h.click({office:'finances'});assert.match(h.app.innerHTML,/aangetrokken|naar Ajax/);assert.match(h.app.innerHTML,/Beginsaldo/);
});
test('manager, individual training and automatic instructions forms save their actual effects',async t=>{
  const h=await boot(t);h.click({tab:'career'});
  h.submit('manager-form',{managerName:'<Testmanager>'});assert.equal(h.state().management.managerName,'<Testmanager>');assert.match(h.app.innerHTML,/&lt;Testmanager&gt;/);
  h.click({tab:'training'});const p=h.state().clubs[0].players[0];
  h.submit('development-form',{playerId:p.id,attribute:'passing'});
  assert.equal(h.state().clubs[0].players[0].passing,p.passing+1);assert.equal(h.state().management.developmentUsed,true);
  h.submit('development-form',{playerId:p.id,attribute:'passing'});assert.equal(h.state().clubs[0].players[0].passing,p.passing+1);
  h.click({tab:'prematch'});h.submit('auto-form',{chaseGoal:'on',subTired:'on'});
  assert.deepEqual(h.state().management.auto,{protectLead:false,chaseGoal:true,subTired:true});
  h.click({tab:'tactics'});h.click({formation:'3-5-2'});h.click({preset:'counter'});
  assert.equal(h.state().tactics.formation,'3-5-2');assert.equal(h.state().tactics.tempo,80);
});
test('history is rendered after season rollover and expired contracts can be renewed from the office',async t=>{
  const game=newGame();for(let day=0;day<10;day++)playRound(game);newSeason(game);
  for(const contract of Object.values(game.management.contracts))contract.untilSeason=1;
  const h=await boot(t,game);h.click({tab:'career'});assert.match(h.app.innerHTML,/Seizoen 1 · #/);assert.match(h.app.innerHTML,/Doelpunten & speelminuten/);
  h.click({tab:'overview'});h.click({action:'play'});assert.equal(h.state().pending,null);assert.match(h.app.innerHTML,/Verleng eerst/);
  h.click({office:'contracts'});h.click({management:'renew-all'});
  assert.ok(Object.values(h.state().management.contracts).every(c=>c.untilSeason===4));
  h.click({action:'play'});assert.ok(h.state().pending);assert.match(h.app.innerHTML,/AFTRAP/);
});

test('fit squad preview is reversible and only applying it changes the saved manual selection',async t=>{
  const game=newGame('PSV');game.round=1;
  const id=game.lineupIds[2];game.medical.injuries[id]={kind:'muscle',remaining:2,season:1,round:1};
  const h=await boot(t,game),original=h.state();h.click({tab:'squad'});
  assert.match(h.app.innerHTML,/Wie is inzetbaar/);assert.match(h.app.innerHTML,/Spierklachten/);
  h.click({fitness:'preview'});assert.match(h.app.innerHTML,/Voorstel fit elftal/);assert.deepEqual(h.state(),original);
  h.click({fitness:'cancel'});assert.deepEqual(h.state(),original);assert.doesNotMatch(h.app.innerHTML,/aria-label="Voorstel fit elftal"/);
  h.click({fitness:'preview'});h.click({fitness:'apply'});
  assert.ok(![...h.state().lineupIds,...h.state().benchIds].includes(id));assert.equal(h.state().medical.injuries[id].remaining,2);
  assert.equal(h.state().credits,original.credits);assert.equal(new Set([...h.state().lineupIds,...h.state().benchIds]).size,18);
  h.click({action:'play'});assert.ok(h.state().pending);const playing=h.state();h.click({fitness:'preview'});h.click({fitness:'apply'});assert.deepEqual(h.state(),playing);
});

test('injured matchday players produce a useful kickoff message and stay visible in profiles',async t=>{
  const game=newGame();game.round=1;game.medical.injuries[game.lineupIds[2]]={kind:'knock',remaining:1,season:1,round:1};
  const h=await boot(t,game);h.click({action:'play'});assert.equal(h.state().pending,null);assert.match(h.app.innerHTML,/Vervang eerst de geblesseerde spelers/);
  h.click({tab:'prematch'});assert.match(h.app.innerHTML,/geblesseerde speler\(s\) in je wedstrijdselectie/);
  h.click({tab:'clubs'});assert.match(h.app.innerHTML,/Lichte tik/);
  h.click({tab:'training'});assert.ok(!h.app.innerHTML.includes(`<option value="${game.lineupIds[2]}">`));
});

test('keeper profile, training form and career report expose saved keeper effects',async t=>{
  const g=newGame(),p=g.clubs[0].players.find(p=>p.position==='GK'),h=await boot(t,g);
  h.click({tab:'clubs'});assert.match(h.app.innerHTML,/Keeperkwaliteiten/);assert.match(h.app.innerHTML,/Balvastheid/);
  h.click({tab:'training'});assert.match(h.app.innerHTML,/TRAIN DEZE KEEPER/);
  h.submit('keeper-development-form',{playerId:p.id,attribute:'reflexes'});
  assert.equal(h.state().clubs[0].players.find(v=>v.id===p.id).reflexes,p.reflexes+1);
  assert.match(h.app.innerHTML,/SESSIE GEBRUIKT/);
  const before=h.state();h.submit('development-form',{playerId:p.id,attribute:'passing'});assert.deepEqual(h.state(),before);
  h.click({tab:'career'});assert.match(h.app.innerHTML,/Reddingen & de nul/);
});

test('red card UI shows the empty role and position changes preserve the missing player across save',async t=>{
  const g=newGame();g.season=3;delete g.reputation;for(const c of Object.values(g.management.contracts))c.untilSeason=5;
  beginMatch(g);while(g.pending.minute<64){g.pending.paused=false;advanceMatch(g);}
  const h=await boot(t,g);assert.match(h.app.innerHTML,/10 tegen 11/);assert.match(h.app.innerHTML,/RODE KAART/);assert.match(h.app.innerHTML,/LEEG/);
  const missing=h.state().pending.selection.findIndex(id=>id===null),id=h.state().pending.selection[9];
  h.submit('live-position-form',{from:'9',to:String(missing)});assert.equal(h.state().pending.selection[missing],id);assert.equal(h.state().pending.selection.filter(Boolean).length,10);
  const saved=h.state();h.submit('live-position-form',{from:'0',to:'9'});assert.deepEqual(h.state(),saved);assert.match(h.app.innerHTML,/laat iemand in het doel staan/);
});

test('suspended and short squads render warnings, empty places and a usable preview',async t=>{
  const g=newGame();g.round=1;
  for(const p of g.clubs[0].players.slice(9))g.discipline.suspensions[p.id]={reason:'red',remaining:2,season:1,round:1};
  const h=await boot(t,g);h.click({tab:'squad'});assert.match(h.app.innerHTML,/Geschorst/);assert.match(h.app.innerHTML,/9 spelers inzetbaar/);
  h.click({fitness:'preview'});assert.match(h.app.innerHTML,/Lege plek/);h.click({fitness:'apply'});assert.equal(h.state().lineupIds.filter(Boolean).length,9);
  h.click({tab:'prematch'});assert.match(h.app.innerHTML,/Wie mist de volgende speeldag/);
  h.click({action:'play'});assert.ok(h.state().pending);assert.match(h.app.innerHTML,/9 tegen 11/);
});
