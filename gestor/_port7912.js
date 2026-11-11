const http=require('http'),net=require('net');
function tcp(){return new Promise(res=>{const s=net.connect(7912,"192.168.1.16");
 s.setTimeout(4000);
 s.on("connect",()=>{s.destroy();res("ABIERTO");});
 s.on("timeout",()=>{s.destroy();res("timeout");});
 s.on("error",e=>res("cerrado: "+e.code));});}
function get(){return new Promise(res=>{const r=http.get({host:"192.168.1.16",port:7912,path:"/api/v1/info",timeout:5000},x=>{let b="";x.on("data",d=>{if(b.length<300)b+=d;});x.on("end",()=>res(x.statusCode+" | "+b.replace(/\s+/g," ").slice(0,200)));});r.on("error",e=>res("err "+e.code));r.on("timeout",()=>{r.destroy();res("timeout");});});}
(async()=>{console.log("TCP 7912:",await tcp());console.log("HTTP /api/v1/info:",await get());})();
