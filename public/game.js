import {recordSkillGain,settleDevelopment} from './development.js';
import {settleReputation,closeReputationSeason} from './reputation.js';
import {validCriteria,matchesCriteria,defaultCriteria} from './scouting-state.js';
import {settleClubMarket,completeIncomingSale} from './club-market.js';
import { formations, lineUp, positionFit, rng, simulate } from './engine.js';
import { realPlayers } from './real-players.js';
import { clubData, playerIdentity, ROSTER_VERSION } from './clubs.js';
import { ensureManagement, recordCash, scoutingCost, settleMatch, recordPlayerMatch, archiveSeason, expiredMatchdayContracts, sellPlayer as completeSale } from './management.js';

import {injuryFor,unavailableSelection,recommendedSquad,settleFitness,seasonRest,fitnessAfterMinutes} from './fitness.js';
import {suspensionFor,forfeitingSides,awardedGoals,settleDiscipline,doubleForfeit} from './discipline.js';
import {availablePlayers,unavailablePlayer} from './fitness.js';
import {ensureKeeperSkills,keeperMatchStats,keeperAttributes} from './keepers.js';
import {expireTransferOffers} from './transfer-state.js';

export const KEY = 'touchline-save-v2';
export const clubNames = clubData.map(club=>club.name);
const clamp = (x,a,b) => Math.max(a,Math.min(b,x));
const positions={G:['GK'],D:['RB','CB','CB','LB'],M:['CDM','CM','CM','CAM'],F:['RW','LW','ST']};
function fromSource(source,index){
  const random=rng(505+index*739),base=55+Math.floor(random()*28);
  const stat=()=>clamp(base+Math.floor((random()-.5)*28),30,95);
  return {id:`real-${index}`,name:source.name,age:2026-source.birthYear,position:positions[source.role][index%positions[source.role].length],attack:stat(),passing:stat(),defending:stat(),pace:stat(),finishing:stat(),composure:stat(),stamina:stat(),fitness:75+Math.floor(random()*26),morale:70+Math.floor(random()*31)};
}
const rosterCounts={G:3,D:16,M:17,F:14};
const reserves=[];
for(const role of Object.keys(rosterCounts)){
  const pool=realPlayers.map((p,i)=>({p,i})).filter(({p})=>p.role===role);
  pool.forEach(({p,i},n)=>{if(n>=rosterCounts[role]*6)reserves.push(fromSource(p,i));});
}
export const initialClubs=clubData.map(club=>({name:club.name,players:club.players.map(source=>{
  const identity=playerIdentity(source.name);
  const seed=[...identity].reduce((hash,char)=>Math.imul(hash,31)+char.charCodeAt(0)|0,7);
  const role={GK:'G',DEF:'D',MID:'M',ATT:'F'}[source.position];
  return {...fromSource({name:source.name,birthYear:2026,role},seed),id:`club-${identity}`,age:null,position:source.position,number:source.number};
})}));
export const rating = p => Math.round((p.attack+p.passing+p.defending+p.pace+p.finishing+p.composure)/6);
export const cost = p => Math.round((rating(p)-40)**2 * 145);
export function schedule() {
  let order=[0,1,2,3,4,5]; const rounds=[];
  for(let round=0;round<5;round++) {
    rounds.push(Array.from({length:3},(_,i)=>round%2 ? [order[5-i],order[i]] : [order[i],order[5-i]]));
    order=[order[0],order[5],...order.slice(1,5)];
  }
  return [...rounds,...rounds.map(day=>day.map(([a,b])=>[b,a]))];
}
export function newGame(name='Ajax',color='#c5ff70') {
  const selected=clubNames.includes(name)?name:'Ajax';
  const clubs=structuredClone([initialClubs.find(c=>c.name===selected),...initialClubs.filter(c=>c.name!==selected)]);
  return ensureManagement(prepareSquad({version:5,rosterVersion:ROSTER_VERSION,clubs,color,round:0,credits:120000,points:0,results:[],training:'Recovery',academy:1,scout:null,market:[],news:[`Welkom bij ${clubs[0].name}. Je eerste seizoen begint vandaag.`],tactics:{formation:'4-3-3',mentality:50,pressing:50,tempo:50},lineupIds:lineUp(clubs[0]).map(p=>p.id),pending:null,season:1,lastMatch:null,reportOpen:false}));
}
// Explicit opt-in only. Keep the club order because results reference its indices.
// The caller must save a recovery copy before replacing the active career.
export function updateClubRosters(game){
  if(game.pending)throw new Error('Rond eerst je lopende wedstrijd af om de selecties bij te werken.');
  if(game.rosterVersion===ROSTER_VERSION)throw new Error('Deze carrière gebruikt de nieuwe selecties al.');
  const updated=structuredClone(game);
  expireTransferOffers(updated);
  updated.clubs=game.clubs.map(club=>structuredClone(initialClubs.find(c=>c.name===club.name)));
  if(updated.discipline){const ids=new Set(updated.clubs.flatMap(c=>c.players.map(p=>p.id)));for(const key of ['yellows','suspensions'])updated.discipline[key]=Object.fromEntries(Object.entries(updated.discipline[key]).filter(([id])=>ids.has(id)));}
  if(updated.medical){const ids=new Set(updated.clubs.flatMap(c=>c.players.map(p=>p.id)));updated.medical.injuries=Object.fromEntries(Object.entries(updated.medical.injuries).filter(([id])=>ids.has(id)));}
  delete updated.development;
  updated.lineupIds=[];delete updated.benchIds;updated.captainId=null;
  // Old offers are no longer valid; keep the scouting use and credits for this round.
  updated.market=[];if(updated.scoutingDesk)updated.scoutingDesk.report=null;updated.rosterVersion=ROSTER_VERSION;updated.reportOpen=false;
  updated.news.unshift('Clubselecties bijgewerkt. Basiself, wisselbank en aanvoerder zijn opnieuw gekozen. Uitslagen en credits zijn bewaard.');
  return ensureManagement(prepareSquad(updated));
}
export function prepareSquad(game){
  const players=game.clubs[0].players,known=new Set(players.map(p=>p.id));
  if(!Array.isArray(game.lineupIds)||game.lineupIds.length!==11||new Set(game.lineupIds.filter(Boolean)).size!==game.lineupIds.filter(Boolean).length||game.lineupIds.some(id=>id!==null&&!known.has(id)))game.lineupIds=lineUp(game.clubs[0],game.tactics.formation).map(p=>p.id);
  const starters=new Set(game.lineupIds),eligible=players.filter(p=>!starters.has(p.id)&&!unavailablePlayer(game,p.id)).sort((a,b)=>rating(b)-rating(a));
  const preferred=game.benchIds||[eligible.find(p=>p.position==='GK')?.id];
  game.benchIds=[...new Set([...preferred,...eligible.map(p=>p.id)])].filter(id=>known.has(id)&&!starters.has(id)).slice(0,7);
  if(!starters.has(game.captainId))game.captainId=game.lineupIds.filter(Boolean).map(id=>players.find(p=>p.id===id)).sort((a,b)=>b.composure-a.composure)[0]?.id??null;
  return game;
}
export function migrateSave(old){
  if(!old||!Array.isArray(old.clubs))return null;
  if([4,5].includes(old.version)){
    const game=prepareSquad(old);game.version=5;game.season=game.season||1;
    if(game.pending?.first){
      const p=game.pending,side=p.home===0?0:1,initial=p.first.teams[side].map(player=>player.id);
      p.minute=45;p.stats=p.first.stats;p.events=p.first.events;p.played=Object.fromEntries(initial.map(id=>[id,45]));
      p.used=initial.filter(id=>!p.selection.includes(id));p.bench=[...new Set([...game.benchIds,...initial])].filter(id=>!p.selection.includes(id)&&!p.used.includes(id)).slice(0,7);
      p.opponentSelection=p.first.teams[1-side].map(player=>player.id);p.captainId=p.selection.includes(game.captainId)?game.captainId:p.selection[0];p.subs=p.subs||0;p.coaching=[];delete p.first;
    }
    if(game.pending)game.pending.paused=true;
    return ensureManagement(game);
  }
  if(old.version!==2&&old.version!==3)return null;
  const selected=clubNames.includes(old.clubs[0]?.name)?old.clubs[0].name:'Ajax',fresh=newGame(selected,old.color);
  return ensureManagement({...fresh,management:undefined,reputation:undefined,credits:old.credits,round:old.round,results:old.results||[],points:old.points||0,tactics:old.tactics||fresh.tactics,trainingUsed:false,news:[`Je club speelt nu als ${selected} met echte spelersnamen. Uitslagen en credits zijn bewaard.`,...(old.news||[])].slice(0,20)});
}
export function setStarter(game,slot,id){
  if(game.pending||unavailablePlayer(game,id)||!Number.isInteger(slot)||slot<0||slot>10||!game.clubs[0].players.some(p=>p.id===id))return false;
  prepareSquad(game);
  if(game.lineupIds.some((selected,index)=>selected===id&&index!==slot))return false;
  const previous=game.lineupIds[slot],benchSlot=game.benchIds.indexOf(id);game.lineupIds[slot]=id;
  if(benchSlot>=0)game.benchIds[benchSlot]=previous;
  prepareSquad(game);return true;
}
export function setBench(game,slot,id){
  if(game.pending||unavailablePlayer(game,id)||!Number.isInteger(slot)||slot<0||slot>6||game.lineupIds.includes(id)||!game.clubs[0].players.some(p=>p.id===id))return false;
  if(game.benchIds.some((selected,index)=>selected===id&&index!==slot))return false;
  game.benchIds[slot]=id;return true;
}
export function setCaptain(game,id){
  if(game.pending||!id||!game.lineupIds.includes(id))return false;
  game.captainId=id;return true;
}
export function makeSubstitution(game,outId,inId){
  const p=game.pending;
  if(!p||!p.paused||p.minute>=90||p.subs>=3||p.selection.includes(inId)||!p.bench.includes(inId)||p.used.includes(inId))return false;
  const index=p.selection.indexOf(outId);if(!outId||index<0||unavailablePlayer(game,inId))return false;
  const players=game.clubs[0].players;p.selection[index]=inId;p.bench=p.bench.filter(id=>id!==inId);p.used.push(outId);p.subs++;
  if(p.captainId===outId)p.captainId=p.selection.find(id=>id===game.captainId)||p.selection.find(Boolean);
  p.coaching.push({minute:p.minute,text:`Wissel: ${players.find(player=>player.id===outId).name} → ${players.find(player=>player.id===inId).name}`});return true;
}
export function standings(game) {
  const table=game.clubs.map((c,i)=>({i,name:c.name,p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0}));
  for(const match of game.results){
    const a=table[match.home],b=table[match.away]; a.p++;b.p++;a.gf+=match.goals[0];a.ga+=match.goals[1];b.gf+=match.goals[1];b.ga+=match.goals[0];
    if(doubleForfeit(match)){a.l++;b.l++;}else if(match.goals[0]>match.goals[1]){a.w++;b.l++;a.pts+=3;} else if(match.goals[0]<match.goals[1]){b.w++;a.l++;b.pts+=3;} else{a.d++;b.d++;a.pts++;b.pts++;}
  }
  return table.sort((a,b)=>b.pts-a.pts || (b.gf-b.ga)-(a.gf-a.ga) || b.gf-a.gf);
}
export function nextFixture(game) {return schedule()[game.round]?.find(pair=>pair.includes(0));}
export function train(game,focus) {
  if(!['Recovery','Attacking','Defending','Fitness'].includes(focus)) return false;
  if(game.trainingUsed||game.pending) return false;
  ensureManagement(game);const players=game.clubs[0].players;
  const development=1+game.management.facilities.training-1+game.management.staff.coach;
  for(const p of players){
    if(injuryFor(game,p.id)&&focus!=='Recovery')continue;
    if(focus==='Recovery') p.fitness=clamp(p.fitness+9+game.management.facilities.medical-1,0,100);
    if(focus==='Fitness') {p.fitness=clamp(p.fitness+3,0,100);recordSkillGain(game,p,'stamina',1,'team');}
    if(focus==='Attacking') {recordSkillGain(game,p,'attack',development,'team');p.fitness=clamp(p.fitness-4,0,100);}
    if(focus==='Defending') {recordSkillGain(game,p,'defending',development,'team');p.fitness=clamp(p.fitness-4,0,100);}
  }
  game.training=focus;game.trainingUsed=true;game.news.unshift(`${focus} training afgerond. Nieuwe sessie na je volgende wedstrijd.`);return true;
}
export function scout(game,criteria=game.scoutingDesk?.criteria||defaultCriteria()) {
  if(!validCriteria(criteria))return false;
  ensureManagement(game);const fee=scoutingCost(game);
  if(game.pending || game.scout || game.credits<fee) return false;
  const random=rng(13000+game.round*271+game.results.length*19);
  const owned=new Set(game.clubs.flatMap(c=>c.players.map(p=>p.id)));
  const names=new Set(game.clubs.flatMap(c=>c.players.map(p=>playerIdentity(p.name))));
  const pool=reserves.filter(p=>!owned.has(p.id)&&!names.has(playerIdentity(p.name)))
    .map(p=>p.position==='GK'?{...p,...keeperAttributes(p)}:p).filter(p=>matchesCriteria(p,cost(p),criteria));
  if(!pool.length)return false;
  if(criteria.skill!=='any')pool.sort((a,b)=>b[criteria.skill]-a[criteria.skill]||cost(a)-cost(b)||a.id.localeCompare(b.id));
  recordCash(game,-fee,'scouting','Scoutingrapport');
  game.market=Array.from({length:Math.min(4,pool.length)},()=>{const p=pool.splice(criteria.skill==='any'?Math.floor(random()*pool.length):0,1)[0];return {...p,fitness:100};});
  game.scoutingDesk.report={criteria:structuredClone(criteria),season:game.season,round:game.round,fee};
  ensureKeeperSkills(game);
  game.scout='completed';game.news.unshift(`Scouts hebben ${game.market.length} passende spelers gevonden. Bekijk het scoutingrapport.`);return true;
}
export function signPlayer(game,id) {
  if(game.pending)return false;
  const index=game.market.findIndex(p=>p.id===id);
  if(index<0 || game.clubs[0].players.length>=55) return false;
  const p=game.market[index],price=cost(p);
  if(game.credits<price) return false;
  recordCash(game,-price,'transfer',`${p.name} aangetrokken`);game.clubs[0].players.push(p);game.market.splice(index,1);ensureManagement(game);
  game.news.unshift(`${p.name} tekent bij ${game.clubs[0].name} voor ${price.toLocaleString('nl-NL')} credits.`);return true;
}
export function acceptIncomingOffer(game,id){if(!completeIncomingSale(game,id))return false;prepareSquad(game);return true;}
export function sellPlayer(game,id,buyerIndex){if(!completeSale(game,id,buyerIndex))return false;prepareSquad(game);return true;}
const statKeys=['goals','shots','onTarget','xg','passes','completed','possessions','fouls'];
const emptyStats=()=>Object.fromEntries([...statKeys,'possession','passAccuracy'].map(key=>[key,0]));
export function beginMatch(game){
  if(game.pending)return game.pending;if(game.round>=10)return null;
  ensureManagement(game);prepareSquad(game);
  const [home,away]=nextFixture(game),other=home===0?away:home,available=availablePlayers(game);
  if(available.length>=7&&(expiredMatchdayContracts(game).length||unavailableSelection(game).length||game.lineupIds.filter(Boolean).length<Math.min(11,available.length)))return null;
  const own=available.length<7?recommendedSquad(game):{lineupIds:[...game.lineupIds],benchIds:[...game.benchIds],captainId:game.captainId};
  const opponent=recommendedSquad(game,other,'4-3-3').lineupIds;
  expireTransferOffers(game);
  game.reportOpen=false;
  game.pending={home,away,reputationRules:1,developmentRules:1,medicalRules:1,keeperRules:1,disciplineRules:1,keeperMinutes:{},opponentKeeperMinutes:{},opponentPlayed:{},bookings:[{},{}],dismissed:[[],[]],
    minute:0,startedSelection:own.lineupIds.filter(Boolean),opponentStarted:opponent.filter(Boolean),selection:[...own.lineupIds],bench:[...own.benchIds],captainId:own.captainId,opponentSelection:opponent,
    abandoned:forfeitingSides(home===0?[own.lineupIds,opponent]:[opponent,own.lineupIds]),used:[],subs:0,played:{},stats:[{...emptyStats(),yellowCards:0,redCards:0},{...emptyStats(),yellowCards:0,redCards:0}],events:[],coaching:[],paused:true};return game.pending;
}
export function moveLivePlayer(game,from,to){
  const p=game.pending;
  if(!p||p.disciplineRules!==1||!p.paused||p.abandoned.length||!Number.isInteger(from)||!Number.isInteger(to)||from<0||from>10||to<0||to>10||from===to||!p.selection[from]||(from===0&&!p.selection[to]))return false;
  [p.selection[from],p.selection[to]]=[p.selection[to],p.selection[from]];
  p.coaching.push({minute:p.minute,text:'Posities aangepast: '+formations[game.tactics.formation][from]+' ↔ '+formations[game.tactics.formation][to]});return true;
}
export const matchFitness=fitnessAfterMinutes;
export function applyAutoInstructions(game){
  const p=game.pending;if(!p||p.paused)return;
  const rules=game.management.auto,side=p.home===0?0:1,difference=p.stats[side].goals-p.stats[1-side].goals;
  if(rules.chaseGoal&&p.minute>=70&&difference<0&&!p.autoChased){
    game.tactics.mentality=80;game.tactics.tempo=70;p.autoChased=true;p.coaching.push({minute:p.minute,text:'Auto-instructie: achterstand aanvallen (mentaliteit 80, tempo 70).'});
  }
  if(rules.protectLead&&p.minute>=75&&difference>0&&!p.autoProtected){
    game.tactics.mentality=25;game.tactics.tempo=35;p.autoProtected=true;p.coaching.push({minute:p.minute,text:'Auto-instructie: voorsprong bewaken (mentaliteit 25, tempo 35).'});
  }
  if(rules.subTired&&p.minute>=60&&p.subs<3){
    const players=game.clubs[0].players;
    const tired=p.selection.map((id,slot)=>({player:players.find(v=>v.id===id),slot})).filter(({player})=>player&&matchFitness(player,p.played[player.id]||0)<60).sort((a,b)=>matchFitness(a.player,p.played[a.player.id]||0)-matchFitness(b.player,p.played[b.player.id]||0));
    for(const {player,slot} of tired){
      const reserve=p.bench.map(id=>players.find(v=>v.id===id)).filter(v=>positionFit(v.position,formations[game.tactics.formation][slot])>=.93&&v.fitness>matchFitness(player,p.played[player.id]||0)).sort((a,b)=>b.fitness-a.fitness)[0];
      if(reserve){p.paused=true;makeSubstitution(game,player.id,reserve.id);p.paused=false;p.coaching.at(-1).text='Auto-instructie · '+p.coaching.at(-1).text;break;}
    }
  }
}
export function advanceMatch(game){
  const p=game.pending;if(!p||p.paused||p.minute>=90)return null;
  if(p.abandoned?.length)return finishMatch(game);
  applyAutoInstructions(game);
  const minute=p.minute+1,mySide=p.home===0?0:1;
  const clubs=[game.clubs[p.home],game.clubs[p.away]].map((club,side)=>({...club,players:club.players.map(player=>({...player,fitness:matchFitness(player,side===mySide?(p.played[player.id]||0):(p.disciplineRules===1?(p.opponentPlayed[player.id]||0):p.minute))}))}));
  const own=p.selection,other=p.opponentSelection;
  const part=simulate({seed:73001+(game.season||1)*100000+game.round*1000+minute,clubs,homeTactics:mySide===0?game.tactics:{},awayTactics:mySide===1?game.tactics:{},homeSelection:mySide===0?own:other,awaySelection:mySide===1?own:other,startMinute:minute,endMinute:minute,keeperRules:p.keeperRules??0,disciplineRules:p.disciplineRules??0,bookings:p.bookings,dismissed:p.dismissed});
  if(p.keeperRules===1&&own[0])p.keeperMinutes[own[0]]=(p.keeperMinutes[own[0]]||0)+1;
  p.selection.filter(Boolean).forEach(id=>p.played[id]=(p.played[id]||0)+1);p.minute=minute;
  if(p.disciplineRules===1){
    other.filter(Boolean).forEach(id=>p.opponentPlayed[id]=(p.opponentPlayed[id]||0)+1);
    p.opponentKeeperMinutes[other[0]]=(p.opponentKeeperMinutes[other[0]]||0)+1;
    p.selection=part.teams[mySide].map(v=>v?.id??null);p.opponentSelection=part.teams[1-mySide].map(v=>v?.id??null);
    p.bookings=part.bookings;p.dismissed=part.dismissed;p.abandoned=part.abandoned;
    if(!p.selection.includes(p.captainId))p.captainId=p.selection.find(Boolean)??null;
    for(const side of [0,1])for(const key of ['yellowCards','redCards'])p.stats[side][key]+=part.stats[side][key];
    if(part.events.some(e=>e.type==='red'))p.paused=true;
  }
  p.stats.forEach((s,i)=>{statKeys.forEach(key=>s[key]+=part.stats[i][key]);s.xg=Number(s.xg.toFixed(2));s.possession=Math.round(100*s.possessions/minute);s.passAccuracy=s.passes?Math.round(100*s.completed/s.passes):0;});
  p.events.push(...part.events.map(event=>({...event,score:p.stats.map(s=>s.goals)})));
  if(minute===45||minute===90)p.paused=true;
  if(minute===90||p.abandoned?.length)return finishMatch(game);return null;
}
export function finishMatch(game){
  const p=game.pending;if(!p||(p.minute!==90&&!p.abandoned?.length))return null;
  const fixtures=schedule()[game.round];let own;const minutesByClub={},details=[];
  for(let i=0;i<fixtures.length;i++){
    const [home,away]=fixtures[i];
    const matchClubs=[game.clubs[home],game.clubs[away]];
    const result=home===p.home&&away===p.away?{
      clubs:matchClubs.map(c=>c.name),
      teams:[home===0?p.selection:p.opponentSelection,away===0?p.selection:p.opponentSelection].map((ids,side)=>ids.filter(Boolean).map(id=>(p.developmentRules===1?{...matchClubs[side].players.find(player=>player.id===id)}:matchClubs[side].players.find(player=>player.id===id)))),
      stats:structuredClone(p.stats),events:structuredClone(p.events),coaching:structuredClone(p.coaching),played:{...p.played},captainId:p.captainId,
      ...(p.disciplineRules===1?{disciplineRules:1,minute:p.minute,abandoned:[...p.abandoned],dismissed:structuredClone(p.dismissed),bookings:structuredClone(p.bookings),playedBySide:[home,away].map(index=>({... (index===0?p.played:p.opponentPlayed)})),startedSelections:[home,away].map(index=>[...(index===0?p.startedSelection:p.opponentStarted)])}:{}),
      ...(p.keeperRules===1?{keeperRules:1,keeping:keeperMatchStats(matchClubs,p.events,[home,away].map(index=>index===0?p.keeperMinutes:p.disciplineRules===1?p.opponentKeeperMinutes:{[p.opponentSelection[0]]:90}))}:{})
    }:simulate({seed:11000+(game.season||1)*100000+game.round*100+i,clubs:matchClubs,keeperRules:p.keeperRules??0,disciplineRules:p.disciplineRules??0,
      ...(p.medicalRules===1?{homeSelection:recommendedSquad(game,home,'4-3-3',p.keeperRules??0).lineupIds,awaySelection:recommendedSquad(game,away,'4-3-3',p.keeperRules??0).lineupIds}:{})});
    details.push(result);
    for(const [side,index] of [home,away].entries())minutesByClub[index]=result.disciplineRules===1?result.playedBySide[side]:index===0?{...p.played}:Object.fromEntries(result.teams[side].map(player=>[player.id,90]));
    recordPlayerMatch(game,result,home,away,p);
    const match={home,away,goals:awardedGoals(result),round:game.round+1,...(result.abandoned?.length?{forfeit:[...result.abandoned]}:{})};game.results.push(match);if(home===0||away===0)own={...match,detail:result};
  }
  const side=own.home===0?0:1,them=1-side,reward=own.forfeit?.includes(side)?0:own.goals[side]>own.goals[them]?35000:own.goals[side]===own.goals[them]?18000:10000;
  own.reward=reward;own.settlement=settleMatch(game,own);game.points+=doubleForfeit(own)?0:own.goals[side]>own.goals[them]?3:own.goals[side]===own.goals[them]?1:0;
  if(p.disciplineRules===1)own.disciplineReport=settleDiscipline(game,details);
  if(p.medicalRules===1)own.medicalReport=settleFitness(game,minutesByClub);
  else for(const player of game.clubs[0].players)player.fitness=p.played[player.id]?matchFitness(player,p.played[player.id]):Math.min(player.fitness+3,100);
  if(p.developmentRules===1)own.developmentReport=settleDevelopment(game,p);
  if(p.reputationRules===1)own.reputationReport=settleReputation(game,own,p);
  own.reward=reward;game.news.unshift(`Speeldag ${game.round+1}: ${game.clubs[own.home].name} ${own.goals[0]}–${own.goals[1]} ${game.clubs[own.away].name}. +${reward.toLocaleString('nl-NL')} credits.`);
  game.round++;game.trainingUsed=false;game.scout=null;game.market=[];game.scoutingDesk.report=null;game.pending=null;game.lastMatch=own;game.reportOpen=true;settleClubMarket(game);return own;
}
export function playRound(game){if(!beginMatch(game))return null;while(game.pending){game.pending.paused=false;advanceMatch(game);}return game.lastMatch;}
export function newSeason(game) {
  if(game.round<10) return false;
  ensureManagement(game);const table=standings(game),place=table.findIndex(row=>row.i===0)+1;
  if(!archiveSeason(game,table))return false;
  closeReputationSeason(game,place);
  expireTransferOffers(game);
  const bonus=(7-place)*30000;recordCash(game,bonus,'prize','Seizoensbonus');
  game.news.unshift(`Seizoen afgerond op plaats ${place}. Seizoensbonus: ${bonus.toLocaleString('nl-NL')} credits.`);
  game.season=(game.season||1)+1;game.reportOpen=false;game.round=0;game.results=[];game.trainingUsed=false;game.scout=null;game.market=[];
  game.reputation.current={season:game.season,matches:0};
  game.scoutingDesk.report=null;
  game.management.developmentUsed=false;game.discipline.yellows={};seasonRest(game);
  game.news.unshift('Seizoensrust afgerond: iedereen heeft 100% conditie en is weer inzetbaar.');
  return true;
}
