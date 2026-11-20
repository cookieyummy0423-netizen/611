/* 611 Global Layout Studio — responsive layout tokens and visual selection */
(()=>{
 const ADMIN_ORIGIN="https://611-portfolio-admin.cookieyummy0423.workers.dev";
 const selectors={
  topbar:".topbar",hero:".hero",sectionHeading:".section-heading",pageTitle:".info-page h1",
  filterRow:".filter-row",infoPage:".info-page",infoCopy:".info-copy",contact:".social-links",
  statement:".statement",footer:".footer"
 };
 const style=document.createElement("style");style.id="611-layout-settings";document.head.append(style);
 const highlight=document.createElement("style");highlight.textContent='html.611-layout-select [data-layout-id]{outline:1px dashed rgba(46,255,231,.5);outline-offset:4px;cursor:pointer}html.611-layout-select [data-layout-id]:hover,html.611-layout-select [data-layout-id].611-layout-picked{outline:2px solid #2effe7;outline-offset:5px}';document.head.append(highlight);
 const ids=Object.keys(selectors);
 function mark(){ids.forEach(id=>document.querySelectorAll(selectors[id]).forEach(el=>el.setAttribute("data-layout-id",id)))}
 function declarations(data){const props={maxWidth:"max-width",minHeight:"min-height",paddingTop:"padding-top",paddingBottom:"padding-bottom",marginTop:"margin-top",marginBottom:"margin-bottom",fontSize:"font-size",lineHeight:"line-height",gap:"gap"};let out="";for(const [key,css] of Object.entries(props)){const n=Number(data?.[key]);if(Number.isFinite(n)&&n>0)out+=css+":"+n+(key==="lineHeight"?"":"px")+" !important;"}if(["left","center","right"].includes(data?.textAlign))out+="text-align:"+data.textAlign+" !important;";return out}
 function apply(layout){mark();let css="";for(const id of ids){const region=layout?.regions?.[id]||{};const desk=declarations(region.desktop||{}),mob=declarations(region.mobile||{});const selector='[data-layout-id="'+id+'"]';if(desk)css+=selector+"{"+desk+"}";if(mob)css+="@media(max-width:760px){"+selector+"{"+mob+"}}"}style.textContent=css}
 let editing=false,selected=null;
 function setEditing(value){editing=!!value;document.documentElement.classList.toggle("611-layout-select",editing)}
 document.addEventListener("click",event=>{if(!editing)return;const el=event.target.closest("[data-layout-id]");if(!el)return;event.preventDefault();event.stopPropagation();document.querySelectorAll(".611-layout-picked").forEach(x=>x.classList.remove("611-layout-picked"));el.classList.add("611-layout-picked");selected=el.dataset.layoutId;parent.postMessage({type:"611-layout-select",region:selected},ADMIN_ORIGIN)},true);
 window.addEventListener("message",event=>{if(event.origin!==ADMIN_ORIGIN)return;const data=event.data||{};if(data.type==="611-layout-preview"){apply(data.layout||{});setEditing(data.select!==false)}});
 fetch("layout.json",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(d=>{if(d)apply(d)}).catch(()=>{}).finally(()=>window.__611MarkReady?.("layout"));
})();
