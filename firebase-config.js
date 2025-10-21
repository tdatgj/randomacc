// Firebase configuration with fallback
let firebaseConfig;

try {
  // Try to get encrypted config first
  firebaseConfig = {
    apiKey: getConfig('firebase', 'apiKey'),
    authDomain: getConfig('firebase', 'authDomain'),
    projectId: getConfig('firebase', 'projectId'),
    storageBucket: getConfig('firebase', 'storageBucket'),
    messagingSenderId: getConfig('firebase', 'messagingSenderId'),
    appId: getConfig('firebase', 'appId'),
    measurementId: getConfig('firebase', 'measurementId')
  };
} catch (error) {
  console.warn('Using fallback Firebase config');
  // Fallback to direct config if encryption fails
  firebaseConfig = {
    apiKey: "AIzaSyAiD-pBWfSwvmIsWmHI9cCp3wn93CqshQE",
    authDomain: "randomacc-96218.firebaseapp.com",
    projectId: "randomacc-96218",
    storageBucket: "randomacc-96218.firebasestorage.app",
    messagingSenderId: "113176272821",
    appId: "1:113176272821:web:1eabdc70e688db379203fc",
    measurementId: "G-TPQH4G05C2"
  };
}

// Initialize Firebase
try {
  firebase.initializeApp(firebaseConfig);
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// Export for use in other files
window.auth = auth;
window.db = db;

console.log('Firebase initialized successfully');