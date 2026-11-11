const https=require('https'),http=require('http'),fs=require('fs');
const TOKEN=fs.readFileSync("D:\\Descargas\\Deepseek\\ha_token.txt","utf8").trim();
function ha(p,method="GET",body){return new Promise((res,rej)=>{
 const data=body?JSON.stringify(body):null;
 const r=https.request({host:"192.168.1.5",port:8123,path:p,method,rejectUnauthorized:false,timeout:8000,
  headers:Object.assign({Authorization:"Bearer "+TOKEN},data?{"Content-Type":"application/json","Content-Length":Buffer.byteLength(data)}:{})},x=>{
   let b="";x.on("data",d=>b+=d);x.on("end",()=>res({s:x.statusCode,b}));});
 r.on("error",rej);r.on("timeout",()=>{r.destroy();rej(new Error("t"));});if(data)r.write(data);r.end();});}
const esperar=(ms)=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 let ok=false;
 for(let i=0;i<30;i++){
   try{const r=await ha("/api/"); if(r.s===200||r.s===401){ok=true;break;}}catch(e){}
   await esperar(5000);
 }
 console.log("HA en linea:",ok);
 if(!ok)return;
 await esperar(8000);
 const st=JSON.parse((await ha("/api/states")).b);
 for(const id of ["input_select.bobina_en_uso","script.spoolman_descontar","automation.spoolman_descontar_al_terminar"]){
   const e=st.find(x=>x.entity_id===id);
   console.log(" ",id.padEnd(46), e? "OK  ("+String(e.state).slice(0,20)+")" : "NO EXISTE");
 }
 const sel=st.find(x=>x.entity_id==="input_select.bobina_en_uso");
 if(sel) console.log("  opciones:",JSON.stringify(sel.attributes.options));
})();
