// Shared presentation only: actions still use each game's existing handlers.
export function matchdayView({home,away,round,caption,esc,logo,actions=''}){
 const team=(club,side)=>`<div class="matchday-team">${logo(club.name,'large')}<h2>${esc(club.name)}</h2><small>${side}</small></div>`;
 return `<section class="matchday"><p class="matchday-round">${esc(round)}</p><p class="matchday-caption">${esc(caption)}</p><div class="matchday-fixture ${away?'':'season-complete'}">${team(home,away?'THUIS':'JOUW CLUB')}<div class="matchday-versus" aria-label="${away?'tegen':'Seizoen voltooid'}">${away?'VS':'★'}<small>${away?'DE AFTRAP WACHT':'GOED GESPEELD'}</small></div>${away?team(away,'UIT'):''}</div><div class="matchday-buttons">${actions}</div></section>`;
}
