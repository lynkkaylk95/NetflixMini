// movie.js — Lógica de la página de detalle (movie.html)

function escapeHtml(str = "") {
  return str.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

async function loadMovies() {
  const res = await fetch("movies.json", { cache: "no-store" });
  return res.ok ? res.json() : [];
}

function renderAffiliate() {
  const links = window.SITE_CONFIG?.affiliateLinks || [];
  if (!links.length) return "";
  return `
    <div class="affiliate-box">
      <h3>Recomendado para ti</h3>
      ${links.map(l => `
        <a class="affiliate-link" href="${l.url}" target="_blank" rel="nofollow sponsored noopener">
          <span>${escapeHtml(l.label)}</span><span class="go">Ver →</span>
        </a>`).join("")}
    </div>`;
}

(async function init() {
  const params = new URLSearchParams(location.search);
  const id = parseInt(params.get("id"), 10);
  const movies = await loadMovies();
  const movie = movies.find(m => m.id === id);
  const root = document.getElementById("detail-root");

  if (!movie) {
    root.innerHTML = `<div class="empty-state">No se encontró esta película. <a href="index.html">Volver al inicio</a></div>`;
    return;
  }

  document.title = `${movie.title} — CineMX`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute("content", movie.description || "");

  const smartlink = window.SITE_CONFIG?.adsterraSmartlink || "#";
  const episodes = (movie.episodes && movie.episodes.length ? movie.episodes : ["Episodio 1"]);

  root.innerHTML = `
    <div class="detail-hero">
      <img src="${movie.backdrop || movie.poster}" alt="${escapeHtml(movie.title)}">
      <div class="hero-gradient"></div>
      <a class="back-btn" href="index.html" aria-label="Volver">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
      </a>
    </div>
    <div class="detail-body">
      <h1>${escapeHtml(movie.title)}</h1>
      <div class="detail-meta">
        <span class="badge">${movie.year ?? ""}</span>
        <span class="badge">${escapeHtml(movie.category ?? "")}</span>
        <span class="rating-pill">★ ${movie.rating?.toFixed(1) ?? "—"}</span>
      </div>
      <p class="description">${escapeHtml(movie.description || "")}</p>

      <div class="video-container">
        <iframe id="yt-player" src="https://www.youtube.com/embed/${encodeURIComponent(movie.youtubeId)}"
          title="Tráiler de ${escapeHtml(movie.title)}" loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen></iframe>
      </div>

      <div class="smartlink-block">
        <a class="btn btn-primary btn-block" id="smartlink" href="${smartlink}" target="_blank" rel="nofollow noopener">▶ Ver ahora</a>
        <p class="hint">Se abrirá en una pestaña nueva</p>
      </div>

      <h2 class="section-label">Episodios</h2>
      <ul class="episode-list">
        ${episodes.map((ep, i) => `
          <li><a href="${smartlink}" target="_blank" rel="nofollow noopener">
            <span>${escapeHtml(typeof ep === "string" ? ep : `Episodio ${i + 1}`)}</span>
            <span class="play">▶ Reproducir</span>
          </a></li>`).join("")}
      </ul>

      ${renderAffiliate()}
    </div>`;
})();
