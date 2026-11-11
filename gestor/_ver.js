const https=require('https'),http=require('http'),fs=require('fs');
const TOKEN=fs.readFileSync("D:\\Descargas\\Deepseek\\portainer_token.txt","utf8").trim();
const EP=2;
function get(path){return new Promise((res,rej)=>{const r=https.request({host:"192.168.1.16",port:19943,path:"/api"+path,method:"GET",rejectUnauthorized:false,headers:{"X-API-Key":TOKEN}},x=>{let b="";x.on("data",d=>b+=d);x.on("end",()=>res(b));});r.on("error",rej);r.end();});}
(async()=>{
 await new Promise(r=>setTimeout(r,6000));
 const j=JSON.parse(await get(`/endpoints/${EP}/docker/containers/json?all=1`));
 const sp=j.find(c=>JSON.stringify(c.Names).includes("spoolman"));
 console.log("estado:",sp.State,"|",sp.Status,"| puertos:",JSON.stringify(sp.Ports));
 const probe=()=>new Promise(res=>{const r=http.get({host:"192.168.1.16",port:7913,path:"/api/v1/info",timeout:6000},x=>{let b="";x.on("data",d=>b+=d);x.on("end",()=>res(x.statusCode+" "+b.slice(0,120)));});r.on("error",e=>res("ERR "+e.code));r.on("timeout",()=>{r.destroy();res("timeout");});});
 console.log("HTTP 7913:",await probe());
})();
