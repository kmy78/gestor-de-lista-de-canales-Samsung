const http=require('http');
function get(path){return new Promise(res=>{const r=http.get({host:"192.168.1.16",port:7912,path,timeout:6000},x=>{let b="";x.on("data",d=>b+=d);x.on("end",()=>res({s:x.statusCode,b}));});r.on("error",e=>res({e:e.code}));r.on("timeout",()=>{r.destroy();res({e:"timeout"});});});}
(async()=>{
 const i=await get("/api/v1/info");
 if(i.e){console.log("sin respuesta:",i.e);return;}
 console.log("Spoolman responde:",i.s,"|",i.b.replace(/\s+/g," ").slice(0,160));
 for(const p of ["/api/v1/spool","/api/v1/filament","/api/v1/vendor"]){
   const r=await get(p);
   if(r.e){console.log(p,"->",r.e);continue;}
   let n=0; try{n=JSON.parse(r.b).length;}catch(e){}
   console.log(p,"->",r.s,"| elementos:",n);
 }
})();
