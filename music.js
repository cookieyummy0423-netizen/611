/* 611 optional ambient soundtrack — no autoplay */
(()=> {
 const source="music/611-ambient.mp3";
 fetch(source,{method:"HEAD",cache:"no-store"}).then(response=>{
  if(!response.ok)return;
  const audio=new Audio(source);audio.loop=true;audio.preload="none";audio.volume=.34;
  const button=document.createElement("button");button.type="button";button.className="site-music-toggle";button.setAttribute("aria-label","播放背景音樂");button.setAttribute("aria-pressed","false");button.title="背景音樂";
  const icon=(on)=>on?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h4l5 4V6l-5 4H4z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M16 9a5 5 0 0 1 0 6M18.5 6.5a8.5 8.5 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>':'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h4l5 4V6l-5 4H4z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="m17 9 5 6m0-6-5 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
  const update=playing=>{button.innerHTML=icon(playing);button.classList.toggle("is-playing",playing);button.setAttribute("aria-pressed",String(playing));button.setAttribute("aria-label",playing?"關閉背景音樂":"播放背景音樂")};
  update(false);button.addEventListener("click",async()=>{if(audio.paused){try{await audio.play();update(true)}catch(error){button.title="音樂載入失敗，請稍後重試"}}else{audio.pause();update(false)}});
  audio.addEventListener("ended",()=>update(false));audio.addEventListener("pause",()=>update(false));audio.addEventListener("play",()=>update(true));
  document.body.append(button);
 }).catch(()=>{});
})();
