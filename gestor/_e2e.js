const https=require('https'),http=require('http'),fs=require('fs');
const TOKEN=fs.readFileSync("D:\\Descargas\\Deepseek\\ha_token.txt","utf8").trim();
function ha(p,method="GET",body){return new Promise((res,rej)=>{
 const data=body?JSON.stringify(body):null;
 const r=https.request({host:"192.168.1.5",port:8123,path:p,method,rejectUnauthorized:false,
  headers:Object.assign({Authorization:"Bearer "+TOKEN},data?{"Content-Type":"application/json","Content-Length":Buffer.byteLength(data)}:{})},x=>{
   let b="";x.on("data",d=>b+=d);x.on("end",()=>res({s:x.statusCode,b}));});
 r.on("error",rej);if(data)r.write(data);r.end();});}
function sm(p,method="GET",body){return new Promise((res)=>{const data=body?JSON.stringify(body):null;
 const r=http.request({host:"192.168.1.16",port:7913,path:p,method,timeout:8000,
  headers:Object.assign({},data?{"Content-Type":"application/json","Content-Length":Buffer.byteLength(data)}:{})},x=>{
  let b="";x.on("data",d=>b+=d);x.on("end",()=>res({s:x.statusCode,b}));});
 r.on("error",e=>res({s:0,b:e.code}));if(data)r.write(data);r.end();});}
(async()=>{
 const st=JSON.parse((await ha("/api/states")).b);
 const tiene=(id)=>st.some(x=>x.entity_id===id);
 const ok1=tiene("input_select.bobina_en_uso"), ok2=tiene("script.spoolman_descontar"), ok3=tiene("automation.spoolman_descontar_al_terminar");
 console.log("selector:",ok1?"OK":"NO |","| script:",ok2?"OK":"NO |","| automatizacion:",ok3?"OK":"NO");
 if(!(ok1&&ok2)){console.log("faltan componentes, no pruebo");return;}

 const sel=st.find(x=>x.entity_id==="input_select.bobina_en_uso");
 console.log("opciones del selector:",JSON.stringify(sel.attributes.options));
 const antes=JSON.parse((await sm("/api/v1/spool")).b).find(x=>x.filament.name==="PLA");
 console.log("PLA antes:",antes.remaining_weight,"g");

 const r=await ha("/api/services/script/spoolman_descontar","POST",{nombre:"PLA",gramos:1.5});
 console.log("llamada al script ->",r.s);

 await new Promise(z=>setTimeout(z,1500));
 const desp=JSON.parse((await sm("/api/v1/spool")).b).find(x=>x.filament.name==="PLA");
 console.log("PLA despues:",desp.remaining_weight,"g  (esperado",(antes.remaining_weight-1.5).toFixed(2)+")");

 await sm("/api/v1/spool/"+antes.id,"PATCH",{used_weight:0});
 const fin=JSON.parse((await sm("/api/v1/spool")).b).find(x=>x.filament.name==="PLA");
 console.log("restaurado:",fin.remaining_weight,"g");
})();
