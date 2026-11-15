const cards=document.querySelectorAll(".work-card");
const currentPage=document.body.dataset.page||"all";
const categoryLinks=document.querySelectorAll("[data-page-link]");
let visibleCount=0;
cards.forEach(card=>{
  const categories=(card.dataset.category||"").split(" ");
  const show=currentPage==="all"||categories.includes(currentPage);
  card.hidden=!show;
  if(show)visibleCount++;
});
categoryLinks.forEach(link=>{
  if(link.dataset.pageLink===currentPage){
    link.classList.add("active");
    link.setAttribute("aria-current","page");
  }
});
const emptyMessage=document.querySelector(".category-empty");
if(emptyMessage)emptyMessage.hidden=visibleCount!==0;

const toggle=document.querySelector(".menu-toggle");
const nav=document.querySelector(".topbar nav");
if(toggle&&nav){
  toggle.addEventListener("click",()=>{
    const opened=nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded",String(opened));
    toggle.textContent=opened?"×":"＋";
  });
  nav.querySelectorAll("a").forEach(link=>link.addEventListener("click",()=>{
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded","false");
    toggle.textContent="＋";
  }));
}

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
  if(!modal||!card)return;
  const image=card.querySelector(".work-image img");
  const title=card.querySelector(".work-meta h3");
  const category=card.querySelector(".work-meta p");
  const description=card.querySelector(".work-meta div>span");
  const number=card.querySelector(".work-number");
  if(!image||!title)return;

  lastFocusedElement=document.activeElement;
  modalImage.src=image.getAttribute("src");
  modalImage.alt=image.alt||title.textContent.trim();
  modalTitle.textContent=title.textContent.trim();
  modalCategory.textContent=category?.textContent.trim()||"WORK / DETAILS";
  modalDescription.textContent=description?.textContent.trim()||"";
  modalExtra.textContent=card.dataset.detail||"創作理念與製作過程將陸續補充。";
  modalIndex.textContent=number?.textContent.trim()||"611 / WORK";
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden","false");
  document.body.classList.add("modal-open");
  modalPanel.focus();
}

function closeWorkModal(){
  if(!modal||!modal.classList.contains("is-open"))return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden","true");
  document.body.classList.remove("modal-open");
  if(lastFocusedElement)lastFocusedElement.focus();
}

cards.forEach(card=>{
  const trigger=card.querySelector(".work-image");
  trigger?.addEventListener("click",event=>{
    event.preventDefault();
    openWorkModal(card);
  });
});

modal?.querySelectorAll("[data-close-modal]").forEach(button=>{
  button.addEventListener("click",closeWorkModal);
});
document.addEventListener("keydown",event=>{
  if(event.key==="Escape")closeWorkModal();
});
