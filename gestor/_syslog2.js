const fs=require('fs');
const TOKEN=fs.readFileSync("D:\\Descargas\\Deepseek\\ha_token.txt","utf8").trim();
const ws=new WebSocket("wss://192.168.1.5:8123/api/websocket");
ws.onmessage=(ev)=>{const m=JSON.parse(ev.data);
 if(m.type==="auth_required") ws.send(JSON.stringify({type:"auth",access_token:TOKEN}));
 else if(m.type==="auth_ok") ws.send(JSON.stringify({id:2,type:"system_log/list"}));
 else if(m.id===2){
   const e=m.result||[];
   for(const x of e){
     const t=String(x.message||"");
     if(/packag|invalid config|unable to|not found|setup failed|error loading/i.test(t)){
       console.log("["+(x.level||"?")+"] "+(x.name||"").slice(0,60));
       console.log("   "+t.replace(/\s+/g," ").slice(0,300));
     }
   }
   console.log("--- fin ---");
   ws.close();process.exit(0);
 }
};
setTimeout(()=>{process.exit(0);},10000);
