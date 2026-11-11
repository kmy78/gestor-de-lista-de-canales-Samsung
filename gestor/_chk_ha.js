const https=require('https'),fs=require('fs');
const TOKEN=fs.readFileSync("D:\\Descargas\\Deepseek\\ha_token.txt","utf8").trim();
function api(p,method="GET",body){return new Promise((res,rej)=>{
 const data=body?JSON.stringify(body):null;
 const r=https.request({host:"192.168.1.5",port:8123,path:p,method,rejectUnauthorized:false,
  headers:Object.assign({Authorization:"Bearer "+TOKEN},data?{"Content-Type":"application/json","Content-Length":Buffer.byteLength(data)}:{})},x=>{
   let b="";x.on("data",d=>b+=d);x.on("end",()=>res({s:x.statusCode,b}));});
 r.on("error",rej);if(data)r.write(data);r.end();});}
(async()=>{
 const st=JSON.parse((await api("/api/states")).b);
 const buscar=(id)=>{const e=st.find(x=>x.entity_id===id);return e;};
 for(const id of ["input_select.bobina_en_uso","script.spoolman_descontar","automation.spoolman_descontar_al_terminar","rest_command.spoolman_usar_filamento"]){
   const e=buscar(id);
   console.log(id.padEnd(50), e? ("OK  estado="+String(e.state).slice(0,20)) : "NO EXISTE");
 }
 const t=buscar("sensor.la_creadora_total_filament_used");
 if(t) console.log("\ntotal_filament_used -> atributos:",JSON.stringify(t.attributes));
})();
