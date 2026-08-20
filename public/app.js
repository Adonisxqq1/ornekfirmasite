
async function loadSite(){
  const res = await fetch('/api/content');
  const d = await res.json();
  document.title = `${d.companyName} | Servis Hizmetleri`;
  byId('brandName').textContent=d.companyName;
  byId('footerCompany').textContent=d.companyName;
  byId('heroTitle').textContent=d.heroTitle;
  byId('heroText').textContent=d.heroText;
  byId('aboutTitle').textContent=d.aboutTitle;
  byId('aboutText').textContent=d.aboutText;
  byId('phone').textContent=d.phone;
  byId('email').textContent=d.email;
  byId('address').textContent=d.address;
  if(d.heroImage) byId('heroBackdrop').style.backgroundImage=`linear-gradient(120deg,rgba(6,17,26,.92),rgba(20,43,60,.55)),url("${d.heroImage}")`;

  const wa=`https://wa.me/${(d.whatsapp||'').replace(/\D/g,'')}`;
  byId('waButton').href=wa; byId('floatingWa').href=wa;

  byId('serviceCards').innerHTML=d.services.map((s,i)=>`
    <article class="serviceCard reveal" style="transition-delay:${i*80}ms">
      <div class="cardImage" ${s.image?`style="background-image:url('${s.image}')"`:''}></div>
      <div class="cardBody"><h3>${escapeHtml(s.title)}</h3><p>${escapeHtml(s.text)}</p></div>
    </article>`).join('');
  initReveal();
}
function byId(id){return document.getElementById(id)}
function escapeHtml(s=''){return s.replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function initReveal(){
  const els=document.querySelectorAll('.reveal');
  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}})
  },{threshold:.14});
  els.forEach(el=>io.observe(el));
}
document.querySelector('.menuBtn').addEventListener('click',()=>document.querySelector('.topbar nav').classList.toggle('open'));
document.querySelectorAll('.topbar nav a').forEach(a=>a.addEventListener('click',()=>document.querySelector('.topbar nav').classList.remove('open')));
loadSite();
