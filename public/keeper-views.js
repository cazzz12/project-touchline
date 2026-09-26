import {keeperAttributes,keeperSkills,keeperRating} from './keepers.js';
import {injuryFor} from './fitness.js';
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const savesLabel=n=>`${n} ${n===1?'redding':'reddingen'}`;
export function keeperProfile(p,stats){
  if(p.position!=='GK')return '';
  const skills=keeperAttributes(p),record=stats?.keeping;
  return `<h3>Keeperkwaliteiten · ${Math.round(keeperRating(p))}</h3><p class="muted">Gegenereerde spelwaarden. Reflexen, balvastheid en positionering bepalen samen met conditie en moraal hoe goed deze keeper schoten stopt.</p><div class="profile-stats">${Object.entries(keeperSkills).map(([key,label])=>`<span>${label}<b>${skills[key]}</b></span>`).join('')}</div>${record?`<p class="muted">Als keeper: ${savesLabel(record.saves)} · ${record.conceded} tegen · ${record.cleanSheets} keer de nul gehouden.</p>`:''}`;
}
export function keeperTraining(game){
  const keepers=game.clubs[0].players.filter(p=>p.position==='GK'&&!injuryFor(game,p.id)),used=game.management.developmentUsed;
  return `<section class="card"><p class="kicker">KEEPERTRAINING</p><h2>Scherper onder de lat</h2><p class="muted">Dit gebruikt dezelfde individuele sessie als hierboven: kies per speeldag één speler en één vaardigheid. +${game.management.facilities.training+game.management.staff.coach} punt(en), maximaal 99, en −3 conditie. Nieuwe vaardigheden tellen mee vanaf je volgende aftrap.</p><form id="keeper-development-form" class="inline-form"><label class="field-label">Keeper<select name="playerId">${keepers.map(p=>`<option value="${p.id}">${esc(p.name)} · keeper ${Math.round(keeperRating(p))}</option>`).join('')}</select></label><label class="field-label">Keepervaardigheid<select name="attribute">${Object.entries(keeperSkills).map(([key,label])=>`<option value="${key}">${label}</option>`).join('')}</select></label><button class="primary" ${used||game.pending||!keepers.length?'disabled':''}>${used?'SESSIE GEBRUIKT':'TRAIN DEZE KEEPER'}</button></form></section>`;
}
export function keeperReportView(detail){
  if(detail.keeperRules!==1)return '';
  return `<section class="card"><p class="kicker">ONDER DE LAT</p><h3>Keeperprestaties</h3>${detail.keeping.map((rows,side)=>`<h4>${esc(detail.clubs[side])}</h4>${rows.map(p=>`<div class="row"><span>${esc(p.name)}<small class="cell-note">${p.minutes} minuten${p.cleanSheet?' · Nul gehouden':''}</small></span><span>${savesLabel(p.saves)} · ${p.conceded} tegen</span></div>`).join('')}`).join('')}<p class="muted">De nul telt vanaf 60 minuten als keeper zonder tegengoal tijdens die minuten. Een keeperwissel verdeelt de statistieken over beide spelers.</p></section>`;
}
export function keeperCareerView(game){
  const keepers=Object.values(game.management.playerStats).filter(p=>p.keeping).sort((a,b)=>b.keeping.cleanSheets-a.keeping.cleanSheets||b.keeping.saves-a.keeping.saves);
  return `<section class="card"><p class="kicker">KEEPERSCARRIÈRES</p><h2>Reddingen & de nul</h2><p class="muted">Alle zes clubs. Alleen wedstrijden met de nieuwe keeperregels tellen mee. De nul telt vanaf 60 minuten als keeper zonder tegengoal tijdens die minuten. Reddingspercentage: gestopte schoten gedeeld door schoten op doel tegen.</p><div class="table-scroll"><table><thead><tr><th>SPELER</th><th>DUELS</th><th>REDDINGEN</th><th>TEGEN</th><th>REDDING %</th><th>DE NUL</th></tr></thead><tbody>${keepers.map(p=>{const k=p.keeping,total=k.saves+k.conceded;return `<tr><td>${esc(p.name)}<small class="cell-note">${esc(p.clubs.join(' → '))}</small></td><td>${k.appearances}</td><td>${k.saves}</td><td>${k.conceded}</td><td>${total?Math.round(k.saves/total*100)+'%':'—'}</td><td>${k.cleanSheets}</td></tr>`;}).join('')||'<tr><td colspan="6">Speel een nieuwe wedstrijd om keeperstatistieken op te bouwen.</td></tr>'}</tbody></table></div></section>`;
}
