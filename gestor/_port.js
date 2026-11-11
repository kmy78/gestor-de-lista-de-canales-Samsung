const https=require('https');
function get(path){return new Promise(res=>{
 https.get({host:"192.168.1.16",port:19943,path,rejectUnauthorized:false,
   headers:{"User-Agent":"check"}},r=>{
   let b="";r.on("data",d=>{if(b.length<500)b+=d.toString();});
   r.on("end",()=>res({s:r.statusCode,b:b}));
 }).on("error",e=>res({e:e.message}));
});}
(async()=>{
 for(const p of ["/api/system/status","/api/status","/"]){
  const r=await get(p);
  if(r.e){console.log(p,"->",r.e);continue;}
  console.log(p,"->",r.s,"|",r.b.replace(/\s+/g," ").slice(0,140));
 }
})();
