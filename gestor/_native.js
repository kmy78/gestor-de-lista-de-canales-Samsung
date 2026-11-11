const https=require('https'),http=require('http'),fs=require('fs');
const TOKEN=fs.readFileSync("D:\\Descargas\\Deepseek\\ha_token.txt","utf8").trim();
function ha(p,method="GET",body){return new Promise((res,rej)=>{
 const data=body?JSON.stringify(body):null;
 const r=https.request({host:"192.168.1.5",port:8123,path:p,method,rejectUnauthorized:false,timeout:10000,
  headers:Object.assign({Authorization:"Bearer "+TOKEN},data?{"Content-Type":"application/json","Content-Length":Buffer.byteLength(data)}:{})},x=>{
   let b="";x.on("data",d=>b+=d);x.on("end",()=>res({s:x.statusCode,b}));});
 r.on("error",rej);if(data)r.write(data);r.end();});}
function sm(p,method="GET",body){return new Promise((res)=>{const data=body?JSON.stringify(body):null;
 const r=http.request({host:"192.168.1.16",port:7913,path:p,method,timeout:8000,
  headers:Object.assign({},data?{"Content-Type":"application/json","Content-Length":Buffer.byteLength(data)}:{})},x=>{
  let b="";x.on("data",d=>b+=d);x.on("end",()=>res({s:x.statusCode,b}));});
 r.on("error",e=>res({s:0,b:e.code}));if(data)r.write(data);r.end();});}
const esperar=(ms)=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const antes=JSON.parse((await sm("/api/v1/spool")).b).find(x=>x.id===1);
 console.log("antes:",antes.filament.name,antes.remaining_weight,"g");
 const r=await ha("/api/services/spoolman/use_spool_filament","POST",{id:1,use_weight:1.5});
 console.log("servicio spoolman.use_spool_filament ->",r.s,(r.b||"").slice(0,120));
 await esperar(2000);
 const st=JSON.parse((await ha("/api/states")).b);
 const s1=st.find(e=>e.entity_id==="sensor.spoolman_spool_1");
 console.log("sensor en HA:",s1?s1.state:"?","g");
 const desp=JSON.parse((await sm("/api/v1/spool")).b).find(x=>x.id===1);
 console.log("en Spoolman:",desp.remaining_weight,"g  (esperado",(antes.remaining_weight-1.5).toFixed(2)+")");
 await sm("/api/v1/spool/1","PATCH",{used_weight:0});
 await esperar(1500);
 const fin=JSON.parse((await sm("/api/v1/spool")).b).find(x=>x.id===1);
 console.log("restaurado:",fin.remaining_weight,"g");
})();
