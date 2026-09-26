import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {newGame,beginMatch,advanceMatch,finishMatch,newSeason,updateClubRosters} from '../public/game.js';
import {ensureStadium,stadiumQuote,chooseTicketPrice,settleStadium,supporterForm,ticketIncome} from '../public/stadium.js';
import {upgradeClub,renewExpiring,matchBudget} from '../public/management.js';
import {applyRecommendedSquad} from '../public/fitness.js';
import {exportBackup,parseBackup} from '../public/storage.js';
const advance=(g,minute=90)=>{while(g.pending&&g.pending.minute<minute){g.pending.paused=false;advanceMatch(g);}};
const check=g=>assert.deepEqual(parseBackup(exportBackup(g)),g);
const play=g=>{renewExpiring(g);applyRecommendedSquad(g);assert.ok(beginMatch(g));advance(g);return g.lastMatch;};

test('old careers start empty stadium tracking without rewriting existing data',()=>{
  const g=newGame();g.round=4;g.credits=97543;g.management.ledgerOpening=97543;delete g.stadium;
  const before=structuredClone(g),restored=parseBackup(exportBackup(g));
  assert.deepEqual(restored.stadium,{schema:1,sinceSeason:1,sinceRound:4,lastRound:4,ticketPrice:2,totals:{matches:0,visitors:0,revenue:0},archived:{visitors:0,revenue:0},history:[]});
  const once=structuredClone(restored);ensureStadium(restored);assert.deepEqual(restored,once);delete restored.stadium;assert.deepEqual(restored,before);assert.deepEqual(g,before);
  const v2=parseBackup(JSON.stringify({version:2,clubs:[],round:4,credits:100000,results:[],points:0,color:'#c5ff70'}));assert.equal(v2.stadium.sinceRound,4);
});
test('v0.14 live careers finish identically, including transfers, cash and reports after reload',()=>{
  // Captured from v0.14.0 before implementing this feature; whole-career hashes.
  for(const [club,hash] of [['Ajax','6dd58fd2ac68a4b6240ebba3262fe5756093d247503a5074c07fde1a3300232c'],['PSV','d1247d94212a54be951b8914836d963db311f45ec198bb33c0125c0753002970']]){
    let g=newGame(club);beginMatch(g);delete g.pending.stadiumRules;delete g.pending.stadiumGate;delete g.stadium;
    advance(g,32);g=parseBackup(exportBackup(g));assert.equal(ticketIncome(g,true),6000);advance(g);
    assert.equal(g.stadium.totals.matches,0);const copy=structuredClone(g);delete copy.stadium;delete copy.inbox;
    assert.equal(createHash('sha256').update(JSON.stringify(copy)).digest('hex'),hash);check(g);
  }
});
test('price comparison is pure, bounded and preserves the initial standard ticket income',()=>{
  const g=newGame(),before=structuredClone(g);
  assert.deepEqual([1,2,3,4].map(p=>stadiumQuote(g,p).revenue),[4250,6000,5250,4000]);
  assert.equal(stadiumQuote(g).visitors,3000);assert.equal(matchBudget(g,true).tickets,6000);assert.equal(matchBudget(g,false).tickets,0);assert.deepEqual(g,before);
  g.reputation.points=100000;g.results=Array.from({length:5},()=>({home:0,away:1,goals:[2,0]}));
  assert.equal(stadiumQuote(g,1).occupancy,100);assert.equal(stadiumQuote(g,4).occupancy,50);
  g.reputation.points=0;g.results=g.results.map(r=>({...r,goals:[0,1]}));assert.equal(stadiumQuote(g,4).occupancy,10);
});
test('reputation and the last five current-season results affect demand without changing ratings',()=>{
  const g=newGame(),players=structuredClone(g.clubs);g.reputation.points=49;
  g.results=[{home:0,away:1,goals:[0,9]},...Array.from({length:4},()=>({home:0,away:1,goals:[1,0]})),{home:1,away:0,goals:[1,1]}];
  assert.equal(supporterForm(g),8);assert.equal(stadiumQuote(g).occupancy,69);
  g.results.push({home:1,away:0,goals:[0,0],forfeit:[0,1]});assert.equal(supporterForm(g),4);assert.deepEqual(g.clubs,players);
});
test('price choices cost nothing, survive backups and reject invalid or live edits',()=>{
  const g=newGame(),cash=g.credits;assert.equal(chooseTicketPrice(g,3),true);assert.equal(g.credits,cash);check(g);
  for(const price of [0,5,2.5,'2',NaN,null]){const before=structuredClone(g);assert.equal(chooseTicketPrice(g,price),false);assert.deepEqual(g,before);}
  beginMatch(g);const frozen=structuredClone(g);assert.equal(chooseTicketPrice(g,4),false);assert.equal(upgradeClub(g,'facilities','stadium'),false);assert.deepEqual(g,frozen);
});
test('capacity expansion charges the existing upgrade price and updates only future forecasts',()=>{
  const g=newGame(),cash=g.credits;assert.equal(upgradeClub(g,'facilities','stadium'),true);assert.equal(g.credits,cash-36000);
  assert.equal(stadiumQuote(g).capacity,7500);assert.equal(stadiumQuote(g).revenue,9000);check(g);
});
test('kickoff locks the quote and pays it once after a resumed home game',()=>{
  const g=newGame();chooseTicketPrice(g,3);beginMatch(g);const quote=structuredClone(g.pending.stadiumGate),cash=g.credits;
  assert.equal(settleStadium(g,{home:0,away:5},g.pending),null);advance(g,32);assert.equal(g.credits,cash);
  const resumed=parseBackup(exportBackup(g));advance(g);advance(resumed);assert.deepEqual(g,resumed);
  assert.equal(g.lastMatch.stadiumReport.revenue,quote.revenue);assert.equal(g.lastMatch.settlement.entries.find(e=>e.category==='tickets').amount,5250);
  assert.equal(g.credits,cash+g.lastMatch.settlement.net);assert.equal(g.stadium.totals.revenue,5250);assert.equal(g.stadium.totals.matches,1);
  const settled=structuredClone(g);assert.equal(finishMatch(g),null);assert.equal(settleStadium(g,g.lastMatch,null),null);assert.deepEqual(g,settled);check(g);
});
test('an away match records no stadium income and cannot create a home report',()=>{
  const g=newGame();play(g);const totals=structuredClone(g.stadium.totals);beginMatch(g);
  assert.equal(g.pending.stadiumGate,null);assert.equal(ticketIncome(g,false),0);advance(g);
  assert.equal(g.lastMatch.stadiumReport,undefined);assert.equal(g.lastMatch.settlement.entries.some(e=>e.category==='tickets'),false);
  assert.deepEqual(g.stadium.totals,totals);assert.equal(g.stadium.lastRound,2);check(g);
});
test('a zero-minute forfeit returns all gate income but a match abandoned after kickoff keeps it',()=>{
  const g=newGame();for(const p of g.clubs[0].players.slice(6))g.medical.injuries[p.id]={kind:'knock',remaining:1,season:1,round:0};
  beginMatch(g);assert.equal(ticketIncome(g,true),0);advance(g);assert.equal(g.lastMatch.detail.minute,0);
  assert.equal(g.lastMatch.stadiumReport.cancelled,true);assert.equal(g.stadium.totals.visitors,0);assert.equal(g.stadium.totals.revenue,0);check(g);
  const h=newGame();beginMatch(h);h.pending.minute=12;h.pending.abandoned=[0];
  const report=settleStadium(h,{home:0,away:5},h.pending);assert.equal(report.cancelled,false);assert.equal(report.revenue,6000);
});
test('history stays bounded across seasons while all attendance and income remain in totals',()=>{
  const g=newGame();chooseTicketPrice(g,3);let revenue=0,visitors=0,matches=0;
  for(let s=0;s<5;s++){
    for(let r=0;r<10;r++){const m=play(g);if(m.stadiumReport){revenue+=m.stadiumReport.revenue;visitors+=m.stadiumReport.visitors;matches++;}}
    newSeason(g);assert.equal(supporterForm(g),0);check(g);
  }
  assert.deepEqual(g.stadium.totals,{matches,visitors,revenue});assert.equal(matches,25);assert.equal(g.stadium.history.length,20);assert.ok(g.stadium.archived.revenue>0);assert.equal(g.stadium.ticketPrice,3);
  delete g.rosterVersion;const updated=updateClubRosters(g);assert.deepEqual(updated.stadium,g.stadium);check(updated);
});
test('backup validation rejects incorrect prices, counts, receipts, snapshots and duplicate history',()=>{
  const base=newGame();play(base);check(base);
  for(const mutate of [g=>g.stadium=null,g=>g.stadium.schema=2,g=>g.stadium.ticketPrice=7,g=>g.stadium.totals.matches++,g=>g.stadium.totals.revenue++,g=>g.stadium.archived.visitors++,g=>g.stadium.lastRound=0,g=>g.stadium.history.push(g.stadium.history[0]),g=>g.stadium.history[0].revenue++,g=>g.stadium.history[0].level=6,g=>g.lastMatch.stadiumReport.revenue++,g=>g.lastMatch.stadiumReport.cancelled=true,g=>g.lastMatch.settlement.entries.find(e=>e.category==='tickets').amount++]){
    const g=structuredClone(base);mutate(g);assert.throws(()=>parseBackup(exportBackup(g)));
  }
  const live=newGame();beginMatch(live);check(live);
  for(const mutate of [g=>g.pending.stadiumRules=2,g=>delete g.pending.stadiumRules,g=>g.pending.stadiumGate=null,g=>g.pending.stadiumGate.price=4,g=>g.pending.stadiumGate.season++,g=>g.pending.stadiumGate.revenue++,g=>g.pending.stadiumGate.capacity++,g=>g.pending.stadiumGate.opponent=2]){
    const g=structuredClone(live);mutate(g);assert.throws(()=>parseBackup(exportBackup(g)));
  }
});
