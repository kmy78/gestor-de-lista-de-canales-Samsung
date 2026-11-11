const https=require('https'),fs=require('fs');
const TOKEN=fs.readFileSync("D:\\Descargas\\Deepseek\\ha_token.txt","utf8").trim();
function api(p){return new Promise((res,rej)=>{const r=https.request({host:"192.168.1.5",port:8123,path:p,rejectUnauthorized:false,headers:{Authorization:"Bearer "+TOKEN}},x=>{let b="";x.on("data",d=>b+=d);x.on("end",()=>res(JSON.parse(b)));});r.on("error",rej);r.end();});}
(async()=>{
 const st=await api("/api/states");
 const rel=st.filter(e=>/bobina|spoolman/i.test(e.entity_id+" "+(e.attributes.friendly_name||"")));
 console.log("entidades con bobina/spoolman:",rel.length);
 for(const e of rel.slice(0,10)) console.log("  ",e.entity_id,"=",String(e.state).slice(0,30));
 const up=st.filter(e=>/uptime/i.test(e.entity_id));
 for(const e of up) console.log("  uptime:",e.entity_id,"=",e.state);
})();
