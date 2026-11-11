const https=require('https'),fs=require('fs');
const TOKEN=fs.readFileSync("D:\\Descargas\\Deepseek\\ha_token.txt","utf8").trim();
function ha(p,method="GET",body){return new Promise((res,rej)=>{const data=body?JSON.stringify(body):null;
 const r=https.request({host:"192.168.1.5",port:8123,path:p,method,rejectUnauthorized:false,timeout:12000,
  headers:Object.assign({Authorization:"Bearer "+TOKEN},data?{"Content-Type":"application/json","Content-Length":Buffer.byteLength(data)}:{})},x=>{let b="";x.on("data",d=>b+=d);x.on("end",()=>res({s:x.statusCode,b}));});
 r.on("error",rej);if(data)r.write(data);r.end();});}
(async()=>{
 for(const ranura of ["A1","A2","A3","A4"]){
  const tpl = `{% set ranura = '${ranura}' %}
{% set ns = namespace(id=none, peso=0) %}
{% for e in states.sensor %}
  {% if e.entity_id.startswith('sensor.spoolman_spool_') and e.entity_id.endswith('_location') and e.state == ranura %}
    {% set ent_id = e.entity_id.replace('_location', '_id') %}
    {% set peso = states('sensor.spoolman_spool_' ~ states(ent_id)) | float(0) %}
    {% if peso > ns.peso %}
      {% set ns.id = states(ent_id) %}
      {% set ns.peso = peso %}
    {% endif %}
  {% endif %}
{% endfor %}
{{ ns.id }}|{{ ns.peso }}`;
  const r=await ha("/api/template","POST",{template:tpl});
  console.log("ranura",ranura,"-> bobina",(r.b||"").trim());
 }
})();
