
async function loadSite(){
  const res = await fetch('/api/content');
  const d = await res.json();
  document.title = `${d.companyName} | Servis Hizmetleri`;

  const brandName = byId('brandName');
  const brandLogo = byId('brandLogo');
  const footerCompany = byId('footerCompany');
  const footerLogo = byId('footerLogo');

  if(d.logo){
    brandLogo.src = d.logo;
    brandLogo.alt = d.companyName || 'Firma logosu';
    brandLogo.hidden = false;
    brandName.hidden = true;
    footerLogo.src = d.logo;
    footerLogo.alt = d.companyName || 'Firma logosu';
    footerLogo.hidden = false;
    footerCompany.hidden = true;
  } else {
    brandName.textContent = d.companyName;
    brandName.hidden = false;
    footerCompany.textContent = d.companyName;
    footerCompany.hidden = false;
  }

  byId('heroTitle').textContent=d.heroTitle;
  byId('heroText').textContent=d.heroText;
  byId('aboutTitle').textContent=d.aboutTitle;
  byId('aboutText').textContent=d.aboutText;
  byId('phone').textContent=d.phone;
  byId('email').textContent=d.email;
  byId('address').textContent=d.address;

  if(d.heroImage){
    byId('heroBackdrop').style.backgroundImage =
      `linear-gradient(120deg,rgba(6,17,26,.92),rgba(20,43,60,.55)),url("${d.heroImage}")`;
  }

  const wa=`https://wa.me/${(d.whatsapp||'').replace(/\D/g,'')}`;
  byId('waButton').href=wa;
  byId('floatingWa').href=wa;

  byId('serviceCards').innerHTML=d.services.map((s,i)=>`
    <a class="serviceCard serviceCardLink reveal" href="/hizmet/${i}" style="transition-delay:${i*80}ms" aria-label="${escapeHtml(s.title)} detaylarını görüntüle">
      <div class="cardImage" ${s.image?`style="background-image:url('${s.image}')"`:''}></div>
      <div class="cardBody">
        <h3>${escapeHtml(s.title)}</h3>
        <p>${escapeHtml(s.text)}</p>
        <span class="cardMore">Detayları İncele <b>→</b></span>
      </div>
    </a>`).join('');

  initJobStatus();
  initReveal();
}

function byId(id){return document.getElementById(id)}
function escapeHtml(s=''){return s.replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}

function initReveal(){
  const els=document.querySelectorAll('.reveal');
  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    })
  },{threshold:.14});
  els.forEach(el=>io.observe(el));
}

function initJobStatus(){
  const box = byId('jobStatus');
  if(!box) return;
  const status = new URLSearchParams(location.search).get('job');
  const messages = {
    success: ['success', 'Başvurunuz başarıyla gönderildi. Teşekkür ederiz.'],
    missing: ['error', 'Lütfen tüm zorunlu alanları doldurun ve CV dosyanızı ekleyin.'],
    error: ['error', 'Başvuru gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.'],
    mailconfig: ['error', 'E-posta gönderim ayarları henüz tamamlanmamış. Site yöneticisi SMTP ayarlarını Render üzerinden tanımlamalı.']
  };
  if(messages[status]){
    box.className = `jobStatus ${messages[status][0]}`;
    box.textContent = messages[status][1];
    box.hidden = false;
  }
}

document.querySelector('.menuBtn').addEventListener('click',()=>document.querySelector('.topbar nav').classList.toggle('open'));
document.querySelectorAll('.topbar nav a').forEach(a=>a.addEventListener('click',()=>document.querySelector('.topbar nav').classList.remove('open')));
loadSite();
