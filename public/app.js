import {leagueMarketView,leagueMarketNotice} from './league-market-views.js';
import {setScoutingCriteria,defaultCriteria,addToShortlist,removeFromShortlist} from './scouting-state.js';
import {compareCandidate} from './scouting.js';
import {scoutingDeskView,scoutingReportView} from './scouting-views.js';
import {setDevelopmentPlan,stopDevelopmentPlan,skillsFor} from './development.js';
import {reputationReportView} from './reputation-views.js';
import {chooseTicketPrice} from './stadium.js';
import {stadiumReportView} from './stadium-views.js';
import {inboxMessages,inboxCategories,visibleInbox,markInboxRead} from './inbox.js';
import {inboxView,inboxNotice} from './inbox-views.js';
import {developmentView,developmentProfile,developmentReportView,trainingTabs} from './development-views.js';
import {trainAccordingToPlan} from './management.js';
import {incomingTransfersView,incomingNotice,incomingCount} from './club-market-views.js';
import {rejectIncomingOffer,incomingSaleReason} from './club-market.js';
import {acceptIncomingOffer} from './game.js';
import {disciplineProfile,disciplinePanel,disciplineReportView,liveDisciplineView,forfeitReport} from './discipline-views.js';
import {clubTransfersView,transferTabs} from './transfer-views.js';
import {submitClubBid,cancelClubBid,confirmClubPurchase} from './transfers.js';
import {moveLivePlayer} from './game.js';
import {suspensionFor} from './discipline.js';
import {unavailablePlayer} from './fitness.js';
import {keeperProfile,keeperTraining,keeperReportView,keeperCareerView} from './keeper-views.js';
import {injuryFor,unavailableSelection,recommendedSquad,applyRecommendedSquad} from './fitness.js';
import {fitnessPanel,statusLabel,statusBadge,fitnessReport} from './fitness-views.js';
import {officeView, careerView, prematchView, developmentPanel, tacticPresets} from './management-views.js';
import {upgradeClub, chooseSponsor, renewContract, renewExpiring, developPlayer, saleOffer, scoutingCost} from './management.js';
import {sellPlayer} from './game.js';
import { formations, lineUp } from './engine.js';
import { pitchPosition } from './pitch.js';
import { clubInfo, roleLabels, rosterDate, ROSTER_VERSION } from './clubs.js';
import { updateClubRosters } from './game.js';
import { MAX_BACKUP_BYTES, RECOVERY_KEY, exportBackup, parseBackup, readStoredGame, restoreBackup, writeGame } from './storage.js';
import { KEY, clubNames, cost, advanceMatch, beginMatch, matchFitness, prepareSquad, setBench, setCaptain, makeSubstitution, newGame, newSeason, nextFixture, rating, schedule, scout, setStarter, signPlayer, standings, train } from './game.js';
const $=s=>document.querySelector(s), money=n=>Number(n).toLocaleString('nl-NL');
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const storage={getItem:key=>localStorage.getItem(key),setItem:(key,value)=>localStorage.setItem(key,value)};
const loaded=readStoredGame(storage);
let game=loaded.game,storageError=loaded.error,unreadableRaw=loaded.error?loaded.raw:null;
let tab='overview',message='',timer=null,speed=600,backupCandidate=null,importSequence=0;
let selectedClub=0,playerSearch='',roleFilter='all',officeSection='finances',saleCandidate=null,fitnessProposal=null;
let trainingSection='team',developmentPlayer=null,developmentAttribute=null;
let incomingCandidate=null,scoutingComparison=null;
let journalFilters={club:'all',period:'season'};
let inboxFilters={status:'all',category:'all'};
let transferSection='clubs',transferFilters={seller:1,role:'all',search:''},bidCandidate=null;
function transfers(){return transferSection==='scouting'?scouting():shell(transferSection==='journal'?leagueMarketView(game,journalFilters):transferSection==='incoming'?incomingTransfersView(game,incomingCandidate):['search','shortlist'].includes(transferSection)?scoutingDeskView(game,transferSection,scoutingComparison):clubTransfersView(game,transferFilters,bidCandidate,scoutingComparison),'Scouting & transfers','BOUW AAN JE SELECTIE');}
const positionLabel=position=>roleLabels[position]||position;
function clubLogo(name,size='small'){
  const info=clubInfo(name);
  return info?`<img class="club-logo logo-${size}" src="/assets/clubs/${info.slug}.${info.slug==='feyenoord'?'png':'svg'}" alt="Logo ${esc(name)}" width="64" height="64">`:'';
}
function rosterNote(){return game.rosterVersion?`Startselecties gecontroleerd op ${rosterDate}. Transfers in je carrière kunnen daarvan afwijken. Ratings en conditie zijn spelwaarden.`:'Deze oudere carrière heeft nog de fictieve clubindeling. Via Voortgang kun je de echte clubselecties toevoegen.';}
function storageNotice(){return storageError?`<div class="storage-warning" role="alert"><b>Let op je voortgang</b><p>${esc(storageError)}</p><button class="report-button" data-action="open-backups">NAAR VOORTGANG</button></div>`:'';}
function save(){
  if(writeGame(storage,game)){storageError='';unreadableRaw=null;const notice=$('#storage-status');if(notice)notice.innerHTML='';return true;}
  clearInterval(timer);if(game.pending)game.pending.paused=true;
  storageError='Opslaan is niet gelukt. Je voortgang staat nog in dit scherm. Download een backup voordat je de pagina sluit.';
  const notice=$('#storage-status');if(notice)notice.innerHTML=storageNotice();
  return false;
}
const tabs={overview:['◈','Overzicht'],inbox:['✉','Postvak'],squad:['♟','Selectie'],clubs:['⚑','Clubs'],prematch:['▷','Voorbeschouwing'],tactics:['◎','Tactiek'],training:['↗','Training'],transfers:['◇','Scouting & transfers'],league:['▤','Competitie'],cluboffice:['▧','Clubzaken'],career:['★','Carrière'],progress:['↓','Voortgang']};

function careerSummary(career){return `<dl class="save-summary"><div><dt>Club</dt><dd>${esc(career.clubs[0].name)}</dd></div><div><dt>Seizoen</dt><dd>${career.season||1}</dd></div><div><dt>Gespeeld</dt><dd>${career.round} / 10 wedstrijden</dd></div><div><dt>Clubkas</dt><dd>${money(career.credits)} credits</dd></div><div><dt>Selectie</dt><dd>${career.clubs[0].players.length} spelers</dd></div><div><dt>Wedstrijd</dt><dd>${career.pending?`Gepauzeerd op ${career.pending.minute}′`:'Geen lopende wedstrijd'}</dd></div></dl>`;}
function backupPanel(){
  const recovery=readStoredGame(storage,RECOVERY_KEY);
  return `<section class="card backup-panel"><p class="kicker">BEWAAR JE CARRIÈRE</p><h2>Jouw voortgang</h2><p class="muted">Je carrière wordt automatisch in deze browser opgeslagen. Met een backup kun je je club ook in een andere browser terugzetten.</p>${game?careerSummary(game):''}<div class="backup-actions">${game?'<button class="primary" data-action="export-save">BACKUP DOWNLOADEN</button>':''}${storageError&&game?'<button class="report-button" data-action="retry-save">OPNIEUW OPSLAAN</button>':''}${unreadableRaw!==null?'<button class="report-button" data-action="export-original">OORSPRONKELIJKE SAVE DOWNLOADEN</button>':''}</div><label class="backup-file">Backup kiezen<input type="file" data-import-save accept=".json,application/json" aria-label="Backup kiezen"></label><p class="muted">Kies een Touchline-bestand (.json, maximaal 2 MB). Je krijgt eerst een voorbeeld. Er verandert niets totdat je bevestigt.</p>${message?`<p role="status" class="match-feedback">${esc(message)}</p>`:''}${backupCandidate?`<section class="backup-preview" aria-label="Voorbeeld van backup"><h3>${game?'Huidige carrière vervangen?':'Deze carrière terugzetten?'}</h3>${careerSummary(backupCandidate)}<p class="muted">${game?'Je huidige carrière wordt apart bewaard. Via ‘Vorige save terugzetten’ kun je de vervanging ongedaan maken.':'De bestaande browsergegevens worden eerst apart bewaard.'} Een lopende wedstrijd blijft gepauzeerd.</p><div class="backup-actions"><button class="primary" data-action="confirm-import">${game?'VERVANG MIJN CARRIÈRE':'ZET CARRIÈRE TERUG'}</button><button class="report-button" data-action="cancel-import">ANNULEREN</button></div></section>`:''}${recovery.game?'<button class="report-button" data-action="preview-recovery">VORIGE SAVE TERUGZETTEN</button>':recovery.raw!==null?'<button class="report-button" data-action="export-recovery">VORIGE SAVE DOWNLOADEN</button>':''}</section>`;
}
function rosterPanel(){return `<section class="card"><p class="kicker">CLUBSELECTIES · ${rosterDate.toUpperCase()}</p><h2>${game.rosterVersion===ROSTER_VERSION?'Je selecties zijn bijgewerkt':'Echte selecties toevoegen'}</h2><p class="muted">${game.rosterVersion===ROSTER_VERSION?'Je carrière begon met de clubselecties uit deze momentopname. Trainingen en transfers veranderen jouw eigen voetbalwereld.':'Vervang de spelers van alle zes clubs door de gecontroleerde selecties. Basiself, wisselbank, aanvoerder en spelerswaarden worden opnieuw ingesteld; openstaande transferaanbiedingen vervallen. Je seizoen, uitslagen, credits, tactiek en gebruikte trainingssessie blijven bewaard. Eerst bewaren we je huidige carrière als vorige save.'}</p>${game.rosterVersion!==ROSTER_VERSION?`<button class="primary" data-action="update-rosters" ${game.pending?'disabled':''}>SELECTIES BIJWERKEN</button>${game.pending?'<p class="muted">Rond eerst je lopende wedstrijd af.</p>':''}`:'<button class="report-button" data-tab="clubs">BEKIJK DE CLUBS →</button>'}</section>`;}
function progress(){return shell(rosterPanel()+backupPanel(),'Voortgang & backup','JOUW CLUB BLIJFT VAN JOU');}
function clubRoster(){
  const players=game.clubs[selectedClub].players.filter(p=>(roleFilter==='all'||p.position===roleFilter)&&p.name.toLocaleLowerCase('nl-NL').includes(playerSearch.toLocaleLowerCase('nl-NL')));
  return `<p class="muted" role="status">${players.length} ${players.length===1?'speler':'spelers'}${playerSearch||roleFilter!=='all'?' gevonden':''}</p><div class="club-players">${players.map(p=>`<details class="player-profile"><summary><span class="shirt-number">${p.number??'—'}</span><span><b>${esc(p.name)}</b><small>${positionLabel(p.position)}</small></span><span class="position" title="Gegenereerde rating">${rating(p)}</span></summary><div class="profile-body">${statusBadge(game,p)}${keeperProfile(p,game.management.playerStats[p.id])}${disciplineProfile(game,p)}${developmentProfile(game,p)}${game.management.playerStats[p.id]?`<p class="muted">Carrière in Touchline: ${game.management.playerStats[p.id].appearances} duels · ${game.management.playerStats[p.id].minutes} minuten · ${game.management.playerStats[p.id].goals} goals</p>`:''}<p class="muted">Spelwaarden in jouw carrière · ${p.age===null?'leeftijd niet opgenomen':`leeftijd circa ${p.age}`}</p><div class="profile-stats">${[['Aanval',p.attack],['Passing',p.passing],['Verdediging',p.defending],['Snelheid',p.pace],['Afwerking',p.finishing],['Kalmte',p.composure],['Uithoudingsvermogen',p.stamina],['Conditie',p.fitness],['Moraal',p.morale]].map(([label,value])=>`<span>${label}<b>${value}</b></span>`).join('')}</div></div></details>`).join('')||'<p class="muted">Geen spelers gevonden. Pas je zoekopdracht of positie aan.</p>'}</div>`;
}
function clubs(){
  const club=game.clubs[selectedClub],info=clubInfo(club.name);
  return shell(`<div class="intro"><h2>Zes clubs, hun eigen spelers</h2><p>Kies een club en open een speler om zijn spelwaarden te bekijken.</p></div><div class="club-grid">${game.clubs.map((c,index)=>`<button class="club-card ${selectedClub===index?'active':''}" data-club="${index}" aria-pressed="${selectedClub===index}">${clubLogo(c.name,'medium')}<b>${esc(c.name)}</b><small>${c.players.length} spelers${index===0?' · jouw club':''}</small></button>`).join('')}</div><section class="card"><div class="club-heading">${clubLogo(club.name,'medium')}<div><p class="kicker">${selectedClub===0?'JOUW SELECTIE':'TEGENSTANDER'}</p><h2>${esc(club.name)}</h2></div></div><p class="muted">${rosterNote()} Posities uit de clubbron zijn breed: keeper, verdediger, middenvelder of aanvaller. Rugnummers horen bij de bronselectie.</p><a class="source-link" href="${info.source}" target="_blank" rel="noopener noreferrer">Officiële selectie van ${esc(club.name)} ↗</a><div class="roster-filters"><label>Zoek een speler<input type="search" data-player-search value="${esc(playerSearch)}" placeholder="Naam van speler"></label><label>Positie<select data-role-filter><option value="all">Alle posities</option>${[...new Set(club.players.map(p=>p.position))].map(pos=>`<option value="${pos}" ${roleFilter===pos?'selected':''}>${positionLabel(pos)}</option>`).join('')}</select></label></div><div id="club-roster">${clubRoster()}</div></section>`,'Clubs & spelers','DE GEZICHTEN VAN DE COMPETITIE');
}
function cluboffice(){return shell(officeView(game,officeSection,saleCandidate),'Clubzaken','BOUW JE CLUB VERDER UIT');}
function inbox(){return shell(inboxView(game,inboxFilters),'Postvak','JE CLUB OP ORDE');}
function career(){return shell(careerView(game)+keeperCareerView(game),'Jouw carrière','ELK SEIZOEN TELT');}
function prematch(){return shell(prematchView(game),'Voorbeschouwing','KEN JE TEGENSTANDER');}
function downloadBackup(raw,filename){
  const url=URL.createObjectURL(new Blob([raw],{type:'application/json'}));
  const link=document.createElement('a');link.href=url;link.download=filename;
  document.body.appendChild(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function backupAction(action){
  if(action==='open-backups'){hideMatch=true;tab='progress';message='';render();return true;}
  if(action==='export-save'&&game){
    const club=game.clubs[0].name.replace(/[^a-z0-9]+/gi,'-').toLowerCase();
    downloadBackup(exportBackup(game),`touchline-${club}-${new Date().toISOString().slice(0,10)}.json`);
    message='Backup klaargezet als download.';render();return true;
  }
  if(action==='export-original'&&unreadableRaw!==null){downloadBackup(unreadableRaw,'touchline-oorspronkelijke-save.json');return true;}
  if(action==='export-recovery'){
    const previous=readStoredGame(storage,RECOVERY_KEY);if(previous.raw!==null)downloadBackup(previous.raw,'touchline-vorige-save.json');return true;
  }
  if(action==='retry-save'&&game){message=save()?'Voortgang opgeslagen.':'Opslaan lukt nog niet. Download een backup.';render();return true;}
  if(action==='cancel-import'){importSequence++;backupCandidate=null;message='Terugzetten geannuleerd. Je carrière is niet veranderd.';render();return true;}
  if(action==='preview-recovery'){
    importSequence++;const previous=readStoredGame(storage,RECOVERY_KEY);backupCandidate=previous.game;
    message=previous.error||'Controleer de vorige save voordat je bevestigt.';render();return true;
  }
  if(action==='confirm-import'&&backupCandidate){
    try{
      const restored=restoreBackup(storage,backupCandidate,game);
      clearInterval(timer);game=restored;saleCandidate=null;fitnessProposal=null;bidCandidate=null;incomingCandidate=null;scoutingComparison=null;backupCandidate=null;importSequence++;storageError='';unreadableRaw=null;
      hideMatch=true;tab='progress';message='Carrière teruggezet. Je kunt verder spelen via Overzicht.';
    }catch{message='Terugzetten is niet gelukt. Je huidige carrière is behouden. Controleer of browseropslag beschikbaar is.';}
    render();return true;
  }
  return false;
}
function newClub(){return `<div class="create"><div class="create-visual"><div class="onboarding-clubs">${clubNames.map(name=>clubLogo(name,'medium')).join('')}</div><h2>JOUW CLUB.<br>JOUW VERHAAL.</h2></div><form id="create-form" class="create-form"><div class="brand">◈ TOUCHLINE <small>MANAGER</small></div><p class="kicker">JOUW VERHAAL BEGINT HIER</p><h1>Kies een club.<br><em>Schrijf geschiedenis.</em></h1><p class="muted">Speel een fictieve minicompetitie met bestaande clubs en echte spelersnamen. Clubselecties zijn gecontroleerd op 25 september 2026. Ratings, opstellingen en wedstrijdresultaten zijn spelwaarden.</p><label>KIES EEN CLUB<select name="name">${clubNames.map(name=>`<option value="${esc(name)}">${esc(name)}</option>`).join('')}</select></label><label>KLEUR VAN JE INTERFACE</label><div class="colors">${['#c5ff70','#79b8ff','#ff8672','#e2b8ff','#ffda72'].map((c,i)=>`<label><input type="radio" name="color" value="${c}" ${i?'':'checked'}><span style="--choice:${c}"></span></label>`).join('')}</div><button class="primary">START MIJN CARRIÈRE ↗</button><small class="muted">Eigen clubs komen later in een privéruimte met vrienden · Offline prototype</small></form></div>`;}
function shell(content,title,eyebrow){const unread=inboxMessages(game).filter(m=>!m.read).length;return `<div class="shell"><aside class="sidebar"><div class="brand">◈ TOUCHLINE <small>MANAGER</small></div><p class="season">● &nbsp; SEIZOEN ${game.season||1} · MINI LEAGUE</p><nav>${Object.entries(tabs).map(([key,[icon,label]])=>`<button data-tab="${key}" class="nav ${tab===key?'selected':''}"><span>${icon}</span> ${label}${key==='inbox'&&unread?` <b class="inbox-badge" aria-label="${unread} ongelezen">${unread}</b>`:''}</button>`).join('')}</nav><div class="manager">${clubLogo(game.clubs[0].name)}<div><b>${esc(game.clubs[0].name)}</b><small>CLUBMANAGER</small></div></div></aside><main><header><div><p class="kicker">${eyebrow}</p><h1>${title}</h1></div><div class="wallet"><span>◈</span><div><small>CLUBKAS</small><b>${money(game.credits)}</b></div></div></header>${content}<footer>TOUCHLINE · OFFLINE PROTOTYPE · GEEN ECHT GELD OF WALLET</footer></main></div>${message&&tab!=='progress'?`<div class="toast">${esc(message)}</div>`:''}`;}
function overview(){const fixture=nextFixture(game),other=fixture?game.clubs[fixture[0]===0?fixture[1]:fixture[0]]:null,row=standings(game).find(r=>r.i===0),place=standings(game).findIndex(r=>r.i===0)+1;return shell(`<section class="hero"><div><p class="kicker">SPEELDAG ${Math.min(game.round+1,10)} / 10 · MINI LEAGUE</p><h2>${fixture?'De volgende wedstrijd wacht.':'Seizoen voltooid.'}<br><em>${fixture?'Laat je tactiek spreken.':'Op naar de volgende ronde.'}</em></h2><p>${fixture?`Je speelt ${fixture[0]===0?'thuis tegen':'uit bij'} ${esc(other.name)}. Bereid je selectie voor.`:'Bekijk de eindstand en begin een nieuw seizoen met dezelfde club.'}</p><button class="primary" data-action="${fixture?'play':'season'}">${game.pending?'HERVAT WEDSTRIJD':fixture?'SPEEL WEDSTRIJD':'START NIEUW SEIZOEN'} &nbsp; ↗</button>${game.lastMatch?'<button class="report-button" data-action="report">LAATSTE WEDSTRIJDVERSLAG →</button>':''}<button class="report-button" data-tab="prematch">VOORBESCHOUWING & AUTO-INSTRUCTIES →</button></div><div class="hero-club">${clubLogo(game.clubs[0].name,'large')}</div></section>${inboxNotice(game)}${incomingNotice(game)}${leagueMarketNotice(game)}<div class="tiles"><div class="tile"><small>COMPETITIEPOSITIE</small><strong>#${place}<i> / 6</i></strong><span>${game.round} van 10 wedstrijden</span></div><div class="tile"><small>PUNTEN</small><strong>${row.pts}<i> PTS</i></strong><span>Elke wedstrijd telt</span></div><div class="tile"><small>TEGENSTANDER</small><strong class="short">${fixture?esc(other.name):'—'}</strong><span>Speeldag ${Math.min(game.round+1,10)}</span></div><div class="tile"><small>SELECTIE</small><strong>${game.clubs[0].players.length}<i> SPELERS</i></strong><span>${game.lineupIds.filter(Boolean).length} basis · ${game.benchIds.length} wissels</span></div></div><div class="columns"><section class="card"><div class="card-head"><div><p class="kicker">ROAD TO GLORY</p><h3>Laatste uitslagen</h3></div><button class="link" data-tab="league">Ranglijst →</button></div>${game.results.filter(r=>r.home===0||r.away===0).slice(-4).reverse().map(r=>`<div class="row"><span>${esc(game.clubs[r.home===0?r.away:r.home].name)}</span><b>${r.goals[0]} – ${r.goals[1]}</b></div>`).join('')||'<p class="muted">Nog geen wedstrijden gespeeld. De aftrap is aan jou.</p>'}</section><section class="card"><p class="kicker">CLUBNIEUWS</p><h3>In de kleedkamer</h3>${game.news.slice(0,4).map(n=>`<div class="news">↗ &nbsp; ${esc(n)}</div>`).join('')}</section></div>`,'Jouw dug-out','HET SPEL BEGINT HIER');}
function squad(){const club=game.clubs[0],ids=game.lineupIds?.length===11?game.lineupIds:lineUp(club,game.tactics.formation).map(p=>p.id),xi=ids.map(id=>club.players.find(p=>p.id===id)||{id:null,name:'Lege plek',position:'—'}),selected=new Set(ids),players=[...club.players].sort((a,b)=>Number(selected.has(b.id))-Number(selected.has(a.id))||rating(b)-rating(a));return shell(`<div class="intro"><h2>Jouw basiself</h2><p>Kies zelf elf spelers. Positie, kwaliteit en conditie bepalen hun effect in de wedstrijd.</p></div>${fitnessPanel(game,fitnessProposal)}${disciplinePanel(game)}<div class="squad-grid"><div class="pitch"><div class="pitch-circle"></div><div class="pitch-box"></div><div class="pitch-players">${xi.map((p,i)=>`<div class="pitch-player ${unavailablePlayer(game,p.id)?'unavailable':''}" style="${pitchPosition(game.tactics.formation,i)}" title="${esc(p.name)} · eigen positie ${p.position}"><span>${formations[game.tactics.formation][i]}</span><b>${esc(p.name.split(' ').at(-1))}${game.captainId&&game.captainId===p.id?' Ⓒ':''}</b></div>`).join('')}</div></div><div class="card"><p class="kicker">STARTING XI · ${game.tactics.formation}</p><h3>Kies je opstelling</h3><p class="muted">Elke positie heeft een eigen speler. Kies iemand van de bank om te wisselen.</p>${xi.map((p,i)=>`<div class="player-line"><span class="position">${formations[game.tactics.formation][i]}</span><select data-slot="${i}" aria-label="Speler voor ${formations[game.tactics.formation][i]}" ${game.pending?'disabled':''}>${!p.id?'<option value="" selected>Lege plek</option>':''}${club.players.filter(candidate=>candidate.id===p.id||!selected.has(candidate.id)).sort((a,b)=>rating(b)-rating(a)).map(candidate=>`<option value="${esc(candidate.id)}" ${candidate.id===p.id?'selected':''} ${unavailablePlayer(game,candidate.id)?'disabled':''}>${esc(candidate.name)} · ${candidate.position} · ${rating(candidate)} · ${statusLabel(game,candidate)}</option>`).join('')}</select></div>`).join('')}</div></div><section class="card matchday-selection"><p class="kicker">WEDSTRIJDSELECTIE</p><h3>Aanvoerder & wisselbank</h3><p class="muted">Neem maximaal zeven inzetbare reserves mee. Alleen deze spelers mogen invallen. De aanvoerder draagt de band; dit geeft nog geen statistiekbonus.</p><label class="captain-label">AANVOERDER<select data-captain aria-label="Aanvoerder">${xi.filter(p=>p.id).map(p=>`<option value="${p.id}" ${game.captainId===p.id?'selected':''}>${esc(p.name)}</option>`).join('')}</select></label><div class="bench-grid">${game.benchIds.map((id,i)=>`<label>WISSEL ${i+1}<select data-bench="${i}" aria-label="Wisselspeler ${i+1}" ${game.pending?'disabled':''}>${club.players.filter(p=>!selected.has(p.id)&&(p.id===id||!game.benchIds.includes(p.id))).sort((a,b)=>rating(b)-rating(a)).map(p=>`<option value="${p.id}" ${id===p.id?'selected':''} ${unavailablePlayer(game,p.id)?'disabled':''}>${esc(p.name)} · ${p.position} · ${statusLabel(game,p)}</option>`).join('')}</select></label>`).join('')}</div></section><section class="card"><p class="kicker">DE VOLLEDIGE SELECTIE</p><h3>Alle ${players.length} spelers</h3><div class="table-scroll"><table><thead><tr><th>SPELER</th><th>POS</th><th>LEEFTIJD</th><th>RATING*</th><th>CONDITIE</th><th>STATUS</th></tr></thead><tbody>${players.map(p=>`<tr><td><b>${esc(p.name)}</b></td><td>${p.position}</td><td>${p.age??'—'}</td><td><span class="position">${rating(p)}</span></td><td><div class="bar"><span style="width:${p.fitness}%"></span></div>${p.fitness}%</td><td>${statusBadge(game,p)}${selected.has(p.id)?'<span class="badge">BASIS</span>':game.benchIds.includes(p.id)?'WISSELBANK':'RESERVE'}</td></tr>`).join('')}</tbody></table></div><p class="muted">* ${rosterNote()}</p></section>`,'Mijn selectie','DE MENSEN OP HET VELD');}
function tactics(){return shell(`<div class="intro"><h2>Bepaal je speelstijl</h2><p>Meer aanval geeft gemiddeld meer kansen. Hoog tempo en druk zetten kosten balzekerheid.</p></div><div class="columns"><section class="card"><p class="kicker">BASISPLAN</p><h3>Formatie</h3><div class="formations">${Object.keys(formations).map(f=>`<button data-formation="${f}" class="formation ${game.tactics.formation===f?'active':''}">◈ &nbsp; ${f}</button>`).join('')}</div><div class="mini-pitch">${formations[game.tactics.formation].map((p,i)=>`<span style="${pitchPosition(game.tactics.formation,i)}">${p}</span>`).join('')}</div></section><section class="card"><p class="kicker">AANWIJZINGEN</p><h3>Spelinstellingen</h3><div class="formations">${Object.entries(tacticPresets).map(([id,p])=>`<button class="formation" data-preset="${id}" ${game.pending?'disabled':''}>${p.name}</button>`).join('')}</div>${[['mentality','Mentaliteit','Verdedigend','Aanvallend'],['pressing','Pressing','Afwachten','Druk zetten'],['tempo','Tempo','Geduldig','Direct']].map(([key,title,low,high])=>`<div class="slider"><div><b>${title}</b><strong>${game.tactics[key]}</strong></div><input type="range" min="0" max="100" value="${game.tactics[key]}" data-tactic="${key}" aria-label="${title}"><small><span>${low}</span><span>${high}</span></small></div>`).join('')}<p class="muted">Wijzigingen worden direct opgeslagen voor de volgende wedstrijd.</p></section></div>`,'Tactisch bord','IEDERE KEUZE TELT');}
function training(){if(trainingSection==='development')return shell(developmentView(game,developmentPlayer,developmentAttribute),'Trainingsveld','BOUW AAN MORGEN');return shell(`${trainingTabs('team')}<div class="intro"><h2>Plan een trainingssessie</h2><p>Eén sessie per speeldag. Ontwikkel vaardigheden of laat je spelers herstellen.</p></div><div class="training-grid">${[['Recovery','✦','Herstel',`+${8+game.management.facilities.medical} conditie voor de selectie`],['Attacking','↗','Aanval',`+${game.management.facilities.training+game.management.staff.coach} aanval, −4 conditie`],['Defending','⬡','Verdediging',`+${game.management.facilities.training+game.management.staff.coach} verdediging, −4 conditie`],['Fitness','◉','Fysiek','+1 uithoudingsvermogen, +3 conditie']].map(([key,icon,title,desc])=>`<button class="training" data-train="${key}" ${game.trainingUsed||game.pending?'disabled':''}><span class="training-icon">${icon}</span><strong>${title}</strong><small>${desc}</small><span>${game.trainingUsed&&game.training===key?'AFGEROND':'KIES SESSIE →'}</span></button>`).join('')}</div><div class="card"><h3>Coach tip</h3><p class="muted">Wedstrijdminuten kosten conditie. Tussen speeldagen herstellen alle spelers automatisch. Bij vaardigheids- en fysieke training slaan geblesseerden de sessie over. Hersteltraining verkort geen blessure; bij Selectie zie je wie inzetbaar is.</p></div>${developmentPanel(game)}${keeperTraining(game)}`,'Trainingsveld','BOUW AAN MORGEN');}
function scouting(){return shell(scoutingReportView(game,scoutingComparison),'Scoutingsnetwerk','ONTDEK DE VOLGENDE STER');}
function league(){const rows=standings(game),day=schedule()[game.round];return shell(`<div class="intro"><h2>Het klassement</h2><p>Zes bestaande clubs spelen een fictieve minicompetitie. Een hogere eindpositie levert een grotere bonus op.</p></div><div class="columns league-grid"><section class="card"><p class="kicker">LIVE STAND</p><div class="table-scroll"><table><thead><tr><th>#</th><th>CLUB</th><th>G</th><th>W</th><th>D</th><th>V</th><th>DS</th><th>PT</th></tr></thead><tbody>${rows.map((r,i)=>`<tr class="${r.i===0?'mine':''}"><td>${i+1}</td><td><span class="club-name">${clubLogo(r.name)}<b>${esc(r.name)}</b></span></td><td>${r.p}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td><td>${r.gf-r.ga}</td><td><b>${r.pts}</b></td></tr>`).join('')}</tbody></table></div></section><section class="card"><p class="kicker">${day?'VOLGENDE SPEELDAG':'EINDSTAND'}</p><h3>${day?`Ronde ${game.round+1}`:'Seizoen afgerond'}</h3>${day?day.map(([a,b])=>`<div class="fixture"><span>${esc(game.clubs[a].name)}</span><b>VS</b><span>${esc(game.clubs[b].name)}</span></div>`).join(''):'<p class="muted">Start een nieuw seizoen op het overzicht.</p>'}<h3>Recente uitslagen</h3>${game.results.slice(-8).reverse().map(r=>`<div class="fixture"><span>${esc(game.clubs[r.home].name)}</span><b>${r.goals[0]}–${r.goals[1]}</b><span>${esc(game.clubs[r.away].name)}</span></div>`).join('')||'<p class="muted">Nog geen wedstrijden gespeeld.</p>'}</section></div>`,'Mini League','DE STRIJD OM DE TOP');}
function liveModal(){
  const pending=game.pending,report=game.lastMatch;
  if(!pending&&(!game.reportOpen||!report))return '';
  const full=!pending,minute=full?(report.detail.minute??90):pending.minute,stats=full?report.detail.stats:pending.stats;
  const home=full?report.home:pending.home,away=full?report.away:pending.away;
  const events=full?report.detail.events:pending.events,coaching=full?(report.detail.coaching||[]):pending.coaching;
  const players=game.clubs[0].players,selection=pending?.selection||[],bench=pending?.bench||[];
  const cardRules=(full?report.detail.disciplineRules:pending.disciplineRules)===1;
  const score=full?report.goals:stats.map(s=>s.goals);
  const keeperRules=(full?report.detail.keeperRules:pending.keeperRules)===1;
  const saves=[0,1].map(side=>events.filter(e=>e.side!==side&&e.type==='save').length);
  const timeline=[...events.map(e=>({minute:e.minute,text:`${e.player} · ${e.type==='goal'?'DOELPUNT':e.type==='yellow'?'GELE KAART':e.type==='red'?(e.secondYellow?'TWEEDE GEEL · ROOD':'RODE KAART'):e.type==='save'?(e.keeper?`REDDING ${e.keeper}`:'SCHOT GESTOPT'):'SCHOT NAAST'}`,sub:`${game.clubs[e.side===0?home:away].name}${e.xg===undefined?'':` · ${e.xg} xG`}`,type:e.type})),...coaching.map(e=>({...e,type:'coaching',sub:'Managerbeslissing'}))].sort((a,b)=>b.minute-a.minute);
  return `<div class="modal-backdrop"><section class="modal live-modal" role="dialog" aria-modal="true" aria-label="Wedstrijd"><div class="match-heading"><p class="kicker">${full?(report.forfeit?.length?'REGLEMENTAIRE UITSLAG':'FULL TIME'):pending.paused?(minute===45?'RUST · JIJ BENT AAN ZET':'GEPAUZEERD · JIJ BENT AAN ZET'):'LIVE · MINI LEAGUE'}</p><span class="live-clock">${minute}'</span></div><div class="match-progress"><span style="width:${100*minute/90}%"></span></div><div class="score"><span class="score-club">${clubLogo(game.clubs[home].name)}${esc(game.clubs[home].name)}</span><strong>${score[0]} : ${score[1]}</strong><span class="score-club">${clubLogo(game.clubs[away].name)}${esc(game.clubs[away].name)}</span></div>
  <div class="match-stats">${[['Balbezit','possession','%'],['Schoten','shots',''],['Op doel','onTarget',''],['xG','xg',''],['Passnauwkeurigheid','passAccuracy','%']].map(([label,key,suffix])=>`<div class="stat"><b>${stats[0][key]||0}${suffix}</b><span>${label}</span><b>${stats[1][key]||0}${suffix}</b></div>`).join('')}</div>
  ${keeperRules?`<div class="match-stats"><div class="stat"><b>${saves[0]}</b><span>Reddingen</span><b>${saves[1]}</b></div></div>`:''}
  ${cardRules?`<div class="match-stats">${[['Geel','yellowCards'],['Rood','redCards']].map(([label,key])=>`<div class="stat"><b>${stats[0][key]}</b><span>${label}</span><b>${stats[1][key]}</b></div>`).join('')}</div>`:''}
  ${full?forfeitReport(report):''}
  ${full?`<p class="reward-message">+${money(report.reward||0)} credits wedstrijdbonus${report.settlement?` · Netto ${money(report.settlement.net)} credits na inkomsten en kosten`: ""} · Voortgang opgeslagen</p>`:`<div class="match-toolbar"><button class="primary" data-action="${pending.paused?'resume':'pause'}">${pending.paused?(minute===0?'AFTRAP':minute===45?'START TWEEDE HELFT':'HERVATTEN'):'PAUZEER & COACH'}</button><label>SNELHEID <select data-speed aria-label="Wedstrijdsnelheid">${[[600,'1×'],[300,'2×'],[150,'4×']].map(([value,label])=>`<option value="${value}" ${speed===value?'selected':''}>${label}</option>`).join('')}</select></label></div>`}
  <div class="live-feed">${timeline.slice(0,20).map(e=>`<div class="live-event ${e.type}"><b>${e.minute}' ${e.type==='goal'?'⚽':e.type==='coaching'?'⇄':e.type==='yellow'?'🟨':e.type==='red'?'🟥':'•'}</b><span>${esc(e.text)}<small>${esc(e.sub)}</small></span></div>`).join('')||'<p class="muted">Nog geen kansen. De wedstrijd is open.</p>'}</div>
  ${!full&&pending.paused?`<section class="halftime"><h3>Coach je elftal</h3><div class="halftime-tactics"><label>Formatie<select data-live-formation>${Object.keys(formations).map(f=>`<option ${f===game.tactics.formation?'selected':''}>${f}</option>`).join('')}</select></label>${[['mentality','Aanval'],['pressing','Pressing'],['tempo','Tempo']].map(([key,label])=>`<label>${label} <b>${game.tactics[key]}</b><input type="range" min="0" max="100" value="${game.tactics[key]}" data-live-tactic="${key}"></label>`).join('')}</div><p class="muted">Aanvoerder: ${esc(players.find(p=>p.id===pending.captainId)?.name||'—')} · ${pending.subs}/3 wissels gebruikt</p><div class="sub-row"><select id="sub-out" aria-label="Speler uit"><option value="">Wissel uit…</option>${selection.filter(Boolean).map(id=>{const p=players.find(player=>player.id===id);return `<option value="${id}">${esc(p.name)} · ${p.position} · ${matchFitness(p,pending.played[id]||0)}%</option>`;}).join('')}</select><select id="sub-in" aria-label="Speler in"><option value="">Wissel in…</option>${bench.map(id=>{const p=players.find(player=>player.id===id);return `<option value="${id}">${esc(p.name)} · ${p.position} · ${p.fitness}%</option>`;}).join('')}</select><button data-action="sub" ${pending.subs>=3?'disabled':''}>WISSEL</button></div><p class="muted">Een gewisselde speler kan niet terugkeren. Wissels en tactiek gelden vanaf de volgende minuut.</p></section>`:''}
  ${!full?liveDisciplineView(game):disciplineReportView(report.disciplineReport)}
  ${full?stadiumReportView(report.stadiumReport)+keeperReportView(report.detail)+fitnessReport(report.medicalReport)+developmentReportView(report.developmentReport)+reputationReportView(report.reputationReport)+leagueMarketNotice(game,true):''}
  ${storageError?storageNotice():''}
  ${message?`<p class="match-feedback" role="status">${esc(message)}</p>`:''}
  ${full?'<button class="primary" data-action="close">VERDER MET MIJN CLUB →</button>':pending.paused?'<button class="report-button" data-action="save-close">OPSLAAN & SLUITEN</button>':'<p class="muted">Opgeslagen per minuut. Pauzeer om in te grijpen.</p>'}</section></div>`;
}
let hideMatch=false;
function runClock(){
  clearInterval(timer);timer=setInterval(()=>{
    if(!game?.pending||game.pending.paused){clearInterval(timer);return;}
    advanceMatch(game);save();
    if(!game.pending||game.pending.paused)clearInterval(timer);
    render();
  },speed);
}
function render(){
  if(!game){$('#app').innerHTML=storageError?`<main class="recovery-screen"><div id="storage-status">${storageNotice()}</div><h1>Je opgeslagen carrière blijft bewaard</h1><p class="muted">We konden de save niet openen. Download de oorspronkelijke gegevens of kies een geldige backup.</p>${backupPanel()}</main>`:newClub()+`<div class="onboarding-backup">${backupPanel()}</div>`;return;}
  $('#app').innerHTML=`<div id="storage-status">${storageNotice()}</div>`+({overview,inbox,squad,clubs,prematch,tactics,training,transfers,league,cluboffice,career,progress})[tab]()+(!hideMatch?liveModal():'');
}
$('#app').addEventListener('submit',e=>{
  if(e.target.id==='league-market-filter'){
    e.preventDefault();const data=new FormData(e.target),club=data.get('club'),period=data.get('period');
    if(!['all','1','2','3','4','5'].includes(club)||!['all','season'].includes(period))return;
    journalFilters={club,period};render();return;
  }
  if(e.target.id==='scouting-search-form'){
    e.preventDefault();const data=new FormData(e.target),skill=data.get('skill'),budget=String(data.get('budget')??'').trim();
    const ok=setScoutingCriteria(game,{role:data.get('role'),budget:budget===''?null:Number(budget),skill,minimum:skill==='any'?0:Number(data.get('minimum'))});
    message=ok?'Zoekprofiel bewaard. Zoeken kost geen credits.':'Kies geldige filters. Keepersvaardigheden passen alleen bij Keepers of Alle posities.';
    if(ok){scoutingComparison=null;transferSection='search';save();}render();return;
  }
  if(e.target.id==='scouting-comparison-form'){
    e.preventDefault();const data=new FormData(e.target),id=data.get('candidate'),ownId=data.get('ownId');
    if(compareCandidate(game,id,ownId)){scoutingComparison={id,ownId};message='';render();$('#scouting-comparison')?.focus();}return;
  }
  if(e.target.id==='development-plan-form'){
    e.preventDefault();const data=new FormData(e.target),id=data.get('playerId'),ok=setDevelopmentPlan(game,id,data.get('attribute'),Number(data.get('target')));
    message=ok?'Trainingsplan bewaard. Speelminuten tellen vanaf je volgende wedstrijd.':'Kies een eigen speler, een passende vaardigheid en een hoger doel tot 99.';
    if(ok){developmentPlayer=id;developmentAttribute=data.get('attribute');save();}render();return;
  }
  if(e.target.id==='club-transfer-filter'){

    e.preventDefault();const data=new FormData(e.target),seller=Number(data.get('seller')),role=data.get('role');
    if(!Number.isInteger(seller)||seller<1||seller>5||!['all','GK','DEF','MID','ATT'].includes(role))return;
    transferFilters={seller,role,search:String(data.get('search')||'').trim().slice(0,80)};bidCandidate=null;render();return;
  }
  if(e.target.id==='club-bid-form'){
    e.preventDefault();const data=new FormData(e.target),offer=submitClubBid(game,Number(data.get('seller')),data.get('playerId'),Number(data.get('amount')));
    message=offer?({accepted:'Bod geaccepteerd. Bekijk de voorwaarden en bevestig de aankoop.',counter:'Tegenbod ontvangen. Bekijk de voorwaarden voordat je beslist.',rejected:'Bod afgewezen: de club vindt het bedrag te laag.'})[offer.status]:'Bod niet mogelijk. Controleer je budget, de selectie en het maximum van vijf open aanbiedingen.';
    if(offer){bidCandidate=null;save();}render();return;
  }
  if(e.target.id==='live-position-form'){e.preventDefault();const data=new FormData(e.target);message=moveLivePlayer(game,Number(data.get('from')),Number(data.get('to')))?'Posities aangepast.':'Deze verplaatsing kan niet; laat iemand in het doel staan.';save();render();return;}
  if(['manager-form','auto-form','development-form','keeper-development-form'].includes(e.target.id)){
    e.preventDefault();if(!game)return;const data=new FormData(e.target);
    if(e.target.id==='manager-form'){const name=String(data.get('managerName')||'').trim().slice(0,40);if(!name)return;game.management.managerName=name;message='Managernaam opgeslagen.';}
    if(e.target.id==='auto-form'){if(game.pending)return;for(const key of ['protectLead','chaseGoal','subTired'])game.management.auto[key]=data.has(key);message='Automatische instructies opgeslagen.';}
    if(['development-form','keeper-development-form'].includes(e.target.id))message=developPlayer(game,data.get('playerId'),data.get('attribute'))?'Individuele training afgerond.':'Deze training is nu niet mogelijk.';
    save();render();return;
  }
  if(e.target.id!=='create-form')return;e.preventDefault();if(game||storageError)return;const data=new FormData(e.target);game=newGame(data.get('name'),data.get('color'));save();render();});
$('#app').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b||b.disabled)return;
  if(backupAction(b.dataset.action))return;
  if(b.dataset.action==='view-reputation'&&!game.pending){hideMatch=true;game.reportOpen=false;tab='cluboffice';officeSection='reputation';message='';save();render();return;}
  if(!game)return;
  if(b.dataset.inboxStatus){if(['all','unread'].includes(b.dataset.inboxStatus)){inboxFilters.status=b.dataset.inboxStatus;message='';render();}return;}
  if(b.dataset.inboxCategory){if(Object.hasOwn(inboxCategories,b.dataset.inboxCategory)){inboxFilters.category=b.dataset.inboxCategory;message='';render();}return;}
  if(b.dataset.inboxReadVisible!==undefined){
    const keys=visibleInbox(inboxMessages(game),inboxFilters).filter(m=>!m.read).map(m=>m.key);
    if(markInboxRead(game,keys)){message='Deze berichten zijn als gelezen gemarkeerd. Openstaande zaken blijven zichtbaar bij Alles.';save();}render();return;
  }
  if(b.dataset.inboxRead){
    if(!['true','false'].includes(b.dataset.read))return;
    if(markInboxRead(game,[b.dataset.inboxRead],b.dataset.read==='true')){message=b.dataset.read==='true'?'Gemarkeerd als gelezen. De spelactie wacht op jouw keuze.':'Gemarkeerd als ongelezen.';save();}render();return;
  }
  if(b.dataset.inboxOpen){
    const item=inboxMessages(game).find(m=>m.key===b.dataset.inboxOpen);
    if(!item){message='Deze zaak is inmiddels opgelost of veranderd.';render();return;}
    markInboxRead(game,[item.key]);save();
    const action=item.action;hideMatch=!action.match;tab=action.tab;saleCandidate=null;bidCandidate=null;incomingCandidate=null;scoutingComparison=null;fitnessProposal=null;message='';
    if(tab==='cluboffice')officeSection=action.section;
    if(tab==='transfers'){transferSection=action.section;if(action.seller)transferFilters={seller:action.seller,role:'all',search:''};}
    if(tab==='training'){trainingSection=action.section;developmentPlayer=action.playerId||null;developmentAttribute=null;}
    render();return;
  }
  if(b.dataset.trainingSection){if(!['team','development'].includes(b.dataset.trainingSection))return;trainingSection=b.dataset.trainingSection;message='';render();return;}
  if(b.dataset.openDevelopment){if(!game.clubs[0].players.some(p=>p.id===b.dataset.openDevelopment))return;developmentPlayer=b.dataset.openDevelopment;developmentAttribute=null;trainingSection='development';tab='training';message='';render();return;}
  if(b.dataset.stopPlan){const ok=stopDevelopmentPlan(game,b.dataset.stopPlan);message=ok?'Plan gestopt. Verdiende vaardigheden blijven behouden; opgespaarde minuten zijn gewist.':'Plan stoppen is nu niet mogelijk.';if(ok)save();render();return;}
  if(b.dataset.trainPlan){const ok=trainAccordingToPlan(game,b.dataset.trainPlan);message=ok?'Volgens plan getraind. De vooruitgang is opgeslagen; −3 conditie.':'Deze training is nu niet mogelijk of je doel is al bereikt.';if(ok)save();render();return;}
  if(b.dataset.transferJournal!==undefined){hideMatch=true;tab='transfers';transferSection='journal';message='';render();return;}
  if(b.dataset.marketClub){const index=Number(b.dataset.marketClub);if(!Number.isInteger(index)||index<1||index>5)return;hideMatch=true;tab='clubs';selectedClub=index;playerSearch='';roleFilter='all';message='';render();return;}
  if(b.dataset.transferInbox){tab='transfers';transferSection='incoming';incomingCandidate=null;message='';render();return;}
  if(b.dataset.reviewIncoming){const id=Number(b.dataset.reviewIncoming),offer=game.clubMarket.offers.find(o=>o.id===id);incomingCandidate=incomingSaleReason(game,offer)?null:id;message=incomingCandidate?'':'Dit bod kan nu niet worden geaccepteerd.';render();$('#incoming-sale-preview')?.focus();return;}
  if(b.dataset.incomingAction==='cancel'){incomingCandidate=null;message='Verkoop geannuleerd. Het bod blijft open.';render();return;}
  if(b.dataset.rejectIncoming){const ok=rejectIncomingOffer(game,Number(b.dataset.rejectIncoming));message=ok?'Bod afgewezen. Je speler en credits zijn behouden.':'Dit bod is niet meer beschikbaar.';incomingCandidate=null;if(ok)save();render();return;}
  if(b.dataset.confirmIncoming){const id=Number(b.dataset.confirmIncoming),ok=incomingCandidate===id&&acceptIncomingOffer(game,id);message=ok?'Speler verkocht en betaling ontvangen. Controleer je selectie.':'Verkoop niet mogelijk. Bekijk het bod en de voorwaarden opnieuw.';incomingCandidate=null;if(ok)save();render();return;}
  if(b.dataset.comparePlayer){scoutingComparison={id:b.dataset.comparePlayer,ownId:null};message='';render();$('#scouting-comparison')?.focus();return;}
  if(b.dataset.closeComparison!==undefined){scoutingComparison=null;render();return;}
  if(b.dataset.shortlistAdd){const ok=addToShortlist(game,b.dataset.shortlistAdd);message=ok?'Speler op je shortlist gezet.':'Bewaren lukt niet: maximaal twintig unieke spelers buiten je eigen selectie.';if(ok)save();render();return;}
  if(b.dataset.shortlistRemove){const ok=removeFromShortlist(game,b.dataset.shortlistRemove);message=ok?'Speler van je shortlist gehaald.':'Speler staat niet op je shortlist.';if(ok)save();render();return;}
  if(b.dataset.resetScouting!==undefined){setScoutingCriteria(game,defaultCriteria());scoutingComparison=null;message='Zoekfilters gewist. Je huidige scoutingrapport blijft behouden.';save();render();return;}
  if(b.dataset.transferSection){if(!['search','shortlist','clubs','incoming','scouting','journal'].includes(b.dataset.transferSection))return;transferSection=b.dataset.transferSection;scoutingComparison=null;incomingCandidate=null;bidCandidate=null;message='';render();return;}
  if(b.dataset.clubBid){transferSection='clubs';scoutingComparison=null;transferFilters.seller=Number(b.dataset.seller);bidCandidate={seller:Number(b.dataset.seller),id:b.dataset.clubBid};message='';render();$('#club-bid-form input[name="amount"]')?.focus();return;}
  if(b.dataset.transferAction==='close-bid'){bidCandidate=null;message='Bod geannuleerd; er is niets verstuurd.';render();return;}
  if(b.dataset.cancelClubBid){message=cancelClubBid(game,Number(b.dataset.cancelClubBid))?'Aanbod ingetrokken. Er zijn geen credits afgeschreven.':'Dit aanbod kan niet meer worden ingetrokken.';save();render();return;}
  if(b.dataset.confirmClubPurchase){message=confirmClubPurchase(game,Number(b.dataset.confirmClubPurchase))?'Speler aangekocht. Kies zijn plaats via Selectie.':'Aankoop niet mogelijk. Controleer het aanbod en je beschikbare credits.';save();render();return;}
  if(b.dataset.club!==undefined){selectedClub=Number(b.dataset.club);playerSearch='';roleFilter='all';render();return;}
  if(b.dataset.action==='update-rosters'){
    try{
      const candidate=updateClubRosters(game);
      const updated=restoreBackup(storage,candidate,game);
      game=updated;fitnessProposal=null;bidCandidate=null;incomingCandidate=null;scoutingComparison=null;backupCandidate=null;importSequence++;storageError='';unreadableRaw=null;
      message='Selecties bijgewerkt. Je uitslagen en credits zijn behouden. Je oude carrière staat bij Vorige save terugzetten.';
    }catch(error){message=game.pending?error.message:'Bijwerken is niet gelukt. Je huidige carrière is behouden.';}
    render();return;
  }
  if(b.dataset.office){officeSection=b.dataset.office;tab='cluboffice';saleCandidate=null;message='';render();return;}
  if(b.dataset.ticketPrice){const ok=chooseTicketPrice(game,Number(b.dataset.ticketPrice));message=ok?'Ticketprijs bewaard voor je volgende thuiswedstrijd.':'Prijs wijzigen is nu niet mogelijk.';if(ok)save();render();return;}
  if(b.dataset.upgrade){message=upgradeClub(game,b.dataset.group,b.dataset.upgrade)?'Investering afgerond. Het effect is direct actief.':'Investering nu niet beschikbaar.';save();render();return;}
  if(b.dataset.sponsor){message=chooseSponsor(game,b.dataset.sponsor)?'Sponsorcontract afgesloten.':'Je kunt dit contract nu niet afsluiten.';save();render();return;}
  if(b.dataset.renew){message=renewContract(game,b.dataset.renew)?'Contract verlengd. Het nieuwe salaris geldt vanaf de volgende speeldag.':'Dit contract kan nu niet verlengd worden.';save();render();return;}
  if(b.dataset.sell){const buyer=game.clubs.findIndex((_,i)=>i>0&&saleOffer(game,b.dataset.sell,i));saleCandidate=buyer>0?{id:b.dataset.sell,buyer}:null;message=saleCandidate?'':'Verkoop nu niet mogelijk.';render();return;}
  if(b.dataset.management==='cancel-sale'){saleCandidate=null;message='Verkoop geannuleerd.';render();return;}
  if(b.dataset.management==='confirm-sale'&&saleCandidate){message=sellPlayer(game,saleCandidate.id,saleCandidate.buyer)?'Speler verkocht. Opstelling en wisselbank zijn gecontroleerd.':'De verkoop is niet meer mogelijk.';saleCandidate=null;save();render();return;}
  if(b.dataset.management==='renew-all'){message=renewExpiring(game)+' contracten verlengd.';save();render();return;}
  if(b.dataset.preset&&!game.pending){Object.assign(game.tactics,...['mentality','pressing','tempo'].map(k=>({[k]:tacticPresets[b.dataset.preset][k]})));message='Speelstijl opgeslagen.';save();render();return;}
  if(b.dataset.fitness){
    if(b.dataset.fitness==='preview'){fitnessProposal=game.pending?null:recommendedSquad(game);message=fitnessProposal?'':'Een voorstel is nu niet beschikbaar.';}
    if(b.dataset.fitness==='cancel'){fitnessProposal=null;message='Voorstel geannuleerd. Je opstelling is behouden.';}
    if(b.dataset.fitness==='apply'&&fitnessProposal){message=applyRecommendedSquad(game)?'Fit elftal, wisselbank en aanvoerder opgeslagen.':'Opstelling wijzigen is nu niet mogelijk.';fitnessProposal=null;save();}
    render();return;
  }
  if(b.dataset.tab){fitnessProposal=null;incomingCandidate=null;tab=b.dataset.tab;message='';render();return;}
  if(b.dataset.formation&&!game.pending){fitnessProposal=null;game.tactics.formation=b.dataset.formation;prepareSquad(game);save();render();return;}
  if(b.dataset.train){message=train(game,b.dataset.train)?'Training afgerond!':'Training niet beschikbaar tijdens een wedstrijd of na je sessie.';save();render();return;}
  if(b.dataset.sign){message=signPlayer(game,b.dataset.sign)?'Nieuwe speler aangetrokken!':'Transfer nu niet mogelijk.';save();render();return;}
  const action=b.dataset.action;
  if(action==='play'){const match=beginMatch(game);hideMatch=false;message=match?'':unavailableSelection(game).length?(unavailableSelection(game).some(id=>suspensionFor(game,id))?'Vervang eerst de geschorste of geblesseerde spelers via Selectie.':'Vervang eerst de geblesseerde spelers via Selectie.'):(game.lineupIds.filter(Boolean).length<11?'Vul je beschikbare basisplaatsen via het selectievoorstel.':'Verleng eerst de verlopen contracten van je wedstrijdselectie via Clubzaken.');save();render();}
  if(action==='pause'&&game.pending){clearInterval(timer);game.pending.paused=true;save();render();}
  if(action==='resume'&&game.pending){game.pending.paused=false;message='';const saved=save();render();if(saved)runClock();}
  if(action==='save-close'&&game.pending?.paused){hideMatch=true;message=save()?'Wedstrijd opgeslagen. Klik op Hervat wedstrijd om verder te spelen.':'Download een backup via Voortgang voordat je afsluit.';render();}
  if(action==='season'&&newSeason(game)){message='Nieuw seizoen gestart!';save();render();}
  if(action==='scout'){const ok=scout(game);message=ok?'Scoutingrapport ontvangen!':'Geen passend rapport mogelijk met dit profiel, je budget of de huidige speeldag. Er zijn geen credits besteed.';if(ok)save();render();}
  if(action==='sub'){message=makeSubstitution(game,$('#sub-out').value,$('#sub-in').value)?'Wissel toegepast!':'Kies een basisspeler en een beschikbare wissel (maximaal drie).';save();render();}
  if(action==='close'){game.reportOpen=false;message='';save();render();}
  if(action==='report'&&!game.pending){game.reportOpen=true;hideMatch=false;message='';save();render();}
});
$('#app').addEventListener('change',async e=>{
  const target=e.target;
  if(target.hasAttribute('data-development-player')){if(!game?.clubs[0].players.some(p=>p.id===target.value))return;developmentPlayer=target.value;developmentAttribute=null;message='';render();return;}
  if(target.hasAttribute('data-development-attribute')){const p=game.clubs[0].players.find(p=>p.id===developmentPlayer)||game.clubs[0].players[0];if(!skillsFor(p).includes(target.value))return;developmentAttribute=target.value;render();return;}
  if(target.hasAttribute('data-sale-buyer')&&saleCandidate){saleCandidate.buyer=Number(target.value);render();return;}
  if(target.hasAttribute('data-import-save')){
    const request=++importSequence,file=target.files?.[0];backupCandidate=null;
    if(!file){message='';render();return;}
    message='Backup controleren…';render();
    try{
      if(file.size>MAX_BACKUP_BYTES)throw new Error('Kies een Touchline-backup van maximaal 2 MB.');
      const raw=await file.text();if(request!==importSequence)return;
      backupCandidate=parseBackup(raw);message='Backup gecontroleerd. Bekijk de carrière hieronder.';
    }catch(error){if(request!==importSequence)return;message=error.message;}
    render();return;
  }
  if(!game)return;
  if(target.hasAttribute('data-role-filter')){roleFilter=target.value;$('#club-roster').innerHTML=clubRoster();return;}
  if(target.dataset.slot!==undefined){fitnessProposal=null;message=setStarter(game,Number(target.dataset.slot),target.value)?'Opstelling opgeslagen!':'Deze wijziging is niet mogelijk.';save();render();}
  if(target.dataset.bench!==undefined){fitnessProposal=null;message=setBench(game,Number(target.dataset.bench),target.value)?'Wisselbank opgeslagen!':'Deze speler is niet beschikbaar.';save();render();}
  if(target.hasAttribute('data-captain')){message=setCaptain(game,target.value)?'Aanvoerder opgeslagen!':'Aanvoerder wijzigen is nu niet mogelijk.';save();render();}
  if(target.hasAttribute('data-speed')){speed=Number(target.value);if(game.pending&&!game.pending.paused)runClock();}
  if(target.hasAttribute('data-live-formation')&&game.pending?.paused){game.tactics.formation=target.value;game.pending.coaching.push({minute:game.pending.minute,text:`Formatie gewijzigd naar ${target.value}`});save();render();}
  if(target.dataset.liveTactic&&game.pending?.paused){game.pending.coaching.push({minute:game.pending.minute,text:`${{mentality:'Mentaliteit',pressing:'Pressing',tempo:'Tempo'}[target.dataset.liveTactic]} aangepast naar ${target.value}`});save();}
});
$('#app').addEventListener('input',e=>{
  if(e.target.hasAttribute('data-player-search')&&game){playerSearch=e.target.value;$('#club-roster').innerHTML=clubRoster();return;}
  if(e.target.dataset.liveTactic&&game?.pending?.paused){game.tactics[e.target.dataset.liveTactic]=Number(e.target.value);e.target.parentElement.querySelector('b').textContent=e.target.value;save();}
  if(e.target.dataset.tactic&&game&&!game.pending){game.tactics[e.target.dataset.tactic]=Number(e.target.value);e.target.closest('.slider').querySelector('strong').textContent=e.target.value;save();}
});
render();
