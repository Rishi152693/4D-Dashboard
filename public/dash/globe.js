window.startGlobe=function(){const sp=document.getElementById('sp'),cv=document.getElementById('gl'),sl=document.getElementById('spl'),bt=document.getElementById('spb');
const LOC=window.__PROJ.location;
sl.textContent='📍 '+LOC.name+'  ·  '+Math.abs(LOC.lat).toFixed(4)+'° '+(LOC.lat>=0?'N':'S')+', '+Math.abs(LOC.lon).toFixed(4)+'° '+(LOC.lon>=0?'E':'W');
let raf;window.closeSp=function(){sp.classList.add('out');cancelAnimationFrame(raf)};
if(typeof d3==='undefined'){sl.classList.add('show');bt.classList.add('show');sp.classList.add('hero');setTimeout(closeSp,6000);return}
function crop(fc,lon,lat,R){const pr=d3.geoOrthographic().clipAngle(R).rotate([-lon,-lat]).scale(1000).translate([0,0]).precision(.3);const rings=[];let cur=null;
const c={beginPath(){},moveTo(x,y){cur=[[x,y]]},lineTo(x,y){if(cur)cur.push([x,y])},closePath(){if(cur&&cur.length>2)rings.push(cur);cur=null},arc(){},rect(){}};
d3.geoPath(pr,c)(fc);
return{type:'FeatureCollection',features:rings.map(r=>{const g=r.map(p=>pr.invert(p));g.push(g[0]);const poly={type:'Polygon',coordinates:[g]};if(d3.geoArea(poly)>2*Math.PI)g.reverse();return{type:'Feature',geometry:poly}})}}
const L1=window.__L1,REG=crop(window.__L2,LOC.lon,LOC.lat,16),ctx=cv.getContext('2d');
let W,H,dpr,stars=[];function fit(){dpr=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;cv.style.width=W+'px';cv.style.height=H+'px';stars=Array.from({length:170},()=>[Math.random()*W,Math.random()*H,Math.random()*1.3+.2])}
fit();addEventListener('resize',fit);
const proj=d3.geoOrthographic().clipAngle(90).precision(.5),path=d3.geoPath(proj,ctx),grat=d3.geoGraticule10(),sph={type:'Sphere'};
const cp=(v,a,b)=>Math.max(a,Math.min(b,v)),ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2,T0=1600,T1=6200,TH=T1+2000,TE=TH+6000;let hp=0;let t0=null;
function frame(ts){if(!t0)t0=ts;const el=ts-t0,m=Math.min(W,H),s0=m*.36,s1=Math.max(26000,m*48),k=cp((el-T0)/(T1-T0),0,1),p=ease(k),q=ease(cp((k-.4)/.6,0,1));
const l0=-(LOC.lon+160),sl0=l0+T0*.02,lam=el<T0?l0+el*.02:sl0+(-LOC.lon-sl0)*p,phi=el<T0?-12:-12+(-LOC.lat+12)*p,s=s0*Math.pow(s1/s0,q);
if(!hp&&el>=TH){hp=1;sp.classList.add('hero')}if(el>=TH+1500){if(el>=TE){closeSp();return}raf=requestAnimationFrame(frame);return}
proj.translate([W/2,H*.47]).scale(s).rotate([lam,phi]);
ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#02060d';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';
const sa=1-q;if(sa>0.02){ctx.globalAlpha=sa;stars.forEach(a=>ctx.fillRect(a[0],a[1],a[2],a[2]));ctx.globalAlpha=1}
if(q<.6){const g=ctx.createRadialGradient(W/2,H*.47,s*.98,W/2,H*.47,s*1.18);g.addColorStop(0,'rgba(80,190,255,.55)');g.addColorStop(1,'rgba(80,190,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(W/2,H*.47,s*1.18,0,7);ctx.fill()}
ctx.beginPath();path(sph);const og=ctx.createLinearGradient(0,H*.47-Math.min(s,H),0,H*.47+Math.min(s,H));og.addColorStop(0,'#14507a');og.addColorStop(1,'#08243f');ctx.fillStyle=og;ctx.fill();
ctx.beginPath();path(grat);ctx.strokeStyle='rgba(255,255,255,'+(.09*(1-q*.8))+')';ctx.lineWidth=.6;ctx.stroke();
const off=d3.geoDistance([-lam,-phi],[LOC.lon,LOC.lat])*180/Math.PI+Math.hypot(W,H)/2/s*180/Math.PI,useR=off<15;ctx.beginPath();path(useR?REG:L1);ctx.fillStyle=useR?'#cdbb8c':'#4f9570';ctx.fill();ctx.strokeStyle='rgba(255,255,255,.4)';ctx.lineWidth=.8;ctx.stroke();
if(q<.7){const g2=ctx.createRadialGradient(W/2-s*.35,H*.47-s*.35,s*.1,W/2,H*.47,s);g2.addColorStop(0,'rgba(255,255,255,.14)');g2.addColorStop(.6,'rgba(0,0,0,0)');g2.addColorStop(1,'rgba(0,0,20,.55)');ctx.fillStyle=g2;ctx.beginPath();path(sph);ctx.fill()}
if(el>=T1-400){const c=proj([LOC.lon,LOC.lat]);if(c){const a=cp((el-T1+400)/600,0,1),ph=((el-T1)%1600)/1600;ctx.globalAlpha=a;
for(let i=0;i<2;i++){const f=(ph+i*.5)%1;ctx.beginPath();ctx.arc(c[0],c[1],8+f*46,0,7);ctx.strokeStyle='rgba(239,68,68,'+(.8*(1-f))+')';ctx.lineWidth=2;ctx.stroke()}
const dy=(1-ease(a))*-60;ctx.beginPath();ctx.moveTo(c[0],c[1]+dy);ctx.lineTo(c[0]-9,c[1]+dy-22);ctx.arc(c[0],c[1]+dy-26,11,Math.PI*.8,Math.PI*.2,false);ctx.closePath();ctx.fillStyle='#ef4444';ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();
ctx.beginPath();ctx.arc(c[0],c[1]+dy-26,4,0,7);ctx.fillStyle='#fff';ctx.fill();ctx.font='700 16px system-ui,sans-serif';ctx.textAlign='center';ctx.shadowColor='#000';ctx.shadowBlur=8;ctx.fillText(LOC.name.split(',')[0],c[0],c[1]+dy-52);ctx.shadowBlur=0;ctx.globalAlpha=1}}
if(el>=T1-200){sl.classList.add('show');bt.classList.add('show')}
if(el>=TE){closeSp();return}raf=requestAnimationFrame(frame)}
raf=requestAnimationFrame(frame);setTimeout(()=>{if(!hp){hp=1;sp.classList.add('hero')}},TH);setTimeout(closeSp,TE+1500)};
