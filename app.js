(()=>{
const $=s=>document.querySelector(s), D='data/';
const F={st:'',cat:'',amt:'',dl:''}; let mode='search', META=null, HOME=[], seq=0;
const CT=new Uint32Array(256).map((_,n)=>{let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;return c>>>0});
const crc=s=>{let c=~0;for(const b of new TextEncoder().encode(s))c=CT[(c^b)&255]^(c>>>8);return (~c)>>>0};
const cache={}; const get=u=>cache[u]||(cache[u]=fetch(D+u+'?v='+(META?META.built.replace(/\D/g,''):'')).then(r=>{if(!r.ok)throw r.status;return r.json()}));
const norm=s=>(s||'').toLowerCase().replace(/台/g,'臺');
const fmtD=d=>d?String(d).replace(/(\d{4})(\d\d)(\d\d)/,'$1/$2/$3'):'—';
const fmtM=n=>n==null?'—':(n>=1e8?(n/1e8).toFixed(2).replace(/\.?0+$/,'')+' 億元':n>=1e4?Math.round(n/1e4).toLocaleString('zh-TW')+' 萬元':n.toLocaleString('zh-TW')+' 元');
const today=()=>{const t=new Date(Date.now()+8*36e5);return +t.toISOString().slice(0,10).replace(/-/g,'')};
const addDays=n=>{const t=new Date(Date.now()+8*36e5+n*864e5);return +t.toISOString().slice(0,10).replace(/-/g,'')};
const esc=s=>(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const OPT={st:['全部','招標中','已決標','無法決標','已截標'],cat:['全部','工程類','財物類','勞務類'],
 amt:['全部','100萬以下','100萬–1000萬','1000萬–1億','1億以上'],dl:['全部','3天內','7天內','14天內','30天內']};
const AMT={'100萬以下':[0,1e6],'100萬–1000萬':[1e6,1e7],'1000萬–1億':[1e7,1e8],'1億以上':[1e8,1e15]};
const DLN={'3天內':3,'7天內':7,'14天內':14,'30天內':30};
function chips(){document.querySelectorAll('.chips[data-key]').forEach(el=>{const k=el.dataset.key;
 el.innerHTML=OPT[k].map(v=>`<button class="chip${(F[k]||'全部')===v?' on':''}" data-v="${v}">${v}</button>`).join('');
 el.onclick=e=>{const b=e.target.closest('.chip');if(!b)return;F[k]=b.dataset.v==='全部'?'':b.dataset.v;chips();run()}})}
function pass(d){ // d: [title,unit,city,cat,catd,budget,pub,dl,st,win,amt,url,date,bidders]
 if(F.st&&d[8]!==F.st)return false; if(F.cat&&d[3]!==F.cat)return false;
 const c=$('#city').value; if(c&&d[2]!==c)return false;
 const u=norm($('#unit').value.trim()); if(u&&!norm(d[1]).includes(u))return false;
 if(F.amt){const [a,b]=AMT[F.amt],v=d[5]??d[10];if(v==null||v<a||v>=b)return false}
 if(F.dl){if(!d[7]||d[7]<today()||d[7]>addDays(DLN[F.dl]))return false}
 return true}
function terms(tok){const s=norm(tok),out=new Set();(s.match(/[a-z0-9]+/g)||[]).forEach(w=>out.add(w));
 (s.match(/[\u3400-\u9fff\uf900-\ufaff]+/g)||[]).forEach(g=>{if(g.length==1)out.add(g);else for(let i=0;i<g.length-1;i++)out.add(g.slice(i,i+2))});return [...out]}
async function postings(t){const sh=await get('i/'+(crc(t)%META.shards)+'.json');const s=sh[t];if(!s)return [];let p=0;return s.split(',').map(x=>p+=parseInt(x,16))}
function inter(a,b){const r=[];let i=0,j=0;while(i<a.length&&j<b.length){if(a[i]===b[j]){r.push(a[i]);i++;j++}else if(a[i]<b[j])i++;else j++}return r}
let state=null;
async function vendors(toks,my){const box=$('#vbox');box.innerHTML='';const ts=[...new Set(toks.flatMap(terms))];if(!ts.length)return;
 const ls=await Promise.all(ts.map(async t=>{const sh=await get('vi/'+(crc(t)%META.vshards)+'.json');const s=sh[t];if(!s)return [];let p=0;return s.split(',').map(x=>p+=parseInt(x,16))}));
 ls.sort((a,b)=>a.length-b.length);let ids=ls[0];for(const l of ls.slice(1))ids=inter(ids,l);
 const nt=toks.map(norm),rows=[];for(const i of ids){if(rows.length>=200)break;const c=await get('v/'+Math.floor(i/META.vchunk)+'.json');const v=c[i%META.vchunk];if(nt.every(t=>norm(v[0]).includes(t)))rows.push(v)}
 if(my!==seq)return;if(!rows.length){box.innerHTML='<p class="muted">找不到符合的廠商。</p>';return}
 box.innerHTML=`<table class="vt"><thead><tr><th>廠商</th><th>投標次數</th><th>得標次數</th><th>得標率</th></tr></thead><tbody>${rows.slice(0,30).map(v=>`<tr><td>${hl(v[0])}</td><td>${v[1].toLocaleString()}</td><td>${v[2].toLocaleString()}</td><td>${v[1]?Math.round(v[3]/v[1]*100)+'%':'—'}</td></tr>`).join('')}</tbody></table><p class="muted small">投標次數只計公告有列投標廠商的案件；得標率＝（有投標名單且得標）÷投標次數。${rows.length>30?'僅顯示前 30 家（依投標＋得標次數排序）。':''}</p>`}
function render(items,append){const L=$('#list');const h=items.map(row).join('');if(append)L.insertAdjacentHTML('beforeend',h);else L.innerHTML=h}
function hl(s){if(!state||!state.toks.length)return esc(s);let r=esc(s);state.toks.forEach(t=>{const e=esc(t).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');r=r.replace(new RegExp(e,'gi'),'<mark>$&</mark>')});return r}
function row(d){const t=today(),soon=d[7]&&d[7]>=t&&d[7]<=addDays(3);
 return `<article class="row"><div class="top"><span class="st st-${d[8]}">${d[8]}</span><span class="tag">${d[3]}</span><span class="tag">${esc(d[2])}</span></div>
 <h4><a href="${esc(d[11])}" target="_blank" rel="noopener">${hl(d[0])}</a></h4>
 <div class="m"><span>機關：<b>${hl(d[1])}</b></span><span>預算：${fmtM(d[5])}</span><span>公告日：${fmtD(d[6])}</span><span class="${soon?'urgent':''}">截標日：${fmtD(d[7])}</span>
 ${d[8]==='已決標'||d[13]||d[9]?`<span class="vend">投標廠商${d[13]?`（${d[13].split('、').length} 家）`:''}：${d[13]?hl(d[13]):'<i class="muted">公告未列</i>'}</span><span class="vend">得標廠商：<b>${d[9]?hl(d[9]):(d[8]==='無法決標'?'無（無法決標）':'<i class="muted">公告未列</i>')}</b></span><span>決標金額：${fmtM(d[10])}</span>`:''}<span>${esc(d[4]||'')}</span></div>
 <div class="m"><a href="${esc(d[11])}" target="_blank" rel="noopener">查看採購網原始公告 ↗</a></div></article>`}
async function run(){const my=++seq,t0=performance.now();const q=$('#q').value.trim();
 $('#more').hidden=true;$('#empty').hidden=true;
 const toks=q.split(/\s+/).filter(Boolean);
 if(!toks.length&&mode!=='vendor'){ // 首頁：招標中
  state={toks:[]};let r=HOME.map(x=>x.slice(1)).filter(pass);
  if(mode==='soon'){r=r.filter(d=>d[7]&&d[7]<=addDays(7));}
  r.sort((a,b)=>(a[7]||99999999)-(b[7]||99999999));
  $('#count').innerHTML=`${mode==='soon'?'7 天內截標':'招標中'}標案 <b>${r.length.toLocaleString()}</b> 件（依截標日排序）`;
  $('#hint').textContent='輸入關鍵字可搜尋2024 年 1 月起全部招標與決標公告（含已決標），篩選不會預設隱藏搜尋結果。';
  state.all=r;state.shown=0;more(true);return}
 if(mode!=='vendor')$('#vbox').innerHTML='';
 if(!toks.length){$('#vbox').innerHTML='';$('#count').textContent='請輸入廠商名稱，查詢2024 年 1 月起投標與得標紀錄';$('#list').innerHTML='';$('#hint').textContent='';return}
 $('#count').textContent='搜尋中…';
 const ts=[...new Set(toks.flatMap(terms))];if(!ts.length){$('#count').textContent='請輸入中文或英數關鍵字';return}
 const lists=await Promise.all(ts.map(postings));if(my!==seq)return;
 lists.sort((a,b)=>a.length-b.length);let ids=lists[0];for(const l of lists.slice(1))ids=inter(ids,l);
 state={toks,ids,pos:0,hits:[],shown:0,t0,my};
 if(mode==='vendor')vendors(toks,my);
 $('#hint').textContent=mode==='vendor'?'列出投標或得標廠商名稱符合的案件；上方為各廠商投標／得標次數。':'搜尋範圍：2024 年 1 月起全部狀態；可用左側篩選縮小範圍。';
 await fill(ids.length<=3000?1e9:50);if(my!==seq)return;
 const ms=Math.round(performance.now()-t0);
 state.ms=ms;more(true)}
async function fill(need){const s=state,nt=s.toks.map(norm);
 while(s.hits.length<s.shown+need&&s.pos<s.ids.length){const batch=s.ids.slice(s.pos,s.pos+600);s.pos+=batch.length;
  const ch=[...new Set(batch.map(i=>Math.floor(i/META.chunk)))];const data=await Promise.all(ch.map(c=>get('d/'+c+'.json')));
  if(s.my!==seq)return;const m={};ch.forEach((c,k)=>m[c]=data[k]);
  for(const i of batch){const d=m[Math.floor(i/META.chunk)][i%META.chunk];const txt=norm(mode==='vendor'?d[9]+' '+(d[13]||''):d[0]+' '+d[1]+' '+d[9]+' '+(d[13]||'')+' '+d[4]);
   if(nt.every(t=>txt.includes(t))&&pass(d)&&(mode!=='soon'||(d[7]&&d[7]>=today()&&d[7]<=addDays(7))))s.hits.push(d)}}}
async function more(first){const s=state;
 if(s.ids){if(!first)await fill(50);if(s!==state)return;const page=s.hits.slice(s.shown,s.shown+50);render(page,!first);s.shown+=page.length;
  const done=s.pos>=s.ids.length;
  $('#count').innerHTML=`「${esc(s.toks.join(' '))}」找到 <b>${done?s.hits.length.toLocaleString():s.hits.length.toLocaleString()+'+'}</b> 件${done?'':`（候選 ${s.ids.length.toLocaleString()} 件，依公告日新→舊）`}<span class="timing">${s.ms??''} 毫秒</span>`;
  $('#more').hidden=done&&s.shown>=s.hits.length;$('#empty').hidden=s.hits.length>0}
 else{const page=s.all.slice(s.shown,s.shown+50);render(page,!first);s.shown+=page.length;$('#more').hidden=s.shown>=s.all.length;$('#empty').hidden=s.all.length>0}}
$('#more').onclick=()=>more(false);
$('#xl').onclick=async()=>{const s=state;if(!s)return;let rows;$('#xl').textContent='匯出中…';
 try{if(s.ids){await fill(5000);rows=s.hits.slice(0,5000)}else rows=s.all}finally{$('#xl').textContent='匯出 Excel'}
 const nm=s.toks&&s.toks.length?'標案搜尋_'+s.toks.join('_'):(mode==='soon'?'即將截標':'招標中標案');
 TKX.csv(nm,['案名','機關','縣市','類別','預算','公告日','截標日','狀態','得標廠商','決標金額','投標廠商','公告連結'],rows.map(d=>[d[0],d[1],d[2],d[3],d[5]??'',fmtD(d[6]),fmtD(d[7]),d[8],d[9],d[10]??'',d[13]||'',d[11]]))};
let tm,comp=false;const q=$('#q');
q.addEventListener('compositionstart',()=>comp=true);q.addEventListener('compositionend',()=>{comp=false;clearTimeout(tm);tm=setTimeout(run,400)});
q.addEventListener('input',e=>{if(comp||e.isComposing)return;clearTimeout(tm);tm=setTimeout(run,400)});
q.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.isComposing){clearTimeout(tm);run()}});
$('#qBtn').onclick=()=>{clearTimeout(tm);run()};
$('#tabs').onclick=e=>{const b=e.target.closest('.tab');if(!b)return;mode=b.dataset.m;document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('on',x===b));
 q.placeholder=mode==='vendor'?'輸入廠商名稱，查投標與得標次數（例：中華電信、遠傳）':'搜尋案名、機關或廠商（例：道路改善、資訊系統、臺中市政府）';run()};
$('#city').onchange=run;$('#unit').onchange=run;
$('#reset').onclick=()=>{Object.keys(F).forEach(k=>F[k]='');$('#city').value='';$('#unit').value='';chips();run()};
$('#openFilters').onclick=()=>$('#filters').classList.add('open');$('#applyFilters').onclick=()=>$('#filters').classList.remove('open');
(async()=>{META=await (await fetch(D+'meta.json?t='+Date.now())).json();
 $('#grandTotal').textContent=META.n.toLocaleString('zh-TW');
 $('#range').textContent=`公告期間 ${fmtD(META.from)} – ${fmtD(META.to)}・招標中 ${META.home.toLocaleString()} 件・已決標 ${(META.status['已決標']||0).toLocaleString()} 件`;
 $('#updated').textContent=META.built;
 META.cities.forEach(c=>$('#city').insertAdjacentHTML('beforeend',`<option>${c}</option>`));
 $('#units').innerHTML=META.units.map(u=>`<option value="${esc(u)}">`).join('');
 chips();HOME=await get('home.json');const p=new URLSearchParams(location.search);if(p.get('q'))q.value=p.get('q');run()})();
})();
