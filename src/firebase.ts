// sosyal-bagis-admin/src/firebase.ts
import { initializeApp } from "firebase/app";
import type { FirebaseApp } from "firebase/app"; // Tip-sadece import
import { getAuth } from "firebase/auth";
import type { Auth } from "firebase/auth"; // Tip-sadece import
import { getFirestore, Firestore } from "firebase/firestore"; // Firestore tipi için hata yoktu, ama tutarlılık için eklenebilir veya olduğu gibi bırakılabilir. Şimdilik olduğu gibi bırakıyorum.
import { getStorage } from "firebase/storage";
import type { FirebaseStorage } from "firebase/storage"; // Tip-sadece import

// Firebase projenizin yapılandırma bilgileri Vite ortam değişkenlerinden alınır.
// .env dosyanızda VITE_FIREBASE_API_KEY=değeriniz şeklinde tanımlanmalıdır.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID, // Bu opsiyoneldir
};

// Ortam değişkenlerinin yüklenip yüklenmediğini kontrol edebilirsiniz (isteğe bağlı)
if (!firebaseConfig.apiKey) {
  console.error("VITE_FIREBASE_API_KEY .env dosyasında bulunamadı veya yüklenemedi!");
  // Burada bir hata fırlatabilir veya varsayılan bir davranış belirleyebilirsiniz.
}

// Firebase uygulamasını başlat
const app: FirebaseApp = initializeApp(firebaseConfig);

// Kullanılacak Firebase servislerini dışa aktar
export const authAdmin: Auth = getAuth(app);
export const dbAdmin: Firestore = getFirestore(app); // Firestore tipi burada kullanılıyor
export const storageAdmin: FirebaseStorage = getStorage(app);
export default app;
