const dgram=require('dgram');
const s=dgram.createSocket('udp4');
const msg=Buffer.from(JSON.stringify({id:0,method:7000}));
const vistos=new Set();
s.on('message',(m,rinfo)=>{
  const k=rinfo.address;
  if(vistos.has(k))return; vistos.add(k);
  try{const j=JSON.parse(m.toString());console.log("RESPUESTA de",k,"->",JSON.stringify(j.result||j));}
  catch(e){console.log("de",k,":",m.toString().slice(0,200));}
});
s.bind(()=>{ s.setBroadcast(true); s.send(msg,0,msg.length,52700,'255.255.255.255'); });
setTimeout(()=>{ if(!vistos.size) console.log("sin respuestas UDP en 6 s"); s.close(); },6000);
