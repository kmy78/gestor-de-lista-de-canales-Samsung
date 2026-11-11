const https=require('https'),fs=require('fs');
const TOKEN=fs.readFileSync("D:\\Descargas\\Deepseek\\ha_token.txt","utf8").trim();
function api(p){return new Promise((res,rej)=>{const r=https.request({host:"192.168.1.5",port:8123,path:p,rejectUnauthorized:false,headers:{Authorization:"Bearer "+TOKEN}},x=>{let b="";x.on("data",d=>b+=d);x.on("end",()=>res({s:x.statusCode,b}));});r.on("error",rej);r.end();});}
(async()=>{
 const r=await api("/api/error_log");
 if(r.s!==200){console.log("error_log ->",r.s,r.b.slice(0,100));return;}
 const lineas=r.b.split("\n");
 const hits=lineas.filter(l=>/spoolman|packages|invalid config|error loading|yaml/i.test(l));
 console.log("lineas del log:",lineas.length,"| con spoolman/packages/errores:",hits.length);
 console.log(hits.slice(-40).join("\n").slice(0,3000));
})();
