// github.js — Client nhỏ để đọc/ghi movies.json và poster
// trực tiếp lên GitHub bằng GitHub Contents API.
// Nhờ vậy nút "Lưu và đăng lên web" sẽ cập nhật website ngay
// (Cloudflare Pages sẽ tự deploy lại) mà không cần sửa code.

const GitHubClient = (() => {
  const API = "https://api.github.com";

  function authHeaders(token) {
    return {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json"
    };
  }

  function repoPath() {
    const { githubOwner, githubRepo } = window.SITE_CONFIG;
    return `${githubOwner}/${githubRepo}`;
  }

  // Chuyển ArrayBuffer/Blob sang base64 (cần khi tải ảnh lên).
  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Lấy một file từ repo. Trả về { content, sha } hoặc null nếu không tồn tại.
  async function getFile(token, path) {
    const res = await fetch(
      `${API}/repos/${repoPath()}/contents/${path}?ref=${window.SITE_CONFIG.githubBranch}`,
      { headers: authHeaders(token) }
    );
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Lỗi khi đọc ${path}: ${res.status}`);
    const data = await res.json();
    return { content: atob(data.content.replace(/\n/g, "")), sha: data.sha };
  }

  // Tạo mới hoặc cập nhật một file văn bản (ví dụ movies.json).
  async function putTextFile(token, path, textContent, message, sha) {
    const body = {
      message,
      content: btoa(unescape(encodeURIComponent(textContent))),
      branch: window.SITE_CONFIG.githubBranch
    };
    if (sha) body.sha = sha;
    const res = await fetch(`${API}/repos/${repoPath()}/contents/${path}`, {
      method: "PUT",
      headers: { ...authHeaders(token), "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Lỗi khi lưu ${path}`);
    }
    return res.json();
  }

  // Tải một ảnh (File) lên và trả về đường dẫn đã lưu trong repo.
  async function putImageFile(token, file) {
    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
    const path = `posters/${safeName}`;
    const base64 = await blobToBase64(file);
    const res = await fetch(`${API}/repos/${repoPath()}/contents/${path}`, {
      method: "PUT",
      headers: { ...authHeaders(token), "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `Tải poster ${safeName}`,
        content: base64,
        branch: window.SITE_CONFIG.githubBranch
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Lỗi khi tải ảnh lên");
    }
    return path;
  }

  // Kiểm tra token và repo có hợp lệ không.
  async function testConnection(token) {
    const res = await fetch(`${API}/repos/${repoPath()}`, { headers: authHeaders(token) });
    if (!res.ok) throw new Error("Không thể kết nối tới repository. Hãy kiểm tra lại token và tên repo.");
    return res.json();
  }

  return { getFile, putTextFile, putImageFile, testConnection };
})();
