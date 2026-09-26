import {suspensionFor} from './discipline.js';
import {formations} from './engine.js';
import {injuryFor,injuryTypes,availablePlayers,unavailableSelection,medicalLevel} from './fitness.js';
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function statusLabel(game,p){const injury=injuryFor(game,p.id);const ban=suspensionFor(game,p.id);return ban?'Geschorst · '+ban.remaining+' speeldag(en)'+(injury?' · ook geblesseerd':''):injury?`${injuryTypes[injury.kind].label} · ${injury.remaining} speeldag(en)`:`${p.fitness}% conditie`;}
export function statusBadge(game,p){return `<small class="fitness-status ${(injuryFor(game,p.id)||suspensionFor(game,p.id))?'injured':p.fitness<70?'tired':''}">${esc(statusLabel(game,p))}</small>`;}
export function availabilityWarning(game){
  const ids=unavailableSelection(game);
  return ids.length?`<p class="match-feedback" role="status">${ids.length} ${ids.some(id=>suspensionFor(game,id))?'niet-inzetbare speler(s)':'geblesseerde speler(s)'} in je wedstrijdselectie. Vervang ze vóór de aftrap: ${ids.map(id=>esc(game.clubs[0].players.find(p=>p.id===id).name)).join(', ')}. <button class="report-button" data-tab="squad">NAAR SELECTIE →</button></p>`:'';
}
export function fitnessPanel(game,proposal=null){
  const club=game.clubs[0],injured=club.players.filter(p=>injuryFor(game,p.id)),available=availablePlayers(game),tired=available.filter(p=>p.fitness<70),level=medicalLevel(game);
  return `<section class="card fitness-panel"><div class="card-head"><div><p class="kicker">BELASTING & HERSTEL</p><h2>Wie is inzetbaar?</h2></div><span class="fitness-count">${available.length} / ${club.players.length}</span></div><p class="muted">${injured.length} geblesseerd · ${tired.length} inzetbare spelers onder 70% conditie · herstelcentrum niveau ${level}.</p>${availabilityWarning(game)}
  ${injured.length?`<div class="injury-list">${injured.map(p=>`<div class="row"><b>${esc(p.name)}</b>${statusBadge(game,p)}</div>`).join('')}</div>`:'<p class="muted">Geen blessures in jouw selectie.</p>'}
  <p class="muted">Lichte klachten kunnen tijdens nieuwe wedstrijden ontstaan, met een coachpauze en een wisselkeuze. Andere spelblessures worden na afloop vastgesteld; dit zijn geen berichten over echte spelers. Na iedere speeldag herstel je één dag. Hersteltraining verbetert conditie, maar maakt een geblesseerde speler niet direct inzetbaar.</p>
  <details class="recovery-rules"><summary>Herstel en het medische niveau</summary><p class="muted">Na een nieuwe wedstrijd: ${12+2*(level-1)} conditie erbij voor gebruikte spelers, ${18+2*(level-1)} voor reserves. Een hoger medisch niveau verlaagt het spelblessurerisico met 12% per stap. Vanaf niveau 3 wordt de uitval één speeldag korter; vanaf niveau 5 twee, met minimaal één gemiste speeldag. Na seizoensrust is iedereen hersteld en heeft iedereen 100% conditie.</p></details>
  <button class="report-button" data-fitness="preview" ${game.pending?'disabled':''}>STEL FIT ELFTAL VOOR</button><p class="muted">Een voorstel weegt positie, kwaliteit en conditie. Je ziet eerst de basiself, bank en aanvoerder. Pas na toepassen wordt je opstelling opgeslagen. Contracten worden afzonderlijk gecontroleerd bij de aftrap.</p>
  ${proposal?proposalView(game,proposal):''}</section>`;
}
function proposalView(game,proposal){
  const player=id=>game.clubs[0].players.find(p=>p.id===id),changed=proposal.lineupIds.filter((id,i)=>id!==game.lineupIds[i]).length;
  return `<section class="backup-preview" aria-label="Voorstel fit elftal"><h3>Voorstel · ${game.tactics.formation}</h3><p class="muted">${changed} gewijzigde basisplaatsen. Geblesseerden en geschorsten worden overgeslagen. Aanvoerder: ${esc(player(proposal.captainId)?.name||'Geen')}.</p><div class="fitness-proposal"><div><h4>Basiself</h4>${proposal.lineupIds.map((id,i)=>`<div class="row"><span><small class="position">${formations[game.tactics.formation][i]}</small> ${esc(player(id)?.name||'Lege plek')}</span><b>${player(id)?player(id).fitness+'%':'—'}</b></div>`).join('')}</div><div><h4>Wisselbank</h4>${proposal.benchIds.map(id=>`<div class="row"><span>${esc(player(id)?.name||'Lege plek')}</span><b>${player(id)?player(id).fitness+'%':'—'}</b></div>`).join('')}</div></div><div class="backup-actions"><button class="primary" data-fitness="apply" ${game.pending?'disabled':''}>PAS VOORSTEL TOE</button><button class="report-button" data-fitness="cancel">ANNULEREN</button></div></section>`;
}
export function fitnessReport(report){
  if(!report)return '';
  return `<section class="fitness-report"><h3>Na de wedstrijd</h3><p class="muted">Rust tussen speeldagen is verwerkt voor alle clubs.</p>${report.injured.length?report.injured.map(p=>`<p class="fitness-status injured">${esc(p.name)}: ${injuryTypes[p.kind].label.toLowerCase()} in het spel · ${p.remaining} speeldag(en) uit.</p>`).join(''):'<p class="muted">Geen nieuwe spelblessures bij jouw club.</p>'}${report.recovered.map(name=>`<p class="muted">${esc(name)} is weer inzetbaar.</p>`).join('')}</section>`;
}
