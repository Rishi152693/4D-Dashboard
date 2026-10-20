function parseXER(txt){const T={};let c=null;for(const ln of txt.split(/\r?\n/)){if(!ln)continue;const a=ln.split('\t');if(a[0]==='%T'){c=a[1];T[c]={f:[],r:[]}}else if(a[0]==='%F')T[c].f=a.slice(1);else if(a[0]==='%R'){const o={},f=T[c].f;for(let i=0;i<f.length;i++)o[f[i]]=a[i+1]||'';T[c].r.push(o)}}return T}
function buildModel(T){
const P=T.PROJECT.r[0],W={};T.PROJWBS.r.forEach(w=>W[w.wbs_id]=w);
const root=T.PROJWBS.r.find(w=>!W[w.parent_wbs_id]);
const path=id=>{const p=[];while(W[id]){p.push(W[id].wbs_name);id=W[id].parent_wbs_id}return p.reverse()};
const G=[],S=[],PP=[],ix=(A,n)=>{let i=A.indexOf(n);if(i<0){i=A.length;A.push(n)}return i};
const d=s=>s?s.slice(0,10):'',n=x=>parseFloat(x)||0,r2=x=>Math.round(x*100)/100;
const tasks=[],idx={};
T.TASK.r.forEach(t=>{const p=path(t.wbs_id);let g,s;
if(p[1]==='CONSTRUCTION'){g=p[2]||'CONSTRUCTION';s=p[3]||''}else{g=p[1]||'OTHER';s=p[2]||''}
const st=t.status_code==='TK_Complete'?2:t.status_code==='TK_Active'?1:0;
idx[t.task_id]=tasks.length;
tasks.push([t.task_code,t.task_name,ix(G,g),st,n(t.phys_complete_pct),d(t.target_start_date),d(t.target_end_date),d(t.act_start_date),d(t.act_end_date),
d(st>0&&t.act_start_date?t.act_start_date:t.early_start_date),d(st==2&&t.act_end_date?t.act_end_date:t.early_end_date),
t.total_float_hr_cnt===''?null:Math.round(n(t.total_float_hr_cnt)/8),(t.driving_path_flag==='Y'&&st<2)?1:0,t.task_type!=='TT_Task'?1:0,ix(S,s),ix(PP,p[1]==='CONSTRUCTION'?p.slice(3).join('>'):'')])});
const U={};(T.UMEASURE?T.UMEASURE.r:[]).forEach(u=>U[u.unit_id]=u.unit_abbrev);
const RS={};T.RSRC.r.forEach(x=>RS[x.rsrc_id]=x);
const R=[],rm={};
const rix=id=>{if(id in rm)return rm[id];const x=RS[id];let nm=x.rsrc_name;if(nm==='Cost'&&RS[x.parent_rsrc_id])nm=RS[x.parent_rsrc_id].rsrc_name;
R.push([nm,x.rsrc_type==='RT_Labor'?0:x.rsrc_type==='RT_Mat'?2:1,U[x.unit_id]||'']);return rm[id]=R.length-1};
const A=[];T.TASKRSRC.r.forEach(a=>{const ti=idx[a.task_id];if(ti===undefined||!RS[a.rsrc_id])return;
const row=[ti,rix(a.rsrc_id),r2(n(a.target_qty)),r2(n(a.remain_qty)),r2(n(a.target_cost)),r2(n(a.act_reg_cost)+n(a.act_ot_cost)),r2(n(a.remain_cost))];
if(row.slice(2).some(v=>v))A.push(row)});
return{name:(root?root.wbs_name:P.proj_short_name).replace(/\s*\d\d\.\d\d\.\d{4}.*$/,''),file:P.proj_short_name,dataDate:d(P.last_recalc_date),planStart:d(P.plan_start_date),mustFinish:d(P.plan_end_date),scdEnd:d(P.scd_end_date),G,S,PP,R,tasks,A}}
if(typeof module!=='undefined')module.exports={parseXER,buildModel};
