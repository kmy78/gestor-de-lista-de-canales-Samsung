const https=require('https'),fs=require('fs');
const TOKEN=fs.readFileSync("D:\\Descargas\\Deepseek\\ha_token.txt","utf8").trim();
function api(p,method="GET"){return new Promise((res)=>{const req=https.request({host:"192.168.1.5",port:8123,path:p,method,rejectUnauthorized:false,headers:{Authorization:"Bearer "+TOKEN,"Content-Type":"application/json"}},r=>{let b="";r.on("data",d=>b+=d);r.on("end",()=>res({status:r.statusCode,body:b}));});req.on("error",e=>res({status:0,body:e.message}));req.end();});}
(async()=>{
 for(const p of ["/api/hassio/supervisor/info","/api/hassio/addons","/api/hassio/store/repositories"]){
   const r=await api(p);
   console.log("==",p,"->",r.status);
   if(r.status===200){
     const j=JSON.parse(r.body);
     if(p.endsWith("supervisor/info")) console.log("   version:",j.data.version,"| canal:",j.data.channel);
     if(p.endsWith("addons")){
       const l=(j.data.addons||[]);
       console.log("   addons instalados:",l.length);
       for(const a of l.slice(0,12)) console.log("     -",a.slug,"|",a.name,"|",a.state);
     }
     if(p.endsWith("repositories")){
       const l=(j.data.repositories||[]);
       console.log("   repos:",l.length);
       for(const a of l) console.log("     -",a.name||a.slug,"|",a.url);
     }
   } else console.log("   ",r.body.slice(0,100));
 }
})();
