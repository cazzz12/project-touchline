import test from 'node:test';
import assert from 'node:assert/strict';
import {newGame,beginMatch,advanceMatch,playRound,newSeason,updateClubRosters} from '../public/game.js';
import {recordCash} from '../public/management.js';
import {clubTransferQuote,submitClubBid,cancelClubBid,confirmClubPurchase,releaseReason} from '../public/transfers.js';
import {openOffer} from '../public/transfer-state.js';
import {applyRecommendedSquad} from '../public/fitness.js';
import {exportBackup,parseBackup} from '../public/storage.js';

function funded(){const g=newGame();recordCash(g,3000000,'test','Synthetic transfer budget');return g;}
function target(g,seller=1){return g.clubs[seller].players.find(p=>p.position!=='GK'&&!releaseReason(g,seller,p.id));}
function bid(g,{seller=1,ratio=1,player=target(g,seller)}={}){const q=clubTransferQuote(g,seller,player.id);return submitClubBid(g,seller,player.id,Math.floor(q.asking*ratio));}

test('older saves gain an empty transfer desk without changing money, results or a live match',()=>{
  const g=newGame();beginMatch(g);g.pending.paused=false;advanceMatch(g);g.pending.paused=true;delete g.transferDesk;
  const original=structuredClone(g),r=parseBackup(JSON.stringify(g));assert.deepEqual(g,original);
  assert.deepEqual(r.transferDesk,{schema:1,nextId:1,offers:[]});delete r.transferDesk;assert.deepEqual(r,original);
});
test('quotes are pure and low bids get a reproducible rejection without moving money or players',()=>{
  const g=funded(),p=target(g),before=structuredClone(g),q=clubTransferQuote(g,1,p.id);
  assert.ok(q.asking>0);assert.equal(q.untilSeason,g.season+2);assert.deepEqual(g,before);
  const o=bid(g,{ratio:.4});assert.equal(o.status,'rejected');assert.equal(o.price,0);
  assert.equal(g.credits,before.credits);assert.deepEqual(g.clubs,before.clubs);
  const r=parseBackup(exportBackup(g));assert.equal(bid(r,{ratio:.4}).status,'rejected');assert.equal(confirmClubPurchase(g,o.id),false);
});
test('counteroffers survive reload and confirmation moves one identity and books one exact payment',()=>{
  const original=funded(),p=target(original),lineup=[...original.lineupIds],bank=[...original.benchIds],cash=original.credits;
  const offer=bid(original,{ratio:.75});assert.equal(offer.status,'counter');assert.equal(original.credits,cash);
  const g=parseBackup(exportBackup(original));assert.equal(confirmClubPurchase(g,offer.id),true);
  assert.equal(g.credits,cash-offer.price);assert.equal(g.management.ledger.at(-1).amount,-offer.price);
  assert.equal(g.clubs[1].players.some(v=>v.id===p.id),false);assert.equal(g.clubs.flatMap(c=>c.players).filter(v=>v.id===p.id).length,1);
  const moved=g.clubs[0].players.find(v=>v.id===p.id),expected={...p};delete expected.number;assert.deepEqual(moved,expected);
  assert.deepEqual(g.lineupIds,lineup);assert.deepEqual(g.benchIds,bank);
  assert.deepEqual(g.management.contracts[p.id],{salary:offer.salary,untilSeason:offer.untilSeason});
  const completed=structuredClone(g);assert.equal(confirmClubPurchase(g,offer.id),false);assert.deepEqual(g,completed);
  assert.deepEqual(parseBackup(exportBackup(g)),g);
});
test('an accepted bid still needs confirmation and pays the submitted amount, including an overbid',()=>{
  const g=funded(),cash=g.credits,o=bid(g,{ratio:1.1});assert.equal(o.status,'accepted');assert.equal(o.price,o.amount);assert.equal(g.credits,cash);
  assert.equal(confirmClubPurchase(g,o.id),true);assert.equal(g.credits,cash-o.amount);
});
test('withdrawing and replacing bids preserves cash and prevents accepting obsolete offers',()=>{
  const g=funded(),cash=g.credits,first=bid(g,{ratio:.75}),second=bid(g,{ratio:.95});
  assert.equal(first.status,'superseded');assert.equal(confirmClubPurchase(g,first.id),false);
  assert.equal(cancelClubBid(g,second.id),true);assert.equal(cancelClubBid(g,second.id),false);assert.equal(confirmClubPurchase(g,second.id),false);
  assert.equal(g.credits,cash);assert.deepEqual(parseBackup(exportBackup(g)),g);
});
test('selling clubs retain eighteen players, two keepers and sufficient fit and available replacements',()=>{
  const g=funded(),c=g.clubs[1],p=target(g);
  const original=[...c.players];c.players=c.players.slice(0,18);assert.ok(releaseReason(g,1,c.players.find(p=>p.position!=='GK').id));c.players=original;
  const keepers=c.players.filter(p=>p.position==='GK');c.players=c.players.filter(p=>p.position!=='GK'||keepers.slice(0,2).includes(p));
  assert.match(releaseReason(g,1,keepers[0].id),/twee keepers/);c.players=original;
  const others=c.players.filter(v=>v.id!==p.id&&v.position!=='GK');
  for(const v of others.slice(0,c.players.length-18))g.medical.injuries[v.id]={kind:'knock',remaining:1,season:1,round:1};
  assert.match(releaseReason(g,1,p.id),/fitte vervangers/);
  g.medical.injuries={};for(const v of others.slice(0,c.players.length-18))g.discipline.suspensions[v.id]={reason:'red',remaining:2,season:1,round:1};
  assert.match(releaseReason(g,1,p.id),/inzetbare vervangers/);assert.equal(bid(g,{player:p}),null);
});
test('confirmation rechecks credits, club availability and match lock without partial transfers',()=>{
  const g=funded(),o=bid(g),p=g.clubs[1].players.find(p=>p.id===o.playerId);
  recordCash(g,-g.credits,'test','Spend test budget');let before=structuredClone(g);assert.equal(confirmClubPurchase(g,o.id),false);assert.deepEqual(g,before);
  recordCash(g,o.price,'test','Restore test budget');const others=g.clubs[1].players.filter(v=>v.id!==p.id);
  g.clubs[1].players=[p,...others.slice(0,17)];before=structuredClone(g);assert.equal(confirmClubPurchase(g,o.id),false);assert.deepEqual(g,before);
  g.clubs[1].players=[p,...others];beginMatch(g);assert.equal(o.status,'expired');before=structuredClone(g);
  assert.equal(confirmClubPurchase(g,o.id),false);assert.equal(bid(g),null);assert.equal(cancelClubBid(g,o.id),false);assert.deepEqual(g,before);
});
test('invalid amounts and own-club offers never mutate the career',()=>{
  const g=funded(),p=target(g),before=structuredClone(g);
  for(const amount of [0,-1,NaN,Infinity,1.5,1e9+1,g.credits+1])assert.equal(submitClubBid(g,1,p.id,amount),null);
  for(const seller of [0,-1,6,1.5,NaN])assert.equal(submitClubBid(g,seller,p.id,1000),null);
  assert.equal(submitClubBid(g,1,'missing-player',1000),null);assert.deepEqual(g,before);
});
test('the five open offer cap and bounded history survive repeated bids and reload',()=>{
  const g=funded(),players=g.clubs[1].players.filter(p=>!releaseReason(g,1,p.id));
  for(const p of players.slice(0,5))assert.ok(bid(g,{player:p}));assert.equal(bid(g,{player:players[5]}),null);
  for(let i=0;i<60;i++)assert.ok(bid(g,{player:players[0],ratio:i%2?.75:1}));
  assert.equal(g.transferDesk.offers.filter(openOffer).length,5);assert.equal(g.transferDesk.offers.length,25);
  assert.deepEqual(parseBackup(exportBackup(g)),g);
});
test('only successful kickoff expires offers; season and explicit roster updates also close them',()=>{
  const g=funded(),o=bid(g);g.management.contracts[g.lineupIds[0]].untilSeason=0;
  assert.equal(beginMatch(g),null);assert.equal(o.status,'accepted');g.management.contracts[g.lineupIds[0]].untilSeason=3;
  beginMatch(g);assert.equal(o.status,'expired');assert.ok(parseBackup(exportBackup(g)).pending);
  const season=funded();for(let i=0;i<10;i++){applyRecommendedSquad(season);playRound(season);}const last=bid(season);assert.ok(last);newSeason(season);assert.equal(last.status,'expired');
  const old=funded();delete old.rosterVersion;const previous=bid(old);const updated=updateClubRosters(old);
  assert.equal(previous.status,'accepted');assert.equal(updated.transferDesk.offers[0].status,'expired');assert.ok(parseBackup(exportBackup(updated)));
});
test('injury, suspension and career history follow the player into the buying club',()=>{
  const g=funded();playRound(g);g.reportOpen=false;const p=target(g),history=structuredClone(g.management.playerStats[p.id]);
  g.medical.injuries[p.id]={kind:'muscle',remaining:2,season:1,round:1};g.discipline.suspensions[p.id]={remaining:2,reason:'red',season:1,round:1};
  const o=bid(g,{player:p});assert.ok(o);assert.equal(confirmClubPurchase(g,o.id),true);
  assert.equal(g.medical.injuries[p.id].remaining,2);assert.equal(g.discipline.suspensions[p.id].remaining,2);assert.deepEqual(g.management.playerStats[p.id],history);
  applyRecommendedSquad(g);assert.ok(![...g.lineupIds,...g.benchIds].includes(p.id));assert.ok(parseBackup(exportBackup(g)));
});
test('malformed negotiation saves reject inconsistent amounts, ownership, timing and duplicate IDs',()=>{
  const g=funded();bid(g,{ratio:.75});
  const changes=[d=>d.schema=9,d=>d.nextId=1,d=>d.offers[0].price=1,d=>d.offers[0].seller=0,d=>d.offers[0].playerId=g.lineupIds[0],d=>d.offers[0].season=2,d=>d.offers[0].salary=-1,d=>d.offers[0].untilSeason=100,d=>d.offers[0].status='paid',d=>d.offers.push({...d.offers[0]})];
  for(const change of changes){const bad=structuredClone(g);change(bad.transferDesk);assert.throws(()=>parseBackup(JSON.stringify(bad)),/geldige/);}
  assert.equal(g.transferDesk.offers[0].status,'counter');
});
