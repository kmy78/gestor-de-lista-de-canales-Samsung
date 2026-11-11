const https=require('https'),fs=require('fs');
const TOKEN=fs.readFileSync("D:\\Descargas\\Deepseek\\ha_token.txt","utf8").trim();
function ha(p,method="GET",body){return new Promise((res,rej)=>{
 const data=body?JSON.stringify(body):null;
 const r=https.request({host:"192.168.1.5",port:8123,path:p,method,rejectUnauthorized:false,timeout:10000,
  headers:Object.assign({Authorization:"Bearer "+TOKEN},data?{"Content-Type":"application/json","Content-Length":Buffer.byteLength(data)}:{})},x=>{
   let b="";x.on("data",d=>b+=d);x.on("end",()=>res({s:x.statusCode,b}));});
 r.on("error",rej);if(data)r.write(data);r.end();});}
(async()=>{
 const st=JSON.parse((await ha("/api/states")).b);
 const sel=st.find(e=>e.entity_id==="input_select.bobina_en_uso");
 const aut=st.find(e=>/spoolman_descontar/.test(e.entity_id));
 console.log("selector:", sel? "OK  valor="+sel.state+"  opciones="+JSON.stringify(sel.attributes.options) : "NO EXISTE");
 console.log("automatizacion:", aut? "OK  estado="+aut.state+"  id="+(aut.attributes.id||"-") : "NO EXISTE");

 // validar la plantilla que busca la bobina, igual que en la automatizacion
 const tpl = `{% set nombre = '${sel?sel.state:"PLA"}' %}
{% set ns = namespace(id=none) %}
{% for e in states.sensor %}
  {% if e.entity_id.startswith('sensor.spoolman_spool_') and e.entity_id.endswith('_filament_name') and e.state == nombre %}
    {% set ns.id = states(e.entity_id.replace('_filament_name', '_id')) %}
  {% endif %}
{% endfor %}
{{ ns.id }}`;
 const r=await ha("/api/template","POST",{template:tpl});
 console.log("prueba de busqueda de bobina (", sel?sel.state:"PLA", ") -> id:", (r.b||"").trim());
})();
