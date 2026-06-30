// config.js — Cấu hình trung tâm của website.
// Bạn chỉ cần sửa các giá trị này MỘT LẦN; không cần đụng vào phần code khác.
window.SITE_CONFIG = {
  // --- GitHub (để trang admin có thể đăng phim mới lên web) ---
  githubOwner: "TEN-TAI-KHOAN-GITHUB",   // ví dụ: "nguyenvana"
  githubRepo: "TEN-REPOSITORY",          // ví dụ: "netflix-mini"
  githubBranch: "main",

  // --- Google Analytics ---
  gaMeasurementId: "G-XXXXXXXXXX",

  // --- Smartlink Adsterra ---
  // Dán URL Smartlink đầy đủ của Adsterra vào đây.
  adsterraSmartlink: "https://example.com/smartlink-id",

  // --- Liên kết Affiliate ---
  // Danh sách link affiliate hiển thị bên dưới trailer.
  affiliateLinks: [
    { label: "Audífonos recomendados", url: "https://example.com/afiliado-1" },
    { label: "Suscripción VPN", url: "https://example.com/afiliado-2" }
  ],

  siteName: "CineMX"
};
