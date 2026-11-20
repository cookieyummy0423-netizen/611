/* 611 homepage sections and copy — public read-only settings */
(async()=>{
  const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  try{
    const r=await fetch("homepage.json",{cache:"no-store"});
    if(!r.ok)return;
    const d=await r.json(),main=document.querySelector("main");
    if(!main)return;
    const nodes={works:document.querySelector("#works"),statement:document.querySelector("#statement")};
    (d.sections||[]).slice().sort((a,b)=>a.order-b.order).forEach(item=>{
      const node=nodes[item.id];if(!node)return;
      node.hidden=item.visible===false;
      main.appendChild(node);
    });
    const c=d.copy||{};
    const eyebrow=document.querySelector("#works .section-heading .eyebrow");
    if(eyebrow&&c.worksEyebrow)eyebrow.textContent=c.worksEyebrow;
    const title=document.querySelector("#works .section-heading h2");
    if(title&&(c.worksTitle1||c.worksTitle2)){
      title.innerHTML=esc(c.worksTitle1||"THE")+"<br><span>"+esc(c.worksTitle2||"ARCHIVE.")+"</span>";
    }
    const aside=document.querySelector("#works .heading-aside");
    if(aside&&c.worksAside!==undefined){aside.textContent=c.worksAside;aside.style.whiteSpace="pre-line";}
    const se=document.querySelector("#statement .eyebrow");
    if(se&&c.statementEyebrow)se.textContent=c.statementEyebrow;
    const st=document.querySelector("#statement h2");
    if(st&&c.statementTitle!==undefined){st.textContent=c.statementTitle;st.style.whiteSpace="pre-line";}
    const foot=document.querySelector("#statement .statement-foot");
    if(foot){
      const spans=foot.querySelectorAll("span");
      if(spans[0]&&c.statementFootLeft!==undefined)spans[0].textContent=c.statementFootLeft;
      if(spans[1]&&c.statementFootRight!==undefined)spans[1].textContent=c.statementFootRight;
    }
  }catch(e){console.warn("611 homepage settings:",e);}
})();
