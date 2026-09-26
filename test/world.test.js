import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {randomUUID} from 'node:crypto';
import {schedule,newGame} from '../public/game.js';
import {playerPositionFit,positionFit} from '../public/engine.js';
import {validWorldPlayer,toMatchPlayer,playerRating,ratingEdition,worldClubs,playerStatGroups,safeClubLogo} from '../public/world-model.js';
import {worldRepository} from '../backend/world.js';
import {openDatabase} from '../backend/database.js';
import {leagueService} from '../backend/leagues.js';
const root=new URL('../public/world/',import.meta.url),index=JSON.parse(readFileSync(new URL('index.json',root))),bundle=id=>JSON.parse(readFileSync(new URL(index.bundlePath+id+'.json',root)));

test('world catalogue covers every declared club with unique players, valid ratings and explicit editions',()=>{
  const ids=new Set(),clubs=new Set();let count=0,fc26=0,fc27=0;
  for(const entry of index.leagues){const b=bundle(entry.id);assert.equal(b.clubs.length,entry.clubs.length);let n=0;
    b.clubs.forEach((c,i)=>{assert.equal(c.id,entry.clubs[i].id);assert.ok(!clubs.has(c.id));clubs.add(c.id);assert.ok(safeClubLogo(c.logo));assert.ok(!/Lombardia FC|Milano FC|Bergamo Calcio/.test(c.name));
      for(const p of c.players){assert.ok(validWorldPlayer(p),p.name);assert.ok(!ids.has(p.id),p.id);ids.add(p.id);assert.ok(playerRating(p));assert.ok(!p.fc26||!p.fc27);if(p.fc26)fc26++;else fc27++;count++;n++;}
      assert.equal(c.players.length,entry.clubs[i].playerCount);
    });assert.equal(n,entry.playerCount);
    if(entry.playable)assert.equal(worldClubs(b).length,b.clubs.length);else assert.throws(()=>worldClubs(b));
  }
  assert.equal(count,index.playerCount);assert.equal(fc26,index.ratedCount);assert.equal(fc27,index.fallbackCount);assert.equal(clubs.size,index.clubCount);
  assert.equal(index.leagues.length,20);assert.equal(count,9636);assert.equal(clubs.size,351);
});
test('FC 26 fingerprints, fallback edition and goalkeeper mapping keep source values truthful',()=>{
  const madrid=bundle('laliga').clubs.find(c=>c.name==='Real Madrid'),mbappe=madrid.players.find(p=>p.eaId===231747),keeper=madrid.players.find(p=>p.name==='Thibaut Courtois');
  assert.equal(mbappe.fc26.overall,91);assert.equal(mbappe.fc26.stats.pac,97);assert.equal(mbappe.fc26.stats.finishing,92);
  const p=toMatchPlayer(mbappe);assert.equal(p.attack,mbappe.fc26.stats.positioning);assert.equal(p.ratingEdition,'FC 26');p.sourceRating.overall=1;assert.equal(mbappe.fc26.overall,91);
  assert.equal(playerPositionFit(p,'LW'),1);assert.equal(playerPositionFit({position:'ST'},'LW'),positionFit('ST','LW'));
  const g=toMatchPlayer(keeper);assert.equal(g.reflexes,90);assert.equal(g.handling,89);assert.equal(g.pace,47);assert.equal(g.passing,33);assert.equal(g.defending,19);
  assert.ok(!playerStatGroups(keeper).flatMap(g=>g[1]).some(([k])=>k==='pac'||k==='dri'));
  const fallback=bundle('liga-mx').clubs.flatMap(c=>c.players).find(p=>p.fc27);assert.equal(ratingEdition(fallback),'FC 27');assert.equal(toMatchPlayer(fallback).sourceRating.overall,fallback.fc27.overall);
  assert.throws(()=>toMatchPlayer({...fallback,fc27:null}));assert.equal(validWorldPlayer({...mbappe,fc26:{...mbappe.fc26,stats:{...mbappe.fc26.stats,finishing:NaN}}}),false);
  assert.equal(safeClubLogo('https://evil.example/logo.png'),null);assert.equal(safeClubLogo('javascript:alert(1)'),null);
});
test('round-robin covers every ordered pair exactly once for small, odd and full leagues',()=>{
  for(const size of [2,6,11,12,18,20,30,40]){
    const days=schedule(size),pairs=new Set(),appearances=Array(size).fill(0);
    assert.equal(days.length,(size-1+(size%2))*2);
    for(const day of days){const playing=new Set();for(const [a,b] of day){assert.ok(a>=0&&a<size&&b>=0&&b<size&&a!==b);assert.ok(!playing.has(a)&&!playing.has(b));playing.add(a);playing.add(b);assert.ok(!pairs.has(a+':'+b));pairs.add(a+':'+b);appearances[a]++;appearances[b]++;}}
    assert.equal(pairs.size,size*(size-1));assert.ok(appearances.every(n=>n===2*(size-1)));
  }
  const old=[];let order=[0,1,2,3,4,5];for(let round=0;round<5;round++){old.push(Array.from({length:3},(_,i)=>round%2?[order[5-i],order[i]]:[order[i],order[5-i]]));order=[order[0],order[5],...order.slice(1,5)];}
  assert.deepEqual(schedule(),[...old,...old.map(d=>d.map(([a,b])=>[b,a]))]);assert.throws(()=>schedule(41));assert.throws(()=>schedule(1));
});
function fixture(t){const db=openDatabase(':memory:');t.after(()=>db.close());for(const id of ['a','b'])db.prepare('INSERT INTO accounts VALUES (?,?,?)').run(id,id,0);return {db,service:leagueService(db)};}
const create=(service,catalogId,club=0)=>service.create('a',{id:randomUUID(),title:'Wereldcompetitie',club,...catalogId?{catalogId,catalogSnapshot:index.id}:{}}).id;
const act=(s,user,id,type,extra={})=>s.act(user,id,{id:randomUUID(),version:s.view(id,user).version,type,...extra});
function pair(s,id,club){const v=s.view(id,'a');s.join('b',{id:randomUUID(),code:v.code,club});act(s,'a',id,'start');}
test('20-club league handles club index 19, readiness, 380 matches and season rollover',t=>{
  const {service:s}=fixture(t),id=create(s,'premier-league',19);pair(s,id,0);
  const initial=s.view(id,'a');assert.equal(initial.myClub,19);assert.equal(initial.clubs.length,20);assert.equal(initial.totalRounds,38);
  const originalSource=JSON.stringify(initial.clubs[19].players[0].sourceRating);
  act(s,'a',id,'train',{playerId:initial.clubs[19].players[0].id,skill:'passing'});
  assert.equal(JSON.stringify(s.view(id,'a').clubs[19].players[0].sourceRating),originalSource);
  for(let round=0;round<38;round++){act(s,'a',id,'ready');act(s,'b',id,'ready');}
  const end=s.view(id,'a');assert.equal(end.phase,'complete');assert.equal(end.results.length,380);assert.ok(end.table.every(r=>r.p===38));assert.equal(end.fixtures.length,0);
  act(s,'a',id,'season');const next=s.view(id,'a');assert.equal(next.season,2);assert.equal(next.round,0);assert.equal(next.history[0].table.length,20);assert.equal(next.my.credits,end.my.credits);
});
test('odd league has a bye without a phantom match, bonus or double settlement',t=>{
  const {service:s}=fixture(t),id=create(s,'indian-super-league',0);pair(s,id,1);const before=s.view(id,'a');assert.equal(before.clubs.length,11);assert.equal(before.fixtures.length,5);
  const bye=Array.from({length:11},(_,i)=>i).find(i=>!before.fixtures.flat().includes(i));assert.equal(bye,0);
  act(s,'a',id,'ready');const command={id:randomUUID(),version:s.view(id,'b').version,type:'ready'};s.act('b',id,command);s.act('b',id,command);
  const after=s.view(id,'a');assert.equal(after.round,1);assert.equal(after.results.length,5);assert.equal(after.my.credits,before.my.credits);assert.equal(after.my.ready,false);
});
test('catalogue validation and invite lookup reject mismatches without corrupting old competitions',t=>{
  const {service:s,db}=fixture(t),old=create(s),before=db.prepare('SELECT state FROM leagues WHERE id=?').get(old).state;
  create(s,'mls',29);assert.equal(db.prepare('SELECT state FROM leagues WHERE id=?').get(old).state,before);
  assert.equal(s.view(old,'a').clubs.length,6);assert.deepEqual(s.view(old,'a').clubs,newGame().clubs);
  assert.throws(()=>create(s,'../../private'));assert.throws(()=>create(s,'liga-portugal'));assert.throws(()=>create(s,'premier-league',25));assert.throws(()=>create(s,undefined,6));
  assert.throws(()=>s.create('a',{id:randomUUID(),title:'Verouderde keuze',club:0,catalogId:'premier-league',catalogSnapshot:'old'}),{status:409});
  const lobby=s.lobby(s.view(old,'a').code);assert.equal(lobby.clubs.length,6);assert.equal(lobby.clubs[0].occupied,true);assert.equal(lobby.clubs[1].occupied,false);
  assert.equal(lobby.clubs[0].players,undefined);assert.equal(lobby.owner,undefined);assert.throws(()=>s.join('b',{id:randomUUID(),code:lobby.code,club:6}));
  pair(s,old,1);assert.throws(()=>s.lobby(lobby.code));
  const bad=structuredClone(bundle('premier-league'));bad.clubs[1].players.push(bad.clubs[0].players[0]);assert.throws(()=>worldClubs(bad));
  assert.throws(()=>worldRepository().create('unknown'));
});
test('database upgrade preserves version-one memberships and exact saved league state across reopen',t=>{
  const dir=mkdtempSync(join(tmpdir(),'touchline-world-')),path=join(dir,'save.sqlite');t.after(()=>rmSync(dir,{recursive:true,force:true}));
  let db=openDatabase(path);db.prepare('INSERT INTO accounts VALUES (?,?,?)').run('a','Manager',0);let s=leagueService(db),id=create(s),state=db.prepare('SELECT state FROM leagues WHERE id=?').get(id).state;
  db.exec('ALTER TABLE members RENAME TO modern_members; CREATE TABLE members (league TEXT NOT NULL REFERENCES leagues(id), account TEXT NOT NULL REFERENCES accounts(id), club INTEGER NOT NULL CHECK(club BETWEEN 0 AND 5), PRIMARY KEY(league,account), UNIQUE(league,club)); INSERT INTO members SELECT * FROM modern_members; DROP TABLE modern_members; PRAGMA user_version=1;');
  const secret=db.prepare('SELECT value FROM settings WHERE key=?').get('auth-secret').value;db.close();db=openDatabase(path);
  assert.equal(db.prepare('PRAGMA user_version').get().user_version,2);assert.equal(db.prepare('SELECT state FROM leagues WHERE id=?').get(id).state,state);assert.equal(db.prepare('SELECT * FROM members').get().club,0);assert.equal(db.prepare('SELECT value FROM settings WHERE key=?').get('auth-secret').value,secret);
  s=leagueService(db);const next=create(s,'mls',29);assert.equal(s.view(next,'a').myClub,29);db.close();
});
