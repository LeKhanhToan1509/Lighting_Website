
## Mục lục
- [1, Cấu trúc thư mục và file](#cấu-trúc-thư-mục-và-file)
- [2, Các package thường sử dụng](#các-package-thường-sử-dụng)
- [3, Connect Database thế nào cho hay ?](#Connect-database-hiệu-quả)
- [4, Đăng kí tài khoản bằng JWT ???](#Đăng-kí-tài-khoản)
- [5, Xử lý error response](#Xử-lý-error-response)
- [6, Đăng nhập có khó không ?](#Đăng-nhập-có-khó-không)
## Cấu trúc thư mục và file
- **.env**: File chứa các biến môi trường cho dự án, ví dụ như thông tin kết nối cơ sở dữ liệu, cài đặt bảo mật, và các khóa API.
- **.gitignore**: File cấu hình để bỏ qua các file và thư mục không cần thiết khi commit vào git, chẳng hạn như thư mục `node_modules`, file `.env`, và các file log.
- **docs/**: Thư mục chứa tài liệu của dự án, bao gồm hướng dẫn sử dụng, API documentation, và các ghi chú cho người phát triển.
- **package.json**: File cấu hình của dự án Node.js, chứa thông tin về các dependencies và scripts để chạy các lệnh npm.
- **README.md**: File tài liệu mô tả dự án, cung cấp thông tin về cách cài đặt và sử dụng ứng dụng.
- **server.js**: File khởi động server, tạo instance của ứng dụng Express và cấu hình các cài đặt cơ bản.
- **src/**: Thư mục chứa mã nguồn chính của dự án.
  - **app.js**: File cấu hình và khởi tạo ứng dụng Express.
  - **configs/**: Thư mục chứa các file cấu hình như cấu hình cơ sở dữ liệu và các dịch vụ bên thứ ba.
  - **controllers/**: Thư mục chứa các controller xử lý logic của ứng dụng, thường là các hàm tương tác với `models` và trả về response cho client.
  - **middleware/**: Thư mục chứa các middleware của ứng dụng, ví dụ như xác thực người dùng hoặc xử lý lỗi.
  - **models/**: Thư mục chứa các model của ứng dụng, bao gồm các cấu trúc dữ liệu và logic xử lý cho dữ liệu của ứng dụng.
  - **routers/**: Thư mục chứa các định tuyến của ứng dụng, nơi định nghĩa các endpoint và kết nối với các controller.
  - **services/**: Thư mục chứa các service của ứng dụng, thường là các logic nghiệp vụ phức tạp hoặc các tác vụ xử lý bên ngoài.
  - **utils/**: Thư mục chứa các tiện ích hỗ trợ cho ứng dụng, bao gồm các hàm chung và tiện ích không thuộc về một ngữ cảnh cụ thể.
  - **helpers/**: Thư mục chứa các hàm hỗ trợ cho ngữ cảnh cụ thể trong ứng dụng.
  - **responses/**: Thư mục chứa các định nghĩa về response của ứng dụng, chẳng hạn như các thông điệp lỗi chuẩn hóa hoặc cấu trúc response.
  - **dbs/**: Thư mục chứa các mục liên quan đến database

## Các package thường sử dụng

- **morgan**: Middleware dùng để log lại các request HTTP, giúp dễ dàng theo dõi hoạt động của server. `Morgan` cung cấp các chế độ log khác nhau để phù hợp với từng môi trường:

  - **combined**: Log đầy đủ chi tiết của request, bao gồm cả IP client và thông tin user-agent. Thường dùng trong môi trường production.
  - **common**: Log các thông tin phổ biến của request, không bao gồm thông tin về referrer hoặc user-agent.
  - **dev**: Log ngắn gọn và có màu sắc, phù hợp để sử dụng trong quá trình phát triển.
  - **short**: Log thông tin request rút gọn, chỉ ghi lại phương thức, URL, mã trạng thái, và thời gian xử lý.
  - **tiny**: Log rất ngắn gọn, chỉ chứa phương thức, URL, và mã trạng thái của request.

- **helmet**: Tăng cường bảo mật cho ứng dụng bằng cách thiết lập các header HTTP bảo mật.
- **compression**: Middleware để nén response, giúp giảm dung lượng dữ liệu truyền tải và tăng tốc độ tải trang.

## Connect database hiệu quả
- Sử dụng `Singleton Pattern` để connect hiệu quả.
- Không nên đóng kêt nối nhiều lần 
- Nên sử dụng tính năng debug của mongoose để tối ưu hóa hiệu năng truy vấn trong môi trường dev.
- Sử dụng .lean() khi check xem có tồn tại bản ghi mà k cần lấy ra bản ghi đó 

## Đăng kí tài khoản

- **Những thư viện cần tải**:
  - `jsonwebtoken` : Thư viện chính để triển khai thuật toán.
  - `bcrypt`: mã hóa mật khẩu.
  - `crypto`: tạo `publicKey` và `privateKey`.
- **Các bước triển khai đăng kí tài khoản bằng `JWT`**:
  - Mã hóa bằng `publicKey` và giải mã bằng `privateKey`, Ký bằng `privateKey` và xác minh bằng `publicKey`, cả 2 đều ở dạng Object.
  - Dùng `generateKeyPairSync` của `crypto` để tạo `publicKey` và `privateKey`.
  - Lấy ra String của `publicKey` bằng phương thức toString sau đó lưu vào database kèm với id của tài khoản vừa tạo.
  - Tạo ra 2 mã JWT là `accessToken` và `refreshToken` so sánh với publicKey.

## Xử lý error response
*Error*: 
- Kế thừa class `Error` 2 thuộc tính message và status
- Tạo 1 hàm callback ôm lấy controller để trả về httpCode thay vì dùng try-catch.

## Đăng nhập có khó không
