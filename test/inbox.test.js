import test from 'node:test';
import assert from 'node:assert/strict';
import {newGame,beginMatch,advanceMatch,playRound,newSeason} from '../public/game.js';
import {ensureInbox,inboxMessages,visibleInbox,markInboxRead,validInbox,INBOX_READ_LIMIT} from '../public/inbox.js';
import {inboxView} from '../public/inbox-views.js';
import {chooseSponsor,renewContract,developPlayer} from '../public/management.js';
import {applyRecommendedSquad} from '../public/fitness.js';
import {rejectIncomingOffer} from '../public/club-market.js';
import {clubTransferQuote,submitClubBid,cancelClubBid} from '../public/transfers.js';
import {setDevelopmentPlan} from '../public/development.js';
import {parseBackup,exportBackup} from '../public/storage.js';
const check=g=>assert.deepEqual(parseBackup(exportBackup(g)),g);
const byPrefix=(g,prefix)=>inboxMessages(g).filter(m=>m.key.startsWith(prefix+':'));
function injuries(g){g.round=1;for(const p of [g.clubs[0].players.find(p=>g.lineupIds.includes(p.id)),g.clubs[0].players.find(p=>!g.lineupIds.includes(p.id)&&!g.benchIds.includes(p.id))])g.medical.injuries[p.id]={kind:'ankle',remaining:3,season:1,round:1};}

test('old careers gain empty read markers while all money, players and pending minutes survive',()=>{
  for(const live of [false,true]){
    const g=newGame();if(live){beginMatch(g);for(let i=0;i<17;i++){g.pending.paused=false;advanceMatch(g);}g.pending.paused=true;}
    delete g.inbox;const before=structuredClone(g),restored=parseBackup(exportBackup(g));assert.deepEqual(restored.inbox,{schema:1,read:[]});
    const once=structuredClone(restored);ensureInbox(restored);assert.deepEqual(restored,once);delete restored.inbox;assert.deepEqual(restored,before);assert.deepEqual(g,before);
  }
});
test('projecting and filtering manager messages has no side effects or invented historical news',()=>{
  const g=newGame(),before=structuredClone(g),items=inboxMessages(g);assert.equal(items.length,1);assert.match(items[0].key,/^sponsor:/);
  for(let i=0;i<3;i++){assert.deepEqual(inboxMessages(g),items);visibleInbox(items,{status:'unread',category:'club'});inboxView(g,{status:'all',category:'all'});}assert.deepEqual(g,before);
  chooseSponsor(g,'steady');assert.deepEqual(inboxMessages(g),[]);check(g);
});
test('injuries and bans group only own players and keep urgent issues visible after reading',()=>{
  const g=newGame();injuries(g);const other=g.clubs[1].players[0];g.medical.injuries[other.id]={kind:'ankle',remaining:3,season:1,round:1};
  const ban=g.lineupIds.find(id=>!g.medical.injuries[id]);g.discipline.suspensions[ban]={reason:'red',remaining:2,season:1,round:1};
  const before=structuredClone(g),items=inboxMessages(g),injury=byPrefix(g,'injuries')[0];assert.equal(injury.details.length,2);assert.equal(injury.priority,0);assert.ok(!injury.details.some(d=>d.startsWith(other.name+' ·')));assert.equal(items[0].priority,0);assert.deepEqual(g,before);
  assert.equal(markInboxRead(g,[injury.key]),true);assert.equal(byPrefix(g,'injuries')[0].read,true);assert.equal(byPrefix(g,'injuries')[0].priority,0);check(g);
});
test('changed availability becomes new, resolved injuries disappear and source order is immaterial',()=>{
  const g=newGame();injuries(g);const key=byPrefix(g,'injuries')[0].key;markInboxRead(g,[key]);g.clubs[0].players.reverse();assert.equal(byPrefix(g,'injuries')[0].key,key);
  const id=Object.keys(g.medical.injuries)[0];g.medical.injuries[id].remaining--;const updated=byPrefix(g,'injuries')[0];assert.notEqual(updated.key,key);assert.equal(updated.read,false);
  g.medical.injuries={};assert.equal(byPrefix(g,'injuries').length,0);const before=structuredClone(g);assert.equal(markInboxRead(g,[key]),false);assert.deepEqual(g,before);
});
test('contract groups distinguish expired and soon-expiring contracts and refresh after renewal',()=>{
  const g=newGame();for(let i=0;i<10;i++){applyRecommendedSquad(g);playRound(g);}newSeason(g);
  const p=g.clubs[0].players.find(p=>g.lineupIds.includes(p.id));g.management.contracts[p.id].untilSeason=1;
  const items=byPrefix(g,'contracts'),expired=items.find(m=>m.key.startsWith('contracts:expired:')),soon=items.find(m=>m.key.startsWith('contracts:expiring:'));
  assert.equal(expired.priority,0);assert.equal(expired.details.length,1);assert.equal(soon.details.length,g.clubs[0].players.length-1);
  const cash=g.credits;markInboxRead(g,items.map(m=>m.key));assert.equal(g.credits,cash);assert.equal(g.management.contracts[p.id].untilSeason,1);
  renewContract(g,p.id);assert.equal(byPrefix(g,'contracts').some(m=>m.key===expired.key),false);check(g);
});
test('only current open bids appear and reading never buys, sells, rejects or changes a budget',()=>{
  const g=newGame();playRound(g);const incoming=byPrefix(g,'incoming');assert.equal(incoming.length,g.clubMarket.offers.filter(o=>o.status==='open').length);assert.ok(incoming.length);
  const q=g.clubs.slice(1).flatMap((c,i)=>c.players.map(p=>clubTransferQuote(g,i+1,p.id))).find(q=>!q.reason&&q.asking*.7<g.credits);
  const offer=submitClubBid(g,q.seller,q.player.id,Math.floor(q.asking*.7));assert.equal(offer.status,'counter');
  const before=structuredClone(g),items=inboxMessages(g).filter(m=>m.category==='transfers');assert.equal(items.length,incoming.length+1);
  markInboxRead(g,items.map(m=>m.key));const after=structuredClone(g);delete after.inbox;delete before.inbox;assert.deepEqual(after,before);
  assert.equal(byPrefix(g,'outgoing')[0].action.seller,q.seller);cancelClubBid(g,offer.id);rejectIncomingOffer(g,g.clubMarket.offers.find(o=>o.status==='open').id);
  assert.equal(byPrefix(g,'outgoing').length,0);assert.equal(byPrefix(g,'incoming').length,incoming.length-1);check(g);
  applyRecommendedSquad(g);beginMatch(g);assert.equal(inboxMessages(g).some(m=>m.category==='transfers'),false);
});
test('live-match messages preserve clock, team and tactics while marking read and resuming a backup',()=>{
  const g=newGame();beginMatch(g);const item=byPrefix(g,'match')[0],before=structuredClone(g);assert.equal(item.action.match,true);markInboxRead(g,[item.key]);
  const changed=structuredClone(g);delete changed.inbox;delete before.inbox;assert.deepEqual(changed,before);check(g);
  g.pending.paused=false;advanceMatch(g);assert.equal(byPrefix(g,'match')[0].read,true);assert.match(byPrefix(g,'match')[0].text,/minuut 1/);
});
test('finished training goals, cash warnings and season notices follow actual state',()=>{
  const g=newGame(),p=g.clubs[0].players.find(p=>p.passing<98);setDevelopmentPlan(g,p.id,'passing',p.passing+1);assert.equal(byPrefix(g,'development').length,0);
  developPlayer(g,p.id,'passing');const done=byPrefix(g,'development')[0];assert.equal(done.action.playerId,p.id);assert.equal(done.priority,2);markInboxRead(g,[done.key]);check(g);
  g.credits=-15;assert.equal(byPrefix(g,'finance')[0].priority,0);g.credits=0;assert.equal(byPrefix(g,'finance').length,0);
  g.round=10;assert.equal(byPrefix(g,'sponsor').length,0);assert.equal(byPrefix(g,'season')[0].action.tab,'overview');
});
test('read filters operate only on current keys and invalid batches are rejected atomically',()=>{
  const g=newGame();injuries(g);const all=inboxMessages(g),selection=visibleInbox(all,{category:'selection',status:'all'});
  markInboxRead(g,selection.map(m=>m.key));assert.equal(visibleInbox(inboxMessages(g),{category:'selection',status:'unread'}).length,0);assert.equal(byPrefix(g,'sponsor')[0].read,false);
  const valid=all[0].key;for(const [keys,read] of [[[valid,'sponsor:999'],true],[[valid,valid],true],[[],true],[[valid],'true'],[null,true]]){const before=structuredClone(g);assert.equal(markInboxRead(g,keys,read),false);assert.deepEqual(g,before);}
  markInboxRead(g,selection.map(m=>m.key),false);assert.equal(visibleInbox(inboxMessages(g),{category:'selection',status:'unread'}).length,selection.length);check(g);
});
test('read markers survive backups and stale keys are pruned without growing storage',()=>{
  const g=newGame(),key=inboxMessages(g)[0].key;g.inbox.read=Array.from({length:INBOX_READ_LIMIT},(_,i)=>`sponsor:${i+100}`);check(g);
  markInboxRead(g,[key]);assert.deepEqual(g.inbox.read,[key]);assert.equal(inboxMessages(parseBackup(exportBackup(g)))[0].read,true);
  assert.equal(markInboxRead(g,[key]),true);assert.deepEqual(g.inbox.read,[key]);
});
test('invalid imported markers are rejected and messages escape player-provided text',()=>{
  const g=newGame();for(const inbox of [null,[],{schema:2,read:[]},{schema:1,read:'all'},{schema:1,read:[1]},{schema:1,read:['sponsor:1','sponsor:1']},{schema:1,read:['<script>']},{schema:1,read:Array.from({length:129},(_,i)=>`sponsor:${i}`)}]){
    assert.equal(validInbox(inbox),false);const copy=structuredClone(g);copy.inbox=inbox;assert.throws(()=>parseBackup(exportBackup(copy)));
  }
  injuries(g);g.clubs[0].players.find(p=>g.medical.injuries[p.id]).name='<img src=x onerror=alert(1)>';
  const html=inboxView(g,{category:'all',status:'all'});assert.ok(!html.includes('<img src=x'));assert.match(html,/&lt;img src=x/);
});
