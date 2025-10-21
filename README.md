# Hệ thống Nạp tiền với QR Code

Website đơn giản với chức năng đăng ký, đăng nhập và nạp tiền qua QR code.

## Tính năng

- ✅ Đăng ký tài khoản mới
- ✅ Đăng nhập với email và mật khẩu
- ✅ Lưu trữ dữ liệu trên Firebase Firestore
- ✅ Tạo QR code nạp tiền với số tiền tùy chọn
- ✅ Giao diện responsive, thân thiện người dùng

## Cài đặt

### 1. Cấu hình Firebase

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Vào **Project Settings** > **General** > **Your apps**
4. Thêm web app và copy cấu hình
5. Thay thế các giá trị trong `script.js`:

```javascript
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};
```

### 2. Cấu hình Authentication

1. Vào **Firebase Console** > **Authentication** > **Sign-in method**
2. Bật **Email/Password** provider
3. Cấu hình domain được phép (localhost cho development)

### 3. Cấu hình Firestore

1. Vào **Firebase Console** > **Firestore Database** > **Rules**
2. Thay thế rules mặc định bằng:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 4. Chạy website

1. Mở `index.html` trong trình duyệt
2. Hoặc sử dụng local server (khuyến nghị):

```bash
# Sử dụng Python
python -m http.server 8000

# Hoặc sử dụng Node.js
npx http-server
```

## Cấu trúc dự án

```
├── index.html          # Trang chính
├── styles.css          # CSS styling
├── script.js           # JavaScript logic
├── firebase-config.js  # Hướng dẫn cấu hình Firebase
└── README.md          # Tài liệu hướng dẫn
```

## Sử dụng

1. **Đăng ký**: Tạo tài khoản mới với email và mật khẩu
2. **Đăng nhập**: Sử dụng thông tin đã đăng ký
3. **Nạp tiền**: 
   - Nhập số tiền muốn nạp (tối thiểu 1,000 VNĐ)
   - Nhấn "Tạo QR Code"
   - Quét mã QR hoặc chuyển khoản theo thông tin hiển thị

## Thông tin chuyển khoản

- **Số tài khoản**: 0363064356
- **Ngân hàng**: VPBank
- **Nội dung**: TKPTD DH102969

## Lưu ý

- Website sử dụng Firebase Authentication và Firestore
- QR code được tạo từ API của sepay.vn
- Dữ liệu user được lưu trữ an toàn trên Firestore
- Cần cấu hình Firebase trước khi sử dụng
