const https=require('https'),fs=require('fs');
const TOKEN=fs.readFileSync("D:\\Descargas\\Deepseek\\ha_token.txt","utf8").trim();
function ha(p,method="GET",body){return new Promise((res,rej)=>{const data=body?JSON.stringify(body):null;
 const r=https.request({host:"192.168.1.5",port:8123,path:p,method,rejectUnauthorized:false,timeout:15000,
  headers:Object.assign({Authorization:"Bearer "+TOKEN},data?{"Content-Type":"application/json","Content-Length":Buffer.byteLength(data)}:{})},x=>{let b="";x.on("data",d=>b+=d);x.on("end",()=>res({s:x.statusCode,b}));});
 r.on("error",rej);if(data)r.write(data);r.end();});}
const ws=new WebSocket("wss://192.168.1.5:8123/api/websocket");
let fase=0;
ws.onmessage=async(ev)=>{const m=JSON.parse(ev.data);
 if(m.type==="auth_required") return ws.send(JSON.stringify({type:"auth",access_token:TOKEN}));
 if(m.type==="auth_ok" && fase===0){
   fase=1;
   const a=await ha("/api/states/automation.spoolman_descontar_al_terminar_la_impresion");
   const j=a.s===200?JSON.parse(a.b):null;
   console.log("automatizacion:", j? j.state+" | last_triggered="+j.attributes.last_triggered : "HTTP "+a.s);
   const t=await ha("/api/services/automation/trigger","POST",{entity_id:"automation.spoolman_descontar_al_terminar_la_impresion",skip_condition:true});
   console.log("disparo ->",t.s);
   await new Promise(z=>setTimeout(z,3500));
   ws.send(JSON.stringify({id:2,type:"trace/list",domain:"automation"}));
   return;
 }
 if(m.id===2){
   const t=(m.result||[]).filter(x=>/spoolman/i.test(x.item_id))
     .sort((a,b)=>String(b.timestamp.start).localeCompare(String(a.timestamp.start)));
   if(!t.length){console.log("sin trazas");ws.close();return process.exit(0);}
   console.log("traza mas reciente:",t[0].timestamp.start);
   return ws.send(JSON.stringify({id:3,type:"trace/get",domain:"automation",item_id:t[0].item_id,run_id:t[0].run_id}));
 }
 if(m.id===3){
   const tr=(m.result||{}).trace||{};
   for(const k of Object.keys(tr)){ if(k==="trigger") continue;
     console.log("\n=== "+k+" ==="); console.log(JSON.stringify(tr[k]).slice(0,550)); }
   ws.close();process.exit(0);
 }
};
setTimeout(()=>process.exit(0),18000);
