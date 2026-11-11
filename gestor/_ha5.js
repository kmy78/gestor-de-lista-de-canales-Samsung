const https=require('https'),fs=require('fs');
const TOKEN=fs.readFileSync("D:\\Descargas\\Deepseek\\ha_token.txt","utf8").trim();
function api(p){return new Promise((res)=>{const req=https.request({host:"192.168.1.5",port:8123,path:p,rejectUnauthorized:false,headers:{Authorization:"Bearer "+TOKEN}},r=>{let b="";r.on("data",d=>b+=d);r.on("end",()=>res({status:r.statusCode,body:b}));});req.on("error",e=>res({status:0,body:e.message}));req.end();});}
(async()=>{
 const c=await api("/api/config");
 if(c.status===200){const j=JSON.parse(c.body);
   console.log("instalacion:",j.installation_type,"| version:",j.version,"| supervisor:",j.supervisor||"(no)");}
 for(const p of ["/api/hassio/supervisor/info","/api/hassio/addons"]){
   const r=await api(p);
   console.log(p,"->",r.status, r.status===401?"(sin permiso de supervisor)":r.body.slice(0,80));
 }
})();
