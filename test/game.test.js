import test from 'node:test';
import assert from 'node:assert/strict';
import { beginMatch, clubNames, finishMatch, makeSubstitution, newGame, schedule, playRound, setStarter, standings, train, scout, signPlayer, newSeason } from '../public/game.js';

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
test('halftime substitution and tactics change the second half, then commit once',()=>{
  const game=newGame();
  const half=beginMatch(game);
  assert.equal(half.first.events.every(e=>e.minute<=45),true);
  const out=half.selection[2],inn=game.clubs[0].players.find(p=>!half.selection.includes(p.id));
  assert.equal(makeSubstitution(game,out,inn.id),true);
  game.tactics.mentality=90;
  const final=finishMatch(game);
  assert.equal(final.detail.events.every(e=>e.minute>=1&&e.minute<=90),true);
  assert.equal(final.detail.teams[final.home===0?0:1].some(p=>p.id===inn.id),true);
  assert.equal(game.results.length,3);
  assert.equal(game.pending,null);
});
