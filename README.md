# Electro Bear

Trang giới thiệu kiến thức đầu tư crypto với cảnh 3D, hai mã QR Binance và các mục học tập, giải trí, tài nguyên miễn phí.

## Chạy trên máy

Cần Python 3 và kết nối Internet để tải Three.js cùng font chữ từ CDN.

```powershell
python -m http.server 8000
```

Mở <http://localhost:8000>.

## Đưa source lên GitHub

Tạo repository mới trên GitHub, rồi chạy các lệnh sau tại thư mục dự án. Thay `<username>` và `<repository>` bằng thông tin repository của bạn.

```powershell
git init
git add .
git commit -m "Initial Electro Bear site"
git branch -M main
git remote add origin https://github.com/<username>/<repository>.git
git push -u origin main
```

`node_modules`, thư mục build và file môi trường được loại khỏi Git bởi `.gitignore`.

## Xuất bản bằng GitHub Pages

Workflow tại `.github/workflows/deploy-pages.yml` tự triển khai trang mỗi khi có commit lên nhánh `main`. Trong repository, vào **Settings → Pages → Build and deployment**, chọn **GitHub Actions** làm Source. Sau khi workflow hoàn tất, URL trang sẽ hiện trong phần Pages và trong mục Deployments.

Trang dùng Three.js và Google Fonts từ CDN nên cần kết nối Internet khi xem.