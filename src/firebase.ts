// sosyal-bagis-admin/src/firebase.ts
import { initializeApp, getApp, getApps } from "firebase/app";
import type { FirebaseApp } from "firebase/app"; // DÜZELTME: Tip-sadece import
import { getAuth } from "firebase/auth";
import type { Auth } from "firebase/auth"; // DÜZELTME: Tip-sadece import
import { getFirestore, type Firestore } from "firebase/firestore"; // DÜZELTME: Firestore tipi için de type-only
import { getStorage } from "firebase/storage";
import type { FirebaseStorage } from "firebase/storage"; // DÜZELTME: Tip-sadece import

// Firebase projenizin yapılandırma bilgileri Vite ortam değişkenlerinden alınır.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

if (!firebaseConfig.apiKey) {
  console.error(
    "FIREBASE AYARLARI EKSİK: VITE_FIREBASE_API_KEY .env dosyasında bulunamadı veya yüklenemedi!" +
    " Lütfen .env dosyanızı kontrol edin ve Vite'nin ortam değişkenlerini doğru yüklediğinden emin olun." +
    " Proje ana dizininde .env dosyası örneği: VITE_FIREBASE_API_KEY=AIzaSy..."
  );
}

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  console.log("Firebase uygulaması başarıyla başlatıldı.");
} else {
  app = getApp();
  console.log("Mevcut Firebase uygulaması kullanılıyor.");
}

export const authAdmin: Auth = getAuth(app);
export const dbAdmin: Firestore = getFirestore(app);
export const storageAdmin: FirebaseStorage = getStorage(app);
export default app;
