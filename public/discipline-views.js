import {suspensionFor,yellowCount,YELLOW_LIMIT} from './discipline.js';
import {availablePlayers} from './fitness.js';
import {formations} from './engine.js';
import {pitchPosition} from './pitch.js';
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const reason={red:'direct rood','second-yellow':'twee keer geel','yellow-limit':'drie losse gele kaarten'};
export function disciplineProfile(game,p){
  const record=game.management.playerStats[p.id];
  return `<p class="muted">Gele kaarten richting schorsing: ${yellowCount(game,p.id)} / ${YELLOW_LIMIT}.${record?.yellowCards!==undefined?` Carrière: ${record.yellowCards} geel · ${record.redCards} rood.`:''}</p>`;
}
export function disciplinePanel(game){
  const players=game.clubs[0].players,banned=players.filter(p=>suspensionFor(game,p.id)),risk=players.filter(p=>yellowCount(game,p.id)===YELLOW_LIMIT-1),count=availablePlayers(game).length;
  return `<section class="card"><p class="kicker">KAARTEN & SCHORSINGEN</p><h2>Wie mist de volgende speeldag?</h2>${banned.length?banned.map(p=>{const b=suspensionFor(game,p.id);return `<div class="row"><b>${esc(p.name)}</b><span class="fitness-status injured">${b.remaining} speeldag(en) · ${reason[b.reason]}</span></div>`;}).join(''):'<p class="muted">Geen geschorste spelers.</p>'}<p class="muted">${risk.length?'Op scherp (2 geel): '+risk.map(p=>esc(p.name)).join(', ')+'.':'Niemand staat op scherp.'}</p><p class="muted">Spelregels: 3 losse gele kaarten = 1 wedstrijd schorsing; twee keer geel in één duel = rood en 1 wedstrijd; direct rood = 2 wedstrijden. Schorsingen blijven staan bij een transfer en gaan mee naar het volgende seizoen. Een geschorste speler mag wel trainen.</p>${count<11?`<p class="match-feedback">${count} spelers inzetbaar. ${count<7?'Minder dan zeven: bij de aftrap volgt een reglementair verlies.':'Je kunt met minder dan elf starten. Gebruik het selectievoorstel om de beschikbare spelers op te stellen.'}</p>`:''}</section>`;
}
export function disciplineReportView(report){
  if(!report)return '';
  return `<section class="fitness-report"><h3>Kaarten na deze speeldag</h3>${report.banned.map(p=>`<p class="fitness-status injured">${esc(p.name)} · ${p.remaining} speeldag(en) geschorst wegens ${reason[p.reason]}.</p>`).join('')||'<p class="muted">Geen nieuwe schorsingen bij jouw club.</p>'}${report.served.map(name=>`<p class="muted">${esc(name)} heeft zijn schorsing uitgezeten.</p>`).join('')}</section>`;
}
export function liveDisciplineView(game){
  const p=game.pending;if(p?.disciplineRules!==1)return '';
  const side=p.home===0?0:1,roles=formations[game.tactics.formation],find=id=>game.clubs[0].players.find(v=>v.id===id);
  if(p.abandoned.length)return '<p class="match-feedback">Minder dan zeven spelers inzetbaar. Bij de aftrap wordt de reglementaire uitslag verwerkt: verlies met 0–3 (of een grotere bestaande achterstand). Bij twee onvolledige clubs: 0–0 en geen punten.</p>';
  return `<section class="card live-discipline"><p class="kicker">SPELERS OP HET VELD</p><h3>${p.selection.filter(Boolean).length} tegen ${p.opponentSelection.filter(Boolean).length}</h3><p class="muted">Na rood pauzeert de wedstrijd. Een weggestuurde speler mag niet worden vervangen. Je kunt posities verwisselen of een speler naar een lege veldpositie schuiven. Er moet iemand in het doel blijven.</p>${p.dismissed[side].length?`<p class="fitness-status injured">Rood: ${p.dismissed[side].map(id=>esc(find(id).name)).join(', ')}</p>`:''}<div class="mini-pitch live-pitch">${p.selection.map((id,i)=>`<span class="${id?'':'empty-position'}" style="${pitchPosition(game.tactics.formation,i)}">${roles[i]}<small>${id?esc(find(id).name.split(' ').at(-1))+(p.bookings[side][id]?' · 🟨':''):'LEEG'}</small></span>`).join('')}</div>${p.paused?`<form id="live-position-form" class="inline-form"><label class="field-label">Verplaats speler<select name="from">${p.selection.map((id,i)=>id?`<option value="${i}">${esc(find(id).name)} · ${roles[i]}</option>`:'').join('')}</select></label><label class="field-label">Naar positie<select name="to">${p.selection.map((id,i)=>`<option value="${i}">${roles[i]} · ${id?esc(find(id).name):'Lege plek'}</option>`).join('')}</select></label><button class="report-button">PAS POSITIES AAN</button></form>`:''}</section>`;
}
export function forfeitReport(match){
  return match.forfeit?.length?`<p class="match-feedback">Reglementaire uitslag wegens minder dan zeven spelers: ${match.goals.join('–')}. Speelscore bij stoppen: ${match.detail.stats.map(s=>s.goals).join('–')}.${match.forfeit.length===2?' Beide clubs krijgen geen punten.':''} Speelminuten en schotcijfers tellen alleen de gespeelde tijd.</p>`:'';
}
