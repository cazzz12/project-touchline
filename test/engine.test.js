import test from 'node:test';
import assert from 'node:assert/strict';
import { createClubs, lineUp, simulate } from '../public/engine.js';

test('generates 100 unique fictional player IDs and valid teams',()=>{
  const clubs=createClubs();
  assert.equal(clubs.flatMap(c=>c.players).length,100);
  assert.equal(new Set(clubs.flatMap(c=>c.players.map(p=>p.id))).size,100);
  for (const club of clubs) assert.equal(new Set(lineUp(club).map(p=>p.id)).size,11);
});
test('same seed and tactics give identical match replay',()=>{
  const input={seed:827,homeTactics:{formation:'4-4-2',pressing:74}};
  assert.deepEqual(simulate(input),simulate(input));
});
test('events and aggregate statistics stay consistent',()=>{
  for(let seed=0;seed<100;seed++) {
    const result=simulate({seed});
    assert.equal(result.stats.reduce((n,s)=>n+s.possessions,0),90);
    for(let side=0;side<2;side++) {
      const s=result.stats[side];
      assert.equal(s.shots,result.events.filter(e=>e.side===side).length);
      assert.equal(s.goals,result.events.filter(e=>e.side===side&&e.type==='goal').length);
      assert.ok(s.onTarget<=s.shots && s.goals<=s.shots);
    }
  }
});
test('aggressive mentality creates more chances over many seeds',()=>{
  let aggressive=0,conservative=0;
  for(let seed=0;seed<120;seed++) {
    aggressive+=simulate({seed,homeTactics:{mentality:90}}).stats[0].shots;
    conservative+=simulate({seed,homeTactics:{mentality:10}}).stats[0].shots;
  }
  assert.ok(aggressive>conservative*1.5);
});
