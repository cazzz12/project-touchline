import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {clubData, playerIdentity, ROSTER_VERSION} from '../public/clubs.js';
import {formations, lineUp, positionFit} from '../public/engine.js';
import {KEY, beginMatch, initialClubs, newGame, playRound, scout, updateClubRosters} from '../public/game.js';
import {parseBackup, restoreBackup, RECOVERY_KEY} from '../public/storage.js';

const legacyRaw=readFileSync(new URL('./fixtures/legacy-v5-live.json',import.meta.url),'utf8');
test('each club starts with its own sourced squad, unique identities and a usable eleven in every formation',()=>{
  const all=initialClubs.flatMap(c=>c.players);
  assert.equal(all.length,167);
  assert.equal(new Set(all.map(p=>p.id)).size,all.length);
  assert.equal(new Set(all.map(p=>playerIdentity(p.name))).size,all.length);
  for(const source of clubData){
    const game=newGame(source.name),club=game.clubs[0];
    assert.equal(club.name,source.name);
    assert.deepEqual(club.players.map(p=>[p.name,p.number,p.position]),source.players.map(p=>[p.name,p.number,p.position]));
    assert.equal(new Set(source.players.map(p=>p.number)).size,source.players.length);
    assert.ok(club.players.every(p=>p.age===null));
    for(const formation of Object.keys(formations)){
      const xi=lineUp(club,formation);
      assert.equal(xi.length,11);assert.equal(new Set(xi.map(p=>p.id)).size,11);
      assert.equal(xi[0].position,'GK');
      assert.ok(xi.every((p,i)=>positionFit(p.position,formations[formation][i])===1),source.name+' '+formation);
    }
    assert.equal(parseBackup(JSON.stringify(game)).rosterVersion,ROSTER_VERSION);
    for(let day=0;day<10;day++)playRound(game);
    assert.equal(parseBackup(JSON.stringify(game)).results.length,30);
  }
});

test('an actual old save retains its players and live match until explicitly updated',()=>{
  const game=parseBackup(legacyRaw),before=structuredClone(game);
  assert.equal(game.rosterVersion,undefined);
  assert.equal(game.clubs[0].players.length,50);
  assert.equal(game.pending.minute,32);
  assert.equal(game.pending.subs,1);
  assert.throws(()=>updateClubRosters(game),/lopende wedstrijd/);
  assert.deepEqual(game,before);
  // Finish the old match normally before applying the new dataset.
  playRound(game);game.trainingUsed=true;game.training='Attacking';
  const original=structuredClone(game),updated=updateClubRosters(game);
  assert.deepEqual(game,original,'update prepares a copy, never mutates the active career');
  for(const key of ['credits','points','results','round','season','color','tactics','training','trainingUsed','lastMatch','scout'])assert.deepEqual(updated[key],game[key],key);
  assert.deepEqual(updated.clubs.map(c=>c.name),game.clubs.map(c=>c.name));
  assert.equal(updated.rosterVersion,ROSTER_VERSION);
  assert.equal(updated.clubs[0].players.length,28);
  assert.ok(updated.lineupIds.includes(updated.captainId));assert.equal(updated.benchIds.length,7);
  assert.ok(updated.benchIds.some(id=>updated.clubs[0].players.find(p=>p.id===id).position==='GK'));
  assert.throws(()=>updateClubRosters(updated),/al/);
  const entries=new Map([[KEY,JSON.stringify(game)]]),storage={getItem:k=>entries.get(k)??null,setItem:(k,v)=>entries.set(k,v)};
  restoreBackup(storage,updated,game);
  assert.deepEqual(parseBackup(storage.getItem(RECOVERY_KEY)),game);
  assert.deepEqual(parseBackup(storage.getItem(KEY)),updated);
  restoreBackup(storage,parseBackup(storage.getItem(RECOVERY_KEY)),updated);
  assert.deepEqual(parseBackup(storage.getItem(KEY)),game);
});

test('scouting never offers someone already playing for any of the six clubs',()=>{
  const game=newGame(),names=new Set(game.clubs.flatMap(c=>c.players.map(p=>playerIdentity(p.name))));
  for(let round=0;round<10;round++){
    game.round=round;game.scout=null;game.credits=1000000;
    assert.equal(scout(game),true);
    assert.ok(game.market.every(p=>!names.has(playerIdentity(p.name))));
    assert.equal(new Set(game.market.map(p=>playerIdentity(p.name))).size,4);
  }
});

test('broad source roles work on both sides without changing old precise-position rules',()=>{
  for(const [p,slots] of [['DEF',['RB','CB','LB']],['MID',['CDM','CM','CAM','RM','LM']],['ATT',['RW','LW','ST']]])for(const slot of slots)assert.equal(positionFit(p,slot),1);
  assert.equal(positionFit('RB','RB'),1);assert.equal(positionFit('RB','LB'),.93);
  assert.equal(positionFit('GK','ST'),.78);assert.equal(positionFit('ATT','CB'),.78);
});
