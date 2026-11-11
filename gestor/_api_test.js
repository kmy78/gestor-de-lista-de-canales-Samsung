const http=require('http');
function call(method,path,body){return new Promise((res)=>{const data=body?JSON.stringify(body):null;
 const r=http.request({host:"192.168.1.16",port:7913,path,method,timeout:8000,
  headers:Object.assign({},data?{"Content-Type":"application/json","Content-Length":Buffer.byteLength(data)}:{})},x=>{
  let b="";x.on("data",d=>b+=d);x.on("end",()=>res({s:x.statusCode,b}));});
 r.on("error",e=>res({s:0,b:e.code}));if(data)r.write(data);r.end();});}
(async()=>{
 // 1) buscar bobina por nombre de filamento
 const f=await call("GET","/api/v1/spool?filament.name=PLA&allow_archived=false");
 console.log("buscar 'PLA' ->",f.s);
 let l=[];try{l=JSON.parse(f.b);}catch(e){}
 console.log("  coincidencias:",l.length, l.map(x=>"id="+x.id+" rest="+x.remaining_weight).join(", "));

 if(l.length){
  const id=l[0].id;
  // 2) descontar 0,5 g de prueba
  const u=await call("PATCH",`/api/v1/spool/${id}/use`,{use_weight:0.5});
  console.log("descontar 0.5 g ->",u.s,"| restante:",JSON.parse(u.b).remaining_weight);
  // 3) devolverlo
  const r=await call("PATCH",`/api/v1/spool/${id}`,{used_weight:0});
  console.log("restaurar ->",r.s,"| restante:",JSON.parse(r.b).remaining_weight);
 }
})();
