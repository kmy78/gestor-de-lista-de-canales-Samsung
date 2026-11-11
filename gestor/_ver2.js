const https=require('https'),http=require('http'),fs=require('fs');
const TOKEN=fs.readFileSync("D:\\Descargas\\Deepseek\\portainer_token.txt","utf8").trim();
const EP=2;
function logs(id,tail=15){return new Promise((res)=>{const r=https.request({host:"192.168.1.16",port:19943,path:`/api/endpoints/${EP}/docker/containers/${id}/logs?stdout=1&stderr=1&tail=${tail}`,method:"GET",rejectUnauthorized:false,headers:{"X-API-Key":TOKEN}},x=>{
  let buf=Buffer.alloc(0);x.on("data",d=>buf=Buffer.concat([buf,d]));x.on("end",()=>{
   let out="",i=0;while(i+8<=buf.length){const l=buf.readUInt32BE(i+4);out+=buf.slice(i+8,i+8+l).toString();i+=8+l;}
   res(out);});});r.end();});}
(async()=>{
 await new Promise(r=>setTimeout(r,8000));
 console.log("--- logs spoolman ---");
 console.log((await logs("spoolman",14)).trim());
 const probe=()=>new Promise(res=>{const r=http.get({host:"192.168.1.16",port:7913,path:"/api/v1/info",timeout:6000},x=>{let b="";x.on("data",d=>b+=d);x.on("end",()=>res(x.statusCode+" "+b.slice(0,150)));});r.on("error",e=>res("ERR "+e.code));r.on("timeout",()=>{r.destroy();res("timeout");});});
 console.log("\nHTTP 7913:",await probe());
})();
