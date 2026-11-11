const fs=require('fs');
const TOKEN=fs.readFileSync("D:\\Descargas\\Deepseek\\ha_token.txt","utf8").trim();
const ws=new WebSocket("wss://192.168.1.5:8123/api/websocket");
ws.onmessage=(ev)=>{const m=JSON.parse(ev.data);
 if(m.type==="auth_required") ws.send(JSON.stringify({type:"auth",access_token:TOKEN}));
 else if(m.type==="auth_ok") ws.send(JSON.stringify({id:2,type:"config_entries/get"}));
 else if(m.id===2){
   const ents=m.result||[];
   const doms={}; for(const e of ents) doms[e.domain]=(doms[e.domain]||0)+1;
   console.log("integraciones configuradas:",Object.keys(doms).length);
   for(const k of ["hacs","spoolman","elegoo_printer","mqtt","octoprint","moonraker"]) console.log("  ",k,"->",doms[k]||0);
   const el=ents.filter(e=>e.domain==="elegoo_printer");
   for(const e of el) console.log("   elegoo:",e.title,"|",e.state);
   ws.close(); process.exit(0);}
};
setTimeout(()=>{console.log("timeout");process.exit(0);},8000);
