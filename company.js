(()=>{const $=s=>document.querySelector(s);let CM,META;
const CT=new Uint32Array(256).map((_,n)=>{let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;return c>>>0});
const crc=s=>{let c=~0;for(const b of new TextEncoder().encode(s))c=CT[(c^b)&255]^(c>>>8);return (~c)>>>0};
const C={};const get=u=>C[u]||(C[u]=fetch('/data/'+u+'?v='+(CM?CM.built.replace(/\D/g,''):Date.now())).then(r=>r.ok?r.json():{}));
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fd=d=>d?String(d).replace(/(\d{4})(\d\d)(\d\d)/,'$1/$2/$3'):'—';
const fm=n=>!n?'—':(n>=1e8?(n/1e8).toFixed(2)+' 億':n>=1e4?Math.round(n/1e4).toLocaleString()+' 萬':n.toLocaleString()+' 元');
const norm=s=>(s||'').toLowerCase().replace(/台/g,'臺');
const slug=s=>s.replace(/[\\/:*?"<>|#%\s]+/g,'_').replace(/^_+|_+$/g,'').slice(0,80)||'_';
function terms(tok){const s=norm(tok),o=new Set();(s.match(/[a-z0-9]+/g)||[]).forEach(w=>o.add(w));(s.match(/[\u3400-\u9fff\uf900-\ufaff]+/g)||[]).forEach(g=>{if(g.length==1)o.add(g);else for(let i=0;i<g.length-1;i++)o.add(g.slice(i,i+2))});return [...o]}
function inter(a,b){const r=[];let i=0,j=0;while(i<a.length&&j<b.length){if(a[i]===b[j]){r.push(a[i]);i++;j++}else if(a[i]<b[j])i++;else j++}return r}
const rec=async n=>(await get('co/'+(crc(n)%CM.ns)+'.json'))[n];
async function resolve(q){q=q.trim();if(!q)return null;
 if(/^\d{8}$/.test(q)){const s=await get('co/id/'+(+q%CM.is)+'.json');if(s[q])return {n:s[q],r:await rec(s[q])};return {sug:[],msg:'找不到這個統一編號。統編對照只涵蓋 2024 年起公告中有列廠商代碼的廠商，請改用公司名稱查詢。'}}
 let r=await rec(q);if(r)return {n:q,r};
 if(!META)META=await (await fetch('/data/meta.json')).json();
 const ts=terms(q);if(!ts.length)return {sug:[]};
 const ls=await Promise.all(ts.map(async t=>{const sh=await get('vi/'+(crc(t)%META.vshards)+'.json');const s=sh[t];if(!s)return [];let p=0;return s.split(',').map(x=>p+=parseInt(x,16))}));
 ls.sort((a,b)=>a.length-b.length);let ids=ls[0];for(const l of ls.slice(1))ids=inter(ids,l);
 const sug=[];for(const i of ids.slice(0,400)){const c=await get('v/'+Math.floor(i/META.vchunk)+'.json');const v=c[i%META.vchunk];if(v&&norm(v[0]).includes(norm(q))&&await rec(v[0]))sug.push(v[0]);if(sug.length>=15)break}
 if(sug.length===1)return {n:sug[0],r:await rec(sug[0])};
 return {sug}}
async function recommend(r){const H=await get('home.json');const ks=r.k,us=new Map(r.u.map((x,i)=>[x[0],x[2]?4:2]));
 const TD=+new Date().toISOString().slice(0,10).replace(/-/g,'');
 return H.filter(h=>h[8]==null||h[8]>=TD).map(h=>{let s=0,why=[];const u=us.get(h[2]);if(u){s+=u;why.push('常往來機關')}const km=ks.filter(k=>h[1].includes(k));if(km.length){s+=Math.min(km.length,3)*2+(ks.indexOf(km[0])<3?1:0);why.push('關鍵字：'+km.slice(0,3).join('、'))}return [s,h,why]}).filter(x=>x[0]>=2).sort((a,b)=>b[0]-a[0]||(a[1][8]||0)-(b[1][8]||0)).slice(0,30)}
async function show(n,r){const ys=Object.keys(r.y),mx=Math.max(...ys.map(y=>r.y[y][0]),1);
 let h=`<div class="card"><h2>${esc(n)}</h2><p>${r.id?'統一編號：<b>'+r.id+'</b>　':''}2020 年起出現在 <b>${r.n.toLocaleString()}</b> 件案件（投標名單 ${r.b.toLocaleString()} 次），得標 <b>${r.w.toLocaleString()}</b> 件；2024 年起決標金額合計 <b>${fm(r.a)}</b>。${r.rt?`平均決標價比 <b>${(r.rt[0]*100).toFixed(1)}%</b>（中位數 ${(r.rt[1]*100).toFixed(1)}%，樣本 ${r.rt[2]} 件；<a href="/ratio.html">說明</a>）`:'決標價比：尚無樣本'}</p><p class="muted">投標次數只計有公開投標名單的案件；金額只計 2024 年起有決標明細的案件，2020–2023 沒有金額資料。${r.p?` <a href="/v/${encodeURIComponent(slug(n))}.html">看廠商得標紀錄頁</a>｜`:' '}<a href="/rival.html?v=${encodeURIComponent(n)}">看競爭對手分析</a></p></div>`;
 h+='<div class="card"><h2>歷年實績</h2><table><tr><th>年度</th><th class="n">相關案件</th><th class="n">得標</th><th class="hide-m"></th></tr>'+ys.reverse().map(y=>`<tr><td>${y}</td><td class="n">${r.y[y][0]}</td><td class="n">${r.y[y][1]}</td><td class="hide-m"><span class="bar" style="width:${Math.round(r.y[y][0]*160/mx)}px"></span></td></tr>`).join('')+'</table></div>';
 h+='<div class="card"><h2>常往來的機關</h2><table><tr><th>機關</th><th class="n">相關案件</th><th class="n">得標</th></tr>'+r.u.map(u=>`<tr><td>${esc(u[0])}</td><td class="n">${u[1]}</td><td class="n">${u[2]}</td></tr>`).join('')+'</table>';
 h+=`<h2 style="margin-top:12px">得標類別</h2><div class="tags">${r.c.map(c=>`<span>${esc(c[0])}（${c[1]}）</span>`).join('')||'—'}</div><h2 style="margin-top:12px">得標案名常見關鍵字</h2><div class="tags">${r.k.map(k=>`<a href="/k/${encodeURIComponent(slug(k))}.html">${esc(k)}</a>`).join('')||'—'}</div></div>`;
 h+='<div class="card"><h2>最近投標／得標案件</h2><table><tr><th>日期</th><th>案名</th><th class="hide-m">機關</th><th>結果</th><th class="n hide-m">金額</th></tr>'+r.l.map(x=>`<tr><td class="n">${fd(x[0])}</td><td>${x[5]?`<a href="${esc(x[5])}" target="_blank" rel="nofollow noopener">${esc(x[1])}</a>`:esc(x[1])}</td><td class="hide-m">${esc(x[2])}</td><td>${x[3]?'<b style="color:#2b8a3e">得標</b>':'投標'}</td><td class="n hide-m">${fm(x[4])}</td></tr>`).join('')+'</table></div>';
 $('#out').innerHTML=h+'<div class="card" id="rec">正在比對目前招標中的案件…</div>';
 const R=await recommend(r);
 $('#rec').innerHTML=`<h2>推薦投標：目前招標中的案子（${R.length} 件）</h2><p class="muted">依該公司過去得標案名的關鍵字與常往來機關比對，僅供參考。</p>`+(R.length?'<table><tr><th>截止日</th><th>案名</th><th class="hide-m">機關</th><th>預算</th><th class="hide-m">推薦原因</th></tr>'+R.map(([s,x,w])=>`<tr><td class="n">${fd(x[8])}</td><td>${x[12]?`<a href="${esc(x[12])}" target="_blank" rel="nofollow noopener">${esc(x[1])}</a>`:esc(x[1])}</td><td class="hide-m">${esc(x[2])}</td><td class="n">${fm(x[6])}</td><td class="hide-m muted">${esc(w.join('；'))}</td></tr>`).join('')+'</table>':'<p>目前沒有明顯符合的招標中案件。</p>')}
async function go(q){$('#out').innerHTML='<div class="card">查詢中…</div>';
 const x=await resolve(q);if(!x)return $('#out').innerHTML='';
 if(x.r)return show(x.n,x.r);
 $('#out').innerHTML=`<div class="card"><p>找不到「${esc(q)}」。${x.msg||''}</p>${x.sug&&x.sug.length?'是不是要找：<div class="tags">'+x.sug.map(s=>`<a href="?id=${encodeURIComponent(s)}">${esc(s)}</a>`).join('')+'</div>':''}<p class="muted">收錄 2020 年起至少得標一次或投標兩次以上的廠商。</p></div>`}
$('#f').onsubmit=e=>{e.preventDefault();const q=$('#q').value.trim();history.replaceState(null,'','?id='+encodeURIComponent(q));go(q)};
(async()=>{CM=await (await fetch('/data/co/meta.json?t='+Date.now())).json();const q=new URLSearchParams(location.search).get('id');if(q){$('#q').value=q;go(q)}})();})();
