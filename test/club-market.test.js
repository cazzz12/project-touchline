import test from 'node:test';
import assert from 'node:assert/strict';
import {newGame,beginMatch,advanceMatch,finishMatch,playRound,newSeason,acceptIncomingOffer,sellPlayer,setStarter,updateClubRosters} from '../public/game.js';
import {settleClubMarket,rejectIncomingOffer,incomingSaleReason} from '../public/club-market.js';
import {clubBudget,recordClubBudget,START_BUDGET,ROUND_ALLOWANCE} from '../public/club-market-state.js';
import {recordCash,saleOffer,payroll,renewExpiring} from '../public/management.js';
import {clubTransferQuote,submitClubBid,confirmClubPurchase,releaseReason} from '../public/transfers.js';
import {applyRecommendedSquad} from '../public/fitness.js';
import {parseBackup,exportBackup} from '../public/storage.js';
const next=g=>{applyRecommendedSquad(g);assert.ok(playRound(g));};
function round(){const g=newGame();next(g);return g;}
function check(g){assert.deepEqual(parseBackup(exportBackup(g)),g);for(const a of g.clubMarket.clubs)assert.equal(a.opening+a.ledger.reduce((n,e)=>n+e.amount,0),a.balance);}

test('v0.9 saves migrate with empty inbox and no retroactive changes to an active career',()=>{
  const g=newGame();beginMatch(g);g.pending.paused=false;advanceMatch(g);g.pending.paused=true;delete g.clubMarket;
  const before=structuredClone(g),loaded=parseBackup(JSON.stringify(g));
  assert.deepEqual(g,before);assert.equal(loaded.clubMarket.lastRound,0);assert.equal(loaded.clubMarket.offers.length,0);
  assert.ok(loaded.clubMarket.clubs.every(a=>a.balance===START_BUDGET&&a.ledger.length===0));delete loaded.clubMarket;assert.deepEqual(loaded,before);
  const late=round();delete late.clubMarket;const migrated=parseBackup(JSON.stringify(late)),snapshot=structuredClone(migrated);
  assert.equal(settleClubMarket(migrated),0);assert.deepEqual(migrated,snapshot);
});
test('only completed rounds grant allowances and reproducible affordable distinct incoming bids once',()=>{
  const g=newGame(),before=structuredClone(g);assert.equal(settleClubMarket(g),0);assert.deepEqual(g,before);
  beginMatch(g);g.pending.paused=false;advanceMatch(g);assert.equal(settleClubMarket(g),0);
  while(g.pending){g.pending.paused=false;advanceMatch(g);}
  const reference=round();assert.deepEqual(g.clubMarket,reference.clubMarket);
  assert.equal(g.clubMarket.offers.length,3);assert.equal(new Set(g.clubMarket.offers.map(o=>o.playerId)).size,3);
  for(const o of g.clubMarket.offers){assert.ok(o.price<=clubBudget(g,o.buyer));assert.equal(incomingSaleReason(g,o),'');}
  assert.equal(g.clubMarket.clubs.reduce((sum,a)=>sum+a.balance,0),5*(START_BUDGET+ROUND_ALLOWANCE));
  for(const [index,a] of g.clubMarket.clubs.entries()){
    const moved=g.leagueMarket.history.reduce((n,t)=>n+(t.seller===index+1?t.price:0)-(t.buyer===index+1?t.price:0),0);
    assert.equal(a.balance,START_BUDGET+ROUND_ALLOWANCE+moved);assert.equal(a.ledger.filter(e=>e.label==='Transferbijdrage na speeldag').length,1);
  }
  const complete=structuredClone(g);assert.equal(settleClubMarket(g),0);assert.equal(finishMatch(g),null);assert.deepEqual(g,complete);check(g);
});
test('accepting an incoming bid after reload moves one identity and exactly balances both clubs',()=>{
  const g=parseBackup(exportBackup(round())),o=g.clubMarket.offers[0],p=g.clubs[0].players.find(p=>p.id===o.playerId);
  const cash=g.credits,budget=clubBudget(g,o.buyer),wages=payroll(g),salary=g.management.contracts[p.id].salary,stats=structuredClone(g.management.playerStats[p.id]);
  if(!g.lineupIds.includes(p.id))assert.equal(setStarter(g,0,p.id),true);
  g.captainId=p.id;
  assert.ok(g.lineupIds.includes(p.id));assert.equal(acceptIncomingOffer(g,o.id),true);
  assert.equal(o.status,'completed');assert.equal(g.credits,cash+o.price);assert.equal(clubBudget(g,o.buyer),budget-o.price);
  assert.equal(payroll(g),wages-salary);assert.equal(g.management.contracts[p.id],undefined);
  assert.equal(g.management.ledger.at(-1).amount,o.price);assert.equal(g.clubMarket.clubs[o.buyer-1].ledger.at(-1).amount,-o.price);
  assert.equal(g.clubs.flatMap(c=>c.players).filter(v=>v.id===p.id).length,1);
  const moved={...p};delete moved.number;assert.deepEqual(g.clubs[o.buyer].players.find(v=>v.id===p.id),moved);
  assert.ok(![...g.lineupIds,...g.benchIds].includes(p.id));assert.ok(g.lineupIds.includes(g.captainId));assert.deepEqual(g.management.playerStats[p.id],stats);
  const done=structuredClone(g);assert.equal(acceptIncomingOffer(g,o.id),false);assert.deepEqual(g,done);check(g);
});
test('rejecting a bid changes no players or finances and cannot be rerolled by reload',()=>{
  const g=round(),before=structuredClone(g),o=g.clubMarket.offers[0];assert.equal(rejectIncomingOffer(g,o.id),true);
  assert.equal(acceptIncomingOffer(g,o.id),false);assert.equal(rejectIncomingOffer(g,o.id),false);
  assert.deepEqual(g.clubs,before.clubs);assert.deepEqual(g.management,before.management);assert.deepEqual(g.clubMarket.clubs,before.clubMarket.clubs);
  const reloaded=parseBackup(exportBackup(g));assert.equal(settleClubMarket(reloaded),0);assert.deepEqual(reloaded,g);
});
test('sale confirmation rechecks the buyer budget and capacity without partial payments',()=>{
  const g=round(),o=g.clubMarket.offers[0],balance=clubBudget(g,o.buyer);
  recordClubBudget(g,o.buyer,-balance,'Synthetic budget spent');let before=structuredClone(g);
  assert.match(incomingSaleReason(g,o),/budget/);assert.equal(acceptIncomingOffer(g,o.id),false);assert.deepEqual(g,before);
  recordClubBudget(g,o.buyer,balance,'Synthetic budget restored');const buyer=g.clubs[o.buyer],players=buyer.players;
  buyer.players=Array(55).fill(players[0]);before=structuredClone(g);assert.equal(acceptIncomingOffer(g,o.id),false);assert.deepEqual(g,before);buyer.players=players;
  assert.equal(acceptIncomingOffer(g,999),false);check(g);
});
test('selling cannot leave too few players, healthy reserves or keepers',()=>{
  const g=round(),players=g.clubs[0].players,p=players.find(p=>p.position==='GK'),buyer=[1,2,3,4,5].find(i=>saleOffer(g,p.id,i)),otherKeeper=players.find(v=>v.position==='GK'&&v.id!==p.id);
  assert.ok(buyer,'the keeper was sellable before removing reserves');
  g.clubs[0].players=players.filter(v=>v.position!=='GK'||[p.id,otherKeeper.id].includes(v.id));let before=structuredClone(g);
  assert.equal(sellPlayer(g,p.id,buyer),false);assert.deepEqual(g,before);g.clubs[0].players=players;
  const out=g.clubMarket.offers.find(v=>v.role!=='GK'),others=players.filter(p=>p.id!==out.playerId&&p.position!=='GK');
  for(const p of others.slice(0,players.length-18))g.medical.injuries[p.id]={kind:'knock',remaining:1,season:1,round:1};
  before=structuredClone(g);assert.match(incomingSaleReason(g,out),/fitte/);assert.equal(acceptIncomingOffer(g,out.id),false);assert.deepEqual(g,before);
});
test('incoming bids expire only at successful kickoff, new season or explicit roster replacement',()=>{
  const g=round(),o=g.clubMarket.offers[0];applyRecommendedSquad(g);const contract=g.management.contracts[g.lineupIds[0]];
  contract.untilSeason=0;assert.equal(beginMatch(g),null);assert.equal(o.status,'open');contract.untilSeason=3;
  beginMatch(g);assert.equal(o.status,'expired');const before=structuredClone(g);assert.equal(acceptIncomingOffer(g,o.id),false);assert.equal(rejectIncomingOffer(g,o.id),false);assert.deepEqual(g,before);check(g);
  const end=round();for(let i=1;i<10;i++)next(end);const budgets=end.clubMarket.clubs.map(a=>a.balance);assert.ok(newSeason(end));assert.ok(end.clubMarket.offers.every(o=>o.status!=='open'));assert.deepEqual(end.clubMarket.clubs.map(a=>a.balance),budgets);check(end);
  const old=round();delete old.rosterVersion;const updated=updateClubRosters(old);assert.ok(old.clubMarket.offers.some(o=>o.status==='open'));assert.ok(updated.clubMarket.offers.every(o=>o.status==='expired'));assert.deepEqual(updated.clubMarket.clubs,old.clubMarket.clubs);check(updated);
});
test('direct sales and club purchases use the same budgets and obsolete received bids close',()=>{
  const g=round(),o=g.clubMarket.offers[0],cash=g.credits,budget=clubBudget(g,o.buyer),quote=saleOffer(g,o.playerId,o.buyer);
  assert.equal(sellPlayer(g,o.playerId,o.buyer),true);assert.equal(o.status,'unavailable');assert.equal(g.credits,cash+quote.price);assert.equal(clubBudget(g,o.buyer),budget-quote.price);assert.equal(acceptIncomingOffer(g,o.id),false);
  recordCash(g,1000000,'test','Synthetic purchase budget');
  const q=clubTransferQuote(g,o.buyer,o.playerId);assert.ok(q&&!q.reason);const bid=submitClubBid(g,o.buyer,o.playerId,q.asking),available=clubBudget(g,o.buyer),own=g.credits;
  assert.equal(confirmClubPurchase(g,bid.id),true);assert.equal(clubBudget(g,o.buyer),available+bid.price);assert.equal(g.credits,own-bid.price);
  const done=structuredClone(g);assert.equal(confirmClubPurchase(g,bid.id),false);assert.deepEqual(g,done);check(g);
});
test('injuries, suspensions and player statistics persist through an incoming sale',()=>{
  const g=round(),o=g.clubMarket.offers.find(o=>o.role!=='GK'),history=structuredClone(g.management.playerStats[o.playerId]);
  g.medical.injuries[o.playerId]={kind:'knock',remaining:1,season:1,round:1};g.discipline.suspensions[o.playerId]={reason:'red',remaining:2,season:1,round:1};
  assert.equal(acceptIncomingOffer(g,o.id),true);assert.equal(g.medical.injuries[o.playerId].remaining,1);assert.equal(g.discipline.suspensions[o.playerId].remaining,2);assert.deepEqual(g.management.playerStats[o.playerId],history);check(g);
});
test('clubs cannot buy through direct sales when their remaining budget is insufficient',()=>{
  const g=newGame(),p=g.clubs[0].players.find(p=>saleOffer(g,p.id,1));assert.ok(p);recordClubBudget(g,1,-clubBudget(g,1),'Synthetic budget spent');
  const before=structuredClone(g);assert.equal(saleOffer(g,p.id,1),null);assert.equal(sellPlayer(g,p.id,1),false);assert.deepEqual(g,before);check(g);
});
test('budget ledgers and incoming history remain bounded across seasons',()=>{
  const g=newGame();for(let i=0;i<110;i++)recordClubBudget(g,1,1,'Synthetic contribution');
  assert.equal(g.clubMarket.clubs[0].ledger.length,100);assert.equal(clubBudget(g,1),START_BUDGET+110);
  for(let season=0;season<3;season++){renewExpiring(g);for(let day=0;day<10;day++)next(g);newSeason(g);}
  assert.equal(g.clubMarket.offers.length,25);assert.ok(g.clubMarket.offers.every(o=>o.status!=='open'));check(g);
});
test('malformed budgets and received bids are rejected without overwriting data',()=>{
  const good=round();const mutations=[m=>m.schema=2,m=>m.clubs[0].balance=-1,m=>m.clubs[0].balance++,m=>m.clubs[0].ledger[0].balance++,m=>m.clubs[0].nextEntry=1,m=>m.clubs[0].name='Other',m=>m.clubs.pop(),m=>m.lastRound=2,m=>m.nextId=1,m=>m.offers[0].buyer=0,m=>m.offers[0].playerId='unknown',m=>m.offers[0].price++,m=>m.offers[0].season=2,m=>m.offers[0].round=0,m=>m.offers[0].status='paid',m=>m.offers.push({...m.offers[0]})];
  for(const mutate of mutations){const g=structuredClone(good);mutate(g.clubMarket);assert.throws(()=>parseBackup(JSON.stringify(g)),/geldige/);}check(good);
});
