import { createClubs, formations, simulate } from './engine.js';
const $ = id => document.getElementById(id);
const clubs = createClubs(42);
let last;
function controls(index) {
  const id = index ? 'away' : 'home';
  $(id).innerHTML = `<div class="club ${id}"><small>${index ? 'AWAY' : 'HOME'} CLUB</small><h3>${clubs[index].name}</h3><div class="control"><label for="${id}-formation">Formation</label><select id="${id}-formation">${Object.keys(formations).map(f=>`<option>${f}</option>`).join('')}</select></div>${['mentality','pressing','tempo'].map(k=>`<div class="control"><label for="${id}-${k}">${k[0].toUpperCase()+k.slice(1)}</label><input id="${id}-${k}" type="range" min="0" max="100" value="50"><output>50</output></div>`).join('')}</div>`;
  $(id).querySelectorAll('input[type=range]').forEach(input => input.addEventListener('input',()=>input.nextElementSibling.value=input.value));
}
controls(0); controls(1);
function tactics(id) { return { formation:$(`${id}-formation`).value, mentality:Number($(`${id}-mentality`).value), pressing:Number($(`${id}-pressing`).value), tempo:Number($(`${id}-tempo`).value) }; }
function render() {
  const seed = Number($('seed').value);
  if (!Number.isSafeInteger(seed) || seed < 0) { alert('Enter a nonnegative whole number for the match seed.'); return; }
  last = simulate({ seed, clubs, homeTactics:tactics('home'), awayTactics:tactics('away') });
  $('results').hidden = false;
  $('scoreline').innerHTML = `${last.clubs[0]} <strong>${last.stats[0].goals} : ${last.stats[1].goals}</strong> ${last.clubs[1]}`;
  $('summary').textContent = `${last.events.length} chances created · Match seed ${last.seed}`;
  const labels = [['possession','Possession','%'],['shots','Shots',''],['onTarget','On target',''],['xg','Expected goals',''],['passAccuracy','Pass accuracy','%'],['fouls','Fouls','']];
  $('stats').innerHTML = labels.map(([key,label,suffix])=>`<div class="stat"><span>${last.stats[0][key]}${suffix}</span><span>${label}</span><span>${last.stats[1][key]}${suffix}</span></div>`).join('');
  $('feed').innerHTML = last.events.length ? last.events.map(e=>`<div class="event ${e.type}"><b>${e.minute}'</b> ${e.type === 'goal' ? 'GOAL' : e.type === 'save' ? 'Shot saved' : 'Shot wide'} · ${e.player}<br><small>${last.clubs[e.side]} · ${e.xg} xG</small></div>`).join('') : '<p class="empty">No clear chances in this match.</p>';
  $('squads').innerHTML = last.teams.map((team,i)=>`<div><h3>${last.clubs[i]}</h3>${team.map((p,n)=>`<p>${n+1}. ${p.name} · ${p.position} · ${p.fitness}% fitness</p>`).join('')}</div>`).join('');
  $('results').scrollIntoView({behavior:'smooth'});
}
$('run').addEventListener('click',render);
$('copy').addEventListener('click',async()=>{ if (!last) return; await navigator.clipboard.writeText(JSON.stringify({seed:last.seed,clubSeed:42,homeTactics:last.tactics[0],awayTactics:last.tactics[1]},null,2)); $('copy').textContent='COPIED'; });
