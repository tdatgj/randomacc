# 🔧 Sửa lỗi Firestore 400 - Hướng dẫn chi tiết

## ❌ Lỗi hiện tại
```
POST https://firestore.googleapis.com/google.firestore.v1.Firestore/Write/channel
400 (Bad Request)
```

## 🎯 Nguyên nhân
Firestore Security Rules chưa được cấu hình đúng, chặn tất cả các thao tác đọc/ghi.

## ✅ Giải pháp

### Bước 1: Truy cập Firebase Console
1. Mở [Firebase Console](https://console.firebase.google.com/)
2. Đăng nhập bằng tài khoản Google
3. Chọn project **randomacc-96218**

### Bước 2: Vào Firestore Database
1. Trong menu bên trái, click **Firestore Database**
2. Click tab **Rules** (bên cạnh tab Data)

### Bước 3: Cập nhật Security Rules
**XÓA** toàn bộ nội dung hiện tại và **THAY THẰNG** bằng:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow all read/write access for demo purposes
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### Bước 4: Publish Rules
1. Click nút **Publish** (màu xanh)
2. Đợi thông báo "Rules published successfully"
3. **QUAN TRỌNG**: Đợi 30-60 giây để rules được áp dụng

### Bước 5: Kiểm tra kết nối
1. Mở `http://localhost:8083/test-firebase.html`
2. Click "Test Firebase Init"
3. Click "Test Firestore Read"
4. Click "Test Firestore Write"

## 🚨 Nếu vẫn lỗi

### Kiểm tra Project ID
Đảm bảo trong `config.js`:
```javascript
projectId: xorEncryptDecrypt('randomacc-96218', ENCRYPTION_KEY)
```

### Kiểm tra API Key
1. Vào Firebase Console → Project Settings → General
2. Scroll xuống "Your apps"
3. Copy API Key mới
4. Cập nhật trong `config.js`

### Kiểm tra Firestore đã enable
1. Vào Firestore Database
2. Nếu chưa có database, click "Create database"
3. Chọn "Start in test mode"

## 📱 Test trên mobile
Sau khi sửa, test trên điện thoại:
1. Mở `http://192.168.1.9:8083` trên mobile
2. Thử đăng ký tài khoản mới
3. Thử nạp tiền
4. Thử mua tài khoản

## ✅ Kết quả mong đợi
- Không còn lỗi 400 trong console
- Test page hiển thị ✅ cho tất cả tests
- Website hoạt động bình thường
- Mobile responsive hoạt động tốt

## 🔒 Lưu ý bảo mật
Rules hiện tại cho phép tất cả quyền truy cập - chỉ dùng cho demo.
Trong production cần cấu hình rules nghiêm ngặt hơn.
