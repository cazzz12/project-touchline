import test from 'node:test';
import assert from 'node:assert/strict';
import {newGame,beginMatch,advanceMatch,finishMatch,playRound,makeSubstitution,train,sellPlayer,newSeason,updateClubRosters,scout,signPlayer} from '../public/game.js';
import {developPlayer,trainAccordingToPlan,recordCash,saleOffer,renewExpiring} from '../public/management.js';
import {ensureDevelopment,setDevelopmentPlan,stopDevelopmentPlan,recordSkillGain,developmentForecast,settleDevelopment} from '../public/development.js';
import {applyRecommendedSquad} from '../public/fitness.js';
import {clubTransferQuote,submitClubBid,confirmClubPurchase} from '../public/transfers.js';
import {exportBackup,parseBackup} from '../public/storage.js';
const player=g=>g.clubs[0].players.find(p=>p.id===g.lineupIds[0]);
const advance=(g,minute)=>{while(g.pending&&g.pending.minute<minute){g.pending.paused=false;advanceMatch(g);}};
const check=g=>assert.deepEqual(parseBackup(exportBackup(g)),g);

test('older saves gain tracking baselines without changing players, prior training or live match data',()=>{
  const g=newGame();train(g,'Attacking');beginMatch(g);advance(g,20);g.pending.paused=true;delete g.pending.developmentRules;delete g.development;
  const old=structuredClone(g),loaded=parseBackup(JSON.stringify(g));
  assert.deepEqual(g,old);assert.equal(loaded.development.players[player(g).id].baseline.attack,player(g).attack);
  assert.ok(Object.values(loaded.development.players).every(d=>d.plan===null&&d.history.length===0));
  delete loaded.development;assert.deepEqual(loaded,old);
});
test('plans and forecasts are explicit and invalid choices do not mutate a career',()=>{
  const g=newGame(),p=player(g),before=structuredClone(g);
  for(const [id,k,target] of [['unknown','passing',80],[g.clubs[1].players[0].id,'passing',80],[p.id,'fitness',90],[p.id,'passing',p.passing],[p.id,'passing',100],[p.id,'passing',NaN],[p.id,'passing',88.5]])assert.equal(setDevelopmentPlan(g,id,k,target),false);
  const out=g.clubs[0].players.find(p=>p.position!=='GK');assert.equal(setDevelopmentPlan(g,out.id,'reflexes',90),false);assert.deepEqual(g,before);
  assert.equal(setDevelopmentPlan(g,p.id,'passing',p.passing+3),true);
  assert.deepEqual(g.clubs,before.clubs);assert.equal(g.credits,before.credits);assert.equal(g.management.developmentUsed,false);
  assert.deepEqual(developmentForecast(g,p),{remaining:3,rate:1,sessions:3,minutes:540});check(g);
});
test('individual, keeper and planned training share one session and track the actual capped gain',()=>{
  const g=newGame(),p=player(g),initial=p.reflexes,fitness=p.fitness;
  setDevelopmentPlan(g,p.id,'reflexes',initial+1);assert.equal(trainAccordingToPlan(g,p.id),true);
  assert.equal(p.reflexes,initial+1);assert.equal(p.fitness,fitness-3);assert.equal(g.development.players[p.id].gains.individual,1);
  const done=structuredClone(g);assert.equal(developPlayer(g,p.id,'passing'),false);assert.equal(trainAccordingToPlan(g,p.id),false);assert.deepEqual(g,done);check(g);
  const cap=newGame(),q=player(cap);q.passing=98;delete cap.development;ensureDevelopment(cap);cap.management.facilities.training=5;cap.management.staff.coach=3;
  setDevelopmentPlan(cap,q.id,'passing',99);assert.equal(developmentForecast(cap,q).sessions,1);assert.equal(trainAccordingToPlan(cap,q.id),true);
  assert.equal(q.passing,99);assert.equal(cap.development.players[q.id].gains.individual,1);assert.equal(cap.development.players[q.id].history[0].after,99);check(cap);
});
test('team training records skill gains, skips injured players and never lowers existing values of 100',()=>{
  const g=newGame(),p=player(g),out=g.clubs[0].players.find(p=>p.position!=='GK');g.round=1;p.attack=100;delete g.development;ensureDevelopment(g);
  g.medical.injuries[out.id]={kind:'knock',remaining:1,season:1,round:1};const attack=out.attack;
  assert.equal(train(g,'Attacking'),true);assert.equal(p.attack,100);assert.equal(g.development.players[p.id].gains.team,0);assert.equal(out.attack,attack);assert.equal(g.development.players[out.id].history.length,0);
  const improved=g.clubs[0].players.find(v=>v.id!==p.id&&v.id!==out.id);assert.equal(g.development.players[improved.id].gains.team,1);check(g);
});
test('two full appearances grow the focus once, survive mid-match reload and freeze report snapshots',()=>{
  let g=newGame(),p=player(g),before=p.passing;setDevelopmentPlan(g,p.id,'passing',before+1);playRound(g);
  assert.equal(p.passing,before);assert.equal(g.development.players[p.id].plan.minutes,90);assert.equal(g.lastMatch.developmentReport[0].minutes,90);
  beginMatch(g);advance(g,32);g.pending.paused=true;g=parseBackup(exportBackup(g));p=player(g);advance(g,90);
  assert.equal(p.passing,before+1);assert.equal(g.development.players[p.id].plan.minutes,0);assert.equal(g.development.players[p.id].gains.match,1);
  const report=g.lastMatch.developmentReport.find(r=>r.id===p.id);assert.equal(report.before,before);assert.equal(report.after,before+1);
  assert.equal(g.lastMatch.detail.teams.flat().find(v=>v.id===p.id).passing,before,'snapshot precedes the growth');
  const finished=structuredClone(g);assert.equal(finishMatch(g),null);assert.deepEqual(g,finished);check(g);
});
test('substitutes receive only played minutes and a failed or paused match gives no progress',()=>{
  const g=newGame(),out=g.lineupIds[2],inside=g.benchIds.find(id=>g.clubs[0].players.find(p=>p.id===id).position!=='GK');
  for(const id of [out,inside]){const p=g.clubs[0].players.find(p=>p.id===id);setDevelopmentPlan(g,id,'passing',p.passing+2);}
  beginMatch(g);let before=structuredClone(g);assert.deepEqual(settleDevelopment(g,g.pending),[]);assert.deepEqual(g,before);
  advance(g,30);g.pending.paused=true;assert.equal(makeSubstitution(g,out,inside),true);advance(g,90);
  assert.equal(g.development.players[out].plan.minutes,30);assert.equal(g.development.players[inside].plan.minutes,60);
  check(g);
});
test('red cards and reglementary results cannot award unplayed development minutes',()=>{
  const g=newGame();g.season=3;for(const c of Object.values(g.management.contracts))c.untilSeason=5;
  for(const p of g.clubs[0].players)setDevelopmentPlan(g,p.id,'passing',Math.min(99,p.passing+2));
  beginMatch(g);advance(g,64);const id=g.pending.dismissed[g.pending.home===0?0:1][0];assert.ok(id);advance(g,90);
  assert.equal(g.development.players[id].plan.minutes,64);check(g);
  const short=newGame();short.round=1;const p=player(short);setDevelopmentPlan(short,p.id,'passing',p.passing+1);
  for(const v of short.clubs[0].players.slice(6))short.discipline.suspensions[v.id]={reason:'red',remaining:2,season:1,round:1};
  playRound(short);assert.deepEqual(short.lastMatch.developmentReport,[]);assert.equal(short.development.players[p.id].plan.minutes,0);check(short);
});
test('changing a focus resets only partial minutes, raising its target keeps them, and stopping preserves skills',()=>{
  const g=newGame(),p=player(g);setDevelopmentPlan(g,p.id,'passing',p.passing+2);playRound(g);const d=g.development.players[p.id];assert.equal(d.plan.minutes,90);
  setDevelopmentPlan(g,p.id,'passing',p.passing+3);assert.equal(d.plan.minutes,90);
  setDevelopmentPlan(g,p.id,'defending',p.defending+2);assert.equal(d.plan.minutes,0);const skills=structuredClone(p);
  assert.equal(stopDevelopmentPlan(g,p.id),true);assert.deepEqual(p,skills);assert.equal(stopDevelopmentPlan(g,p.id),false);check(g);
});
test('injury and live match locks are shared by all individual training routes',()=>{
  const g=newGame(),p=player(g);g.round=1;setDevelopmentPlan(g,p.id,'passing',p.passing+2);g.medical.injuries[p.id]={kind:'knock',remaining:1,season:1,round:1};
  let before=structuredClone(g);assert.equal(trainAccordingToPlan(g,p.id),false);assert.deepEqual(g,before);applyRecommendedSquad(g);beginMatch(g);assert.ok(g.pending);before=structuredClone(g);
  assert.equal(setDevelopmentPlan(g,p.id,'defending',p.defending+1),false);assert.equal(stopDevelopmentPlan(g,p.id),false);assert.equal(trainAccordingToPlan(g,p.id),false);assert.deepEqual(g,before);check(g);
});
test('legacy live matches add no experience, while later seasons preserve active goals and earned progress',()=>{
  const g=newGame(),p=player(g);setDevelopmentPlan(g,p.id,'passing',p.passing+5);beginMatch(g);delete g.pending.developmentRules;advance(g,90);
  assert.equal(g.lastMatch.developmentReport,undefined);assert.equal(g.development.players[p.id].plan.minutes,0);assert.equal(g.development.players[p.id].gains.match,0);
  g.round=10;const before=structuredClone(g.development);newSeason(g);assert.deepEqual(g.development,before);check(g);
});
test('development history follows a sale and repurchase; new signings receive their own baseline',()=>{
  const g=newGame();recordCash(g,2000000,'test','Synthetic transfer budget');const p=g.clubs[0].players.find(p=>p.position!=='GK'&&saleOffer(g,p.id,1));
  setDevelopmentPlan(g,p.id,'passing',p.passing+3);trainAccordingToPlan(g,p.id);const history=structuredClone(g.development.players[p.id]);
  assert.equal(sellPlayer(g,p.id,1),true);history.plan=null;assert.deepEqual(g.development.players[p.id],history);
  const q=clubTransferQuote(g,1,p.id),offer=submitClubBid(g,1,p.id,q.asking);assert.equal(confirmClubPurchase(g,offer.id),true);assert.deepEqual(g.development.players[p.id],history);
  scout(g);const newcomer=g.market[0];assert.equal(signPlayer(g,newcomer.id),true);assert.equal(g.development.players[newcomer.id].baseline.passing,newcomer.passing);check(g);
});
test('explicit roster replacement resets training baselines on the copy while normal reload does not',()=>{
  const g=newGame(),p=player(g);setDevelopmentPlan(g,p.id,'passing',p.passing+3);trainAccordingToPlan(g,p.id);delete g.rosterVersion;
  const before=structuredClone(g),updated=updateClubRosters(g);assert.deepEqual(g,before);assert.ok(Object.values(updated.development.players).every(d=>d.plan===null&&d.history.length===0));check(updated);check(g);
});
test('bounded history retains lifetime gain totals after more than sixteen improvements',()=>{
  const g=newGame(),p=player(g);p.passing=20;delete g.development;ensureDevelopment(g);
  for(let i=0;i<25;i++)recordSkillGain(g,p,'passing',1,'individual');const d=g.development.players[p.id];
  assert.equal(d.history.length,16);assert.equal(d.gains.individual,25);assert.equal(d.baseline.passing,20);assert.equal(p.passing,45);check(g);
});
test('invalid development saves and reports are rejected without modifying the original',()=>{
  const good=newGame(),p=player(good);setDevelopmentPlan(good,p.id,'passing',p.passing+2);playRound(good);
  const edits=[g=>g.development.schema=2,g=>g.development.lastRound=99,g=>g.development.players[p.id].plan.target=100,g=>g.development.players[p.id].plan.minutes=180,g=>g.development.players[p.id].plan.attribute='morale',g=>g.development.players[p.id].baseline.passing=-1,g=>g.development.players[p.id].gains.team=-1,g=>g.lastMatch.developmentReport[0].minutes++,g=>g.lastMatch.developmentReport[0].after+=2,g=>g.lastMatch.developmentReport[0].carry=180];
  for(const edit of edits){const bad=structuredClone(good);edit(bad);assert.throws(()=>parseBackup(JSON.stringify(bad)),/geldige/);}check(good);
});
