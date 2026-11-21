/* 611 visual design settings — desktop and mobile controls */
(async()=>{
 try{
  const r=await fetch("design.json",{cache:"no-cache"});if(!r.ok)return;
  const d=await r.json(),root=document.documentElement,base=d.responsive||{},desktop=base.desktop||d,mobile=base.mobile||{};
  const set=(k,v)=>root.style.setProperty(k,String(v));
  const ambient=d.ambient||{},hex=String(ambient.color||"#8c9cff"),rgb=hex.match(/^#([0-9a-f]{6})$/i);
  const color=rgb?"rgba("+parseInt(rgb[1].slice(0,2),16)+","+parseInt(rgb[1].slice(2,4),16)+","+parseInt(rgb[1].slice(4,6),16)+","+Math.max(0,Math.min(.8,Number(ambient.opacity??.3)))+")":"rgba(140,156,255,.3)";
  set("--ambient-color",color);set("--ambient-spread",Math.max(0,Math.min(180,Number(ambient.spread??70)))+"px");set("--ambient-feather",Math.max(20,Math.min(100,Number(ambient.feather??70)))+"%");root.classList.toggle("ambient-light-off",ambient.enabled===false);
  set("--site-bg",d.background||"#080808");set("--site-text",d.text||"#f1f0ec");set("--site-accent",d.accent||"#ffffff");
  set("--site-columns",Math.max(1,Math.min(4,Number(desktop.columns??d.columns)||4)));
  set("--site-mobile-columns",Math.max(1,Math.min(2,Number(mobile.columns??d.mobileColumns)||2)));
  set("--site-gap",(Number(desktop.gap??d.gap)||20)+"px");set("--site-ratio",desktop.ratio==="original"?"auto":(desktop.ratio||d.ratio||"4 / 3"));
  set("--site-section-space",(Number(desktop.sectionSpace??d.sectionSpace)||76)+"px");
  set("--site-mobile-gap",(Number(mobile.gap)||12)+"px");set("--site-mobile-ratio",mobile.ratio==="original"?"auto":(mobile.ratio||"4 / 3"));
  set("--site-mobile-section-space",(Number(mobile.sectionSpace)||60)+"px");
  const type=d.typography||{},groups=["heroTitle","pageTitle","sectionTitle","headingAside","filter","workCategory","workTitle","workDescription","workIndex","eyebrow","statementTitle","statementFooter","body","navigation","contactTitle","footer"];
  /* About typography is owned by the About editor, not global design settings. */
  if(!document.querySelector("#about-content"))groups.forEach(key=>{
   const desk=Number(type.desktop?.[key]),mob=Number(type.mobile?.[key]),cssKey=key.replace(/[A-Z]/g,m=>"-"+m.toLowerCase());
   if(desk>0)set("--font-"+cssKey,desk+"px");
   if(mob>0)set("--font-mobile-"+cssKey,mob+"px");
  });
 }catch(e){console.warn("611 design settings:",e)}finally{window.__611MarkReady?.("design")}
})();