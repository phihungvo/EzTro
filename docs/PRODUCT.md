# Tổng quan sản phẩm

## Mô tả sản phẩm

Hệ thống này là một **nền tảng quản lý nhà trọ / bất động sản cho thuê**, tích hợp cả **cổng dành cho người thuê (tenant portal)**.

Hệ thống được thiết kế cho:

- **Chủ trọ / chủ nhà** quản lý một hoặc nhiều khu trọ (boarding house), tòa nhà (building) và phòng (room).
- **Quản trị viên (Admin)** giám sát chủ trọ, gói đăng ký, cấu hình hệ thống và dữ liệu toàn hệ thống.
- **Người thuê (Tenant / User)** đang thuê phòng và tương tác với chủ trọ thông qua hệ thống.

Backend (Spring Boot) cung cấp REST API để quản lý tài sản, hợp đồng, hóa đơn, dịch vụ tiện ích, chỉ số công tơ, sự cố, thông báo, gói đăng ký và thanh toán.  
Frontend (React) cung cấp các dashboard và luồng thao tác cho từng vai trò: Admin, Owner và User.

Tóm lại, sản phẩm giúp chủ trọ và admin **số hóa toàn bộ vòng đời cho thuê phòng**: từ quản lý phòng và hợp đồng, tạo hóa đơn hàng tháng, theo dõi thanh toán, xử lý sự cố bảo trì, cho đến theo dõi doanh thu và chi phí vận hành.

## Đối tượng người dùng

Dựa trên roles, controllers và routing, hệ thống hiện hỗ trợ:

- **ADMIN**
  - Quản lý chủ trọ, người dùng, role & permission.
  - Quản lý cấu hình toàn hệ thống (khu trọ, tòa nhà, dịch vụ tiện ích, tiện nghi, gói đăng ký).
  - Theo dõi doanh thu, thanh toán và tình trạng hệ thống.
- **OWNER (Chủ trọ)**
  - Sở hữu một hoặc nhiều khu trọ và tòa nhà.
  - Quản lý phòng, khách thuê, hợp đồng, hóa đơn, chi phí vận hành, báo cáo sự cố và lịch hẹn.
  - Đăng ký gói dịch vụ và bị giới hạn tài nguyên (ví dụ: số phòng tối đa).
- **USER (Tenant / Người thuê)**
  - Người đang thuê phòng của một chủ trọ.
  - Xem thông tin phòng đang thuê, hóa đơn, báo cáo sự cố; gửi thêm các yêu cầu/sự cố mới.

Các role này được mã hóa trong JWT token và được dùng ở frontend (`AuthContext`) và backend (`SecurityUtils`) để kiểm soát quyền truy cập các đường dẫn như `/api/user/...` và các route `/admin`, `/owner`.

## Các module lõi

Từ codebase, các module nghiệp vụ chính gồm:

- **Người dùng & Xác thực (User & Authentication)**
  - Đăng nhập, đăng ký, xác thực dựa trên JWT.
  - Quản lý role (`ADMIN`, `OWNER`, `USER`) và permissions.
  - Thông tin và giới hạn tài nguyên riêng cho Owner.

- **Khu trọ & Tòa nhà (Boarding Houses & Buildings)**
  - Mô hình hóa cấu trúc vật lý của hệ thống cho thuê.
  - Entity chính: `BoardingHouse`, `Building`, `Room`.
  - Admin/Owner có thể tạo, cập nhật và quản lý các cấu trúc này.

- **Phòng & Dịch vụ tiện ích (Rooms & Utilities)**
  - Mỗi phòng thuộc một tòa nhà và một khu trọ.
  - Mỗi phòng có thể gắn các tiện ích/dịch vụ (qua `RoomUtility`), ví dụ điện, nước, dịch vụ tính theo chỉ số.
  - Trạng thái phòng (AVAILABLE, RENTED,...) và filter theo trạng thái, diện tích, giá, hợp đồng, v.v.

- **Khách thuê & Hợp đồng (Tenants & Contracts)**
  - Tenant là người đang/thường trú trong phòng.
  - Contract liên kết tenant với một phòng, gồm giá thuê, tiền cọc, thời hạn, dịch vụ đi kèm.
  - Có các rule validation cho hợp đồng đang hiệu lực (chỉ 1 hợp đồng active mỗi phòng, ngày bắt đầu/kết thúc hợp lệ, quy tắc về tiền cọc, chu kỳ thanh toán,...).

- **Hóa đơn & Thanh toán (Billing & Payments)**
  - Hóa đơn cho từng phòng theo tháng/năm, bao gồm tiền thuê, tiện ích, phụ phí.
  - Owner và Tenant có view riêng để xem hóa đơn (`/api/bills`, `/api/user/bills`).
  - Hỗ trợ filter hóa đơn và theo dõi trạng thái; có sẵn hook để tích hợp với thanh toán sau này.

- **Chỉ số công tơ & Sử dụng tiện ích (Meter Readings & Utilities Usage)**
  - Lưu lại chỉ số công tơ hàng tháng (điện, nước, các tiện ích tính theo chỉ số).
  - Quản lý kỳ đọc số (DRAFT / CONFIRMED / LOCKED) và ràng buộc chỉnh sửa.
  - Sử dụng các chỉ số này để tính tiền dịch vụ sử dụng trong hóa đơn.

- **Báo cáo sự cố & Yêu cầu (Incidents & Requests)**
  - Tenant có thể gửi báo cáo sự cố (incident reports).
  - Owner/Admin xử lý, cập nhật trạng thái và giải quyết các sự cố này.

- **Gói đăng ký & Giới hạn tài nguyên (Subscriptions & Resource Limits)**
  - Quản lý gói đăng ký (subscription plans) và subscription của Owner.
  - Giới hạn tài nguyên (ví dụ: số phòng tối đa) được enforce khi Owner tạo mới tài nguyên.

- **Thông báo & Realtime (Notifications & Real-Time)**
  - API thông báo cho user (lấy danh sách, đánh dấu đã đọc, đếm thông báo chưa đọc).
  - Cấu hình WebSocket/STOMP để đẩy thông báo real-time tới client.

- **Báo cáo & Thống kê (Reporting & Analytics)**
  - Theo dõi doanh thu, dashboard cho Admin/Owner (tổng quan, biểu đồ).
  - Theo dõi chi phí vận hành và quản lý thanh toán.

## Quy trình nghiệp vụ

Ở mức cao, các luồng nghiệp vụ chính như sau:

1. **Khởi tạo hệ thống (Admin)**
   - Admin đăng nhập vào portal admin.
   - Tạo và quản lý **chủ trọ (owners)**, **vai trò (roles)** và **quyền (permissions)**.
   - Cấu hình các thực thể toàn hệ thống như **gói đăng ký**, **dịch vụ tiện ích**, **tiện nghi (amenities)**.

2. **Onboarding chủ trọ & Thiết lập cấu trúc**
   - Owner đăng nhập vào portal dành cho chủ trọ.
   - Khai báo **khu trọ** và **tòa nhà** của mình.
   - Tạo **phòng** trong từng tòa nhà, thiết lập diện tích, tầng, giá, tiện ích/tiện nghi mặc định.
   - Bị giới hạn bởi resource limit (ví dụ: số phòng tối đa theo gói đăng ký).

3. **Quản lý khách thuê & Hợp đồng**
   - Owner tạo mới hoặc nhập **tenant**.
   - Owner tạo **hợp đồng thuê** gắn tenant với một phòng, bao gồm:
     - Ngày bắt đầu/kết thúc, giá thuê, tiền cọc, chu kỳ thanh toán.
     - Các dịch vụ/tiện ích đi kèm.
   - Hệ thống enforce các rule (ví dụ: chỉ 1 hợp đồng active trên 1 phòng, ngày hợp lệ,...).

4. **Chốt chỉ số & Lập hóa đơn hàng tháng**
   - Mỗi kỳ thanh toán:
     - Owner (hoặc job chạy tự động) tạo **kỳ đọc chỉ số (meter reading period)**.
     - Ghi nhận chỉ số công tơ cho từng phòng và từng tiện ích.
     - Sinh hóa đơn dựa trên:
       - Giá thuê theo hợp đồng.
       - Các tiện ích tính theo chỉ số (điện, nước,...).
       - Các khoản phí/giảm giá bổ sung (nếu có).
   - Hóa đơn được lưu và expose qua API cho Admin/Owner/Tenant.

5. **Sử dụng cổng người thuê (Tenant Portal)**

   - Tenant đăng nhập vào portal user.
   - Có thể:
     - Xem **phòng đang thuê** và thông tin hợp đồng liên quan.
     - Xem **hóa đơn hiện tại và lịch sử** (`/user/bills`, `/user/bills/paged`).
     - Gửi và quản lý **báo cáo sự cố** liên quan đến phòng hoặc tòa nhà.

6. **Vận hành & Giám sát của Owner**
   - Owner sử dụng dashboard để:
     - Xem tổng quan phòng (còn trống / đang thuê, theo tòa nhà/khu trọ).
     - Theo dõi **doanh thu** theo thời gian.
     - Quản lý **chi phí vận hành** và **tài sản (assets)**.
     - Xử lý **lịch hẹn** và **báo cáo sự cố** từ tenant.
   - Owner có thể xuất dữ liệu (ví dụ: Excel) và xem thông báo.

7. **Giám sát của Admin**
   - Admin theo dõi:
     - **Doanh thu tổng thể** và các metric hệ thống.
     - **Chủ trọ** và tình trạng gói đăng ký của họ.
     - Thông báo và sự cố ở mức toàn hệ thống.
   - Admin có thể can thiệp các trường hợp đặc biệt thông qua API và màn hình dành riêng cho admin.

## Tính năng chính

Dựa trên code, các tính năng nổi bật nhất gồm:

- **Hỗ trợ nhiều vai trò (Admin / Owner / User)** với routing và namespace API theo role (`/admin`, `/owner`, `/user`, `/api/user/...`).
- **Quản lý khu trọ & tòa nhà**: mô hình hóa cấu trúc tài sản nhiều tầng (khu trọ → tòa nhà → phòng).
- **Quản lý inventory phòng**:
  - Tạo, cập nhật, xóa phòng với các thuộc tính (diện tích, tầng, giá, trạng thái).
  - Filter phòng theo text search, trạng thái, khu trọ, diện tích, giá, hợp đồng đang active, v.v.
  - Lấy danh sách phòng theo khu trọ hoặc theo tòa nhà.
- **Vòng đời tenant & hợp đồng**:
  - Tạo tenant và quản lý thông tin cá nhân.
  - Tạo và quản lý hợp đồng thuê với validation chặt chẽ (ngày, giá, cọc).
  - Đảm bảo mỗi phòng chỉ có một hợp đồng active tại một thời điểm.
- **Engine lập hóa đơn**:
  - Sinh hóa đơn hàng tháng cho từng phòng với breakdown chi tiết.
  - Hỗ trợ giảm giá, khoản phụ thu và nhiều mô hình tính tiền tiện ích.
  - View hóa đơn riêng cho Owner và Tenant, có filter và phân trang.
- **Theo dõi chỉ số & sử dụng tiện ích**:
  - Ghi nhận chỉ số theo kỳ cho từng tiện ích và phòng.
  - Rule ngăn trùng lặp chỉ số và đảm bảo giá trị tăng dần.
  - Tích hợp với module hóa đơn để tính chính xác tiền sử dụng.
- **Báo cáo sự cố & xử lý**:
  - Tenant gửi báo cáo sự cố.
  - Owner/Admin theo dõi, cập nhật trạng thái và đóng sự cố.
- **Gói đăng ký & giới hạn tài nguyên**:
  - Mỗi Owner có subscription quy định khả năng sử dụng (ví dụ: số phòng tối đa).
  - Hệ thống enforce limit khi Owner tạo mới tài nguyên (phòng, v.v.).
- **Thông báo & realtime**:
  - Hệ thống thông báo với API lấy danh sách, đánh dấu đã đọc, đếm chưa đọc.
  - WebSocket/STOMP để push sự kiện realtime tới client.
- **Dashboard & thống kê**:
  - Dashboard cho Admin và Owner với các chỉ số quan trọng (phòng, doanh thu, hóa đơn, sự cố).
  - Biểu đồ/thống kê được render phía frontend bằng các thư viện chart.

Tổng thể, các tính năng này tạo thành một giải pháp trọn gói cho **quản lý nhà trọ/bất động sản cho thuê ở quy mô lớn**, hỗ trợ cả vận hành hàng ngày (phòng, tenant, hóa đơn, sự cố) lẫn giám sát cấp cao (doanh thu, chi phí, gói đăng ký, thông báo).

