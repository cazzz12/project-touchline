import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {setImmediate as flush} from 'node:timers/promises';
let instance=0;
const data=path=>JSON.parse(readFileSync(new URL('../public'+path,import.meta.url)));
async function boot(t,url='http://localhost/world'){
  const handlers={},app={innerHTML:'',addEventListener:(type,fn)=>handlers[type]=fn,querySelectorAll:()=>[]},original=Object.fromEntries(['document','window','location','history','fetch','FormData'].map(k=>[k,globalThis[k]]));let scrolls=0;
  globalThis.document={querySelector:()=>app};globalThis.location=new URL(url);globalThis.window={scrollTo(){scrolls++;}};
  globalThis.history={replaceState(_a,_b,url){globalThis.location=new URL(url);}};
  globalThis.fetch=async path=>({ok:true,json:async()=>data(path)});
  globalThis.FormData=class{constructor(form){this.values=form.values;}get(k){return this.values[k]||'';}};
  t.after(()=>Object.assign(globalThis,original));await import('../public/world.js?test='+ ++instance);
  return {app,get scrolls(){return scrolls;},async click(dataset){handlers.click({target:{closest:()=>({dataset})}});await flush();await flush();},async submit(values){handlers.submit({preventDefault(){},target:{id:'world-filter',values}});await flush();await flush();},async change(name,value){handlers.change({target:{name,value}});await flush();await flush();}};
}
test('every league and club view renders, search handles accents and source editions stay explicit',async t=>{
  const h=await boot(t),index=data('/world/index.json');assert.match(h.app.innerHTML,/9\.636/);
  for(const l of index.leagues){await h.click({league:l.id});assert.ok(h.app.innerHTML.includes(l.name));const c=data('/world/'+index.bundlePath+l.id+'.json').clubs[0];await h.click({club:c.id});assert.ok(!h.app.innerHTML.includes('Even geen verbinding'),l.id);assert.match(h.app.innerHTML,/ratingpositie staat in het profiel/);assert.ok(h.app.innerHTML.includes(c.players[0].name.replaceAll('&','&amp;').replaceAll("'",'&#39;')));}
  await h.click({home:''});await h.submit({query:'mbappe'});assert.match(h.app.innerHTML,/Kylian Mbappé/);assert.match(h.app.innerHTML,/Ethan Mbappé/);assert.match(h.app.innerHTML,/2 spelers/);
  await h.click({home:''});await h.change('region','Amerika');assert.match(h.app.innerHTML,/3 competities/);assert.ok(!h.app.innerHTML.includes('data-league="premier-league"'));
});
test('FC 27 fallback profile and reloading a direct player link show the correct edition',async t=>{
  const index=data('/world/index.json'),b=data('/world/'+index.bundlePath+'liga-mx.json'),c=b.clubs[0],p=c.players.find(p=>p.fc27),url=`http://localhost/world?league=liga-mx&club=${c.id}&player=${p.id}`;
  const h=await boot(t,url);assert.match(h.app.innerHTML,/FC 27-basisrating/);assert.match(h.app.innerHTML,/aanvulling omdat FC 26 ontbreekt/);assert.match(h.app.innerHTML,/FC 27-positie/);assert.equal(h.scrolls,1);
  const reloaded=await boot(t,url);assert.equal(reloaded.app.innerHTML,h.app.innerHTML);
});
