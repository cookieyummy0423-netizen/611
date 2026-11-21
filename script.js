/* 611 VISUAL ARCHIVE — filtering, modal and private local editor */
const grid=document.querySelector(".work-grid");
const currentPage=document.body.dataset.page||"all";
const categoryLinks=document.querySelectorAll("[data-page-link]");
const emptyMessage=document.querySelector(".category-empty");
const ORDER_KEY="611-work-order-v1";
const LOCAL_WORKS_KEY="611-local-works-v1";
const categoryOrder={illustration:0,character:1,scene:2,motion:3};
const typeOrder={"ILLUSTRATION / PERSONAL":0,"ILLUSTRATION / ARTWORK":1,"CHARACTER DESIGN":0,"SCENE DESIGN / STORYBOARD":0,"MOTION / GIF":0,"MOTION / VIDEO":1};
let editorMode=false;
let draggedCard=null;

function getCardTitle(card){return card.querySelector(".work-meta h3")?.textContent.trim()||"untitled";}
function getCardCategory(card){return card.dataset.category||"illustration";}
function getCardType(card){return card.querySelector(".work-meta p")?.textContent.trim()||"";}
function assignCardIds(){
  grid?.querySelectorAll(".work-card").forEach(card=>{
    if(!card.dataset.workId){
      const raw=getCardCategory(card)+"-"+getCardTitle(card);
      card.dataset.workId="work-"+Array.from(raw).map(ch=>ch.codePointAt(0).toString(16)).join("-");
    }
  });
}
function sortByTaxonomy(){
  if(!grid)return;
  const list=[...grid.querySelectorAll(".work-card")];
  list.sort((a,b)=>(categoryOrder[getCardCategory(a)]??99)-(categoryOrder[getCardCategory(b)]??99)
    ||(typeOrder[getCardType(a)]??99)-(typeOrder[getCardType(b)]??99)
    ||getCardTitle(a).localeCompare(getCardTitle(b),"zh-Hant"));
  list.forEach(card=>grid.appendChild(card));
}
function applySavedOrder(){
  if(!grid)return;
  let saved=[];
  try{saved=JSON.parse(localStorage.getItem(ORDER_KEY)||"[]");}catch(error){}
  if(!Array.isArray(saved)||!saved.length){sortByTaxonomy();return;}
  const rank=new Map(saved.map((id,index)=>[id,index]));
  [...grid.querySelectorAll(".work-card")].sort((a,b)=>(rank.get(a.dataset.workId)??999999)-(rank.get(b.dataset.workId)??999999)).forEach(card=>grid.appendChild(card));
}
function saveOrder(){
  if(!grid)return;
  try{localStorage.setItem(ORDER_KEY,JSON.stringify([...grid.querySelectorAll(".work-card")].map(card=>card.dataset.workId)));}
  catch(error){alert("瀏覽器無法儲存排列，請確認本機儲存空間。");}
}
let archivePage=1,archivePageSize=12;
let archivePager=null;
function ensureArchivePager(){
  if(currentPage!=="all"||!grid||archivePager)return;
  archivePager=document.createElement("nav");archivePager.className="archive-pagination";archivePager.setAttribute("aria-label","作品分頁");
  archivePager.innerHTML='<label class="mono">每頁顯示 <select aria-label="每頁作品數"><option value="12">12 件</option><option value="16">16 件</option></select></label><div class="archive-page-actions"><button type="button" data-page-prev>← 上一頁</button><span class="archive-page-count mono" aria-live="polite"></span><button type="button" data-page-next>下一頁 →</button></div>';
  grid.insertAdjacentElement("afterend",archivePager);
  const select=archivePager.querySelector("select");select.value=String(archivePageSize);
  select.addEventListener("change",()=>{archivePageSize=Number(select.value)||12;archivePage=1;refreshCards();});
  archivePager.querySelector("[data-page-prev]").addEventListener("click",()=>{archivePage=Math.max(1,archivePage-1);refreshCards();grid.scrollIntoView({behavior:"smooth",block:"start"});});
  archivePager.querySelector("[data-page-next]").addEventListener("click",()=>{archivePage++;refreshCards();grid.scrollIntoView({behavior:"smooth",block:"start"});});
}
function refreshCards(){
  if(!grid)return;
  const cards=[...grid.querySelectorAll(".work-card")];
  const matching=cards.filter(card=>currentPage==="all"||getCardCategory(card)===currentPage);
  const pages=currentPage==="all"?Math.max(1,Math.ceil(matching.length/archivePageSize)):1;
  archivePage=Math.min(archivePage,pages);
  const start=(archivePage-1)*archivePageSize,end=start+archivePageSize;
  cards.forEach((card,index)=>{
    const categoryMatch=currentPage==="all"||getCardCategory(card)===currentPage;
    const matchIndex=matching.indexOf(card);
    card.hidden=!categoryMatch||(currentPage==="all"&&(matchIndex<start||matchIndex>=end));
    const indexLabel=card.querySelector(".image-index");
    if(indexLabel)indexLabel.textContent="FIG. "+String(index+1).padStart(3,"0");
    const number=card.querySelector(".work-number");
    if(number)number.textContent=String(index+1).padStart(2,"0")+" / "+cards.length;
  });
  categoryLinks.forEach(link=>{
    if(link.dataset.pageLink===currentPage){link.classList.add("active");link.setAttribute("aria-current","page");}
    else{link.classList.remove("active");link.removeAttribute("aria-current");}
  });
  if(emptyMessage)emptyMessage.hidden=matching.length!==0;
  if(currentPage==="all"){
    ensureArchivePager();
    if(archivePager){
      archivePager.hidden=matching.length===0;
      archivePager.querySelector(".archive-page-count").textContent="PAGE "+archivePage+" / "+pages+" · "+matching.length+" WORKS";
      archivePager.querySelector("[data-page-prev]").disabled=archivePage<=1;
      archivePager.querySelector("[data-page-next]").disabled=archivePage>=pages;
    }
  }else if(archivePager)archivePager.hidden=true;
}
function applyCardLayout(card,work){
  const layout=work.cardLayout||{};
  for(const mode of ["desktop","mobile"]){
    const v={ratio:"global",fit:"contain",x:50,y:50,titleSize:mode==="desktop"?16:15,descriptionSize:mode==="desktop"?10:9,meta:"below",...(layout[mode]||{})};
    if(v.ratio&&v.ratio!=="global")card.style.setProperty("--card-ratio-"+mode,v.ratio==="original"?"auto":v.ratio);
    card.style.setProperty("--card-fit-"+mode,v.fit==="cover"?"cover":"contain");
    card.style.setProperty("--card-x-"+mode,Math.max(0,Math.min(100,Number(v.x)||0))+"%");
    card.style.setProperty("--card-y-"+mode,Math.max(0,Math.min(100,Number(v.y)||0))+"%");
    card.style.setProperty("--card-title-"+mode,Math.max(8,Math.min(48,Number(v.titleSize)||16))+"px");
    card.style.setProperty("--card-description-"+mode,Math.max(8,Math.min(32,Number(v.descriptionSize)||10))+"px");
    card.dataset["cardMeta"+(mode==="desktop"?"Desktop":"Mobile")]=v.meta==="overlay"?"overlay":"below";
  }
}
function makeLocalCard(work){
  const card=document.createElement("article");
  card.className="work-card work-offset";
  card.dataset.category=work.category;
  card.dataset.detail=work.description||"";
  card.dataset.workId=work.id;
  const isVideo=work.mediaKind==="video";
  let media;
  if(isVideo){
    media=document.createElement("div");media.className="video-frame";
    const video=document.createElement("video");video.controls=true;video.preload="none";video.playsInline=true;
    const source=document.createElement("source");source.src=work.media;source.type="video/mp4";video.appendChild(source);media.appendChild(video);
  }else{
    media=document.createElement("a");media.className="work-image image-square";media.href="#work-detail";media.setAttribute("aria-label","查看作品："+work.title);
    const img=document.createElement("img");img.src=work.media;img.alt=work.title;img.loading="lazy";img.decoding="async";media.appendChild(img);
  }
  const fig=document.createElement("span");fig.className="image-index mono";fig.textContent="FIG. NEW";media.appendChild(fig);
  card.appendChild(media);
  const meta=document.createElement("div");meta.className="work-meta";
  const info=document.createElement("div");
  const category=document.createElement("p");category.className="mono";category.textContent=work.typeLabel||work.category.toUpperCase();
  const title=document.createElement("h3");title.textContent=work.title;
  const desc=document.createElement("span");desc.textContent=work.subtitle||work.description||"";
  info.append(category,title,desc);
  const number=document.createElement("span");number.className="work-number mono";number.textContent="NEW";
  meta.append(info,number);const detail=work.detailPage||{};if(detail.enabled){const link=document.createElement("a");link.className="work-detail-link";link.href="work.html?"+(detail.slug?"slug="+encodeURIComponent(detail.slug):"id="+encodeURIComponent(work.id));link.textContent="VIEW FULL PROJECT ↗";meta.append(link)}card.appendChild(meta);
  applyCardLayout(card,work);
  return card;
}
function loadLocalWorks(){
  if(!grid)return;
  let works=[];
  try{works=JSON.parse(localStorage.getItem(LOCAL_WORKS_KEY)||"[]");}catch(error){}
  if(Array.isArray(works))works.forEach(work=>grid.appendChild(makeLocalCard(work)));
}
function createEditorUI(){
  if(!grid)return;
  const toolbar=document.createElement("div");
  toolbar.className="editor-toolbar";
  toolbar.innerHTML='<span>管理模式已開啟｜拖曳卡片調整順序・在作品區按右鍵新增</span><span><button type="button" class="editor-reset">重設排列</button> <button type="button" class="editor-add">新增作品</button> <button type="button" class="editor-exit">退出管理</button></span>';
  grid.parentNode.insertBefore(toolbar,grid);
  const dialog=document.createElement("dialog");
  dialog.className="editor-dialog";
  dialog.innerHTML='<h2>新增作品</h2><p>新增內容只會儲存在目前瀏覽器，不會上傳到 GitHub。請填寫網站已存在的圖片／影片路徑。</p><form class="editor-form"><label>作品名稱<input name="title" required maxlength="80" placeholder="例如：夜晚的角色"></label><label>作品分類<select name="category"><option value="illustration">ILLUSTRATION 插畫</option><option value="character">CHARACTER DESIGN 角色設計</option><option value="scene">SCENE DESIGN 場景設計</option><option value="motion">MOTION 動態影像</option></select></label><label>創作類型<input name="typeLabel" required maxlength="60" placeholder="例如：ILLUSTRATION / PERSONAL"></label><label>媒體格式<select name="mediaKind"><option value="image">圖片／GIF</option><option value="video">影片 MP4</option></select></label><label>圖片或影片路徑<input name="media" required placeholder="例如：images/my-art.png"></label><label>作品簡介<textarea name="description" maxlength="240" placeholder="簡短描述作品內容"></textarea></label><div class="editor-form-actions"><button type="button" class="editor-cancel">取消</button><button type="submit">新增到作品集</button></div></form><div class="editor-hint">提示：媒體檔案必須先存在網站資料夾／GitHub，這個工具不會代替上傳檔案。</div>';
  document.body.appendChild(dialog);
  const form=dialog.querySelector("form");
  function openDialog(){form.reset();dialog.showModal();}
  toolbar.querySelector(".editor-add").addEventListener("click",openDialog);
  toolbar.querySelector(".editor-exit").addEventListener("click",()=>setEditorMode(false));
  toolbar.querySelector(".editor-reset").addEventListener("click",()=>{
    localStorage.removeItem(ORDER_KEY);sortByTaxonomy();saveOrder();refreshCards();
  });
  toolbar.querySelector(".editor-add").addEventListener("contextmenu",event=>{event.preventDefault();openDialog();});
  grid.addEventListener("contextmenu",event=>{if(editorMode){event.preventDefault();openDialog();}});
  dialog.querySelector(".editor-cancel").addEventListener("click",()=>dialog.close());
  form.addEventListener("submit",event=>{
    event.preventDefault();
    const data=new FormData(form);
    const work={
      id:"local-"+(window.crypto?.randomUUID?.()||Date.now().toString(36)),
      title:String(data.get("title")).trim(),
      category:String(data.get("category")),
      typeLabel:String(data.get("typeLabel")).trim(),
      mediaKind:String(data.get("mediaKind")),
      media:String(data.get("media")).trim(),
      description:String(data.get("description")).trim()
    };
    if(!work.title||!work.media)return;
    let works=[];
    try{works=JSON.parse(localStorage.getItem(LOCAL_WORKS_KEY)||"[]");}catch(error){}
    works.push(work);
    try{localStorage.setItem(LOCAL_WORKS_KEY,JSON.stringify(works));}
    catch(error){alert("儲存失敗：瀏覽器本機儲存空間可能已滿。");return;}
    const card=makeLocalCard(work);grid.appendChild(card);card.draggable=editorMode;
    saveOrder();refreshCards();dialog.close();
  });
}
function setEditorMode(enabled){
  editorMode=enabled;
  document.body.classList.toggle("editor-mode",enabled);
  if(grid)grid.classList.toggle("is-editing",enabled);
  grid?.querySelectorAll(".work-card").forEach(card=>card.draggable=enabled);
}
if(grid){
  assignCardIds();
  loadLocalWorks();
  assignCardIds();
  applySavedOrder();
  refreshCards();
  createEditorUI();
  grid.addEventListener("dragstart",event=>{
    if(!editorMode)return;
    const card=event.target.closest(".work-card");
    if(!card)return;
    draggedCard=card;card.classList.add("is-dragging");
    event.dataTransfer.effectAllowed="move";event.dataTransfer.setData("text/plain",card.dataset.workId);
  });
  grid.addEventListener("dragover",event=>{
    if(!editorMode||!draggedCard)return;
    event.preventDefault();
    const target=event.target.closest(".work-card");
    if(!target||target===draggedCard)return;
    const rect=target.getBoundingClientRect();
    const before=event.clientY<rect.top+rect.height/2;
    grid.insertBefore(draggedCard,before?target:target.nextSibling);
  });
  grid.addEventListener("dragend",()=>{
    if(draggedCard)draggedCard.classList.remove("is-dragging");
    draggedCard=null;
    if(editorMode){saveOrder();refreshCards();}
  });
}
const toggle=document.querySelector(".menu-toggle");
const nav=document.querySelector(".topbar nav");
if(toggle&&nav){
  toggle.addEventListener("click",()=>{
    const opened=nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded",String(opened));toggle.textContent=opened?"×":"＋";
  });
  nav.querySelectorAll("a").forEach(link=>link.addEventListener("click",()=>{
    nav.classList.remove("open");toggle.setAttribute("aria-expanded","false");toggle.textContent="＋";
  }));
}
document.addEventListener("keydown",event=>{
  if((event.ctrlKey||event.metaKey)&&event.shiftKey&&event.key.toLowerCase()==="e"){
    event.preventDefault();setEditorMode(!editorMode);
  }
});
/* Artwork detail modal */
const modal=document.querySelector(".work-modal");
const modalPanel=modal?.querySelector(".work-modal-panel");
const modalImage=modal?.querySelector(".work-modal-image");
const modalCategory=modal?.querySelector("#modal-category");
const modalTitle=modal?.querySelector("#modal-title");
const modalDescription=modal?.querySelector("#modal-description");
const modalExtra=modal?.querySelector("#modal-extra");
const modalIndex=modal?.querySelector("#modal-index");
let lastFocusedElement=null;
function openWorkModal(card){
  const image=card.querySelector(".work-image img");
  if(!modal||!image)return;
  const title=card.querySelector(".work-meta h3");
  const category=card.querySelector(".work-meta p");
  const description=card.querySelector(".work-meta div>span");
  const number=card.querySelector(".work-number");
  lastFocusedElement=document.activeElement;
  modalImage.src=image.getAttribute("src");modalImage.alt=image.alt||title?.textContent.trim()||"";
  modalTitle.textContent=title?.textContent.trim()||"作品";
  modalCategory.textContent=category?.textContent.trim()||"WORK / DETAILS";
  modalDescription.textContent=description?.textContent.trim()||"";
  modalExtra.textContent=card.dataset.detail||"創作理念與製作過程將陸續補充。";
  modalIndex.textContent=number?.textContent.trim()||"611 / WORK";
  modal.classList.add("is-open");modal.setAttribute("aria-hidden","false");document.body.classList.add("modal-open");modalPanel.focus();
}
function closeWorkModal(){
  if(!modal||!modal.classList.contains("is-open"))return;
  modal.classList.remove("is-open");modal.setAttribute("aria-hidden","true");document.body.classList.remove("modal-open");
  if(lastFocusedElement)lastFocusedElement.focus();
}
grid?.addEventListener("click",event=>{
  const trigger=event.target.closest(".work-image");
  if(!trigger)return;
  event.preventDefault();openWorkModal(trigger.closest(".work-card"));
});
modal?.querySelectorAll("[data-close-modal]").forEach(button=>button.addEventListener("click",closeWorkModal));
document.addEventListener("keydown",event=>{if(event.key==="Escape")closeWorkModal();});

/* Official portfolio content: load the published GitHub manifest. */
if(grid){
  fetch("works.json",{cache:"no-store"})
    .then(response=>{if(!response.ok)throw new Error("作品資料讀取失敗");return response.json();})
    .then(data=>{
      if(!Array.isArray(data.works))return;
      grid.replaceChildren();
      data.works.filter(work=>work.hidden!==true).forEach(work=>grid.appendChild(makeLocalCard(work)));
      saveOrder();
      refreshCards();
    })
    .catch(error=>console.warn("611 works.json:",error))
    .finally(()=>window.__611MarkReady?.("works"));
}
