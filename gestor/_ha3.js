const https=require('https'),fs=require('fs');
const TOKEN=fs.readFileSync("D:\\Descargas\\Deepseek\\ha_token.txt","utf8").trim();
function api(p){return new Promise((res,rej)=>{const req=https.request({host:"192.168.1.5",port:8123,path:p,rejectUnauthorized:false,headers:{Authorization:"Bearer "+TOKEN}},r=>{let b="";r.on("data",d=>b+=d);r.on("end",()=>{if(r.statusCode>=400)return rej(new Error(r.statusCode));res(JSON.parse(b));});});req.on("error",rej);req.end();});}
(async()=>{const st=await api("/api/states");
 const lc=st.filter(e=>/creadora/i.test(e.entity_id));
 const disp=lc.filter(e=>e.state!=="unavailable");
 console.log("entidades La Creadora:",lc.length,"| disponibles:",disp.length);
 for(const e of disp.slice(0,15)) console.log("  ",e.entity_id.padEnd(52),"=",String(e.state).slice(0,26));
 if(disp.length===0){const s=lc.find(e=>e.entity_id.endsWith("ip_address"));if(s)console.log("  ip:",s.state);}
})();
