const https=require('https'),fs=require('fs');
const TOKEN=fs.readFileSync("D:\\Descargas\\Deepseek\\ha_token.txt","utf8").trim();
function api(p){return new Promise((res,rej)=>{const req=https.request({host:"192.168.1.5",port:8123,path:p,rejectUnauthorized:false,headers:{Authorization:"Bearer "+TOKEN}},r=>{let b="";r.on("data",d=>b+=d);r.on("end",()=>{if(r.statusCode>=400)return rej(new Error(r.statusCode));res(JSON.parse(b));});});req.on("error",rej);req.end();});}
(async()=>{
 const st=await api("/api/states");
 const lc=st.filter(e=>/creadora/i.test(e.entity_id));
 const disp=lc.filter(e=>e.state!=="unavailable");
 console.log("La Creadora:",lc.length,"entidades |",disp.length,"disponibles");
 const interes=["estado_de_impresion","estado_actual","print_status","a1_","a2_","a3_","a4_","active_tray","total_filament","current_extrusion","nozzle","bed_temperature","box_temp","percent_complete","file_name"];
 for(const e of lc){
   if(!interes.some(k=>e.entity_id.includes(k))) continue;
   const marca = e.state==="unavailable" ? "  --  " : "  OK  ";
   console.log(marca, e.entity_id.replace("sensor.la_creadora_","").padEnd(30), "=", String(e.state).slice(0,40));
 }
})();
