(function () {
  const WA = "6285141171174";
  const P = window.PRODUCTS || [];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const waLink = (name) => `https://wa.me/${WA}?text=${encodeURIComponent(
    name ? `Halo Hino Surabaya Pusat, saya ingin mendapatkan informasi mengenai ${name}. Mohon informasi lebih lanjut.`
         : "Halo Hino Surabaya Pusat, saya ingin berkonsultasi mengenai kendaraan Hino.")}`;

  // Wire WhatsApp links that have no product
  $$("[data-wa]").forEach(a => { a.href = waLink(); a.target = "_blank"; a.rel = "noopener"; });
  $("#cntProducts").textContent = P.length;

  // ---- Catalog ----
  let series = "all", body = "all", query = "";
  const bodies = [...new Set(P.map(p => p.body))];
  $("#bodyChips").innerHTML = `<button class="chip" data-body="all" aria-pressed="true">Semua Tipe</button>` +
    bodies.map(b => `<button class="chip" data-body="${b}" aria-pressed="false">${b}</button>`).join("");

  function card(p) {
    return `<article class="card">
      <div class="img"><img src="${p.image}" alt="${p.name}, tipe ${p.body}" loading="lazy" width="580" height="300"></div>
      <div class="body">
        <div class="meta"><span class="pill">Seri ${p.series}</span><span>${p.body}</span></div>
        <h3>${p.name}</h3>
        <p class="use">${p.use}</p>
        <div class="actions">
          <button class="btn btn-line" data-detail="${p.id}" aria-label="Detail ${p.name}">Detail</button>
          <a class="btn btn-wa" href="${waLink(p.name)}" target="_blank" rel="noopener" aria-label="Konsultasi WhatsApp ${p.name}">WhatsApp</a>
        </div>
      </div></article>`;
  }

  function render() {
    const q = query.trim().toLowerCase();
    const list = P.filter(p =>
      (series === "all" || p.series === series) &&
      (body === "all" || p.body === body) &&
      (!q || p.name.toLowerCase().includes(q) || p.body.toLowerCase().includes(q)));
    $("#grid").innerHTML = list.length ? list.map(card).join("")
      : `<div class="empty">Tidak ada tipe yang cocok. <button class="reset" id="reset2">Reset filter</button></div>`;
    $("#count").textContent = `Menampilkan ${list.length} dari ${P.length} tipe`;
    if (!reduce) gsap.fromTo("#grid .card", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .5, stagger: .06, ease: "power2.out", clearProps: "all" });
  }

  function setChip(attr, val) {
    $$(`[${attr}]`).forEach(b => b.setAttribute("aria-pressed", String(b.getAttribute(attr) === val)));
  }
  $$("[data-series]").forEach(b => b.addEventListener("click", () => { series = b.dataset.series; setChip("data-series", series); render(); }));
  $("#bodyChips").addEventListener("click", e => {
    const b = e.target.closest("[data-body]"); if (!b) return;
    body = b.dataset.body; setChip("data-body", body); render();
  });
  $("#q").addEventListener("input", e => { query = e.target.value; render(); });
  function resetAll() { series = "all"; body = "all"; query = ""; $("#q").value = ""; setChip("data-series", "all"); setChip("data-body", "all"); render(); }
  $("#reset").addEventListener("click", resetAll);
  $("#grid").addEventListener("click", e => { if (e.target.id === "reset2") resetAll(); });

  // ---- Detail modal ----
  const modal = $("#modal");
  function openDetail(id) {
    const p = P.find(x => x.id === id); if (!p) return;
    $("#dialog").innerHTML = `
      <div class="img"><img src="${p.image}" alt="${p.name}"></div>
      <div class="info">
        <div class="meta"><span class="pill">Seri ${p.series}</span><span>${p.body}</span></div>
        <h3 id="mTitle">${p.name}</h3>
        <p style="color:var(--muted)">${p.use}.</p>
        <table aria-label="Spesifikasi">
          <tr><td>Tenaga maks</td><td>${p.power}</td></tr>
          <tr><td>Torsi maks</td><td>${p.torque}</td></tr>
          <tr><td>Wheelbase</td><td>${p.wheelbase}</td></tr>
          <tr><td>Cabin to end</td><td>${p.cabToEnd}</td></tr>
        </table>
        <p class="note">Sumber: foto spesifikasi Hino Surabaya Pusat. Harga dan ketersediaan tidak ditampilkan; hubungi sales.</p>
        <a class="btn btn-wa" href="${waLink(p.name)}" target="_blank" rel="noopener">Konsultasi via WhatsApp</a>
        <button class="close" id="mClose" aria-label="Tutup detail">×</button>
      </div>`;
    modal.classList.add("open");
    $("#mClose").focus();
  }
  function closeDetail() { modal.classList.remove("open"); }
  $("#grid").addEventListener("click", e => { const b = e.target.closest("[data-detail]"); if (b) openDetail(b.dataset.detail); });
  modal.addEventListener("click", e => { if (e.target === modal || e.target.id === "mClose") closeDetail(); });

  // ---- Gallery (semua foto asli, kecuali infografis promosi) ----
  const GALLERY = [
    ["assets/img/g-500-closeup.jpg", "Hino 500 Series, close-up kabin hijau dengan badge Euro 4"],
    ["assets/img/g-500-cab-hijau.jpg", "Hino 500 Series kabin hijau di area dealer"],
    ...P.map(p => [p.image, p.name])
  ];
  $("#gallery").innerHTML = GALLERY.map(([src, alt]) =>
    `<button data-src="${src}" data-alt="${alt}" aria-label="Perbesar: ${alt}"><img src="${src}" alt="${alt}" loading="lazy"></button>`).join("");
  const lb = $("#lightbox");
  $("#gallery").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    $("#lbImg").src = b.dataset.src; $("#lbImg").alt = b.dataset.alt; lb.classList.add("open");
  });
  const closeLb = () => lb.classList.remove("open");
  $("#lbClose").addEventListener("click", closeLb);
  lb.addEventListener("click", e => { if (e.target === lb) closeLb(); });

  // ---- Global keys, nav ----
  document.addEventListener("keydown", e => { if (e.key === "Escape") { closeDetail(); closeLb(); drawer.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); } });
  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("scrolled", scrollY > 24);
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  const menuBtn = $("#menuBtn"), drawer = $("#drawer");
  menuBtn.addEventListener("click", () => {
    const open = drawer.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
  });
  $$("#drawer a").forEach(a => a.addEventListener("click", () => { drawer.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); }));

  render();

  // ---- GSAP ----
  if (window.gsap && !reduce) {
    if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from("#heroTitle .line > span", { yPercent: 110, duration: 1.1, stagger: .12 }, .1)
      .from("#heroLead, .hero .ctas, .hero .stamp", { y: 24, opacity: 0, duration: .8, stagger: .1 }, .5)
      .from("#heroFrame", { scale: 1.06, opacity: 0, duration: 1.4, ease: "power2.out" }, 0)
      .from(".brand, .links li, .nav .btn", { y: -12, opacity: 0, duration: .6, stagger: .05 }, .3);
    // Scrub: judul bagian mengikuti scroll
    if (window.ScrollTrigger) {
      gsap.from("#introH", { opacity: .15, scrollTrigger: { trigger: "#introH", start: "top 85%", end: "top 40%", scrub: true } });
      gsap.to("#heroFrame video", { yPercent: 6, ease: "none", scrollTrigger: { trigger: "#beranda", start: "top top", end: "bottom top", scrub: true } });
      gsap.utils.toArray("#gallery button").forEach((el, i) => {
        gsap.from(el, { y: 40 + (i % 3) * 12, opacity: 0, duration: .9, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none reverse" } });
      });
      gsap.from(".split > div, .discover-cards > article", { y: 24, opacity: 0, stagger: .12, duration: .8, ease: "power2.out",
        scrollTrigger: { trigger: ".split, .discover-cards", start: "top 80%" } });
    }
    // Magnetic CTA hover (ringan)
    $$(".btn-red").forEach(btn => {
      btn.addEventListener("pointermove", e => {
        const r = btn.getBoundingClientRect();
        gsap.to(btn, { x: (e.clientX - r.left - r.width / 2) * .15, y: (e.clientY - r.top - r.height / 2) * .2, duration: .3 });
      });
      btn.addEventListener("pointerleave", () => gsap.to(btn, { x: 0, y: 0, duration: .5, ease: "elastic.out(1,.4)" }));
    });
  }
})();
