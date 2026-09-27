export function hubView({esc,options,clubs,catalog,selectedCatalog,joinLobby,leagueList}){
  return `<p><a href="/world">Ontdek alle wereldcompetities, clubs en spelers ↗</a></p><div class="grid">
  <section class="card"><p class="kicker">DE AFTRAP</p><h2>Maak een competitie</h2><form id="create" class="stack">
    <label>Competitienaam<input name="title" minlength="2" maxlength="50" required placeholder="Vrijdagavond League"></label>
    <label>Spelcompetitie<select name="catalog"><option value="">Nederlandse minicompetitie · 6 clubs</option>${(catalog?.leagues||[]).map(l=>`<option value="${l.id}" ${selectedCatalog===l.id?'selected':''} ${l.playable?'':'disabled'}>${esc(l.country+' · '+l.name)} · ${l.clubs.length} clubs${l.playable?'':' · selectie onvolledig'}</option>`).join('')}</select></label>
    <p class="muted" data-catalog-note>${selectedCatalog?'Nieuwere EA-clubindeling met FC 26-basisratings. Alleen waar die ontbreken gebruiken we gemarkeerde FC 27-ratings.':'De bestaande minicompetitie met zes clubs en gegenereerde spelwaarden.'}</p>
    <label>Jouw club<select name="club">${clubs()}</select></label><button>MAAK COMPETITIE</button></form></section>
  <section class="card"><p class="kicker">SPEEL MEE</p><h2>Ik heb een competitiecode</h2>
    <form id="lookup-join" class="stack"><label>Competitiecode<input name="code" value="${esc(joinLobby?.code||'')}" required pattern="[a-fA-F0-9]{12}" maxlength="12" autocomplete="off"></label><button class="secondary">CONTROLEER CODE</button></form>
    ${joinLobby?`<form id="join" class="stack" style="margin-top:20px"><p><b>${esc(joinLobby.title)}</b><small>Code: ${joinLobby.code}</small></p><input type="hidden" name="code" value="${joinLobby.code}"><label>Jouw vrije club<select name="club">${options(joinLobby.clubs.filter(c=>!c.occupied).map(c=>[c.index,c.name]))}</select></label><button ${joinLobby.clubs.every(c=>c.occupied)?'disabled':''}>DOE MEE</button></form>`:''}
    <p class="muted">Controleer de code om de echte, nog vrije clubs van deze competitie te zien.</p></section></div>
  <section class="card"><h2>Mijn competities</h2>${leagueList.length?leagueList.map(l=>`<div class="row offer"><div><b>${esc(l.title)}</b><small>${esc(l.club)} · seizoen ${l.season} · ${l.round}/${l.totalRounds||10} gespeeld</small></div><button class="secondary" data-open="${esc(l.id)}">OPEN COMPETITIE</button></div>`).join(''):'<p class="empty">Je doet nog niet mee. Maak een competitie of gebruik een code.</p>'}</section>`;
}
