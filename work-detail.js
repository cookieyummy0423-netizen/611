/* 611 independent work detail page */
(()=> {
 const root=document.querySelector("#work-detail-root");
 const params=new URLSearchParams(location.search);
 const id=params.get("id"),slug=params.get("slug");
 const base="https://611-portfolio.pages.dev/";
 const categoryPages={illustration:"illustration.html",character:"character.html",scene:"scene.html",motion:"motion.html"};
 const node=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el};
 const mediaUrl=path=>path?(path.startsWith("http")?path:base+path):"";
 const addMedia=(parent,path,title)=>{const figure=node("figure");const src=mediaUrl(path);if(/\.mp4(?:$|\?)/i.test(path)){const video=node("video");video.controls=true;video.preload="none";video.playsInline=true;const source=node("source");source.src=src;source.type="video/mp4";video.append(source);figure.append(video)}else{const img=node("img");img.src=src;img.alt=title||"";img.loading="lazy";img.decoding="async";figure.append(img)}parent.append(figure)};
 const fail=message=>{root.replaceChildren(node("div","work-detail-empty",message))};
 fetch("works.json",{cache:"no-cache"}).then(r=>{if(!r.ok)throw Error("作品資料讀取失敗");return r.json()}).then(data=>{
  const works=Array.isArray(data.works)?data.works:[];
  const work=works.find(w=>(id&&w.id===id)||(slug&&w.detailPage?.slug===slug));
  if(!work||!work.detailPage?.enabled){fail("找不到這件作品，或作品詳情頁尚未啟用。");return}
  const detail=work.detailPage;
  document.title=(work.title||"作品詳情")+"｜611";
  const description=(detail.concept||work.description||"611 作品詳情").slice(0,150);const meta=document.querySelector('meta[name="description"]');if(meta)meta.content=description;const ogTitle=document.querySelector('meta[property="og:title"]');if(ogTitle)ogTitle.content=work.title+"｜611";const ogDescription=document.querySelector('meta[property="og:description"]');if(ogDescription)ogDescription.content=description;const ogImage=document.querySelector('meta[property="og:image"]');if(ogImage)ogImage.content=mediaUrl(work.media);let canonical=document.querySelector('link[rel="canonical"]');if(canonical)canonical.href=location.href.split("#")[0];const ld=document.createElement("script");ld.type="application/ld+json";ld.textContent=JSON.stringify({"@context":"https://schema.org","@type":"VisualArtwork","name":work.title,"description":description,"image":mediaUrl(work.media),"artform":work.typeLabel||work.category,"dateCreated":detail.year?String(detail.year):undefined,"creator":{"@type":"Person","name":"611"}});document.head.append(ld);
  root.replaceChildren();
  const top=node("div","work-detail-top");const kicker=node("p","work-detail-kicker",work.typeLabel||work.category.toUpperCase());const metaLine=node("p","work-detail-meta",[detail.year,detail.tools].filter(Boolean).join(" / "));top.append(kicker,metaLine);root.append(top);
  root.append(node("h1","work-detail-title",work.title||"Untitled"));
  if(work.description)root.append(node("p","work-detail-description",work.description));
  const hero=node("div","work-detail-hero");addMedia(hero,work.media,work.title);root.append(hero);
  const columns=node("div","work-detail-columns");
  const concept=node("section","work-detail-section");concept.append(node("h2","","創作理念"),node("p","",detail.concept||"尚未填寫創作理念。"));columns.append(concept);
  const facts=node("aside","work-detail-facts");
  const fact=(label,value)=>{if(!value)return;const row=node("div","work-detail-fact");row.append(node("strong","",label),node("span","",value));facts.append(row)};
  fact("YEAR",detail.year?String(detail.year):"");fact("TOOLS",detail.tools||"");fact("CATEGORY",work.typeLabel||work.category);columns.append(facts);root.append(columns);
  if(Array.isArray(detail.gallery)&&detail.gallery.length){root.append(node("h2","","作品圖集"));const gallery=node("div","work-detail-gallery");detail.gallery.forEach((path,i)=>addMedia(gallery,path,work.title+" 圖集 "+(i+1)));root.append(gallery)}
  if(Array.isArray(detail.process)&&detail.process.length){root.append(node("h2","","製作過程"));const process=node("div","work-detail-process");detail.process.forEach((step,i)=>{const article=node("article");article.append(node("span","work-detail-process-index","STEP / "+String(i+1).padStart(2,"0")),node("p","",step));process.append(article)});root.append(process)}
  const back=node("a","work-detail-back","← 返回作品分類");back.href=categoryPages[work.category]||"index.html#works";root.append(back);
 }).catch(e=>fail(e.message||"作品頁載入失敗。")).finally(()=>window.__611MarkReady?.("work"));
})();