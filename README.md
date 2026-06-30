# CineMX — Website xem phim (phong cách Netflix 2026)

Website tĩnh, giao diện công khai bằng **tiếng Tây Ban Nha (Mexico)** dành cho
khán giả xem phim, tối ưu cho di động, chế độ tối. Trang quản trị (admin.html)
và tài liệu hướng dẫn này dùng **tiếng Việt** để bạn dễ quản lý. Khi thêm phim
mới qua trang admin, dữ liệu được đăng thẳng lên GitHub — không cần sửa code,
không cần upload tay.

## Cấu trúc thư mục

```
index.html       → Trang chủ (carousel phim, tìm kiếm, thể loại) — tiếng Tây Ban Nha
movie.html       → Trang chi tiết phim (trailer YouTube, danh sách tập, Smartlink, affiliate) — tiếng Tây Ban Nha
admin.html       → Trang quản trị để thêm/sửa/xóa phim — tiếng Việt
movies.json      → Cơ sở dữ liệu phim (trang admin tự cập nhật file này)
css/style.css    → Giao diện (tối, phong cách Netflix)
js/app.js        → Logic trang chủ
js/movie.js      → Logic trang chi tiết phim
js/admin.js      → Logic trang quản trị
js/github.js     → Client để đọc/ghi lên GitHub qua API
js/config.js     → Cấu hình chung (repo, Analytics, Smartlink, affiliate)
manifest.json, sw.js → Hỗ trợ PWA cơ bản
sitemap.xml, robots.txt → SEO cơ bản
```

## Bước 1 — Sửa file `js/config.js`

Mở `js/config.js` và thay các giá trị sau:

- `githubOwner` / `githubRepo` → tên tài khoản GitHub và tên repository bạn sẽ dùng để chứa website này.
- `gaMeasurementId` → ID Google Analytics 4 của bạn (dạng `G-XXXXXXXXXX`).
- `adsterraSmartlink` → link Smartlink Adsterra của bạn.
- `affiliateLinks` → các link affiliate bạn muốn hiển thị (có thể để nhiều link hoặc bỏ trống).

Đồng thời thay `G-XXXXXXXXXX` trong `index.html` và `movie.html` (2 dòng `gtag` ở mỗi file).

## Bước 2 — Đẩy project lên GitHub

1. Tạo một repository mới trên GitHub (public hoặc private đều được).
2. Upload toàn bộ các file/thư mục này lên nhánh `main`.

## Bước 3 — Kết nối repo với Cloudflare Pages

1. Vào dashboard Cloudflare → Pages → "Create a project" → "Connect to Git".
2. Chọn repository vừa tạo.
3. Cấu hình build:
   - **Build command:** `exit 0` (không cần build, vì đây là HTML/CSS/JS thuần)
   - **Output directory:** `/` (thư mục gốc của project)
4. Deploy. Cloudflare sẽ cho bạn một URL dạng `ten-project.pages.dev`.
5. **Quan trọng:** mỗi khi trang admin đăng một phim mới (tạo commit trên GitHub),
   Cloudflare Pages sẽ tự phát hiện thay đổi và deploy lại — bạn không cần làm
   gì thêm, chỉ vài giây là website cập nhật cho mọi người, mọi thiết bị.

## Bước 4 — Tạo token GitHub cho trang admin

Trang admin cần quyền ghi vào repository của bạn:

1. Trên GitHub: **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.
2. Chỉ cấp quyền cho **repository của website này** (không cấp toàn bộ tài khoản).
3. Trong "Repository permissions", chọn **Contents: Read and write**.
4. Tạo token và sao chép lại (dạng bắt đầu bằng `github_pat_...` hoặc `ghp_...`).
5. Mở `tenwebsite.pages.dev/admin.html`, dán token vào ô "Kết nối với GitHub" và bấm Kết nối.

Token chỉ được lưu trong trình duyệt của bạn (localStorage), không gửi đi đâu khác.
Nhưng ai có token này cũng có thể sửa repository của bạn, nên hãy giữ kín token và
không chia sẻ công khai link trang admin (file `robots.txt` đã chặn không cho
`admin.html` xuất hiện trên Google).

## Bước 5 — Thêm phim mới

1. Mở `admin.html` (nếu đã kết nối token trước đó, hệ thống tự nhớ).
2. Điền thông tin: tiêu đề, mô tả, thể loại, YouTube ID, đánh giá, danh sách tập,
   và poster (tải ảnh lên hoặc dán URL ảnh).
3. Bấm **"Lưu và đăng lên web"**.
4. Hệ thống sẽ tạo một commit mới trên GitHub. Cloudflare Pages tự deploy lại
   trong vài giây, và phim mới xuất hiện trên website cho tất cả mọi người,
   ở mọi thiết bị — không cần sửa code.

## Lưu ý

- **YouTube ID** là phần cuối của URL video, ví dụ với link
  `https://www.youtube.com/watch?v=dQw4w9WgXcQ` thì ID là `dQw4w9WgXcQ`.
- Nếu tải poster bằng file ảnh, ảnh sẽ được lưu vào thư mục `posters/` trong repo.
- File `movies.json` hiện có 11 phim mẫu (6 phim demo ban đầu + 5 phim "Romance CEO"
  bạn vừa cung cấp link YouTube). Poster của 5 phim mới đang dùng ảnh placeholder —
  bạn nên vào trang admin để sửa lại bằng poster thật (tải ảnh lên hoặc dán URL ảnh thật).
- Nội dung hiển thị công khai (tiêu đề, mô tả, nút bấm...) trên `index.html` và
  `movie.html` nên giữ bằng **tiếng Tây Ban Nha** vì đó là ngôn ngữ của khán giả xem phim.
  Khi thêm phim mới qua trang admin, hãy nhập tiêu đề/mô tả bằng tiếng Tây Ban Nha.
- Thường xuyên kiểm tra Smartlink Adsterra và các link affiliate còn hoạt động hay không.
