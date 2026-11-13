(()=>{const $=s=>document.querySelector(s);let R=[],F=[];
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fd=d=>d?String(d).replace(/(\d{4})(\d\d)(\d\d)/,'$1/$2/$3'):'—';
const fm=n=>n==null?'—':(n>=1e8?(n/1e8).toFixed(2)+' 億':n>=1e4?Math.round(n/1e4).toLocaleString()+' 萬':n.toLocaleString()+' 元');
const nm=s=>(s||'').toLowerCase().replace(/台/g,'臺');
function draw(){const k=nm($('#kw').value.trim()),c=$('#city').value,t=$('#cat').value;
 F=R.filter(r=>(!k||nm(r[0]+' '+r[1]).includes(k))&&(!c||r[2]===c)&&(!t||r[3]===t));
 $('#cnt').textContent=`符合 ${F.length.toLocaleString()} 件（顯示前 500 件，匯出含全部）`;
 $('#out').innerHTML=F.length?'<table><tr><th>預估日期</th><th>去年案名</th><th class="hide-m">機關</th><th>去年公告日</th><th class="n">去年預算</th><th class="hide-m">去年得標廠商</th><th class="hide-m">連續</th></tr>'+F.slice(0,500).map(r=>`<tr><td class="n">${fd(r[4])}</td><td>${r[8]?`<a href="${esc(r[8])}" target="_blank" rel="nofollow noopener">${esc(r[0])}</a>`:esc(r[0])}<div class="muted">${esc(r[3])}・${esc(r[2])}<span class="show-m">・${esc(r[1])}</span></div></td><td class="hide-m">${esc(r[1])}</td><td class="n">${fd(r[5])}</td><td class="n">${fm(r[6])}</td><td class="hide-m">${esc(r[7])||'—'}</td><td class="hide-m">${r[9]} 年（${r[10].join('、')}）</td></tr>`).join('')+'</table>':'<p>沒有符合條件的案件。</p>'}
['#kw'].forEach(s=>$(s).addEventListener('input',draw));$('#city').onchange=draw;$('#cat').onchange=draw;
$('#xl').onclick=()=>TKX.csv('週期標案預告',['預估日期','去年案名','機關','縣市','類別','去年公告日','去年預算','去年得標廠商','連續年數','公告年度','公告連結'],F.map(r=>[fd(r[4]),r[0],r[1],r[2],r[3],fd(r[5]),r[6]??'',r[7],r[9],r[10].join('、'),r[8]]));
(async()=>{const j=await (await fetch('/data/cycle.json?t='+Date.now())).json();R=j.rows;
 const p=new URLSearchParams(location.search);if(p.get('q'))$('#kw').value=p.get('q');
 [...new Set(R.map(r=>r[2]))].sort().forEach(c=>$('#city').insertAdjacentHTML('beforeend',`<option>${esc(c)}</option>`));draw()})();})();
