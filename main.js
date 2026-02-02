/* Force scroll top on load/reload */
history.scrollRestoration = "manual";
window.scrollTo(0, 0);
window.addEventListener("beforeunload", () => window.scrollTo(0, 0));

document.addEventListener("DOMContentLoaded", () => {
  /* =====================================================
     CORE — GSAP / LENIS SETUP
  ===================================================== */

  gsap.registerPlugin(ScrollTrigger);
  gsap.config({ force3D: true });

  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;

  const lenis = new Lenis({
    duration: 0.5,
    smooth: true,
  });

  lenis.scrollTo(0, { immediate: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  // Rattrape la restauration tardive du navigateur (après load)
  const forceTop = () => {
    window.scrollTo(0, 0);
    lenis.scrollTo(0, { immediate: true });
  };
  window.addEventListener("load", () => {
    forceTop();
    requestAnimationFrame(forceTop);
  });

  /* =====================================================
     GLOBAL CONSTANTS
  ===================================================== */

  const FADE_DURATION = 0.3;
  const FADE_EASE = "power1.out";
  const STAGGER_DELAY = 0.025;
  const SCRUB_SMOOTH = 0.5;
  const IMG_SCALE_MIN = 0.7;

  /* =====================================================
     HELPERS
  ===================================================== */

  const qs = (s, p = document) => p.querySelector(s);
  const qsa = (s, p = document) => [...p.querySelectorAll(s)];

  const easeOutCubic = (t) => 1 - (1 - t) ** 3;

  const cubicBezier = (x1, y1, x2, y2) => {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const sampleX = (t) => ((ax * t + bx) * t + cx) * t;
    const sampleY = (t) => ((ay * t + by) * t + cy) * t;
    const derivX = (t) => (3 * ax * t + 2 * bx) * t + cx;
    return (x) => {
      let t = x;
      for (let i = 0; i < 8; i++) {
        const err = sampleX(t) - x;
        if (Math.abs(err) < 1e-6) break;
        t -= err / derivX(t);
      }
      return sampleY(t);
    };
  };

  const resolveVar = (name) =>
    getComputedStyle(document.body).getPropertyValue(name).trim();

  /* =====================================================
     GLOBAL UI — PROGRESS BAR
  ===================================================== */

  const progressBar = qs(".progress");

  if (progressBar) {
    gsap.set(progressBar, { scaleX: 0, transformOrigin: "left center" });

    gsap.to(progressBar, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.3,
        invalidateOnRefresh: true,
      },
    });
  }

  /* =====================================================
   GLOBAL UI — SCROLL INDICATOR
===================================================== */

  const scrollIndicator = qs(".scroll");

  if (scrollIndicator) {
    gsap.set(scrollIndicator, { opacity: 0, display: "none" });

    let hasScrolled = false;
    let blink = null;

    const initScrollIndicator = () => {
      gsap.set(scrollIndicator, { display: "block" });

      gsap.to(scrollIndicator, {
        opacity: 1,
        duration: 0.4,
        ease: "power1.out",
        onComplete: () => {
          blink = gsap.to(scrollIndicator, {
            opacity: 0,
            duration: 0.6,
            ease: "power1.inOut",
            repeat: -1,
            yoyo: true,
          });
        },
      });

      const onFirstScroll = () => {
        if (hasScrolled) return;
        hasScrolled = true;

        blink?.kill();

        gsap.to(scrollIndicator, {
          opacity: 0,
          duration: 0.3,
          ease: "power1.out",
          onComplete: () => {
            gsap.set(scrollIndicator, { display: "none" });
          },
        });

        lenis.off("scroll", onFirstScroll);
      };

      lenis.on("scroll", onFirstScroll);
    };

    // 👉 expose globalement pour le loader
    window.__initScrollIndicator = initScrollIndicator;
  }

  /* =====================================================
     HERO
  ===================================================== */

  const hero = qs(".hero");
  const heroInner = qs(".hero-inner", hero);

  const animateSplitText = (container, { start, end } = {}) => {
    const p = container?.querySelector("p");
    if (!p) return;

    const words = [];

    // Collecte tous les noeuds texte (préserve <br>, <em>, etc.)
    const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    textNodes.forEach((node) => {
      const frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          frag.append(part);
        } else {
          const span = document.createElement("span");
          span.textContent = part;
          span.style.cssText = "opacity:0.2;display:inline-block;will-change:opacity";
          frag.appendChild(span);
          words.push(span);
        }
      });
      node.parentNode.replaceChild(frag, node);
    });

    gsap.to(words, {
      opacity: 1,
      ease: "none",
      stagger: { each: 1 / words.length },
      scrollTrigger: {
        trigger: container,
        start,
        end,
        scrub: SCRUB_SMOOTH,
        invalidateOnRefresh: true,
      },
    });
  };

  if (heroInner) {
    animateSplitText(heroInner, {
      start: "top top",
      end: () => `+=${window.innerHeight * 2.75}`,
    });
  }

  /* =====================================================
     MAIN WRAPPER
  ===================================================== */

  const mainWrapper = qs(".main-wrapper");

  if (hero && mainWrapper) {
    gsap.to(hero, {
      opacity: 0,
      ease: "none",
      scrollTrigger: {
        trigger: mainWrapper,
        start: "top bottom",
        end: "top top",
        scrub: SCRUB_SMOOTH,
        invalidateOnRefresh: true,
      },
    });
  }

  /* =====================================================
     SELECTED
  ===================================================== */

  const selectedSection = qs(".selected");
  const selectedItems = qsa(".selected-item");

  if (selectedItems.length) {
    const first = selectedItems[0];
    const last = selectedItems[selectedItems.length - 1];

    const setupScaleItem = (item, from, to) => {
      const img = qs(".selected-img", item);
      if (!img) return;

      gsap.set(item, { height: window.innerHeight * 2 });
      gsap.set(img, { scale: from });

      gsap.to(img, {
        scale: to,
        ease: "none",
        scrollTrigger: {
          trigger: item,
          start: "top top",
          end: () => `+=${window.innerHeight}`,
          scrub: SCRUB_SMOOTH,
          invalidateOnRefresh: true,
        },
      });
    };

    setupScaleItem(first, IMG_SCALE_MIN, 1);
    if (last !== first) setupScaleItem(last, 1, IMG_SCALE_MIN);

    selectedItems.forEach((item, i) => {
      const next = selectedItems[i + 1];
      if (!next) return;

      ScrollTrigger.create({
        trigger: next,
        start: () => `top bottom-=${window.innerHeight * 0.3}`,
        invalidateOnRefresh: true,
        onEnter: () => {
          item.style.pointerEvents = "none";
          gsap.to(item, {
            opacity: 0,
            duration: FADE_DURATION,
            ease: FADE_EASE,
            overwrite: "auto",
          });
        },
        onLeaveBack: () => {
          item.style.pointerEvents = "auto";
          gsap.to(item, {
            opacity: 1,
            duration: FADE_DURATION,
            ease: FADE_EASE,
            overwrite: "auto",
          });
        },
      });
    });
  }

  /* =====================================================
     ARCHIVE
  ===================================================== */

  const archive = qs(".archive");
  const logo = qs(".logo");
  const archiveItems = qsa(".archive-item");

  if (selectedSection && archive && logo) {
    const logoImg = qs(".logo-img", logo);
    const logoAnim = qs("[logo-anim]", logo);

    if (logoImg) {
      gsap.to(logoImg, {
        scale: IMG_SCALE_MIN,
        ease: "none",
        scrollTrigger: {
          trigger: selectedSection,
          start: "bottom bottom",
          endTrigger: archive,
          end: "top top",
          scrub: SCRUB_SMOOTH,
          invalidateOnRefresh: true,
        },
      });

      logoImg.addEventListener("click", () => {
        lenis.scrollTo(0, { duration: 1, easing: easeOutCubic });
      });
    }

    if (logoAnim) {
      ScrollTrigger.create({
        trigger: selectedSection,
        start: "bottom bottom",
        onEnter: () =>
          gsap.to(logoAnim, {
            opacity: 0,
            duration: FADE_DURATION,
            ease: FADE_EASE,
          }),
        onLeaveBack: () =>
          gsap.to(logoAnim, {
            opacity: 1,
            duration: FADE_DURATION,
            ease: FADE_EASE,
          }),
      });
    }

    archiveItems.forEach((item, i) => {
      const name = qs("#archiveName", item);
      if (name)
        name.textContent = `NA_Archive_${String(i + 1).padStart(2, "0")}.jpg`;
    });

    gsap.set(archiveItems, { opacity: 0, y: -32 });

    ScrollTrigger.batch(archiveItems, {
      start: "bottom bottom",
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          duration: FADE_DURATION,
          ease: FADE_EASE,
          stagger: STAGGER_DELAY,
        }),
    });
  }

  /* =====================================================
     ARCHIVE — SLIDER
  ===================================================== */

  const slider = qs(".slider");
  const sliderItems = qsa(".slider-item");

  const sliderCounter = qs("#sliderCounter");
  const sliderNext = qs(".slider-next");
  const sliderPrev = qs(".slider-prev");
  const sliderClose = qs("#sliderClose");

  let currentIndex = 0;
  let isSliderOpen = false;

  const lockScroll = () => {
    lenis.stop();
    document.body.style.overflow = "hidden";
  };

  const unlockScroll = () => {
    lenis.start();
    document.body.style.overflow = "";
  };

  const totalStr = String(sliderItems.length).padStart(2, "0");

  const updateSliderUI = (index) => {
    if (!sliderCounter) return;
    sliderCounter.textContent = `${String(index + 1).padStart(2, "0")}/${totalStr}`;
  };

  const showSlide = (newIndex) => {
    if (newIndex === currentIndex) return;

    const current = sliderItems[currentIndex];
    const next = sliderItems[newIndex];

    gsap.to(current, { opacity: 0, duration: FADE_DURATION, overwrite: true });
    gsap.to(next, { opacity: 1, duration: FADE_DURATION, overwrite: true });

    currentIndex = newIndex;
    updateSliderUI(currentIndex);
  };

  archiveItems.forEach((item, index) => {
    item.addEventListener("click", () => {
      if (!slider || !sliderItems.length) return;

      isSliderOpen = true;
      currentIndex = index;

      lockScroll();

      gsap.set(sliderItems, { opacity: 0 });
      gsap.set(sliderItems[currentIndex], { opacity: 1 });

      updateSliderUI(currentIndex);

      gsap.to(slider, {
        opacity: 1,
        pointerEvents: "auto",
        duration: FADE_DURATION,
      });
    });
  });

  sliderNext?.addEventListener("click", () => {
    if (isSliderOpen) showSlide((currentIndex + 1) % sliderItems.length);
  });

  sliderPrev?.addEventListener("click", () => {
    if (isSliderOpen)
      showSlide((currentIndex - 1 + sliderItems.length) % sliderItems.length);
  });

  const closeSlider = () => {
    if (!isSliderOpen) return;

    isSliderOpen = false;

    gsap.to(slider, {
      opacity: 0,
      pointerEvents: "none",
      duration: FADE_DURATION,
    });

    unlockScroll();
  };

  sliderClose?.addEventListener("click", closeSlider);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSlider();
  });

  /* =====================================================
     ABOUT
  ===================================================== */

  const about = qs(".about");

  if (archive && about && mainWrapper) {
    const salmonColor = resolveVar("--salmon");

    gsap.to(mainWrapper, {
      backgroundColor: salmonColor,
      ease: "none",
      scrollTrigger: {
        trigger: archive,
        start: "bottom bottom",
        endTrigger: about,
        end: "top bottom",
        scrub: SCRUB_SMOOTH,
        invalidateOnRefresh: true,
      },
    });
  }

  /* =====================================================
     ABOUT — IMAGE SCALE → LOGO SCALE (SEQUENTIAL)
  ===================================================== */

  const aboutImg = qs("#aboutImg");
  const aboutLogoImg = qs(".logo-img");

  if (aboutImg && aboutLogoImg) {
    // États initiaux
    gsap.set(aboutImg, { scale: IMG_SCALE_MIN });
    gsap.set(aboutLogoImg, { scale: IMG_SCALE_MIN });

    const aboutScaleTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: aboutImg,
        start: "top top",
        end: () => `+=${window.innerHeight * 2}`,
        scrub: SCRUB_SMOOTH,
        invalidateOnRefresh: true,
      },
    });

    // PHASE 1 — aboutImg : 0.5 → 1 (0 → 100vh)
    aboutScaleTimeline.to(aboutImg, {
      scale: 1,
      ease: "none",
      duration: 1,
    });

    // PHASE 2 — logoImg : 0.5 → 1 (100 → 200vh)
    aboutScaleTimeline.to(aboutLogoImg, {
      scale: 1,
      ease: "none",
      duration: 1,
    });
  }

  /* =====================================================
     ABOUT — UI MODE SWITCH (COLOR + BLEND MODE)
  ===================================================== */

  const mainSticky = qs(".main");
  const blackTexts = qsa(".fc-black");

  if (about && progressBar && mainSticky && blackTexts.length) {
    const whiteColor = resolveVar("--white");

    ScrollTrigger.create({
      trigger: about,
      start: "top bottom",
      invalidateOnRefresh: true,
      onEnter: () => {
        gsap.set(progressBar, { backgroundColor: whiteColor });
        gsap.set(blackTexts, { color: whiteColor });
        gsap.set(mainSticky, { mixBlendMode: "normal" });
      },
      onLeaveBack: () => {
        gsap.set(progressBar, { clearProps: "backgroundColor" });
        gsap.set(blackTexts, { clearProps: "color" });
        gsap.set(mainSticky, { clearProps: "mixBlendMode" });
      },
    });
  }

  /* =====================================================
     FOOTER
  ===================================================== */

  qsa(".footer-item").forEach((item) => {
    const accordion = qs(".footer-accordion", item);
    const inner = qs(".footer-accordion-inner", item);
    if (!accordion || !inner) return;

    item.addEventListener("mouseenter", () => {
      accordion.style.maxHeight = `${inner.scrollHeight}px`;
      inner.style.pointerEvents = "auto";
    });

    item.addEventListener("mouseleave", () => {
      accordion.style.maxHeight = "0px";
      inner.style.pointerEvents = "none";
    });
  });

  /* =====================================================
     HEADER — NAV BUTTONS
  ===================================================== */

  qsa(".header-button").forEach((btn) => {
    const target = btn.getAttribute("section");
    if (!target) return;

    btn.addEventListener("click", () => {
      const el = qs(`.${target}`);
      if (el) lenis.scrollTo(el, { duration: 1, easing: easeOutCubic });
    });
  });

  /* =====================================================
     IMAGES — FADE IN ON LOAD
  ===================================================== */

  qsa("img").forEach((img) => {
    if (img.complete && img.naturalWidth !== 0) {
      img.style.opacity = "1";
      return;
    }

    const onLoad = () => {
      img.style.opacity = "1";
      img.removeEventListener("load", onLoad);
      img.removeEventListener("error", onLoad);
    };

    img.addEventListener("load", onLoad);
    img.addEventListener("error", onLoad);
  });

  /* =====================================================
     FINAL
  ===================================================== */

  ScrollTrigger.refresh();

  /* =====================================================
   LOADER — CHAOTIC / ORGANIC
===================================================== */

  const loader = qs(".loader");
  const counterLoader = qs("#counterLoader");
  const totalLoader = qs("#totalLoader");

  if (loader && counterLoader && totalLoader) {
    const TOTAL = archiveItems.length;

    const WAIT_BEFORE_START = 1000; // 1s à 00
    const DURATION = 3000; // durée réelle de chargement
    const START = performance.now() + WAIT_BEFORE_START;

    let current = 0;
    let lastUpdate = 0;

    counterLoader.textContent = "00";
    totalLoader.textContent = String(TOTAL).padStart(2, "0");

    // Lock scroll
    lenis.stop();
    document.body.style.overflow = "hidden";

    const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

    const update = (now) => {
      // Phase 1 — attente volontaire
      if (now < START) {
        requestAnimationFrame(update);
        return;
      }

      const elapsed = now - START;
      const progress = clamp(elapsed / DURATION, 0, 1);

      // Valeur MAX autorisée à cet instant
      const maxAllowed = Math.floor(progress * TOTAL);

      // Fréquence d’update aléatoire (irrégulière)
      if (now - lastUpdate > Math.random() * 180 + 40) {
        lastUpdate = now;

        if (current < maxAllowed) {
          const remaining = maxAllowed - current;

          // Incrément chaotique
          let step = Math.ceil(Math.random() * remaining);

          // Parfois très lent
          if (Math.random() < 0.35) step = 1;

          // Parfois freeze
          if (Math.random() < 0.15) step = 0;

          current = clamp(current + step, 0, maxAllowed);
          counterLoader.textContent = String(current).padStart(2, "0");
        }
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        // Sécurité finale
        counterLoader.textContent = String(TOTAL).padStart(2, "0");

        setTimeout(() => {
          const tl = gsap.timeline({
            onComplete: () => {
              gsap.set(loader, { display: "none" });
              document.body.style.overflow = "";
              lenis.start();

              window.__initScrollIndicator?.();
            },
          });

          // Fade out des chiffres
          tl.to([counterLoader, totalLoader], {
            opacity: 0,
            duration: 0.4,
            ease: "power1.out",
          });

          // Loader height 0 + hero slide up simultanés
          const loaderEase = cubicBezier(0.7, 0, 0.25, 1);

          gsap.set(loader, { transformOrigin: "top center" });
          tl.to(loader, {
            scaleY: 0,
            duration: 0.6,
            ease: loaderEase,
          });

          if (hero) {
            gsap.set(hero, { y: 200 });
            tl.to(hero, {
              y: 0,
              duration: 0.6,
              ease: loaderEase,
            }, "<");
          }
        }, 1000);
      }
    };

    requestAnimationFrame(update);
  }
});
