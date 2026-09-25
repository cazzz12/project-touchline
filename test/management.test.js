import {unavailableSelection,applyRecommendedSquad} from '../public/fitness.js';
function playRound(game){if(unavailableSelection(game).length)applyRecommendedSquad(game);return playRoundWithoutRotation(game);}
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {newGame,playRound as playRoundWithoutRotation,newSeason,beginMatch,advanceMatch,finishMatch,makeSubstitution,sellPlayer,train,scout,cost,signPlayer,applyAutoInstructions} from '../public/game.js';
import {ensureManagement,recordCash,payroll,maintenance,chooseSponsor,upgradeClub,upgradePrice,scoutingCost,renewContract,renewExpiring,developPlayer,careerRecord,saleOffer} from '../public/management.js';
import {parseBackup,exportBackup,readStoredGame} from '../public/storage.js';
import {formations} from '../public/engine.js';
import {pitchPosition} from '../public/pitch.js';

const toMinute=(game,minute)=>{while(game.pending&&game.pending.minute<minute){game.pending.paused=false;advanceMatch(game);}};
const checkLedger=game=>{
  let balance=game.management.ledgerOpening;
  for(const row of game.management.ledger){balance+=row.amount;assert.equal(row.balance,balance);}
  assert.equal(balance,game.credits);
};
test('legacy upgrade adds no money movements and preserves a match already in progress',()=>{
  const raw=readFileSync(new URL('./fixtures/legacy-v5-live.json',import.meta.url),'utf8'),original=JSON.parse(raw).game;
  const loaded=readStoredGame({getItem:()=>raw,setItem:()=>assert.fail('must not write on read')});
  assert.equal(loaded.error,'');const game=loaded.game;
  for(const key of ['credits','lineupIds','benchIds','captainId','pending','results'])assert.deepEqual(game[key],original[key],key);
  const oldPlayerFields=game.clubs.map(c=>({...c,players:c.players.map(({reflexes,handling,positioning,...p})=>p)}));
  assert.deepEqual(oldPlayerFields,original.clubs);
  assert.equal(game.management.ledger.length,0);checkLedger(game);
  toMinute(game,90);checkLedger(game);assert.ok(parseBackup(exportBackup(game)));
});
test('one round pays the declared income and costs once and records every player minute and goal',()=>{
  const game=newGame('Ajax');chooseSponsor(game,'steady');
  const before=game.credits,wages=payroll(game),upkeep=maintenance(game);
  beginMatch(game);toMinute(game,30);game.pending.paused=true;
  const out=game.pending.selection[2],inside=game.pending.bench[1];
  assert.equal(makeSubstitution(game,out,inside),true);toMinute(game,90);
  assert.equal(game.credits,before+game.lastMatch.reward+6000+6000-wages-upkeep);
  assert.equal(game.management.playerStats[out].minutes,30);
  assert.equal(game.management.playerStats[inside].minutes,60);
  assert.equal(game.management.playerStats[inside].starts,0);
  const sentOff=Object.values(game.management.playerStats).filter(p=>p.redCards);
  assert.ok(sentOff.every(p=>p.starts===1));
  assert.equal(Object.values(game.management.playerStats).reduce((sum,p)=>sum+p.minutes,0),3*22*90-sentOff.reduce((sum,p)=>sum+90-p.minutes,0));
  assert.equal(Object.values(game.management.playerStats).reduce((sum,p)=>sum+p.goals,0),game.results.reduce((sum,r)=>sum+r.goals[0]+r.goals[1],0));
  const complete=structuredClone(game);assert.equal(finishMatch(game),null);assert.equal(advanceMatch(game),null);assert.deepEqual(game,complete);
  checkLedger(game);assert.deepEqual(parseBackup(exportBackup(game)),game);
});
test('club investments cost credits, have effects, and cannot be repeated beyond their limit or during matches',()=>{
  const game=newGame();recordCash(game,1000000,'test','Synthetic test budget');
  const price=upgradePrice(game,'facilities','training'),before=game.credits;
  assert.equal(upgradeClub(game,'facilities','training'),true);assert.equal(game.credits,before-price);
  assert.equal(upgradeClub(game,'staff','coach'),true);
  const p=game.clubs[0].players[0],attack=p.attack;
  assert.equal(train(game,'Attacking'),true);assert.equal(p.attack,Math.min(99,attack+3));
  assert.equal(upgradeClub(game,'staff','scout'),true);assert.equal(scoutingCost(game),13500);
  const cash=game.credits;scout(game);assert.equal(game.credits,cash-13500);
  while(upgradeClub(game,'facilities','training')){}
  assert.equal(game.management.facilities.training,5);assert.equal(upgradeClub(game,'facilities','training'),false);
  assert.equal(upgradeClub(game,'staff','not-real'),false);
  beginMatch(game);const snapshot=structuredClone(game);
  assert.equal(upgradeClub(game,'staff','coach'),false);assert.equal(chooseSponsor(game,'wins'),false);assert.deepEqual(game,snapshot);checkLedger(game);
});
test('individual development is bounded, costs condition and renews only after a round',()=>{
  const game=newGame(),p=game.clubs[0].players[0],passing=p.passing,fitness=p.fitness;
  assert.equal(developPlayer(game,p.id,'passing'),true);assert.equal(p.passing,passing+1);assert.equal(p.fitness,fitness-3);
  assert.equal(developPlayer(game,p.id,'passing'),false);
  playRound(game);p.passing=99;
  assert.equal(developPlayer(game,p.id,'passing'),false);assert.equal(developPlayer(game,p.id,'age'),false);
  assert.equal(developPlayer(game,p.id,'composure'),true);
});
test('selling a starter moves the same player, repairs selection, and pays exactly once',()=>{
  const game=newGame();playRound(game);
  const id=game.lineupIds[2],p=game.clubs[0].players.find(p=>p.id===id),history=structuredClone(game.management.playerStats[id]);
  const offer=saleOffer(game,id,1),before=game.credits;
  assert.equal(sellPlayer(game,id,1),true);assert.equal(game.credits,before+offer.price);
  assert.equal(game.clubs[1].players.find(p=>p.id===id).name,p.name);
  assert.ok(!game.lineupIds.includes(id));assert.equal(new Set([...game.lineupIds,...game.benchIds]).size,18);
  assert.ok(game.lineupIds.includes(game.captainId));assert.deepEqual(game.management.playerStats[id],history);
  assert.equal(sellPlayer(game,id,1),false);assert.equal(saleOffer(game,game.lineupIds[0],0),null);
  while(game.clubs[0].players.length>18){const candidate=game.clubs[0].players.find(p=>saleOffer(game,p.id,1));assert.ok(candidate);sellPlayer(game,candidate.id,1);}
  assert.ok(game.clubs[0].players.filter(p=>p.position==='GK').length>=2);
  assert.equal(saleOffer(game,game.clubs[0].players[0].id,1),null);
  assert.ok(parseBackup(exportBackup(game)));checkLedger(game);
});
test('purchases create contracts and never grant a second copy or a second debit',()=>{
  const game=newGame();recordCash(game,1000000,'test','Synthetic test budget');scout(game);
  const p=game.market[0],before=game.credits;
  assert.equal(signPlayer(game,p.id),true);assert.equal(game.credits,before-cost(p));assert.ok(game.management.contracts[p.id]);
  const snapshot=structuredClone(game);assert.equal(signPlayer(game,p.id),false);assert.deepEqual(game,snapshot);checkLedger(game);
});
test('seasons retain history, award sponsors once and keep contracts meaningful without a financial deadlock',()=>{
  const game=newGame();assert.equal(chooseSponsor(game,'wins'),true);assert.equal(chooseSponsor(game,'title'),false);
  for(let season=1;season<=3;season++){
    for(let round=0;round<10;round++)assert.ok(playRound(game));
    const results=structuredClone(game.results),cash=game.credits;
    assert.equal(newSeason(game),true);assert.deepEqual(game.management.history.at(-1).results,results);assert.ok(game.credits>cash);
    assert.equal(newSeason(game),false);assert.equal(game.management.sponsor,null);
  }
  const r=careerRecord(game);assert.equal(r.matches,30);assert.equal(r.seasons,3);
  assert.equal(beginMatch(game),null,'expired matchday contracts prevent kickoff');
  recordCash(game,-game.credits-1000,'test','Synthetic debt case');
  assert.equal(renewExpiring(game),game.clubs[0].players.length);assert.equal(game.credits,-1000);
  assert.ok(beginMatch(game),'free renewal is possible even in debt');
  assert.ok(parseBackup(exportBackup(game)));checkLedger(game);
});
test('a late sponsor bonus is prorated to prevent signing only for the final table',()=>{
  const game=newGame();for(let round=0;round<9;round++)playRound(game);
  chooseSponsor(game,'wins');playRound(game);newSeason(game);
  const bonus=game.management.ledger.find(e=>e.label==='Sponsorbonus seizoen');
  if(game.management.history[0].place<=3)assert.equal(bonus.amount,3000);else assert.equal(bonus,undefined);
  assert.equal(chooseSponsor(game,'not-a-contract'),false);
});
test('automatic tactics fire once, survive reload and never run while paused',()=>{
  const game=newGame();game.management.auto.chaseGoal=true;game.management.auto.protectLead=true;
  beginMatch(game);toMinute(game,70);game.pending.paused=true;game.pending.stats[0].goals=0;game.pending.stats[1].goals=1;
  const before=structuredClone(game);applyAutoInstructions(game);assert.deepEqual(game,before);
  game.pending.paused=false;advanceMatch(game);assert.equal(game.tactics.mentality,80);assert.equal(game.pending.autoChased,true);
  const restored=parseBackup(exportBackup(game));restored.tactics.mentality=51;restored.pending.paused=false;advanceMatch(restored);
  assert.equal(restored.tactics.mentality,51);assert.equal(restored.pending.coaching.filter(e=>e.text.includes('achterstand aanvallen')).length,1);
  toMinute(restored,75);restored.pending.stats[0].goals=2;restored.pending.stats[1].goals=1;restored.pending.paused=false;advanceMatch(restored);
  assert.equal(restored.tactics.mentality,25);assert.equal(restored.pending.autoProtected,true);
});
test('automatic substitutions respect bench eligibility, fit, captain and the three-substitution cap',()=>{
  const game=newGame();game.management.auto.subTired=true;
  for(const id of game.lineupIds)game.clubs[0].players.find(p=>p.id===id).fitness=40;
  beginMatch(game);toMinute(game,65);
  assert.equal(game.pending.subs,3);assert.equal(new Set([...game.pending.selection,...game.pending.bench,...game.pending.used]).size,18);
  assert.ok(game.pending.selection.includes(game.pending.captainId));assert.ok(game.pending.used.every(id=>!game.pending.selection.includes(id)));
  assert.equal(game.pending.coaching.filter(e=>e.text.includes('Auto-instructie · Wissel')).length,3);
  assert.ok(parseBackup(exportBackup(game)));
});
test('all ten formations have eleven distinct pitch locations and remain usable after export',()=>{
  assert.equal(Object.keys(formations).length,10);
  for(const formation of Object.keys(formations)){
    const positions=formations[formation].map((_,i)=>pitchPosition(formation,i));assert.equal(new Set(positions).size,11);
    assert.ok(positions.every(p=>!p.includes('undefined')&&!p.includes('NaN')));
    const game=newGame();game.tactics.formation=formation;assert.ok(parseBackup(exportBackup(game)));
  }
});
test('invalid finance and management data cannot be imported',()=>{
  for(const mutate of [g=>g.management.staff.coach=99,g=>g.management.auto.chaseGoal='yes',g=>g.management.managerName='<script>'.repeat(30),g=>g.management.history=[null],g=>g.management.playerStats={x:null},g=>g.management.contracts[g.lineupIds[0]].salary=-1,g=>{recordCash(g,100,'test','Synthetic');g.management.ledger[0].balance++;}]){
    const game=newGame();mutate(game);assert.throws(()=>parseBackup(JSON.stringify(game)));
  }
});
test('ledger and season history remain bounded without losing lifetime totals',()=>{
  const game=newGame();for(let i=0;i<520;i++)recordCash(game,1,'test','Synthetic ledger entry');
  assert.equal(game.management.ledger.length,500);checkLedger(game);
  for(let season=0;season<52;season++){
    renewExpiring(game);for(let day=0;day<10;day++)assert.ok(playRound(game));newSeason(game);
  }
  assert.equal(game.management.history.length,50);assert.equal(careerRecord(game).seasons,52);assert.equal(careerRecord(game).matches,520);
  checkLedger(game);assert.ok(parseBackup(exportBackup(game)));
});
