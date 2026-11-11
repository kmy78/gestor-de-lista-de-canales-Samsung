const https=require('https'),fs=require('fs');
const TOKEN=fs.readFileSync("D:\\Descargas\\Deepseek\\ha_token.txt","utf8").trim();
function ha(p){return new Promise((res,rej)=>{const r=https.request({host:"192.168.1.5",port:8123,path:p,rejectUnauthorized:false,timeout:12000,headers:{Authorization:"Bearer "+TOKEN}},x=>{let b="";x.on("data",d=>b+=d);x.on("end",()=>res({s:x.statusCode,b}));});r.on("error",rej);r.end();});}
const ws=new WebSocket("wss://192.168.1.5:8123/api/websocket");
ws.onmessage=async(ev)=>{const m=JSON.parse(ev.data);
 if(m.type==="auth_required") return ws.send(JSON.stringify({type:"auth",access_token:TOKEN}));
 if(m.type==="auth_ok") return ws.send(JSON.stringify({id:2,type:"auth/current_user"}));
 if(m.id===2){
   const u=m.result||{};
   console.log("usuario:",u.name,"| admin:",u.is_admin,"| owner:",u.is_owner);
   const c=await ha("/api/config");
   if(c.s===200){const j=JSON.parse(c.b);const comps=j.components||[];
     console.log("integracion hassio cargada:",comps.includes("hassio"));
     console.log("componentes totales:",comps.length);}
   const h=await ha("/api/hassio/supervisor/info");
   console.log("supervisor API ->",h.s);
   ws.close();process.exit(0);
 }
};
setTimeout(()=>process.exit(0),12000);
