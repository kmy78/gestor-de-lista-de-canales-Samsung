const https=require('https');
function get(path){return new Promise(res=>{
 https.get({host:"192.168.1.5",port:8123,path:path,rejectUnauthorized:false,
   headers:{"User-Agent":"check"}},r=>{
   let b="";r.on("data",d=>{if(b.length<400)b+=d.toString();});
   r.on("end",()=>res({status:r.statusCode,headers:r.headers,body:b}));
 }).on("error",e=>res({error:e.message}));
});}
(async()=>{
 for(const p of ["/api/","/manifest.json","/"]){
   const r=await get(p);
   if(r.error){console.log(p,"->",r.error);continue;}
   console.log(p,"->",r.status);
   if(p==="/api/") console.log("   body:", r.body.trim().slice(0,120));
   if(p==="/manifest.json") console.log("   name:", (JSON.parse(r.body||"{}").name||"?"), "| short_name:", (JSON.parse(r.body||"{}").short_name||"?"));
 }
})();
