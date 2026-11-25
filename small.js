(()=>{const $=s=>document.querySelector(s);let R=[],F=[],cat='';
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fd=d=>d?String(d).replace(/(\d{4})(\d\d)(\d\d)/,'$1/$2/$3'):'—';
const fm=n=>n==null?'—':(n>=1e4?Math.round(n/1e4).toLocaleString()+' 萬':n.toLocaleString()+' 元');
const nm=s=>(s||'').toLowerCase().replace(/台/g,'臺');
const TD=+new Date().toISOString().slice(0,10).replace(/-/g,'');
function draw(){const k=nm($('#kw').value.trim()),c=$('#city').value;
 F=R.filter(r=>r[4]==null||r[4]>=TD).filter(r=>(!cat||r[6].includes(cat))&&(!k||nm(r[0]+' '+r[1]).includes(k))&&(!c||r[2]===c));
 document.querySelectorAll('#chips button').forEach(b=>b.classList.toggle('on',b.dataset.c===cat));
 $('#cnt').textContent=`符合 ${F.length.toLocaleString()} 件，依截止投標日排序`;
 $('#out').innerHTML=F.length?'<table><tr><th>截止日</th><th>案名</th><th class="hide-m">機關</th><th>預算</th><th class="hide-m">縣市</th></tr>'+F.map(r=>`<tr><td class="n">${fd(r[4])}</td><td>${r[5]?`<a href="${esc(r[5])}" target="_blank" rel="nofollow noopener">${esc(r[0])}</a>`:esc(r[0])}<div class="muted">${r[6].map(esc).join('・')}<span class="show-m">・${esc(r[1])}</span></div></td><td class="hide-m">${esc(r[1])}</td><td class="n">${fm(r[3])}</td><td class="hide-m">${esc(r[2])}</td></tr>`).join('')+'</table>':'<p>目前沒有符合條件的案件。</p>'}
$('#kw').addEventListener('input',draw);$('#city').onchange=draw;
$('#xl').onclick=()=>TKX.csv('小額接案專區',['截止投標日','案名','機關','縣市','預算','類別','公告連結'],F.map(r=>[fd(r[4]),r[0],r[1],r[2],r[3],r[6].join('、'),r[5]]));
(async()=>{const j=await (await fetch('/data/small.json?t='+Date.now())).json();R=j.rows;
 const p=new URLSearchParams(location.search);cat=p.get('cat')||'';if(p.get('q'))$('#kw').value=p.get('q');
 $('#chips').innerHTML=['',...j.cats].map(c=>`<button class="btn2" data-c="${esc(c)}">${c?esc(c)+'（'+R.filter(r=>r[6].includes(c)).length+'）':'全部（'+R.length+'）'}</button>`).join('');
 document.querySelectorAll('#chips button').forEach(b=>b.onclick=()=>{cat=b.dataset.c;draw()});
 [...new Set(R.map(r=>r[2]))].sort().forEach(c=>$('#city').insertAdjacentHTML('beforeend',`<option>${esc(c)}</option>`));draw()})();})();
