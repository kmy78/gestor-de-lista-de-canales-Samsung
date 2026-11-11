const https=require('https'),fs=require('fs');
const TOKEN=fs.readFileSync("D:\\Descargas\\Deepseek\\portainer_token.txt","utf8").trim();
function api(path){return new Promise((res,rej)=>{
 const req=https.request({host:"192.168.1.16",port:19943,path:"/api"+path,method:"GET",rejectUnauthorized:false,
   headers:{"X-API-Key":TOKEN}},r=>{let b="";r.on("data",d=>b+=d);
   r.on("end",()=>{ if(r.statusCode>=400) return rej(new Error("HTTP "+r.statusCode+" "+b.slice(0,120)));
                    try{res(JSON.parse(b));}catch(e){res(b);} });});
 req.on("error",rej); req.end();});}
(async()=>{
 try{
  const eps=await api("/endpoints");
  console.log("entornos:",eps.length);
  for(const e of eps) console.log("  id",e.Id,"|",e.Name,"| tipo:",e.Type,"| url:",e.URL,"| estado:",e.Status);
  const id=eps[0].Id;
  const cs=await api(`/endpoints/${id}/docker/containers/json?all=1`);
  const sp=cs.filter(c=>JSON.stringify(c.Names).includes("spoolman"));
  console.log("\ncontenedores spoolman:",sp.length);
  for(const c of sp){
    console.log("  nombre:",c.Names.join(","),"| estado:",c.State,"| status:",c.Status);
    console.log("  puertos:",JSON.stringify(c.Ports));
  }
  if(sp.length){
    const c=sp[0];
    const req=https.request({host:"192.168.1.16",port:19943,path:`/api/endpoints/${id}/docker/containers/${c.Id}/logs?stdout=1&stderr=1&tail=60`,method:"GET",rejectUnauthorized:false,headers:{"X-API-Key":TOKEN}},r=>{
      let buf=Buffer.alloc(0);
      r.on("data",d=>buf=Buffer.concat([buf,d]));
      r.on("end",()=>{
        // Docker multiplexa stdout/stderr con cabecera de 8 bytes
        let out="",i=0;
        while(i+8<=buf.length){
          const len=buf.readUInt32BE(i+4);
          out+=buf.slice(i+8,i+8+len).toString("utf8");
          i+=8+len;
        }
        console.log("\n--- LOGS (ultimas lineas) ---");
        console.log(out.split("\n").slice(-45).join("\n"));
      });
    });
    req.on("error",e=>console.log("error logs:",e.message));
    req.end();
  }
 }catch(e){console.log("ERROR:",e.message);}
})();
