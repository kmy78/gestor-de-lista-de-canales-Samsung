const https=require('https'),http=require('http'),fs=require('fs');
const TOKEN=fs.readFileSync("D:\\Descargas\\Deepseek\\ha_token.txt","utf8").trim();
function ha(p,method="GET",body){return new Promise((res,rej)=>{
 const data=body?JSON.stringify(body):null;
 const r=https.request({host:"192.168.1.5",port:8123,path:p,method,rejectUnauthorized:false,timeout:8000,
  headers:Object.assign({Authorization:"Bearer "+TOKEN},data?{"Content-Type":"application/json","Content-Length":Buffer.byteLength(data)}:{})},x=>{
   let b="";x.on("data",d=>b+=d);x.on("end",()=>res({s:x.statusCode,b}));});
 r.on("error",rej);r.on("timeout",()=>{r.destroy();rej(new Error("timeout"));});if(data)r.write(data);r.end();});}
function sm(p,method="GET",body){return new Promise((res)=>{const data=body?JSON.stringify(body):null;
 const r=http.request({host:"192.168.1.16",port:7913,path:p,method,timeout:8000,
  headers:Object.assign({},data?{"Content-Type":"application/json","Content-Length":Buffer.byteLength(data)}:{})},x=>{
  let b="";x.on("data",d=>b+=d);x.on("end",()=>res({s:x.statusCode,b}));});
 r.on("error",e=>res({s:0,b:e.code}));if(data)r.write(data);r.end();});}
const esperar=(ms)=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 let arriba=false;
 for(let i=0;i<20;i++){
   try{const r=await ha("/api/"); if(r.s===401||r.s===200){arriba=true;break;}}catch(e){}
   await esperar(5000);
 }
 console.log("HA responde:",arriba?"si":"no");
 if(!arriba) return;
 await esperar(4000);
 const st=JSON.parse((await ha("/api/states")).b);
 const t=(id)=>st.some(x=>x.entity_id===id);
 console.log("selector:",t("input_select.bobina_en_uso"),"| script:",t("script.spoolman_descontar"),"| automatizacion:",t("automation.spoolman_descontar_al_terminar"));
})();
