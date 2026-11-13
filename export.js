/* 標案王：前端匯出 Excel（UTF-8 BOM CSV，Excel 直接開啟不亂碼） */
window.TKX={
 SRC:'資料來源：標案王 www.bidking.tw｜仁禾管理顧問 renhe74123@gmail.com',
 cell(v){v=v==null?'':String(v).replace(/\s+/g,' ').trim();if(/^[=+\-@]/.test(v))v="'"+v;return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v},
 csv(name,header,rows){const L=[header,...rows].map(r=>r.map(TKX.cell).join(','));L.push('',TKX.cell(TKX.SRC));
  const b=new Blob(['\ufeff'+L.join('\r\n')],{type:'text/csv;charset=utf-8'});const a=document.createElement('a');
  a.href=URL.createObjectURL(b);a.download=(name||'標案王').replace(/[\\/:*?"<>|]/g,'_')+'_'+new Date().toISOString().slice(0,10)+'.csv';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)},
 tables(name,root){const rows=[];let w=0;(root||document.querySelector('main')||document).querySelectorAll('table').forEach(t=>{const h=t.closest('.card')?.querySelector('h2');if(rows.length)rows.push([]);if(h)rows.push(['【'+h.textContent.trim()+'】']);
  t.querySelectorAll('tr').forEach(tr=>{const r=[...tr.children].map(c=>c.textContent);w=Math.max(w,r.length);rows.push(r)})});
  if(!rows.length){alert('這頁沒有可匯出的表格');return}TKX.csv(name||document.title.split('｜')[0],[],rows)}
};
document.addEventListener('click',e=>{const b=e.target.closest('[data-export-tables]');if(b)TKX.tables(b.dataset.exportTables||undefined)});
