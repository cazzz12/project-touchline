import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {newGame,beginMatch,advanceMatch,playRound,makeSubstitution,moveLivePlayer,setStarter,setBench,newSeason,sellPlayer,standings} from '../public/game.js';
import {simulate} from '../public/engine.js';
import {bookFoul,ensureDiscipline,settleDiscipline,suspensionFor,awardedGoals} from '../public/discipline.js';
import {availablePlayers,applyRecommendedSquad,unavailableSelection} from '../public/fitness.js';
import {developPlayer,careerRecord} from '../public/management.js';
import {parseBackup,exportBackup} from '../public/storage.js';
const advance=(g,n)=>{while(g.pending&&g.pending.minute<n){g.pending.paused=false;advanceMatch(g);}};
const ban=(g,id,remaining=1)=>{g.round=Math.max(1,g.round);g.discipline.suspensions[id]={remaining,reason:'red',season:g.season,round:g.round};};
function redGame(){const g=newGame();g.season=3;delete g.reputation;g.captainId=g.lineupIds[10];for(const c of Object.values(g.management.contracts))c.untilSeason=5;beginMatch(g);advance(g,64);return g;}
function makeLegacy(g){for(const key of ['stadiumRules','stadiumGate','leagueMarketRules','reputationRules','developmentRules','disciplineRules','opponentKeeperMinutes','opponentPlayed','opponentStarted','bookings','dismissed','abandoned'])delete g.pending[key];for(const s of g.pending.stats){delete s.yellowCards;delete s.redCards;}}

test('a foul can receive yellow, second yellow or direct red; dismissed players cannot be booked again',()=>{
  const bookings={},dismissed=[];
  assert.equal(bookFoul(bookings,dismissed,'a',.9,50),null);
  assert.deepEqual(bookFoul(bookings,dismissed,'a',.1,50),{type:'yellow'});
  assert.deepEqual(bookFoul(bookings,dismissed,'a',.1,50),{type:'red',secondYellow:true});
  assert.deepEqual(bookings,{a:2});assert.deepEqual(dismissed,['a']);assert.equal(bookFoul(bookings,dismissed,'a',0,50),null);
  assert.deepEqual(bookFoul(bookings,dismissed,'b',0,50),{type:'red',secondYellow:false});
});

test('red pauses a live match, leaves a role empty and cannot be undone with a substitution',()=>{
  const g=redGame(),p=g.pending,id=p.dismissed[0][0];assert.equal(p.paused,true);assert.equal(p.selection.filter(Boolean).length,10);assert.equal(p.selection[10],null);assert.notEqual(p.captainId,id);assert.ok(p.selection.includes(p.captainId));
  const before=structuredClone(g);assert.equal(makeSubstitution(g,id,p.bench[0]),false);assert.equal(makeSubstitution(g,null,p.bench[0]),false);assert.deepEqual(g,before);
  assert.equal(moveLivePlayer(g,9,10),true);assert.equal(p.selection[9],null);assert.equal(moveLivePlayer(g,0,9),false);assert.equal(p.subs,0);
  assert.equal(makeSubstitution(g,p.selection[2],p.bench[1]),true);assert.equal(p.selection.filter(Boolean).length,10);
  const restored=parseBackup(exportBackup(g));advance(g,90);advance(restored,90);assert.deepEqual(restored,g);
  assert.equal(g.management.playerStats[id].minutes,64);assert.equal(g.management.playerStats[id].redCards,1);assert.equal(suspensionFor(g,id).remaining,2);
  assert.ok(!g.lastMatch.detail.events.some(e=>e.playerId===id&&e.minute>64));assert.ok(parseBackup(exportBackup(g)));
});

test('moving a captain preserves the armband, while moving a player into goal attributes future keeping correctly',()=>{
  const g=newGame();beginMatch(g);advance(g,30);g.pending.paused=true;const old=g.pending.selection[0],replacement=g.pending.selection[2],captain=g.pending.captainId;
  assert.equal(moveLivePlayer(g,2,0),true);assert.equal(g.pending.captainId,captain);const copy=parseBackup(exportBackup(g));advance(g,90);advance(copy,90);assert.deepEqual(copy,g);
  const rows=g.lastMatch.detail.keeping[0];assert.equal(rows.find(p=>p.id===old).minutes,30);assert.equal(rows.find(p=>p.id===replacement).minutes,60);
});

test('full simulations record card events and player minutes consistently with sent-off players',()=>{
  const clubs=newGame().clubs.slice(0,2);let cards=0,reds=0;
  for(let seed=1;seed<=120;seed++){
    const a=simulate({clubs,seed,disciplineRules:1}),b=simulate({clubs,seed,disciplineRules:1});assert.deepEqual(a,b);
    for(const side of [0,1]){
      const e=a.events.filter(e=>e.side===side),red=e.filter(e=>e.type==='red');cards+=a.stats[side].yellowCards;reds+=red.length;
      assert.equal(a.stats[side].redCards,red.length);assert.equal(a.stats[side].yellowCards,e.filter(e=>e.type==='yellow'||e.secondYellow).length);
      for(const event of red){assert.equal(a.playedBySide[side][event.playerId],event.minute);assert.ok(!e.some(x=>x.playerId===event.playerId&&x.minute>event.minute));}
      assert.equal(Object.values(a.playedBySide[side]).reduce((n,v)=>n+v,0),11*a.minute-red.reduce((n,e)=>n+a.minute-e.minute,0));
    }
  }
  assert.ok(cards>100);assert.ok(reds>0);
});

test('playing with ten reduces opportunities across many identical seeds',()=>{
  const g=newGame();beginMatch(g);const clubs=[g.clubs[g.pending.home],g.clubs[g.pending.away]],home=g.pending.selection,away=g.pending.opponentSelection,ten=[...home];ten[10]=null;
  let full=0,short=0;
  for(let seed=1;seed<=250;seed++)for(const [ids,isShort] of [[home,false],[ten,true]]){const r=simulate({clubs,seed,homeSelection:ids,awaySelection:away,disciplineRules:1});if(isShort)short+=r.stats[0].shots;else full+=r.stats[0].shots;}
  assert.ok(short<full*.96,JSON.stringify({full,short}));
});

test('three yellows, second yellow and direct red settle once and start bans next fixture',()=>{
  const g=newGame(),[a,b,c]=g.clubs[0].players;g.discipline.yellows[a.id]=2;g.discipline.yellows[b.id]=1;
  const events=[{playerId:a.id,player:a.name,type:'yellow'},{playerId:b.id,player:b.name,type:'yellow'},{playerId:b.id,player:b.name,type:'red',secondYellow:true},{playerId:c.id,player:c.name,type:'red',secondYellow:false}];
  const r=settleDiscipline(g,[{events}]);assert.equal(r.banned.length,3);assert.equal(g.discipline.yellows[a.id],0);assert.equal(g.discipline.yellows[b.id],1);
  assert.deepEqual([a,b,c].map(p=>suspensionFor(g,p.id).remaining),[1,1,2]);assert.equal(settleDiscipline(g,[{events}]),null);
  g.round++;settleDiscipline(g,[]);assert.equal(suspensionFor(g,a.id),null);assert.equal(suspensionFor(g,b.id),null);assert.equal(suspensionFor(g,c.id).remaining,1);
  g.round++;settleDiscipline(g,[]);assert.equal(suspensionFor(g,c.id),null);
});

test('suspensions block starters and bench but permit training; the proposal omits banned players',()=>{
  const g=newGame(),id=g.lineupIds[2],bench=g.benchIds[1];ban(g,id);ban(g,bench);
  assert.equal(beginMatch(g),null);assert.equal(setStarter(g,1,id),false);assert.equal(setBench(g,1,bench),false);
  assert.equal(developPlayer(g,id,'passing'),true);assert.ok(unavailableSelection(g).includes(id));
  const before=g.credits;applyRecommendedSquad(g);assert.equal(unavailableSelection(g).length,0);assert.equal(g.credits,before);
  const restored=parseBackup(exportBackup(g));playRound(restored);assert.equal(suspensionFor(restored,id),null);assert.equal(restored.management.playerStats[id],undefined);
});

test('bans follow a transfer and survive the season break while yellow accumulation resets',()=>{
  const g=newGame(),id=g.lineupIds[2];ban(g,id,2);g.discipline.yellows[id]=2;assert.equal(sellPlayer(g,id,1),true);
  assert.equal(suspensionFor(g,id).remaining,2);assert.ok(!availablePlayers(g,1).some(p=>p.id===id));
  g.round=10;assert.equal(newSeason(g),true);assert.equal(suspensionFor(g,id).remaining,2);assert.deepEqual(g.discipline.yellows,{});assert.ok(parseBackup(exportBackup(g)));
});

test('short squads can start with seven to ten players and a shorter bench without fictional replacements',()=>{
  const g=newGame();for(const p of g.clubs[0].players.slice(10))ban(g,p.id);
  applyRecommendedSquad(g);assert.equal(g.lineupIds.filter(Boolean).length,10);assert.equal(g.benchIds.length,0);assert.ok(parseBackup(exportBackup(g)));
  assert.ok(beginMatch(g));assert.equal(g.pending.selection.filter(Boolean).length,10);advance(g,90);assert.ok(parseBackup(exportBackup(g)));
});

test('fewer than seven players settles a forfeit once, serves existing bans, and awards no invented player goals',()=>{
  const g=newGame();for(const p of g.clubs[0].players.slice(6))ban(g,p.id);
  beginMatch(g);assert.deepEqual(g.pending.abandoned,[1]);assert.equal(g.pending.minute,0);assert.ok(parseBackup(exportBackup(g)));
  g.pending.paused=false;advanceMatch(g);assert.deepEqual(g.lastMatch.goals,[3,0]);assert.equal(g.lastMatch.reward,0);assert.equal(g.lastMatch.detail.minute,0);
  assert.ok(!g.clubs[0].players.some(p=>g.management.playerStats[p.id]));assert.deepEqual(g.discipline.suspensions,{});assert.ok(parseBackup(exportBackup(g)));
  const saved=structuredClone(g);advanceMatch(g);assert.deepEqual(g,saved);
  assert.deepEqual(awardedGoals({stats:[{goals:1},{goals:5}],abandoned:[0]}),[0,5]);
});

test('a double forfeit gives neither team points or a win and remains consistent in career history',()=>{
  const g=newGame();g.round=1;for(const i of [0,4])for(const p of g.clubs[i].players.slice(6))ban(g,p.id);
  // Round two pairs the managed club with FC Utrecht (index 4).
  beginMatch(g);assert.deepEqual(g.pending.abandoned,[0,1]);g.pending.paused=false;advanceMatch(g);
  assert.deepEqual(g.lastMatch.goals,[0,0]);assert.equal(g.lastMatch.reward,0);assert.equal(g.points,0);
  assert.equal(standings(g).find(r=>r.i===0).pts,0);assert.equal(careerRecord(g).draws,0);assert.equal(careerRecord(g).losses,1);
});

test('a fifth sending-off ends play immediately without crashing the simulation or crediting future minutes',()=>{
  const g=newGame();beginMatch(g);const home=[...g.pending.selection],clubs=[g.clubs[0],g.clubs[5]],removed=home.slice(7);home.fill(null,7);
  let ended;
  for(let seed=1;seed<=100&&!ended;seed++){
    const r=simulate({clubs,seed,homeSelection:home,awaySelection:g.pending.opponentSelection,disciplineRules:1,bookings:[Object.fromEntries(home.filter(Boolean).slice(1).map(id=>[id,1])),{}],dismissed:[removed,[]]});
    if(r.abandoned.includes(0))ended=r;
  }
  assert.ok(ended);assert.ok(ended.minute<90);assert.equal(ended.teams[0].filter(Boolean).length,6);
  assert.ok(ended.events.every(e=>e.minute<=ended.minute));assert.equal(ended.keeping[0][0].minutes,ended.minute);assert.equal(awardedGoals(ended)[0],0);
});

test('old v0.7 pending matches keep exact results and records without new card rules',()=>{
  for(const [club,expected] of [['Ajax','2b5a51292015815ea323c72703ca97fdf87ca33ebd5219f5c6ae68c02760a84c'],['PSV','dfcb065ef18a8afc6686769770ec67d7d9695582b224014bb2c2b3fc0d7d1b51']]){
    let g=newGame(club);beginMatch(g);makeLegacy(g);advance(g,32);delete g.discipline;g=parseBackup(exportBackup(g));advance(g,90);
    const data={results:g.results,credits:g.credits,detail:g.lastMatch.detail,fitness:g.clubs.map(c=>c.players.map(p=>[p.id,p.fitness])),medical:g.medical,playerStats:g.management.playerStats};
    assert.equal(createHash('sha256').update(JSON.stringify(data)).digest('hex'),expected);assert.deepEqual(g.discipline.suspensions,{});assert.equal(g.lastMatch.disciplineReport,undefined);
  }
});

test('invalid discipline backups are rejected without inventing cards or clearing a ban',()=>{
  const g=redGame();assert.ok(parseBackup(exportBackup(g)));
  const mutations=[x=>x.pending.disciplineRules=2,x=>x.pending.dismissed[0]=[],x=>x.pending.selection[10]=x.pending.dismissed[0][0],x=>x.pending.stats[0].redCards=99,x=>x.pending.opponentPlayed={'club-unknown':12},x=>x.discipline.suspensions={'club-unknown':{remaining:1}},x=>x.discipline.yellows[x.clubs[0].players[0].id]=3];
  for(const mutate of mutations){const copy=structuredClone(g);mutate(copy);assert.throws(()=>parseBackup(exportBackup(copy)));}
  const old=structuredClone(g.discipline);ensureDiscipline(g);assert.deepEqual(g.discipline,old);
});
