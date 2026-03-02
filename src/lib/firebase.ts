import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCfVkE27tDoAxewwk78WQjJ6iwOi8e3qFU",
  authDomain: "ipe-9377c.firebaseapp.com",
  projectId: "ipe-9377c",
  storageBucket: "ipe-9377c.firebasestorage.app",
  messagingSenderId: "1014662866184",
  appId: "1:1014662866184:web:757d8b75dd1f44dd66f8bd",
  measurementId: "G-M94K4DH8WD"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize analytics only on client-side if supported
let analytics;
if (typeof window !== "undefined") {
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { auth, db, app, analytics };
