/* 611 visual design settings — desktop and mobile controls */
(async()=>{
 try{
  const r=await fetch("design.json",{cache:"no-store"});if(!r.ok)return;
  const d=await r.json(),root=document.documentElement,base=d.responsive||{},desktop=base.desktop||d,mobile=base.mobile||{};
  const set=(k,v)=>root.style.setProperty(k,String(v));
  set("--site-bg",d.background||"#080808");set("--site-text",d.text||"#f1f0ec");set("--site-accent",d.accent||"#ffffff");
  set("--site-columns",Math.max(1,Math.min(4,Number(desktop.columns??d.columns)||4)));
  set("--site-mobile-columns",Math.max(1,Math.min(2,Number(mobile.columns??d.mobileColumns)||2)));
  set("--site-gap",(Number(desktop.gap??d.gap)||20)+"px");set("--site-ratio",desktop.ratio==="original"?"auto":(desktop.ratio||d.ratio||"4 / 3"));
  set("--site-section-space",(Number(desktop.sectionSpace??d.sectionSpace)||76)+"px");
  set("--site-mobile-gap",(Number(mobile.gap)||12)+"px");set("--site-mobile-ratio",mobile.ratio==="original"?"auto":(mobile.ratio||"4 / 3"));
  set("--site-mobile-section-space",(Number(mobile.sectionSpace)||60)+"px");
  const type=d.typography||{},groups=["heroTitle","sectionTitle","workTitle","workMeta","eyebrow","statementTitle","body","navigation"];
  groups.forEach(key=>{
   const desk=Number(type.desktop?.[key]),mob=Number(type.mobile?.[key]),cssKey=key.replace(/[A-Z]/g,m=>"-"+m.toLowerCase());
   if(desk>0)set("--font-"+cssKey,desk+"px");
   if(mob>0)set("--font-mobile-"+cssKey,mob+"px");
  });
 }catch(e){console.warn("611 design settings:",e)}
})();