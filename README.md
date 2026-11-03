# StudyFlow

Ứng dụng web quản lý công việc học tập cá nhân. Giao diện chạy trên trình duyệt,
dữ liệu được lưu bằng `localStorage`. Có thể chạy độc lập hoặc triển khai qua
Streamlit Community Cloud.

## Chạy ứng dụng

1. Mở thư mục `studyflow` trong VS Code.
2. Mở `index.html` trên trình duyệt. Nếu đã cài tiện ích Live Server, nhấn chuột phải vào `index.html` và chọn **Open with Live Server**.
3. Hoặc mở terminal tại thư mục workspace và chạy:

   ```powershell
   python -m http.server 8000 --directory studyflow
   ```

4. Truy cập <http://localhost:8000>.

Ứng dụng không cần cài thư viện ở chế độ tĩnh. Các công việc, môn học, lịch và
tên hiển thị được lưu trên trình duyệt hiện tại. Pomodoro có 25 phút học và
5 phút nghỉ.

## Triển khai Streamlit công khai

1. Tạo một repository GitHub riêng tên `studyflow` và đặt **Public**. Không
   đưa toàn bộ workspace hiện tại lên GitHub vì workspace còn chứa ứng dụng và
   dữ liệu điểm danh khác.
2. Đẩy riêng nội dung thư mục này lên repository mới.
3. Đăng nhập tại <https://share.streamlit.io/> bằng GitHub và chọn **Create app**.
4. Chọn repository vừa tạo, nhánh `main`, và tệp khởi chạy
   `streamlit_app.py` ở thư mục gốc.
5. Chọn **Deploy**. Sau khi triển khai, Streamlit cấp URL dạng
   `https://studyflow-<tên-tài-khoản>.streamlit.app`.

Tệp `streamlit_app.py` đóng gói HTML, CSS và JavaScript thành một ứng dụng
Streamlit duy nhất; giao diện và chức năng được dùng chung với phiên bản tĩnh.
