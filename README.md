<div align="center">

<img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white" />
<img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/Framer_Motion-11-EF008F?style=for-the-badge&logo=framer&logoColor=white" />
<img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
<img src="https://img.shields.io/badge/Cloudflare-Tunnel-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" />
<img src="https://img.shields.io/badge/Status-Live-22c55e?style=for-the-badge" />

<br/><br/>

<img src="https://raw.githubusercontent.com/vanphu1201/gdrive-ultra-frontend/main/public/screenshots/dashboard.png" width="80%" alt="GDrive Ultra Dashboard" />

<br/>

# 🚀 GDrive Ultra

### _Hệ thống Bypass & Đồng bộ Google Drive toàn diện_

**Nền tảng SaaS thương mại giúp vượt giới hạn tải xuống Google Drive, tự động đồng bộ đám mây và quản lý lượt tải thông minh theo thời gian thực.**

<br/>

[🌐 Xem website](https://though-definitely-seem-log.trycloudflare.com) &nbsp;·&nbsp; [📋 Tài liệu Kỹ thuật](#-kiến-trúc-hệ-thống) &nbsp;·&nbsp; [🔒 Giải pháp Bảo mật](#-bảo-mật--security)

<br/>

</div>

---

## 📌 Giới thiệu

> **🔐 Lưu ý về bảo mật mã nguồn:** Đây là dự án thương mại cá nhân đang vận hành và có doanh thu. Để bảo vệ thuật toán bypass và API nội bộ, phần **Core Backend** (Node.js/Python engine) được lưu trong **private repository** riêng biệt. Repository này chứa toàn bộ mã nguồn **Frontend** công khai để nhà tuyển dụng đánh giá năng lực kỹ thuật.

**GDrive Ultra** giải quyết một vấn đề thực tế: Google Drive giới hạn quyền tải xuống các tệp học tập, tài liệu nghiên cứu chia sẻ công cộng khi vượt quá số lượt truy cập nhất định — khiến người dùng không thể tải dù file được chia sẻ công khai.

Hệ thống tích hợp engine Python xử lý bypass đa luồng, xác thực OAuth2 an toàn, cổng thanh toán tự động và đồng bộ đám mây thời gian thực.

---

## ✨ Tính Năng Chính

<table>
<tr>
<td width="50%">

### ⚡ Bypass Engine
Vượt qua giới hạn tải xuống Google Drive bị khóa bằng engine Python đa luồng kết hợp Aria2c, hỗ trợ cả file đơn lẻ và toàn bộ thư mục.

</td>
<td width="50%">

### ☁️ Auto-Upload Đám Mây
Sau khi bypass, tệp được chuyển tiếp **trực tiếp** lên Google Drive cá nhân của người dùng — không chiếm tài nguyên ổ cứng cục bộ.

</td>
</tr>
<tr>
<td>

### 💳 Thanh Toán Tự Động
Tích hợp cổng SePay quét mã QR. Hệ thống webhook tự động nhận diện giao dịch và kích hoạt Credits trong **1-3 phút**.

</td>
<td>

### 🔐 Bảo Mật Đa Lớp
Xác thực OAuth2 Google bắt buộc khớp email đăng nhập, chống Directory Traversal, và API Key Webhook để ngăn giả mạo thanh toán.

</td>
</tr>
<tr>
<td>

### 📊 Activity Log Thời Gian Thực
Nhật ký hoạt động với bộ lọc theo loại (Tải về / Tải lên Drive / Lỗi) và trạng thái tiến trình chi tiết từng tệp.

</td>
<td>

### 👑 Gói VIP Linh Hoạt
Hệ thống phân cấp Credits với gói VIP Tuần / VIP Tháng / VIP Vĩnh Viễn, đồng bộ trạng thái theo thời gian thực trên mọi thiết bị.

</td>
</tr>
</table>

---

## 🖼️ Giao Diện

<table>
<tr>
<td align="center" width="50%">

**Dashboard — Tab Tải File**

<img src="https://raw.githubusercontent.com/vanphu1201/gdrive-ultra-frontend/main/public/screenshots/dashboard.png" width="100%" alt="Dashboard" />

</td>
<td align="center" width="50%">

**Hướng Dẫn Sử Dụng A-Z**

<img src="https://raw.githubusercontent.com/vanphu1201/gdrive-ultra-frontend/main/public/screenshots/user_guide.png" width="100%" alt="User Guide" />

</td>
</tr>
</table>

---

## 📐 Kiến Trúc Hệ Thống

```mermaid
graph TD
    subgraph Client["🌐 Client Layer"]
        B[Browser - Next.js 16]
    end

    subgraph Edge["🔶 Edge Layer"]
        CF[Cloudflare Tunnel<br/>DDoS Protection + HTTPS]
    end

    subgraph Backend["⚙️ Backend Layer - Private"]
        API[Express.js REST API<br/>TypeScript]
        PY[Python Engine<br/>Bypass + Aria2 Downloader]
        DISK[(Local SSD<br/>Temp Buffer)]
    end

    subgraph Auth["🔐 Authentication"]
        SB[(Supabase<br/>Auth + PostgreSQL)]
        GOAUTH[Google OAuth 2.0]
    end

    subgraph Cloud["☁️ Cloud Storage"]
        GD[Google Drive API<br/>Auto-Upload]
        PAY[SePay Webhook<br/>QR Payment Gateway]
    end

    B -->|HTTPS| CF
    CF -->|Reverse Proxy :3000| API
    API -->|User Session + Credits| SB
    API -->|OAuth Link Verify| GOAUTH
    API -->|Spawn Worker| PY
    PY -->|Download Buffer| DISK
    DISK -->|Stream Upload| GD
    PAY -->|API Key Webhook| API
    API -->|Credit Update| SB

    style Client fill:#1e1b4b,color:#a5b4fc
    style Edge fill:#451a03,color:#fbbf24
    style Backend fill:#0f172a,color:#94a3b8
    style Auth fill:#1c1917,color:#a8a29e
    style Cloud fill:#052e16,color:#86efac
```

---

## 🛠️ Công Nghệ Sử Dụng

### Frontend _(Repository này)_

| Công nghệ | Phiên bản | Mục đích |
|---|---|---|
| ![Next.js](https://img.shields.io/badge/Next.js-000?logo=next.js&logoColor=white) | 16 (Turbopack) | App Router, SSG, API Routes |
| ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white) | 5.x | Type-safe toàn bộ codebase |
| ![Framer Motion](https://img.shields.io/badge/Framer_Motion-EF008F?logo=framer&logoColor=white) | 11 | Segmented tabs, transition animations |
| ![Lucide](https://img.shields.io/badge/Lucide_React-f97316?logo=lucide&logoColor=white) | Latest | Icon system |
| ![Supabase](https://img.shields.io/badge/Supabase_Auth-3ECF8E?logo=supabase&logoColor=white) | 2.x | Auth client, session management |

### Backend _(Private Repository)_

| Công nghệ | Mục đích |
|---|---|
| ![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white) **Express.js + TypeScript** | REST API server |
| ![Python](https://img.shields.io/badge/Python_3-3776AB?logo=python&logoColor=white) **+ Aria2c** | Bypass engine, đa luồng downloader |
| ![Supabase](https://img.shields.io/badge/Supabase_DB-3ECF8E?logo=supabase&logoColor=white) **PostgreSQL** | User data, credits, session store |
| ![Google](https://img.shields.io/badge/Google_Drive_API-4285F4?logo=google-drive&logoColor=white) | Auto-upload tệp đã bypass |
| ![Cloudflare](https://img.shields.io/badge/Cloudflare_Tunnel-F38020?logo=cloudflare&logoColor=white) | Public HTTPS endpoint không cần server public IP |
| ![Docker](https://img.shields.io/badge/Docker_Compose-2496ED?logo=docker&logoColor=white) | Môi trường container hóa độc lập |

---

## 🔒 Bảo Mật & Security

Các lỗ hổng bảo mật tiêu biểu đã được phát hiện và xử lý trong dự án:

| # | Lỗ hổng | Giải pháp |
|---|---|---|
| 1 | **Directory Traversal** — Payload `../etc/passwd` qua download ID | Strict UUID Regex validation trước khi đọc filesystem |
| 2 | **Unauthenticated Admin Endpoint** — `/api/system/shutdown` không có auth | Xóa route, thay bằng tắt qua Docker CLI |
| 3 | **Webhook Spoofing** — Giả mạo thanh toán SePay | Header API Key (`SEPAY_API_KEY`) validation bắt buộc |
| 4 | **Drive Account Sharing Abuse** — Dùng Drive người khác để tải | Email OAuth2 callback so khớp case-insensitive với email đăng nhập |
| 5 | **Static File Exposure** — `/temp` mount public | Xóa static mount, chỉ phục vụ qua authenticated download route |

---

## 📂 Cấu Trúc Frontend

```
frontend-web/
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── page.tsx          # Dashboard chính — tabs, form, log sidebar
│   │   │   └── GuideMockups.tsx  # CSS animated mockup simulators (A-Z guide)
│   │   ├── login/
│   │   │   └── page.tsx          # Trang đăng nhập Supabase Auth
│   │   ├── admin/
│   │   │   └── page.tsx          # Trang quản trị (protected route)
│   │   ├── globals.css           # Design system tokens, custom utilities
│   │   └── layout.tsx            # Root layout, font, metadata
│   └── lib/
│       └── supabaseClient.ts     # Supabase browser client singleton
├── public/
│   └── screenshots/              # Ảnh minh họa UI
└── next.config.ts                # Next.js rewrites, env validation
```

---

## 🚀 Chạy Local (Development)

```bash
# Clone frontend repo
git clone https://github.com/vanphu1201/gdrive-ultra-frontend.git
cd gdrive-ultra-frontend

# Cài dependencies
npm install

# Tạo file môi trường
cp .env.example .env.local
# Điền NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY

# Chạy dev server
npm run dev
# → http://localhost:3000
```

> **Lưu ý**: Để sử dụng đầy đủ tính năng (bypass, download, upload Drive), cần chạy kết hợp với Backend API (private repository). Frontend hoạt động độc lập cho mục đích xem giao diện và xác thực người dùng.

---

## 📬 Liên Hệ

<div align="center">

Dự án được xây dựng và vận hành bởi **Van Phu**

[![GitHub](https://img.shields.io/badge/GitHub-vanphu1201-181717?style=for-the-badge&logo=github)](https://github.com/vanphu1201)
[![Email](https://img.shields.io/badge/Email-phu0348880746%40gmail.com-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:phu0348880746@gmail.com)

<br/>

_Nhà tuyển dụng muốn xem chi tiết mã nguồn Backend (Node.js/Python/Docker), vui lòng liên hệ qua email để được cấp quyền truy cập repository riêng tư._

</div>

---

<div align="center">
<sub>© 2025 GDrive Ultra · Built with ❤️ in Vietnam</sub>
</div>
