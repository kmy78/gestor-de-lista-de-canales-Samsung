const https=require('https'),fs=require('fs');
const TOKEN=fs.readFileSync("D:\\Descargas\\Deepseek\\ha_token.txt","utf8").trim();
function api(p){return new Promise((res,rej)=>{const req=https.request({host:"192.168.1.5",port:8123,path:p,rejectUnauthorized:false,headers:{Authorization:"Bearer "+TOKEN}},r=>{let b="";r.on("data",d=>b+=d);r.on("end",()=>res(JSON.parse(b)));});req.on("error",rej);req.end();});}
(async()=>{
 const ids=["sensor.la_creadora_active_tray_id","sensor.la_creadora_total_filament_used",
            "sensor.la_creadora_estado_de_impresion","sensor.la_creadora_a1_name",
            "sensor.la_creadora_file_name","sensor.la_creadora_task_id"];
 for(const id of ids){
  try{const s=await api("/api/states/"+id);
   console.log(id.replace("sensor.la_creadora_","").padEnd(26),"estado:",String(s.state).slice(0,20));
   console.log("   atributos:",JSON.stringify(s.attributes).slice(0,220));
  }catch(e){console.log(id,"-> no existe");}
 }
})();
