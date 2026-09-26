import test from 'node:test';
import assert from 'node:assert/strict';
import {newGame,scout,cost,signPlayer,beginMatch,advanceMatch,playRound,newSeason,updateClubRosters} from '../public/game.js';
import {recordCash,scoutingCost,renewExpiring} from '../public/management.js';
import {applyRecommendedSquad} from '../public/fitness.js';
import {parseBackup,exportBackup} from '../public/storage.js';
import {defaultCriteria,validCriteria,setScoutingCriteria,addToShortlist,removeFromShortlist,matchesCriteria,broadRole} from '../public/scouting-state.js';
import {searchCandidates,scoutingCandidate,compareCandidate,roleScore} from '../public/scouting.js';
import {submitClubBid,confirmClubPurchase,releaseReason} from '../public/transfers.js';
const check=g=>assert.deepEqual(parseBackup(exportBackup(g)).scoutingDesk,g.scoutingDesk);
const advance=g=>{while(g.pending){g.pending.paused=false;advanceMatch(g);}};

test('old saves gain only an empty scouting desk, preserving a report and a live match',()=>{
  const g=newGame();scout(g);delete g.scoutingDesk;beginMatch(g);g.pending.paused=false;advanceMatch(g);g.pending.paused=true;delete g.scoutingDesk;
  const before=structuredClone(g),restored=parseBackup(exportBackup(g));
  assert.deepEqual(restored.scoutingDesk,{schema:1,criteria:defaultCriteria(),shortlist:[],report:null});delete restored.scoutingDesk;assert.deepEqual(restored,before);
  assert.deepEqual(parseBackup(JSON.stringify({version:2,clubs:[],round:4,credits:100000,results:[],points:0,color:'#c5ff70'})).scoutingDesk.criteria,defaultCriteria());
});
test('free searches match position, actual asking price and skill without changing money or the squad',()=>{
  const g=newGame(),before=structuredClone(g);setScoutingCriteria(g,{role:'MID',budget:100000,skill:'passing',minimum:65});
  const afterProfile=structuredClone(g),rows=searchCandidates(g);assert.ok(rows.length);
  assert.ok(rows.every(q=>q.club!==0&&broadRole(q.player)==='MID'&&q.price<=100000&&q.player.passing>=65));
  assert.ok(rows.every((q,i)=>!i||rows[i-1].player.passing>=q.player.passing));assert.deepEqual(g,afterProfile);
  assert.deepEqual(g.clubs,before.clubs);assert.equal(g.credits,before.credits);check(g);
});
test('invalid profiles leave state intact and keeper criteria exclude outfield players',()=>{
  const g=newGame(),before=structuredClone(g);
  for(const c of [null,[],{}, {...defaultCriteria(),role:'ST'},{...defaultCriteria(),budget:0},{...defaultCriteria(),budget:1.5},{...defaultCriteria(),budget:Infinity},{...defaultCriteria(),skill:'magic'},{...defaultCriteria(),minimum:1},{...defaultCriteria(),skill:'passing',minimum:101},{...defaultCriteria(),role:'MID',skill:'reflexes'}]){
    assert.equal(validCriteria(c),false);assert.equal(setScoutingCriteria(g,c),false);assert.equal(scout(g,c),false);assert.deepEqual(g,before);
  }
  setScoutingCriteria(g,{role:'all',budget:null,skill:'reflexes',minimum:0});assert.ok(searchCandidates(g).every(q=>q.player.position==='GK'));
});
test('a targeted report costs once, returns up to four matches and is unchanged by a later profile edit',()=>{
  const g=newGame(),criteria={role:'MID',budget:200000,skill:'passing',minimum:60};setScoutingCriteria(g,criteria);
  const cash=g.credits,fee=scoutingCost(g);assert.equal(scout(g),true);assert.equal(g.credits,cash-fee);
  assert.ok(g.market.length>0&&g.market.length<=4);assert.ok(g.market.every(p=>matchesCriteria(p,cost(p),criteria)));
  assert.ok(g.market.every((p,i)=>!i||g.market[i-1].passing>=p.passing));check(g);
  const report=structuredClone(g.market),metadata=structuredClone(g.scoutingDesk.report);setScoutingCriteria(g,defaultCriteria());
  assert.deepEqual(g.market,report);assert.deepEqual(g.scoutingDesk.report,metadata);const before=structuredClone(g);
  assert.equal(scout(g),false);assert.deepEqual(g,before);check(g);
});
test('empty and unaffordable searches consume neither credits nor the scouting turn',()=>{
  const g=newGame();setScoutingCriteria(g,{role:'all',budget:1,skill:'any',minimum:0});const before=structuredClone(g);
  assert.equal(scout(g),false);assert.deepEqual(g,before);setScoutingCriteria(g,defaultCriteria());
  recordCash(g,100-g.credits,'test','Low budget');const poor=structuredClone(g);assert.equal(scout(g),false);assert.deepEqual(g,poor);
  recordCash(g,200000,'test','Test budget');assert.equal(scout(g),true);check(g);
});
test('narrow keeper reports may contain fewer than four and staff discounts survive export',()=>{
  const probe=newGame();setScoutingCriteria(probe,{role:'GK',budget:null,skill:'reflexes',minimum:0});scout(probe);const minimum=probe.market[0].reflexes;
  for(let level=0;level<=3;level++){
    const g=newGame();g.management.staff.scout=level;setScoutingCriteria(g,{role:'GK',budget:null,skill:'reflexes',minimum});
    assert.equal(scout(g),true);assert.ok(g.market.length>0&&g.market.length<4);assert.ok(g.market.every(p=>p.position==='GK'));
    assert.equal(g.scoutingDesk.report.fee,15000-level*1500);check(g);
  }
});
test('shortlist deduplicates stable identities, caps at twenty and survives removal and export',()=>{
  const g=newGame(),cash=g.credits,players=g.clubs.slice(1).flatMap(c=>c.players);
  assert.equal(addToShortlist(g,'absent'),false);assert.equal(addToShortlist(g,g.clubs[0].players[0].id),false);
  for(const p of players.slice(0,20))assert.equal(addToShortlist(g,p.id),true);
  assert.equal(addToShortlist(g,players[0].id),false);assert.equal(addToShortlist(g,players[20].id),false);assert.equal(g.scoutingDesk.shortlist.length,20);
  assert.equal(removeFromShortlist(g,players[1].id),true);assert.equal(removeFromShortlist(g,players[1].id),false);assert.equal(addToShortlist(g,players[20].id),true);
  assert.equal(g.credits,cash);check(g);
});
test('comparisons default to a same-role starter, accept another own player and are entirely read-only',()=>{
  const g=newGame(),p=g.clubs[1].players.find(p=>p.position==='MID'),before=structuredClone(g),c=compareCandidate(g,p.id);
  assert.ok(c);assert.equal(broadRole(c.own),'MID');assert.ok(g.lineupIds.includes(c.own.id));assert.equal(c.difference,roleScore(p)-roleScore(c.own));
  const other=c.options.find(p=>p.id!==c.own.id);assert.equal(compareCandidate(g,p.id,other.id).own.id,other.id);
  assert.equal(compareCandidate(g,p.id,g.clubs[0].players.find(p=>p.position==='GK').id),null);assert.equal(compareCandidate(g,g.clubs[0].players[0].id),null);
  assert.equal(compareCandidate(g,'absent'),null);assert.deepEqual(g,before);
});
test('role scores use explicit weights and keep condition separate from quality',()=>{
  const p={position:'GK',reflexes:80,handling:60,positioning:40,fitness:1};assert.equal(roleScore(p),65);p.fitness=100;assert.equal(roleScore(p),65);
  assert.equal(roleScore({position:'CM',passing:80,composure:60,stamina:50,defending:40}),65);
});
test('shortlisted report players become own players on purchase and cannot be purchased twice',()=>{
  const g=newGame();recordCash(g,1000000,'test','Test budget');scout(g);const p=g.market[0];addToShortlist(g,p.id);const cash=g.credits;
  assert.equal(signPlayer(g,p.id),true);assert.equal(g.credits,cash-cost(p));assert.equal(scoutingCandidate(g,p.id).club,0);
  assert.equal(compareCandidate(g,p.id),null);const bought=structuredClone(g);assert.equal(signPlayer(g,p.id),false);assert.deepEqual(g,bought);
  assert.equal(g.scoutingDesk.shortlist[0].id,p.id);check(g);
});
test('club acquisitions resolve the shortlisted identity at its new club with its real contract salary',()=>{
  const g=newGame();recordCash(g,1000000,'test','Test budget');const p=g.clubs[1].players.find(p=>!releaseReason(g,1,p.id));addToShortlist(g,p.id);
  const q=scoutingCandidate(g,p.id),o=submitClubBid(g,1,p.id,q.price);assert.equal(confirmClubPurchase(g,o.id),true);
  assert.equal(scoutingCandidate(g,p.id).club,0);assert.equal(g.management.contracts[p.id].salary,q.salary);check(g);
});
test('a report survives a live-match save, expires on completion and leaves unavailable shortlist entries',()=>{
  const g=newGame();scout(g);const id=g.market[0].id;addToShortlist(g,id);const desk=structuredClone(g.scoutingDesk);beginMatch(g);
  const before=structuredClone(g);assert.equal(scout(g),false);assert.deepEqual(g,before);assert.deepEqual(g.scoutingDesk,desk);check(g);
  const restored=parseBackup(exportBackup(g));advance(restored);assert.equal(restored.scoutingDesk.report,null);assert.equal(scoutingCandidate(restored,id),null);
  assert.equal(restored.scoutingDesk.shortlist[0].id,id);assert.equal(signPlayer(restored,id),false);check(restored);
});
test('new seasons and explicit roster updates retain search criteria and shortlist without retaining a report',()=>{
  const g=newGame();addToShortlist(g,g.clubs[1].players[0].id);setScoutingCriteria(g,{role:'MID',budget:300000,skill:'passing',minimum:60});
  const shortlist=structuredClone(g.scoutingDesk.shortlist),criteria=structuredClone(g.scoutingDesk.criteria);
  for(let i=0;i<10;i++){renewExpiring(g);applyRecommendedSquad(g);playRound(g);}assert.equal(newSeason(g),true);
  assert.deepEqual(g.scoutingDesk.shortlist,shortlist);assert.deepEqual(g.scoutingDesk.criteria,criteria);check(g);
  scout(g);delete g.rosterVersion;const before=structuredClone(g),updated=updateClubRosters(g);assert.deepEqual(g,before);
  assert.deepEqual(updated.scoutingDesk.shortlist,shortlist);assert.deepEqual(updated.scoutingDesk.criteria,criteria);assert.equal(updated.scoutingDesk.report,null);check(updated);
});
test('scouting import rejects malformed lists, impossible times and inconsistent report criteria',()=>{
  const base=newGame();addToShortlist(base,base.clubs[1].players[0].id);scout(base);check(base);
  for(const mutate of [g=>g.scoutingDesk=null,g=>g.scoutingDesk.schema=2,g=>g.scoutingDesk.criteria.budget=-1,g=>g.scoutingDesk.shortlist.push(g.scoutingDesk.shortlist[0]),g=>g.scoutingDesk.shortlist[0].id='bad-id',g=>g.scoutingDesk.shortlist[0].season=2,g=>g.scoutingDesk.shortlist[0].round=1,g=>g.scoutingDesk.report.fee=1,g=>g.scoutingDesk.report.round=1,g=>g.scoutingDesk.report.criteria.budget=1,g=>g.scout=null]){
    const g=structuredClone(base);mutate(g);assert.throws(()=>parseBackup(exportBackup(g)));
  }
});
