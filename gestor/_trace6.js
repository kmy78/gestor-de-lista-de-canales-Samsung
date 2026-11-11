const fs=require('fs');
const TOKEN=fs.readFileSync("D:\\Descargas\\Deepseek\\ha_token.txt","utf8").trim();
const ws=new WebSocket("wss://192.168.1.5:8123/api/websocket");
ws.onmessage=(ev)=>{const m=JSON.parse(ev.data);
 if(m.type==="auth_required") return ws.send(JSON.stringify({type:"auth",access_token:TOKEN}));
 if(m.type==="auth_ok") return ws.send(JSON.stringify({id:2,type:"trace/list",domain:"automation"}));
 if(m.id===2){
   const t=(m.result||[]).filter(x=>/spoolman/i.test(x.item_id))
     .sort((a,b)=>String(b.timestamp.start).localeCompare(String(a.timestamp.start)));
   console.log("usando traza de:",t[0].timestamp.start);
   return ws.send(JSON.stringify({id:3,type:"trace/get",domain:"automation",item_id:t[0].item_id,run_id:t[0].run_id}));
 }
 if(m.id===3){
   const tr=(m.result||{}).trace||{};
   for(const k of Object.keys(tr)){
     if(k==="trigger") continue;
     console.log("\n=== "+k+" ===");
     console.log(JSON.stringify(tr[k]).slice(0,600));
   }
   ws.close();process.exit(0);
 }
};
setTimeout(()=>process.exit(0),12000);
