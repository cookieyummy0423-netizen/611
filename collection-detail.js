(()=> {
  const root = document.querySelector("#collection-detail-root");
  const params = new URLSearchParams(location.search);
  const slug = params.get("slug");
  const base = "https://611-portfolio.pages.dev/";
  const node = (tag, cls, txt) => {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (txt !== undefined) el.textContent = txt;
    return el;
  };
  const asset = path => String(path || "").startsWith("http") ? path : base + String(path || "");
  const isVideo = path => /\.mp4($|\?)/i.test(String(path || ""));
  const visual = (path, alt = "") => {
    const wrap = node("div", "collection-media");
    if (isVideo(path)) {
      const video = node("video");
      video.src = asset(path);
      video.controls = true;
      video.preload = "none";
      video.playsInline = true;
      wrap.append(video);
    } else {
      const img = node("img");
      img.src = asset(path);
      img.alt = alt;
      img.loading = "lazy";
      img.decoding = "async";
      wrap.append(img);
    }
    return wrap;
  };
  const sectionHeading = (kicker, title) => {
    const heading = node("div", "collection-section-heading");
    heading.append(node("p", "work-detail-kicker", kicker), node("h2", "", title));
    return heading;
  };
  const renderLegacySections = (c) => {
    if (c.concept) {
      const section = node("section", "collection-concept");
      section.append(sectionHeading("01 / PROJECT STATEMENT", "創作理念"), node("p", "collection-concept-copy", c.concept));
      root.append(section);
    }
    if (Array.isArray(c.process) && c.process.length) {
      const section = node("section", "collection-process");
      section.append(sectionHeading("02 / DEVELOPMENT", "製作過程"));
      const steps = node("ol", "collection-process-list");
      c.process.forEach((text, i) => {
        const item = node("li", "collection-process-item");
        item.append(node("span", "collection-process-number", String(i + 1).padStart(2, "0")), node("p", "", text));
        steps.append(item);
      });
      section.append(steps);
      root.append(section);
    }
    if (Array.isArray(c.gallery) && c.gallery.length) {
      const section = node("section", "collection-gallery-section");
      section.append(sectionHeading("03 / VISUAL NOTES", "補充圖集"));
      const grid = node("div", "collection-gallery-grid");
      c.gallery.forEach((path, i) => {
        const figure = node("figure", "collection-gallery-item");
        figure.append(visual(path, "補充圖集 " + (i + 1)), node("figcaption", "", String(i + 1).padStart(2, "0")));
        grid.append(figure);
      });
      section.append(grid);
      root.append(section);
    }
  };
  const renderProjectSections = sections => {
    sections.forEach((sectionData, index) => {
      const number = String(index + 1).padStart(2, "0");
      const title = sectionData.title || ({text:"企劃說明",quote:"核心主張",image:"視覺呈現",gallery:"補充圖集"}[sectionData.type] || "企劃章節");
      if (sectionData.type === "quote") {
        const section = node("section", "collection-custom-quote");
        section.append(sectionHeading(number + " / PROJECT STATEMENT", title));
        section.append(node("blockquote", "collection-project-quote", sectionData.body || ""));
        if (sectionData.caption) section.append(node("p", "collection-quote-caption", sectionData.caption));
        root.append(section);
        return;
      }
      if (sectionData.type === "image" || sectionData.type === "gallery") {
        const section = node("section", "collection-gallery-section");
        section.append(sectionHeading(number + (sectionData.type === "image" ? " / VISUAL" : " / GALLERY"), title));
        const grid = node("div", "collection-gallery-grid");
        (sectionData.media || []).forEach((path, mediaIndex) => {
          const figure = node("figure", "collection-gallery-item");
          figure.append(visual(path, title + " " + (mediaIndex + 1)));
          if (sectionData.caption) figure.append(node("figcaption", "", sectionData.caption));
          grid.append(figure);
        });
        if (grid.childElementCount) section.append(grid);
        if (sectionData.body) section.append(node("p", "collection-concept-copy", sectionData.body));
        root.append(section);
        return;
      }
      const section = node("section", "collection-concept");
      section.append(sectionHeading(number + " / PROJECT NOTES", title));
      if (sectionData.body) section.append(node("p", "collection-concept-copy", sectionData.body));
      root.append(section);
    });
  };
  fetch("works.json", { cache: "no-cache" })
    .then(response => {
      if (!response.ok) throw Error("作品資料讀取失敗");
      return response.json();
    })
    .then(data => {
      const collection = (data.collections || []).find(item => item.slug === slug);
      if (!collection) {
        root.replaceChildren(node("p", "work-detail-empty", "找不到這個主題作品頁。"));
        return;
      }
      const allWorks = data.works || [];
      const selected = (collection.workIds || []).map(id => allWorks.find(work => work.id === id)).filter(Boolean);
      const featured = selected.find(work => work.id === collection.featuredWorkId);
      const description = collection.description || "611 主題作品集";
      const cover = featured?.media || collection.cover || selected[0]?.media || "";
      document.title = collection.title + "｜611";
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) metaDescription.content = description;
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.content = collection.title + "｜611";
      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) ogDescription.content = description;
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage && cover && !isVideo(cover)) ogImage.content = asset(cover);
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) canonical.href = location.href.split("#")[0];
      const structuredData = document.createElement("script");
      structuredData.type = "application/ld+json";
      structuredData.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: collection.title,
        description,
        image: cover && !isVideo(cover) ? asset(cover) : undefined,
        hasPart: selected.map(work => ({
          "@type": "VisualArtwork",
          name: work.title,
          image: asset(work.media),
          description: work.description || work.subtitle || ""
        }))
      });
      document.head.append(structuredData);
      root.replaceChildren();

      const intro = node("section", "collection-intro");
      const copy = node("div", "collection-intro-copy");
      copy.append(
        node("p", "work-detail-kicker", "CURATED PROJECT / 611"),
        node("h1", "collection-project-title", collection.title),
        node("p", "collection-project-description", description)
      );
      const stats = node("div", "collection-project-stats");
      stats.append(
        node("span", "collection-stat-number", String(selected.length).padStart(2, "0")),
        node("span", "collection-stat-label", "SELECTED WORKS")
      );
      intro.append(copy, stats);
      root.append(intro);

      if (cover) {
        const hero = node("section", "collection-cover-section");
        hero.append(node("p", "work-detail-kicker", "PROJECT KEY VISUAL"), visual(cover, collection.title));
        root.append(hero);
      }

      const facts = [];
      if (collection.year) facts.push(["YEAR", String(collection.year)]);
      if (collection.tools) facts.push(["TOOLS", collection.tools]);
      if (facts.length) {
        const bar = node("div", "collection-facts");
        facts.forEach(([key, value]) => {
          const item = node("div", "collection-fact");
          item.append(node("span", "collection-fact-label", key), node("strong", "", value));
          bar.append(item);
        });
        root.append(bar);
      }

      if (Array.isArray(collection.sections) && collection.sections.length) {
        renderProjectSections(collection.sections);
      } else {
        renderLegacySections(collection);
      }

      const worksSection = node("section", "collection-selected-section");
      worksSection.append(sectionHeading("04 / SELECTED WORKS", "精選作品"));
      const grid = node("div", "collection-work-grid");
      selected.forEach((work, index) => {
        const article = node("article", "collection-work-card");
        article.append(visual(work.media, work.title));
        const info = node("div", "collection-work-info");
        const cardLayout = work.cardLayout || {};
        const desktopTitleSize = Math.max(8, Math.min(48, Number(cardLayout.desktop?.titleSize) || 16));
        const mobileTitleSize = Math.max(8, Math.min(48, Number(cardLayout.mobile?.titleSize) || 15));
        info.style.setProperty("--collection-work-title-desktop", desktopTitleSize + "px");
        info.style.setProperty("--collection-work-title-mobile", mobileTitleSize + "px");
        const copy = node("div", "collection-work-copy");
        copy.append(
          node("p", "work-detail-kicker", "FIG. " + String(index + 1).padStart(2, "0") + " / " + (work.typeLabel || work.category || "WORK")),
          node("h2", "", work.title),
          node("p", "collection-work-description", work.description || work.subtitle || "")
        );
        info.append(copy);
        if (work.detailPage?.enabled) {
          const link = node("a", "work-detail-link", "VIEW FULL PROJECT ↗");
          link.href = "work.html?" + (work.detailPage.slug ? "slug=" + encodeURIComponent(work.detailPage.slug) : "id=" + encodeURIComponent(work.id));
          info.append(link);
        }
        article.append(info);
        grid.append(article);
      });
      worksSection.append(grid);
      root.append(worksSection);
      if (!selected.length) worksSection.append(node("p", "work-detail-empty", "這個主題目前尚未選取作品。"));
      const back = node("a", "collection-return", "← BACK TO ALL PROJECTS");
      back.href = "collections.html";
      root.append(back);
      window.dispatchEvent(new Event("611-layout-refresh"));
    })
    .catch(error => root.replaceChildren(node("p", "work-detail-empty", error.message)))
    .finally(() => window.__611MarkReady?.("collection"));
})();