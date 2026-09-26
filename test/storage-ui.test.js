import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import { KEY, newGame } from '../public/game.js';
import { RECOVERY_KEY, exportBackup, parseBackup } from '../public/storage.js';

let instance=0;
async function boot(t,raw=JSON.stringify(newGame('PSV'))){
  const handlers={},entries=new Map([[KEY,raw]]),app={innerHTML:'',addEventListener:(type,fn)=>{handlers[type]=fn;}};
  const previous={document:globalThis.document,localStorage:globalThis.localStorage,setInterval:globalThis.setInterval,clearInterval:globalThis.clearInterval};
  const harness={app,entries,handlers,tick:null,fail:false};
  globalThis.document={querySelector:selector=>selector==='#app'?app:null};
  globalThis.localStorage={getItem:key=>entries.get(key)??null,setItem:(key,value)=>{if(harness.fail)throw new Error('Quota');entries.set(key,value);}};
  globalThis.setInterval=fn=>{harness.tick=fn;return 1;};
  globalThis.clearInterval=()=>{harness.tick=null;};
  t.after(()=>Object.assign(globalThis,previous));
  harness.click=dataset=>handlers.click({target:{closest:()=>({dataset,disabled:false})}});
  harness.file=file=>handlers.change({target:{hasAttribute:name=>name==='data-import-save',files:[file]}});
  harness.choose=text=>harness.file({size:text.length,text:async()=>text});
  await import(`../public/app.js?storage-ui=${++instance}`);
  return harness;
}

test('UI previews and cancels imports, confirms replacement, and restores the previous save',async t=>{
  const h=await boot(t),original=h.entries.get(KEY),backup=exportBackup(newGame('AZ'));
  h.click({tab:'progress'});await h.choose(backup);
  assert.match(h.app.innerHTML,/Huidige carrière vervangen/);
  assert.equal(h.entries.get(KEY),original);
  h.click({action:'cancel-import'});
  assert.doesNotMatch(h.app.innerHTML,/data-action="confirm-import"/);
  assert.equal(h.entries.get(KEY),original);
  await h.choose(backup);h.click({action:'confirm-import'});
  assert.equal(JSON.parse(h.entries.get(KEY)).clubs[0].name,'AZ');
  assert.equal(h.entries.get(RECOVERY_KEY),original);
  h.click({action:'preview-recovery'});h.click({action:'confirm-import'});
  assert.equal(h.entries.get(KEY),original);
  await h.choose('{broken');
  assert.match(h.app.innerHTML,/geen geldige Touchline/);
  assert.doesNotMatch(h.app.innerHTML,/data-action="confirm-import"/);
  assert.equal(h.entries.get(KEY),original);
});

test('UI pauses on an autosave failure and retains the game for retry or export',async t=>{
  const h=await boot(t);
  h.click({action:'play'});h.click({action:'resume'});
  const original=h.entries.get(KEY);h.fail=true;h.tick();
  assert.equal(h.tick,null);
  assert.match(h.app.innerHTML,/Opslaan is niet gelukt/);
  assert.match(h.app.innerHTML,/HERVATTEN/);
  assert.equal(h.entries.get(KEY),original);
  h.click({action:'open-backups'});
  assert.match(h.app.innerHTML,/BACKUP DOWNLOADEN/);
  assert.match(h.app.innerHTML,/Gepauzeerd op 1′/);
  h.fail=false;h.click({action:'retry-save'});
  assert.equal(JSON.parse(h.entries.get(KEY)).pending.minute,1);
  assert.equal(JSON.parse(h.entries.get(KEY)).pending.paused,true);
  assert.doesNotMatch(h.app.innerHTML,/Opslaan is niet gelukt/);
});

test('unreadable startup save has recovery controls and cannot be silently replaced by onboarding',async t=>{
  const h=await boot(t,'{broken');
  assert.match(h.app.innerHTML,/Je opgeslagen carrière blijft bewaard/);
  assert.match(h.app.innerHTML,/OORSPRONKELIJKE SAVE DOWNLOADEN/);
  assert.doesNotMatch(h.app.innerHTML,/<form id="create-form"/);
  h.handlers.submit({target:{id:'create-form'},preventDefault(){}});
  assert.equal(h.entries.get(KEY),'{broken');
  await h.choose(exportBackup(newGame('Ajax')));h.click({action:'confirm-import'});
  assert.equal(h.entries.get(RECOVERY_KEY),'{broken');
  assert.equal(JSON.parse(h.entries.get(KEY)).clubs[0].name,'Ajax');
  assert.match(h.app.innerHTML,/VORIGE SAVE DOWNLOADEN/);
});

test('a slow file read cannot replace a newer preview',async t=>{
  const h=await boot(t);h.click({tab:'progress'});
  let complete;
  const first=h.file({size:100,text:()=>new Promise(resolve=>{complete=resolve;})});
  await h.choose(exportBackup(newGame('AZ')));
  complete(exportBackup(newGame('Ajax')));await first;
  h.click({action:'confirm-import'});
  assert.equal(JSON.parse(h.entries.get(KEY)).clubs[0].name,'AZ');
});

test('UI keeps the current career when confirming an import cannot write storage',async t=>{
  const h=await boot(t),original=h.entries.get(KEY);
  h.click({tab:'progress'});await h.choose(exportBackup(newGame('AZ')));h.fail=true;
  h.click({action:'confirm-import'});
  assert.match(h.app.innerHTML,/Terugzetten is niet gelukt/);
  assert.equal(h.entries.get(KEY),original);
  h.click({action:'cancel-import'});
  assert.match(h.app.innerHTML,/<dd>PSV<\/dd>/);
});

test('roster update is explicit, recovers the old career, and preserves credits on failure',async t=>{
  const old=parseBackup(readFileSync(new URL('./fixtures/legacy-v5-live.json',import.meta.url),'utf8'));
  old.pending=null;old.trainingUsed=true;old.credits=98765;old.management.ledgerOpening=98765;
  const raw=JSON.stringify(old),h=await boot(t,raw);
  assert.equal(h.entries.get(KEY),raw,'opening an old career does not update squads');
  h.click({tab:'progress'});h.fail=true;h.click({action:'update-rosters'});
  assert.match(h.app.innerHTML,/Bijwerken is niet gelukt/);
  assert.equal(h.entries.get(KEY),raw);
  h.fail=false;h.click({action:'update-rosters'});
  const updated=JSON.parse(h.entries.get(KEY));
  assert.equal(updated.clubs[0].players.length,28);
  assert.equal(updated.credits,98765);assert.equal(updated.trainingUsed,true);
  assert.equal(h.entries.get(RECOVERY_KEY),raw);
  h.click({action:'preview-recovery'});h.click({action:'confirm-import'});
  assert.equal(h.entries.get(KEY),raw);
});

test('UI cannot replace rosters during a live match',async t=>{
  const raw=JSON.stringify(parseBackup(readFileSync(new URL('./fixtures/legacy-v5-live.json',import.meta.url),'utf8')));
  const h=await boot(t,raw);
  h.click({action:'open-backups'});h.click({action:'update-rosters'});
  assert.equal(h.entries.get(KEY),raw);
  assert.equal(h.entries.has(RECOVERY_KEY),false);
  assert.match(h.app.innerHTML,/Rond eerst je lopende wedstrijd af/);
});
