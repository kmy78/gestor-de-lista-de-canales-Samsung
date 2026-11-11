const https=require('https'),fs=require('fs');
const TOKEN=fs.readFileSync("D:\\Descargas\\Deepseek\\ha_token.txt","utf8").trim();
function ha(p){return new Promise((res,rej)=>{const r=https.request({host:"192.168.1.5",port:8123,path:p,rejectUnauthorized:false,timeout:10000,headers:{Authorization:"Bearer "+TOKEN}},x=>{let b="";x.on("data",d=>b+=d);x.on("end",()=>res(b));});r.on("error",rej);r.end();});}
const ws=new WebSocket("wss://192.168.1.5:8123/api/websocket");
ws.onmessage=async(ev)=>{const m=JSON.parse(ev.data);
 if(m.type==="auth_required") return ws.send(JSON.stringify({type:"auth",access_token:TOKEN}));
 if(m.type==="auth_ok"){
   const st=JSON.parse(await ha("/api/states"));
   const sel=st.find(e=>e.entity_id==="input_select.bobina_en_uso");
   console.log("input_select:", sel? "OK ("+sel.state+")":"NO EXISTE");
   return ws.send(JSON.stringify({id:2,type:"config/entity_registry/get",entity_id:"automation.spoolman_descontar_al_terminar_la_impresion"}));
 }
 if(m.id===2){
   console.log("registro de la automatizacion:", JSON.stringify(m.result||m.error||{}).slice(0,500));
   ws.close();process.exit(0);
 }
};
setTimeout(()=>process.exit(0),10000);
