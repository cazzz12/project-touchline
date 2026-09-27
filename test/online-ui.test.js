import test from 'node:test';
import assert from 'node:assert/strict';
import {setImmediate as flush} from 'node:timers/promises';
let instance=0;
async function boot(t,{request,store=new Map(),url='http://localhost/'}={}){
  const handlers={},app={innerHTML:'',addEventListener:(type,fn)=>handlers[type]=fn,querySelectorAll:()=>[],insertAdjacentHTML(_,html){this.innerHTML=html+this.innerHTML;}},notice={textContent:'',className:''};
  const original=Object.fromEntries(['document','fetch','FormData','sessionStorage','setInterval','location','history'].map(k=>[k,globalThis[k]]));
  globalThis.location=new URL(url);globalThis.history={replaceState(_state,_title,next){globalThis.location=new URL(next);}};
  globalThis.document={querySelector:s=>s==='#online-app'?app:notice,hidden:false,activeElement:null};
  globalThis.fetch=async(url,init)=>{const r=await request(url,init?.body?JSON.parse(init.body):undefined);return {ok:r.status<400,status:r.status,json:async()=>structuredClone(r.body)};};
  globalThis.FormData=class{constructor(form){this.values=form.values;}get(k){return this.values[k];}};
  globalThis.sessionStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};globalThis.setInterval=()=>0;
  t.after(()=>Object.assign(globalThis,original));await import('../public/online.js?test='+ ++instance);
  return {app,notice,store,async submit(id,values){handlers.click({target:{closest:()=>({dataset:{},disabled:false})}});handlers.submit({preventDefault(){},target:{id,values}});await flush();await flush();},async click(dataset){handlers.click({target:{closest:()=>({dataset,disabled:false})}});await flush();await flush();}};
}
test('reload restores the selected world, finish guide reaches the playable lobby and leaving clears its URL',async t=>{
 const {defaultProfile,lessons}=await import('../public/manager-model.js');let profile={...defaultProfile(),stage:'learn',learned:lessons.map(l=>l.id)},left=false;
 const clubs=[{name:'Ajax'},{name:'PSV'}],state={id:'selected',title:'Chosen league',season:1,round:0,totalRounds:2,phase:'lobby',myClub:0,clubs,my:{credits:120000},members:[{club:0,name:'Coach'}],world:{region:'eu',rules:'classic',starts:100},serverTime:200};
 const request=async(path,body)=>{
  if(path==='/api/session')return {status:200,body:{mode:'local-test',account:{id:'a',name:'Coach',profile,identities:[]},csrf:'csrf'}};
  if(path==='/api/leagues')return {status:200,body:{leagues:left?[]:[{id:'other'},{id:'selected'}]}};
  if(path==='/api/leagues/selected')return {status:200,body:state};
  if(path==='/api/account/guide'){profile={...profile,...body};return {status:200,body:{profile}};}
  if(path==='/api/worlds/leave'){left=true;return {status:200,body:{left:true}};}
  if(path==='/api/catalog')return {status:200,body:{leagues:[]}};
  throw Error('Unexpected '+path);
 };
 const h=await boot(t,{request,url:'http://localhost/?play=selected'});assert.match(h.app.innerHTML,/TOUCHLINE ACADEMY/);await h.click({action:'finish-guide'});assert.equal(profile.onboarding,false);assert.match(h.app.innerHTML,/SPEEL NU TEGEN DE COMPUTER/);assert.doesNotMatch(h.app.innerHTML,/TOUCHLINE ACADEMY/);
 const restored=await boot(t,{request,url:location.href});assert.match(restored.app.innerHTML,/SPEEL NU TEGEN DE COMPUTER/);assert.match(restored.app.innerHTML,/Chosen league/);await restored.click({action:'leave-world'});assert.equal(location.search,'');assert.doesNotMatch(restored.app.innerHTML,/data-command="practice-start"/);
});

test('a practice bye still offers a round button and a finished season offers the next season',async t=>{
 let complete=false;const h=await boot(t,{url:'http://localhost/?play=bye',request:async path=>{
  if(path==='/api/session')return {status:200,body:{mode:'local-test',account:{id:'a',name:'Coach',identities:[]},csrf:'csrf'}};
  if(path==='/api/leagues')return {status:200,body:{leagues:[{id:'bye'}]}};
  if(path==='/api/catalog')return {status:200,body:{leagues:[]}};
  if(path==='/api/leagues/bye')return {status:200,body:{id:'bye',practice:true,title:'Odd league',phase:complete?'complete':'active',season:1,round:0,totalRounds:6,myClub:0,clubs:[{name:'Ajax'}],my:{credits:120000,ledger:[]},members:[{club:0,name:'Coach'}],table:[{name:'Ajax',i:0,p:0,gf:0,ga:0,pts:0}],fixtures:[],reports:[],history:[]}};
  throw Error('Unexpected '+path);
 }});assert.match(h.app.innerHTML,/Een rustbeurt/);assert.match(h.app.innerHTML,/data-command="practice-round"/);complete=true;await h.click({action:'refresh'});assert.match(h.app.innerHTML,/data-command="practice-season"/);assert.doesNotMatch(h.app.innerHTML,/data-command="practice-round"/);
});

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

test('public world selection sends a fixed catalog and refreshes occupied seats after a conflict',async t=>{
 const clubs=[{name:'Ajax'},{name:'PSV'}],catalog={id:'snapshot',leagues:[{id:'eredivisie',name:'Eredivisie',country:'Nederland',playable:true,clubs}]};let lookups=0,joined;
 const h=await boot(t,{request:async(path,body)=>{
  if(path==='/api/session')return {status:200,body:{mode:'local-test',account:{id:'manager-a',name:'A',identities:[]},csrf:'csrf'}};
  if(path==='/api/catalog')return {status:200,body:catalog};
  if(path==='/api/leagues')return {status:200,body:{leagues:[]}};
  if(path.startsWith('/api/worlds?')){lookups++;return {status:200,body:{rooms:[{id:'room',title:'Eredivisie server',region:'eu',rules:'collection',phase:'lobby',starts:Date.now()+10000,managers:lookups>1?1:0,capacity:2,season:1,clubs:clubs.map((c,index)=>({...c,index,occupied:index===0&&lookups>1}))}]}};}
  if(path==='/api/worlds/join'){joined=body;return {status:409,body:{error:'Deze club is net gekozen.'}};}
  throw Error('Unexpected request '+path);
 }});
 await h.click({catalog:'eredivisie'});assert.match(h.app.innerHTML,/Kies je speelwereld/);await h.click({room:'room'});await h.submit('world-join',{club:'0'});
 assert.equal(joined.catalogId,'eredivisie');assert.equal(joined.catalogSnapshot,'snapshot');assert.equal(joined.region,'eu');assert.equal(joined.rules,'collection');assert.equal(joined.worldId,'room');assert.equal(joined.club,0);assert.equal(lookups,2);assert.match(h.app.innerHTML,/disabled>Ajax · bezet/);assert.equal(h.store.size,0);assert.match(h.notice.textContent,/net gekozen/);
});
test('starter flow selects a world and club, then teaches without sending gameplay actions',async t=>{
 const {defaultProfile}=await import('../public/manager-model.js');let profile=defaultProfile(),name='Beginner',joined=false;const calls=[];
 const clubs=[{name:'Ajax'},{name:'PSV'}],catalog={id:'snapshot',leagues:[{id:'eredivisie',name:'Eredivisie',country:'Nederland',playable:true,clubs}]};
 const state={id:'league',title:'Eredivisie',season:1,round:0,totalRounds:2,phase:'lobby',myClub:0,clubs,my:{credits:120000},members:[]};
 const h=await boot(t,{request:async(path,body)=>{calls.push({path,body});
  if(path==='/api/session')return {status:200,body:{mode:'local-test',account:{id:'learner',name,profile,identities:[]},csrf:'csrf'}};
  if(path==='/api/catalog')return {status:200,body:catalog};
  if(path==='/api/leagues')return {status:200,body:{leagues:joined?[{id:'league'}]:[]}};
  if(path.startsWith('/api/worlds?'))return {status:200,body:{rooms:[]}};
  if(path==='/api/account/profile'){name=body.name;profile={...profile,avatar:body.avatar,motto:body.motto};return {status:200,body:{profile}};}
  if(path==='/api/account/guide'){profile={...profile,...('stage'in body?{stage:body.stage}:{}),...('onboarding'in body?{onboarding:body.onboarding}:{}),learned:body.lesson?[...new Set([...profile.learned,body.lesson])]:profile.learned};return {status:200,body:{profile}};}
  if(path==='/api/worlds/join'){joined=true;return {status:200,body:{id:'league'}};}
  if(path==='/api/leagues/league')return {status:200,body:state};throw Error('Unexpected '+path);
 }});
 assert.match(h.app.innerHTML,/Wie staat er langs de lijn/);await h.submit('manager-profile',{name:'Coach Nova',avatar:'2',mood:'heart',motto:'Samen vooruit',starter:'yes'});assert.match(h.app.innerHTML,/Waar begint jouw verhaal/);
 await h.click({catalog:'eredivisie'});assert.match(h.app.innerHTML,/Vind jouw speelwereld/);await h.click({action:'auto-world'});assert.match(h.app.innerHTML,/Welke club wordt van jou/);await h.submit('world-join',{club:'0'});assert.match(h.app.innerHTML,/Touchline|TOUCHLINE ACADEMY/);assert.equal(profile.stage,'learn');
 await h.click({lesson:'training'});await h.click({answer:'1',answerLesson:'training'});assert.equal(profile.learned.length,0);await h.click({answer:'0',answerLesson:'training'});assert.deepEqual(profile.learned,['training']);assert.equal(calls.filter(c=>c.path.endsWith('/actions')).length,0);assert.match(h.app.innerHTML,/4.000/);await h.click({action:'skip-guide'});assert.equal(profile.onboarding,false);
});
