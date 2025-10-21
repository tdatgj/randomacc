# Roblox Account Store

Trang web bán tài khoản Roblox random với hệ thống đăng ký, nạp tiền và quản lý tài khoản.

## Tính năng chính

### Cho User:
- ✅ Đăng ký/Đăng nhập bằng username và password
- ✅ Nạp tiền qua QR code chuyển khoản
- ✅ Mua tài khoản Roblox random
- ✅ Xem lịch sử giao dịch
- ✅ Quản lý tài khoản cá nhân

### Cho Admin:
- ✅ Quản lý users
- ✅ Duyệt yêu cầu nạp tiền
- ✅ Điều chỉnh số dư thủ công
- ✅ Thống kê doanh thu
- ✅ Theo dõi giao dịch

## Cài đặt

### 1. Cấu hình Firebase

1. Tạo project Firebase tại [https://console.firebase.google.com](https://console.firebase.google.com)
2. Bật Authentication và Firestore Database
3. Cấu hình Firestore Security Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if true; // Tạm thời cho phép tất cả, nên hạn chế trong production
    }
    match /depositRequests/{requestId} {
      allow read, write: if true; // Tạm thời cho phép tất cả, nên hạn chế trong production
    }
    match /gameAccounts/{accountId} {
      allow read, write: if true; // Tạm thời cho phép tất cả, nên hạn chế trong production
    }
  }
}
```

4. Firebase config đã được cấu hình sẵn trong `firebase-config.js` với project ID: `randomacc-96218`

### 2. Cấu trúc Database

#### Collection: `users`
```javascript
{
    username: "string",
    password: "string", // Trong production nên hash password
    balance: "number",
    createdAt: "timestamp",
    transactions: [
        {
            type: "deposit|purchase|manual_adjustment",
            amount: "number",
            description: "string",
            timestamp: "string",
            accountId: "number" // Chỉ có khi type = "purchase"
        }
    ]
}
```

#### Collection: `depositRequests`
```javascript
{
    username: "string",
    amount: "number",
    description: "string",
    timestamp: "timestamp",
    status: "pending|approved|rejected"
}
```

#### Collection: `gameAccounts`
```javascript
{
    name: "string",
    price: "number",
    quantity: "number",
    image: "string", // Tên file hình ảnh (acc9k.jpg, acc15k.jpg, acc55k.jpg)
    status: "available|sold",
    createdAt: "timestamp",
    soldTo: "string", // Chỉ có khi status = "sold"
    soldAt: "timestamp" // Chỉ có khi status = "sold"
}
```

### 3. Chạy ứng dụng

**Cách 1: Sử dụng HTTP Server (Khuyến nghị)**
```bash
# Cài đặt http-server
npm install -g http-server

# Chạy server
http-server -p 8080 -c-1

# Hoặc sử dụng npm script
npm start
```

**Cách 2: Mở trực tiếp**
1. Mở file `index.html` trong trình duyệt
2. Truy cập `admin.html` để quản lý hệ thống

**Lưu ý:** Cần chạy qua HTTP server để ES modules hoạt động đúng cách.

## Hướng dẫn sử dụng

### Đăng ký tài khoản
1. Truy cập trang web
2. Click "Đăng ký"
3. Nhập username và password
4. Click "Đăng ký"

### Nạp tiền
1. Đăng nhập tài khoản
2. Vào trang "Nạp tiền"
3. Nhập số tiền muốn nạp
4. Click "Tạo QR Code"
5. Chuyển khoản theo thông tin hiển thị
6. Chờ admin duyệt

### Mua tài khoản
1. Đăng nhập tài khoản
2. Vào trang "Mua Acc"
3. Chọn tài khoản muốn mua
4. Click "Mua ngay"
5. Xác nhận giao dịch

### Quản lý Admin
1. Truy cập `admin.html`
2. Duyệt yêu cầu nạp tiền
3. Điều chỉnh số dư thủ công nếu cần
4. Theo dõi thống kê

## Cấu hình nạp tiền

QR code được tạo theo format:
```
https://qr.sepay.vn/img?acc=0363064356&bank=VPBank&amount=SO_TIEN&des=TKPTD+DHUSERNAME
```

- `SO_TIEN`: Số tiền chuyển khoản
- `USERNAME`: Username của user

## Bảo mật

⚠️ **Lưu ý quan trọng:**
- Trong production, nên sử dụng Firebase Authentication thay vì lưu password plain text
- Hash password trước khi lưu vào database
- Sử dụng HTTPS cho tất cả giao dịch
- Validate input từ phía server
- Implement rate limiting cho API calls

## Công nghệ sử dụng

- HTML5, CSS3, JavaScript (Vanilla)
- Firebase Authentication
- Firebase Firestore
- QR Code API (sepay.vn)
- Responsive Design

## License

MIT License
