# Jira Reporter for FISers

Bạn là nhân viên của FIS. Mỗi ngày bạn phải khai Jira một lần?
Mỗi tuần tối thiểu 5 tasks? Hơi mệt nhỉ?

Nhất là nếu công việc bận quá, quên mà cuối tháng mới khai thì ối dồi ôi luôn.

Thế nên mình ở đây giúp bạn việc đó.

## Hướng dẫn sử dụng

Extension này giúp bạn khai task từ Excel và tự động tạo task vào Jira.

### Thao tác chung

Mở popup của extension `TS Jira` thực hiện thao tác:

- Chọn dự án muốn khai
- Chọn component
- Chọn Phase
- Chọn TypeOfWork
- Nhập `username` của người duyệt (PM, leader, ...)

### Cách 1: nhập từ Excel

- Sao chép phần bảng excel vừa nhập
- Paste vào ô `Import task data`

![assets/excel.jpg](https://qmix-projects.web.app/images/excel.jpg)

Template này đã thiết lập sẵn cột `date` để bạn kéo thả ngày làm việc trong tháng (loại trừ thứ 7, Chủ nhật)

Bạn khai đủ số task theo ngày mong muốn, kéo từ đầu tháng đến cuối tháng nếu cần, loại bỏ một số ngày không mong muốn (ngày nghỉ, ngày đã khai, ngày cần khai dự án khác)

Mở trình duyệt Chrome (hoặc Edge, Cốc Cốc, ...)

### Cách 2: sinh tự động

- Bật Autofill
- Chọn khoảng ngày
- Loại bỏ những ngày không muốn
- Nhập mô tả cho task

### Tiếp theo

- Nhấn submit

Và chờ extension thực hiện nốt công việc.

Bạn hãy vào User -> Timesheet để xem lại kết quả khai timesheet của mình nhé ^^
