import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {newGame,beginMatch,advanceMatch,playRound} from '../public/game.js';
import {applyRecommendedSquad,injuryFor} from '../public/fitness.js';
import {coachOpponent,opponentCoachView} from '../public/opponent-coach.js';
import {exportBackup,parseBackup} from '../public/storage.js';

const advance=(g,n=90)=>{while(g.pending&&g.pending.minute<n){g.pending.paused=false;advanceMatch(g);}};
function natural(){const g=newGame('AZ');for(let i=0;i<2;i++){applyRecommendedSquad(g);playRound(g);}applyRecommendedSquad(g);beginMatch(g);advance(g,18);return g;}
function knock(g,slot=0){const p=g.pending,side=p.home===0?1:0,club=g.clubs[side?p.away:p.home],player=club.players.find(v=>v.id===p.opponentSelection[slot]);p.events.push({minute:p.minute,side,type:'injury',playerId:player.id,player:player.name,kind:'knock',remaining:1});return player.id;}
const restore=g=>parseBackup(exportBackup(g));

test('v0.17 live careers keep identical complete results without retroactive computer coaching',()=>{
  for(const [club,hash] of [['Ajax','5bad8c32480bae4e8c72c7e93f6b870cdcde3ca4c1a077b0ec91976f64c17cfa'],['PSV','917800aea0261278f7314b3ee79c06e6fdc998037e6e683fc56214949ed5269e']]){
    let g=newGame(club);beginMatch(g);delete g.pending.opponentCoach;advance(g,32);g=restore(g);assert.equal(g.pending.opponentCoach,undefined);advance(g);assert.equal(createHash('sha256').update(JSON.stringify(g)).digest('hex'),hash);
  }
});

test('a natural opponent knock substitutes once without pausing or changing the manager selection and finances',()=>{
  const g=natural(),p=g.pending,c=p.opponentCoach.changes[0];assert.equal(p.minute,18);assert.equal(p.paused,false);assert.equal(p.opponentCoach.bench.length,7);assert.equal(p.opponentCoach.changes.length,1);assert.equal(c.outName,'Sami Ouaissa');assert.equal(c.inName,'Mikkel Bro Hansen');
  assert.equal(p.opponentPlayed[c.outId],18);assert.equal(p.opponentPlayed[c.inId],undefined);assert.ok(!p.opponentSelection.includes(c.outId));assert.ok(p.opponentSelection.includes(c.inId));assert.equal(p.subs,0);assert.deepEqual(p.selection,g.lineupIds);
  const before=structuredClone(g);coachOpponent(g);assert.deepEqual(g,before);const restored=restore(g);assert.equal(restored.pending.paused,true);advance(g,19);advance(restored,19);assert.deepEqual(restored,g);assert.equal(p.opponentPlayed[c.inId],1);
  advance(g);advance(restored);assert.deepEqual(restored,g);assert.equal(g.lastMatch.detail.opponentCoach.changes.length,1);assert.equal(injuryFor(g,c.outId).remaining,1);assert.deepEqual(restore(g),g);
  const side=p.home===0?1:0;assert.equal(g.lastMatch.detail.playedBySide[side][c.outId],18);assert.equal(g.lastMatch.detail.playedBySide[side][c.inId],72);
});

test('keeper substitution preserves previous shots, keeper minutes and the saved result',()=>{
  const g=newGame();beginMatch(g);advance(g,12);const p=g.pending,id=knock(g),shots=p.events.filter(e=>e.keeperId===id);assert.ok(shots.length>0);coachOpponent(g);const c=p.opponentCoach.changes[0];assert.equal(c.outId,id);assert.notEqual(p.opponentSelection[0],id);assert.equal(g.clubs[p.away].players.find(v=>v.id===c.inId).position,'GK');
  let restored=restore(g);advance(g);advance(restored);assert.deepEqual(restored,g);assert.deepEqual(restore(g),g);const keepers=g.lastMatch.detail.keeping[1];assert.equal(keepers.find(k=>k.id===id).minutes,12);assert.equal(keepers.find(k=>k.id===c.inId).minutes,78);
});

test('an unavailable, tired or unsuitable reserve is not brought on and an empty bank leaves the player playing',()=>{
  for(const mode of ['empty','unfit','suspended','injured','wrong-role']){
    const g=newGame();beginMatch(g);advance(g,12);const p=g.pending,id=knock(g),club=g.clubs[p.away],keeper=p.opponentCoach.bench.map(id=>club.players.find(v=>v.id===id)).find(v=>v.position==='GK');assert.ok(keeper);
    if(mode==='empty')p.opponentCoach.bench=[];
    if(mode==='unfit')keeper.fitness=0;
    if(mode==='suspended')g.discipline.suspensions[keeper.id]={reason:'red',remaining:2,season:1,round:1};
    if(mode==='injured')g.medical.injuries[keeper.id]={kind:'knock',remaining:1,season:1,round:1};
    if(mode==='wrong-role')p.opponentCoach.bench=p.opponentCoach.bench.filter(id=>id!==keeper.id);
    const before=structuredClone(g);coachOpponent(g);assert.deepEqual(g,before);assert.equal(p.opponentSelection[0],id);
  }
});

test('substitutions stop after three, never fill a dismissed place and never happen at full time',()=>{
  for(const mode of ['limit','red','full-time']){const g=newGame();beginMatch(g);advance(g,12);const id=knock(g),p=g.pending;
    if(mode==='limit')p.opponentCoach.changes=Array.from({length:3},()=>({outId:'used-out',inId:'used-in'}));
    if(mode==='red'){p.dismissed[1].push(id);p.opponentSelection[0]=null;}
    if(mode==='full-time')p.minute=90;
    const before=structuredClone(g);coachOpponent(g);assert.deepEqual(g,before);
  }
});

test('a used reserve cannot return even if injured again; another unused reserve is required',()=>{
  const g=natural(),p=g.pending,first=p.opponentCoach.changes[0];advance(g,19);knock(g,p.opponentSelection.indexOf(first.inId));p.opponentCoach.bench=[first.outId,first.inId];const before=structuredClone(g);coachOpponent(g);assert.deepEqual(g,before);
});

test('backup validation rejects invented, duplicated and mistimed changes and inconsistent participation',()=>{
  const g=natural();for(const mutate of [
    x=>x.pending.opponentCoach.schema=2,
    x=>x.pending.opponentCoach.bench.push(x.pending.opponentStarted[0]),
    x=>x.pending.opponentCoach.bench[0]='unknown',
    x=>x.pending.opponentCoach.changes.push({...x.pending.opponentCoach.changes[0]}),
    x=>x.pending.opponentCoach.changes[0].minute=17,
    x=>x.pending.opponentCoach.changes[0].minute=19,
    x=>x.pending.opponentCoach.changes[0].inName='Someone else',
    x=>x.pending.opponentPlayed[x.pending.opponentCoach.changes[0].inId]=1,
    x=>x.pending.opponentSelection[0]=x.pending.opponentCoach.changes[0].outId,
    x=>delete x.pending.injuryRules
  ]){const copy=structuredClone(g);mutate(copy);assert.throws(()=>restore(copy));}
  advance(g);const bad=structuredClone(g);bad.lastMatch.detail.opponentCoach.changes[0].minute++;assert.throws(()=>restore(bad));
});

test('the computer coach view hides an unused bank and escapes club and player names',()=>{
  assert.equal(opponentCoachView({changes:[]},'PSV'),'');const g=natural(),c=g.pending.opponentCoach;c.changes[0].outName='<script>bad</script>';const html=opponentCoachView(c,'<Club>');assert.match(html,/1\/3 wissels/);assert.match(html,/&lt;script&gt;/);assert.match(html,/&lt;Club&gt;/);assert.doesNotMatch(html,/<script>/);
});
