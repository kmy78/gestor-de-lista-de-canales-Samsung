const http=require('http');
function call(method,path,body){return new Promise((res)=>{const data=body?JSON.stringify(body):null;
 const r=http.request({host:"192.168.1.16",port:7913,path,method,timeout:8000,
  headers:Object.assign({},data?{"Content-Type":"application/json","Content-Length":Buffer.byteLength(data)}:{})},x=>{
  let b="";x.on("data",d=>b+=d);x.on("end",()=>res({s:x.statusCode,b}));});
 r.on("error",e=>res({s:0,b:e.code}));if(data)r.write(data);r.end();});}
(async()=>{
 for(const m of ["PUT","POST"]){
  const u=await call(m,"/api/v1/spool/1/use",{use_weight:0.5});
  let extra=""; try{extra="| restante: "+JSON.parse(u.b).remaining_weight;}catch(e){extra="| "+u.b.slice(0,60);}
  console.log(m,"/spool/1/use ->",u.s,extra);
  if(u.s<300){ const r=await call("PATCH","/api/v1/spool/1",{used_weight:0}); console.log("   restaurado ->",r.s, JSON.parse(r.b).remaining_weight); }
 }
 const all=await call("GET","/api/v1/spool?allow_archived=false");
 const l=JSON.parse(all.b);
 console.log("\nbobinas:",l.map(x=>`${x.id}: ${x.filament.name} (${x.remaining_weight} g)`).join(" | "));
})();
