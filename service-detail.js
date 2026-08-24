
function byId(id){ return document.getElementById(id); }
function escapeHtml(s=''){
  return String(s).replace(/[&<>"']/g,m=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));
}

async function initDetail(){
  const res = await fetch('/api/content');
  const d = await res.json();
  const match = location.pathname.match(/\/hizmet\/(\d+)/);
  const index = match ? Number(match[1]) : -1;
  const service = d.services?.[index];

  if(!service){
    location.href = '/#hizmetler';
    return;
  }

  document.title = `${service.title} | ${d.companyName}`;
  byId('detailTitle').textContent = service.title;
  byId('detailShort').textContent = service.text || '';
  byId('detailContentTitle').textContent = service.title;
  byId('detailText').innerHTML = escapeHtml(service.detailText || service.text || '')
    .split(/\n{2,}/)
    .map(p => `<p>${p.replace(/\n/g,'<br>')}</p>`)
    .join('');

  const image = service.detailImage || service.image || d.heroImage || '';
  if(image){
    byId('detailImage').style.backgroundImage = `url("${image}")`;
  }

  const logo = d.logo || '';
  if(logo){
    byId('brandLogo').src = logo;
    byId('brandLogo').alt = d.companyName || 'Firma logosu';
    byId('brandLogo').hidden = false;
    byId('brandName').hidden = true;
    byId('footerLogo').src = logo;
    byId('footerLogo').alt = d.companyName || 'Firma logosu';
    byId('footerLogo').hidden = false;
    byId('footerCompany').hidden = true;
  } else {
    byId('brandName').textContent = d.companyName || '';
    byId('footerCompany').textContent = d.companyName || '';
  }

  const phone = d.phone || '';
  byId('detailPhone').textContent = phone;
  byId('detailPhoneLink').href = `tel:${phone.replace(/[^\d+]/g,'')}`;

  const wa = `https://wa.me/${(d.whatsapp||'').replace(/\D/g,'')}`;
  byId('detailWa').href = wa;

  initReveal();
}

function initReveal(){
  const els=document.querySelectorAll('.reveal:not(.visible)');
  if(!('IntersectionObserver' in window)){
    els.forEach(el=>el.classList.add('visible'));
    return;
  }
  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  },{threshold:.12});
  els.forEach(el=>io.observe(el));
}

document.querySelector('.menuBtn').addEventListener('click',()=>{
  document.querySelector('.topbar nav').classList.toggle('open');
});
document.querySelectorAll('.topbar nav a').forEach(a=>a.addEventListener('click',()=>{
  document.querySelector('.topbar nav').classList.remove('open');
}));

initDetail();
