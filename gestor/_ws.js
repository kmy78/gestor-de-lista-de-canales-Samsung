const fs=require('fs');
const TOKEN=fs.readFileSync("D:\\Descargas\\Deepseek\\ha_token.txt","utf8").trim();
console.log("WebSocket global:", typeof WebSocket);
if(typeof WebSocket==="undefined"){console.log("no disponible");process.exit(0);}
const ws=new WebSocket("wss://192.168.1.5:8123/api/websocket");
// Node no permite rejectUnauthorized aquí; probamos y si falla usamos http
ws.onopen=()=>{};
ws.onmessage=(ev)=>{
  const m=JSON.parse(ev.data);
  if(m.type==="auth_required") ws.send(JSON.stringify({type:"auth",access_token:TOKEN}));
  else if(m.type==="auth_ok"){ ws.send(JSON.stringify({id:2,type:"config_entries/get"})); }
  else if(m.type==="auth_invalid"){ console.log("auth invalida"); ws.close(); }
  else if(m.id===2){
    const ents=(m.result||[]).filter(e=>/elegoo/i.test(e.domain));
    console.log("entradas Elegoo:",ents.length);
    for(const e of ents) console.log("  ",e.domain,"| titulo:",e.title,"| estado:",e.state,"| host:",(e.data&&e.data.host)||"-");
    ws.close(); process.exit(0);
  }
};
ws.onerror=(e)=>{console.log("error WS:",e.message||e.type);process.exit(0);};
setTimeout(()=>{console.log("timeout");process.exit(0);},8000);
