const fs=require('fs');
const TOKEN=fs.readFileSync("D:\\Descargas\\Deepseek\\ha_token.txt","utf8").trim();
const ws=new WebSocket("wss://192.168.1.5:8123/api/websocket");
ws.onmessage=(ev)=>{const m=JSON.parse(ev.data);
 if(m.type==="auth_required") return ws.send(JSON.stringify({type:"auth",access_token:TOKEN}));
 if(m.type==="auth_ok") return ws.send(JSON.stringify({id:2,type:"trace/list",domain:"automation"}));
 if(m.id===2){
   const t=(m.result||[]).filter(x=>/spoolman/i.test(x.item_id));
   if(!t.length){console.log("sin trazas");ws.close();return process.exit(0);}
   return ws.send(JSON.stringify({id:3,type:"trace/get",domain:"automation",item_id:t[0].item_id,run_id:t[0].run_id}));
 }
 if(m.id===3){
   const r=m.result||{};
   const tr=r.trace||{};
   console.log("claves del trace:",Object.keys(tr));
   const pasos=tr.trace||{};
   console.log("claves de pasos:",Object.keys(pasos).slice(0,10));
   const primero=Object.values(pasos)[0];
   console.log("primer paso:",JSON.stringify(primero).slice(0,600));
   console.log("config:",JSON.stringify(tr.config||{}).slice(0,600));
   ws.close();process.exit(0);
 }
};
setTimeout(()=>{console.log("timeout");process.exit(0);},12000);
