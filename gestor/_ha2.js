const https=require('https'),fs=require('fs');
const TOKEN=fs.readFileSync("D:\\Descargas\\Deepseek\\ha_token.txt","utf8").trim();
function api(path){return new Promise((res,rej)=>{
 const req=https.request({host:"192.168.1.5",port:8123,path,method:"GET",rejectUnauthorized:false,
   headers:{Authorization:"Bearer "+TOKEN}},r=>{let b="";r.on("data",d=>b+=d);
   r.on("end",()=>{ if(r.statusCode>=400) return rej(new Error("HTTP "+r.statusCode)); res(JSON.parse(b)); });});
 req.on("error",rej); req.end();});}
(async()=>{
 const st=await api("/api/states");
 const creadora=st.filter(e=>/creadora/i.test(e.entity_id+(e.attributes.friendly_name||"")));
 console.log("entidades de La Creadora:",creadora.length);
 const dom={}; for(const e of creadora){const d=e.entity_id.split(".")[0]; dom[d]=(dom[d]||0)+1;}
 console.log("por dominio:",JSON.stringify(dom));
 for(const e of creadora.slice(0,60))
   console.log("  "+e.entity_id.padEnd(58),"|",String(e.state).slice(0,22));

 // buscar spoolman por atributos o nombre
 const sp=st.filter(e=>/spoolman/i.test(e.entity_id) || Object.keys(e.attributes).some(k=>/spool/i.test(k)));
 console.log("\nposibles entidades Spoolman:",sp.length);
 for(const e of sp.slice(0,15)) console.log("  "+e.entity_id,"|",String(e.state).slice(0,30));
})();
