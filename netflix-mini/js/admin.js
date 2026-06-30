// admin.js — Trang quản trị: thêm/sửa/xóa phim
// và đăng thay đổi trực tiếp lên GitHub (movies.json + posters/).
// Cloudflare Pages sẽ phát hiện thay đổi trên repo và tự deploy lại.

const TOKEN_KEY = "cinemx_gh_token";
let moviesData = [];
let currentSha = null;
let editingId = null;

const $ = (sel) => document.querySelector(sel);

function showStatus(el, type, html) {
  el.className = `status-msg show ${type}`;
  el.innerHTML = html;
}
function hideStatus(el) { el.className = "status-msg"; }

function getToken() { return localStorage.getItem(TOKEN_KEY) || ""; }
function setToken(t) { localStorage.setItem(TOKEN_KEY, t); }

function escapeHtml(str = "") {
  return str.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

async function refreshFromGitHub() {
  const status = $("#load-status");
  const token = getToken();
  if (!token) {
    showStatus(status, "info", "Kết nối tài khoản GitHub ở trên để tải và đăng phim.");
    return;
  }
  showStatus(status, "info", '<span class="spinner"></span>Đang tải danh sách phim từ GitHub...');
  try {
    const file = await GitHubClient.getFile(token, "movies.json");
    moviesData = file ? JSON.parse(file.content) : [];
    currentSha = file ? file.sha : null;
    hideStatus(status);
    renderMovieList();
  } catch (e) {
    showStatus(status, "err", "Lỗi: " + e.message);
  }
}

function renderMovieList() {
  const list = $("#movie-list");
  if (!moviesData.length) {
    list.innerHTML = `<p class="sub-text">Chưa có phim nào. Thêm phim đầu tiên bằng form ở trên.</p>`;
    return;
  }
  list.innerHTML = moviesData.map(m => `
    <div class="movie-row">
      <img src="${m.poster}" alt="">
      <div class="info">
        <div class="t">${escapeHtml(m.title)}</div>
        <div class="c">${escapeHtml(m.category || "")} · ${m.year ?? ""}</div>
      </div>
      <div class="actions">
        <button class="icon-btn" data-edit="${m.id}" title="Sửa">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
        </button>
        <button class="icon-btn danger" data-del="${m.id}" title="Xóa">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
        </button>
      </div>
    </div>`).join("");

  list.querySelectorAll("[data-edit]").forEach(b => b.addEventListener("click", () => editMovie(+b.dataset.edit)));
  list.querySelectorAll("[data-del]").forEach(b => b.addEventListener("click", () => deleteMovie(+b.dataset.del)));
}

function editMovie(id) {
  const m = moviesData.find(x => x.id === id);
  if (!m) return;
  editingId = id;
  $("#title").value = m.title;
  $("#description").value = m.description || "";
  $("#category").value = m.category || "";
  $("#youtubeId").value = m.youtubeId || "";
  $("#rating").value = m.rating ?? "";
  $("#year").value = m.year ?? "";
  $("#episodes").value = (m.episodes || []).join(", ");
  $("#poster-url").value = m.poster && !m.poster.startsWith("posters/") ? m.poster : "";
  $("#form-title").textContent = "Sửa phim";
  $("#save-button").textContent = "Lưu thay đổi";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetForm() {
  editingId = null;
  $("#movie-form").reset();
  $("#form-title").textContent = "Thêm phim mới";
  $("#save-button").textContent = "Lưu và đăng lên web";
}

async function deleteMovie(id) {
  if (!confirm("Xóa phim này? Thao tác sẽ được đăng lên web ngay lập tức.")) return;
  moviesData = moviesData.filter(m => m.id !== id);
  await publish("Xóa phim");
}

async function publish(commitMessage) {
  const status = $("#save-status");
  const token = getToken();
  if (!token) { showStatus(status, "err", "Hãy kết nối tài khoản GitHub trước."); return; }
  showStatus(status, "info", '<span class="spinner"></span>Đang đăng lên GitHub...');
  try {
    const result = await GitHubClient.putTextFile(
      token, "movies.json", JSON.stringify(moviesData, null, 2), commitMessage, currentSha
    );
    currentSha = result.content.sha;
    showStatus(status, "ok", "✅ Đã đăng thành công. Cloudflare Pages sẽ cập nhật website trong vài giây.");
    renderMovieList();
  } catch (e) {
    showStatus(status, "err", "Lỗi khi đăng: " + e.message);
  }
}

async function handleSave(e) {
  e.preventDefault();
  const status = $("#save-status");
  const title = $("#title").value.trim();
  const youtubeId = $("#youtubeId").value.trim();
  if (!title || !youtubeId) { showStatus(status, "err", "Tiêu đề và YouTube ID là bắt buộc."); return; }

  const token = getToken();
  if (!token) { showStatus(status, "err", "Hãy kết nối tài khoản GitHub trước (ở trên)."); return; }

  let posterPath = $("#poster-url").value.trim();
  const fileInput = $("#poster-file");

  try {
    if (fileInput.files.length > 0) {
      showStatus(status, "info", '<span class="spinner"></span>Đang tải poster lên...');
      posterPath = await GitHubClient.putImageFile(token, fileInput.files[0]);
    }

    const episodes = $("#episodes").value.split(",").map(s => s.trim()).filter(Boolean);

    if (editingId) {
      const m = moviesData.find(x => x.id === editingId);
      Object.assign(m, {
        title, description: $("#description").value.trim(),
        category: $("#category").value.trim(),
        youtubeId, rating: parseFloat($("#rating").value) || 0,
        year: parseInt($("#year").value) || undefined,
        episodes: episodes.length ? episodes : m.episodes,
        poster: posterPath || m.poster,
        backdrop: posterPath || m.backdrop
      });
      await publish(`Sửa phim: ${title}`);
    } else {
      const newId = moviesData.length ? Math.max(...moviesData.map(m => m.id)) + 1 : 1;
      moviesData.push({
        id: newId, title, description: $("#description").value.trim(),
        category: $("#category").value.trim(), youtubeId,
        rating: parseFloat($("#rating").value) || 0,
        year: parseInt($("#year").value) || undefined,
        episodes: episodes.length ? episodes : ["Episodio 1"],
        poster: posterPath || "https://via.placeholder.com/300x450/1c1c22/888?text=Sin+poster",
        backdrop: posterPath || ""
      });
      await publish(`Thêm phim: ${title}`);
    }
    resetForm();
  } catch (e) {
    showStatus(status, "err", "Lỗi: " + e.message);
  }
}

async function handleConnect(e) {
  e.preventDefault();
  const status = $("#connect-status");
  const token = $("#gh-token").value.trim();
  if (!token) return;
  showStatus(status, "info", '<span class="spinner"></span>Đang kiểm tra kết nối...');
  try {
    await GitHubClient.testConnection(token);
    setToken(token);
    showStatus(status, "ok", "✅ Đã kết nối GitHub thành công.");
    $("#gh-token").value = "";
    await refreshFromGitHub();
  } catch (err) {
    showStatus(status, "err", err.message);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  $("#connect-form").addEventListener("submit", handleConnect);
  $("#movie-form").addEventListener("submit", handleSave);
  $("#cancel-edit").addEventListener("click", resetForm);

  const owner = window.SITE_CONFIG.githubOwner;
  const repo = window.SITE_CONFIG.githubRepo;
  $("#repo-name").textContent = `${owner}/${repo}`;

  if (getToken()) {
    refreshFromGitHub();
  }
});
