import {unavailableSelection,applyRecommendedSquad} from '../public/fitness.js';
function playRound(game){if(unavailableSelection(game).length)applyRecommendedSquad(game);return playRoundWithoutRotation(game);}
import test from 'node:test';
import assert from 'node:assert/strict';
import {KEY,newGame,playRound as playRoundWithoutRotation,newSeason} from '../public/game.js';

let instance=0;
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
  h.click({office:'contracts'});const id=h.state().lineupIds[2],before=h.state();
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
