const http=require('http');
function get(p){return new Promise(res=>{const r=http.get({host:"192.168.1.16",port:7913,path:p,timeout:6000},x=>{let b="";x.on("data",d=>b+=d);x.on("end",()=>res(b));});r.on("error",e=>res(""));r.on("timeout",()=>{r.destroy();res("");});});}
(async()=>{
 for(const p of ["/api/v1/spool","/api/v1/filament","/api/v1/vendor"]){
   const b=await get(p); let n=0; try{n=JSON.parse(b).length;}catch(e){}
   console.log(p.padEnd(22), "->", n, "elementos");
 }
 const f=JSON.parse(await get("/api/v1/filament")||"[]");
 for(const x of f.slice(0,5)) console.log("   filamento:",x.name,"|",x.material,"|",x.color_hex);
})();
