/* 611 About page content — published data with secure draft preview */
(()=> {
 const ADMIN_ORIGIN="https://611-portfolio-admin.cookieyummy0423.workers.dev";
 const root=document.querySelector("#about-content");if(!root)return;
 const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n};
 const render=d=>{
  if(!d)return;
  const eyebrow=root.querySelector(".eyebrow");if(eyebrow)eyebrow.textContent=d.eyebrow||"02 — THE PERSON";
  const title=root.querySelector("h1");if(title){title.replaceChildren(document.createTextNode((d.titleTop||"WHO IS")+" "));const span=el("span","",d.titleBottom||"611?");title.replaceChildren();title.append(document.createTextNode((d.titleTop||"WHO IS")+" "),document.createElement("br"),span)}
  const photo=root.querySelector(".about-photo");if(photo){photo.replaceChildren();if(d.photo){const img=el("img");img.src=d.photo.startsWith("http")?d.photo:"https://cookieyummy0423-netizen.github.io/611/"+d.photo;img.alt="611 個人照片";img.style.objectPosition=(Number.isFinite(Number(d.photoX))?Number(d.photoX):50)+"% "+(Number.isFinite(Number(d.photoY))?Number(d.photoY):50)+"%";photo.append(img)}else photo.append(el("span","about-photo-placeholder","ADD YOUR PHOTO"))}
  const copy=root.querySelector(".info-copy");if(copy){copy.replaceChildren();(d.intro||[]).forEach((p,i)=>copy.append(el("p",i===0?"about-lead":"",p)));const tags=el("div","info-tags mono");(d.skills||[]).forEach(s=>tags.append(el("span","",s)));if((d.skills||[]).length)copy.append(tags)}
  const exp=root.querySelector(".about-experience");if(exp){exp.replaceChildren();if((d.experiences||[]).length){exp.append(el("p","eyebrow mono","EXPERIENCE / SELECTED"));(d.experiences||[]).forEach(x=>{const row=el("article","about-experience-item");row.append(el("strong","",x.title||""),el("span","",x.period||""),el("p","",x.description||""));exp.append(row)})}}
  const extra=root.querySelector(".about-extra");if(extra){extra.replaceChildren();(d.blocks||[]).forEach(x=>{const sec=el("section","about-custom-block");if(x.title)sec.append(el("h2","",x.title));if(x.text)sec.append(el("p","",x.text));if(x.image){const img=el("img");img.src=x.image;img.alt=x.title||"About image";sec.append(img)}extra.append(sec)})}
 };
 let draft=false;
 window.addEventListener("message",e=>{if(e.origin!==ADMIN_ORIGIN||e.data?.type!=="611-about-preview")return;draft=true;render(e.data.about)});
 fetch("about.json",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(d=>{if(d&&!draft)render(d)}).catch(e=>console.warn("611 about settings:",e));
})();