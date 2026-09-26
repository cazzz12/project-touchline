import {rng} from './engine.js';
import {availablePlayers,fitnessAfterMinutes,injuryRisk,medicalLevel} from './fitness.js';

export const MATCH_INJURY_PENALTY=15;
export const matchInjury=(game,id)=>game.pending?.injuryRules===1?game.pending.events.find(e=>e.type==='injury'&&e.playerId===id):undefined;
export const liveFitness=(game,player,minutes=0)=>Math.max(10,fitnessAfterMinutes(player,minutes)-(matchInjury(game,player.id)?MATCH_INJURY_PENALTY:0));
export const matchInjuryRisk=(player,level=1)=>injuryRisk(player,90,level)/180;
function seedFor(text){let n=71;for(const c of text)n=Math.imul(n,31)+c.charCodeAt(0)|0;return n;}

// Separate random stream: a reload repeats the same minute, never a new roll.
// Only light knocks are playable. Longer complaints remain post-match events.
export function rollMatchInjuries(game){
  const p=game.pending;
  if(p?.injuryRules!==1||p.minute<1||p.minute>=90||p.abandoned?.length)return;
  const mySide=p.home===0?0:1;
  for(const [side,index] of [p.home,p.away].entries()){
    const selection=side===mySide?p.selection:p.opponentSelection;
    for(const id of selection.filter(Boolean)){
      const injuries=p.events.filter(e=>e.type==='injury'&&e.side===side);
      if(injuries.length>=2)break;
      if(injuries.some(e=>e.playerId===id))continue;
      const available=availablePlayers(game,index).filter(v=>!injuries.some(e=>e.playerId===v.id));
      const player=game.clubs[index].players.find(v=>v.id===id);
      if(available.length<=18||(player.position==='GK'&&available.filter(v=>v.position==='GK').length<=2))continue;
      const random=rng(seedFor(`knock:${game.season}:${game.round}:${p.minute}:${id}`));
      if(random()>=matchInjuryRisk(player,medicalLevel(game,index)))continue;
      p.events.push({minute:p.minute,side,type:'injury',playerId:id,player:player.name,kind:'knock',remaining:1});
      if(side===mySide)p.paused=true;
    }
  }
}

const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function matchInjuryView(game){
  const p=game.pending;if(p?.injuryRules!==1)return '';
  const side=p.home===0?0:1,injuries=p.events.filter(e=>e.type==='injury'),active=injuries.filter(e=>e.side===side&&p.selection.includes(e.playerId));
  if(!injuries.length)return '';
  return `<section class="match-injury-panel" aria-label="Wedstrijdblessures"><p class="kicker">MEDISCHE UPDATE</p><h3>${active.length?'Lichte klachten: wisselen of doorspelen?':'Blessures in deze wedstrijd'}</h3>${injuries.map(e=>`<p><b>${esc(e.player)}</b> · ${e.minute}' · Lichte tik${e.side!==side?' · tegenstander':p.selection.includes(e.playerId)?' · nog op het veld':' · van het veld'}</p>`).join('')}<p class="muted">Een lichte tik verlaagt de effectieve conditie met ${MATCH_INJURY_PENALTY} punten, tot minimaal 10%. De speler mist de volgende speeldag, ook na een wissel. Dit zijn gebeurtenissen in jouw spel.</p>${active.length?`<p class="match-feedback">${p.subs<3&&p.bench.length?'Kies hieronder de speler en een reserve, en druk op Wissel. Hervatten laat hem doorspelen met lagere conditie.':'Je hebt geen wissel meer beschikbaar. Bij hervatten blijft de speler met lagere conditie op het veld.'}</p>`:''}${active.length&&p.paused&&p.subs<3&&p.bench.length?'<button class="report-button" data-action="injury-sub">KIES WISSEL →</button>':''}</section>`;
}
