const https=require('https'),fs=require('fs');
const TOKEN=fs.readFileSync("D:\\Descargas\\Deepseek\\ha_token.txt","utf8").trim();
function api(path){return new Promise((res,rej)=>{
 const req=https.request({host:"192.168.1.5",port:8123,path,method:"GET",rejectUnauthorized:false,
   headers:{Authorization:"Bearer "+TOKEN,"Content-Type":"application/json"}},r=>{
   let b="";r.on("data",d=>b+=d);
   r.on("end",()=>{ if(r.statusCode>=400) return rej(new Error("HTTP "+r.statusCode+" "+b.slice(0,120)));
                    try{res(JSON.parse(b));}catch(e){res(b);} });
 });
 req.on("error",rej); req.end();
});}
(async()=>{
 try{
  const cfg=await api("/api/config");
  console.log("HA:",cfg.version,"|",cfg.location_name,"|",cfg.time_zone,"| estado:",cfg.state);
  const st=await api("/api/states");
  console.log("entidades totales:",st.length);
  const match=st.filter(e=>/elegoo|centauri|canvas|spool/i.test(e.entity_id+" "+(e.attributes.friendly_name||"")));
  console.log("relacionadas (elegoo/canvas/spool):",match.length);
  const byPrefix={};
  for(const e of match){const k=e.entity_id.split(".")[0];byPrefix[k]=(byPrefix[k]||0)+1;}
  console.log("por dominio:",JSON.stringify(byPrefix));
  console.log("\n--- muestra ---");
  for(const e of match.slice(0,40)){
    const n=e.attributes.friendly_name||"";
    console.log(("  "+e.entity_id).padEnd(60), "|", String(e.state).slice(0,18).padEnd(18), "|", n.slice(0,40));
  }
 }catch(e){console.log("ERROR:",e.message);}
})();
