const https=require('https'),fs=require('fs');
const TOKEN=fs.readFileSync("D:\\Descargas\\Deepseek\\portainer_token.txt","utf8").trim();
const EP=2;
function req(path,method="GET",body=null){return new Promise((res,rej)=>{
 const data=body?JSON.stringify(body):null;
 const r=https.request({host:"192.168.1.16",port:19943,path:"/api"+path,method,rejectUnauthorized:false,
  headers:Object.assign({"X-API-Key":TOKEN},data?{"Content-Type":"application/json","Content-Length":Buffer.byteLength(data)}:{})},x=>{
   let b="";x.on("data",d=>b+=d);x.on("end",()=>res({s:x.statusCode,b}));
 });r.on("error",rej); if(data)r.write(data); r.end();});}
function logs(id,tail=20){return new Promise((res)=>{const r=https.request({host:"192.168.1.16",port:19943,path:`/api/endpoints/${EP}/docker/containers/${id}/logs?stdout=1&stderr=1&tail=${tail}`,method:"GET",rejectUnauthorized:false,headers:{"X-API-Key":TOKEN}},x=>{
  let buf=Buffer.alloc(0);x.on("data",d=>buf=Buffer.concat([buf,d]));x.on("end",()=>{
   let out="",i=0;while(i+8<=buf.length){const l=buf.readUInt32BE(i+4);out+=buf.slice(i+8,i+8+l).toString();i+=8+l;}
   res(out);});});r.end();});}
(async()=>{
 const crear=await req(`/endpoints/${EP}/docker/containers/create?name=fix_perms`,"POST",{
   Image:"alpine:latest",
   Cmd:["sh","-c","chown -R 1000:1000 /data && stat -c 'propietario: %U:%G (%u:%g)  permisos: %a' /data"],
   HostConfig:{Binds:["/share/Docker/spoolman:/data"]}});
 const id=JSON.parse(crear.b).Id;
 await req(`/endpoints/${EP}/docker/containers/${id}/start`,"POST");
 await new Promise(r=>setTimeout(r,3000));
 console.log((await logs(id,10)).trim());
 await req(`/endpoints/${EP}/docker/containers/${id}`,"DELETE");
 console.log("contenedor temporal eliminado");
 const r=await req(`/endpoints/${EP}/docker/containers/spoolman/restart`,"POST");
 console.log("restart spoolman:",r.s);
})().catch(e=>console.log("ERROR:",e.message));
