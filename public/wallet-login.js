export function phantomBrowseUrl(origin){
 try{const u=new URL(origin);if(u.protocol!=='https:'||u.username||u.password||u.pathname!=='/'||u.search||u.hash||['localhost','127.0.0.1','[::1]'].includes(u.hostname))return null;return 'https://phantom.app/ul/browse/'+encodeURIComponent(u.origin+'/online')+'?ref='+encodeURIComponent(u.origin);}catch{return null;}
}
export async function signInWithWallet(kind,api,link=false,scope=window){
 const provider=kind==='solflare'?scope.solflare:scope.phantom?.solana;
 if(!provider?.connect||!provider.signMessage)throw Error('Deze wallet is hier niet beschikbaar. Open Touchline in je walletbrowser of gebruik e-mail.');
 try{
  const connected=await provider.connect(),key=connected?.publicKey||provider.publicKey;
  if(!key)throw Error('De wallet geeft geen openbaar adres terug.');
  const challenge=await api('/auth/challenge',{kind:'wallet',identifier:key.toString(),link});
  const signed=await provider.signMessage(new TextEncoder().encode(challenge.message),'utf8'),signature=signed?.signature||signed;
  if(!(signature instanceof Uint8Array)||signature.length!==64)throw Error('De wallet gaf geen geldige handtekening terug.');
  await api('/auth/verify',{id:challenge.id,signature:btoa(String.fromCharCode(...signature))});
 }catch(error){if(error.code===4001)throw Error('Aanmelden geannuleerd in je wallet. Je kunt het opnieuw proberen.');throw error;}
}
