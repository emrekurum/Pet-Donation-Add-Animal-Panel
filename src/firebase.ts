import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase projenizin yapılandırma bilgileri (Firebase konsolundan alınır)
const firebaseConfig = {
  apiKey: "AIzaSyAR1mzwuaIPSPH44_Nhj9I_6EIvuoZE4LM",
  authDomain: "social-donation.firebaseapp.com",
  projectId: "social-donation",
  storageBucket: "social-donation.firebasestorage.app",
  messagingSenderId: "891887492081",
  appId: "1:891887492081:web:b135c91a72b257582d8250",
  measurementId: "G-S5HFXKSEY7"
};

// Firebase uygulamasını başlat
const app = initializeApp(firebaseConfig);

// Kullanılacak Firebase servislerini dışa aktar
export const authAdmin = getAuth(app); // Admin paneli için ayrı bir auth yönetimi olabilir
export const dbAdmin = getFirestore(app); // Aynı Firestore veritabanını kullanacak
export const storageAdmin = getStorage(app); // Aynı Storage'ı kullanacak
export default app;