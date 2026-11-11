const https=require('https'),fs=require('fs');
const TOKEN=fs.readFileSync("D:\\Descargas\\Deepseek\\ha_token.txt","utf8").trim();
function ha(p){return new Promise((res,rej)=>{const r=https.request({host:"192.168.1.5",port:8123,path:p,rejectUnauthorized:false,timeout:8000,headers:{Authorization:"Bearer "+TOKEN}},x=>{let b="";x.on("data",d=>b+=d);x.on("end",()=>res(b));});r.on("error",rej);r.on("timeout",()=>{r.destroy();rej(new Error("t"));});r.end();});}
const esperar=(ms)=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 await esperar(25000);
 const st=JSON.parse(await ha("/api/states"));
 const ins=st.filter(e=>e.entity_id.startsWith("input_select."));
 console.log("input_select existentes:",ins.length);
 for(const e of ins.slice(0,10)) console.log("  ",e.entity_id,"=",e.state);
 const sc=st.filter(e=>e.entity_id.startsWith("script."));
 console.log("scripts:",sc.length, sc.slice(0,6).map(e=>e.entity_id).join(", "));
 const au=st.filter(e=>e.entity_id.startsWith("automation.") && /spool/i.test(e.entity_id));
 console.log("automatizaciones spoolman:",au.length);
})();
