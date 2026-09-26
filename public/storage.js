import { formations } from './engine.js';
import { KEY, clubNames, migrateSave, nextFixture } from './game.js';
import {injuryTypes,availablePlayers,injuryFor,roundNumber} from './fitness.js';
import { sponsors } from './management.js';
import {suspensionFor,forfeitingSides,awardedGoals} from './discipline.js';
import {openOffer} from './transfer-state.js';
import {incomingOpen,MAX_CLUB_BUDGET} from './club-market-state.js';
import {developmentSkills,skillsFor} from './development.js';
import {resultPoints,seasonPoints,reputationOutcome} from './reputation.js';
import {validCriteria,matchesCriteria} from './scouting-state.js';
import {cost} from './game.js';

export const RECOVERY_KEY = `${KEY}-before-import`;
export const MAX_BACKUP_BYTES = 2 * 1024 * 1024;
const invalid = () => { throw new Error('Dit bestand bevat geen geldige Touchline-carrière.'); };
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const text = value => typeof value === 'string' && value.length > 0 && value.length <= 500;
const number = (value, min = 0, max = Number.MAX_SAFE_INTEGER) => Number.isFinite(value) && value >= min && value <= max;
const integer = (value, min, max) => Number.isInteger(value) && number(value, min, max);
const list = (value, check, max = 1000) => Array.isArray(value) && value.length <= max && value.every(check);
const unique = ids => new Set(ids).size === ids.length;
const idList = (ids, known, length) => list(ids, id => known.has(id), 55) && unique(ids) && (length === undefined || ids.length === length);
const slots=(ids,known)=>Array.isArray(ids)&&ids.length===11&&ids.every(id=>id===null||known.has(id))&&unique(ids.filter(Boolean));
const captain=(id,ids)=>id===null?ids.every(v=>v===null):ids.includes(id);
const forfeits=v=>Array.isArray(v)&&v.length<=2&&v.every(s=>s===0||s===1)&&unique(v);
const playerStats = ['attack', 'passing', 'defending', 'pace', 'finishing', 'composure', 'stamina', 'fitness', 'morale'];
const positions = new Set([...Object.values(formations).flat(),'DEF','MID','ATT']);
function player(p) {
  return record(p) && typeof p.id === 'string' && /^(real-\d+|club-[a-z0-9-]{1,100})$/.test(p.id) && text(p.name)
    && (p.age===null||integer(p.age, 1, 120)) && positions.has(p.position)
    && (p.number===undefined||integer(p.number,1,99)) && playerStats.every(key => number(p[key], 0, 100))
    && ['reflexes','handling','positioning'].every(key=>p[key]===undefined||number(p[key],0,100));
}
function stats(items) {
  return Array.isArray(items) && items.length === 2 && items.every(s => record(s)
    && ['goals', 'shots', 'onTarget', 'xg', 'passes', 'completed', 'possessions', 'fouls', 'possession', 'passAccuracy'].every(key => number(s[key]))
    && ['yellowCards','redCards'].every(key=>s[key]===undefined||integer(s[key],0,90)));
}
function events(items) {
  return list(items, e => record(e) && integer(e.minute, 1, 90) && integer(e.side, 0, 1)
    && text(e.player) && (['goal','save','miss'].includes(e.type)?number(e.xg,0,1):['yellow','red'].includes(e.type)&&text(e.playerId)&&(e.type!=='red'||typeof e.secondYellow==='boolean'))
    && (e.keeperId===undefined||text(e.keeperId)) && (e.keeper===undefined||text(e.keeper)));
}
function coaching(items) {
  return list(items, e => record(e) && integer(e.minute, 0, 90) && text(e.text), 10000);
}
function fixture(m) {
  return record(m) && integer(m.home, 0, 5) && integer(m.away, 0, 5) && m.home !== m.away;
}
function result(m) {
  return fixture(m) && Array.isArray(m.goals) && m.goals.length === 2 && m.goals.every(n => integer(n, 0, 90)) && integer(m.round, 1, 10)&&(m.forfeit===undefined||(forfeits(m.forfeit)&&m.forfeit.length>0));
}
const signedMoney = value => integer(value,-1e12,1e12);
function cashEntry(e){return record(e)&&integer(e.id,1)&&integer(e.season,1)&&integer(e.round,1,11)&&signedMoney(e.amount)&&signedMoney(e.balance)&&text(e.category)&&text(e.label);}
const recordKeys=['matches','wins','draws','losses','goalsFor','goalsAgainst','points'];
const seasonRecord=r=>record(r)&&recordKeys.every(key=>integer(r[key],0));
function management(game){
  const m=game.management;
  if(!record(m)||m.schema!==1||!text(m.managerName)||m.managerName.length>40||!integer(m.sinceSeason,1)||!integer(m.sinceRound,0,10)||!integer(m.xp,0)
    ||!signedMoney(m.ledgerOpening)||!list(m.ledger,cashEntry,500)||!integer(m.nextEntry,1)||!unique(m.ledger.map(e=>e.id))
    ||!record(m.contracts)||Object.keys(m.contracts).length>2000||!Object.values(m.contracts).every(c=>record(c)&&integer(c.salary,0,1e9)&&integer(c.untilSeason,1))
    ||!game.clubs[0].players.every(p=>Object.hasOwn(m.contracts,p.id))
    ||!record(m.facilities)||!['stadium','training','medical'].every(k=>integer(m.facilities[k],1,5))
    ||!record(m.staff)||!['coach','scout'].every(k=>integer(m.staff[k],0,3))
    ||typeof m.developmentUsed!=='boolean'||!record(m.auto)||!['protectLead','chaseGoal','subTired'].every(k=>typeof m.auto[k]==='boolean'))return false;
  let balance=m.ledgerOpening;
  for(const entry of m.ledger){balance+=entry.amount;if(balance!==entry.balance||entry.id>=m.nextEntry)return false;}
  if(balance!==game.credits)return false;
  if(m.sponsor!==null&&(!record(m.sponsor)||!Object.hasOwn(sponsors,m.sponsor.kind)||!integer(m.sponsor.season,1)||!integer(m.sponsor.startRound,0,9)))return false;
  if(!seasonRecord(m.archivedTotals)||!integer(m.archivedTotals.titles,0)||!integer(m.archivedTotals.seasons,0)
    ||!list(m.history,h=>record(h)&&integer(h.season,1)&&integer(h.place,1,6)&&clubNames.includes(h.club)&&seasonRecord(h.record)
      &&list(h.results,result,30)&&list(h.table,r=>record(r)&&clubNames.includes(r.name)&&['i','p','w','d','l','gf','ga','pts'].every(k=>integer(r[k],0)),6),50)
    ||!unique(m.history.map(h=>h.season))||!record(m.playerStats)||Object.keys(m.playerStats).length>2000)return false;
  return Object.values(m.playerStats).every(p=>record(p)&&text(p.name)&&['appearances','starts','minutes','goals','seasonAppearances','seasonGoals'].every(k=>integer(p[k],0))&&integer(p.season,1)&&list(p.clubs,c=>clubNames.includes(c),6)
    && ['yellowCards','redCards'].every(k=>p[k]===undefined||integer(p[k],0))
    && (p.keeping===undefined||(record(p.keeping)&&['appearances','minutes','saves','conceded','cleanSheets'].every(k=>integer(p.keeping[k],0))&&p.keeping.cleanSheets<=p.keeping.appearances&&p.keeping.appearances<=p.appearances&&p.keeping.minutes<=p.minutes)));
}

function keeperReport(detail){
  if(detail.keeperRules===undefined)return detail.keeping===undefined;
  if(detail.keeperRules!==1||!Array.isArray(detail.keeping)||detail.keeping.length!==2)return false;
  return detail.keeping.every((rows,side)=>list(rows,p=>record(p)&&text(p.id)&&text(p.name)&&integer(p.minutes,1,90)&&integer(p.saves,0,90)&&integer(p.conceded,0,90)
    && typeof p.cleanSheet==='boolean'&&p.cleanSheet===(p.minutes>=60&&p.conceded===0),4)
    && unique(rows.map(p=>p.id))&&rows.reduce((n,p)=>n+p.minutes,0)===(detail.disciplineRules===1?detail.minute:90)
    && rows.every(p=>p.saves===detail.events.filter(e=>e.side!==side&&e.keeperId===p.id&&e.type==='save').length&&p.conceded===detail.events.filter(e=>e.side!==side&&e.keeperId===p.id&&e.type==='goal').length)
    && detail.events.filter(e=>e.side!==side&&['goal','save','miss'].includes(e.type)).every(e=>rows.some(p=>p.id===e.keeperId&&p.name===e.keeper)));
}

function medical(game){
  const m=game.medical,known=new Set(game.clubs.flatMap(c=>c.players.map(p=>p.id)));
  if(!record(m)||m.schema!==1||!integer(m.lastRound,0,roundNumber(game))||!record(m.injuries)||Object.keys(m.injuries).length>330)return false;
  if(!Object.entries(m.injuries).every(([id,i])=>known.has(id)&&record(i)&&Object.hasOwn(injuryTypes,i.kind)&&integer(i.remaining,1,3)&&integer(i.season,1,game.season)&&integer(i.round,1,10)&&(i.season-1)*10+i.round<=roundNumber(game)))return false;
  return game.clubs.every((club,index)=>{
    const available=club.players.filter(p=>!injuryFor(game,p.id)),keepers=club.players.filter(p=>p.position==='GK').length;
    return available.length>=18&&available.filter(p=>p.position==='GK').length>=Math.min(2,keepers);
  });
}
function medicalReport(r){return record(r)&&list(r.injured,p=>record(p)&&text(p.name)&&Object.hasOwn(injuryTypes,p.kind)&&integer(p.remaining,1,3),55)&&list(r.recovered,text,55);}

function discipline(game){
  const d=game.discipline,known=new Set(game.clubs.flatMap(c=>c.players.map(p=>p.id)));
  return record(d)&&d.schema===1&&integer(d.lastRound,0,roundNumber(game))&&record(d.yellows)&&record(d.suspensions)
    && Object.entries(d.yellows).every(([id,n])=>known.has(id)&&integer(n,0,2))
    && Object.entries(d.suspensions).every(([id,b])=>known.has(id)&&record(b)&&integer(b.remaining,1,2)&&['red','second-yellow','yellow-limit'].includes(b.reason)&&integer(b.season,1,game.season)&&integer(b.round,1,10)&&(b.season-1)*10+b.round<=roundNumber(game));
}
function disciplineReport(r){return record(r)&&list(r.banned,p=>record(p)&&text(p.id)&&text(p.name)&&integer(p.remaining,1,2)&&['red','second-yellow','yellow-limit'].includes(p.reason),55)&&list(r.served,text,55);}
function transferDesk(game){
  const d=game.transferDesk;
  if(!record(d)||d.schema!==1||!integer(d.nextId,1)||!list(d.offers,o=>record(o)&&integer(o.id,1,d.nextId-1)&&text(o.playerId)&&text(o.name)
    && integer(o.seller,1,5)&&o.sellerName===game.clubs[o.seller].name&&integer(o.season,1,game.season)&&integer(o.round,0,10)
    && (o.season-1)*10+o.round<=roundNumber(game)&&integer(o.asking,1000,1e9)&&integer(o.amount,1,1e9)&&integer(o.price,0,1e9)
    && integer(o.salary,100,1e9)&&o.untilSeason===o.season+2
    && ['accepted','counter','rejected','withdrawn','expired','completed','superseded'].includes(o.status)
    && (o.amount>=Math.ceil(o.asking*.9)?o.price===o.amount:o.amount>=Math.ceil(o.asking*.65)?o.price===Math.ceil(o.asking*.95):o.price===0)
    && (o.status==='rejected'?o.price===0:o.price>0)
    && (o.status!=='accepted'||o.price===o.amount)&&(o.status!=='counter'||o.price===Math.ceil(o.asking*.95))
    && (!openOffer(o)||(!game.pending&&o.season===game.season&&o.round===game.round&&game.clubs[o.seller].players.some(p=>p.id===o.playerId&&p.name===o.name))),25))return false;
  return unique(d.offers.map(o=>o.id))&&d.offers.filter(openOffer).length<=5&&unique(d.offers.filter(openOffer).map(o=>o.playerId));
}
function clubMarket(game){
  const m=game.clubMarket,stamp=roundNumber(game);
  if(!record(m)||m.schema!==1||!integer(m.lastRound,0,stamp)||!integer(m.nextId,1)||!Array.isArray(m.clubs)||m.clubs.length!==5)return false;
  if(!m.clubs.every((a,i)=>{
    if(!record(a)||a.name!==game.clubs[i+1].name||!integer(a.balance,0,MAX_CLUB_BUDGET)||!integer(a.opening,0,MAX_CLUB_BUDGET)||!integer(a.nextEntry,1)
      ||!list(a.ledger,e=>record(e)&&integer(e.id,1,a.nextEntry-1)&&integer(e.season,1,game.season)&&integer(e.round,0,10)&&(e.season-1)*10+e.round<=stamp&&signedMoney(e.amount)&&integer(e.balance,0,MAX_CLUB_BUDGET)&&text(e.label),100))return false;
    let balance=a.opening,previous=0;
    for(const e of a.ledger){balance+=e.amount;if(balance!==e.balance||e.id<=previous)return false;previous=e.id;}
    return balance===a.balance;
  }))return false;
  if(!list(m.offers,o=>record(o)&&integer(o.id,1,m.nextId-1)&&text(o.playerId)&&text(o.name)&&integer(o.buyer,1,5)&&o.buyerName===game.clubs[o.buyer].name
    && integer(o.valuation,1000,1e9)&&integer(o.price,1,1e9)&&o.price===Math.floor(o.valuation*.85)
    && ['GK','DEF','MID','ATT'].includes(o.role)&&['quality','depth'].includes(o.reason)
    && integer(o.season,1,game.season)&&integer(o.round,1,10)&&(o.season-1)*10+o.round<=m.lastRound
    && ['open','rejected','completed','expired','unavailable'].includes(o.status)
    && (!incomingOpen(o)||(!game.pending&&o.season===game.season&&o.round===game.round&&m.lastRound===stamp&&game.clubs[0].players.some(p=>p.id===o.playerId&&p.name===o.name))),25))return false;
  const open=m.offers.filter(incomingOpen);
  return unique(m.offers.map(o=>o.id))&&open.length<=3&&unique(open.map(o=>o.buyer))&&unique(open.map(o=>o.playerId));
}
function reputation(game){
  const r=game.reputation,stamp=roundNumber(game);
  if(!record(r)||r.schema!==1||!integer(r.sinceSeason,1,game.season)||!integer(r.sinceRound,0,10)
    ||!integer(r.lastRound,(r.sinceSeason-1)*10+r.sinceRound,stamp)||r.lastSeason!==game.season-1
    ||!integer(r.points,0)||!integer(r.openingPoints,0,r.points)||!record(r.totals)
    ||!['win','draw','loss','forfeit','seasons','seasonPoints'].every(k=>integer(r.totals[k],0))
    ||r.points!==r.totals.win*12+r.totals.draw*5+r.totals.loss+r.totals.seasonPoints
    ||r.totals.seasons>game.season-r.sinceSeason||r.totals.seasonPoints>r.totals.seasons*50
    ||Object.keys(resultPoints).reduce((sum,k)=>sum+r.totals[k],0)>r.lastRound-((r.sinceSeason-1)*10+r.sinceRound)
    ||!record(r.current)||r.current.season!==game.season||!integer(r.current.matches,0,game.round)
    ||!list(r.history,e=>record(e)&&integer(e.season,r.sinceSeason,game.season)&&integer(e.round,1,11)
      && (e.kind==='season'?e.season<game.season&&e.round===11&&integer(e.place,1,6)&&e.gain===seasonPoints[e.place-1]
        :Object.hasOwn(resultPoints,e.kind)&&e.round<=10&&(e.season<game.season||e.round<=game.round)&&e.gain===resultPoints[e.kind])
      && integer(e.total,e.gain,r.points),40))return false;
  let balance=r.openingPoints,previous=(r.sinceSeason-1)*11+r.sinceRound;
  for(const e of r.history){const order=(e.season-1)*11+e.round;if(order<=previous)return false;previous=order;balance+=e.gain;if(balance!==e.total)return false;}
  if(balance!==r.points||r.current.matches!==r.history.filter(e=>e.season===game.season&&e.kind!=='season').length)return false;
  if(Object.keys(resultPoints).some(kind=>r.history.filter(e=>e.kind===kind).length>r.totals[kind]))return false;
  if(r.history.filter(e=>e.kind==='season').length>r.totals.seasons||r.history.filter(e=>e.kind==='season').reduce((n,e)=>n+e.gain,0)>r.totals.seasonPoints)return false;
  const last=r.history.findLast(e=>e.kind!=='season');if(last&&(last.season-1)*10+last.round!==r.lastRound)return false;
  return !game.management.sponsor||r.points>=(sponsors[game.management.sponsor.kind].reputation||0);
}
function scoutingDesk(game){
  const d=game.scoutingDesk,stamp=roundNumber(game);
  if(!record(d)||d.schema!==1||!validCriteria(d.criteria)||!list(d.shortlist,p=>record(p)
    && typeof p.id==='string'&&/^(real-\d+|club-[a-z0-9-]{1,100})$/.test(p.id)&&text(p.name)
    && integer(p.season,1,game.season)&&integer(p.round,0,10)&&(p.season-1)*10+p.round<=stamp,20)
    ||!unique(d.shortlist.map(p=>p.id)))return false;
  return d.report===null||(record(d.report)&&validCriteria(d.report.criteria)&&d.report.season===game.season&&d.report.round===game.round
    && [10500,12000,13500,15000].includes(d.report.fee)&&game.scout==='completed'
    && game.market.every(p=>matchesCriteria(p,cost(p),d.report.criteria)));
}
function development(game){
  const d=game.development,stamp=roundNumber(game),own=new Set(game.clubs[0].players.map(p=>p.id));
  if(!record(d)||d.schema!==1||!integer(d.lastRound,0,stamp)||!record(d.players)||Object.keys(d.players).length>2000)return false;
  if(!game.clubs[0].players.every(p=>Object.hasOwn(d.players,p.id)&&Object.keys(d.players[p.id]?.baseline||{}).length===skillsFor(p).length&&skillsFor(p).every(k=>Object.hasOwn(d.players[p.id]?.baseline||{},k))))return false;
  return Object.entries(d.players).every(([id,r])=>{
    if(!/^(real-\d+|club-[a-z0-9-]{1,100})$/.test(id)||!record(r)||!integer(r.sinceSeason,1,game.season)||!integer(r.sinceRound,0,10)||(r.sinceSeason-1)*10+r.sinceRound>stamp
      ||!record(r.baseline)||![7,10].includes(Object.keys(r.baseline).length)||!['attack','passing','defending','pace','finishing','composure','stamina'].every(k=>Object.hasOwn(r.baseline,k))
      ||!Object.entries(r.baseline).every(([k,n])=>Object.hasOwn(developmentSkills,k)&&number(n,0,100))
      ||!record(r.gains)||!['team','individual','match'].every(k=>number(r.gains[k],0,1e9))
      ||!list(r.history,e=>record(e)&&integer(e.season,r.sinceSeason,game.season)&&integer(e.round,0,10)
        && (e.season-1)*10+e.round>=((r.sinceSeason-1)*10+r.sinceRound)&&(e.season-1)*10+e.round<=stamp
        && Object.hasOwn(r.baseline,e.attribute)&&number(e.before,0,99)&&number(e.after,e.before,99)&&e.after>e.before
        && ['team','individual','match'].includes(e.source),16))return false;
    if(['team','individual','match'].some(k=>r.history.filter(e=>e.source===k).reduce((n,e)=>n+e.after-e.before,0)>r.gains[k]+1e-8))return false;
    return r.plan===null||(own.has(id)&&record(r.plan)&&Object.hasOwn(r.baseline,r.plan.attribute)&&integer(r.plan.target,1,99)&&integer(r.plan.minutes,0,179));
  });
}
function developmentReport(r){return list(r,o=>record(o)&&text(o.id)&&text(o.name)&&Object.hasOwn(developmentSkills,o.attribute)
  && number(o.before,0,99)&&number(o.after,o.before,99)&&o.after-o.before<=1&&integer(o.minutes,1,90)&&integer(o.carry,0,179)
  && integer(o.target,1,99)&&o.before<o.target&&o.after<=o.target&&(o.after<o.target||o.carry===0),18)&&unique(r.map(o=>o.id));}
function cardTotals(p,known){
  if(!Array.isArray(p.bookings)||p.bookings.length!==2||!Array.isArray(p.dismissed)||p.dismissed.length!==2)return false;
  return known.every((ids,side)=>record(p.bookings[side])&&Object.entries(p.bookings[side]).every(([id,n])=>ids.has(id)&&integer(n,1,2))
    && idList(p.dismissed[side],ids)&&p.dismissed[side].length<=5
    && p.events.filter(e=>['yellow','red'].includes(e.type)&&e.side===side).every(e=>ids.has(e.playerId)&&e.minute<=p.minute&&(!(e.type==='yellow'||e.secondYellow)||p.bookings[side][e.playerId]===p.events.filter(v=>v.side===side&&v.playerId===e.playerId&&(v.type==='yellow'||v.secondYellow)).length))
    && Object.entries(p.bookings[side]).every(([id,n])=>p.events.filter(e=>e.side===side&&e.playerId===id&&(e.type==='yellow'||e.secondYellow)).length===n)
    && p.dismissed[side].every(id=>p.events.filter(e=>e.side===side&&e.playerId===id&&e.type==='red').length===1&&!p.events.some(e=>e.side===side&&e.playerId===id&&e.minute>p.events.find(v=>v.side===side&&v.playerId===id&&v.type==='red').minute))
    && p.events.filter(e=>e.side===side&&e.type==='red').length===p.dismissed[side].length
    && p.stats[side].yellowCards===p.events.filter(e=>e.side===side&&(e.type==='yellow'||e.secondYellow)).length
    && p.stats[side].redCards===p.dismissed[side].length);
}

// Validate before a file is allowed to replace browser storage. Migration operates
// on the parsed copy, never on the active in-memory career or the stored text.
function validate(game) {
  if (!record(game) || !Array.isArray(game.clubs) || game.clubs.length !== 6
    || !unique(game.clubs.map(c => c?.name))
    || !game.clubs.every(c => record(c) && clubNames.includes(c.name) && list(c.players, player, 55) && c.players.length >= 18)) invalid();
  const allIds = game.clubs.flatMap(c => c.players.map(p => p.id));
  const own = new Set(game.clubs[0].players.map(p => p.id));
  if (!unique(allIds) || !integer(game.round, 0, 10) || !integer(game.season, 1)
    || !signedMoney(game.credits) || !number(game.points) || !/^#[\da-f]{6}$/i.test(game.color)
    || !record(game.tactics) || !Object.hasOwn(formations, game.tactics.formation)
    || !['mentality', 'pressing', 'tempo'].every(key => number(game.tactics[key], 0, 100))
    || !list(game.results, result, 30) || !list(game.news, text, 10000)
    || !list(game.market, player, 4) || !unique(game.market.map(p => p.id))
    || game.market.some(p => allIds.includes(p.id))
    || !['Recovery', 'Attacking', 'Defending', 'Fitness'].includes(game.training)
    || !slots(game.lineupIds, own) || !idList(game.benchIds, own)||game.benchIds.length>7
    || game.benchIds.some(id => game.lineupIds.includes(id)) || !captain(game.captainId,game.lineupIds)||!management(game)||!medical(game)||!discipline(game)||!transferDesk(game)||!clubMarket(game)||!development(game)||!reputation(game)||!scoutingDesk(game)) invalid();
  if (game.lastMatch != null) {
    const r = game.lastMatch;
    if(r.reputationReport!==undefined&&(!record(r.reputationReport)||r.reputationReport.gain!==resultPoints[reputationOutcome(r)]||!integer(r.reputationReport.total,r.reputationReport.gain,game.reputation.points)))invalid();
    if(r.developmentReport!==undefined&&(!developmentReport(r.developmentReport)||!r.developmentReport.every(o=>r.detail?.played?.[o.id]===o.minutes)))invalid();
    if(r.disciplineReport!==undefined&&!disciplineReport(r.disciplineReport))invalid();
    if ((r.medicalReport!==undefined&&!medicalReport(r.medicalReport))||!result(r) || !number(r.reward ?? 0) || !record(r.detail) || !stats(r.detail.stats)
      || !events(r.detail.events) || !keeperReport(r.detail) || !coaching(r.detail.coaching || [])
      || (r.settlement!==undefined&&(!record(r.settlement)||!signedMoney(r.settlement.net)||!list(r.settlement.entries,cashEntry,8)))) invalid();
    if(r.detail.disciplineRules!==undefined){
      const d=r.detail;
      if(d.disciplineRules!==1||!integer(d.minute,0,90)||!forfeits(d.abandoned)||(!d.abandoned.length&&d.minute!==90)||JSON.stringify(r.goals)!==JSON.stringify(awardedGoals(d))||JSON.stringify(r.forfeit||[])!==JSON.stringify(d.abandoned))invalid();
      if(!Array.isArray(d.playedBySide)||d.playedBySide.length!==2||!Array.isArray(d.startedSelections)||d.startedSelections.length!==2||!d.startedSelections.every(ids=>list(ids,text,11)&&unique(ids)))invalid();
      const known=d.playedBySide.map(m=>new Set(Object.keys(m||{})));
      if(!d.playedBySide.every(m=>record(m)&&Object.values(m).every(n=>integer(n,1,d.minute)))||!cardTotals(d,known))invalid();
    }
  }
  if (game.pending != null) {
    const p = game.pending, expected = nextFixture(game);
    if (!fixture(p) || !expected || p.home !== expected[0] || p.away !== expected[1]) invalid();
    const opponent = new Set(game.clubs[p.home === 0 ? p.away : p.home].players.map(player => player.id));
    if (!integer(p.minute, 0, 89) || !integer(p.subs, 0, 3) || !(p.disciplineRules===1?slots(p.selection,own):idList(p.selection, own, 11))
      || !idList(p.bench, own) || p.bench.length > 7 || !idList(p.used, own) || p.used.length !== p.subs
      || !unique([...p.selection.filter(Boolean), ...p.bench, ...p.used]) || !captain(p.captainId,p.selection)
      || !(p.disciplineRules===1?slots(p.opponentSelection,opponent):idList(p.opponentSelection, opponent, 11)) || !stats(p.stats) || !events(p.events) || !coaching(p.coaching)
      || !record(p.played) || !Object.entries(p.played).every(([id, minutes]) => own.has(id) && integer(minutes, 0, p.minute))) invalid();
    if(p.medicalRules!==undefined&&p.medicalRules!==1)invalid();
    if(p.developmentRules!==undefined&&p.developmentRules!==1)invalid();
    if(p.reputationRules!==undefined&&p.reputationRules!==1)invalid();
    if(p.keeperRules!==undefined&&p.keeperRules!==1)invalid();
    if(p.keeperRules===1){
      if(!record(p.keeperMinutes)||!Object.entries(p.keeperMinutes).every(([id,n])=>own.has(id)&&integer(n,1,p.played[id]??0))||Object.values(p.keeperMinutes).reduce((a,b)=>a+b,0)!==p.minute)invalid();
      if(!p.events.filter(e=>['goal','save','miss'].includes(e.type)).every(e=>text(e.keeper)&&text(e.keeperId)&&(e.side===(p.home===0?0:1)?e.keeperId===p.opponentSelection[0]:Object.hasOwn(p.keeperMinutes,e.keeperId))))invalid();
    }else if(p.keeperMinutes!==undefined)invalid();
    if([...p.selection,...p.bench,...p.opponentSelection].some(id=>injuryFor(game,id)))invalid();
    if((p.startedSelection!==undefined&&!idList(p.startedSelection,own,p.disciplineRules===1?undefined:11))||['autoChased','autoProtected'].some(key=>p[key]!==undefined&&typeof p[key]!=='boolean'))invalid();
    if(p.disciplineRules!==undefined){
      if(p.disciplineRules!==1||!forfeits(p.abandoned)||!idList(p.opponentStarted,opponent)||p.opponentStarted.length>11||p.startedSelection.length>11)invalid();
      const mySide=p.home===0?0:1,known=mySide===0?[own,opponent]:[opponent,own];
      if(!cardTotals(p,known)||[...p.selection,...p.bench,...p.opponentSelection].some(id=>suspensionFor(game,id)))invalid();
      const order=mySide===0?[p.selection,p.opponentSelection]:[p.opponentSelection,p.selection];
      if(JSON.stringify(forfeitingSides(order))!==JSON.stringify(p.abandoned)||order.some((ids,side)=>ids.some(id=>id&&p.dismissed[side].includes(id))||(!p.abandoned.length&&!ids[0])))invalid();
      if(p.dismissed[mySide].some(id=>p.bench.includes(id)||p.used.includes(id)))invalid();
      if(!record(p.opponentPlayed)||!Object.entries(p.opponentPlayed).every(([id,n])=>opponent.has(id)&&integer(n,1,p.minute)))invalid();
      if(!record(p.opponentKeeperMinutes)||!Object.entries(p.opponentKeeperMinutes).every(([id,n])=>opponent.has(id)&&integer(n,1,p.opponentPlayed[id]??0))||Object.values(p.opponentKeeperMinutes).reduce((a,b)=>a+b,0)!==p.minute)invalid();
      for(const [side,ids] of order.entries()){
        const starters=side===mySide?p.startedSelection:p.opponentStarted,played=side===mySide?p.played:p.opponentPlayed;
        if(ids.filter(Boolean).length!==starters.length-p.dismissed[side].length||Object.values(played).reduce((a,b)=>a+b,0)!==starters.length*p.minute-p.events.filter(e=>e.side===side&&e.type==='red').reduce((n,e)=>n+p.minute-e.minute,0))invalid();
      }
    }
    p.paused = true;
  }
  return game;
}

export function parseBackup(raw) {
  if (typeof raw !== 'string' || new TextEncoder().encode(raw).length > MAX_BACKUP_BYTES) {
    throw new Error('Kies een Touchline-backup van maximaal 2 MB.');
  }
  let data;
  try { data = JSON.parse(raw.replace(/^\uFEFF/, '')); } catch { invalid(); }
  if (data?.format === 'touchline-backup') {
    if (data.backupVersion !== 1) throw new Error('Deze backup komt uit een nieuwere versie van Touchline.');
    data = data.game;
  }
  if (!record(data) || ![2, 3, 4, 5].includes(data.version)) {
    throw new Error('Dit saveformaat wordt niet ondersteund. Je huidige carrière blijft bewaard.');
  }
  try { return validate(migrateSave(data)); } catch { invalid(); }
}

export function exportBackup(game, now = new Date()) {
  const copy = structuredClone(game);
  if (copy.pending) copy.pending.paused = true;
  return JSON.stringify({ format: 'touchline-backup', backupVersion: 1, exportedAt: now.toISOString(), game: copy }, null, 2);
}

export function readStoredGame(storage, key = KEY) {
  let raw = null;
  try {
    raw = storage.getItem(key);
    return { game: raw === null ? null : parseBackup(raw), raw, error: '' };
  } catch (error) {
    return { game: null, raw, error: raw === null ? 'Browseropslag is niet beschikbaar.' : error.message };
  }
}

export function writeGame(storage, game) {
  try { storage.setItem(KEY, JSON.stringify(game)); return true; } catch { return false; }
}

export function restoreBackup(storage, game, currentGame = null) {
  // A single setItem is atomic. If reserving the previous save or replacing the
  // current save fails, the current key remains untouched and the UI keeps playing it.
  const candidate = parseBackup(JSON.stringify(game));
  const stored = storage.getItem(KEY);
  // Include progress still in memory after an earlier autosave failure.
  const previous = currentGame ? JSON.stringify(currentGame) : stored;
  if (previous !== null) storage.setItem(RECOVERY_KEY, previous);
  storage.setItem(KEY, JSON.stringify(candidate));
  return candidate;
}
