# 🎓 VHU Website - Cổng Thông Tin Điện Tử Khoa Công Nghệ Thông Tin

<p align="center">
  <img src="https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen?style=for-the-badge&logo=spring" alt="Spring Boot">
  <img src="https://img.shields.io/badge/React-19.x-blue?style=for-the-badge&logo=react" alt="React">
  <img src="https://img.shields.io/badge/Vite-7.x-646CFF?style=for-the-badge&logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/Firebase-12.x-FFCA28?style=for-the-badge&logo=firebase" alt="Firebase">
  <img src="https://img.shields.io/badge/TailwindCSS-4.x-06B6D4?style=for-the-badge&logo=tailwindcss" alt="TailwindCSS">
</p>

---

## 📋 Giới Thiệu

**VHU Website** là đồ án tốt nghiệp được xây dựng nhằm phát triển một **Cổng thông tin điện tử** toàn diện cho **Khoa Công Nghệ Thông Tin** của trường đại Công nghiệp Việt-Hung. Hệ thống cung cấp nền tảng quản lý nội dung (CMS) mạnh mẽ, hỗ trợ **đa ngôn ngữ (Tiếng Việt & Tiếng Anh)**, tích hợp các công nghệ hiện đại và đáp ứng đầy đủ nhu cầu truyền thông, quản lý thông tin học thuật của nhà trường.

Dự án được thiết kế theo kiến trúc **Monorepo**, bao gồm:
- **Backend API** (Spring Boot)
- **Frontend Client** (React - Trang người dùng)
- **Frontend Admin** (React - Trang quản trị)
- **Firebase Functions** (Serverless Functions)

---

## ✨ Tính Năng Chính

### 🌐 Trang Người Dùng (Client)

| Tính năng | Mô tả                                                                  |
|-----------|------------------------------------------------------------------------|
| **Trang chủ động** | Hiển thị slideshow, bài viết nổi bật, tin tức mới nhất                 |
| **Đa ngôn ngữ (i18n)** | Hỗ trợ chuyển đổi Tiếng Việt ↔ Tiếng Anh                               |
| **Xem bài viết chi tiết** | Hiển thị nội dung bài viết với rich text                               |
| **Tìm kiếm bài viết** | Tìm kiếm theo từ khóa, danh mục, tag                                   |
| **Lọc theo danh mục & Tag** | Phân loại nội dung theo chủ đề                                         |
| **Liên kết nhanh (Quick Access)** | Truy cập nhanh các tài nguyên quan trọng                               |
| **Đối tác & Hợp tác** | Hiển thị thông tin đối tác của nhà trường                              |
| **Real-time Chat** | Hỗ trợ tư vấn trực tuyến cho sinh viên. Công nghệ sử dụng với Firebase |

### 🛠️ Trang Quản Trị (Admin Dashboard)

| Tính năng | Mô tả                                                 |
|-----------|-------------------------------------------------------|
| **Dashboard thống kê** | Tổng quan số liệu bài viết, người dùng                |
| **Quản lý Bài viết** | CRUD bài viết với TinyMCE Editor, hỗ trợ đa ngôn ngữ  |
| **Quản lý Danh mục** | Tổ chức cấu trúc nội dung website                     |
| **Quản lý Tag** | Gắn thẻ bài viết để phân loại                         |
| **Quản lý Slide** | Cấu hình banner/slideshow trang chủ                   |
| **Quản lý Đối tác** | Quản lý logo và thông tin đối tác                     |
| **Quản lý Liên kết nhanh** | Cấu hình Quick Access Links                           |
| **Quản lý Học thuật** | Quản lý Chương trình đào tạo, Ngành học, Chuyên ngành |
| **Quản lý Người dùng** | CRUD người dùng với phân quyền                        |
| **Quản lý Vai trò (Roles)** | Phân quyền chi tiết                                   |
| **Hỗ trợ Chat Admin** | Trả lời tư vấn người dùng real-time                   |
| **Dịch tự động** | Tích hợp API dịch tự động của Google vi ↔ en          |
| **Thông báo đẩy (Push Notification)** | Tích hợp Firebase Cloud Messaging                     |

---

## 🏗️ Kiến Trúc Hệ Thống
```
VHU_WEB/
├── Backend/                          # Spring Boot REST API
│   ├── src/main/java/com/vhu/backend/
│   │   ├── config/                   # Cấu hình (Security, CORS, Firebase, ...)
│   │   ├── controller/               # REST Controllers
│   │   ├── dto/                      # Data Transfer Objects
│   │   ├── entity/                   # JPA Entities
│   │   ├── exception/                # Global Exception Handling
│   │   ├── jwt/                      # JWT Authentication
│   │   ├── repository/               # Spring Data JPA Repositories
│   │   ├── service/                  # Business Logic Services
│   │   └── utils/                    # Utility Classes
│   └── resources/                    # application.properties, Firebase config
│
├── Frontend/
│   ├── admin/                        # React Admin Dashboard
│   │   └── src/
│   │       ├── components/           # Reusable UI Components
│   │       ├── context/              # React Context (Auth, ...)
│   │       ├── hooks/                # Custom Hooks
│   │       ├── layouts/              # Layout Components
│   │       ├── pages/                # Page Components
│   │       ├── services/             # API Services (Axios)
│   │       └── utils/                # Helper Functions
│   │
│   └── client/                       # React Client Website
│       └── src/
│           ├── components/           # Reusable UI Components
│           ├── layouts/              # Layout Components
│           ├── locales/              # i18n Translation Files
│           ├── pages/                # Page Components
│           ├── services/             # API Services (Axios)
│           └── utils/                # Helper Functions
│
├── functions/                        # Firebase Cloud Functions
│   └── index.js                      # Serverless Functions
│
├── uploads/                          # Media Storage
│   ├── articles/
│   ├── partners/
│   ├── slides/
│   └── quick_access/
│
└── firebase.json                     # Firebase Configuration
```
---

## 🛠️ Công Nghệ Sử Dụng

### Backend
| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|----------|
| **Java** | 17 | Ngôn ngữ lập trình chính |
| **Spring Boot** | 3.x | Framework backend |
| **Spring Security** | - | Xác thực & Phân quyền |
| **Spring Data JPA** | - | ORM & Database Access |
| **JWT (JSON Web Token)** | - | Stateless Authentication |
| **Lombok** | - | Giảm boilerplate code |
| **Jakarta EE** | - | Enterprise Java APIs |
| **Firebase Admin SDK** | - | Push Notification |
| **AWS S3** *(optional)* | - | Cloud Storage |

### Frontend
| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|----------|
| **React** | 19.1.1 | UI Library |
| **Vite** | 7.1.2 | Build Tool & Dev Server |
| **TailwindCSS** | 4.1.13 | Utility-first CSS Framework |
| **React Router DOM** | 7.8.2 | Client-side Routing |
| **Axios** | 1.12.2 | HTTP Client |
| **i18next** | 25.5.2 | Internationalization |
| **TinyMCE React** | 6.3.0 | Rich Text Editor |
| **Firebase** | 12.3.0 | Real-time Database & Auth |
| **Framer Motion** | 12.23.12 | Animations |
| **React Hot Toast** | 2.6.0 | Notifications |
| **Lucide React** | 0.545.0 | Icons |
| **Swiper** | 11.2.10 | Carousel/Slider |
| **@hello-pangea/dnd** | 18.0.1 | Drag and Drop |

### Database & Cloud
| Công nghệ | Mục đích |
|-----------|----------|
| **MySQL** | Relational Database |
| **Firebase Realtime Database** | Real-time Chat |
| **Firebase Cloud Messaging** | Push Notifications |
| **Firebase Functions** | Serverless Backend |
| **AWS S3** | Media Storage |

---

## 🗄️ Mô Hình Dữ Liệu (Entity Relationship)

### Các Entity chính:

| Entity | Mô tả |
|--------|-------|
| `User` | Người dùng hệ thống |
| `Role` | Vai trò & Phân quyền |
| `Article` | Bài viết/Tin tức |
| `ArticleTranslation` | Bản dịch bài viết (vi/en) |
| `Category` | Danh mục bài viết |
| `CategoryTranslation` | Bản dịch danh mục |
| `Tag` | Thẻ phân loại |
| `TagTranslation` | Bản dịch thẻ |
| `Slide` | Banner/Slideshow |
| `SlideTranslation` | Bản dịch slide |
| `Partner` | Đối tác |
| `PartnerTranslation` | Bản dịch thông tin đối tác |
| `ProgramLevel` | Chương trình đào tạo (Đại học, Sau đại học, ...) |
| `Major` | Ngành học |
| `Specialization` | Chuyên ngành |
| `QuickAccessLink` | Liên kết nhanh |
| `Media` | Quản lý file media |
| `ChatConversation` | Lịch sử chat |
| `Notification` | Thông báo đẩy |

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Dự Án

### Yêu Cầu Hệ Thống

- **Java JDK**: 17+
- **Node.js**: 18+
- **npm**: 9+
- **MySQL**
- **Firebase Project** (cho Real-time & Push Notification)

### 1. Clone Repository
bash git clone [https://github.com/your-username/VHU_WEB.git](https://github.com/your-username/VHU_WEB.git) cd VHU_WEB

### 2. Cấu Hình Backend
bash cd Backend

Tạo file `src/main/resources/application.properties`:

### Database
spring.datasource.url=jdbc:mysql://localhost:3306/vhu_db 
spring.datasource.username=your_username 
spring.datasource.password=your_password 
spring.jpa.hibernate.ddl-auto=update

### JWT
jwt.secret=your-secret-key 
jwt.expiration=86400000

### Firebase (đặt file service-account.json vào resources)
firebase.credentials.path=classpath:firebase-service-account.json

### File Upload
file.upload.dir=./uploads


### Chạy Backend: 
bash ./mvnw spring-boot:run

Backend sẽ chạy tại: `http://localhost:8080`

### 3. Cấu Hình Frontend Client
bash cd Frontend/client npm install

### Chạy Client:
bash npm run dev

Client sẽ chạy tại: `http://localhost:3001`

### 4. Cấu Hình Frontend Admin
bash cd Frontend/admin npm install

### Chạy Admin:

Admin sẽ chạy tại: `http://localhost:3000`

## 📝 API Documentation

### Authentication Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/register` | Đăng ký |
| POST | `/api/auth/refresh` | Refresh token |

### Article Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/articles` | Lấy danh sách bài viết |
| GET | `/api/articles/{slug}` | Lấy chi tiết bài viết |
| POST | `/api/admin/articles` | Tạo bài viết mới |
| PUT | `/api/admin/articles/{id}` | Cập nhật bài viết |
| DELETE | `/api/admin/articles/{id}` | Xóa bài viết |

### Category, Tag, Slide, Partner Endpoints
*Tương tự với cấu trúc RESTful CRUD...*

---

## 🔐 Bảo Mật

- **JWT Authentication**: Token-based stateless authentication
- **Role-based Authorization**: Phân quyền theo vai trò (ADMIN, EDITOR, USER)
- **CORS Configuration**: Cấu hình Cross-Origin Resource Sharing
- **Input Validation**: Jakarta Bean Validation
- **Password Encryption**: BCrypt hashing

---

## 🌍 Đa Ngôn Ngữ (Internationalization)

Hệ thống hỗ trợ **đa ngôn ngữ** với:
- **Backend**: Mỗi entity có bảng Translation riêng (vi, en)
- **Frontend**: Sử dụng `i18next` với file JSON cho mỗi ngôn ngữ
- **Dịch tự động**: Tích hợp API dịch tự động từ Tiếng Việt sang Tiếng Anh

---

## 👤 Tác Giả

- **Họ và tên**: [Nguyễn Duy Khương]
- **Email**: [dkhuong.2512@gmail.com]
---

## 📄 License
Dự án này được phát triển cho mục đích học tập và là **Đồ án Tốt nghiệp**. Cảm ơn mọi người đã quan tâm tới dự án của em!

---

## 🔗 Triển Khai Lên Server thật của nhà trường (Deployment)

### Tài liệu mô tả quy trình triển khai: [https://docs.google.com/document/d/1cIRloBYsmNGPzu7_3zV7odA4wc0rwLk5jioUXszKis8/edit?usp=sharing](https://docs.google.com/document/d/1cIRloBYsmNGPzu7_3zV7odA4wc0rwLk5jioUXszKis8/edit?usp=sharing)

| **🌐 Website (Production)** | [https://aiotlab.viu.edu.vn](https://aiotlab.viu.edu.vn) | Trang người dùng công khai |
| **🔐 Admin Panel** | [https://aiotlab.viu.edu.vn/admin](https://aiotlab.viu.edu.vn/admin) | Trang quản trị (yêu cầu đăng nhập) |

> ⚠️ **Lưu ý:** Do đây là dự án chính thức của nhà trường, tài khoản quản trị **không được public** để đảm bảo an toàn bảo mật. Vui lòng liên hệ tác giả nếu cần demo tính năng quản trị.

---

## 🔮 Định Hướng Phát Triển (Roadmap)

### Giai đoạn tiếp theo

| Tính năng | Trạng thái | Mô tả |
|-----------|------------|-------|
| **WebSocket Real-time Chat** | 🔄 Đang phát triển | Thay thế Firebase Realtime bằng Spring WebSocket để cải thiện hiệu suất và kiểm soát tốt hơn |
| **Elasticsearch Integration** | 📋 Kế hoạch | Full-text search nâng cao cho bài viết |
| **Redis Caching** | 📋 Kế hoạch | Caching để tăng tốc độ truy vấn |
| **Docker Containerization** | 📋 Kế hoạch | Đóng gói ứng dụng với Docker & Docker Compose |
| **CI/CD Pipeline** | 📋 Kế hoạch | Tự động hóa build & deploy với GitHub Actions |
| **Analytics Dashboard** | 📋 Kế hoạch | Thống kê lượt xem, tương tác bài viết |
| **Email Notification** | 📋 Kế hoạch | Gửi email thông báo tự động |

### Cải tiến kỹ thuật

- [ ] Migrate từ Firebase Realtime Database sang **Spring WebSocket + STOMP** cho real-time chat
- [ ] Implement **Rate Limiting** để chống DDoS
- [ ] Thêm **API Documentation** với Swagger/OpenAPI
- [ ] Unit Tests & Integration Tests coverage > 80%
- [ ] Performance optimization với lazy loading & code splitting