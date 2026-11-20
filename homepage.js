/* 611 homepage sections and copy — desktop/mobile draft-aware settings */
(()=>{
 const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 let activeData=null,hasDraftPreview=false;
 const apply=d=>{
  const main=document.querySelector("main");if(!main||!d)return;
  activeData=d;
  const isMobile=window.matchMedia("(max-width: 760px)").matches;
  const variant=isMobile&&d.mobile?d.mobile:d;
  const nodes={works:document.querySelector("#works"),statement:document.querySelector("#statement")};
  (variant.sections||d.sections||[]).slice().sort((a,b)=>a.order-b.order).forEach(item=>{
   const node=nodes[item.id];if(!node)return;node.hidden=item.visible===false;main.appendChild(node);
  });
  const c={...(d.copy||{}),...(variant.copy||{})};
  const eyebrow=document.querySelector("#works .section-heading .eyebrow");
  if(eyebrow&&c.worksEyebrow!==undefined)eyebrow.textContent=c.worksEyebrow;
  const title=document.querySelector("#works .section-heading h2");
  if(title&&(c.worksTitle1!==undefined||c.worksTitle2!==undefined))title.innerHTML=esc(c.worksTitle1??"THE")+"<br><span>"+esc(c.worksTitle2??"ARCHIVE.")+"</span>";
  const aside=document.querySelector("#works .heading-aside");
  if(aside&&c.worksAside!==undefined){aside.textContent=c.worksAside;aside.style.whiteSpace="pre-line";}
  const se=document.querySelector("#statement .eyebrow");if(se&&c.statementEyebrow!==undefined)se.textContent=c.statementEyebrow;
  const st=document.querySelector("#statement h2");if(st&&c.statementTitle!==undefined){st.textContent=c.statementTitle;st.style.whiteSpace="pre-line";}
  const foot=document.querySelector("#statement .statement-foot");
  if(foot){const spans=foot.querySelectorAll("span");if(spans[0]&&c.statementFootLeft!==undefined)spans[0].textContent=c.statementFootLeft;if(spans[1]&&c.statementFootRight!==undefined)spans[1].textContent=c.statementFootRight;}
 };
 window.addEventListener("message",event=>{
  if(event.origin!=="https://611-portfolio-admin.cookieyummy0423.workers.dev")return;
  if(event.data?.type==="611-homepage-preview"){hasDraftPreview=true;apply(event.data.homepage)}
 });
 let wasMobile=window.matchMedia("(max-width: 760px)").matches;
 window.addEventListener("resize",()=>{const now=window.matchMedia("(max-width: 760px)").matches;if(now!==wasMobile){wasMobile=now;if(activeData)apply(activeData)}});
 fetch("homepage.json",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(d=>{if(d&&!hasDraftPreview)apply(d)}).catch(e=>console.warn("611 homepage settings:",e)).finally(()=>window.__611MarkReady?.("homepage"));
})();