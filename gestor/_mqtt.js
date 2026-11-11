const net=require('net');
function mqttConnect(host,user,pass){return new Promise(res=>{
 function s(str){const b=Buffer.from(str,'utf8');return Buffer.concat([Buffer.from([b.length>>8,b.length&255]),b]);}
 const cid="1_PC_1234", payload=Buffer.concat([s(cid),s(user),s(pass)]);
 const vh=Buffer.concat([s("MQTT"),Buffer.from([4,0xC2,0,60]),payload]);
 const pkt=Buffer.concat([Buffer.from([0x10, vh.length>>8, vh.length&255]),vh]);
 const sk=net.connect(1883,host); let done=false;
 const fin=(m)=>{if(done)return;done=true;sk.destroy();res(m);};
 sk.setTimeout(6000);
 sk.on('connect',()=>sk.write(pkt));
 sk.on('data',d=>{ if(d[0]===0x20){ const rc=d[3];
   const txt={0:"ACEPTADO",1:"version no soportada",2:"client id rechazado",3:"servidor no disponible",4:"usuario/clave incorrectos",5:"NO AUTORIZADO (codigo de acceso requerido)"}[rc]||("rc="+rc);
   fin(txt);} });
 sk.on('timeout',()=>fin("timeout"));
 sk.on('error',e=>fin("error: "+e.message));
});}
(async()=>{
 const h="192.168.1.60";
 console.log("default 123456 ->", await mqttConnect(h,"elegoo","123456"));
})();
