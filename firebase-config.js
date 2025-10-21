// Firebase configuration - Direct config for reliability
const firebaseConfig = {
  apiKey: "AIzaSyAiD-pBWfSwvmIsWmHI9cCp3wn93CqshQE",
  authDomain: "randomacc-96218.firebaseapp.com",
  projectId: "randomacc-96218",
  storageBucket: "randomacc-96218.firebasestorage.app",
  messagingSenderId: "113176272821",
  appId: "1:113176272821:web:1eabdc70e688db379203fc",
  measurementId: "G-TPQH4G05C2"
};

// Initialize Firebase
try {
  firebase.initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// Export for use in other files
window.auth = auth;
window.db = db;