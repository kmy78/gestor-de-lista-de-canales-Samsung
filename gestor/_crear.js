const http=require('http');
function call(method,path,body){return new Promise((res)=>{const data=body?JSON.stringify(body):null;
 const r=http.request({host:"192.168.1.16",port:7913,path,method,timeout:8000,
   headers:Object.assign({},data?{"Content-Type":"application/json","Content-Length":Buffer.byteLength(data)}:{})},x=>{
   let b="";x.on("data",d=>b+=d);x.on("end",()=>res({s:x.statusCode,b}));});
 r.on("error",e=>res({s:0,b:e.code}));if(data)r.write(data);r.end();});}
(async()=>{
 let v=await call("POST","/api/v1/vendor",{name:"Elegoo",comment:"Fabricante"});
 let vid; try{vid=JSON.parse(v.b).id;}catch(e){console.log("vendor:",v.s,v.b.slice(0,120));return;}
 console.log("proveedor Elegoo id:",vid);

 const defs=[
  {name:"PLA",material:"PLA",color:"000000",density:1.24,slot:"A1"},
  {name:"RAPID PETG",material:"PETG",color:"AF7832",density:1.27,slot:"A2"},
  {name:"PLA Silk",material:"PLA",color:"AF7832",density:1.24,slot:"A3"},
  {name:"RAPID PLA+",material:"PLA",color:"F88D36",density:1.24,slot:"A4"},
 ];
 for(const d of defs){
   const f=await call("POST","/api/v1/filament",{
     name:d.name,vendor_id:vid,material:d.material,color_hex:d.color,
     density:d.density,diameter:1.75,weight:1000,spool_weight:200,
     settings_extruder_temp:210,settings_bed_temp:60,comment:"Creado desde HA"});
   let fid; try{fid=JSON.parse(f.b).id;}catch(e){console.log("filamento",d.name,"->",f.s,f.b.slice(0,150));continue;}
   const s=await call("POST","/api/v1/spool",{filament_id:fid,initial_weight:1000,remaining_weight:1000,location:d.slot,comment:"Ranura "+d.slot});
   let sid; try{sid=JSON.parse(s.b).id;}catch(e){console.log("bobina",d.name,"->",s.s,s.b.slice(0,150));continue;}
   console.log("  ",d.slot,"|",d.name.padEnd(12),"| filamento",fid,"| bobina",sid);
 }
 const inv=JSON.parse((await call("GET","/api/v1/spool")).b||"[]");
 console.log("\nbobinas totales:",inv.length);
})();
