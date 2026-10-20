(async function(){
const $=s=>document.querySelector(s),PID=new URLSearchParams(location.search).get('p');window.__PID=PID;
const J=async u=>{const r=await fetch(u,{credentials:'same-origin'});if(r.status===401){location='/';throw Error('login')}return r.ok?r:null};
const fail=m=>{document.body.innerHTML='<p style="padding:30px;font:16px system-ui">'+m+' <a href="/">Back to projects</a></p>'};
try{
const me=await (await fetch('/api/me',{credentials:'same-origin'})).json();if(!me.user||me.user.mustChange){location='/';return}window.__ME=me.user;
const proj=((await (await J('/api/projects')).json()).projects||[]).find(p=>p.id===PID);if(!proj)return fail('Project not found or you do not have access.');
window.__PROJ=proj;const F=proj.files||{},fu=f=>'/api/file?p='+encodeURIComponent(PID)+'&f='+f,isA=me.user.role==='admin';
document.title=proj.name+' — Dashboard';$('#spn').textContent=proj.name;const by=proj.presentedBy||'';$('#spby').textContent=by;$('#spbywrap').style.display=by?'':'none';$('#ft').textContent=by?'Dashboard presented & created by '+by:'';
if(F.hero)$('#hr').src=fu('hero.jpg');
if(!isA){$('#updrow').style.display='none';const m=$('#modrow');if(m)m.style.display='none'}
const seen=sessionStorage.getItem('intro_'+PID);
const [rm,rg,rb]=await Promise.all([F.model?J(fu('model.json')):null,F.gmeta?J(fu('gmeta.json')):null,F.geo?J(fu('geo.bin')):null]);
if(rm)prep(await rm.json());
if(rg&&rb){window.__GM=await rg.json();window.__GB=await rb.arrayBuffer()}
wire();
if(M){render();$('#spd').textContent='Status as of '+fd(X.dd)}else{$('#v').innerHTML='<div class=box><h3>No schedule yet</h3>'+(isA?'Use <b>Update schedule — load new P6 .xer</b> above, then press <b>Save to project</b>.':'The administrator has not uploaded the schedule for this project yet.')+'</div>';document.querySelector('.cards').style.display='none'}
if(seen){const s=$('#sp');s.style.display='none';return}
sessionStorage.setItem('intro_'+PID,'1');
if(proj.location&&isFinite(proj.location.lat)){const [a,b]=await Promise.all([fetch('/land110.json').then(r=>r.json()),fetch('/land50.json').then(r=>r.json())]);window.__L1=a;window.__L2=b;startGlobe()}
else{const sl=$('#spl'),bt=$('#spb');sl.classList.add('show');bt.classList.add('show');$('#sp').classList.add('hero');setTimeout(closeSp,5000)}
}catch(e){if(e.message!=='login')fail('Could not load the project ('+e.message+').')}
})();
