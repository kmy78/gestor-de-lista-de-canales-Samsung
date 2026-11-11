const https=require('https'),fs=require('fs');
const TOKEN=fs.readFileSync("D:\\Descargas\\Deepseek\\ha_token.txt","utf8").trim();
function ha(p){return new Promise((res,rej)=>{const r=https.request({host:"192.168.1.5",port:8123,path:p,rejectUnauthorized:false,timeout:12000,headers:{Authorization:"Bearer "+TOKEN}},x=>{let b="";x.on("data",d=>b+=d);x.on("end",()=>res(b));});r.on("error",rej);r.end();});}
const ws=new WebSocket("wss://192.168.1.5:8123/api/websocket");
ws.onmessage=async(ev)=>{const m=JSON.parse(ev.data);
 if(m.type==="auth_required") return ws.send(JSON.stringify({type:"auth",access_token:TOKEN}));
 if(m.type==="auth_ok"){
   const st=JSON.parse(await ha("/api/states"));
   const sel=st.find(e=>e.entity_id==="input_select.bobina_en_uso");
   console.log("selector:", sel? sel.state+" | opciones="+JSON.stringify(sel.attributes.options) : "no existe");
   for(let i=1;i<=4;i++){
     const loc=st.find(e=>e.entity_id==="sensor.spoolman_spool_"+i+"_location");
     const peso=st.find(e=>e.entity_id==="sensor.spoolman_spool_"+i);
     console.log("  bobina",i,"| ubicacion:",loc?loc.state:"?","| restante:",peso?peso.state:"?","g");
   }
   return ws.send(JSON.stringify({id:2,type:"trace/list",domain:"automation"}));
 }
 if(m.id===2){
   const t=(m.result||[]).filter(x=>/spoolman/i.test(x.item_id))
     .sort((a,b)=>String(b.timestamp.start).localeCompare(String(a.timestamp.start)));
   console.log("\ntrazas:",t.length, t.length?("| ultima: "+t[0].timestamp.start):"");
   if(!t.length){ws.close();return process.exit(0);}
   return ws.send(JSON.stringify({id:3,type:"trace/get",domain:"automation",item_id:t[0].item_id,run_id:t[0].run_id}));
 }
 if(m.id===3){
   const tr=(m.result||{}).trace||{};
   for(const k of Object.keys(tr)){ if(k==="trigger") continue;
     console.log("\n=== "+k+" ==="); console.log(JSON.stringify(tr[k]).slice(0,500)); }
   ws.close();process.exit(0);
 }
};
setTimeout(()=>process.exit(0),15000);
