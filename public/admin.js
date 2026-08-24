
async function init(){
  const d=await (await fetch('/api/content')).json();

  for(const k of ['companyName','heroTitle','heroText','aboutTitle','aboutText','phone','email','address','whatsapp']){
    const el=document.getElementById(k);
    if(el) el.value=d[k]||'';
  }

  const brandText = document.getElementById('adminBrandText');
  const logo = document.getElementById('adminLogoPreview');
  if(d.logo){
    logo.src = d.logo;
    logo.alt = d.companyName || 'Firma logosu';
    logo.hidden = false;
    brandText.hidden = true;
  }else{
    brandText.textContent = d.companyName || 'Örnek Firma';
  }

  document.getElementById('services').innerHTML=(d.services||[]).slice(0,3).map((s,i)=>`
    <div class="serviceEdit serviceEditDetailed">
      <div class="serviceEditTitle">Hizmet ${i+1}</div>

      <label>Kart Başlığı
        <input name="serviceTitle${i}" value="${esc(s.title)}">
      </label>

      <label>Kart Görseli
        <input type="file" name="serviceImage${i}" accept="image/*">
      </label>

      <label style="grid-column:1/-1">Karttaki Kısa Açıklama
        <textarea name="serviceText${i}">${esc(s.text)}</textarea>
      </label>

      <div class="detailAdminDivider">Hizmet Detay Sayfası</div>

      <label style="grid-column:1/-1">Detay Sayfası Üst Görseli
        <input type="file" name="serviceDetailImage${i}" accept="image/*">
        <small class="fieldHint">Yeni görsel seçmezsen mevcut detay görseli korunur.</small>
      </label>

      <label style="grid-column:1/-1">Detay Sayfası Açıklaması
        <textarea class="detailTextarea" name="serviceDetailText${i}">${esc(s.detailText||'')}</textarea>
      </label>

      <a class="previewDetailLink" href="/hizmet/${i}" target="_blank">Detay sayfasını görüntüle ↗</a>
    </div>`).join('');

  if(new URLSearchParams(location.search).get('saved')==='1'){
    document.getElementById('saved').style.display='block';
  }
}

function esc(s=''){return s.replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
init();
