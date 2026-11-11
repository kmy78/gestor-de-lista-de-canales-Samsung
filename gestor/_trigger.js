const https=require('https'),fs=require('fs');
const TOKEN=fs.readFileSync("D:\\Descargas\\Deepseek\\ha_token.txt","utf8").trim();
function ha(p,method="GET",body){return new Promise((res,rej)=>{
 const data=body?JSON.stringify(body):null;
 const r=https.request({host:"192.168.1.5",port:8123,path:p,method,rejectUnauthorized:false,timeout:15000,
  headers:Object.assign({Authorization:"Bearer "+TOKEN},data?{"Content-Type":"application/json","Content-Length":Buffer.byteLength(data)}:{})},x=>{
   let b="";x.on("data",d=>b+=d);x.on("end",()=>res({s:x.statusCode,b}));});
 r.on("error",rej);if(data)r.write(data);r.end();});}
const esperar=(ms)=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const r=await ha("/api/services/automation/trigger","POST",{entity_id:"automation.spoolman_descontar_al_terminar_la_impresion",skip_condition:true});
 console.log("disparo ->",r.s);
 await esperar(4000);
 const st=JSON.parse((await ha("/api/states")).b);
 const notif=st.filter(e=>e.entity_id.startsWith("persistent_notification."));
 console.log("notificaciones:",notif.length);
 for(const n of notif.slice(-4)) console.log("   -",n.attributes.title,"|",String(n.attributes.message||"").replace(/\s+/g," ").slice(0,120));
 const aut=st.find(e=>e.entity_id==="automation.spoolman_descontar_al_terminar_la_impresion");
 console.log("ultima ejecucion:",aut? aut.attributes.last_triggered : "-");
})();
