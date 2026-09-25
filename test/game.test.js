import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame, schedule, playRound, standings, train, scout, signPlayer, newSeason } from '../public/game.js';

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
  const game=newGame('My Club');
  assert.equal(scout(game),true);
  const candidate=game.market.find(p=>game.credits>=Math.round((Math.round((p.attack+p.passing+p.defending+p.pace+p.finishing+p.composure)/6)-40)**2*145));
  if(candidate) assert.equal(signPlayer(game,candidate.id),true);
  for(let i=0;i<10;i++) assert.ok(playRound(game));
  assert.equal(game.results.length,30);
  assert.ok(standings(game).every(row=>row.p===10));
  assert.equal(playRound(game),null);
  assert.equal(newSeason(game),true);
  assert.equal(game.clubs[0].name,'My Club');
  assert.equal(game.round,0);
});
