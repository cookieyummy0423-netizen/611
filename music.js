/* 611 ambient soundtrack controller.
   Audio lives in a named mini-player window so it survives full-page navigation. */
(()=> {
 const SOURCE="music/611-ambient.mp3";
 const STATE_KEY="611-ambient-player-state-v3";
 const CHANNEL_NAME="611-ambient-player-v3";
 const button=document.createElement("button");
 button.type="button";
 button.className="site-music-toggle";
 button.title="開啟背景音樂播放器";
 button.setAttribute("aria-label","開啟背景音樂播放器");
 const icon=on=>on?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h4l5 4V6l-5 4H4z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M16 9a5 5 0 0 1 0 6M18.5 6.5a8.5 8.5 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>':'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h4l5 4V6l-5 4H4z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="m17 9 5 6m0-6-5 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
 let channel=null;
 try{channel=new BroadcastChannel(CHANNEL_NAME)}catch(e){}
 let playing=false;
 const readState=()=>{try{return JSON.parse(localStorage.getItem(STATE_KEY)||"{}")}catch(e){return {}}};
 const render=()=>{button.innerHTML=icon(playing);button.classList.toggle("is-playing",playing);button.setAttribute("aria-pressed",String(playing));button.setAttribute("aria-label",playing?"開啟背景音樂播放器（播放中）":"開啟背景音樂播放器");button.title=playing?"背景音樂播放中・開啟播放器":"開啟背景音樂播放器"};
 const applyState=data=>{if(data&&typeof data.playing==="boolean"){playing=data.playing;render()}};
 const initial=readState();applyState(initial);
 if(channel)channel.addEventListener("message",event=>{if(event.data?.type==="state")applyState(event.data.state)});
 window.addEventListener("storage",event=>{if(event.key===STATE_KEY)applyState(readState())});
 button.addEventListener("click",()=>{
   const player=window.open("music-player.html","611AmbientPlayer","popup=yes,width=390,height=560,resizable=yes,scrollbars=no");
   if(player){try{player.focus()}catch(e){}button.title=playing?"播放器已開啟，音樂持續播放":"請在播放器視窗按下播放"; }
   else{button.title="彈出視窗遭到封鎖，請允許此網站開啟彈出視窗後再試一次";}
 });
 const install=()=>{if(!button.isConnected)document.body.append(button);render()};
 window.__611Music={button,install,get playing(){return playing}};
 if(document.body)install();else document.addEventListener("DOMContentLoaded",install,{once:true});
})();

/* 611 private traffic counter: one local visitor ID, page views only. */
(()=>{try{if(location.hostname!=="611-portfolio.pages.dev"||new URLSearchParams(location.search).has("layout-editor")||new URLSearchParams(location.search).has("about-editor"))return;let visitor=localStorage.getItem("611-analytics-visitor");if(!visitor){visitor=crypto.randomUUID();localStorage.setItem("611-analytics-visitor",visitor)}const payload=JSON.stringify({visitor,path:location.pathname});const endpoint="https://611-portfolio-admin.cookieyummy0423.workers.dev/track";if(navigator.sendBeacon)navigator.sendBeacon(endpoint,new Blob([payload],{type:"text/plain;charset=UTF-8"}));else fetch(endpoint,{method:"POST",mode:"cors",keepalive:true,headers:{"Content-Type":"text/plain;charset=UTF-8"},body:payload}).catch(()=>{})}catch(e){}})();
