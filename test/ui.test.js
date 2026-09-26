import test from 'node:test';
import assert from 'node:assert/strict';
import { KEY, newGame, beginMatch, advanceMatch } from '../public/game.js';

test('app controls preserve a live match through pause, substitution, reload and final report',async t=>{
  // Small DOM adapter tests app event wiring; this is not a visual browser test.
  const handlers={},storage=new Map([[KEY,JSON.stringify(newGame('PSV'))]]);
  const fields={'#sub-out':{value:''},'#sub-in':{value:''}};
  const app={innerHTML:'',addEventListener(type,handler){handlers[type]=handler;}};
  const previous={document:globalThis.document,localStorage:globalThis.localStorage,setInterval:globalThis.setInterval,clearInterval:globalThis.clearInterval};
  let tick=null;
  globalThis.document={querySelector(selector){return selector==='#app'?app:fields[selector];}};
  globalThis.localStorage={getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)};
  globalThis.setInterval=fn=>{tick=fn;return 1;};
  globalThis.clearInterval=()=>{tick=null;};
  t.after(()=>Object.assign(globalThis,previous));
  const click=dataset=>handlers.click({target:{closest:()=>({dataset,disabled:false})}});
  const state=()=>JSON.parse(storage.get(KEY));
  await import('../public/app.js?ui-test');
  click({tab:'squad'});
  assert.match(app.innerHTML,/Aanvoerder & wisselbank/);
  assert.equal((app.innerHTML.match(/data-bench=/g)||[]).length,7);
  click({tab:'overview'});click({action:'play'});
  assert.match(app.innerHTML,/AFTRAP/);
  assert.equal(state().pending.minute,0);
  click({action:'resume'});
  for(let i=0;i<25;i++)tick();
  click({action:'pause'});
  assert.equal(state().pending.minute,25);
  const oldCaptain=state().pending.captainId;
  fields['#sub-out'].value=oldCaptain;fields['#sub-in'].value=state().pending.bench[0];
  click({action:'sub'});
  assert.equal(state().pending.subs,1);
  assert.match(app.innerHTML,/Wissel toegepast!/);
  click({action:'save-close'});assert.doesNotMatch(app.innerHTML,/role="dialog"/);
  await import('../public/app.js?ui-reload');
  assert.match(app.innerHTML,/25'/);assert.match(app.innerHTML,/HERVATTEN/);
  assert.equal(state().pending.subs,1);
  click({action:'resume'});
  while(tick)tick();
  assert.equal(state().pending.minute,27);assert.match(app.innerHTML,/Lichte klachten: wisselen of doorspelen/);
  assert.match(app.innerHTML,/Mauro Júnior/);assert.match(app.innerHTML,/LICHTE TIK/);
  click({action:'resume'});while(tick)tick();
  assert.equal(state().pending.minute,45);assert.match(app.innerHTML,/START TWEEDE HELFT/);
  click({action:'resume'});
  while(tick)tick();
  assert.equal(state().pending,null);assert.equal(state().round,1);
  assert.match(app.innerHTML,/FULL TIME/);assert.match(app.innerHTML,/Passnauwkeurigheid/);
  const credits=state().credits;
  click({action:'close'});assert.doesNotMatch(app.innerHTML,/role="dialog"/);
  click({action:'report'});assert.match(app.innerHTML,/FULL TIME/);
  assert.equal(state().credits,credits);
});

test('injury UI preserves the pause after reload and a confirmed substitution preserves injury recovery',async t=>{
  const g=newGame('PSV');beginMatch(g);while(g.pending.minute<27){g.pending.paused=false;advanceMatch(g);}
  const event=g.pending.events.find(e=>e.type==='injury'),handlers={},storage=new Map([[KEY,JSON.stringify(g)]]);
  let focused=false;
  const fields={'#sub-out':{value:''},'#sub-in':{value:g.pending.bench.find(id=>g.clubs[0].players.find(p=>p.id===id).position!=='GK'),focus(){focused=true;}}};
  const app={innerHTML:'',addEventListener(type,handler){handlers[type]=handler;}};
  const previous={document:globalThis.document,localStorage:globalThis.localStorage,setInterval:globalThis.setInterval,clearInterval:globalThis.clearInterval};let tick=null;
  globalThis.document={querySelector:selector=>selector==='#app'?app:fields[selector]};
  globalThis.localStorage={getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)};
  globalThis.setInterval=fn=>{tick=fn;return 1;};globalThis.clearInterval=()=>{tick=null;};t.after(()=>Object.assign(globalThis,previous));
  const click=dataset=>handlers.click({target:{closest:()=>({dataset,disabled:false})}}),state=()=>JSON.parse(storage.get(KEY));
  await import('../public/app.js?injury-ui');assert.match(app.innerHTML,/Lichte klachten: wisselen of doorspelen/);assert.equal(tick,null);
  click({action:'save-close'});await import('../public/app.js?injury-ui-reload');assert.equal(tick,null);assert.equal(state().pending.minute,27);assert.equal(state().pending.paused,true);
  const beforeChoice=state();click({action:'injury-sub'});assert.equal(fields['#sub-out'].value,event.playerId);assert.equal(focused,true);assert.deepEqual(state(),beforeChoice);
  click({action:'sub'});assert.equal(state().pending.subs,1);assert.ok(!state().pending.selection.includes(event.playerId));assert.match(app.innerHTML,/van het veld/);assert.equal(state().credits,120000);
  while(state().pending){click({action:'resume'});while(tick)tick();}
  assert.equal(state().management.playerStats[event.playerId].minutes,27);assert.equal(state().medical.injuries[event.playerId].remaining,1);
  click({action:'close'});click({tab:'inbox'});assert.match(app.innerHTML,/aria-label="Blessures:/);assert.match(app.innerHTML,/Mauro Júnior · Lichte tik · 1 speeldag niet inzetbaar/);
});
