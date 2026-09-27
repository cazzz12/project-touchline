// Reuse the normal, browser-bound email proof; there is no authentication bypass API.
export async function previewLogin(session,api){
  if(session?.mode!=='local-test')throw Error('Snelle testtoegang is alleen lokaal beschikbaar.');
  if(session.account)return;
  const proof=await api('/auth/challenge',{kind:'email',identifier:'preview@touchline.test',link:false});
  if(!/^[0-9]{6}$/.test(proof.testCode||''))throw Error('De lokale testcode ontbreekt. Gebruik de gewone aanmelding.');
  await api('/auth/verify',{id:proof.id,code:proof.testCode});
}
