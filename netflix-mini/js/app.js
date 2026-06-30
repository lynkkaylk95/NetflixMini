// app.js — Lógica de la página de inicio (index.html)

const DATA_URL = "movies.json";

async function loadMovies() {
  try {
    const res = await fetch(DATA_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("No se pudo cargar movies.json");
    return await res.json();
  } catch (e) {
    console.error(e);
    return [];
  }
}

function starLine(rating) {
  return `<span class="rating-pill">★ ${rating?.toFixed(1) ?? "—"}</span>`;
}

function movieCard(m) {
  return `
    <a class="card" href="movie.html?id=${m.id}">
      <img src="${m.poster}" alt="${escapeHtml(m.title)}" loading="lazy">
      <div class="card-meta">
        <div class="title">${escapeHtml(m.title)}</div>
        <div class="sub">${starLine(m.rating)} <span>•</span> <span>${m.year ?? ""}</span></div>
      </div>
    </a>`;
}

function escapeHtml(str = "") {
  return str.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function renderHero(movie) {
  const hero = document.getElementById("hero");
  if (!movie) { hero.style.display = "none"; return; }
  hero.innerHTML = `
    <img src="${movie.backdrop || movie.poster}" alt="${escapeHtml(movie.title)}">
    <div class="hero-gradient"></div>
    <div class="hero-content">
      <h1>${escapeHtml(movie.title)}</h1>
      <p>${escapeHtml(movie.description || "")}</p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="movie.html?id=${movie.id}">▶ Ver ahora</a>
        <a class="btn btn-ghost" href="movie.html?id=${movie.id}">+ Más info</a>
      </div>
    </div>`;
}

function renderGenreBar(movies, activeGenre, onPick) {
  const bar = document.getElementById("genre-bar");
  const genres = ["Todos", ...Array.from(new Set(movies.map(m => m.category).filter(Boolean)))];
  bar.innerHTML = genres.map(g =>
    `<button class="chip ${g === activeGenre ? "active" : ""}" data-genre="${escapeHtml(g)}">${escapeHtml(g)}</button>`
  ).join("");
  bar.querySelectorAll(".chip").forEach(btn => btn.addEventListener("click", () => onPick(btn.dataset.genre)));
}

function renderRows(movies) {
  const container = document.getElementById("rows");
  if (!movies.length) {
    container.innerHTML = `<div class="empty-state">Aún no hay películas. Usa el panel de administración para agregar la primera.</div>`;
    return;
  }
  const byCategory = {};
  movies.forEach(m => { (byCategory[m.category || "Otros"] ||= []).push(m); });

  const rowsHtml = [
    rowBlock("Tendencias", [...movies].sort((a, b) => (b.rating || 0) - (a.rating || 0))),
    ...Object.entries(byCategory).map(([cat, list]) => rowBlock(cat, list))
  ].join("");

  container.innerHTML = rowsHtml;
}

function rowBlock(title, list) {
  return `
    <section class="row">
      <div class="row-head"><h2>${escapeHtml(title)}</h2><span class="count">${list.length}</span></div>
      <div class="carousel">${list.map(movieCard).join("")}</div>
    </section>`;
}

function renderFiltered(movies, genre, query) {
  let list = movies;
  if (genre && genre !== "Todos") list = list.filter(m => m.category === genre);
  if (query) {
    const q = query.toLowerCase();
    list = list.filter(m => m.title.toLowerCase().includes(q) || (m.description || "").toLowerCase().includes(q));
  }
  if (genre !== "Todos" || query) {
    document.getElementById("rows").innerHTML = list.length
      ? `<section class="row"><div class="row-head"><h2>Resultados</h2><span class="count">${list.length}</span></div><div class="carousel">${list.map(movieCard).join("")}</div></section>`
      : `<div class="empty-state">No se encontraron películas.</div>`;
    document.getElementById("hero").style.display = "none";
  } else {
    document.getElementById("hero").style.display = "";
    renderRows(movies);
  }
}

(async function init() {
  const movies = await loadMovies();
  renderHero(movies[0]);
  renderRows(movies);

  let activeGenre = "Todos";

  function onPickGenre(g) {
    activeGenre = g;
    renderGenreBar(movies, activeGenre, onPickGenre);
    renderFiltered(movies, activeGenre, document.getElementById("search-input").value.trim());
  }

  renderGenreBar(movies, activeGenre, onPickGenre);

  document.getElementById("search-input").addEventListener("input", (e) => {
    renderFiltered(movies, activeGenre, e.target.value.trim());
  });
})();
