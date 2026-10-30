(()=>{const $=s=>document.querySelector(s);let RM,META,cur=null;
const CT=new Uint32Array(256).map((_,n)=>{let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;return c>>>0});
const crc=s=>{let c=~0;for(const b of new TextEncoder().encode(s))c=CT[(c^b)&255]^(c>>>8);return (~c)>>>0};
const C={};const get=u=>C[u]||(C[u]=fetch('/data/'+u+'?v='+(RM?RM.built.replace(/\D/g,''):Date.now())).then(r=>r.ok?r.json():{}));
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fd=d=>d?String(d).replace(/(\d{4})(\d\d)(\d\d)/,'$1/$2/$3'):'—';
const fm=n=>!n?'—':(n>=1e8?(n/1e8).toFixed(2)+' 億':n>=1e4?Math.round(n/1e4).toLocaleString()+' 萬':n.toLocaleString()+' 元');
const pc=(a,b)=>b?Math.round(a*100/b)+'%':'—';
const norm=s=>(s||'').toLowerCase().replace(/台/g,'臺');
function terms(tok){const s=norm(tok),o=new Set();(s.match(/[a-z0-9]+/g)||[]).forEach(w=>o.add(w));(s.match(/[\u3400-\u9fff\uf900-\ufaff]+/g)||[]).forEach(g=>{if(g.length==1)o.add(g);else for(let i=0;i<g.length-1;i++)o.add(g.slice(i,i+2))});return [...o]}
function inter(a,b){const r=[];let i=0,j=0;while(i<a.length&&j<b.length){if(a[i]===b[j]){r.push(a[i]);i++;j++}else if(a[i]<b[j])i++;else j++}return r}
async function rec(n){const s=await get('r/'+(crc(n)%RM.ns)+'.json');return s[n]}
async function resolve(q){q=q.trim();if(!q)return null;
 if(/^\d{8}$/.test(q)){const s=await get('r/id/'+(+q%RM.is)+'.json');if(s[q])return {n:s[q],r:await rec(s[q])};return {sug:[],msg:'找不到這個統編（統編只涵蓋 2024 年起公告有列代碼的廠商）'}}
 let r=await rec(q);if(r)return {n:q,r};
 if(!META)META=await (await fetch('/data/meta.json')).json();
 const ts=terms(q);if(!ts.length)return {sug:[]};
 const ls=await Promise.all(ts.map(async t=>{const sh=await get('vi/'+(crc(t)%META.vshards)+'.json');const s=sh[t];if(!s)return [];let p=0;return s.split(',').map(x=>p+=parseInt(x,16))}));
 ls.sort((a,b)=>a.length-b.length);let ids=ls[0];for(const l of ls.slice(1))ids=inter(ids,l);
 const sug=[];for(const i of ids.slice(0,400)){const c=await get('v/'+Math.floor(i/META.vchunk)+'.json');const v=c[i%META.vchunk];if(v&&norm(v[0]).includes(norm(q)))sug.push(v[0]);if(sug.length>=15)break}
 if(sug.length===1){r=await rec(sug[0]);if(r)return {n:sug[0],r}}
 return {sug}}
const sugHtml=(x,q)=>`<div class="card"><p>找不到「${esc(q)}」的同場投標資料。${x.msg||''}</p>${x.sug&&x.sug.length?'是不是要找：<div class="tags">'+x.sug.map(s=>`<a href="?v=${encodeURIComponent(s)}">${esc(s)}</a>`).join('')+'</div>':''}<p class="muted">只有在 2020 年起至少一次和其他廠商同場投標的廠商才有對手資料。</p></div>`;
async function refs(R){const out={},need={};R.slice(0,10).forEach((e,k)=>{if(typeof e[5]==='number')(need[Math.floor(e[5]/500)]=need[Math.floor(e[5]/500)]||[]).push(k)});
 await Promise.all(Object.keys(need).map(async c=>{const d=await get('d/'+c+'.json');need[c].forEach(k=>{const x=d[R[k][5]%500];if(x)out[k]=[x[12],x[0],x[11],x[1]]})}));
 R.slice(0,20).forEach((e,k)=>{if(out[k])return;if(Array.isArray(e[5]))out[k]=[e[5][0],e[5][1],'',''];else if(k>=10&&e[5]!=null)out[k]=[e[5],'','',''];});return out}
const lastH=L=>L?`${fd(L[0])} ${L[2]?`<a href="${esc(L[2])}" target="_blank" rel="nofollow noopener">${esc(L[1])}</a>`:esc(L[1])}${L[3]?`<div class="muted">${esc(L[3])}</div>`:''}`:'—';
async function one(n,r){const R=r.r,LS=await refs(R);
 let h=`<div class="card"><h2>${esc(n)}${r.id?`（統編 ${r.id}）`:''}</h2><p>2020 年起有投標名單的案件 <b>${r.b.toLocaleString()}</b> 件，得標 <b>${r.w.toLocaleString()}</b> 件；其中有其他廠商同場的 <b>${r.m.toLocaleString()}</b> 件。2024 年起得標金額合計 <b>${fm(r.a)}</b>。</p>
 <h2>主要競爭對手（同場次數前 ${Math.min(20,R.length)} 名）</h2><table><tr><th>對手</th><th>同場</th><th>對方得標</th><th>本廠商得標</th><th>雙方皆得標</th><th>勝率 本／對方</th><th class="hide-m">對方得標金額*</th><th class="hide-m">最近交手</th></tr>`;
 R.slice(0,20).forEach((e,k)=>{h+=`<tr><td><a href="?v=${encodeURIComponent(n)}&w=${encodeURIComponent(e[0])}">${esc(e[0])}</a></td><td class="n">${e[1]}</td><td class="n">${e[2]}</td><td class="n">${e[3]}</td><td class="n">${(r.bb||[])[k]??'—'}</td><td class="n">${pc(e[3],e[1])}／${pc(e[2],e[1])}</td><td class="n hide-m">${fm(e[4])}</td><td class="hide-m">${lastH(LS[k])}</td></tr>`});
 h+=`</table><p class="muted">* 對方得標金額只計 2024 年起同場案件中、對方得標且有決標明細的金額；2020–2023 年只算次數。同場與得標皆以唯一案號計；分項或複數決標時，同一案雙方可能都得標，另列「雙方皆得標」。點對手名稱可看兩家對戰紀錄。</p>`;
 if(r.x.length)h+=`<h2 style="margin-top:12px">常把本廠商標走的對手</h2><table><tr><th>對手</th><th>本廠商落敗、由對方得標</th><th>同場</th></tr>${r.x.map(x=>`<tr><td><a href="?v=${encodeURIComponent(n)}&w=${encodeURIComponent(x[0])}">${esc(x[0])}</a></td><td class="n">${x[1]}</td><td class="n">${x[2]}</td></tr>`).join('')}</table>`;
 $('#out').innerHTML=h+'</div>';
 cur=[n+'_競爭對手',['對手','同場次數','對方得標','本廠商得標','雙方皆得標','本廠商勝率','對方勝率','對方得標金額(2024起)','最近交手日期','最近交手標案','機關','公告連結'],R.map((e,k)=>{const L=LS[k]||[];return [e[0],e[1],e[2],e[3],(r.bb||[])[k]??'',pc(e[3],e[1]),pc(e[2],e[1]),e[4]??'',fd(L[0]),L[1]??'',L[3]??'',L[2]??'']})]}
async function two(a,ra,b,rb){let i=ra.r.findIndex(x=>x[0]===b),e=ra.r[i],sw=false,bb=(ra.bb||[])[i];if(!e&&rb){i=rb.r.findIndex(x=>x[0]===a);e=rb.r[i];bb=(rb.bb||[])[i];sw=true}
 if(!e){$('#out').innerHTML=`<div class="card"><h2>${esc(a)} 對 ${esc(b)}</h2><p>兩家沒有足夠的同場紀錄（不在彼此前 30 名對手內）。</p></div>`;cur=null;return}
 const aw=sw?e[2]:e[3],bw=sw?e[3]:e[2];const hb=typeof bb==='number',nn=hb?e[1]-aw-bw+bb:null;const L=e.length>5?(await refs([e]))[0]:null;
 $('#out').innerHTML=`<div class="card"><h2>${esc(a)} 對 ${esc(b)}</h2><table><tr><th></th><th>${esc(a)}</th><th>${esc(b)}</th></tr><tr><td>同場投標</td><td class="n" colspan="2" style="text-align:center">${e[1]} 次</td></tr><tr><td>得標次數</td><td class="n">${aw}</td><td class="n">${bw}</td></tr>${hb?`<tr><td>雙方皆得標（分項／複數決標）</td><td class="n" colspan="2" style="text-align:center">${bb} 次</td></tr><tr><td>雙方皆未得標</td><td class="n" colspan="2" style="text-align:center">${nn} 次</td></tr><tr><td>核對</td><td colspan="2" style="text-align:center">同場 ${e[1]} ＝ ${esc(a)}得標 ${aw} ＋ ${esc(b)}得標 ${bw} − 雙方皆得標 ${bb} ＋ 雙方皆未得標 ${nn}</td></tr>`:''}<tr><td>勝率</td><td class="n">${pc(aw,e[1])}</td><td class="n">${pc(bw,e[1])}</td></tr>${e.length>4?`<tr><td>${esc(sw?a:b)} 在同場案件的得標金額（2024 起）</td><td colspan="2">${fm(e[4])}</td></tr>`:''}${L?`<tr><td>最近交手</td><td colspan="2">${lastH(L)}</td></tr>`:''}</table><p class="muted">同場與得標都以唯一案號（機關代碼＋案號）計，同一案的招標、更正、決標公告只算一次。台電等機關常採分項或複數決標，一案可同時有多家得標，所以兩家得標數相加可能大於同場次數。雙方皆未得標＝由第三家得標或無法決標。次數含 2020 年起資料。</p><p><a href="?v=${encodeURIComponent(a)}">看 ${esc(a)} 全部對手</a>｜<a href="?v=${encodeURIComponent(b)}">看 ${esc(b)} 全部對手</a></p></div>`;
 cur=[a+'_對_'+b,['項目',a,b],[['同場投標',e[1],e[1]],['得標次數',aw,bw],...(hb?[['雙方皆得標',bb,bb],['雙方皆未得標',nn,nn]]:[]),['勝率',pc(aw,e[1]),pc(bw,e[1])],...(L?[['最近交手',fd(L[0])+' '+L[1],L[3]]]:[])]]}
async function go(){const qa=$('#a').value.trim(),qb=$('#b').value.trim();if(!qa)return;$('#out').innerHTML='<div class="card">分析中…</div>';$('#xl').hidden=true;
 const A=await resolve(qa);if(!A||!A.r){$('#out').innerHTML=sugHtml(A||{},qa);return}
 history.replaceState(null,'','?v='+encodeURIComponent(A.n)+(qb?'&w='+encodeURIComponent(qb):''));$('#a').value=A.n;
 if(qb){const B=await resolve(qb);if(!B||!B.n){$('#out').innerHTML=sugHtml(B||{},qb);return}$('#b').value=B.n;await two(A.n,A.r,B.n,B.r)}else await one(A.n,A.r);
 $('#xl').hidden=!cur}
$('#go').onclick=go;[$('#a'),$('#b')].forEach(i=>i.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.isComposing)go()}));
$('#xl').onclick=()=>cur&&TKX.csv(...cur);
(async()=>{RM=await (await fetch('/data/r/meta.json?t='+Date.now())).json();const p=new URLSearchParams(location.search);if(p.get('v')){$('#a').value=p.get('v');$('#b').value=p.get('w')||'';go()}})();})();
