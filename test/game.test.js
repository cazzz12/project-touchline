import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceMatch, beginMatch, clubNames, finishMatch, migrateSave, setBench, setCaptain, makeSubstitution, newGame, schedule, playRound, setStarter, standings, train, scout, signPlayer, newSeason } from '../public/game.js';

test('six clubs play every opponent twice over ten rounds',()=>{
  const rounds=schedule();
  assert.equal(rounds.length,10);
  const pairs=rounds.flat().map(pair=>pair.slice().sort().join('-'));
  assert.equal(new Set(pairs).size,15);
  assert.ok([...new Set(pairs)].every(pair=>pairs.filter(p=>p===pair).length===2));
});
test('training has one use per round and a real fitness effect',()=>{
  const game=newGame(); const before=game.clubs[0].players[0].fitness;
  assert.equal(train(game,'Recovery'),true);
  assert.equal(game.clubs[0].players[0].fitness,Math.min(before+9,100));
  assert.equal(train(game,'Attacking'),false);
  playRound(game); assert.equal(train(game,'Attacking'),true);
});
test('a season produces a consistent league table and retains the club',()=>{
  const game=newGame('Ajax');
  assert.equal(scout(game),true);
  const candidate=game.market.find(p=>game.credits>=Math.round((Math.round((p.attack+p.passing+p.defending+p.pace+p.finishing+p.composure)/6)-40)**2*145));
  if(candidate) assert.equal(signPlayer(game,candidate.id),true);
  for(let i=0;i<10;i++) assert.ok(playRound(game));
  assert.equal(game.results.length,30);
  assert.ok(standings(game).every(row=>row.p===10));
  assert.equal(playRound(game),null);
  assert.equal(newSeason(game),true);
  assert.equal(game.clubs[0].name,'Ajax');
  assert.equal(game.round,0);
});
test('real names are unique across six real clubs and a starter can be changed',()=>{
  const game=newGame('PSV');
  assert.deepEqual(new Set(game.clubs.map(c=>c.name)),new Set(clubNames));
  const roster=game.clubs.flatMap(c=>c.players);
  assert.equal(new Set(roster.map(p=>p.id)).size,300);
  const bench=game.clubs[0].players.find(p=>!game.lineupIds.includes(p.id));
  assert.equal(setStarter(game,0,bench.id),true);
  assert.equal(game.lineupIds[0],bench.id);
  assert.equal(setStarter(game,1,bench.id),false);
});
function advanceTo(game,minute){
  while(game.pending&&game.pending.minute<minute){game.pending.paused=false;advanceMatch(game);}
}

test('live substitutions only use the bench; used players cannot return',()=>{
  const game=newGame();const bench=[...game.benchIds],original=[...game.lineupIds];
  assert.equal(setCaptain(game,bench[0]),false);
  assert.equal(setCaptain(game,original[2]),true);
  assert.equal(setBench(game,0,original[2]),false);
  beginMatch(game);advanceTo(game,23);game.pending.paused=true;
  const reserve=game.clubs[0].players.find(p=>!original.includes(p.id)&&!bench.includes(p.id));
  assert.equal(makeSubstitution(game,original[2],reserve.id),false);
  assert.equal(makeSubstitution(game,original[2],bench[0]),true);
  assert.notEqual(game.pending.captainId,original[2]);
  assert.equal(makeSubstitution(game,bench[0],original[2]),false);
  assert.equal(makeSubstitution(game,original[3],bench[1]),true);
  assert.equal(makeSubstitution(game,original[4],bench[2]),true);
  assert.equal(makeSubstitution(game,original[5],bench[3]),false);
  advanceTo(game,90);
  assert.equal(game.lastMatch.detail.played[original[2]],23);
  assert.equal(game.lastMatch.detail.played[bench[0]],67);
  assert.equal(game.results.length,3);
  assert.equal(game.pending,null);
});

test('refresh preserves minute, substitutions and deterministic future results',()=>{
  const game=newGame('PSV');beginMatch(game);advanceTo(game,65);game.pending.paused=true;
  assert.equal(makeSubstitution(game,game.pending.selection[2],game.pending.bench[0]),true);
  const restored=migrateSave(JSON.parse(JSON.stringify(game)));
  assert.equal(restored.pending.minute,65);
  assert.equal(restored.pending.paused,true);
  assert.deepEqual(restored.pending.selection,game.pending.selection);
  advanceTo(game,90);advanceTo(restored,90);
  assert.deepEqual(restored.lastMatch,game.lastMatch);
  assert.equal(restored.credits,game.credits);
  const credits=restored.credits;
  assert.equal(finishMatch(restored),null);
  assert.equal(advanceMatch(restored),null);
  assert.equal(restored.credits,credits);
  assert.equal(restored.results.length,3);
  const afterReload=migrateSave(JSON.parse(JSON.stringify(restored)));
  assert.equal(afterReload.reportOpen,true);
  assert.deepEqual(afterReload.lastMatch,restored.lastMatch);
});

test('halftime and manual pause stop time; final whistle alone settles the round',()=>{
  const game=newGame();beginMatch(game);
  assert.equal(advanceMatch(game),null);
  assert.equal(game.pending.minute,0);
  advanceTo(game,45);
  assert.equal(game.pending.paused,true);
  advanceMatch(game);assert.equal(game.pending.minute,45);
  const credits=game.credits;
  assert.equal(finishMatch(game),null);
  assert.equal(game.round,0);assert.equal(game.credits,credits);
  advanceTo(game,89);assert.equal(game.results.length,0);
  advanceTo(game,90);assert.equal(game.round,1);
});

test('old save upgrades keep club, points and match result at halftime',()=>{
  const g=newGame('FC Twente');const own=g.lineupIds.map(id=>g.clubs[0].players.find(p=>p.id===id));
  const away=g.clubs[5].players.slice(0,11);
  const stats={goals:1,shots:3,onTarget:1,xg:.6,passes:40,completed:30,possessions:23,fouls:1,possession:51,passAccuracy:75};
  g.version=4;delete g.benchIds;delete g.captainId;g.pending={home:0,away:5,selection:[...g.lineupIds],first:{teams:[own,away],stats:[stats,{...stats,goals:0,possessions:22}],events:[]}};
  const restored=migrateSave(JSON.parse(JSON.stringify(g)));
  assert.equal(restored.version,5);assert.equal(restored.clubs[0].name,'FC Twente');
  assert.equal(restored.pending.minute,45);assert.equal(restored.pending.stats[0].goals,1);
  assert.equal(restored.benchIds.length,7);
  advanceTo(restored,90);assert.ok(restored.lastMatch.goals[0]>=1);
});

test('changed live tactics preserve played minutes and affect future match output',()=>{
  const g=newGame();beginMatch(g);advanceTo(g,45);
  const attacking=structuredClone(g),defensive=structuredClone(g),firstEvents=structuredClone(g.pending.events);
  attacking.tactics.mentality=100;defensive.tactics.mentality=0;
  advanceTo(attacking,90);advanceTo(defensive,90);
  assert.deepEqual(attacking.lastMatch.detail.events.filter(e=>e.minute<=45),firstEvents);
  assert.deepEqual(defensive.lastMatch.detail.events.filter(e=>e.minute<=45),firstEvents);
  assert.notDeepEqual(attacking.lastMatch.detail.stats,defensive.lastMatch.detail.stats);
});
