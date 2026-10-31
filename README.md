# EduSmart - Hệ Thống Quản Lý Lớp Học Thông Minh

Hệ thống quản lý lớp học số (Smart Classroom Management Web App) phục vụ toàn diện 4 vai trò: **Admin, Giáo viên, Học sinh và Phụ huynh**.

---

## 1. Tài khoản kiểm thử (4 Roles Test Accounts)

| Vai trò | Email | Mật khẩu | Họ và tên | Ngữ cảnh nghiệp vụ |
| :--- | :--- | :--- | :--- | :--- |
| **Giáo viên (Teacher)** | `teacher@edusmart.edu.vn` | `teacher123` | Thầy Nguyễn Văn Hùng | GVCN & Giảng dạy môn Toán Lớp 9A1 |
| **Học sinh (Student)** | `student@edusmart.edu.vn` | `student123` | Nguyễn Minh Khôi | Lớp trưởng 9A1 (HS-9A1-01) |
| **Phụ huynh (Parent)** | `parent@edusmart.edu.vn` | `parent123` | Nguyễn Văn Đức | Phụ huynh 2 con: Minh Khôi (9A1) & Minh Thư (8B1) |
| **Quản trị viên (Admin)** | `admin@edusmart.edu.vn` | `admin123` | ThS. Nguyễn Hoàng Nam | Quản trị trường THCS Trưng Vương |

> **Lưu ý tiện ích**: Trên thanh điều hướng (Top Bar) và màn hình Đăng nhập đều có thanh **1-Click Quick Role Switcher** giúp chuyển đổi tức thì giữa 4 vai trò để kiểm thử và đánh giá trải nghiệm người dùng nhanh chóng.

---

## 2. Cấu trúc thư mục dự án (Folder Structure)

```
├── index.html                           # HTML entry point với metadata & typography Plus Jakarta Sans
├── metadata.json                        # Applet metadata
├── package.json                         # Dependencies & scripts
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql       # Toàn bộ SQL schema DDL, RLS, Indexes cho Supabase/PostgreSQL
├── src/
│   ├── types/
│   │   └── index.ts                     # TypeScript Type Definitions & Enums cho 4 vai trò
│   ├── services/
│   │   ├── mockData.ts                  # Dữ liệu seed chuẩn Việt Nam: trường, năm học, môn, 3 lớp, 30 HS/lớp
│   │   └── db.ts                        # Service Abstraction Layer mô phỏng Supabase DB, Audit Logs, Event Bus
│   ├── context/
│   │   ├── AuthContext.tsx              # Quản lý phiên, 4 roles, lưu trữ session, context lớp/con cái
│   │   ├── ToastContext.tsx             # Hệ thống thông báo Toast (Success, Error, Warning, Info)
│   │   └── ConfirmContext.tsx           # Hộp thoại xác nhận (Confirm Dialog) an toàn cho thao tác nguy hiểm
│   ├── components/
│   │   └── layout/
│   │       ├── AppShell.tsx             # Responsive Top Bar, Sidebar theo vai trò, Context selector
│   │       ├── RoleGuard.tsx            # Bảo vệ URL/Route theo quyền (RBAC) trả về 403 Forbidden
│   │       └── GlobalSearchModal.tsx    # Tìm kiếm toàn hệ thống Ctrl+K (Lớp, HS, Bài tập, Thông báo)
│   ├── pages/
│   │   ├── public/                      # Login, 403 Forbidden, 404 Not Found
│   │   ├── teacher/                     # Dashboard, Danh sách lớp, Chi tiết lớp, Học sinh, Import Wizard,
│   │   │                                # 360° Profile, Điểm danh, Sổ điểm điện tử, Bài tập, Công cụ lớp học,
│   │   │                                # Cảnh báo thông minh, Thông báo, Thời khóa biểu, Báo cáo
│   │   ├── student/                     # Dashboard, Bài tập & Nộp bài, Bảng điểm cá nhân, Chuyên cần, Huy hiệu
│   │   ├── parent/                      # Dashboard con cái, Child Switcher, Sổ liên lạc GV-PH, Hồ sơ con
│   │   └── admin/                       # Dashboard trường, Quản trị lớp, Quản lý tài khoản, Audit Logs, Cài đặt
│   ├── App.tsx                          # Cấu hình định tuyến React Router v6 & Role Guards
│   ├── main.tsx                         # React entry point
│   └── index.css                        # Tailwind CSS styles & typography
```

---

## 3. Kiến trúc Cơ sở dữ liệu & Supabase RLS

Tệp `supabase/migrations/001_initial_schema.sql` đã thiết kế đầy đủ các bảng dữ liệu theo chuẩn quan hệ:
- **Người dùng & Trường học**: `profiles`, `schools`, `school_memberships`.
- **Khung học tập**: `academic_years`, `grade_levels`, `subjects`, `classes`, `class_teachers`.
- **Học sinh & Phụ huynh**: `students`, `guardians`, `student_guardians`, `class_students`.
- **Thời khóa biểu & Điểm danh**: `schedules`, `attendance_sessions`, `attendance_records`.
- **Bài tập & Chấm điểm**: `assignments`, `submissions`.
- **Sổ điểm & Kiểm toán**: `grade_categories`, `grade_items`, `grades`, `grade_audit_logs`.
- **Rèn luyện & Cảnh báo thông minh**: `behavior_records`, `rewards`, `alerts` (quy trình 4 bước).
- **Truyền thông & Nhật ký**: `announcements`, `notifications`, `audit_logs`.
- **Row Level Security (RLS)**: Đảm bảo giáo viên chỉ truy cập phạm vi lớp được giao, học sinh chỉ xem dữ liệu của mình, phụ huynh chỉ xem con liên kết và admin toàn quyền.

---

## 4. Các tính năng nổi bật theo 4 Phase

### Phase 1 - Khung vận hành cốt lõi:
- **Đăng nhập & RBAC**: Hỗ trợ đầy đủ 4 vai trò, tự động điều hướng về portal tương ứng, kiểm tra bảo mật RoleGuard ngăn chặn truy cập trái quyền (403).
- **Teacher Dashboard**: 4 KPI cốt lõi (Sĩ số, Có mặt, Vắng, Đi trễ), lịch dạy hôm nay, bài tập cần chấm, cảnh báo học sinh.
- **Quản lý lớp học**: CRUD lớp, sao chép lớp (Duplicate), lưu trữ (Archive), mã tham gia lớp (Join code) có nút sao chép 1-click.
- **Chi tiết lớp học**: Header gắn liền mã lớp, sub-tabs Tổng quan, Roster học sinh, Thời khóa biểu, Báo cáo; tự động giữ ngữ cảnh `selectedClassId`.

### Phase 2 - Học sinh & Chuyên cần:
- **Danh sách học sinh**: Bảng thông tin đầy đủ, tìm kiếm thời gian thực, lọc theo lớp/giới tính, xuất CSV.
- **Import Wizard**: Quy trình 5 bước tải file mẫu → tải lên / dán CSV → kiểm tra & báo lỗi chi tiết theo dòng và cột → xác nhận nhập.
- **Hồ sơ 360° học sinh**: 4 chỉ số tổng quan (ĐTB, Chuyên cần, Bài tập, Khen thưởng) cùng 7 tabs chi tiết: Điểm số, Chuyên cần, Bài tập đã nộp, Nhật ký hành vi, Huy hiệu danh dự, Cảnh báo, Thông tin phụ huynh.
- **Điểm danh thông minh**: Thanh ngữ cảnh Lớp - Ngày - Tiết, tóm tắt chỉ số, nút "Đánh dấu tất cả có mặt", 5 trạng thái (Có mặt, Có phép, Không phép, Đi trễ, Về sớm), ghi chú lý do, thanh lưu dính (Sticky Save) và cảnh báo khi rời trang chưa lưu.

### Phase 3 - Dạy học & Phân tích:
- **Bài tập & Chấm điểm**: Giao bài tập kèm hạn nộp và file đính kèm; giao diện chấm bài song song xem bài nộp, cho điểm và nhận xét của giáo viên.
- **Sổ điểm điện tử (Gradebook)**: Giao diện spreadsheet với sticky header và sticky cột đầu (STT + Tên HS); tự động tính ĐTB môn có trọng số hệ số; lưu hàng loạt (Batch save); modal tra cứu **Lịch sử sửa điểm** (ai sửa, lúc nào, điểm cũ -> điểm mới, lý do); xuất CSV.
- **Công cụ lớp học (Class Tool Hub)**:
  - **Vòng quay may mắn (Wheel of Fortune)**: Vẽ canvas/SVG, hoạt ảnh xoay mượt mà, hiệu ứng pháo hoa Confetti khi trúng thưởng.
  - **Chọn ngẫu nhiên (Random Picker)**: Hoạt ảnh chọn ngẫu nhiên học sinh, hỗ trợ **Chế độ tránh gọi lặp**.
  - **Chia nhóm học tập (Group Generator)**: Chia nhanh số nhóm tùy chọn (2, 3, 4, 5, 6, 8 nhóm).
  - **Đồng hồ đếm giờ (Timer)**: Màn hình điện tử cỡ lớn, preset 1-15 phút, chuông báo khi hết giờ.
  - **Chế độ toàn màn hình máy chiếu (Fullscreen)**: Tối ưu cho màn hình lớp học và máy chiếu tương tác.
- **Cảnh báo thông minh**: Quản lý quy trình 4 giai đoạn: *Mới* → *Đã xem* → *Đang xử lý* → *Đã giải quyết* kèm ghi chú khắc phục.
- **Báo cáo & Thống kê**: Phổ điểm xếp loại Giỏi/Khá/TB/Yếu, biểu đồ phân bổ trực quan, hỗ trợ In và xuất file.

### Phase 4 - Các cổng người dùng:
- **Student Portal**: Tổng quan kết quả học tập cá nhân, thời khóa biểu, nộp bài tập trực tuyến kèm lời nhắn, bảng điểm thành phần, bảng vinh danh huy hiệu.
- **Parent Portal**: Tích hợp **Child Switcher** chuyển đổi giữa các con (Minh Khôi 9A1 & Minh Thư 8B1), theo dõi điểm danh hôm nay của con, kết quả học tập, thông báo nhà trường, **Sổ liên lạc điện tử** trao đổi trực tiếp 2 chiều với GVCN.
- **Admin Portal**: Quản trị toàn trường, khối lớp, quản lý tài khoản & phân quyền người dùng, tra cứu nhật ký kiểm toán (Audit Logs), xuất file sao lưu dữ liệu toàn hệ thống JSON và khôi phục dữ liệu ban đầu.

---

## 5. Hướng dẫn Chạy & Triển khai

### Chạy Local Development:
```bash
# Cài đặt thư viện
npm install

# Khởi chạy dev server (Port 3000)
npm run dev
```

### Kiểm tra Build & Lint:
```bash
npm run lint
npm run build
```
Dự án được cấu hình sẵn tương thích Vite React SPA, sẵn sàng triển khai lên Vercel, Netlify hoặc Docker container.
