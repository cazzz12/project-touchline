import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {randomUUID,generateKeyPairSync,sign} from 'node:crypto';
import {request} from 'node:http';
import {createApplication,configuration} from '../backend/server.js';
import {openDatabase,backupDatabase} from '../backend/database.js';

async function setup(t,extra={}){
  const dir=await mkdtemp(join(tmpdir(),'touchline-online-')),config={dbPath:join(dir,'game.sqlite'),origin:'http://127.0.0.1:3000',dev:true,...extra};
  let app=createApplication(config);await new Promise(r=>app.server.listen(0,'127.0.0.1',r));let url='http://127.0.0.1:'+app.server.address().port;
  t.after(async()=>{await app.close();await rm(dir,{recursive:true,force:true});});
  function client(){const jar=new Map();let csrf;return {
    async call(path,body,headers={}){const r=await new Promise((resolve,reject)=>{const req=request(url+path,{method:body===undefined?'GET':'POST',headers:{Host:'127.0.0.1:3000',Origin:config.origin,'Content-Type':'application/json','X-CSRF-Token':csrf||'',Cookie:[...jar].map(([k,v])=>k+'='+v).join('; '),...headers}},res=>{let text='';res.on('data',chunk=>text+=chunk);res.on('end',()=>resolve({status:res.statusCode,body:JSON.parse(text),headers:new Headers(Object.entries(res.headers).map(([k,v])=>[k,String(v)])),cookies:res.headers['set-cookie']||[]}));});req.on('error',reject);req.end(body===undefined?undefined:JSON.stringify(body));});for(const cookie of r.cookies){const [key,value]=cookie.split(';')[0].split('=');jar.set(key,value);}if(path==='/api/session'&&r.status===200)csrf=r.body.csrf;return r;},
    async login(email='a@touchline.test'){const c=await this.call('/api/auth/challenge',{kind:'email',identifier:email});assert.equal(c.status,200);const r=await this.call('/api/auth/verify',{id:c.body.id,code:c.body.testCode});assert.equal(r.status,200);return (await this.call('/api/session')).body;},
    async state(id){const r=await this.call('/api/leagues/'+id);assert.equal(r.status,200);return r.body;},
    async act(id,type,extra={}){const state=await this.state(id);return this.call('/api/leagues/'+id+'/actions',{id:randomUUID(),version:state.version,type,...extra});}
  };}
  return {client,config,dir,get app(){return app;},async restart(){await app.close();app=createApplication(config);await new Promise(r=>app.server.listen(0,'127.0.0.1',r));url='http://127.0.0.1:'+app.server.address().port;}};
}
async function pair(t){const env=await setup(t),a=env.client(),b=env.client();await a.login();await b.login('b@touchline.test');const made=await a.call('/api/leagues',{id:randomUUID(),title:'Test league',club:0});assert.equal(made.status,200);const id=made.body.id,state=await a.state(id);assert.equal((await b.call('/api/leagues/join',{id:randomUUID(),code:state.code,club:1})).status,200);return {...env,env,a,b,id};}
const alphabet='123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
function address(bytes){let n=BigInt('0x'+bytes.toString('hex')),s='';while(n){s=alphabet[Number(n%58n)]+s;n/=58n;}for(const b of bytes){if(b!==0)break;s='1'+s;}return s;}

test('configuration confines test codes to loopback and refuses incomplete production setup',()=>{
  assert.equal(configuration({}).dev,true);assert.throws(()=>configuration({HOST:'0.0.0.0'}));assert.throws(()=>configuration({TOUCHLINE_AUTH_MODE:'production'}));assert.throws(()=>configuration({TOUCHLINE_ORIGIN:'https://example.com'}));
  assert.equal(configuration({TOUCHLINE_AUTH_MODE:'production',TOUCHLINE_ORIGIN:'https://game.example',RESEND_API_KEY:'test-placeholder',TOUCHLINE_EMAIL_FROM:'login@example.test'}).dev,false);
});
test('email login uses a browser-bound single-use code, HttpOnly cookie and revocable session',async t=>{
  const env=await setup(t),a=env.client(),b=env.client(),c=await a.call('/api/auth/challenge',{kind:'email',identifier:'a@touchline.test'});
  assert.equal((await b.call('/api/auth/verify',{id:c.body.id,code:c.body.testCode})).status,400);
  const logged=await a.call('/api/auth/verify',{id:c.body.id,code:c.body.testCode});assert.match(logged.headers.get('set-cookie'),/HttpOnly; SameSite=Strict/);
  assert.equal((await a.call('/api/auth/verify',{id:c.body.id,code:c.body.testCode})).status,400);
  const session=(await a.call('/api/session')).body;assert.equal(session.account.identities[0].identifier,'a@touchline.test');
  assert.equal((await a.call('/api/logout',{})).status,200);assert.equal((await a.call('/api/leagues')).status,401);
});
test('codes expire, wrong-code attempts are limited and development cannot send real email',async t=>{
  let now=10000;const env=await setup(t,{now:()=>now}),a=env.client();assert.equal((await a.call('/api/auth/challenge',{kind:'email',identifier:'test@example.com'})).status,400);
  let c=(await a.call('/api/auth/challenge',{kind:'email',identifier:'a@touchline.test'})).body;for(let i=0;i<5;i++)assert.equal((await a.call('/api/auth/verify',{id:c.id,code:'000000'})).status,400);assert.equal((await a.call('/api/auth/verify',{id:c.id,code:c.testCode})).status,400);
  c=(await a.call('/api/auth/challenge',{kind:'email',identifier:'a@touchline.test'})).body;now+=600001;assert.equal((await a.call('/api/auth/verify',{id:c.id,code:c.testCode})).status,400);
});
test('production email delivers through injected transport without exposing a code; failure cannot authenticate',async t=>{
  let sent,fail=false;const env=await setup(t,{dev:false,sendEmail:async(to,code)=>{if(fail)throw Error();sent={to,code};}}),a=env.client();const c=await a.call('/api/auth/challenge',{kind:'email',identifier:'person@example.com'});assert.equal(c.body.testCode,undefined);assert.equal(sent.to,'person@example.com');
  const r=await a.call('/api/auth/verify',{id:c.body.id,code:sent.code});assert.equal(r.status,200);assert.match(r.headers.get('set-cookie'),/Secure/);fail=true;assert.equal((await a.call('/api/auth/challenge',{kind:'email',identifier:'person@example.com'})).status,503);
});
test('wallet signatures verify the server challenge, reject tampering and link only after proof',async t=>{
  const env=await setup(t),a=env.client(),b=env.client(),original=await a.login(),keys=generateKeyPairSync('ed25519'),wallet=address(keys.publicKey.export({type:'spki',format:'der'}).subarray(-32));
  const c=(await a.call('/api/auth/challenge',{kind:'wallet',identifier:wallet,link:true})).body;assert.match(c.message,/Geen betaling/);assert.ok(c.message.includes(original.account.id));
  assert.equal((await a.call('/api/auth/verify',{id:c.id,signature:sign(null,Buffer.from(c.message+'!'),keys.privateKey).toString('base64')})).status,400);
  assert.equal((await a.call('/api/auth/verify',{id:c.id,signature:sign(null,Buffer.from(c.message),keys.privateKey).toString('base64')})).status,200);
  assert.equal((await a.call('/api/session')).body.account.identities.length,2);
  const next=(await b.call('/api/auth/challenge',{kind:'wallet',identifier:wallet})).body;assert.equal((await b.call('/api/auth/verify',{id:next.id,signature:sign(null,Buffer.from(next.message),keys.privateKey).toString('base64')})).status,200);assert.equal((await b.call('/api/session')).body.account.id,original.account.id);
  await a.call('/api/logout',{all:true});assert.equal((await b.call('/api/leagues')).status,401);
});
test('identity linking cannot merge somebody else’s existing email account',async t=>{
  const env=await setup(t),a=env.client(),b=env.client();await a.login();await b.login('b@touchline.test');const c=(await a.call('/api/auth/challenge',{kind:'email',identifier:'b@touchline.test',link:true})).body;assert.equal((await a.call('/api/auth/verify',{id:c.id,code:c.testCode})).status,409);
});
test('API rejects unauthenticated access, other origins, CSRF, unknown fields and foreign club commands',async t=>{
  const {env,a,b,id}=await pair(t),outsider=env.client();assert.equal((await outsider.call('/api/leagues/'+id)).status,401);await outsider.login('outsider@touchline.test');assert.equal((await outsider.call('/api/leagues/'+id)).status,403);
  assert.equal((await a.call('/api/logout',{}, {Origin:'https://evil.example'})).status,403);assert.equal((await a.call('/api/logout',{}, {'X-CSRF-Token':'wrong'})).status,403);assert.equal((await a.call('/api/session',undefined,{Host:'evil.example'})).status,403);
  assert.equal((await b.act(id,'start')).status,403);await a.act(id,'start');assert.equal((await a.act(id,'ready',{credits:999999})).status,400);assert.equal((await a.act(id,'train',{playerId:(await b.state(id)).clubs[1].players[0].id,skill:'passing'})).status,400);
});
test('club claims, membership and create requests are unique and replayed safely',async t=>{
  const env=await setup(t),a=env.client(),b=env.client(),c=env.client();await a.login();await b.login('b@touchline.test');await c.login('c@touchline.test');
  const input={id:randomUUID(),title:'One league',club:0};const first=await a.call('/api/leagues',input),repeat=await a.call('/api/leagues',input);assert.deepEqual(first.body,repeat.body);assert.equal((await a.call('/api/leagues',{...input,title:'Another'})).status,409);
  const state=await a.state(first.body.id),joiner={code:state.code,club:1};const results=await Promise.all([b.call('/api/leagues/join',{id:randomUUID(),...joiner}),c.call('/api/leagues/join',{id:randomUUID(),...joiner})]);assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);assert.equal((await a.state(state.id)).members.length,2);
});
test('two managers complete one shared round with identical results and no duplicate rewards',async t=>{
  const {a,b,id}=await pair(t);await a.act(id,'start');await a.act(id,'ready');let state=await b.state(id);assert.equal(state.round,0);const payload={id:randomUUID(),version:state.version,type:'ready'};
  const responses=await Promise.all([b.call('/api/leagues/'+id+'/actions',payload),b.call('/api/leagues/'+id+'/actions',payload)]);assert.ok(responses.every(r=>r.status===200));const sa=await a.state(id),sb=await b.state(id);assert.equal(sa.round,1);assert.equal(sa.results.length,3);assert.deepEqual(sa.results,sb.results);assert.deepEqual(sa.table,sb.table);assert.equal(sa.my.ledger.length,2);
  assert.equal((await b.call('/api/leagues/'+id+'/actions',{...payload,id:randomUUID()})).status,409);assert.equal((await b.state(id)).round,1);
});
test('server training and tactics use ownership, one charge and optimistic concurrency',async t=>{
  const {a,b,id}=await pair(t);await a.act(id,'start');const s=await a.state(id),player=s.clubs[0].players[0],request={id:randomUUID(),version:s.version,type:'train',playerId:player.id,skill:'passing'};
  assert.equal((await a.call('/api/leagues/'+id+'/actions',request)).status,200);assert.equal((await a.call('/api/leagues/'+id+'/actions',request)).status,200);const after=await a.state(id);assert.equal(after.my.credits,119000);assert.equal(after.clubs[0].players[0].passing,player.passing+1);assert.equal((await a.act(id,'train',{playerId:player.id,skill:'passing'})).status,409);
  assert.equal((await a.act(id,'tactics',{tactics:{formation:'4-4-2',mentality:80,pressing:50,tempo:60},lineupIds:after.my.lineupIds})).status,200);
  const bad=[...after.my.lineupIds];bad[1]=bad[2];assert.equal((await a.act(id,'tactics',{tactics:after.my.tactics,lineupIds:bad})).status,400);await a.act(id,'ready');assert.equal((await a.act(id,'train',{playerId:player.id,skill:'passing'})).status,409);await a.act(id,'unready');assert.equal((await b.state(id)).members[0].ready,false);
});
test('accepted multiplayer transfer conserves cash and player ownership across repeated requests',async t=>{
  const {a,b,id}=await pair(t);await a.act(id,'start');const before=await a.state(id),player=before.clubs[1].players.find(p=>p.position==='DEF');await a.act(id,'offer',{seller:1,playerId:player.id,amount:25000});
  const sb=await b.state(id),request={id:randomUUID(),version:sb.version,type:'accept',offerId:sb.offers[0].id};assert.equal((await b.call('/api/leagues/'+id+'/actions',request)).status,200);assert.equal((await b.call('/api/leagues/'+id+'/actions',request)).status,200);
  const sa=await a.state(id),after=await b.state(id);assert.equal(sa.my.credits,95000);assert.equal(after.my.credits,145000);assert.equal(sa.clubs.flatMap(c=>c.players).filter(p=>p.id===player.id).length,1);assert.ok(sa.clubs[0].players.some(p=>p.id===player.id));assert.ok(!after.my.lineupIds.includes(player.id));assert.equal(after.offers.length,0);
});
test('readiness locks transfers and old bids expire after the round without debiting money',async t=>{
  const {a,b,id}=await pair(t);await a.act(id,'start');const player=(await a.state(id)).clubs[1].players[3];await a.act(id,'offer',{seller:1,playerId:player.id,amount:10000});await a.act(id,'ready');const state=await b.state(id);assert.equal((await b.act(id,'accept',{offerId:state.offers[0].id})).status,409);await b.act(id,'ready');assert.equal((await a.state(id)).offers.length,0);assert.equal((await a.state(id)).my.ledger.length,2);
});
test('database restart and verified backup preserve sessions, training, leagues and results',async t=>{
  const {env,a,b,id}=await pair(t);await a.act(id,'start');await a.act(id,'ready');await b.act(id,'ready');const before=await a.state(id);const backup=join(env.dir,'backup.sqlite');await backupDatabase(env.app.db,backup);const copy=openDatabase(backup);assert.equal(JSON.parse(copy.prepare('SELECT state FROM leagues WHERE id=?').get(id).state).round,1);copy.close();await env.restart();assert.deepEqual(await a.state(id),before);assert.equal((await b.call('/api/session')).body.account.identities[0].identifier,'b@touchline.test');
});
test('ten shared rounds finish a season, stop extra settlement and preserve history on rollover',async t=>{
  const {a,b,id}=await pair(t);await a.act(id,'start');for(let i=0;i<10;i++){assert.equal((await a.act(id,'ready')).status,200);assert.equal((await b.act(id,'ready')).status,200);}const finished=await a.state(id);assert.equal(finished.phase,'complete');assert.equal(finished.results.length,30);assert.ok(finished.table.every(r=>r.p===10));assert.equal((await b.act(id,'ready')).status,409);assert.equal((await b.act(id,'season')).status,403);assert.equal((await a.act(id,'season')).status,200);const next=await a.state(id);assert.equal(next.season,2);assert.equal(next.round,0);assert.deepEqual(next.history[0].table,finished.table);assert.equal(next.my.credits,finished.my.credits);
});
test('concurrent accepted offers cannot overspend a buyer or partially transfer a player',async t=>{
  const {a,b,id}=await pair(t);await a.act(id,'start');const players=(await a.state(id)).clubs[1].players.filter(p=>p.position==='DEF').slice(0,2);
  for(const p of players)await a.act(id,'offer',{seller:1,playerId:p.id,amount:80000});let state=await b.state(id);assert.equal((await b.act(id,'accept',{offerId:state.offers[0].id})).status,200);state=await b.state(id);const before=structuredClone(state);assert.equal((await b.act(id,'accept',{offerId:state.offers[0].id})).status,409);assert.deepEqual(await b.state(id),before);assert.equal((await a.state(id)).my.credits,40000);
});
test('sessions expire, linking requires recent proof and request throttles survive restart',async t=>{
  let time=1000;const env=await setup(t,{now:()=>time}),a=env.client();await a.login();time+=16*60000;assert.equal((await a.call('/api/auth/challenge',{kind:'email',identifier:'recovery@touchline.test',link:true})).status,401);
  for(let i=0;i<7;i++)assert.equal((await a.call('/api/auth/challenge',{kind:'email',identifier:'a@touchline.test'})).status,200);await env.restart();assert.equal((await a.call('/api/auth/challenge',{kind:'email',identifier:'a@touchline.test'})).status,429);time+=8*86400000;assert.equal((await a.call('/api/leagues')).status,401);
});
test('a failed league mutation rolls back every write and does not consume its operation ID',async t=>{
  const {a,id}=await pair(t);await a.act(id,'start');const before=await a.state(id),request={id:randomUUID(),version:before.version,type:'tactics',tactics:{formation:'4-4-2',mentality:90,pressing:30,tempo:75},lineupIds:['invalid']};
  assert.equal((await a.call('/api/leagues/'+id+'/actions',request)).status,400);assert.deepEqual(await a.state(id),before);request.lineupIds=before.my.lineupIds;assert.equal((await a.call('/api/leagues/'+id+'/actions',request)).status,200);
});
