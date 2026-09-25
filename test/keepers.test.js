import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {newGame,beginMatch,advanceMatch,makeSubstitution,playRound,rating,cost} from '../public/game.js';
import {simulate} from '../public/engine.js';
import {recommendedSquad} from '../public/fitness.js';
import {developPlayer,sellPlayer} from '../public/management.js';
import {ensureKeeperSkills,keeperAbility,keeperMatchStats} from '../public/keepers.js';
import {parseBackup,exportBackup} from '../public/storage.js';
const advance=(g,minute)=>{while(g.pending&&g.pending.minute<minute){g.pending.paused=false;advanceMatch(g);}};
const skills=(p,n)=>Object.assign(p,{reflexes:n,handling:n,positioning:n});

test('missing keeper skills migrate once without changing existing players, cash, contracts or prices',()=>{
  const g=newGame(),before=structuredClone(g),keeper=g.clubs[0].players.find(p=>p.position==='GK');
  for(const c of g.clubs)for(const p of c.players){delete p.reflexes;delete p.handling;delete p.positioning;}
  const restored=parseBackup(exportBackup(g));assert.deepEqual(restored,before);
  const k=restored.clubs[0].players.find(p=>p.id===keeper.id);skills(k,99);ensureKeeperSkills(restored);
  assert.equal(k.reflexes,99);assert.equal(rating(k),rating(keeper));assert.equal(cost(k),cost(keeper));
  assert.deepEqual(restored.management.contracts,before.management.contracts);
  assert.deepEqual(parseBackup(exportBackup(restored)),restored);
});

test('stronger keeper skills stop more identical shots without changing chance creation or xG',()=>{
  const g=newGame(),clubs=g.clubs.slice(0,2),teams=clubs.map((_,i)=>recommendedSquad(g,i,'4-3-3').lineupIds);
  const weak=structuredClone(clubs),strong=structuredClone(clubs);
  skills(weak[0].players.find(p=>p.id===teams[0][0]),30);skills(strong[0].players.find(p=>p.id===teams[0][0]),95);
  const goals=[0,0];
  for(let seed=1;seed<=400;seed++){
    const a=simulate({seed,clubs:weak,homeSelection:teams[0],awaySelection:teams[1]}),b=simulate({seed,clubs:strong,homeSelection:teams[0],awaySelection:teams[1]});
    for(const key of ['shots','onTarget','xg','passes','completed'])assert.equal(a.stats[1][key],b.stats[1][key]);
    assert.ok(b.stats[1].goals<=a.stats[1].goals);goals[0]+=a.stats[1].goals;goals[1]+=b.stats[1].goals;
    for(const result of [a,b])for(const side of [0,1])assert.equal(result.keeping[side][0].saves+result.keeping[side][0].conceded,result.stats[1-side].onTarget);
  }
  assert.ok(goals[1]<goals[0]*.8,JSON.stringify(goals));
});

test('fitness, morale and an outfield player in goal change effective keeper quality',()=>{
  const p=skills({...newGame().clubs[0].players[0],position:'GK',fitness:100,morale:90},80),quality=keeperAbility(p);
  assert.ok(keeperAbility({...p,fitness:30})<quality);assert.ok(keeperAbility({...p,morale:10})<quality);
  assert.ok(keeperAbility({...p,position:'DEF'})<quality/2);
});

test('fit squad recommendation uses keeper ability and picks a reserve keeper without changing the manual eleven',()=>{
  const g=newGame(),before=[...g.lineupIds],keepers=g.clubs[0].players.filter(p=>p.position==='GK');
  for(const p of keepers)skills(p,20);skills(keepers.at(-1),99);skills(keepers[1],90);
  const recommendation=recommendedSquad(g);
  assert.equal(recommendation.lineupIds[0],keepers.at(-1).id);assert.equal(recommendation.benchIds[0],keepers[1].id);
  assert.deepEqual(g.lineupIds,before);
});

test('keeper development shares the individual session and respects injury, match and skill limits',()=>{
  const g=newGame(),keeper=g.clubs[0].players.find(p=>p.position==='GK'),field=g.clubs[0].players.find(p=>p.position!=='GK');
  assert.equal(developPlayer(g,field.id,'reflexes'),false);assert.equal(field.reflexes,undefined);
  g.management.facilities.training=3;g.management.staff.coach=2;keeper.reflexes=97;const fitness=keeper.fitness;
  assert.equal(developPlayer(g,keeper.id,'reflexes'),true);assert.equal(keeper.reflexes,99);assert.equal(keeper.fitness,fitness-3);
  assert.equal(developPlayer(g,field.id,'passing'),false);g.management.developmentUsed=false;
  assert.equal(developPlayer(g,keeper.id,'reflexes'),false);
  g.medical.injuries[keeper.id]={kind:'knock',remaining:1,season:1,round:1};assert.equal(developPlayer(g,keeper.id,'handling'),false);
  delete g.medical.injuries[keeper.id];beginMatch(g);assert.equal(developPlayer(g,keeper.id,'handling'),false);
});

test('keeper substitution credits actual minutes and shots; reload preserves the complete result',()=>{
  const g=newGame();beginMatch(g);advance(g,30);g.pending.paused=true;
  const out=g.pending.selection[0],inside=g.pending.bench.find(id=>g.clubs[0].players.find(p=>p.id===id).position==='GK');
  assert.equal(makeSubstitution(g,out,inside),true);
  const restored=parseBackup(exportBackup(g));assert.deepEqual(restored.pending.keeperMinutes,{[out]:30});
  advance(g,90);advance(restored,90);assert.deepEqual(restored,g);
  const side=g.lastMatch.home===0?0:1,rows=g.lastMatch.detail.keeping[side];
  assert.deepEqual(rows.map(p=>[p.id,p.minutes]),[[out,30],[inside,60]]);
  for(const row of rows){
    const k=g.management.playerStats[row.id].keeping;assert.equal(k.minutes,row.minutes);assert.equal(k.saves,row.saves);assert.equal(k.conceded,row.conceded);
    for(const e of g.lastMatch.detail.events.filter(e=>e.side!==side&&e.keeperId===row.id))assert.ok(row.id===out?e.minute<=30:e.minute>30);
  }
  assert.equal(Object.values(g.management.playerStats).filter(p=>p.keeping).length,7);
  assert.deepEqual(parseBackup(exportBackup(g)),g);
});

test('clean sheets require sixty keeper minutes without conceding during those minutes',()=>{
  const clubs=newGame().clubs.slice(0,2),a=clubs[0].players[0],b=clubs[0].players[1],c=clubs[1].players[0];
  const result=keeperMatchStats(clubs,[{side:1,keeperId:a.id,type:'goal'},{side:0,keeperId:c.id,type:'save'}],[{[a.id]:30,[b.id]:60},{[c.id]:90}]);
  assert.equal(result[0][0].cleanSheet,false);assert.equal(result[0][1].cleanSheet,true);assert.equal(result[1][0].cleanSheet,true);
  assert.equal(keeperMatchStats(clubs,[],[{[a.id]:59},{[c.id]:90}])[0][0].cleanSheet,false);
});

test('v0.6 pending matches finish with exactly the previous results, money, events and player records',()=>{
  // Fingerprints generated by the public v0.6.0 code at commit 14ccb8c.
  for(const [club,expected] of [['Ajax','ecd366ca0d14f47d439b56e618e2b5285e036aacedcff738feae185dde1acd9f'],['AZ','65b1e3eeb0d264a6070ea55245728fe11dac4f62076ce007cc9b78f6054b94c5']]){
    let g=newGame(club);beginMatch(g);delete g.pending.keeperRules;delete g.pending.keeperMinutes;
    for(const key of ['disciplineRules','opponentKeeperMinutes','opponentPlayed','opponentStarted','bookings','dismissed','abandoned'])delete g.pending[key];
    for(const s of g.pending.stats){delete s.yellowCards;delete s.redCards;}
    g.pending.opponentSelection=recommendedSquad(g,g.pending.home===0?g.pending.away:g.pending.home,'4-3-3',0).lineupIds;
    advance(g,32);g=parseBackup(exportBackup(g));advance(g,90);
    const data={results:g.results,credits:g.credits,stats:g.lastMatch.detail.stats,events:g.lastMatch.detail.events,fitness:g.clubs.map(c=>c.players.map(p=>[p.id,p.fitness])),medical:g.medical,playerStats:g.management.playerStats};
    assert.equal(createHash('sha256').update(JSON.stringify(data)).digest('hex'),expected);
    assert.equal(g.lastMatch.detail.keeping,undefined);assert.ok(!Object.values(g.management.playerStats).some(p=>p.keeping));
  }
});

test('invalid new keeper save fields are rejected while old optional records remain valid',()=>{
  const g=newGame();beginMatch(g);advance(g,15);
  const mutations=[x=>x.clubs[0].players.find(p=>p.position==='GK').reflexes=null,x=>x.pending.keeperRules=2,x=>x.pending.keeperMinutes={},x=>x.pending.keeperMinutes['club-unknown']=15,x=>x.pending.keeperMinutes[x.pending.selection[0]]=16];
  for(const mutate of mutations){const copy=structuredClone(g);mutate(copy);assert.throws(()=>parseBackup(exportBackup(copy)));}
  playRound(g);assert.ok(parseBackup(exportBackup(g)));
  for(const mutate of [x=>x.lastMatch.detail.keeping[0][0].saves++,x=>x.lastMatch.detail.keeping[0][0].minutes=89,x=>x.lastMatch.detail.keeping[0][0].cleanSheet='yes',x=>Object.values(x.management.playerStats).find(p=>p.keeping).keeping.minutes=-1]){
    const copy=structuredClone(g);mutate(copy);assert.throws(()=>parseBackup(exportBackup(copy)));
  }
});

test('keeper skills and career records follow a transfer without a new identity',()=>{
  const g=newGame();playRound(g);const id=g.lastMatch.detail.keeping[g.lastMatch.home===0?0:1][0].id,p=g.clubs[0].players.find(p=>p.id===id),stats=structuredClone(g.management.playerStats[id]);
  skills(p,91);assert.equal(sellPlayer(g,id,1),true);
  assert.equal(g.clubs[1].players.find(p=>p.id===id).reflexes,91);assert.deepEqual(g.management.playerStats[id],stats);
});
