const https=require('https'),fs=require('fs');
const TOKEN=fs.readFileSync("D:\\Descargas\\Deepseek\\ha_token.txt","utf8").trim();
function ha(p){return new Promise((res,rej)=>{const r=https.request({host:"192.168.1.5",port:8123,path:p,rejectUnauthorized:false,timeout:8000,headers:{Authorization:"Bearer "+TOKEN}},x=>{let b="";x.on("data",d=>b+=d);x.on("end",()=>res(b));});r.on("error",rej);r.end();});}
(async()=>{
 const st=JSON.parse(await ha("/api/states"));
 const rel=st.filter(e=>/spoolman/i.test(e.entity_id));
 console.log("entidades con 'spoolman':",rel.length);
 for(const e of rel) console.log("  ",e.entity_id,"=",String(e.state).slice(0,25));
 const sc=st.filter(e=>e.entity_id.startsWith("script."));
 console.log("scripts totales:",sc.length);
 for(const e of sc) console.log("   ",e.entity_id);
})();
