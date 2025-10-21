// Firebase configuration with encrypted keys
const firebaseConfig = {
  apiKey: getConfig('firebase', 'apiKey'),
  authDomain: getConfig('firebase', 'authDomain'),
  projectId: getConfig('firebase', 'projectId'),
  storageBucket: getConfig('firebase', 'storageBucket'),
  messagingSenderId: getConfig('firebase', 'messagingSenderId'),
  appId: getConfig('firebase', 'appId'),
  measurementId: getConfig('firebase', 'measurementId')
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// Export for use in other files
window.auth = auth;
window.db = db;