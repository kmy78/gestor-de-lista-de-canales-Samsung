const fs=require('fs');
const TOKEN=fs.readFileSync("D:\\Descargas\\Deepseek\\ha_token.txt","utf8").trim();
const ws=new WebSocket("wss://192.168.1.5:8123/api/websocket");
ws.onmessage=(ev)=>{const m=JSON.parse(ev.data);
 if(m.type==="auth_required") ws.send(JSON.stringify({type:"auth",access_token:TOKEN}));
 else if(m.type==="auth_ok") ws.send(JSON.stringify({id:2,type:"system_log/list"}));
 else if(m.id===2){
  const rel=(m.result||[]).filter(x=>/spool|script|automation/i.test(String(x.message||"")+String(x.name||"")));
  console.log("entradas relevantes:",rel.length);
  for(const x of rel.slice(-6)) console.log("\n["+(x.level||"?")+"]["+(x.name||"").slice(0,40)+"]\n  "+String(x.message||"").replace(/\s+/g," ").slice(0,300));
  ws.close();process.exit(0);}
};
setTimeout(()=>process.exit(0),10000);
