import {formations,positionFit} from './engine.js';
import {keeperAbility} from './keepers.js';
import {unavailablePlayer} from './fitness.js';
import {matchInjury,liveFitness} from './match-injuries.js';

export function coachOpponent(game){
  const p=game.pending,c=p?.opponentCoach;
  if(!c||p.minute<1||p.minute>=90||p.abandoned?.length||c.changes.length>=3)return;
  const club=game.clubs[p.home===0?p.away:p.home],side=p.home===0?1:0;
  const used=new Set(c.changes.flatMap(x=>[x.outId,x.inId]));
  for(const [slot,id] of p.opponentSelection.entries()){
    if(!id||!matchInjury(game,id)||c.changes.length>=3)continue;
    const out=club.players.find(v=>v.id===id),role=formations['4-3-3'][slot];
    const score=v=>positionFit(v.position,role)*1000+(role==='GK'?keeperAbility(v):(v.attack+v.passing+v.defending+v.pace+v.finishing+v.composure)/6)*(.35+.65*v.fitness/100);
    const reserve=c.bench.map(id=>club.players.find(v=>v.id===id)).filter(v=>v&&!used.has(v.id)&&!p.opponentSelection.includes(v.id)&&!p.dismissed[side].includes(v.id)&&!unavailablePlayer(game,v.id)&&!matchInjury(game,v.id)
      &&(role==='GK'?v.position==='GK':v.position!=='GK'&&positionFit(v.position,role)>=.93)&&v.fitness>liveFitness(game,out,p.opponentPlayed[id]||0))
      .sort((a,b)=>score(b)-score(a)||a.id.localeCompare(b.id))[0];
    if(!reserve)continue;
    p.opponentSelection[slot]=reserve.id;used.add(id);used.add(reserve.id);
    c.changes.push({minute:p.minute,outId:id,inId:reserve.id,outName:out.name,inName:reserve.name});
  }
}

// Reconstruct participation to validate both new live saves and historical reports.
export function validOpponentCoach(detail,{side,selection,started,played,players=null}){
  const c=detail.opponentCoach;if(c===undefined)return true;
  const record=v=>v!==null&&typeof v==='object'&&!Array.isArray(v),text=v=>typeof v==='string'&&v.length>0&&v.length<=500;
  const unique=a=>new Set(a).size===a.length;
  if(!record(c)||c.schema!==1||detail.injuryRules!==1||detail.disciplineRules!==1||detail.keeperRules!==1||!Array.isArray(started)||!record(played)||!Array.isArray(selection))return false;
  if(!Array.isArray(c.bench)||c.bench.length>7||!c.bench.every(text)||!unique([...started,...c.bench])||!Array.isArray(c.changes)||c.changes.length>3)return false;
  if(players&&c.bench.some(id=>!players.some(p=>p.id===id)))return false;
  if(!c.changes.every((v,i)=>record(v)&&Number.isInteger(v.minute)&&v.minute>=1&&v.minute<=Math.min(89,detail.minute)&&(i===0||v.minute>=c.changes[i-1].minute)
    &&[v.outId,v.inId,v.outName,v.inName].every(text)&&v.outId!==v.inId&&detail.events.some(e=>e.type==='injury'&&e.side===side&&e.playerId===v.outId&&e.player===v.outName&&e.minute<=v.minute)
    &&(!players||[v.outId,v.inId].every((id,i)=>players.some(p=>p.id===id&&p.name===(i?v.inName:v.outName))))))return false;
  const active=new Set(started),bench=new Set(c.bench),joins=new Map(started.map(id=>[id,0])),minutes={};
  const actions=[...detail.events.filter(e=>e.type==='red'&&e.side===side).map(e=>({minute:e.minute,outId:e.playerId,red:true})),...c.changes].sort((a,b)=>a.minute-b.minute||Number(Boolean(b.red))-Number(Boolean(a.red)));
  for(const action of actions){
    if(!active.has(action.outId)||action.minute>detail.minute)return false;
    const time=action.minute-joins.get(action.outId);if(time>0)minutes[action.outId]=time;
    active.delete(action.outId);
    if(!action.red){if(!bench.has(action.inId)||active.has(action.inId))return false;bench.delete(action.inId);active.add(action.inId);joins.set(action.inId,action.minute);}
  }
  for(const id of active){const time=detail.minute-joins.get(id);if(time>0)minutes[id]=time;}
  if(selection.filter(Boolean).length!==active.size||selection.filter(Boolean).some(id=>!active.has(id)))return false;
  return Object.keys(played).length===Object.keys(minutes).length&&Object.entries(minutes).every(([id,n])=>played[id]===n);
}

const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function opponentCoachView(coach,club){
  if(!coach?.changes.length)return '';
  return `<section class="fitness-report opponent-coach-report" aria-label="Wissels tegenstander"><p class="kicker">COMPUTERCOACH · ${esc(club)}</p><h3>${coach.changes.length}/3 wissels gebruikt</h3>${coach.changes.map(c=>`<p><b>${c.minute}'</b> ${esc(c.outName)} → ${esc(c.inName)} <span class="muted">· lichte tik</span></p>`).join('')}<p class="muted">De vervanger speelt vanaf de volgende minuut. De geblesseerde speler kan niet terugkeren en houdt zijn hersteltijd.</p></section>`;
}
