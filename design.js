/* 611 visual design settings — desktop and mobile controls */
(async()=>{
 try{
  const r=await fetch("design.json",{cache:"no-cache"});if(!r.ok)return;
  const d=await r.json(),root=document.documentElement,base=d.responsive||{},desktop=base.desktop||d,mobile=base.mobile||{};
  const set=(k,v)=>root.style.setProperty(k,String(v));
  const fontFamily=d.fontFamily==="serif"?"serif":"sans";
  root.dataset["611FontFamily"]=fontFamily;
  if(fontFamily==="serif"){
   set("--sans",'"Cormorant Garamond","Noto Serif TC","Songti TC",serif');
   if(!document.querySelector('link[data-611-serif-font]')){const link=document.createElement("link");link.rel="stylesheet";link.href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Noto+Serif+TC:wght@400;500;600;700;900&display=swap";link.dataset["611SerifFont"]="1";document.head.append(link)}
  }else{
   set("--sans",'"Manrope","Noto Sans TC",sans-serif');
  }
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

/* 611 Motion Studio — scroll-triggered text/UI motion, never artwork media */
(()=> {
 const defaults={
  headings:{enabled:true,effect:"fade-up",duration:750,delay:0,distance:28,stretchX:1,stretchY:1,easing:"smooth"},
  body:{enabled:true,effect:"fade-up",duration:850,delay:60,distance:20,stretchX:1,stretchY:1,easing:"smooth"},
  navigation:{enabled:true,effect:"fade",duration:500,delay:0,distance:16,stretchX:1,stretchY:1,easing:"smooth"},
  buttons:{enabled:true,effect:"zoom",duration:500,delay:0,distance:12,stretchX:1,stretchY:1,easing:"smooth"},
  quotes:{enabled:true,effect:"stretch",duration:900,delay:80,distance:20,stretchX:.92,stretchY:1.04,easing:"smooth"}
 };
 const selectors={
  headings:"h1,h2,h3,.section-heading,.collection-section-heading",
  body:"p,.info-copy,.statement,.collection-concept-copy,.collection-process-item,.collection-fact",
  navigation:".topbar a,.footer a,.page-back",
  buttons:"button,.btn,.social-links a",
  quotes:"blockquote,.statement-quote,.collection-quote"
 };
 const easing={smooth:"cubic-bezier(.22,1,.36,1)",ease:"ease", "ease-in":"ease-in","ease-out":"ease-out","ease-in-out":"ease-in-out",linear:"linear"};
 const style=document.createElement("style");
 style.textContent=".motion-611-item{will-change:auto}.motion-611-preview{animation:611MotionPreview 1.1s cubic-bezier(.22,1,.36,1)}@keyframes 611MotionPreview{0%{opacity:.25;transform:translateY(20px) scale(.96)}65%{opacity:1;transform:translateY(-3px) scale(1.01)}100%{opacity:1;transform:none}}";
 document.head.append(style);
 const reduced=false;
 let config=defaults,observer=null;
 const excluded=".work-card,.collection-card,.collection-work-card,.work-grid,.collection-card-grid,.collection-selected-section,.collection-gallery-section,.collection-media,.work-image,.work-detail-media,img,video,audio,canvas,svg";
 function transform(d,enter){const effect=d.effect||"fade-up",distance=Math.max(0,Number(d.distance)||0),sx=Number(d.stretchX)||1,sy=Number(d.stretchY)||1;if(enter)return "translate3d(0,0,0) scale(1,1)";if(effect==="fade-up")return "translate3d(0,"+distance+"px,0) scale(1,1)";if(effect==="fade-down")return "translate3d(0,-"+distance+"px,0) scale(1,1)";if(effect==="slide-left")return "translate3d("+distance+"px,0,0) scale(1,1)";if(effect==="slide-right")return "translate3d(-"+distance+"px,0,0) scale(1,1)";if(effect==="zoom")return "translate3d(0,0,0) scale(.88,.88)";if(effect==="stretch")return "translate3d(0,"+Math.round(distance*.25)+"px,0) scale("+sx+","+sy+")";return "translate3d(0,0,0) scale(1,1)"}
 function setState(el,d,visible){el.style.opacity=visible?"1":"0";el.style.transform=transform(d,visible);if(visible)el.dataset.motionVisible="1";else delete el.dataset.motionVisible}
 function prepare(el,key){if(el.dataset.motionReady)return;const d=config[key]||defaults[key];if(!d||d.enabled===false)return;el.dataset.motionReady="1";el.dataset.motionGroup=key;el.classList.add("motion-611-item");el.style.transitionProperty="opacity, transform";el.style.transitionDuration=Math.max(100,Number(d.duration)||700)+"ms";el.style.transitionTimingFunction=easing[d.easing]||easing.smooth;el.style.transitionDelay=Math.max(0,Number(d.delay)||0)+"ms";setState(el,d,false);observer?.observe(el)}
 function scan(root=document){for(const [key,selector] of Object.entries(selectors)){let nodes=[];try{if(root.matches?.(selector))nodes.push(root);nodes.push(...root.querySelectorAll(selector))}catch{}for(const el of nodes){if(el.closest(excluded))continue;prepare(el,key)}}}
 function init(){if(reduced)return;observer=new IntersectionObserver(entries=>{for(const entry of entries){const el=entry.target,key=el.dataset.motionGroup,d=config[key]||defaults[key];if(!d)continue;setState(el,d,entry.isIntersecting);}}, {threshold:.12,rootMargin:"0px 0px -5% 0px"});scan();new MutationObserver(records=>{for(const rec of records)for(const node of rec.addedNodes)if(node.nodeType===1)scan(node)}).observe(document.body,{childList:true,subtree:true})}
 fetch("layout.json",{cache:"no-cache"}).then(r=>r.ok?r.json():null).then(d=>{config={...defaults,...(d?.motion||{})};if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init()}).catch(()=>{config=defaults;if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init()});
})();
