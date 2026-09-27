import test from 'node:test';
import assert from 'node:assert/strict';
import {newGame,beginMatch,advanceMatch,finishMatch,playRound,newSeason,standings,updateClubRosters,sellPlayer} from '../public/game.js';
import {ensureReputation,settleReputation,closeReputationSeason,reputationLevel,seasonPoints,resultPoints} from '../public/reputation.js';
import {chooseSponsor,matchBudget,renewExpiring,upgradeClub,saleOffer} from '../public/management.js';
import {applyRecommendedSquad} from '../public/fitness.js';
import {parseBackup,exportBackup} from '../public/storage.js';

const check=g=>assert.deepEqual(parseBackup(exportBackup(g)).reputation,g.reputation);
function play(g){renewExpiring(g);applyRecommendedSquad(g);return playRound(g);}
function advance(g,n){while(g.pending&&g.pending.minute<n){g.pending.paused=false;advanceMatch(g);}}
// Focused model fixture: explicit completed results, without simulating finances.
function earn(g,kind='win'){
  const p=g.pending={reputationRules:1,minute:90},match={home:0,away:1,round:g.round+1,goals:kind==='win'?[2,0]:kind==='draw'?[1,1]:[0,2],...(kind==='forfeit'?{forfeit:[0]}:{})};
  const report=settleReputation(g,match,p);assert.equal(settleReputation(g,match,p),null);
  g.pending=null;g.results.push(match);g.round++;return report;
}
function winningSeason(g){for(let i=g.round;i<10;i++)earn(g);assert.equal(newSeason(g),true);}

test('reputation migration adds zero progress without changing the existing career or live match',()=>{
  const g=newGame();play(g);beginMatch(g);advance(g,21);g.pending.paused=true;
  delete g.reputation;delete g.lastMatch.reputationReport;delete g.pending.reputationRules;
  const before=structuredClone(g),restored=parseBackup(exportBackup(g));
  assert.equal(restored.reputation.points,0);assert.equal(restored.reputation.sinceRound,1);assert.deepEqual(restored.reputation.history,[]);
  delete restored.reputation;assert.deepEqual(restored,before);
  ensureReputation(g);const once=structuredClone(g);ensureReputation(g);assert.deepEqual(g,once);
});

test('v2 migration starts measuring reputation at the retained round, not at the start of the season',()=>{
  const old={version:2,clubs:[],credits:99999,round:4,results:[],points:0,color:'#c5ff70'};
  const g=parseBackup(JSON.stringify(old));assert.equal(g.reputation.sinceRound,4);assert.equal(g.reputation.lastRound,4);assert.equal(g.reputation.points,0);assert.equal(g.credits,99999);
});

test('each new result earns the specified reputation once, including zero for own forfeit',()=>{
  const g=newGame(),cash=g.credits;
  for(const [kind,gain] of Object.entries(resultPoints)){const report=earn(g,kind);assert.equal(report.gain,gain);check(g);}
  assert.equal(g.reputation.points,18);assert.equal(g.reputation.current.matches,4);assert.equal(g.credits,cash);
  assert.deepEqual(g.reputation.totals,{win:1,draw:1,loss:1,forfeit:1,seasons:0,seasonPoints:0});
  const copy=structuredClone(g);assert.equal(finishMatch(g),null);assert.deepEqual(g,copy);
});

test('a live match awards nothing until completion and reload keeps the same single award',()=>{
  const g=newGame();beginMatch(g);advance(g,45);assert.equal(g.reputation.points,0);assert.equal(g.reputation.history.length,0);
  const p=structuredClone(g.reputation);assert.equal(settleReputation(g,{home:0,away:5,goals:[1,1]},g.pending),null);assert.deepEqual(g.reputation,p);
  const restored=parseBackup(exportBackup(g));advance(g,90);advance(restored,90);
  assert.deepEqual(restored.reputation,g.reputation);assert.equal(g.reputation.history.length,1);assert.equal(g.lastMatch.reputationReport.total,g.reputation.points);
  check(g);const done=structuredClone(g);finishMatch(g);assert.deepEqual(g,done);
});

test('legacy live matches keep their rules and do not earn new reputation retroactively',()=>{
  const g=newGame();beginMatch(g);delete g.pending.reputationRules;delete g.reputation;
  const restored=parseBackup(exportBackup(g));advance(restored,90);
  assert.equal(restored.reputation.points,0);assert.equal(restored.reputation.current.matches,0);assert.equal(restored.lastMatch.reputationReport,undefined);
  for(let i=1;i<10;i++)play(restored);const before=restored.reputation.points;newSeason(restored);
  assert.equal(restored.reputation.points,before);assert.equal(restored.reputation.totals.seasons,0);check(restored);
});

test('a full new season pays exactly its earned finish bonus and resets only the current counter',()=>{
  const g=newGame();for(let i=0;i<10;i++)play(g);
  const before=g.reputation.points,place=standings(g).findIndex(row=>row.i===0)+1;
  assert.equal(g.reputation.totals.seasons,0);assert.equal(newSeason(g),true);assert.equal(g.reputation.points,before+seasonPoints[place-1]);
  assert.equal(g.reputation.history.at(-1).place,place);assert.equal(g.reputation.totals.seasons,1);assert.deepEqual(g.reputation.current,{season:2,matches:0});
  const after=structuredClone(g);assert.equal(newSeason(g),false);assert.equal(closeReputationSeason(g,place),null);assert.deepEqual(g,after);check(g);
});

test('all six season positions have bounded bonuses and a partial migrated season gets none',()=>{
  for(let place=1;place<=6;place++){
    const g=newGame();for(let i=0;i<10;i++)earn(g);
    const before=g.reputation.points;assert.equal(closeReputationSeason(g,place).gain,seasonPoints[place-1]);assert.equal(g.reputation.points,before+seasonPoints[place-1]);
    assert.equal(closeReputationSeason(g,place),null);
  }
  const g=newGame();for(let i=0;i<6;i++)play(g);delete g.reputation;delete g.lastMatch.reputationReport;ensureReputation(g);
  for(let i=6;i<10;i++)play(g);const before=g.reputation.points;newSeason(g);assert.equal(g.reputation.points,before);assert.equal(g.reputation.totals.seasons,0);
  winningSeason(g);assert.equal(g.reputation.totals.seasons,1);check(g);
});

test('sponsor access checks both reputation thresholds and existing contract and match restrictions',()=>{
  const g=newGame();for(const [kind,threshold] of [['regional',100],['national',300]]){
    for(const points of [threshold-1,threshold]){g.reputation.points=points;const before=structuredClone(g);const ok=chooseSponsor(g,kind);assert.equal(ok,points===threshold);if(!ok)assert.deepEqual(g,before);g.management.sponsor=null;}
  }
  g.reputation.points=300;chooseSponsor(g,'steady');const contracted=structuredClone(g);assert.equal(chooseSponsor(g,'national'),false);assert.deepEqual(g,contracted);
  g.management.sponsor=null;beginMatch(g);const live=structuredClone(g);assert.equal(chooseSponsor(g,'regional'),false);assert.deepEqual(g,live);
  g.pending=null;g.round=10;assert.equal(chooseSponsor(g,'regional'),false);g.round=0;assert.equal(chooseSponsor(g,'invalid'),false);
  assert.equal(reputationLevel(99).name,'In opbouw');assert.equal(reputationLevel(100).name,'Gevestigd');assert.equal(reputationLevel(299).name,'Gevestigd');assert.equal(reputationLevel(300).name,'Toonaangevend');
});

test('new sponsor contracts retain normal payments, late-signing prorating and single settlement',()=>{
  const g=newGame();winningSeason(g);assert.equal(chooseSponsor(g,'regional'),true);check(g);
  assert.equal(matchBudget(g,true,true).sponsor,7500);const m=play(g);assert.equal(m.settlement.entries.find(e=>e.category==='sponsor').amount,7500);check(g);
  winningSeason(g);assert.ok(g.reputation.points>=300);for(let i=0;i<9;i++)earn(g);chooseSponsor(g,'national');
  assert.equal(matchBudget(g,false,false).sponsor,3500);assert.equal(matchBudget(g,false,true).sponsor,10000);play(g);check(g);
  newSeason(g);const bonuses=g.management.ledger.filter(e=>e.label==='Sponsorbonus seizoen');assert.equal(bonuses.at(-1).amount,4500);
  const cash=g.credits;assert.equal(newSeason(g),false);assert.equal(g.credits,cash);check(g);
});

test('reputation itself changes neither cash nor simulation and upgrades cannot buy points',()=>{
  const current=newGame(),legacy=structuredClone(current);beginMatch(current);beginMatch(legacy);delete legacy.pending.reputationRules;
  advance(current,90);advance(legacy,90);assert.equal(current.credits,legacy.credits);assert.deepEqual(current.results,legacy.results);assert.deepEqual(current.clubs,legacy.clubs);
  const points=current.reputation.points;upgradeClub(current,'facilities','stadium');assert.equal(current.reputation.points,points);
});

test('zero-minute single and double forfeits do not manufacture reputational wins for the loser',()=>{
  for(const teams of [[0],[0,4],[4]]){
    const g=newGame();g.round=1;
    for(const team of teams)for(const p of g.clubs[team].players.slice(6))g.discipline.suspensions[p.id]={remaining:1,reason:'red',season:1,round:1};
    play(g);assert.equal(g.lastMatch.detail.minute,0);assert.equal(g.reputation.points,teams.includes(0)?0:12);assert.equal(g.reputation.current.matches,1);check(g);
  }
});

test('explicit roster replacement and transfers preserve earned reputation independently of player identities',()=>{
  const g=newGame();play(g);delete g.rosterVersion;const before=structuredClone(g),updated=updateClubRosters(g);
  assert.deepEqual(updated.reputation,g.reputation);assert.deepEqual(g,before);check(updated);
  const player=updated.clubs[0].players.find(p=>saleOffer(updated,p.id,1));assert.ok(player);assert.equal(sellPlayer(updated,player.id,1),true);assert.deepEqual(updated.reputation,g.reputation);check(updated);
});

test('reputation history stays bounded while all lifetime points survive export and later seasons',()=>{
  const g=newGame();for(let season=0;season<8;season++)winningSeason(g);
  assert.equal(g.reputation.points,8*170);assert.equal(g.reputation.history.length,40);assert.equal(g.reputation.totals.win,80);assert.equal(g.reputation.totals.seasons,8);
  assert.equal(g.reputation.openingPoints+g.reputation.history.reduce((sum,e)=>sum+e.gain,0),g.reputation.points);check(g);
});

test('invalid reputation, unearned sponsor unlocks and unsupported live rules cannot be imported',()=>{
  const base=newGame();play(base);check(base);
  for(const mutate of [g=>g.reputation.schema=2,g=>g.reputation.points++,g=>g.reputation.openingPoints++,g=>g.reputation.totals.win++,g=>g.reputation.current.matches++,g=>g.reputation.current.season++,g=>g.reputation.lastSeason++,g=>g.reputation.history[0].gain++,g=>g.reputation.history[0].total++,g=>g.reputation.history[0].round=11,g=>g.reputation.history.push(g.reputation.history[0]),g=>g.reputation.lastRound=0,g=>g.lastMatch.reputationReport.gain=999,g=>g.lastMatch.reputationReport.total=999,g=>g.management.sponsor={kind:'national',season:1,startRound:0}]){
    const g=structuredClone(base);mutate(g);assert.throws(()=>parseBackup(exportBackup(g)));
  }
  beginMatch(base);base.pending.reputationRules=2;assert.throws(()=>parseBackup(exportBackup(base)));
});
