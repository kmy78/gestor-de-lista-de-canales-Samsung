const http=require('http');
function get(p){return new Promise(res=>{const r=http.get({host:"192.168.1.16",port:7913,path:p,timeout:8000},x=>{let b="";x.on("data",d=>b+=d);x.on("end",()=>res(b));});r.on("error",e=>res(""));r.end();});}
(async()=>{
 const l=JSON.parse(await get("/api/v1/spool?allow_archived=true")||"[]");
 console.log("bobinas en Spoolman:",l.length);
 for(const s of l) console.log("  id",s.id,"|",(s.filament.name||"?").padEnd(12),"| ubicacion:",(s.location||"-").padEnd(4),"| restante:",s.remaining_weight,"g | archivada:",s.archived);
})();
