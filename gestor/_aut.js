const https=require('https'),fs=require('fs');
const TOKEN=fs.readFileSync("D:\\Descargas\\Deepseek\\ha_token.txt","utf8").trim();
function ha(p){return new Promise((res,rej)=>{const r=https.request({host:"192.168.1.5",port:8123,path:p,rejectUnauthorized:false,timeout:10000,headers:{Authorization:"Bearer "+TOKEN}},x=>{let b="";x.on("data",d=>b+=d);x.on("end",()=>res({s:x.statusCode,b}));});r.on("error",rej);r.end();});}
(async()=>{
 const st=JSON.parse((await ha("/api/states")).b);
 const auts=st.filter(e=>e.entity_id.startsWith("automation.")&&/spool/i.test(e.entity_id));
 console.log("automatizaciones spoolman:",auts.length);
 for(const a of auts) console.log("  ",a.entity_id,"| estado:",a.state,"| last_triggered:",a.attributes.last_triggered,"| id:",a.attributes.id);
 const s=await ha("/api/states/automation.spoolman_descontar_al_terminar_la_impresion");
 console.log("consulta directa ->", s.s);
 if(s.s===200){const j=JSON.parse(s.b);console.log("   estado:",j.state,"| last_triggered:",j.attributes.last_triggered);}
})();
