import test from 'node:test';
import assert from 'node:assert/strict';
import {setImmediate as flush} from 'node:timers/promises';
let instance=0;
async function boot(t,{request,store=new Map()}={}){
  const handlers={},app={innerHTML:'',addEventListener:(type,fn)=>handlers[type]=fn,querySelectorAll:()=>[],insertAdjacentHTML(_,html){this.innerHTML=html+this.innerHTML;}},notice={textContent:'',className:''};
  const original=Object.fromEntries(['document','fetch','FormData','sessionStorage','setInterval'].map(k=>[k,globalThis[k]]));
  globalThis.document={querySelector:s=>s==='#online-app'?app:notice,hidden:false,activeElement:null};
  globalThis.fetch=async(url,init)=>{const r=await request(url,init?.body?JSON.parse(init.body):undefined);return {ok:r.status<400,status:r.status,json:async()=>r.body};};
  globalThis.FormData=class{constructor(form){this.values=form.values;}get(k){return this.values[k];}};
  globalThis.sessionStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};globalThis.setInterval=()=>0;
  t.after(()=>Object.assign(globalThis,original));await import('../public/online.js?test='+ ++instance);
  return {app,notice,store,async submit(id,values){handlers.click({target:{closest:()=>({dataset:{},disabled:false})}});handlers.submit({preventDefault(){},target:{id,values}});await flush();await flush();},async click(dataset){handlers.click({target:{closest:()=>({dataset,disabled:false})}});await flush();await flush();}};
}
test('ordinary submit-button clicks request a code and render the verification form',async t=>{
  const calls=[],h=await boot(t,{request:async(path,body)=>{calls.push({path,body});return {status:200,body:path==='/api/session'?{mode:'local-test',account:null,csrf:null}:{id:'challenge',testCode:'123456'}};}});
  await h.submit('email',{email:'manager@touchline.test'});assert.equal(calls.filter(c=>c.path==='/api/auth/challenge').length,1);assert.match(h.app.innerHTML,/Inlogcode/);assert.match(h.app.innerHTML,/123456/);assert.equal(h.notice.textContent,'Testcode klaar.');
});
test('an uncertain mutation survives reload and retries the exact same operation for the same account',async t=>{
  const sent=[],store=new Map(),request=async(path,body)=>{
    if(path==='/api/session')return {status:200,body:{mode:'local-test',account:{id:'manager-a',name:'A',identities:[]},csrf:'csrf'}};
    if(path==='/api/leagues'&&!body)return {status:200,body:{leagues:[]}};
    if(path==='/api/leagues'&&body){sent.push(body);throw Error('Verbinding verbroken');}
    throw Error('Unexpected request');
  };
  const h=await boot(t,{request,store});await h.submit('create',{title:'League',club:'0'});assert.equal(sent.length,1);assert.match(h.app.innerHTML,/CONTROLEER DEZELFDE ACTIE/);
  const restored=await boot(t,{request,store});assert.match(restored.app.innerHTML,/CONTROLEER DEZELFDE ACTIE/);await restored.click({action:'retry'});assert.equal(sent.length,2);assert.deepEqual(sent[1],sent[0]);assert.equal(store.size,1);
});
