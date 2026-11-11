const https=require('https'),http=require('http'),fs=require('fs');
const TOKEN=fs.readFileSync("D:\\Descargas\\Deepseek\\ha_token.txt","utf8").trim();
function ha(p,method="GET",body){return new Promise((res,rej)=>{const data=body?JSON.stringify(body):null;
 const r=https.request({host:"192.168.1.5",port:8123,path:p,method,rejectUnauthorized:false,timeout:15000,
  headers:Object.assign({Authorization:"Bearer "+TOKEN},data?{"Content-Type":"application/json","Content-Length":Buffer.byteLength(data)}:{})},x=>{let b="";x.on("data",d=>b+=d);x.on("end",()=>res({s:x.statusCode,b}));});
 r.on("error",rej);if(data)r.write(data);r.end();});}
function sm(p,method="GET",body){return new Promise((res)=>{const data=body?JSON.stringify(body):null;
 const r=http.request({host:"192.168.1.16",port:7913,path:p,method,timeout:8000,
  headers:Object.assign({},data?{"Content-Type":"application/json","Content-Length":Buffer.byteLength(data)}:{})},x=>{let b="";x.on("data",d=>b+=d);x.on("end",()=>res({s:x.statusCode,b}));});
 r.on("error",e=>res({s:0,b:e.code}));if(data)r.write(data);r.end();});}
const esperar=(ms)=>new Promise(r=>setTimeout(r,ms));
const ws=new WebSocket("wss://192.168.1.5:8123/api/websocket");
ws.onmessage=async(ev)=>{const m=JSON.parse(ev.data);
 if(m.type==="auth_required") return ws.send(JSON.stringify({type:"auth",access_token:TOKEN}));
 if(m.type==="auth_ok"){
   const st=JSON.parse((await ha("/api/states")).b);
   const sel=st.find(e=>e.entity_id==="input_select.bobina_en_uso");
   console.log("selector:", sel.state, "| opciones:", JSON.stringify(sel.attributes.options));
   if(JSON.stringify(sel.attributes.options).indexOf("A4")<0){ console.log("EL SELECTOR SIGUE CON LOS NOMBRES: no pruebo"); ws.close(); return process.exit(0); }

   const antes=JSON.parse((await sm("/api/v1/spool")).b).find(x=>x.id===5);
   console.log("bobina 5 antes:",antes.remaining_weight,"g");

   await ha("/api/services/input_select/select_option","POST",{entity_id:"input_select.bobina_en_uso",option:"A4"});
   await esperar(800);
   await ha("/api/services/automation/trigger","POST",{entity_id:"automation.spoolman_descontar_al_terminar_la_impresion",skip_condition:true});
   await esperar(3500);

   const t=JSON.parse((await ha("/api/traces/automation/automation.spoolman_descontar_al_terminar_la_impresion")).b||"[]");
   return ws.send(JSON.stringify({id:2,type:"trace/list",domain:"automation"}));
 }
 if(m.id===2){
   const t=(m.result||[]).filter(x=>/spoolman/i.test(x.item_id))
     .sort((a,b)=>String(b.timestamp.start).localeCompare(String(a.timestamp.start)));
   return ws.send(JSON.stringify({id:3,type:"trace/get",domain:"automation",item_id:t[0].item_id,run_id:t[0].run_id}));
 }
 if(m.id===3){
   const tr=(m.result||{}).trace||{};
   for(const k of ["action/0","action/1"]){ console.log("\n=== "+k+" ==="); console.log(JSON.stringify(tr[k]||"sin datos").slice(0,450)); }
   // restaurar
   const desp=JSON.parse((await sm("/api/v1/spool")).b).find(x=>x.id===5);
   console.log("\nbobina 5 despues:",desp.remaining_weight,"g");
   await sm("/api/v1/spool/5","PATCH",{used_weight:0});
   await ha("/api/services/input_select/select_option","POST",{entity_id:"input_select.bobina_en_uso",option:"A1"});
   const fin=JSON.parse((await sm("/api/v1/spool")).b).find(x=>x.id===5);
   console.log("restaurada a:",fin.remaining_weight,"g | selector devuelto a A1");
   ws.close();process.exit(0);
 }
};
setTimeout(()=>process.exit(0),25000);
