import test from 'node:test';
import assert from 'node:assert/strict';
import {KEY,newGame,playRound,newSeason} from '../public/game.js';

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
