# FIS Jira Automation

Công cụ tự động khai Jira cho nhân viên FIS.

## Tính năng

### Tạo task từ Excel


Bạn có thể tạo task từ file Excel theo ngày. Tính năng này giúp bạn:
- Nhanh chóng tạo đủ task cho cả tháng.
- Có cái nhìn tổng quan về task theo ngày / tuần để khai cho đúng.
- File excel đã chứa công thức tính ngày, chỉ việc điền ngày đầu tiên trong đợt khai và kéo xuống cho đủ số task trong tháng. Sau đó xóa các dòng ngày nghỉ / đã khai.


### Tạo task tự động theo mô tả có sẵn


Bạn có thể điền một nội dung mô tả duy nhất để khai cho các ngày đã chọn. Tính năng này hỗ trợ loại bỏ các ngày nghỉ / đã khai, ... bằng cách chọn các ngày loại bỏ.


### Tìm kiếm tên dự án

Nhanh chóng tìm kiếm tên dự án để khai, không cần phải đi vào từng dự án. Tuy nhiên mỗi lần tạo form bạn chỉ khai được cho một dự án với một component cụ thể.


## Đăng ký sử dụng

Ứng dụng quản lý theo license cho từng tài khoản FPT. Vui lòng liên hệ admin để được cấp license.

## Hướng dẫn sử dụng

### Thao tác chung

Mở trang Jira của FIS [[https://jira.fis.com.vn](https://jira.fis.com.vn)] ra và nhấn nút "Create tasks" trên header.

- Chọn dự án muốn khai
- Chọn component
- Chọn Phase
- Chọn TypeOfWork
- Nhập `username` của người duyệt (PM, leader, ...).

### Cách 1: nhập từ Excel


- Sao chép phần bảng excel vừa nhập
- Paste vào ô `Import task data`

    ![assets/excel.jpg](https://qmix-projects.web.app/images/excel.jpg)

Template này đã thiết lập sẵn cột `date` để bạn kéo thả ngày làm việc trong tháng (loại trừ thứ 7, Chủ nhật).

Bạn khai đủ số task theo ngày mong muốn, kéo từ đầu tháng đến cuối tháng nếu cần, loại bỏ một số ngày không mong muốn (ngày nghỉ, ngày đã khai, ngày cần khai dự án khác)

Mở trình duyệt Chrome (hoặc Edge, Cốc Cốc, ...)

### Cách 2: sinh tự động

- Bật **Auto fill**
- Chọn khoảng ngày
- Loại bỏ những ngày không muốn
- Nhập mô tả cho task

### Tiếp theo

- Nhấn submit để tạo task dựa trên dữ liệu đã nhập

Và chờ extension thực hiện nốt công việc.

Bạn hãy vào User -> Timesheet để xem lại kết quả khai timesheet của mình nhé ^^

### Lưu ý quan trọng

- Bạn chỉ copy phần data, không copy header
- Bạn cần xóa dòng trắng trong nội dung sau khi paste vào ô tasks
- Nội dung task cần được nằm trên một dòng, không xuống dòng.
- Mỗi lần khai chỉ chọn 1 component.
- Nếu bạn cần khai task cho nhiều component, chia ra thành nhiều lần khai.
