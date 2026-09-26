import {configuration,createApplication} from './backend/server.js';
const config=configuration(),app=createApplication(config);
app.server.listen(config.port,config.host,()=>console.log(`Touchline: ${config.origin}\nSamen spelen: ${config.origin}/online\n${config.dev?'Lokale testaanmelding: alleen .test-adressen; geen echte e-mail.':'Productieaanmelding actief.'}`));
let stopping=false;
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,async()=>{if(stopping)return;stopping=true;await app.close();process.exit(0);});
