(()=>{const $=s=>document.querySelector(s);let R=[],F=[];
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fd=d=>d?String(d).replace(/(\d{4})(\d\d)(\d\d)/,'$1/$2/$3'):'—';
const fm=n=>n==null?'—':(n>=1e8?(n/1e8).toFixed(2)+' 億':n>=1e4?Math.round(n/1e4).toLocaleString()+' 萬':n.toLocaleString()+' 元');
const nm=s=>(s||'').toLowerCase().replace(/台/g,'臺');
function draw(){const k=nm($('#kw').value.trim()),c=$('#city').value,o=$('#opp').checked;
 F=R.filter(r=>(!k||nm(r[0]+' '+r[1]).includes(k))&&(!c||r[2]===c)&&(!o||r[7]));
 $('#cnt').textContent=`符合 ${F.length.toLocaleString()} 件，其中可能重新招標 ${F.filter(r=>r[7]).length.toLocaleString()} 件（顯示前 300 件，匯出含全部）`;
 $('#out').innerHTML='<table><tr><th>日期</th><th>案名</th><th class="hide-m">機關</th><th>預算</th><th class="hide-m">縣市</th><th>商機</th></tr>'+F.slice(0,300).map(r=>`<tr><td class="n">${fd(r[5])}</td><td>${r[6]?`<a href="${esc(r[6])}" target="_blank" rel="nofollow noopener">${esc(r[0])}</a>`:esc(r[0])}<div class="muted">${esc(r[3])}${r[8]?'・投標 '+r[8]+' 家':''}</div></td><td class="hide-m">${esc(r[1])}</td><td class="n">${fm(r[4])}</td><td class="hide-m">${esc(r[2])}</td><td>${r[7]?'<span class="opp">可能重新招標</span>':'已重新公告'}</td></tr>`).join('')+'</table>'}
$('#kw').addEventListener('input',draw);$('#city').onchange=draw;$('#opp').onchange=draw;
$('#xl').onclick=()=>TKX.csv('無法決標專區',['無法決標日期','案名','機關','縣市','類別','預算','投標家數','是否可能重新招標','公告連結'],F.map(r=>[fd(r[5]),r[0],r[1],r[2],r[3],r[4]??'',r[8]||'',r[7]?'可能重新招標':'已重新公告',r[6]]));
(async()=>{let j=await (await fetch('/data/nobid.json?t='+Date.now())).json();if(j.parts){const ps=await Promise.all([...Array(j.parts).keys()].map(i=>fetch('/data/nobid'+i+'.json?t='+Date.now()).then(r=>r.json())));j.rows=ps.flatMap(p=>p.rows)}
 R=j.rows;[...new Set(R.map(r=>r[2]))].sort().forEach(c=>$('#city').insertAdjacentHTML('beforeend',`<option>${esc(c)}</option>`));const p=new URLSearchParams(location.search);if(p.get('q'))$('#kw').value=p.get('q');draw()})();})();
