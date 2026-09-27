import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {openDatabase} from '../backend/database.js';
import {leagueService} from '../backend/leagues.js';
import {newGame} from '../public/game.js';
import {legends,legendMatchPlayer} from '../public/legends.js';
import {packService} from '../backend/packs.js';
import {packTypes,packRulesVersion,playerIdentity} from '../public/pack-rules.js';
import {phantomBrowseUrl,signInWithWallet} from '../public/wallet-login.js';
const index=JSON.parse(readFileSync(new URL('../public/world/index.json',import.meta.url)));
const all=JSON.parse(readFileSync(new URL('../public/world/'+index.bundlePath+'premier-league.json',import.meta.url))).clubs.flatMap(c=>c.players);
const normal=all.filter(p=>(p.fc26||p.fc27).overall<80).slice(0,12),rare=all.filter(p=>(p.fc26||p.fc27).overall>=80).slice(0,12);
const pool=()=>({id:'test-pool',players:structuredClone([...normal,...rare])});
function setup(t,extra={}){
 const db=openDatabase(':memory:');t.after(()=>db.close());for(const id of ['a','b','c','d','e','f','g'])db.prepare('INSERT INTO accounts VALUES (?,?,?)').run(id,'Manager '+id,0);
 const clubs=newGame().clubs,world={index:{id:'fixture-v1',leagues:[{id:'fixture',name:'Test League',country:'Test',playable:true,clubs:clubs.map(c=>({name:c.name}))}]},create(){return {clubs:structuredClone(clubs),catalog:{id:'fixture',name:'Test League',snapshot:'fixture-v1'}};}};
 let time=10000;const service=leagueService(db,{now:()=>time,world,worldLobbyMs:1000,worldRoundMs:1000,packPool:pool,...extra});
 const enter=(user,club,values={})=>service.enterWorld(user,{id:randomUUID(),catalogId:'fixture',catalogSnapshot:'fixture-v1',region:'eu',rules:'collection',club,...values});
 const act=(user,id,type,values={})=>service.act(user,id,{id:randomUUID(),version:service.view(id,user).version,type,...values});
 return {db,service,world,enter,act,advance(ms){time+=ms;service.tick();}};
}
test('public matchmaking groups strangers, splits occupied club claims and isolates regions and rules',t=>{
 const h=setup(t),a=h.enter('a',0),b=h.enter('b',1),c=h.enter('c',0);assert.equal(a.id,b.id);assert.notEqual(a.id,c.id);
 const asia=h.enter('d',0,{region:'asia'}),classic=h.enter('e',0,{rules:'classic'});assert.notEqual(asia.id,a.id);assert.notEqual(classic.id,a.id);
 const result=h.service.discover('a',{catalog:'fixture',region:'eu',rules:'collection'});assert.equal(result.rooms.length,2);const first=result.rooms.find(r=>r.id===a.id);assert.equal(first.managers,2);assert.ok(first.joined);assert.equal(first.clubs[0].occupied,true);assert.equal(first.clubs[2].occupied,false);assert.equal(first.clubs[0].players,undefined);assert.equal(first.owner,undefined);
 assert.throws(()=>h.enter('a',2),/speelt al/);assert.throws(()=>h.enter('f',0,{worldId:a.id}),/net gekozen/);assert.throws(()=>h.service.view(a.id,'g'),/geen deelnemer/);
 assert.equal(h.service.view(a.id,'a').owner,false);assert.throws(()=>h.act('a',a.id,'start'),/automatisch/);
});
test('public join is idempotent, rejects tampering and allows leaving only before start',t=>{
 const h=setup(t),input={id:randomUUID(),catalogId:'fixture',catalogSnapshot:'fixture-v1',region:'eu',rules:'collection',club:0};
 const made=h.service.enterWorld('a',input);assert.deepEqual(h.service.enterWorld('a',input),made);assert.throws(()=>h.service.enterWorld('a',{...input,club:1}),/al gebruikt/);
 h.world.index.id='fixture-v2';assert.deepEqual(h.service.enterWorld('a',input),made,'retries survive a catalog update');h.world.index.id='fixture-v1';
 assert.throws(()=>h.enter('b',99),/beschikbare/);assert.throws(()=>h.enter('b',1,{catalogSnapshot:'stale'}),/Vernieuw/);assert.throws(()=>h.enter('b',1,{credits:999999}),/Ongeldige opdracht/);
 const leave={id:randomUUID(),worldId:made.id};assert.deepEqual(h.service.leaveWorld('a',leave),{left:true});assert.deepEqual(h.service.leaveWorld('a',leave),{left:true});assert.equal(h.service.discover('b').rooms[0].managers,0);
 assert.equal(h.enter('a',0).id,made.id);h.enter('b',1);h.advance(1000);assert.throws(()=>h.service.leaveWorld('a',{id:randomUUID(),worldId:made.id}),/vóór de start/);
 const s=h.service.view(made.id,'a');assert.throws(()=>h.service.join('c',{id:randomUUID(),code:s.code,club:2}),/Speelwerelden/);assert.throws(()=>h.service.lobby(s.code),/Speelwerelden/);
});
test('public clock starts with two managers, never waits for readiness and settles exactly once',t=>{
 const h=setup(t),a=h.enter('a',0);h.advance(10000);assert.equal(h.service.view(a.id,'a').phase,'lobby');h.enter('b',1);let s=h.service.view(a.id,'a');assert.equal(s.phase,'active');
 h.act('a',a.id,'ready');h.act('b',a.id,'ready');assert.equal(h.service.view(a.id,'a').round,0);
 h.advance(1000);s=h.service.view(a.id,'a');assert.equal(s.round,1);assert.equal(s.results.length,3);assert.equal(s.my.ready,false);const cash=s.my.credits;h.service.tick();assert.equal(h.service.view(a.id,'a').my.credits,cash);
 h.advance(200000);s=h.service.view(a.id,'a');assert.equal(s.round,2,'at most one overdue round after downtime');assert.equal(s.world.deadline,s.serverTime+1000);
 for(let i=0;i<8;i++)h.advance(1000);s=h.service.view(a.id,'a');assert.equal(s.phase,'complete');assert.equal(s.results.length,30);assert.throws(()=>h.act('a',a.id,'season'),/automatisch/);
 h.advance(1000);s=h.service.view(a.id,'a');assert.equal(s.phase,'active');assert.equal(s.season,2);assert.equal(s.history.length,1);assert.equal(s.round,0);
});
test('a full public lobby starts immediately while legacy competitions keep their original readiness rule',t=>{
 const h=setup(t),a=h.enter('a',0);for(let i=1;i<6;i++)h.enter('abcdef'[i],i);assert.equal(h.service.view(a.id,'a').phase,'active');
 const old=h.service.create('a',{id:randomUUID(),title:'Old rules',club:0}),s=h.service.view(old.id,'a');h.service.join('b',{id:randomUUID(),code:s.code,club:1});h.act('a',old.id,'start');h.advance(900000);assert.equal(h.service.view(old.id,'a').round,0);h.act('a',old.id,'ready');h.act('b',old.id,'ready');assert.equal(h.service.view(old.id,'a').round,1);assert.equal(h.service.view(old.id,'a').world,null);
});
test('pack odds boundaries, official legend card totals and duplicate protection are deterministic under a test draw',()=>{
 assert.equal(legends.length,11);assert.equal(legends.find(p=>p.id==='legend-ronaldo').values[0],88);assert.equal(legendMatchPlayer(legends.find(p=>p.id==='legend-kahn')).reflexes,90);
 for(const pack of packTypes){assert.equal(Object.values(pack.odds).reduce((s,n)=>s+n),10000);for(const [roll,expected] of [[0,'normal'],[pack.odds.normal-1,'normal'],[pack.odds.normal,'rare'],[9999-pack.odds.legendary,'rare'],[10000-pack.odds.legendary,'legendary'],[9999,'legendary']]){
   const state={season:1,round:0,clubs:[{players:[]}],managers:[{credits:999999}]};const service=packService({pool,draw:max=>max===10000?roll:0});const receipt=service.open(state,0,pack.id);assert.equal(receipt.rarity,expected);assert.equal(state.clubs[0].players.length,1);assert.equal(receipt.price,pack.price);assert.equal(receipt.currency,'spelcredits');assert.equal(receipt.rules,packRulesVersion);
   const oldIdentity=playerIdentity(state.clubs[0].players[0]);service.open(state,0,pack.id);assert.notEqual(playerIdentity(state.clubs[0].players[1]),oldIdentity);assert.throws(()=>service.open(state,0,pack.id),/twee packs/);
 }}
});
test('packs debit and deliver once atomically, retain source ratings and reject modified prices and payment currencies',t=>{
 const h=setup(t,{packDraw:max=>max===10000?9999:0}),a=h.enter('a',0);h.enter('b',1);h.advance(1000);const s=h.service.view(a.id,'a'),input={id:randomUUID(),version:s.version,type:'pack',packId:'spotlight',packVersion:packRulesVersion};
 h.service.act('a',a.id,input);const after=h.service.view(a.id,'a');assert.equal(after.my.credits,s.my.credits-30000);assert.equal(after.clubs[0].players.length,s.clubs[0].players.length+1);assert.equal(after.my.packHistory.length,1);assert.equal(after.my.packHistory[0].rarity,'legendary');const player=after.clubs[0].players.at(-1),source=structuredClone(player.sourceRating);
 h.service.act('a',a.id,input);assert.deepEqual(h.service.view(a.id,'a'),after);
 h.act('a',a.id,'train',{playerId:player.id,skill:'attack'});assert.deepEqual(h.service.view(a.id,'a').clubs[0].players.at(-1).sourceRating,source);
 assert.throws(()=>h.act('a',a.id,'pack',{packId:'scout',packVersion:packRulesVersion,currency:'SOL'}),/Ongeldige opdracht/);assert.throws(()=>h.act('a',a.id,'pack',{packId:'scout',packVersion:packRulesVersion,price:0}),/Ongeldige opdracht/);assert.throws(()=>h.act('a',a.id,'pack',{packId:'scout',packVersion:'old'}),/packregels/);
 h.act('a',a.id,'ready');assert.throws(()=>h.act('a',a.id,'pack',{packId:'scout',packVersion:packRulesVersion}),/gereedmelding/);
 const b=h.enter('c',0,{rules:'classic'});h.enter('d',1,{rules:'classic'});h.advance(1000);assert.throws(()=>h.act('c',b.id,'pack',{packId:'scout',packVersion:packRulesVersion}),/alleen beschikbaar/);
});
test('failed pack draws roll back the entire stored state and command; full or poor squads pay nothing',t=>{
 const h=setup(t,{packDraw:()=>{throw Error('simulated draw failure');}}),a=h.enter('a',0);h.enter('b',1);h.advance(1000);const before=h.db.prepare('SELECT state,version FROM leagues WHERE id=?').get(a.id);const operations=h.db.prepare('SELECT count(*) AS n FROM operations').get().n;
 assert.throws(()=>h.act('a',a.id,'pack',{packId:'scout',packVersion:packRulesVersion}),/draw failure/);assert.deepEqual(h.db.prepare('SELECT state,version FROM leagues WHERE id=?').get(a.id),before);assert.equal(h.db.prepare('SELECT count(*) AS n FROM operations').get().n,operations);
 const state={season:1,round:0,clubs:[{players:[]}],managers:[{credits:10}]},service=packService({pool});assert.throws(()=>service.open(state,0,'scout'),/onvoldoende/);assert.equal(state.clubs[0].players.length,0);state.managers[0].credits=999999;state.clubs[0].players=Array.from({length:40},(_,i)=>({id:String(i)}));assert.throws(()=>service.open(state,0,'scout'),/selectie is vol/);
 state.clubs[0].players=legends.map(legendMatchPlayer);assert.throws(()=>service.open(state,0,'scout'),/uitgeput/);assert.equal(state.managers[0].credits,999999);
});
test('schema two upgrades preserve exact league, membership and authentication data',()=>{
 const dir=mkdtempSync(join(tmpdir(),'touchline-arena-')),file=join(dir,'game.sqlite');let db=openDatabase(file);
 try{db.prepare('INSERT INTO accounts VALUES (?,?,?)').run('a','A',123);const service=leagueService(db),id=service.create('a',{id:randomUUID(),title:'Preserve',club:0}).id;const state=db.prepare('SELECT state FROM leagues WHERE id=?').get(id).state,secret=db.prepare('SELECT value FROM settings WHERE key=?').get('auth-secret').value;
 db.exec('DROP TABLE worlds; PRAGMA user_version=2');db.close();db=openDatabase(file);assert.equal(db.prepare('PRAGMA user_version').get().user_version,3);assert.equal(db.prepare('SELECT state FROM leagues WHERE id=?').get(id).state,state);assert.equal(db.prepare('SELECT value FROM settings WHERE key=?').get('auth-secret').value,secret);assert.equal(db.prepare('SELECT club FROM members WHERE account=?').get('a').club,0);assert.equal(db.prepare('SELECT count(*) AS n FROM worlds').get().n,0);
 }finally{db.close();rmSync(dir,{recursive:true,force:true});}
});
test('mobile wallet links accept only a public HTTPS origin and wallet login signs only the server message',async()=>{
 for(const origin of ['http://localhost','http://127.0.0.1:3000','https://localhost','javascript:alert(1)','https://user:pass@example.com','https://example.com/path'])assert.equal(phantomBrowseUrl(origin),null);
 assert.equal(phantomBrowseUrl('https://touchline.example'),'https://phantom.app/ul/browse/https%3A%2F%2Ftouchline.example%2Fonline?ref=https%3A%2F%2Ftouchline.example');
 const calls=[],api=async(path,data)=>{calls.push({path,data});return path==='/auth/challenge'?{id:'proof',message:'server nonce message'}:{ok:true};};
 for(const kind of ['phantom','solflare']){let message;const provider={publicKey:{toString:()=> 'public-address'},connect:async()=>{},signMessage:async bytes=>{message=new TextDecoder().decode(bytes);return kind==='phantom'?{signature:new Uint8Array(64)}:new Uint8Array(64);}};await signInWithWallet(kind,api,false,{phantom:{solana:provider},solflare:provider});assert.equal(message,'server nonce message');}
 assert.equal(calls.filter(c=>c.path==='/auth/verify').length,2);assert.equal(calls.some(c=>c.path.includes('payment')),false);
 await assert.rejects(signInWithWallet('phantom',api,false,{}),/niet beschikbaar/);await assert.rejects(signInWithWallet('phantom',api,false,{phantom:{solana:{connect:async()=>{throw {code:4001};},signMessage(){}}}}),/geannuleerd/);
});
