/* ============================================================
   site.js — rental-mobil ("Wira Rent Car")
   Memuat content.json, merender halaman, filter armada,
   dan menyuntik JSON-LD AutoRental.
   ============================================================ */
import {
  waLink,
  loadContent,
  initFaq,
  initMobileNav,
  initCopyButtons,
  setYear,
  esc,
} from "../shared/utils.js";
import { navbarHTML } from "../shared/components/navbar.js";
import { footerHTML } from "../shared/components/footer.js";
import { sectionHeadHTML } from "../shared/components/section-head.js";

/* ---------- Fallback bila content.json gagal dimuat ---------- */
const FALLBACK = {
  brand: {
    name: "Wira Rent Car",
    mark: "W",
    tagline: "Mobil siap jalan, harga jelas, tanpa biaya siluman.",
  },
  nav: {
    links: [
      { href: "#armada", label: "Armada" },
      { href: "#syarat", label: "Syarat Sewa" },
      { href: "#area", label: "Area Layanan" },
      { href: "#faq", label: "FAQ" },
      { href: "#kontak", label: "Kontak" },
    ],
    cta: { href: "#kontak", label: "Sewa Sekarang" },
  },
  hero: {
    eyebrow: "Rental mobil • Depok & Jabodetabek",
    title: "Sewa mobil? Harga jelas, mobil siap jalan.",
    subtitle:
      "Pilih armadanya, chat WhatsApp, mobil diantar ke lokasimu. Semua harga tampil di depan — tanpa biaya tersembunyi.",
    startPriceLabel: "Harga mulai",
    startPrice: 300000,
    priceUnit: "per hari • lepas kunci",
    ctaLabel: "Cek Ketersediaan",
    ctaMessage:
      "Halo Wira Rent Car! Saya mau cek ketersediaan mobil untuk sewa.",
    trustItems: [
      "Armada terawat dan bersih",
      "Bisa lepas kunci atau dengan sopir",
      "Antar-jemput area Jabodetabek",
    ],
  },
  fleetSection: {
    index: "01",
    eyebrow: "ARMADA",
    title: "Pilih mobil yang pas untuk perjalananmu",
    desc: "Semua harga per 24 jam. Filter berdasarkan jumlah penumpang, lalu tekan tombol sewa.",
  },
  filters: [
    { id: "all", label: "Semua" },
    { id: "small", label: "Kapasitas ≤ 5 orang" },
    { id: "large", label: "Kapasitas > 5 orang" },
  ],
  fleet: [
    {
      name: "Toyota Calya",
      capacity: 7,
      transmission: "Manual",
      priceWithoutDriver: 300000,
      priceWithDriver: 450000,
      badge: "Paling hemat",
    },
    {
      name: "Toyota Avanza",
      capacity: 7,
      transmission: "Manual",
      priceWithoutDriver: 350000,
      priceWithDriver: 500000,
      badge: "Terlaris",
    },
    {
      name: "Honda Brio",
      capacity: 5,
      transmission: "Otomatis",
      priceWithoutDriver: 350000,
      priceWithDriver: 500000,
      badge: "Lincah di kota",
    },
    {
      name: "Toyota Hiace Commuter",
      capacity: 16,
      transmission: "Manual",
      priceWithoutDriver: 1100000,
      priceWithDriver: 1400000,
      badge: "Rombongan",
    },
  ],
  termsSection: {
    index: "02",
    eyebrow: "SYARAT SEWA",
    title: "Syaratnya jelas, dibaca sebelum sewa",
    desc: "",
  },
  terms: [
    {
      title: "Identitas penyewa",
      desc: "Siapkan KTP dan SIM A yang masih aktif.",
    },
    {
      title: "Uang muka 30%",
      desc: "DP saat booking, pelunasan saat mobil diserahkan.",
    },
    {
      title: "Durasi 24 jam",
      desc: "Dihitung sejak serah terima mobil.",
    },
  ],
  areaSection: {
    index: "03",
    eyebrow: "AREA LAYANAN",
    title: "Kami antar ke lokasimu",
    desc: "",
  },
  areas: [{ name: "Depok", note: "Antar-jemput gratis" }],
  faqSection: {
    index: "04",
    eyebrow: "FAQ",
    title: "Pertanyaan yang sering ditanyakan",
    desc: "",
  },
  faq: [
    {
      q: "Apa saja syarat untuk sewa mobil?",
      a: "Cukup KTP dan SIM A yang masih aktif.",
    },
    {
      q: "Apakah bisa sewa tanpa sopir?",
      a: "Bisa. Semua armada tersedia lepas kunci maupun dengan sopir.",
    },
    {
      q: "Bagaimana cara booking?",
      a: "Chat WhatsApp, sebutkan mobil dan tanggal, lalu bayar DP 30%.",
    },
  ],
  contactSection: {
    index: "05",
    eyebrow: "KONTAK & LOKASI",
    title: "Hubungi kami, mobil siap diantar",
    desc: "",
  },
  contact: {
    address: "Jl. Raya Margonda No. 88, Depok, Jawa Barat 16424",
    hours: "Setiap hari, 07.00–21.00 WIB",
    phone: "6281234567890",
    phoneDisplay: "+62 812-3456-7890",
    mapsQuery: "Jl. Raya Margonda No. 88, Depok, Jawa Barat",
    waMessage: "Halo Wira Rent Car! Saya mau tanya-tanya soal sewa mobil.",
  },
  footer: { note: "", socials: [] },
  jsonld: {
    addressLocality: "Depok",
    addressRegion: "Jawa Barat",
    postalCode: "16424",
    openingHours: "Mo-Su 07:00-21:00",
    priceRange: "Rp300.000 - Rp1.400.000",
  },
};

/* ---------- Format harga ---------- */
function rupiah(n) {
  const num = Number(n) || 0;
  return "Rp" + num.toLocaleString("id-ID");
}

/* ---------- Logika filter (murni, bisa diuji) ---------- */
export function matchFilter(capacity, mode) {
  const cap = Number(capacity) || 0;
  if (mode === "small") return cap <= 5;
  if (mode === "large") return cap > 5;
  return true;
}

/* ---------- SVG mobil (dekoratif, tanpa foto orang) ---------- */
function carSVG(index) {
  const bodyClass = index % 3 === 2 ? "car-body-alt" : "car-body";
  return `<svg class="car-svg" viewBox="0 0 240 100" aria-hidden="true" focusable="false">
    <path class="${bodyClass}" d="M8 70 C8 58 14 52 26 50 L52 46 C62 30 78 22 100 22 L150 22 C172 22 186 32 196 46 L218 50 C230 52 234 58 234 70 L234 76 L218 76 A18 18 0 0 0 182 76 L88 76 A18 18 0 0 0 52 76 L8 76 Z"/>
    <path class="car-glass" d="M66 44 C74 32 86 28 102 28 L146 28 C162 28 172 34 180 44 Z"/>
    <rect class="car-light" x="226" y="58" width="8" height="6" rx="2"/>
    <circle class="car-wheel" cx="70" cy="76" r="16"/>
    <circle class="car-hub" cx="70" cy="76" r="6"/>
    <circle class="car-wheel" cx="200" cy="76" r="16"/>
    <circle class="car-hub" cx="200" cy="76" r="6"/>
  </svg>`;
}

/* ---------- Render ---------- */
function renderNavbar(c) {
  const root = document.getElementById("navbar-root");
  if (!root) return;
  root.innerHTML = navbarHTML({
    brand: c.brand,
    links: c.nav.links,
    cta: c.nav.cta,
  });
}

function renderHero(c) {
  const el = document.querySelector("[data-hero]");
  if (!el) return;
  const h = c.hero;
  const wa = waLink(c.contact.phone, h.ctaMessage);
  const trust = (h.trustItems || [])
    .map((t) => `<li>${esc(t)}</li>`)
    .join("");
  el.innerHTML = `
    <div class="wrap hero-inner">
      <div>
        <p class="hero-eyebrow">${esc(h.eyebrow)}</p>
        <h1>${esc(h.title)}</h1>
        <p class="hero-sub">${esc(h.subtitle)}</p>
        <div class="hero-price" role="text" aria-label="${esc(h.startPriceLabel)} ${esc(rupiah(h.startPrice))} ${esc(h.priceUnit)}">
          <span class="hero-price-label">${esc(h.startPriceLabel)}</span>
          <span class="hero-price-value">${esc(rupiah(h.startPrice))}</span>
          <span class="hero-price-unit">${esc(h.priceUnit)}</span>
        </div>
        <div class="hero-cta-row">
          <a class="btn hero-cta" href="${esc(wa)}" target="_blank" rel="noopener noreferrer">${esc(h.ctaLabel)}</a>
        </div>
        <ul class="hero-trust">${trust}</ul>
      </div>
    </div>`;
}

function fleetCard(car, waNumber, brandName, index) {
  const msg = `Halo ${brandName}! Saya tertarik sewa *${car.name}* (${car.capacity} orang, ${car.transmission}). Apakah unitnya tersedia?`;
  const wa = waLink(waNumber, msg);
  const badge = car.badge
    ? `<span class="fleet-badge">${esc(car.badge)}</span>`
    : "";
  return `
  <article class="card fleet-card" data-fleet-card data-capacity="${esc(car.capacity)}">
    <div class="fleet-visual">${badge}${carSVG(index)}</div>
    <div class="fleet-body">
      <h3 class="fleet-name">${esc(car.name)}</h3>
      <p class="fleet-meta">
        <span>${esc(car.capacity)} orang</span>
        <span>${esc(car.transmission)}</span>
      </p>
      <dl class="fleet-prices">
        <div>
          <dt>Lepas kunci</dt>
          <dd>${esc(rupiah(car.priceWithoutDriver))}<small>/hari • 24 jam</small></dd>
        </div>
        <div>
          <dt>Dengan sopir</dt>
          <dd>${esc(rupiah(car.priceWithDriver))}<small>/hari • 24 jam</small></dd>
        </div>
      </dl>
      <a class="btn btn-primary" href="${esc(wa)}" target="_blank" rel="noopener noreferrer">Sewa Mobil Ini</a>
    </div>
  </article>`;
}

function renderFleet(c) {
  const headEl = document.querySelector("[data-armada-head]");
  if (headEl) headEl.innerHTML = sectionHeadHTML(c.fleetSection);

  const bar = document.querySelector("[data-filter-bar]");
  const grid = document.querySelector("[data-fleet-grid]");
  if (!bar || !grid) return;

  bar.innerHTML = (c.filters || [])
    .map(
      (f, i) =>
        `<button type="button" class="filter-btn" data-filter="${esc(f.id)}" aria-pressed="${i === 0 ? "true" : "false"}">${esc(f.label)}</button>`
    )
    .join("");

  grid.innerHTML = (c.fleet || [])
    .map((car, i) => fleetCard(car, c.contact.phone, c.brand.name, i))
    .join("");

  bar.querySelectorAll("[data-filter]").forEach((btn) => {
    btn.addEventListener("click", () => applyFilter(btn.dataset.filter));
  });
  applyFilter("all");
}

function applyFilter(mode) {
  document
    .querySelectorAll('[data-filter-bar] [data-filter]')
    .forEach((btn) => {
      btn.setAttribute(
        "aria-pressed",
        String(btn.dataset.filter === mode)
      );
    });
  let shown = 0;
  document.querySelectorAll("[data-fleet-card]").forEach((card) => {
    const visible = matchFilter(card.dataset.capacity, mode);
    card.hidden = !visible;
    if (visible) shown += 1;
  });
  const countEl = document.querySelector("[data-fleet-count]");
  const total = document.querySelectorAll("[data-fleet-card]").length;
  if (countEl) {
    countEl.textContent =
      shown === total
        ? `Menampilkan ${total} armada.`
        : `Menampilkan ${shown} dari ${total} armada.`;
  }
}

function renderTerms(c) {
  const headEl = document.querySelector("[data-syarat-head]");
  if (headEl) headEl.innerHTML = sectionHeadHTML(c.termsSection);
  const list = document.querySelector("[data-terms-list]");
  if (!list) return;
  list.innerHTML = (c.terms || [])
    .map(
      (t) => `<li><h3>${esc(t.title)}</h3><p>${esc(t.desc)}</p></li>`
    )
    .join("");
}

function renderArea(c) {
  const headEl = document.querySelector("[data-area-head]");
  if (headEl) headEl.innerHTML = sectionHeadHTML(c.areaSection);
  const list = document.querySelector("[data-area-list]");
  if (!list) return;
  list.innerHTML = (c.areas || [])
    .map(
      (a) =>
        `<li><strong>${esc(a.name)}</strong><small>${esc(a.note)}</small></li>`
    )
    .join("");
}

function renderFaq(c) {
  const headEl = document.querySelector("[data-faq-head]");
  if (headEl) headEl.innerHTML = sectionHeadHTML(c.faqSection);
  const list = document.querySelector("[data-faq-list]");
  if (!list) return;
  list.innerHTML = (c.faq || [])
    .map(
      (item) => `
      <div class="faq-item" data-faq-item>
        <button type="button" class="faq-q" data-faq-q>
          <span>${esc(item.q)}</span>
          <span class="faq-icon" aria-hidden="true">+</span>
        </button>
        <div class="faq-a" data-faq-a><p>${esc(item.a)}</p></div>
      </div>`
    )
    .join("");
}

function renderContact(c) {
  const headEl = document.querySelector("[data-kontak-head]");
  if (headEl) headEl.innerHTML = sectionHeadHTML(c.contactSection);
  const grid = document.querySelector("[data-contact-grid]");
  if (!grid) return;
  const ct = c.contact;
  const wa = waLink(ct.phone, ct.waMessage);
  const maps =
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(ct.mapsQuery);
  grid.innerHTML = `
    <div class="contact-info">
      <div class="contact-row">
        <span class="contact-icon" aria-hidden="true">⌖</span>
        <p><strong>Alamat</strong>${esc(ct.address)}</p>
      </div>
      <div class="contact-row">
        <span class="contact-icon" aria-hidden="true">◷</span>
        <p><strong>Jam operasional</strong>${esc(ct.hours)}</p>
      </div>
      <div class="contact-row">
        <span class="contact-icon" aria-hidden="true">✆</span>
        <p><strong>WhatsApp / telepon</strong>
          <a href="tel:${esc(String(ct.phone).replace(/\D/g, ""))}">${esc(ct.phoneDisplay)}</a>
        </p>
      </div>
      <div class="contact-actions">
        <button type="button" class="btn-copy" data-copy="${esc(ct.phoneDisplay)}" aria-label="Salin nomor WhatsApp">Salin Nomor</button>
        <a class="btn btn-outline" href="${esc(maps)}" target="_blank" rel="noopener noreferrer">Lihat di Google Maps</a>
      </div>
    </div>
    <div class="contact-card">
      <h3>Siap sewa hari ini?</h3>
      <p>Chat sekarang, sebutkan mobil dan tanggalnya. Kami balas cepat di jam operasional.</p>
      <a class="btn btn-wa" href="${esc(wa)}" target="_blank" rel="noopener noreferrer">Chat WhatsApp</a>
    </div>`;
}

function renderFooter(c) {
  const root = document.getElementById("footer-root");
  if (!root) return;
  root.innerHTML = footerHTML({
    brand: c.brand,
    contact: {
      address: c.contact.address,
      hours: c.contact.hours,
      phone: c.contact.phoneDisplay,
    },
    socials: c.footer.socials || [],
    note: c.footer.note || "",
  });
}

function injectJsonLd(c) {
  const j = c.jsonld || {};
  const data = {
    "@context": "https://schema.org",
    "@type": "AutoRental",
    name: c.brand.name,
    description: c.brand.tagline,
    telephone: "+" + String(c.contact.phone).replace(/\D/g, ""),
    priceRange: j.priceRange,
    openingHours: j.openingHours,
    address: {
      "@type": "PostalAddress",
      streetAddress: c.contact.address,
      addressLocality: j.addressLocality,
      addressRegion: j.addressRegion,
      postalCode: j.postalCode,
      addressCountry: "ID",
    },
    areaServed: (c.areas || []).map((a) => a.name),
  };
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

async function init() {
  const notice = document.querySelector("[data-content-notice]");
  let content;
  try {
    content = await loadContent("content.json", FALLBACK, notice);
  } catch {
    content = FALLBACK;
    if (notice) {
      notice.hidden = false;
      notice.textContent =
        "Konten tidak dapat dimuat. Periksa koneksi lalu muat ulang halaman.";
    }
  }
  const c = content && typeof content === "object" ? content : FALLBACK;
  renderNavbar(c);
  renderHero(c);
  renderFleet(c);
  renderTerms(c);
  renderArea(c);
  renderFaq(c);
  renderContact(c);
  renderFooter(c);
  injectJsonLd(c);
  initMobileNav();
  initFaq();
  initCopyButtons();
  setYear();
}

if (typeof document !== "undefined") {
  init();
}
