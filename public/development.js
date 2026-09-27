import {keeperSkills} from './keepers.js';
import {roundNumber} from './fitness.js';

export const developmentSkills={attack:'Aanval',passing:'Passing',defending:'Verdediging',pace:'Snelheid',finishing:'Afwerking',composure:'Kalmte',stamina:'Uithoudingsvermogen',...keeperSkills};
export const MATCH_MINUTES_PER_POINT=180;
export const skillsFor=p=>Object.keys(developmentSkills).filter(k=>!Object.hasOwn(keeperSkills,k)||p.position==='GK');
export function ensureDevelopment(game){
  if(game.development===undefined)game.development={schema:1,lastRound:roundNumber(game),players:{}};
  const d=game.development;if(d?.schema!==1||!d.players||typeof d.players!=='object'||Array.isArray(d.players))return game;
  for(const p of game.clubs[0].players)if(!Object.hasOwn(d.players,p.id))d.players[p.id]={sinceSeason:game.season,sinceRound:game.round,
    baseline:Object.fromEntries(skillsFor(p).map(k=>[k,p[k]])),gains:{team:0,individual:0,match:0},plan:null,history:[]};
  return game;
}
export function setDevelopmentPlan(game,id,attribute,target){
  const p=game.clubs[0].players.find(p=>p.id===id);
  if(game.pending||!p||!skillsFor(p).includes(attribute)||!Number.isInteger(target)||target<=p[attribute]||target>99)return false;
  ensureDevelopment(game);const d=game.development.players[id];
  d.plan={attribute,target,minutes:d.plan?.attribute===attribute?d.plan.minutes:0};return true;
}
export function stopDevelopmentPlan(game,id){
  if(game.pending||!game.clubs[0].players.some(p=>p.id===id)||!game.development?.players[id]?.plan)return false;
  game.development.players[id].plan=null;return true;
}
export function recordSkillGain(game,p,attribute,amount,source){
  if(!skillsFor(p).includes(attribute)||!['team','individual','match'].includes(source)||!Number.isFinite(amount)||amount<=0)return 0;
  ensureDevelopment(game);const d=game.development.players[p.id];if(!d)return 0;
  const before=p[attribute],after=Math.max(before,Math.min(99,before+amount));if(after===before)return 0;
  p[attribute]=after;d.gains[source]+=after-before;
  d.history.push({season:game.season,round:game.round,attribute,before,after,source});
  if(d.history.length>16)d.history.shift();
  if(d.plan?.attribute===attribute&&after>=d.plan.target)d.plan.minutes=0;
  return after-before;
}
export function developmentForecast(game,p){
  const plan=game.development.players[p.id]?.plan;if(!plan)return null;
  const remaining=Math.max(0,plan.target-p[plan.attribute]),rate=game.management.facilities.training+game.management.staff.coach;
  return {remaining,rate,sessions:Math.ceil(remaining/rate),minutes:Math.max(0,Math.ceil(remaining)*MATCH_MINUTES_PER_POINT-plan.minutes)};
}
// Settles after all matches have been simulated, never during a live minute.
export function settleDevelopment(game,pending){
  const d=game.development,stamp=roundNumber(game)+1;
  if(pending!==game.pending||!pending||pending.developmentRules!==1||(pending.minute!==90&&!pending.abandoned?.length)||d.lastRound>=stamp)return [];
  d.lastRound=stamp;const report=[];
  for(const p of game.clubs[0].players){
    const plan=d.players[p.id].plan,minutes=pending.played[p.id]||0;
    if(!plan||!minutes||p[plan.attribute]>=plan.target)continue;
    const before=p[plan.attribute],total=plan.minutes+minutes,points=Math.floor(total/MATCH_MINUTES_PER_POINT);
    recordSkillGain(game,p,plan.attribute,Math.min(points,plan.target-before),'match');
    plan.minutes=p[plan.attribute]>=plan.target?0:total%MATCH_MINUTES_PER_POINT;
    report.push({id:p.id,name:p.name,attribute:plan.attribute,before,after:p[plan.attribute],minutes,carry:plan.minutes,target:plan.target});
  }
  return report;
}
