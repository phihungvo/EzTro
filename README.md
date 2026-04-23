# 🏠 EZ_TRO – Hệ thống quản lý cho thuê trọ

**EZ_TRO** là một hệ thống quản lý cho thuê trọ được xây dựng trên nền tảng **Spring Boot** (backend) và **ReactJS** (frontend).  
Dự án hướng đến mục tiêu giúp **chủ trọ và người thuê trọ** dễ dàng quản lý, đăng tin và tìm kiếm phòng trọ một cách nhanh chóng, hiện đại và tiện lợi.

---

## ⚙️ Kiến trúc hệ thống

EZ_TRO bao gồm **hai thành phần chính**:

### 1. 🧩 API – `ez_tro_api`
Cung cấp các RESTful API phục vụ cho toàn bộ hệ thống.

**Chức năng chính:**
- Quản lý người dùng, đăng nhập / phân quyền (Authentication & Authorization)
- Quản lý bài viết, phòng trọ, khu vực
- Quản lý tin tức và nội dung CMS
- Quản lý dữ liệu hệ thống (CRUD API)

> 💡 Định dạng code (format code) với Spotless:
```bash
mvn spotless:apply
```
or
```sql
mvn spotless:check
```

### 2. 💻 APP – `ez_tro_app`

- Ứng dụng web frontend cung cấp giao diện trực quan cho người dùng tương tác với hệ thống CMS.

**Chức năng chính:**

- **Đăng nhập, đăng ký, phân quyền theo vai trò**

- **Giao diện quản lý bài viết, phòng trọ, người dùng**

- **Hiển thị danh sách, chi tiết và tìm kiếm phòng trọ**

- **Tích hợp API từ backend**
