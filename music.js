/* 611 ambient soundtrack: resume across same-origin page navigations. */
(()=> {
 const KEY="611-ambient-state-v2",SOURCE="music/611-ambient.mp3";
 const old=window.__611Music;
 if(old){old.install();return;}
 const state={playing:false,time:0,muted:false};
 try{Object.assign(state,JSON.parse(sessionStorage.getItem(KEY)||"{}"))}catch(e){}
 const audio=new Audio(SOURCE);audio.loop=true;audio.preload="auto";audio.volume=.34;
 const button=document.createElement("button");button.type="button";button.className="site-music-toggle";button.title="背景音樂";
 const icon=on=>on?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h4l5 4V6l-5 4H4z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M16 9a5 5 0 0 1 0 6M18.5 6.5a8.5 8.5 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>':'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h4l5 4V6l-5 4H4z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="m17 9 5 6m0-6-5 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
 const save=()=>{state.time=audio.currentTime||state.time;try{sessionStorage.setItem(KEY,JSON.stringify(state))}catch(e){}};
 const update=()=>{state.playing=!audio.paused;button.innerHTML=icon(state.playing);button.classList.toggle("is-playing",state.playing);button.setAttribute("aria-pressed",String(state.playing));button.setAttribute("aria-label",state.playing?"關閉背景音樂":"播放背景音樂")};
 const install=()=>{if(!button.isConnected)document.body.append(button);update()};
 button.addEventListener("click",async()=>{if(audio.paused){try{if(state.time>0&&audio.currentTime===0)audio.currentTime=state.time;await audio.play();state.playing=true}catch(e){button.title="瀏覽器阻止自動播放，請再按一次"} }else{audio.pause();state.playing=false}save();update()});
 audio.addEventListener("timeupdate",()=>{state.time=audio.currentTime;if(Math.floor(state.time)%3===0)save()});
 audio.addEventListener("play",()=>{state.playing=true;save();update()});
 audio.addEventListener("pause",()=>{state.playing=false;save();update()});
 window.addEventListener("pagehide",save);
 window.addEventListener("pageshow",()=>{if(state.playing&&audio.paused){audio.currentTime=state.time||0;audio.play().then(update).catch(()=>{button.title="點擊音樂圖示繼續播放"})}});
 const oldInstall=install;
 window.__611Music={audio,button,install:oldInstall,state};
 install();
 if(state.playing){audio.addEventListener("canplay",()=>{if(state.playing&&audio.paused){audio.currentTime=state.time||0;audio.play().then(update).catch(()=>{button.title="點擊音樂圖示繼續播放"})}},{once:true});}
})();
