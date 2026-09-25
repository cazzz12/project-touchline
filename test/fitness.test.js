import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {newGame,beginMatch,advanceMatch,playRound,newSeason,train,setStarter,setBench,makeSubstitution,sellPlayer} from '../public/game.js';
import {injuryFor,injuryRisk,injuryDuration,availablePlayers,unavailableSelection,recommendedSquad,applyRecommendedSquad,settleFitness,fitnessAfterMinutes} from '../public/fitness.js';
import {saleOffer,developPlayer} from '../public/management.js';
import {parseBackup,exportBackup} from '../public/storage.js';
import {formations} from '../public/engine.js';
const advance=(g,minute)=>{while(g.pending&&g.pending.minute<minute){g.pending.paused=false;advanceMatch(g);}};
const injure=(g,id,remaining=2)=>{g.round=Math.max(1,g.round);g.medical.injuries[id]={kind:'muscle',remaining,season:g.season,round:g.round};};

test('legacy live saves keep their recorded match and finish without introducing new fitness rules',()=>{
 const raw=readFileSync(new URL('./fixtures/legacy-v5-live.json',import.meta.url),'utf8'),g=parseBackup(raw),before=structuredClone(g);
 assert.equal(g.pending.medicalRules,undefined);assert.deepEqual(g.medical.injuries,{});
 advance(g,90);assert.deepEqual(g.medical.injuries,{});assert.equal(g.lastMatch.medicalReport,undefined);
 for(const p of g.clubs[0].players){const original=before.clubs[0].players.find(v=>v.id===p.id),minutes=g.lastMatch.detail.played[p.id]||0;assert.equal(p.fitness,minutes?fitnessAfterMinutes(original,minutes):Math.min(original.fitness+3,100));}
 assert.deepEqual(g.clubs.slice(1),before.clubs.slice(1));assert.ok(parseBackup(exportBackup(g)));
});
test('completed rounds restore condition for all clubs using actual minutes and settle exactly once',()=>{
 const g=newGame();for(const c of g.clubs)for(const p of c.players)p.fitness=70;
 const before=structuredClone(g.clubs);beginMatch(g);advance(g,30);g.pending.paused=true;
 const out=g.pending.selection[2],inside=g.pending.bench[1];makeSubstitution(g,out,inside);advance(g,90);
 assert.equal(g.management.playerStats[out].minutes,30);assert.equal(g.management.playerStats[inside].minutes,60);
 for(const [i,c] of g.clubs.entries())for(const p of c.players){const old=before[i].players.find(v=>v.id===p.id),minutes=g.management.playerStats[p.id]?.minutes||0;assert.equal(p.fitness,Math.min(100,(minutes?fitnessAfterMinutes(old,minutes):70)+(minutes?12:18)));}
 const snapshot=structuredClone(g);g.round--;assert.equal(settleFitness(g,{}),null);g.round++;assert.deepEqual(g,snapshot);
 assert.ok(parseBackup(exportBackup(g)));
});
test('blessures are deterministic across reload and never assigned to unused players',()=>{
 const g=newGame();for(const c of g.clubs)for(const p of c.players)p.fitness=25;
 beginMatch(g);advance(g,45);const copy=parseBackup(exportBackup(g));advance(g,90);advance(copy,90);
 assert.deepEqual(copy.medical,g.medical);assert.deepEqual(copy.lastMatch,g.lastMatch);
 assert.ok(Object.keys(g.medical.injuries).length>0);
 for(const id of Object.keys(g.medical.injuries))assert.ok(g.management.playerStats[id]?.minutes>0);
 for(let i=0;i<6;i++)assert.ok(availablePlayers(g,i).length>=18);
});
test('injured players cannot start, sit on the bench or develop; recovery training does not clear an injury',()=>{
 const g=newGame(),id=g.lineupIds[2],p=g.clubs[0].players.find(p=>p.id===id);injure(g,id);
 const initial=structuredClone(g.lineupIds);assert.equal(beginMatch(g),null);assert.deepEqual(g.lineupIds,initial);
 assert.equal(setStarter(g,3,id),false);assert.equal(setBench(g,1,id),false);assert.equal(developPlayer(g,id,'passing'),false);
 const attack=p.attack,fitness=p.fitness;assert.equal(train(g,'Attacking'),true);assert.equal(p.attack,attack);assert.equal(p.fitness,fitness);
 g.trainingUsed=false;train(g,'Recovery');assert.equal(p.fitness,Math.min(100,fitness+9));assert.equal(injuryFor(g,id).remaining,2);
 applyRecommendedSquad(g);assert.equal(unavailableSelection(g).length,0);assert.ok(beginMatch(g));
});
test('fitness proposals are pure, use fit available players and preserve a selected captain in every formation',()=>{
 const g=newGame();injure(g,g.lineupIds[2]);
 for(const formation of Object.keys(formations)){
  g.tactics.formation=formation;const before=structuredClone(g),proposal=recommendedSquad(g);assert.deepEqual(g,before);
  const ids=[...proposal.lineupIds,...proposal.benchIds];assert.equal(new Set(ids).size,18);assert.ok(ids.every(id=>!injuryFor(g,id)));assert.ok(proposal.lineupIds.includes(proposal.captainId));
  assert.equal(g.clubs[0].players.find(p=>p.id===proposal.lineupIds[0]).position,'GK');assert.equal(proposal.benchIds.filter(id=>g.clubs[0].players.find(p=>p.id===id).position==='GK').length,1);
 }
 const outfield=g.clubs[0].players.filter(p=>p.position==='DEF'&&!injuryFor(g,p.id));const a=outfield[0],b=outfield[1];
 Object.assign(a,{attack:80,passing:80,defending:80,pace:80,finishing:80,composure:80,fitness:20});Object.assign(b,{attack:80,passing:80,defending:80,pace:80,finishing:80,composure:80,fitness:95});
 g.tactics.formation='4-3-3';const proposal=recommendedSquad(g);assert.ok(proposal.lineupIds.indexOf(b.id)<proposal.lineupIds.indexOf(a.id)||!proposal.lineupIds.includes(a.id));
 applyRecommendedSquad(g);const captain=g.captainId;assert.equal(recommendedSquad(g).captainId,captain);
 beginMatch(g);const during=structuredClone(g);assert.equal(applyRecommendedSquad(g),false);assert.deepEqual(g,during);
});
test('one missed round reduces injury time once; reloading and medical upgrades cannot skip it',()=>{
 const g=newGame(),id=g.lineupIds[3];injure(g,id,3);g.management.facilities.medical=5;
 for(let remaining=2;remaining>=0;remaining--){applyRecommendedSquad(g);playRound(g);assert.equal(injuryFor(g,id)?.remaining||0,remaining);const copy=parseBackup(exportBackup(g));assert.equal(injuryFor(copy,id)?.remaining||0,remaining);}
 assert.ok(g.lastMatch.medicalReport.recovered.includes(g.clubs[0].players.find(p=>p.id===id).name));
 const p=g.clubs[0].players[0];assert.ok(injuryRisk({...p,fitness:25},90,1)>injuryRisk({...p,fitness:95},90,1));assert.ok(injuryRisk(p,90,5)<injuryRisk(p,90,1));assert.equal(injuryRisk(p,0),0);
 assert.equal(injuryDuration('ankle',1),3);assert.equal(injuryDuration('ankle',3),2);assert.equal(injuryDuration('ankle',5),1);
});
test('injuries follow transfers and selling cannot leave fewer than eighteen fit players',()=>{
 const g=newGame(),id=g.lineupIds[2];injure(g,id);
 assert.ok(saleOffer(g,id,1));assert.equal(sellPlayer(g,id,1),true);assert.ok(injuryFor(g,id));assert.ok(g.clubs[1].players.some(p=>p.id===id));
 while(availablePlayers(g).length>18){const p=availablePlayers(g).find(p=>saleOffer(g,p.id,1));assert.ok(p);sellPlayer(g,p.id,1);}
 assert.equal(availablePlayers(g).length,18);assert.ok(availablePlayers(g).every(p=>saleOffer(g,p.id,1)===null));assert.ok(parseBackup(exportBackup(g)));
});
test('opponents omit injured players and their appearances do not advance while absent',()=>{
 const g=newGame(),opponent=5,id=recommendedSquad(g,opponent,'4-3-3').lineupIds[2];injure(g,id);g.round=0;g.medical.injuries[id].round=1;
 beginMatch(g);assert.ok(!g.pending.opponentSelection.includes(id));advance(g,90);assert.equal(g.management.playerStats[id],undefined);assert.equal(injuryFor(g,id).remaining,1);
});
test('season rest clears injuries and condition while keeping players, contracts and ratings',()=>{
 const g=newGame();g.round=10;injure(g,g.lineupIds[3]);g.clubs[0].players[0].fitness=25;
 const players=g.clubs.flatMap(c=>c.players.map(p=>({...p,fitness:100}))),contracts=structuredClone(g.management.contracts);
 assert.equal(newSeason(g),true);assert.deepEqual(g.clubs.flatMap(c=>c.players),players);assert.deepEqual(g.management.contracts,contracts);assert.deepEqual(g.medical.injuries,{});assert.equal(g.medical.lastRound,10);assert.ok(parseBackup(exportBackup(g)));
});
test('invalid medical saves are rejected and imports preserve injury durations without healing',()=>{
 const g=newGame();injure(g,g.lineupIds[2]);assert.deepEqual(parseBackup(exportBackup(g)).medical,g.medical);
 for(const mutate of [g=>g.medical=null,g=>g.medical.schema=2,g=>g.medical.lastRound=999,g=>g.medical.injuries.unknown={kind:'knock',remaining:1,season:1,round:1},g=>g.medical.injuries[g.lineupIds[2]].remaining=-1,g=>g.medical.injuries[g.lineupIds[2]].kind='fake',g=>g.medical.injuries[g.lineupIds[2]].season=99,g=>{for(const p of g.clubs[0].players)injure(g,p.id);}]){const copy=structuredClone(g);mutate(copy);assert.throws(()=>parseBackup(JSON.stringify(copy)));}
});
