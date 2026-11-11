const fs=require('fs');
const TOKEN=fs.readFileSync("D:\\Descargas\\Deepseek\\ha_token.txt","utf8").trim();
const ws=new WebSocket("wss://192.168.1.5:8123/api/websocket");
ws.onmessage=(ev)=>{const m=JSON.parse(ev.data);
 if(m.type==="auth_required") ws.send(JSON.stringify({type:"auth",access_token:TOKEN}));
 else if(m.type==="auth_ok") ws.send(JSON.stringify({id:2,type:"system_log/list"}));
 else if(m.id===2){
   const e=m.result||[];
   console.log("entradas de system_log:",e.length);
   const rel=e.filter(x=>/spoolman|package|yaml|automation|input_select|rest_command/i.test((x.message||"")+" "+(x.name||"")+" "+(x.source||"")));
   for(const x of rel.slice(-12)){
     console.log("\n["+(x.level||"?")+"]", (x.name||"").slice(0,80));
     console.log("  ", String(x.message||"").replace(/\s+/g," ").slice(0,400));
   }
   ws.close();process.exit(0);
 }
};
setTimeout(()=>{console.log("timeout");process.exit(0);},10000);
