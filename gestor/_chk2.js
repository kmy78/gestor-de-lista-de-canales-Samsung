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
 for(const id of ["input_select.bobina_en_uso","script.spoolman_descontar","automation.spoolman_descontar_al_terminar"]){
   const e=st.find(x=>x.entity_id===id);
   console.log(id.padEnd(46), e ? ("OK   estado="+String(e.state).slice(0,25)) : "NO EXISTE");
 }
 const sel=st.find(x=>x.entity_id==="input_select.bobina_en_uso");
 if(sel) console.log("   opciones:",JSON.stringify(sel.attributes.options));
})();
