(()=>{const $=s=>document.querySelector(s);
const C=['臺北市','新北市','桃園市','臺中市','臺南市','高雄市','基隆市','新竹市','嘉義市','新竹縣','苗栗縣','彰化縣','南投縣','雲林縣','嘉義縣','屏東縣','宜蘭縣','花蓮縣','臺東縣','澎湖縣','金門縣','連江縣','中央/其他'];
C.forEach(c=>$('#ct').insertAdjacentHTML('beforeend',`<option>${c}</option>`));
const p=new URLSearchParams(location.search);if(p.get('email'))$('#em').value=p.get('email');
function call(act){const em=$('#em').value.trim(),kw=$('#kws').value.trim(),ct=[...$('#ct').selectedOptions].map(o=>o.value).join(',');
 if(!window.TK_SUB_URL){$('#msg').textContent='訂閱功能即將開放，請先來信 renhe74123@gmail.com 告訴我們你的關鍵字。';return}
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)){$('#msg').textContent='請填正確的 Email';return}
 if(act==='sub'&&!kw){$('#msg').textContent='請至少填一個關鍵字';return}
 const cb='tkcb'+Date.now();window[cb]=r=>{delete window[cb];$('#msg').textContent={subscribed:'訂閱成功！明天起會收到符合「'+kw+'」的新標案。',updated:'已更新你的關鍵字與縣市。',unsubscribed:'已取消訂閱，之後不會再寄信給你。',notfound:'這個 Email 沒有訂閱紀錄。',invalid:'資料格式不正確。',wait:'剛剛已送出，請稍候 30 秒再試。'}[r.status]||'發生錯誤，請稍後再試。'};
 const s=document.createElement('script');s.src=window.TK_SUB_URL+'?'+new URLSearchParams({act,email:em,kw,city:ct,callback:cb});s.onerror=()=>$('#msg').textContent='連線失敗，請稍後再試。';document.body.appendChild(s)}
$('#f').onsubmit=e=>{e.preventDefault();call('sub')};$('#un').onclick=()=>call('unsub');
if(p.get('unsub')==='1')$('#msg').textContent='確認 Email 後按「取消訂閱」即可。';})();
