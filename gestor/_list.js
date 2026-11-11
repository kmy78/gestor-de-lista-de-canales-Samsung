const https=require('https'),fs=require('fs');
const TOKEN=fs.readFileSync("D:\\Descargas\\Deepseek\\ha_token.txt","utf8").trim();
function ha(p){return new Promise((res,rej)=>{const r=https.request({host:"192.168.1.5",port:8123,path:p,rejectUnauthorized:false,timeout:8000,headers:{Authorization:"Bearer "+TOKEN}},x=>{let b="";x.on("data",d=>b+=d);x.on("end",()=>res(b));});r.on("error",rej);r.end();});}
(async()=>{
 const st=JSON.parse(await ha("/api/states"));
 console.log("scripts:",st.filter(e=>e.entity_id.startsWith("script.")).map(e=>e.entity_id).join(", "));
 console.log("automatizaciones:",st.filter(e=>e.entity_id.startsWith("automation.")).map(e=>e.entity_id).join(", "));
})();
