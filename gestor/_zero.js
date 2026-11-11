const https=require('https'),fs=require('fs');
const TOKEN=fs.readFileSync("D:\\Descargas\\Deepseek\\ha_token.txt","utf8").trim();
function ha(p,method="GET",body){return new Promise((res,rej)=>{
 const data=body?JSON.stringify(body):null;
 const r=https.request({host:"192.168.1.5",port:8123,path:p,method,rejectUnauthorized:false,timeout:15000,
  headers:Object.assign({Authorization:"Bearer "+TOKEN},data?{"Content-Type":"application/json","Content-Length":Buffer.byteLength(data)}:{})},x=>{
   let b="";x.on("data",d=>b+=d);x.on("end",()=>res({s:x.statusCode,b}));});
 r.on("error",rej);if(data)r.write(data);r.end();});}
(async()=>{
 const r=await ha("/api/services/spoolman/use_spool_filament","POST",{id:1,use_weight:0});
 console.log("use_weight=0 ->",r.s,"|",(r.b||"").slice(0,200));
 const st=JSON.parse((await ha("/api/states")).b);
 const s1=st.find(e=>e.entity_id==="sensor.spoolman_spool_1");
 console.log("bobina 1 sigue en:",s1?s1.state:"?","g");
})();
