// Hướng dẫn cấu hình Firebase
// 1. Truy cập https://console.firebase.google.com/
// 2. Tạo project mới hoặc chọn project hiện có
// 3. Vào Project Settings > General > Your apps
// 4. Thêm web app và copy cấu hình
// 5. Thay thế các giá trị trong script.js

const firebaseConfig = {
    apiKey: "your-api-key-here",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};

// Cấu hình Firestore Security Rules:
// Vào Firebase Console > Firestore Database > Rules
// Thay thế rules mặc định bằng:

/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
*/

// Cấu hình Authentication:
// 1. Vào Firebase Console > Authentication > Sign-in method
// 2. Bật Email/Password provider
// 3. Cấu hình domain được phép (localhost cho development)
