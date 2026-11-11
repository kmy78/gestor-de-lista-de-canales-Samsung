const fs=require('fs');
const TOKEN=fs.readFileSync("D:\\Descargas\\Deepseek\\ha_token.txt","utf8").trim();
const ws=new WebSocket("wss://192.168.1.5:8123/api/websocket");
let fase=0;
ws.onmessage=(ev)=>{const m=JSON.parse(ev.data);
 if(m.type==="auth_required") return ws.send(JSON.stringify({type:"auth",access_token:TOKEN}));
 if(m.type==="auth_ok") return ws.send(JSON.stringify({id:2,type:"trace/list",domain:"automation"}));
 if(m.id===2){
   const t=(m.result||[]).filter(x=>/spoolman/i.test(x.item_id));
   if(!t.length){console.log("sin trazas para la automatizacion");ws.close();return process.exit(0);}
   const item=t[0];
   console.log("trazas:",t.length,"| ultima:",item.timestamp);
   return ws.send(JSON.stringify({id:3,type:"trace/get",domain:"automation",item_id:item.item_id,run_id:item.run_id}));
 }
 if(m.id===3){
   const r=m.result||{};
   const tr=r.trace||{};
   console.log("estado de la ejecucion:", JSON.stringify(tr.error||"sin error").slice(0,300));
   const pasos=Object.keys(tr.trace||{});
   console.log("pasos ejecutados:", pasos.length);
   for(const k of pasos.slice(0,14)){
     const v=tr.trace[k][0]||{};
     console.log("  -",k,"->",v.result?JSON.stringify(v.result).slice(0,120):"");
   }
   ws.close();process.exit(0);
 }
};
setTimeout(()=>{console.log("timeout");process.exit(0);},12000);
