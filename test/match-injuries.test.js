import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {newGame,beginMatch,advanceMatch,makeSubstitution,playRound,clubNames} from '../public/game.js';
import {liveFitness,matchInjuryRisk,matchInjury,matchInjuryView,rollMatchInjuries} from '../public/match-injuries.js';
import {fitnessAfterMinutes,applyRecommendedSquad,availablePlayers,injuryFor} from '../public/fitness.js';
import {exportBackup,parseBackup} from '../public/storage.js';
const advance=(g,n=90)=>{while(g.pending&&g.pending.minute<n){g.pending.paused=false;advanceMatch(g);}};
const knocks=g=>(g.pending?.events||g.lastMatch.detail.events).filter(e=>e.type==='injury');
function injured(){const g=newGame('PSV');beginMatch(g);advance(g,27);assert.equal(g.pending.paused,true);assert.equal(knocks(g)[0].playerId,'club-mauro-junior');return g;}

test('v0.16 pending careers finish with identical whole-career fingerprints after reload',()=>{
  for(const [club,hash] of [['Ajax','6cdba7b70fc4120892a9535ab5e0c838e9a514956e4b1c9e4b118fef519e8e1b'],['PSV','893951371d947bf1aa7252c359b8ae42c723e3cad1b76725a8d83c667cf8fbd9']]){
    let g=newGame(club);beginMatch(g);delete g.pending.injuryRules;advance(g,32);g=parseBackup(exportBackup(g));assert.equal(g.pending.injuryRules,undefined);advance(g);
    assert.equal(createHash('sha256').update(JSON.stringify(g)).digest('hex'),hash);assert.deepEqual(parseBackup(exportBackup(g)),g);
  }
});
test('a real simulated knock pauses the manager and saves only the match event until settlement',()=>{
  const g=newGame('PSV'),clubs=structuredClone(g.clubs),cash=g.credits;beginMatch(g);advance(g,27);
  assert.equal(g.pending.paused,true);assert.equal(g.pending.minute,27);assert.equal(knocks(g).length,1);assert.deepEqual(g.clubs,clubs);assert.equal(g.credits,cash);assert.deepEqual(g.medical.injuries,{});
  const before=structuredClone(g);advanceMatch(g);rollMatchInjuries(g);assert.deepEqual(g,before);
  const restored=parseBackup(exportBackup(g));assert.deepEqual(restored,g);advance(g,90);advance(restored,90);assert.deepEqual(restored,g);
});
test('substituting a knock uses a normal substitution and limits minutes while recovery settles once',()=>{
  const g=injured(),id=knocks(g)[0].playerId,inside=g.pending.bench.find(id=>g.clubs[0].players.find(p=>p.id===id).position!=='GK');
  assert.equal(makeSubstitution(g,id,inside),true);assert.equal(g.pending.subs,1);assert.ok(!g.pending.selection.includes(id));assert.equal(makeSubstitution(g,inside,id),false);
  const restored=parseBackup(exportBackup(g));advance(g);advance(restored);assert.deepEqual(restored,g);
  assert.equal(g.management.playerStats[id].minutes,27);assert.ok(g.management.playerStats[inside].minutes<=63);
  assert.equal(injuryFor(g,id).remaining,1);assert.equal(g.lastMatch.medicalReport.injured.filter(p=>p.name==='Mauro Júnior').length,1);
  const once=structuredClone(g);assert.equal(advanceMatch(g),null);assert.deepEqual(g,once);assert.equal(beginMatch(g),null);
  applyRecommendedSquad(g);playRound(g);assert.equal(injuryFor(g,id),null);assert.equal(g.management.playerStats[id].minutes,27);assert.deepEqual(parseBackup(exportBackup(g)),g);
});
test('continuing after all three substitutions keeps the player on the pitch with reduced effective condition',()=>{
  const g=newGame('PSV');beginMatch(g);const id='club-mauro-junior';
  for(let i=0;i<3;i++)assert.equal(makeSubstitution(g,g.pending.selection.filter(id=>id!=='club-mauro-junior')[i+1],g.pending.bench[0]),true);
  advance(g,27);const player=g.clubs[0].players.find(p=>p.id===id),original=player.fitness;
  assert.equal(g.pending.paused,true);assert.ok(matchInjury(g,id));assert.equal(makeSubstitution(g,id,g.pending.bench[0]),false);
  assert.match(matchInjuryView(g),/geen wissel meer beschikbaar/);assert.equal(liveFitness(g,player,g.pending.played[id]),Math.max(10,fitnessAfterMinutes(player,27)-15));
  advance(g,28);assert.equal(g.pending.played[id],28);assert.equal(player.fitness,original);assert.ok(g.pending.selection.includes(id));assert.deepEqual(parseBackup(exportBackup(g)),{...g,pending:{...g.pending,paused:true}});
});
test('fitness and medical level affect risk; temporary condition has a floor and does not lower attributes',()=>{
  const g=injured(),p=g.clubs[0].players.find(p=>p.id===knocks(g)[0].playerId),before=structuredClone(p);
  assert.ok(matchInjuryRisk({...p,fitness:25})>matchInjuryRisk({...p,fitness:95}));assert.ok(matchInjuryRisk(p,5)<matchInjuryRisk(p,1));
  liveFitness(g,p,27);assert.deepEqual(p,before);assert.equal(liveFitness(g,{...p,fitness:0},89),10);
  const healthy=g.clubs[0].players.find(p=>p.id!==knocks(g)[0].playerId);assert.equal(liveFitness(g,healthy,40),fitnessAfterMinutes(healthy,40));
});
test('opted-in tired-player instructions can replace a lightly injured player after the coach resumes',()=>{
  const g=newGame('PSV'),id='club-mauro-junior';g.clubs[0].players.find(p=>p.id===id).fitness=80;g.management.auto.subTired=true;
  beginMatch(g);advance(g,27);assert.equal(g.pending.paused,true);assert.ok(matchInjury(g,id));assert.equal(g.pending.subs,0);
  advance(g,61);assert.ok(g.pending.used.includes(id));assert.equal(g.pending.played[id],60);assert.ok(g.pending.coaching.some(e=>e.text.includes('Auto-instructie')&&e.text.includes('Mauro Júnior')));
  const saved=parseBackup(exportBackup(g));advance(g);advance(saved);assert.deepEqual(saved,g);assert.equal(injuryFor(g,id).remaining,1);
});
test('events only affect actual participants, keepers retain depth, and opponent knocks apply the same penalty',()=>{
  let enemyKnocks=0;
  for(const club of clubNames){const g=newGame(club);for(let round=0;round<3;round++){for(const c of g.clubs)for(const p of c.players)p.fitness=25;applyRecommendedSquad(g);beginMatch(g);
    while(g.pending){g.pending.paused=false;advanceMatch(g);if(g.pending){
      for(const e of knocks(g)){const own=e.side===(g.pending.home===0?0:1),ids=own?g.pending.selection:g.pending.opponentSelection,minutes=own?g.pending.played:g.pending.opponentPlayed;assert.ok(minutes[e.playerId]>0);
        if(!own){enemyKnocks++;const player=g.clubs[e.side===0?g.pending.home:g.pending.away].players.find(p=>p.id===e.playerId);assert.ok(liveFitness(g,player,minutes[e.playerId])<fitnessAfterMinutes(player,minutes[e.playerId]));}
        assert.ok(ids.includes(e.playerId)||g.pending.used.includes(e.playerId)||g.pending.dismissed[e.side].includes(e.playerId));
      }
    }}
    for(let i=0;i<6;i++){const available=g.clubs[i].players.filter(p=>!injuryFor(g,p.id));assert.ok(available.length>=18);assert.ok(available.filter(p=>p.position==='GK').length>=2);}
    assert.deepEqual(parseBackup(exportBackup(g)),g);}
  }
  assert.ok(enemyKnocks>0);
});
test('roster safety limits prevent extra knocks and unused reserves never receive one',()=>{
  const g=newGame('PSV'),keep=new Set([...g.lineupIds,...g.benchIds]);g.clubs[0].players=g.clubs[0].players.filter(p=>keep.has(p.id));beginMatch(g);advance(g);
  assert.equal(knocks(g).filter(e=>e.side===0).length,0);assert.equal(availablePlayers(g).length,18);
});
test('malformed live injury events and incompatible rule flags are rejected before import',()=>{
  const g=injured();
  for(const mutate of [x=>x.pending.injuryRules=2,x=>delete x.pending.injuryRules,x=>delete x.pending.medicalRules,x=>knocks(x)[0].remaining=3,x=>knocks(x)[0].kind='ankle',x=>knocks(x)[0].side=1,x=>knocks(x)[0].minute=28,x=>knocks(x)[0].playerId=x.pending.bench[0],x=>knocks(x)[0].player='Other name',x=>x.pending.events.push({...knocks(x)[0]})]){const copy=structuredClone(g);mutate(copy);assert.throws(()=>parseBackup(exportBackup(copy)));}
  advance(g);const bad=structuredClone(g);delete bad.lastMatch.detail.injuryRules;assert.throws(()=>parseBackup(exportBackup(bad)));assert.deepEqual(parseBackup(exportBackup(g)),g);
});
test('injury notices escape player text and keep both the choice and exhausted-substitution state visible',()=>{
  const g=injured();knocks(g)[0].player='<script>unsafe</script>';const before=structuredClone(g),html=matchInjuryView(g);
  assert.match(html,/&lt;script&gt;/);assert.doesNotMatch(html,/<script>/);assert.match(html,/Hervatten laat hem doorspelen/);assert.deepEqual(g,before);
  g.pending.subs=3;assert.match(matchInjuryView(g),/geen wissel meer beschikbaar/);
});
