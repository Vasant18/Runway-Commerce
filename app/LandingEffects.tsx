"use client";
import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { CustomEase } from "gsap/CustomEase";
import * as THREE from "three";

export default function LandingEffects() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, CustomEase);
    const ctx = gsap.context(() => {
      initSky();
      initAnimations();
    });
    return () => ctx.revert();

    // --- ported below ---

    /* Sky — 1:1 port of the original's React-Three-Fiber cloud scene.
       Decoded from runway.com Wayback chunk 385-6b5ec47c90d12ee784c5.js (Jan 2024):
       16,000 instanced cloud sprites (8,000 duplicated once for a seamless z-wrap),
       camera flies forward at 30 units/s over an 8,000-unit loop, gentle mouse
       parallax, custom fog/depth-fade shader. No scroll coupling — the sky lives
       in screen space behind everything, like looking out a plane window. */
    function initSky() {
      const canvas = document.getElementById("skyCanvas") as HTMLCanvasElement | null;
      if (!canvas) return;

      const LOOP = 8000; // orig: d = 8e3
      const epoch = Date.now(); // orig: g = Date.now()

      const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: false });
      renderer.setPixelRatio(1); // orig: <Canvas dpr={1}>
      renderer.setSize(window.innerWidth, window.innerHeight);

      const scene = new THREE.Scene();
      const fog = new THREE.Fog(0x90c5e4, -100, 5000); // orig: new n.Fog(9487844, -100, 5e3)
      scene.fog = fog;

      const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 3000);
      camera.position.set(0, 0, 0);

      /* shaders — verbatim from the decoded chunk */
      const vertexShader = [
        "varying vec2 vUv;",
        "void main() {",
        "  vUv = uv;",
        "  gl_Position = projectionMatrix * viewMatrix * modelMatrix * instanceMatrix * vec4(position, 1.0);",
        "}",
      ].join("\n");
      const fragmentShader = [
        "uniform sampler2D map;",
        "uniform vec3 fogColor;",
        "uniform float fogNear;",
        "uniform float fogFar;",
        "varying vec2 vUv;",
        "void main() {",
        "  float depth = gl_FragCoord.z / gl_FragCoord.w;",
        "  float fogFactor = smoothstep( fogNear, fogFar, depth );",
        "  gl_FragColor = texture2D( map, vUv );",
        "  gl_FragColor.w *= pow( gl_FragCoord.z, 20.0 );",
        "  gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );",
        "}",
      ].join("\n");

      const texture = new THREE.TextureLoader().load("/assets/img/cloud-4.png");
      const material = new THREE.ShaderMaterial({
        uniforms: {
          map: { value: texture },
          fogColor: { value: fog.color },
          fogNear: { value: fog.near },
          fogFar: { value: fog.far },
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        depthWrite: false,
        depthTest: false,
        transparent: true,
      });

      const geometry = new THREE.PlaneGeometry(64, 64);

      /* sprite field — orig recipe: 8,000 records, laid out twice along z */
      const records: { x: number; y: number; z: number; scale: number; rotationZ: number }[] = [];
      for (let i = 0; i < LOOP; i++) {
        records.push({
          x: 1000 * Math.random() - 500,
          y: -Math.random() * Math.random() * 200 - 15,
          z: i,
          scale: Math.random() * Math.random() * 1.5 + 0.5,
          rotationZ: Math.random() * Math.PI,
        });
      }
      const mesh = new THREE.InstancedMesh(geometry, material, LOOP * 2);
      const dummy = new THREE.Object3D();
      records.forEach(function (r, idx) {
        dummy.position.set(r.x, r.y, r.z - LOOP);
        dummy.scale.set(r.scale, r.scale, r.scale);
        dummy.rotation.set(0, 0, r.rotationZ);
        dummy.updateMatrix();
        mesh.setMatrixAt(idx, dummy.matrix);
      });
      records.forEach(function (r, idx) {
        dummy.position.set(r.x, r.y, r.z);
        dummy.scale.set(r.scale, r.scale, r.scale);
        dummy.rotation.set(0, 0, r.rotationZ);
        dummy.updateMatrix();
        mesh.setMatrixAt(records.length + idx, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
      scene.add(mesh);

      /* mouse parallax — orig: target ±0.05*(cursor-center), eased 1% per frame */
      const mouse = { x: 0, y: 0 };
      window.addEventListener("mousemove", function (e: MouseEvent) {
        mouse.x = 0.05 * (e.clientX - window.innerWidth / 2);
        mouse.y = 0.05 * (e.clientY - window.innerHeight / 2);
      });

      window.addEventListener("resize", function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });

      (function frame() {
        const t = (0.03 * (Date.now() - epoch)) % LOOP; // 30 units/s, seamless wrap
        camera.position.x += 0.01 * (mouse.x - camera.position.x);
        camera.position.y += 0.01 * (-mouse.y - camera.position.y);
        camera.position.z = -t + LOOP;
        renderer.render(scene, camera);
        requestAnimationFrame(frame);
      })();
    }

    /* Runway landing — GSAP scroll animations + interactions (v3) */
    function initAnimations() {
      /* ---------- preloader ---------- */
      const pre = document.getElementById("preloader");
      window.addEventListener("load", () => {
        if (!pre) return;
        pre.classList.add("done");
        setTimeout(() => pre.remove(), 900);
      });
      // fallback if load already fired
      if (pre && document.readyState === "complete") {
        pre.classList.add("done");
        setTimeout(() => pre.remove(), 900);
      }

      /* ---------- header ---------- */
      const mobileMenu = document.getElementById("mobileMenu");
      const burger = document.getElementById("burger");
      const onScroll = () => {
        document.body.classList.toggle("scrolled", window.scrollY > 80);
        if (mobileMenu && window.scrollY <= 80) mobileMenu.classList.remove("open");
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      if (burger && mobileMenu) {
        burger.addEventListener("click", () => {
          const open = mobileMenu.classList.toggle("open");
          burger.setAttribute("aria-expanded", String(open));
        });
      }
      if (mobileMenu) {
        mobileMenu.querySelectorAll("a").forEach((a) =>
          a.addEventListener("click", () => mobileMenu.classList.remove("open"))
        );
      }

      /* ---------- hero (decoded orig DesktopTablet + InteractiveProduct) ----------
         Overlay pinned 100vh, scales ×7 from the window center (origin 1280px 40%) and
         fades out; underneath, the product screenshot slides to viewport center. */
      const heroOverlay = document.getElementById("heroOverlay");
      const hoPill = document.getElementById("hoPill");
      if (heroOverlay) {
        const heroTl = gsap.timeline({
          scrollTrigger: {
            trigger: heroOverlay,
            start: 0,
            end: "+=" + innerHeight,
            pin: true,
            pinSpacing: false,
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
        heroTl.to(hoPill, { x: () => innerWidth * (290 / 1440), ease: "power4.out", duration: 0.03 }, 0);
        heroTl.set(heroOverlay, { transformOrigin: () => `${innerWidth * (1280 / 1440)}px 40%` }, 0);
        heroTl.fromTo(heroOverlay, { scale: 1 }, { scale: 7 }, 0);
        heroTl.to(heroOverlay, { autoAlpha: 0, duration: 0.001 });

        /* white top/bottom strips: (columnH − svgH)/2 + 1, like the orig resize hook */
        const whiteFit = () => {
          const col = document.querySelector(".ho-subtract");
          const svg = document.querySelector(".ho-subsvg");
          if (!col || !svg) return;
          const h = (col.clientHeight - svg.clientHeight) / 2 + 1;
          const whiteTop = document.getElementById("hoWhiteTop");
          const whiteBottom = document.getElementById("hoWhiteBottom");
          if (whiteTop) whiteTop.style.height = h + "px";
          if (whiteBottom) whiteBottom.style.height = h + "px";
        };
        whiteFit();
        window.addEventListener("resize", whiteFit);
      }

      /* under-layer: product screenshot slides to viewport center over the 150vh section */
      const iproduct = document.getElementById("iproduct");
      if (iproduct) {
        gsap.timeline({
          scrollTrigger: {
            trigger: iproduct,
            start: "top top",
            end: "bottom bottom",
            pin: "#ipInner",
            scrub: true,
          },
        }).to("#ipImgwrap", {
          xPercent: -50, x: "50vw",
          y: "50%", yPercent: -50,
          scale: 0.9,
          ease: "none",
          duration: 0.5,
        }, 0);
      }

      /* ---------- flip boards (decoded orig FlipBoard module 655) ----------
         flip(k): hide all cards except prev/cur/next; rotateX the current card −180°
         over 1s; z-index handoff at the midpoint. Three boards, delays 0/.2/.4,
         one flip every 2s, repeat forever. */
      const makeFlip = (boardId: string, k: number) => {
        const all = `.${boardId}-card`;
        const prev = `#${boardId}-card-${k - 1}`;
        const cur = `#${boardId}-card-${k}`;
        const next = `#${boardId}-card-${k + 1}`;
        const back = `#${boardId}-back-${k}`;
        const tl = gsap.timeline({ defaults: { ease: "none" } });
        tl.set(all, { display: "none" }, 0);
        tl.set([prev, cur, next].filter((s) => document.querySelector(s)), { display: "block" }, 0);
        tl.to(cur, { rotateX: -180, duration: 1 }, 0);
        tl.set(cur, { zIndex: -1 }, 0.5);
        tl.set(back, { zIndex: 1 }, 0.5);
        return tl;
      };
      ["fb1", "fb2", "fb3"].forEach((boardId, bi) => {
        const board = document.getElementById(boardId);
        if (!board) return;
        const n = board.querySelectorAll(".fb-card").length - 1; // cards 1..n flip
        const master = gsap.timeline({ repeat: -1, delay: bi * 0.2, defaults: { ease: "none" } });
        master.add(makeFlip(boardId, 0), 0); // orig: first flip immediately reveals logo[0]
        for (let k = 1; k <= n; k++) master.add(makeFlip(boardId, k), 2 * k);
      });

      /* (sky = fixed WebGL scene in js/sky.js — always on, no scroll coupling,
         exactly like the original; sections are opaque or transparent windows) */

      /* ---------- amenities (decoded orig Benefits, chunk 528 — verbatim timelines) ----------
         Six 100vh triggers drive: video crossfades ($=0.001 snaps), play/pause windows,
         and the card accordion (heights scrub 7.87%↔68.97%, planes fly to 62%). */
      const amen = document.querySelector(".amenities");
      if (amen && document.querySelector(".video-0")) {
        const $ = 0.001;
        const DARK = "#4A5357", WHITE = "#FDFCFC", INK = "#192227";
        const vids = [...Array(6)].map((_, i) => document.querySelector<HTMLVideoElement>(`.video-${i}`));
        gsap.set(".video-0", { opacity: 1 });

        /* per-zone video play/pause (orig: trigger-N, ±50% windows) */
        vids.forEach((v, i) => {
          if (!v) return;
          ScrollTrigger.create({
            trigger: `.trigger-${i}`,
            start: i === 5 ? "top bottom" : "top bottom-=50%",
            end: i === 5 ? "top top" : "bottom top-=50%",
            onEnter: () => v.play().catch(() => {}),
            onEnterBack: () => v.play().catch(() => {}),
            onLeave: () => v.pause(),
            onLeaveBack: () => v.pause(),
          });
        });

        /* accordion + fades per zone N=1..5 (verbatim positions/durations) */
        const zone = (n: number, extra?: (tl: gsap.core.Timeline) => void) => {
          const tl = gsap.timeline({
            scrollTrigger: { trigger: `.trigger-${n}`, start: "top bottom", end: "top top", scrub: true },
          });
          tl.to(`.productCard-${n - 1}`, { height: n === 1 ? 0 : "7.78%", ...(n === 1 ? { paddingTop: 0 } : {}), duration: 1 }, 0)
            .to(`.productCard-${n}`, { position: "relative", bottom: "auto", duration: 0 }, 0)
            .to(`.productCard-${n}`, { height: "68.97%", duration: 1 }, 0)
            .to(`.product-icon-${n - 1}`, { opacity: 0, duration: 0.2 }, 0)
            .to(`.product-icon-${n}`, { opacity: 1, duration: 0.2 }, 0)
            .to(`.product-plane-${n}`, { left: n === 3 ? "60%" : "62%", duration: n === 5 ? 0.9 : 0.8 }, n === 5 ? 0.1 : 0.2)
            .to(`.product-text-${n}`, { color: WHITE, duration: 0.2 }, 0);
          if (n > 1) tl.to(`.product-text-${n - 1}`, { color: DARK, duration: 0.2 }, 0);
          if (n === 1) {
            tl.to(".product-text-0", { opacity: 0, scale: 0.8, duration: 0.7 }, 0.2)
              .to(".productCard-0", { borderBottomColor: INK, duration: 0.1 }, 0.9);
          } else {
            tl.to(`.product-inner-${n - 1}`, { opacity: 0, scale: 0.8, duration: 0.7 }, 0.2);
          }
          if (extra) extra(tl);
          return tl;
        };
        // zone 1: video-0 out, video-1 in/out
        zone(1, (tl) => tl.to(".video-0", { opacity: 1, duration: $ }, 0).to(".video-0", { opacity: 0, duration: $ }, $)
          .to(".video-1", { opacity: 1, duration: $ }, $).to(".video-1", { opacity: 0, duration: $ }, 0.999));
        zone(2, (tl) => tl.to(".video-2", { opacity: 1, duration: $ }, 0).to(".video-2", { opacity: 0, duration: $ }, 0.999));
        zone(3, (tl) => tl.to(".video-3", { opacity: 1, duration: $ }, 0).to(".video-3", { opacity: 0, duration: $ }, 0.999));
        zone(4, (tl) => tl.to(".video-4", { opacity: 1, duration: $ }, 0).to(".video-4", { opacity: 0, duration: $ }, 0.999));
        zone(5, (tl) => tl.to(".video-5", { opacity: 1, duration: 0.001 }, 0.5));

        /* card click scrolls to its trigger (orig: scrollTo trigger-N offsetY 25) */
        document.querySelectorAll("[data-trigger]").forEach((card) => {
          card.addEventListener("click", () => {
            const t = document.querySelector(`.trigger-${(card as HTMLElement).dataset.trigger}`);
            if (!t) return;
            window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 25, behavior: "smooth" });
          });
        });
      }

      /* ---------- Runway is a better way (decoded from orig chunk 209, verbatim) ----------
         One scrubbed timeline draws the three streams (drawSVG "100% X%" = draw from the
         path END backward), flips checkpoint circles to yellow and pops checks; the
         checkpoint onStarts fire REAL-TIME goopyLoopy reveals of titles/cards/text. */
      const goopyLoopy = CustomEase.create("goopyLoopy", "M0,0 C0.302,0 0.307,0.708 0.578,0.904 0.686,0.982 0.752,1 1,1");
      const bwRig = document.querySelector(".bw-rig");
      if (bwRig) {
        const titleReveal = { y: 0, duration: 0.75, ease: goopyLoopy };
        const titleUnrotate = { rotate: 0, delay: 0.34, duration: 0.33 };
        const cardsReveal = { y: 0, delay: 0.2, opacity: 1, stagger: 0.2, ease: goopyLoopy, duration: 0.75 };
        const fullDraw = { drawSVG: "100% 100%", opacity: 1, ease: "none" };

        gsap.set(".bw-rig .check", { scale: 0.5, opacity: 0, transformOrigin: "center" });
        const bwTl = gsap.timeline({
          scrollTrigger: {
            trigger: bwRig,
            start: "top bottom",
            end: "bottom bottom+=10vh",
            scrub: true,
          },
        });
        bwTl
          .fromTo(".runway-is-better-path-0", fullDraw, { drawSVG: "100% 0%", duration: 0.28, ease: "none" }, 0.1)
          .fromTo(".runway-is-better-path-1", fullDraw, { drawSVG: "100% 13%", duration: 0.21, ease: "none" }, 0.1)
          .fromTo(".runway-is-better-path-2", fullDraw, { drawSVG: "100% 67%", duration: 0.25, ease: "none" }, 0.1)
          .fromTo(".runway-is-better-path-2", { drawSVG: "100% 67%", ease: "none" }, { drawSVG: "100% 60%", duration: 0.04, ease: "none" }, 0.35)
          .fromTo(".runway-is-better-path-2", { drawSVG: "100% 60%", ease: "none" }, { drawSVG: "100% 40%", duration: 0.1, ease: "none" }, 0.39)
          .fromTo(".runway-is-better-path-2", { drawSVG: "100% 40%", ease: "none" }, { drawSVG: "100% 20%", duration: 0.21, ease: "none" }, 0.49)
          .fromTo(".runway-is-better-path-2", { drawSVG: "100% 20%", ease: "none" }, { drawSVG: "100% 0%", duration: 0.3, ease: "none" }, 0.7)
          .to(".circle-3", {
            attr: { fill: "#F9A600" }, duration: 0.01,
            onStart: () => {
              gsap.to(".title-0", titleReveal); gsap.to(".title-0", titleUnrotate);
              gsap.to(".card-Designed-for-Finance", cardsReveal);
            },
          }, 0.49)
          .to(".check-3", { scale: 1, opacity: 1, duration: 0.01, ease: "back.out" }, 0.49)
          .to(".circle-2", {
            attr: { fill: "#F9A600" }, duration: 0.01,
            onStart: () => {
              gsap.to(".title-1", titleReveal); gsap.to(".title-1", titleUnrotate);
              gsap.to(".card-Built-for-Executives", cardsReveal);
            },
          }, 0.7)
          .to(".check-2", { scale: 1, opacity: 1, duration: 0.01, ease: "back.out" }, 0.7)
          .to(".circle-1", {
            attr: { fill: "#F9A600" }, duration: 0.01,
            onStart: () => {
              gsap.to(".title-2", titleReveal); gsap.to(".title-2", titleUnrotate);
              gsap.to(".text-2", { y: 0, delay: 0.2, opacity: 1, ease: goopyLoopy, duration: 0.75 });
            },
          }, 0.98)
          .to(".check-1", { scale: 1, opacity: 1, duration: 0.01, ease: "back.out" }, 0.98)
          .to(".runway-is-better-path-2", {
            onStart: () => {
              gsap.timeline()
                .to(".runway-is-better-text", { stagger: 0.4, y: 0, duration: 0.4 }, 0)
                .to(".runway-is-better-text", { stagger: 0.4, rotate: 0, duration: 0.2 }, 0.2);
            },
          }, 0.1);

        /* wrapper scale hooks (orig useScaleIn/useScaleOut, same as dark-rig) */
        gsap.fromTo(bwRig, { scale: 0.8 }, {
          scale: 1, ease: "power3.out",
          scrollTrigger: { trigger: bwRig, start: "top bottom", end: "top top", scrub: true },
        });
        gsap.to(bwRig, {
          scale: 0.8, ease: "power3.in",
          scrollTrigger: { trigger: bwRig, start: "bottom bottom", end: "bottom top", scrub: true },
        });
      }

      /* ---------- tickets: measured conveyor rig (orig TestimonialsDesktop) ----------
         Cards fly up from below and every landed card keeps creeping upward; the deck
         accumulates fanned near the top — nothing departs or fades. All values measured
         from the archive at 1440×900 (px ÷ 14.40 → vw, offsets relative to stage center). */
      const passes = gsap.utils.toArray<HTMLElement>(".pass");
      const REST_ROT = [3, -13, 9, -6, 10, -5]; // waiting tilt
      const SETTLE_ROT = [3, -4, 2, 0, 3, -2]; // tilt after landing
      const ENTRY_VW = [5.73, 6.77, 8.85, 12.67, 18.23, 26.22]; // y right after landing
      const FINAL_VW = [-15.66, -14.34, -13.23, -10.24, -6.63, -3.30]; // stacked end pos
      const WAIT_VW = 48.44; // waiting below viewport
      const vw = (v: number) => (v * innerWidth) / 100;

      passes.forEach((p, i) => {
        gsap.set(p, {
          zIndex: i + 1, // paint order = DOM order, newest on top
          rotation: i === 0 ? SETTLE_ROT[0] : REST_ROT[i],
          y: i === 0 ? vw(ENTRY_VW[0]) : vw(WAIT_VW),
        });
      });
      const N_ARRIVE = passes.length - 1; // card 0 starts landed
      const TL_END = N_ARRIVE + 0.4; // hold at the end like the orig (last ~12% static)
      const ticketTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".tickets",
          start: "top top",
          end: "+=300%", // orig rig: 2700px pin at 900vh viewport
          pin: true,
          scrub: 0.7,
          invalidateOnRefresh: true,
        },
      });
      passes.forEach((p, i) => {
        if (i > 0) {
          // arrival: fly up from below, easing into the settle tilt
          ticketTl.fromTo(p,
            { y: () => vw(WAIT_VW), rotation: REST_ROT[i] },
            { y: () => vw(ENTRY_VW[i]), rotation: SETTLE_ROT[i], duration: 0.9, ease: "power2.out" },
            i - 1);
        }
        // conveyor creep: landed card drifts linearly to its stacked final position
        ticketTl.to(p, {
          y: () => vw(FINAL_VW[i]),
          duration: TL_END - i,
          ease: "none",
        }, i === 0 ? 0 : i - 0.1);
      });

      /* ---------- dark rig (supported by + takeoff) ---------- */
      gsap.fromTo(".dark-rig",
        { scale: 0.8, opacity: 0.9 },
        { scale: 1, opacity: 1, ease: "none",
          scrollTrigger: { trigger: ".takeoff-wrap", start: "top 95%", end: "top 35%", scrub: 0.6 } });

      /* logo marquees: CSS keyframes drive continuous leftward motion (like original) */

      /* ---------- takeoff runway draw ----------
         Paths start at bottom-left; increasing dashoffset moves the dash from the
         END back toward the START. Scrolling down: amber (curve, ends at right)
         travels right→curve→downwards; orange (vertical, ends at top) travels
         top→downwards. Scrub reverses both on scroll-up. */
      document.querySelectorAll(".rp-amber, .rp-orange").forEach((p, idx) => {
        const path = p as unknown as SVGGeometryElement;
        const len = path.getTotalLength();
        const seg = len * (idx ? 0.4 : 0.55);
        gsap.set(p, { strokeDasharray: `${seg} ${len}` });
        gsap.fromTo(p, { strokeDashoffset: -(len * 0.9) }, {
          strokeDashoffset: seg * 1.1, ease: "none",
          scrollTrigger: {
            trigger: ".takeoff-wrap",
            start: "top bottom",
            end: "bottom top",
            scrub: 1 + idx * 0.4,
          },
        });
      });
      gsap.from(".takeoff-title .line span", {
        yPercent: 110, stagger: 0.12, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: ".takeoff", start: "top 60%", toggleActions: "play none none reverse" },
      });
      gsap.from(".takeoff-badge", {
        scale: 0, rotate: -120, duration: 0.7, ease: "back.out(2)",
        scrollTrigger: { trigger: ".takeoff", start: "top 60%", toggleActions: "play none none reverse" },
      });
      gsap.from(".takeoff-sub", {
        opacity: 0, y: 28, duration: 0.7,
        scrollTrigger: { trigger: ".takeoff", start: "top 52%", toggleActions: "play none none reverse" },
      });

      /* ---------- boarding pass ---------- */
      gsap.from(".boarding-pass", {
        y: 110, opacity: 0, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: ".boarding", start: "top 74%", toggleActions: "play none none reverse" },
      });

      /* ---------- footer scale scrub (orig Footer__Wrapper 0.936→1.01, stripes flow) ---------- */
      gsap.fromTo(".site-footer",
        { scale: 0.936, transformOrigin: "50% 53%" },
        { scale: 1.01, ease: "none",
          scrollTrigger: { trigger: ".site-footer", start: "top bottom", end: "bottom bottom", scrub: 0.5 } });

      /* ---------- footer wordmark ---------- */
      gsap.from(".footer-logo", {
        yPercent: 70, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: ".site-footer", start: "top 82%", toggleActions: "play none none reverse" },
      });

      /* ---------- boarding form ---------- */
      const bpDate = document.getElementById("bpDate");
      if (bpDate) {
        const now = new Date();
        const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        bpDate.textContent = `${now.getDate()} ${months[now.getMonth()]}. ${now.getFullYear()}`;
      }
      const bpNum = document.getElementById("bpNum");
      if (bpNum) bpNum.textContent = "RNW" + (8000 + ((new Date().getDate() * 37) % 1000));

      /* ---------- Early Access modal ---------- */
      const eaModal = document.getElementById("eaModal");
      const eaBack = document.getElementById("eaBack");
      function openModal(e?: Event) {
        if (e) e.preventDefault();
        if (!eaModal) return;
        eaModal.classList.add("open");
        eaModal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
      }
      function closeModal() {
        if (!eaModal) return;
        eaModal.classList.remove("open");
        eaModal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
      }
      if (eaBack) eaBack.addEventListener("click", closeModal);
      document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
      // every Get Early Access / Early Access CTA opens the modal (like the original)
      document.querySelectorAll(".btn-header, .early-access-tile").forEach((el) =>
        el.addEventListener("click", openModal)
      );
      document.querySelectorAll('.footer-list a[href="#boarding"], .mobile-menu a[href="#boarding"], .main-nav a[href="#boarding"]').forEach((el) => {
        if (/Get Early Access|Early Access/.test(el.textContent ?? "")) el.addEventListener("click", openModal);
      });

      const form = document.getElementById("accessForm") as HTMLFormElement | null;
      function wireForm(f: HTMLFormElement | null) {
        if (!f) return;
        f.addEventListener("submit", (e) => {
          e.preventDefault();
          const fields = f.querySelectorAll("input");
          let ok = true;
          fields.forEach((fl) => {
            const bad = !fl.value.trim() || (fl.type === "email" && !/^\S+@\S+\.\S+$/.test(fl.value));
            fl.style.borderColor = bad ? "#c2402a" : "";
            if (bad) ok = false;
          });
          if (!ok) return;
          const getAccessBtn = f.querySelector(".btn-getaccess") as HTMLElement | null;
          const doneEl = f.querySelector(".bp-done") as HTMLElement | null;
          if (getAccessBtn) getAccessBtn.hidden = true;
          if (doneEl) doneEl.hidden = false;
        });
      }
      wireForm(form);
      wireForm(document.getElementById("accessFormM") as HTMLFormElement | null);
      const bpDateM = document.getElementById("bpDateM");
      if (bpDateM && bpDate) bpDateM.textContent = bpDate.textContent;
      const bpNumM = document.getElementById("bpNumM");
      if (bpNumM && bpNum) bpNumM.textContent = bpNum.textContent;
    }
  }, []);
  return null;
}
