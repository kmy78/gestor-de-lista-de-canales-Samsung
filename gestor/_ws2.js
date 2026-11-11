const fs=require('fs');
const TOKEN=fs.readFileSync("D:\\Descargas\\Deepseek\\ha_token.txt","utf8").trim();
function probar(url){return new Promise(res=>{
 const ws=new WebSocket(url); let acabo=false;
 const fin=(m)=>{if(acabo)return;acabo=true;try{ws.close();}catch(e){}res(m);};
 ws.onmessage=(ev)=>{const m=JSON.parse(ev.data);
   if(m.type==="auth_required") ws.send(JSON.stringify({type:"auth",access_token:TOKEN}));
   else if(m.type==="auth_ok") ws.send(JSON.stringify({id:2,type:"config_entries/get"}));
   else if(m.type==="auth_invalid") fin({err:"auth invalida"});
   else if(m.id===2){const ents=(m.result||[]).filter(e=>/elegoo/i.test(e.domain));
     fin({ents});}};
 ws.onerror=()=>fin({err:"error de conexion"});
 setTimeout(()=>fin({err:"timeout"}),7000);
});}
(async()=>{
 for(const u of ["ws://192.168.1.5:8123/api/websocket","wss://192.168.1.5:8123/api/websocket"]){
  const r=await probar(u);
  if(r.err){console.log(u,"->",r.err);continue;}
  console.log(u,"-> OK, entradas Elegoo:",r.ents.length);
  for(const e of r.ents) console.log("   ",e.domain,"|",e.title,"| estado:",e.state,"| host:",(e.data&&e.data.host)||"-");
  break;
 }
 process.exit(0);
})();
