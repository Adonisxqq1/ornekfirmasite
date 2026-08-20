
async function init(){
  const d=await (await fetch('/api/content')).json();
  for(const k of ['companyName','heroTitle','heroText','aboutTitle','aboutText','phone','email','address','whatsapp']){
    const el=document.getElementById(k); if(el) el.value=d[k]||'';
  }
  document.getElementById('services').innerHTML=(d.services||[]).slice(0,3).map((s,i)=>`
    <div class="serviceEdit">
      <label>Hizmet ${i+1} başlığı<input name="serviceTitle${i}" value="${esc(s.title)}"></label>
      <label>Görsel<input type="file" name="serviceImage${i}" accept="image/*"></label>
      <label style="grid-column:1/-1">Açıklama<textarea name="serviceText${i}">${esc(s.text)}</textarea></label>
    </div>`).join('');
  if(new URLSearchParams(location.search).get('saved')==='1')document.getElementById('saved').style.display='block';
}
function esc(s=''){return s.replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
init();
