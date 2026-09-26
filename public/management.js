import {ensureDevelopment,recordSkillGain} from './development.js';
import {ensureFitness,injuryFor,availablePlayers,unavailablePlayer} from './fitness.js';
import {ensureClubMarket,clubBudget,recordClubBudget,closePlayerOffers} from './club-market-state.js';
import {ensureTransferDesk,releaseReason} from './transfer-state.js';
import {ensureDiscipline,doubleForfeit} from './discipline.js';
import {ensureKeeperSkills,keeperSkills,keeperAttributes} from './keepers.js';
// Local career systems. Amounts and contracts are game rules, never real club data.
export const overall = p => Math.round((p.attack+p.passing+p.defending+p.pace+p.finishing+p.composure)/6);
export const transferValue = p => Math.round((overall(p)-40)**2*145);
export const sponsors = {
  steady:{name:'Zekerheid',perMatch:6000,perWin:0,target:'Iedere positie',bonus:0,top:6},
  wins:{name:'Overwinningen',perMatch:2500,perWin:5000,target:'Top 3',bonus:30000,top:3},
  title:{name:'Titelambitie',perMatch:1000,perWin:3000,target:'Kampioen',bonus:100000,top:1}
};
export const facilities = {
  stadium:{name:'Stadionvoorzieningen',baseCost:18000,max:5,description:'Meer inkomsten bij thuiswedstrijden. Dit zijn spelniveaus, geen echte stadioncapaciteiten.'},
  training:{name:'Trainingscomplex',baseCost:14000,max:5,description:'Een extra ontwikkelpunt per niveau boven niveau 1 bij vaardigheidstraining.'},
  medical:{name:'Herstelcentrum',baseCost:10000,max:5,description:'Meer conditieherstel, lager blessurerisico en vanaf niveau 3 kortere spelblessures.'}
};
export const staffRoles = {
  coach:{name:'Trainingsstaf',baseCost:16000,max:3,description:'Een extra ontwikkelpunt per niveau bij vaardigheidstraining.'},
  scout:{name:'Scoutingstaf',baseCost:18000,max:3,description:'1.500 credits minder scoutingkosten per niveau.'}
};
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const ownResults=game=>game.results.filter(r=>r.home===0||r.away===0);
const xpFor=r=>r.wins*120+r.draws*70+r.losses*40;
function summarize(matches){
  const result={matches:0,wins:0,draws:0,losses:0,goalsFor:0,goalsAgainst:0,points:0};
  for(const match of matches){
    const side=match.home===0?0:1,gf=match.goals[side],ga=match.goals[1-side];
    result.matches++;result.goalsFor+=gf;result.goalsAgainst+=ga;
    if(doubleForfeit(match)){result.losses++;}else if(gf>ga){result.wins++;result.points+=3;}else if(gf===ga){result.draws++;result.points++;}else result.losses++;
  }
  return result;
}
export function ensureManagement(game){
  if(game.management===undefined){
    game.management={schema:1,managerName:'Manager',sinceSeason:game.season||1,sinceRound:game.round,
      xp:xpFor(summarize(ownResults(game))),ledgerOpening:game.credits,ledger:[],nextEntry:1,
      contracts:{},facilities:{stadium:1,training:1,medical:1},staff:{coach:0,scout:0},
      sponsor:null,history:[],archivedTotals:{matches:0,wins:0,draws:0,losses:0,goalsFor:0,goalsAgainst:0,points:0,titles:0,seasons:0},
      playerStats:{},developmentUsed:false,auto:{protectLead:false,chaseGoal:false,subTired:false}};
  }
  const m=game.management;
  if(m.schema!==1||!m.contracts||typeof m.contracts!=='object')return game;
  if(Array.isArray(m.ledger)&&m.ledger.length===0)m.ledgerOpening=game.credits;
  for(const p of game.clubs[0].players)if(!Object.hasOwn(m.contracts,p.id))m.contracts[p.id]={salary:Math.max(100,(overall(p)-40)*15),untilSeason:(game.season||1)+2};
  return ensureDevelopment(ensureClubMarket(ensureTransferDesk(ensureDiscipline(ensureKeeperSkills(ensureFitness(game))))));
}
export function recordCash(game,amount,category,label){
  ensureManagement(game);const m=game.management;
  game.credits+=amount;
  const entry={id:m.nextEntry++,season:game.season,round:game.round+1,amount,category,label,balance:game.credits};
  m.ledger.push(entry);
  if(m.ledger.length>500)m.ledgerOpening=m.ledger.shift().balance;
  return entry;
}
export function payroll(game){return game.clubs[0].players.reduce((sum,p)=>sum+game.management.contracts[p.id].salary,0);}
export function maintenance(game){const m=game.management;return m.facilities.stadium*500+m.facilities.training*250+m.facilities.medical*250+(m.staff.coach+m.staff.scout)*500;}
export function matchBudget(game,home,won=false){
  const m=game.management,sponsor=m.sponsor?.season===game.season?sponsors[m.sponsor.kind]:null;
  return {tickets:home?3000+m.facilities.stadium*3000:0,sponsor:sponsor?sponsor.perMatch+(won?sponsor.perWin:0):0,wages:payroll(game),maintenance:maintenance(game)};
}
export function settleMatch(game,match){
  const side=match.home===0?0:1,won=match.goals[side]>match.goals[1-side],draw=!doubleForfeit(match)&&match.goals[side]===match.goals[1-side];
  const budget=matchBudget(game,match.home===0,won);
  const rows=[[match.reward,'prize','Wedstrijdbonus'],[budget.tickets,'tickets','Thuiswedstrijdinkomsten'],[budget.sponsor,'sponsor','Sponsorbetaling'],[-budget.wages,'wages','Spelerssalarissen'],[-budget.maintenance,'facilities','Faciliteiten en staf']];
  const entries=rows.filter(([amount])=>amount!==0).map(([amount,category,label])=>recordCash(game,amount,category,label));
  game.management.xp+=won?120:draw?70:40;
  game.management.developmentUsed=false;
  return {entries,net:entries.reduce((sum,e)=>sum+e.amount,0)};
}
export function scoutingCost(game){return 15000-game.management.staff.scout*1500;}
export function upgradePrice(game,group,key){const definitions=group==='facilities'?facilities:group==='staff'?staffRoles:null;if(!definitions?.[key])return null;const level=game.management[group][key];return level<definitions[key].max?definitions[key].baseCost*(level+1):null;}
export function upgradeClub(game,group,key){
  if(game.pending)return false;
  const price=upgradePrice(game,group,key);if(price===null||game.credits<price)return false;
  const definition=(group==='facilities'?facilities:staffRoles)[key];
  recordCash(game,-price,group,`${definition.name} naar niveau ${game.management[group][key]+1}`);
  game.management[group][key]++;return true;
}
export function chooseSponsor(game,kind){
  if(game.pending||game.round>=10||game.management.sponsor||!Object.hasOwn(sponsors,kind))return false;
  game.management.sponsor={kind,season:game.season,startRound:game.round};
  game.news.unshift(`Sponsorcontract ${sponsors[kind].name} afgesloten voor de resterende ${10-game.round} speeldagen.`);return true;
}
export function renewContract(game,id){
  const contract=game.management.contracts[id];
  if(game.pending||!game.clubs[0].players.some(p=>p.id===id)||!contract||contract.untilSeason>game.season+1)return false;
  contract.salary=Math.ceil(contract.salary*1.08);contract.untilSeason=game.season+2;return true;
}
export function renewExpiring(game){let count=0;for(const p of game.clubs[0].players)if(renewContract(game,p.id))count++;return count;}
export function expiredMatchdayContracts(game){return [...game.lineupIds,...game.benchIds].filter(id=>id&&game.management.contracts[id].untilSeason<game.season);}
export function developPlayer(game,id,attribute){
  if(game.pending||game.management.developmentUsed||!['attack','passing','defending','pace','finishing','composure','stamina',...Object.keys(keeperSkills)].includes(attribute))return false;
  const p=game.clubs[0].players.find(p=>p.id===id);if(!p||injuryFor(game,id)||(Object.hasOwn(keeperSkills,attribute)&&p.position!=='GK'))return false;
  if(p.position==='GK')Object.assign(p,keeperAttributes(p));
  if(p[attribute]>=99)return false;
  recordSkillGain(game,p,attribute,game.management.staff.coach+game.management.facilities.training,'individual');
  p.fitness=clamp(p.fitness-3,0,100);game.management.developmentUsed=true;
  game.news.unshift(`${p.name} heeft individueel getraind. −3 conditie.`);return true;
}
export function trainAccordingToPlan(game,id){
  const p=game.clubs[0].players.find(p=>p.id===id),plan=game.development?.players[id]?.plan;
  return p&&plan&&p[plan.attribute]<plan.target?developPlayer(game,id,plan.attribute):false;
}
export function saleReason(game,id,buyerIndex,price){
  if(game.pending)return 'Rond eerst de lopende wedstrijd af.';
  if(!Number.isInteger(buyerIndex)||buyerIndex<1||buyerIndex>=game.clubs.length)return 'Deze club is niet beschikbaar.';
  if(!Number.isSafeInteger(price)||price<1||price>1e9)return 'Dit transferbedrag is ongeldig.';
  if(game.clubs[buyerIndex].players.length>=55)return 'De selectie van de koper zit vol (55 spelers).';
  if(clubBudget(game,buyerIndex)<price)return 'De koper heeft onvoldoende transferbudget.';
  return releaseReason(game,0,id);
}
export function saleOffer(game,id,buyerIndex){
  const p=game.clubs[0].players.find(p=>p.id===id);if(!p)return null;
  const price=Math.max(1,Math.floor(transferValue(p)*.65));
  if(saleReason(game,id,buyerIndex,price))return null;
  return {player:p,buyer:game.clubs[buyerIndex],price};
}
export function completePlayerSale(game,id,buyerIndex,price){
  if(saleReason(game,id,buyerIndex,price))return false;
  const player=game.clubs[0].players.find(p=>p.id===id),buyer=game.clubs[buyerIndex];
  game.clubs[0].players=game.clubs[0].players.filter(p=>p.id!==id);
  const moved={...player};delete moved.number;buyer.players.push(moved);
  delete game.management.contracts[id];
  recordClubBudget(game,buyerIndex,-price,`${player.name} gekocht van ${game.clubs[0].name}`);
  recordCash(game,price,'transfer',`${player.name} naar ${buyer.name}`);
  closePlayerOffers(game,id);
  if(game.development.players[id])game.development.players[id].plan=null;
  game.news.unshift(`${player.name} verkocht aan ${buyer.name} voor ${price.toLocaleString('nl-NL')} credits.`);
  return true;
}
export function sellPlayer(game,id,buyerIndex){
  const offer=saleOffer(game,id,buyerIndex);return offer?completePlayerSale(game,id,buyerIndex,offer.price):false;
}
export function recordPlayerMatch(game,detail,home,away,pending){
  const m=game.management;
  for(const [side,index] of [home,away].entries()){
    const club=game.clubs[index],own=index===0;
    const minutes=detail.disciplineRules===1?detail.playedBySide[side]:own?pending.played:Object.fromEntries(detail.teams[side].map(p=>[p.id,90]));
    const starters=detail.disciplineRules===1?detail.startedSelections[side]:own?(pending.startedSelection||game.lineupIds):detail.teams[side].map(p=>p.id);
    for(const [id,played] of Object.entries(minutes)){
      if(!played)continue;
      const player=club.players.find(p=>p.id===id);if(!player)continue;
      const stats=m.playerStats[id]??={name:player.name,appearances:0,starts:0,minutes:0,goals:0,clubs:[],season:game.season,seasonAppearances:0,seasonGoals:0};
      if(stats.season!==game.season){stats.season=game.season;stats.seasonAppearances=0;stats.seasonGoals=0;}
      const goals=detail.events.filter(e=>e.side===side&&e.type==='goal'&&(e.playerId?e.playerId===id:e.player===player.name)).length;
      stats.appearances++;stats.starts+=starters.includes(id)?1:0;stats.minutes+=played;stats.goals+=goals;stats.seasonAppearances++;stats.seasonGoals+=goals;
      if(detail.disciplineRules===1){
        stats.yellowCards=(stats.yellowCards||0)+detail.events.filter(e=>e.playerId===id&&(e.type==='yellow'||e.secondYellow)).length;
        stats.redCards=(stats.redCards||0)+detail.events.filter(e=>e.playerId===id&&e.type==='red').length;
      }
      const keeping=detail.keeperRules===1?detail.keeping[side].find(p=>p.id===id):null;
      if(keeping){
        stats.keeping??={appearances:0,minutes:0,saves:0,conceded:0,cleanSheets:0};
        stats.keeping.appearances++;stats.keeping.minutes+=keeping.minutes;stats.keeping.saves+=keeping.saves;stats.keeping.conceded+=keeping.conceded;stats.keeping.cleanSheets+=Number(keeping.cleanSheet);
      }
      if(!stats.clubs.includes(club.name))stats.clubs.push(club.name);
    }
  }
}
export function careerRecord(game){
  const current=summarize(ownResults(game)),past=game.management.archivedTotals;
  for(const season of game.management.history)for(const key of Object.keys(current))current[key]+=season.record[key];
  for(const key of Object.keys(current))current[key]+=past[key];
  return {...current,titles:past.titles+game.management.history.filter(s=>s.place===1).length,seasons:past.seasons+game.management.history.length};
}
export function achievements(game){
  const r=careerRecord(game);
  return [{name:'Eerste overwinning',done:r.wins>=1,progress:`${Math.min(r.wins,1)} / 1`},{name:'Tien zeges',done:r.wins>=10,progress:`${Math.min(r.wins,10)} / 10`},{name:'Honderd doelpunten',done:r.goalsFor>=100,progress:`${Math.min(r.goalsFor,100)} / 100`},{name:'Kampioen',done:r.titles>=1,progress:`${r.titles} titel(s)`},{name:'Club in ontwikkeling',done:Object.values(game.management.facilities).some(level=>level>=3),progress:'Bereik faciliteitenniveau 3'}];
}
export function archiveSeason(game,table){
  const m=game.management;if(m.history.some(s=>s.season===game.season))return false;
  const place=table.findIndex(r=>r.i===0)+1;
  if(m.sponsor?.season===game.season){const sponsor=sponsors[m.sponsor.kind];if(place<=sponsor.top&&sponsor.bonus){const bonus=Math.floor(sponsor.bonus*(10-m.sponsor.startRound)/10);recordCash(game,bonus,'sponsor','Sponsorbonus seizoen');}}
  m.history.push({season:game.season,place,club:game.clubs[0].name,record:summarize(ownResults(game)),table:structuredClone(table),results:structuredClone(game.results)});
  if(m.history.length>50){const old=m.history.shift();for(const key of Object.keys(old.record))m.archivedTotals[key]+=old.record[key];m.archivedTotals.titles+=old.place===1?1:0;m.archivedTotals.seasons++;}
  m.sponsor=null;return true;
}
export function opponentAnalysis(game,opponent){
  const recent=game.results.filter(r=>r.home===opponent||r.away===opponent).slice(-5);
  const form=recent.map(r=>{const side=r.home===opponent?0:1;return r.goals[side]>r.goals[1-side]?'W':r.goals[side]===r.goals[1-side]?'G':'V';});
  const matches=[...game.management.history.flatMap(s=>s.results.map(r=>({...r,season:s.season}))),...game.results.map(r=>({...r,season:game.season}))].filter(r=>(r.home===0&&r.away===opponent)||(r.away===0&&r.home===opponent));
  return {form,matches:matches.slice(-10)};
}
