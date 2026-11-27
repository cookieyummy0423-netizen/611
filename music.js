/* 611 persistent ambient audio + same-document page navigation.
   Internal HTML navigation swaps page content without destroying the Audio instance. */
(()=> {
 const STATE_KEY="611-ambient-state-v4";
 const ROUTE_STYLE="data-611-route-style";
 const button=document.createElement("button");
 button.type="button";
 button.className="site-music-toggle";
 button.title="播放背景音樂";
 button.setAttribute("aria-label","播放背景音樂");
 const audio=new Audio(new URL("music/611-ambient.mp3",location.origin).href);
 audio.loop=true;
 audio.preload="auto";
 let playing=false;
 let routing=false;
 let channel=null;
 const icon=on=>on
  ?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z" fill="currentColor"/></svg>'
  :'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.8v14.4L19 12 7 4.8z" fill="currentColor"/></svg>';
 const readState=()=>{try{return JSON.parse(localStorage.getItem(STATE_KEY)||"{}")}catch(e){return {}}};
 const saveState=()=>{try{localStorage.setItem(STATE_KEY,JSON.stringify({time:audio.currentTime||0,volume:audio.volume,muted:audio.muted,playing:!audio.paused}))}catch(e){}};
 const render=()=>{
  playing=!audio.paused;
  button.innerHTML=icon(playing);
  button.classList.toggle("is-playing",playing);
  button.setAttribute("aria-pressed",String(playing));
  button.setAttribute("aria-label",playing?"暫停背景音樂":"播放背景音樂");
  button.title=playing?"暫停背景音樂":"播放背景音樂";
  try{if(navigator.mediaSession)navigator.mediaSession.playbackState=playing?"playing":"paused"}catch(e){}
 };
 const saved=readState();
 audio.volume=typeof saved.volume==="number"?Math.max(0,Math.min(1,saved.volume)):.34;
 audio.muted=!!saved.muted;
 audio.addEventListener("loadedmetadata",()=>{if(Number.isFinite(saved.time)&&saved.time>0&&saved.time<audio.duration)audio.currentTime=saved.time});
 ["play","pause","volumechange","ended"].forEach(type=>audio.addEventListener(type,()=>{render();saveState()}));
 audio.addEventListener("timeupdate",()=>{if(Math.floor(audio.currentTime)%4===0)saveState()});
 button.addEventListener("click",async()=>{
  if(audio.paused){try{await audio.play()}catch(e){button.title="無法播放，請確認音樂檔案存在後再試一次"}}
  else audio.pause();
  render();
 });
 try{
  if("mediaSession" in navigator){
   navigator.mediaSession.metadata=new MediaMetadata({title:"611 Ambient",artist:"611 Visual Archive",album:"A quiet place between pages"});
   navigator.mediaSession.setActionHandler("play",()=>audio.play().catch(()=>{}));
   navigator.mediaSession.setActionHandler("pause",()=>audio.pause());
   navigator.mediaSession.setActionHandler("seekbackward",()=>{audio.currentTime=Math.max(0,audio.currentTime-10)});
   navigator.mediaSession.setActionHandler("seekforward",()=>{audio.currentTime=Math.min(audio.duration||Infinity,audio.currentTime+10)});
  }
 }catch(e){}
 const trackPageView=()=>{
  try{
   if(location.hostname!=="611-portfolio.pages.dev"||new URLSearchParams(location.search).has("layout-editor")||new URLSearchParams(location.search).has("about-editor"))return;
   let visitor=localStorage.getItem("611-analytics-visitor");
   if(!visitor){visitor=crypto.randomUUID();localStorage.setItem("611-analytics-visitor",visitor)}
   const payload=JSON.stringify({visitor,path:location.pathname});
   const endpoint="https://611-portfolio-admin.cookieyummy0423.workers.dev/track";
   if(navigator.sendBeacon)navigator.sendBeacon(endpoint,new Blob([payload],{type:"text/plain;charset=UTF-8"}));
   else fetch(endpoint,{method:"POST",mode:"cors",keepalive:true,headers:{"Content-Type":"text/plain;charset=UTF-8"},body:payload}).catch(()=>{});
  }catch(e){}
 };
 const runPageScripts=async(scripts,targetUrl)=>{
  for(const old of scripts){
   const src=old.getAttribute("src")||"";
   if(src&&/music\.js(?:\?|$)/i.test(src))continue;
   const type=(old.getAttribute("type")||"").toLowerCase();
   if(type&&type!=="text/javascript"&&type!=="application/javascript")continue;
   if(src){
    const scriptUrl=new URL(src,targetUrl);
    if(scriptUrl.origin!==location.origin)continue;
    if(/(?:^|\/)design\.js(?:\?|$)|(?:^|\/)layout\.js(?:\?|$)/i.test(scriptUrl.pathname+scriptUrl.search))continue;
    const response=await fetch(scriptUrl.href,{cache:"no-cache"});
    if(!response.ok)throw new Error("無法載入頁面程式："+scriptUrl.pathname);
    const code=await response.text();
    new Function(code).call(window);
   }else if(old.textContent.trim()){
    new Function(old.textContent).call(window);
   }
  }
 };
 const navigate=async(url,addHistory=true)=>{
  if(routing)return;
  const target=new URL(url,location.href);
  if(target.origin!==location.origin)return;
  routing=true;
  try{
   const response=await fetch(target.href,{headers:{"X-611-Navigation":"1"},cache:"no-cache"});
   if(!response.ok)throw new Error("頁面讀取失敗");
   const html=await response.text();
   const nextDoc=new DOMParser().parseFromString(html,"text/html");
   if(!nextDoc.body||!nextDoc.querySelector("main"))throw new Error("頁面結構不相容");
   const nextScripts=Array.from(nextDoc.body.querySelectorAll("script"));
   if(addHistory)history.pushState({url:target.href},"",target.href);
   document.querySelectorAll("style["+ROUTE_STYLE+"]").forEach(node=>node.remove());
   nextDoc.head.querySelectorAll("style").forEach(node=>{
    const style=document.createElement("style");style.setAttribute(ROUTE_STYLE,"");style.textContent=node.textContent;document.head.append(style);
   });
   document.title=nextDoc.title||document.title;
   const musicButton=button.isConnected?button:null;
   if(musicButton)musicButton.remove();
   document.body.className=nextDoc.body.className||"";
   for(const attr of Array.from(document.body.attributes)){if(attr.name!=="class"&&!nextDoc.body.hasAttribute(attr.name))document.body.removeAttribute(attr.name)}
   for(const attr of Array.from(nextDoc.body.attributes)){document.body.setAttribute(attr.name,attr.value)}
   document.body.innerHTML=nextDoc.body.innerHTML;
   if(musicButton)document.body.append(musicButton);else document.body.append(button);
   await runPageScripts(nextScripts,target);
   window.dispatchEvent(new Event("611-layout-refresh"));
   document.documentElement.classList.remove("site-booting");
   trackPageView();
   if(target.hash){
    const id=decodeURIComponent(target.hash.slice(1));
    requestAnimationFrame(()=>{const node=document.getElementById(id);if(node)node.scrollIntoView();else window.scrollTo(0,0)});
   }else window.scrollTo(0,0);
  }catch(error){
   console.warn("611 navigation fallback:",error);
   location.href=target.href;
  }finally{routing=false}
 };
 const onClick=event=>{
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const link=event.target.closest?.("a[href]");
  if(!link||link.target||link.hasAttribute("download")||link.rel==="external")return;
  const url=new URL(link.href,location.href);
  if(url.origin!==location.origin||!url.pathname.toLowerCase().endsWith(".html"))return;
  if(url.pathname===location.pathname&&url.search===location.search)return;
  if(new URLSearchParams(location.search).has("layout-editor")||new URLSearchParams(location.search).has("about-editor"))return;
  event.preventDefault();
  navigate(url.href,true);
 };
 document.addEventListener("click",onClick,true);
 window.addEventListener("popstate",()=>navigate(location.href,false));
 history.scrollRestoration="manual";
 window.__611Music={button,audio,install(){if(!button.isConnected)document.body.append(button)},navigate,get playing(){return !audio.paused}};
 if(document.body)document.body.append(button);else document.addEventListener("DOMContentLoaded",()=>document.body.append(button),{once:true});
 render();
 trackPageView();
 window.addEventListener("pagehide",saveState);
})();