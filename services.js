(()=>{
const grid=document.querySelector("#services-grid");
if(!grid)return;
const el=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node};
let lightbox=null;
function ensureLightbox(){
 if(lightbox)return lightbox;
 lightbox=el("div","service-lightbox");
 lightbox.setAttribute("role","dialog");lightbox.setAttribute("aria-modal","true");lightbox.setAttribute("aria-label","委託範例圖片");lightbox.hidden=true;
 const close=el("button","service-lightbox-close","×");close.type="button";close.setAttribute("aria-label","關閉圖片");
 const image=el("img","service-lightbox-image");const caption=el("p","service-lightbox-caption");
 lightbox.append(close,image,caption);document.body.append(lightbox);
 const shut=()=>{lightbox.hidden=true;document.body.classList.remove("service-lightbox-open");image.removeAttribute("src")};
 close.addEventListener("click",shut);lightbox.addEventListener("click",e=>{if(e.target===lightbox)shut()});
 document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!lightbox.hidden)shut()});
 lightbox.openImage=(src,alt)=>{image.src=src;image.alt=alt;caption.textContent=alt;lightbox.hidden=false;document.body.classList.add("service-lightbox-open");close.focus()};
 return lightbox
}
function makeOrbit(images,title){
 const shell=el("div","service-orbit");
 const viewport=el("div","service-orbit-viewport");viewport.tabIndex=0;viewport.setAttribute("role","region");viewport.setAttribute("aria-label",title+"範例圖片，可使用方向鍵切換");
 const track=el("div","service-orbit-track");
 const slides=images.map((src,index)=>{
  const slide=el("button","service-orbit-slide");slide.type="button";
  const img=el("img","service-orbit-image");img.src=src;img.alt=title+"範例 "+(index+1);img.loading=index===0?"eager":"lazy";
  slide.append(img);slide.addEventListener("click",()=>{if(!dragged)ensureLightbox().openImage(src,img.alt)});track.append(slide);return slide
 });
 viewport.append(track);shell.append(viewport);
 const prev=el("button","service-orbit-arrow service-orbit-prev","←");prev.type="button";prev.setAttribute("aria-label","上一張範例");
 const next=el("button","service-orbit-arrow service-orbit-next","→");next.type="button";next.setAttribute("aria-label","下一張範例");
 const count=el("span","service-orbit-count");
 shell.append(prev,count,next);
 let active=0,startX=0,dragged=false,pointerDown=false;
 const render=()=>{
  slides.forEach((slide,i)=>{
   let offset=i-active;
   if(offset>slides.length/2)offset-=slides.length;
   if(offset< -slides.length/2)offset+=slides.length;
   slide.style.setProperty("--orbit-offset",offset);
   slide.classList.toggle("is-active",offset===0);
   slide.setAttribute("aria-hidden",String(offset!==0));
   slide.tabIndex=offset===0?0:-1;
  });
  count.textContent=String(active+1).padStart(2,"0")+" / "+String(slides.length).padStart(2,"0");
  prev.disabled=slides.length<2;next.disabled=slides.length<2
 };
 const move=step=>{if(slides.length<2)return;active=(active+step+slides.length)%slides.length;render()};
 prev.addEventListener("click",()=>move(-1));next.addEventListener("click",()=>move(1));
 viewport.addEventListener("keydown",e=>{if(e.key==="ArrowLeft"){e.preventDefault();move(-1)}if(e.key==="ArrowRight"){e.preventDefault();move(1)}});
 viewport.addEventListener("pointerdown",e=>{if(e.pointerType==="mouse"&&e.button!==0)return;pointerDown=true;dragged=false;startX=e.clientX;viewport.setPointerCapture?.(e.pointerId)});
 viewport.addEventListener("pointerup",e=>{if(!pointerDown)return;pointerDown=false;const delta=e.clientX-startX;if(Math.abs(delta)>35){dragged=true;move(delta<0?1:-1);setTimeout(()=>{dragged=false},0)}});
 viewport.addEventListener("pointercancel",()=>{pointerDown=false});
 render();return shell
}
fetch("services.json?v=orbit-gallery-20261128",{cache:"no-store"}).then(r=>{if(!r.ok)throw Error("無法讀取委託資料");return r.json()}).then(data=>{
 document.querySelector("#services-intro").textContent=data.intro||"";
 const items=(data.items||[]).filter(x=>x.enabled!==false).sort((a,b)=>(a.order||0)-(b.order||0));
 grid.replaceChildren();grid.classList.add("service-stage");
 if(items.length){
  const nav=el("div","service-category-nav");nav.setAttribute("role","tablist");nav.setAttribute("aria-label","委託項目分類");
  const panel=el("article","service-active-panel");panel.setAttribute("aria-live","polite");
  let current=0;
  const renderItem=index=>{
   current=index;nav.querySelectorAll("button").forEach((button,i)=>{button.classList.toggle("is-active",i===index);button.setAttribute("aria-selected",String(i===index));button.tabIndex=i===index?0:-1});
   const item=items[index];panel.replaceChildren();
   const info=el("div","service-active-info");
   info.append(el("p","service-index",String(index+1).padStart(2,"0")+" / "+(item.subtitle||"COMMISSION")));
   info.append(el("h2","",item.title||"未命名項目"));
   info.append(el("p","service-description",item.description||""));
   if(item.includes?.length){const list=el("ul","service-includes");item.includes.forEach(value=>list.append(el("li","",value)));info.append(list)}
   const prices=el("div","service-prices");
   for(const [label,value] of [["單人",item.singlePrice],["雙人",item.doublePrice]]){const price=el("div","service-price");price.append(el("span","service-price-label",label),el("strong","",String(value||"價格洽詢")));prices.append(price)}
   info.append(prices);
   const visual=el("div","service-active-visual");
   const images=(Array.isArray(item.images)?item.images:(item.image?[item.image]:[])).slice(0,3);
   if(images.length)visual.append(makeOrbit(images,item.title||"委託"));
   else visual.append(el("div","service-orbit-empty","此項目目前沒有展示圖片"));
   panel.append(info,visual)
  };
  items.forEach((item,index)=>{const button=el("button","service-category",item.title||"未命名");button.type="button";button.setAttribute("role","tab");button.addEventListener("click",()=>renderItem(index));button.addEventListener("keydown",e=>{if(e.key==="ArrowRight"||e.key==="ArrowLeft"){e.preventDefault();const next=(index+(e.key==="ArrowRight"?1:-1)+items.length)%items.length;nav.children[next].focus();renderItem(next)}});nav.append(button)});
  grid.append(nav,panel);renderItem(0)
 }else grid.append(el("p","service-description","目前暫無開放項目。"));
 const notes=document.querySelector("#services-notes");notes.replaceChildren();(data.notes||[]).forEach(value=>notes.append(el("li","",value)))
}).catch(error=>grid.replaceChildren(el("p","service-description",error.message)))
})();