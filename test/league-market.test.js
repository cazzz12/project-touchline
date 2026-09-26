import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {newGame,beginMatch,advanceMatch,finishMatch,playRound,newSeason,updateClubRosters} from '../public/game.js';
import {leagueCandidate,settleLeagueMarket} from '../public/league-market.js';
import {ensureLeagueMarket,retainedDepth} from '../public/league-market-state.js';
import {settleClubMarket} from '../public/club-market.js';
import {clubBudget,recordClubBudget,MAX_CLUB_BUDGET} from '../public/club-market-state.js';
import {broadRole,addToShortlist} from '../public/scouting-state.js';
import {scoutingCandidate} from '../public/scouting.js';
import {renewExpiring} from '../public/management.js';
import {recommendedSquad,applyRecommendedSquad} from '../public/fitness.js';
import {parseBackup,exportBackup} from '../public/storage.js';
const advance=(g,minute=90)=>{while(g.pending&&g.pending.minute<minute){g.pending.paused=false;advanceMatch(g);}};
const check=g=>assert.deepEqual(parseBackup(exportBackup(g)),g);
// Pause settlement just before the new rule by completing a legacy-rule match.
function ready(){const g=newGame();beginMatch(g);delete g.pending.leagueMarketRules;advance(g);return g;}
function next(g){renewExpiring(g);applyRecommendedSquad(g);assert.ok(playRound(g));}

test('migration starts an empty journal without changing a save, budget or pending match',()=>{
  for(const live of [false,true]){
    const g=ready();if(live){beginMatch(g);delete g.pending.leagueMarketRules;advance(g,23);g.pending.paused=true;}
    delete g.leagueMarket;const before=structuredClone(g),restored=parseBackup(exportBackup(g));
    assert.deepEqual(restored.leagueMarket,{schema:1,sinceSeason:1,sinceRound:1,lastRound:1,nextId:1,totalVolume:0,archivedVolume:0,history:[]});
    const once=structuredClone(restored);ensureLeagueMarket(restored);assert.deepEqual(restored,once);assert.equal(settleLeagueMarket(restored,1),null);
    delete restored.leagueMarket;assert.deepEqual(restored,before);assert.deepEqual(g,before);
  }
  const v2=parseBackup(JSON.stringify({version:2,clubs:[],round:4,credits:100000,results:[],points:0,color:'#c5ff70'}));assert.equal(v2.leagueMarket.sinceRound,4);assert.equal(v2.leagueMarket.lastRound,4);
});
test('v0.13 live matches retain exact club rosters, finances and match history after reload',()=>{
  // Generated with v0.13.0 at commit bbab591 before introducing leagueMarketRules.
  for(const [club,expected] of [['Ajax','83c7350b29e314f0bc356d2cf240a7a0bfa9ac145d15ddbd0d5edfea279ea75b'],['PSV','a8ebd6b8d15f9f3ca3f643f3a8b438e3f3292a6f4d7e4412dc9b83b7b2fda2b8']]){
    let g=newGame(club);beginMatch(g);delete g.pending.leagueMarketRules;delete g.leagueMarket;advance(g,32);g=parseBackup(exportBackup(g));advance(g);
    const data={clubs:g.clubs,credits:g.credits,results:g.results,lastMatch:g.lastMatch,management:g.management,medical:g.medical,discipline:g.discipline,clubMarket:g.clubMarket,transferDesk:g.transferDesk,scoutingDesk:g.scoutingDesk};
    assert.equal(createHash('sha256').update(JSON.stringify(data)).digest('hex'),expected);assert.equal(g.leagueMarket.history.length,0);check(g);
    next(g);assert.equal(g.leagueMarket.lastRound,2);assert.ok(g.leagueMarket.history.length<=1);
  }
});
test('the market waits for completion and settles exactly once even after repeated calls and reload',()=>{
  const g=newGame(),fresh=structuredClone(g);assert.equal(settleLeagueMarket(g,1),null);assert.deepEqual(g,fresh);
  beginMatch(g);advance(g,35);const live=structuredClone(g);assert.equal(settleLeagueMarket(g,1),null);assert.deepEqual(g,live);
  const restored=parseBackup(exportBackup(g));advance(g);advance(restored);assert.deepEqual(g,restored);assert.equal(g.leagueMarket.history.length,1);
  const settled=structuredClone(g);assert.equal(settleLeagueMarket(g,1),null);assert.equal(settleClubMarket(g,1),0);assert.equal(finishMatch(g),null);assert.deepEqual(g,settled);check(g);
});
test('a transfer preserves total opponent cash and leaves all manager decisions untouched',()=>{
  const g=ready(),before=structuredClone(g),cash=g.clubMarket.clubs.reduce((n,c)=>n+c.balance,0),trade=settleLeagueMarket(g,1);assert.ok(trade);
  for(const key of ['credits','management','lineupIds','benchIds','captainId','tactics','results','lastMatch','medical','discipline','development','scoutingDesk'])assert.deepEqual(g[key],before[key],key);
  assert.deepEqual(g.clubs[0],before.clubs[0]);assert.equal(g.clubMarket.clubs.reduce((n,c)=>n+c.balance,0),cash);
  assert.equal(clubBudget(g,trade.buyer),clubBudget(before,trade.buyer)-trade.price);assert.equal(clubBudget(g,trade.seller),clubBudget(before,trade.seller)+trade.price);
  assert.equal(g.clubMarket.clubs[trade.buyer-1].ledger.at(-1).amount,-trade.price);assert.equal(g.clubMarket.clubs[trade.seller-1].ledger.at(-1).amount,trade.price);check(g);
});
test('only affordable reserves are candidates and sold identities remain unique with live shortlist references',()=>{
  const g=ready(),q=leagueCandidate(g,1),before=structuredClone(g);assert.ok(q);assert.deepEqual(g,before);
  assert.ok(!recommendedSquad(g,q.seller,'4-3-3').lineupIds.includes(q.player.id));assert.ok(q.price<=clubBudget(g,q.buyer));
  addToShortlist(g,q.player.id);const original=structuredClone(q.player),trade=settleLeagueMarket(g,1);assert.equal(trade.playerId,original.id);delete original.number;
  assert.deepEqual(g.clubs[trade.buyer].players.find(p=>p.id===trade.playerId),original);assert.equal(g.clubs.flatMap(c=>c.players).filter(p=>p.id===trade.playerId).length,1);
  assert.equal(scoutingCandidate(g,trade.playerId).club,trade.buyer);assert.equal(g.scoutingDesk.shortlist[0].id,trade.playerId);check(g);
});
test('zero budgets create no trade and a settled round cannot be rerolled by adding money',()=>{
  const g=ready();for(let i=1;i<=5;i++)recordClubBudget(g,i,-clubBudget(g,i),'Synthetic spent budget');const before=structuredClone(g);
  assert.equal(settleLeagueMarket(g,1),null);assert.equal(g.leagueMarket.lastRound,1);assert.deepEqual(g.clubs,before.clubs);assert.deepEqual(g.clubMarket,before.clubMarket);
  recordClubBudget(g,1,120000,'Synthetic restored budget');const done=structuredClone(g);assert.equal(settleLeagueMarket(g,1),null);assert.deepEqual(g,done);check(g);
});
test('rules, complete fixtures and prior allowance settlement are required',()=>{
  const g=ready(),before=structuredClone(g);assert.equal(settleLeagueMarket(g,undefined),null);assert.equal(settleLeagueMarket(g,2),null);assert.deepEqual(g,before);
  g.clubMarket.lastRound=0;assert.equal(settleLeagueMarket(g,1),null);g.clubMarket.lastRound=1;
  const result=g.results.pop(),incomplete=structuredClone(g);assert.equal(settleLeagueMarket(g,1),null);assert.deepEqual(g,incomplete);g.results.push(result);assert.ok(settleLeagueMarket(g,1));
});
test('candidate guards exclude unavailable players, saturated buyers and exhausted seller depth',()=>{
  const g=ready(),q=leagueCandidate(g,1);assert.ok(q);const p=q.player;
  g.medical.injuries[p.id]={kind:'knock',remaining:1,season:1,round:1};assert.notEqual(leagueCandidate(g,1)?.player.id,p.id);delete g.medical.injuries[p.id];
  g.discipline.suspensions[p.id]={reason:'red',remaining:1,season:1,round:1};assert.notEqual(leagueCandidate(g,1)?.player.id,p.id);delete g.discipline.suspensions[p.id];
  const players=g.clubs[q.seller].players,role=broadRole(p),kept=players.filter(v=>broadRole(v)===role&&v.id!==p.id).slice(0,retainedDepth[role]-1);
  g.clubs[q.seller].players=players.filter(v=>broadRole(v)!==role).concat(kept,p);assert.notEqual(leagueCandidate(g,1)?.player.id,p.id);g.clubs[q.seller].players=players;
  g.clubs[1].players=Array(55).fill(g.clubs[1].players[0]);assert.equal(leagueCandidate(g,1),null);assert.equal(leagueCandidate(g,0),null);assert.equal(leagueCandidate(g,6),null);
});
test('seller budget ceilings cannot cause overflow',()=>{
  const g=ready(),q=leagueCandidate(g,1);recordClubBudget(g,q.seller,MAX_CLUB_BUDGET-clubBudget(g,q.seller),'Synthetic ceiling');assert.notEqual(leagueCandidate(g,1)?.seller,q.seller);
  settleLeagueMarket(g,1);assert.ok(g.clubMarket.clubs.every(c=>c.balance>=0&&c.balance<=MAX_CLUB_BUDGET));check(g);
});
test('the history cap archives old volume while retaining complete totals across eight seasons',()=>{
  const g=newGame(),all=[];
  for(let n=0;n<80;n++){
    next(g);const entry=g.leagueMarket.history.at(-1);if(entry?.season===g.season&&entry.round===g.round)all.push(structuredClone(entry));
    if(g.round===10)newSeason(g);
  }
  assert.ok(all.length>50);assert.equal(g.leagueMarket.nextId-1,all.length);assert.deepEqual(g.leagueMarket.history,all.slice(-50));
  assert.equal(g.leagueMarket.totalVolume,all.reduce((n,t)=>n+t.price,0));assert.equal(g.leagueMarket.archivedVolume,all.slice(0,-50).reduce((n,t)=>n+t.price,0));check(g);
});
test('a player moves at most once per season and every club retains a viable selection',()=>{
  const g=newGame(),own=g.clubs[0].players.map(p=>p.id);
  for(let day=0;day<10;day++){
    next(g);assert.ok(g.leagueMarket.history.length<=day+1);
    const ids=g.leagueMarket.history.map(t=>t.playerId);assert.equal(new Set(ids).size,ids.length);
    assert.deepEqual(g.clubs[0].players.map(p=>p.id),own);assert.ok(g.clubs.every(c=>c.players.length>=18&&c.players.length<=55&&c.players.filter(p=>p.position==='GK').length>=2));
    check(g);
  }
  assert.ok(g.leagueMarket.history.length>1);const before=structuredClone(g.leagueMarket);newSeason(g);assert.deepEqual(g.leagueMarket,before);check(g);
});
test('journal history and totals survive roster replacement without replaying transfers',()=>{
  const g=newGame();next(g);delete g.rosterVersion;const before=structuredClone(g),updated=updateClubRosters(g);assert.deepEqual(g,before);
  assert.deepEqual(updated.leagueMarket,g.leagueMarket);assert.deepEqual(updated.clubMarket.clubs,g.clubMarket.clubs);
  const same=structuredClone(updated);assert.equal(settleLeagueMarket(updated,1),null);assert.deepEqual(updated,same);check(updated);
});
test('invalid journal IDs, prices, totals, timing, club references and pending rules are rejected',()=>{
  const base=newGame();next(base);check(base);
  for(const change of [g=>g.leagueMarket=null,g=>g.leagueMarket.schema=2,g=>g.leagueMarket.sinceRound=2,g=>g.leagueMarket.lastRound=2,g=>g.leagueMarket.nextId++,g=>g.leagueMarket.totalVolume++,g=>g.leagueMarket.archivedVolume++,g=>g.leagueMarket.history[0].id=0,g=>g.leagueMarket.history[0].price++,g=>g.leagueMarket.history[0].buyer=0,g=>g.leagueMarket.history[0].seller=g.leagueMarket.history[0].buyer,g=>g.leagueMarket.history[0].sellerName='Other',g=>g.leagueMarket.history[0].round=0,g=>g.leagueMarket.history[0].season=2,g=>g.leagueMarket.history[0].playerId='invalid',g=>g.leagueMarket.history[0].reason='magic',g=>g.leagueMarket.history.push(g.leagueMarket.history[0])]){
    const g=structuredClone(base);change(g);assert.throws(()=>parseBackup(exportBackup(g)));
  }
  beginMatch(base);base.pending.leagueMarketRules=2;assert.throws(()=>parseBackup(exportBackup(base)));
});
