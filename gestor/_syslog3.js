const fs=require('fs');
const TOKEN=fs.readFileSync("D:\\Descargas\\Deepseek\\ha_token.txt","utf8").trim();
const ws=new WebSocket("wss://192.168.1.5:8123/api/websocket");
ws.onmessage=(ev)=>{const m=JSON.parse(ev.data);
 if(m.type==="auth_required") ws.send(JSON.stringify({type:"auth",access_token:TOKEN}));
 else if(m.type==="auth_ok") ws.send(JSON.stringify({id:2,type:"system_log/list"}));
 else if(m.id===2){
   for(const x of (m.result||[])){
     const t=String(x.message||"");
     if(/packag|spoolman|\.yaml|invalid|not found|error/i.test(t)) console.log("["+(x.name||"").slice(0,50)+"] "+t.replace(/\s+/g," ").slice(0,260));
   }
   console.log("--- fin ---");
   ws.close();process.exit(0);
 }
};
setTimeout(()=>process.exit(0),10000);
