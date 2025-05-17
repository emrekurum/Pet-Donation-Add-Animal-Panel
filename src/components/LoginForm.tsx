// src/components/LoginForm.tsx
import React, { useState } from 'react';
// DÜZELTME: Tip-sadece importlar kullanıldı
import type { FormEvent, ChangeEvent } from 'react';
// ----- 🔥 FIREBASE IMPORTLARI - LÜTFEN KONTROL EDİN VE YAPILANDIRIN 🔥 -----
// Kullandığınız Firebase SDK'sına göre bu importları aktif edin ve yapılandırın.
// Örnek Firebase Web SDK (v9 modular) kullanımı:
import { authAdmin } from '../firebase'; // firebase.ts dosyanızdan authAdmin'i import edin
import { signInWithEmailAndPassword } from 'firebase/auth';
import type { AuthError } from 'firebase/auth'; // DÜZELTME: Tip-sadece import
// Örnek @react-native-firebase/auth kullanımı (React Native projesi için):
// import auth from '@react-native-firebase/auth';
// ----- 🔥 FIREBASE IMPORTLARI BİTİŞ 🔥 -----

interface LoginFormProps {
  onLoginSuccess: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email || !password) {
      setError('Lütfen e-posta ve şifrenizi girin.');
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(authAdmin, email, password);
      console.log('Giriş başarılı!');
      onLoginSuccess();
    } catch (err: any) { // Hata tipini AuthError veya genel Error olarak yakalayabilirsiniz
      console.error("Giriş hatası:", err);
      const firebaseError = err as AuthError; // Tip dönüşümü
      if (firebaseError.code === 'auth/user-not-found' || firebaseError.code === 'auth/wrong-password' || firebaseError.code === 'auth/invalid-credential') {
        setError('E-posta veya şifre hatalı.');
      } else if (firebaseError.code === 'auth/invalid-email') {
        setError('Geçersiz e-posta formatı.');
      } else {
        setError('Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formStyles = {
    formContainer: { maxWidth: '450px', margin: '60px auto', padding: '30px', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 8px 25px rgba(0,0,0,0.08)', border: '1px solid #e9ecef' },
    formTitle: { textAlign: 'center' as const, color: '#2c3e50', marginBottom: '30px', fontSize: '1.8em', fontWeight: '600' as const },
    formGroup: { marginBottom: '25px' },
    label: { display: 'block', marginBottom: '10px', fontWeight: '500' as const, color: '#495057', fontSize: '1em' },
    input: { width: '100%', padding: '14px 18px', border: '1px solid #ced4da', borderRadius: '8px', boxSizing: 'border-box' as const, fontSize: '1em', color: '#495057', backgroundColor: '#f8f9fa' },
    button: { backgroundColor: '#3498db', color: 'white', padding: '14px 22px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.05em', fontWeight: '600' as const, width: '100%' },
    buttonDisabled: { backgroundColor: '#a0c7e8', cursor: 'not-allowed', opacity: 0.7 },
    message: { padding: '15px 20px', borderRadius: '8px', marginBottom: '25px', textAlign: 'center' as const, fontSize: '1em', borderWidth: '1px', borderStyle: 'solid' },
    errorMessage: { backgroundColor: '#fdecea', color: '#b71c1c', borderColor: '#f5c6cb' },
  };

  return (
    <div style={formStyles.formContainer}>
      <h2 style={formStyles.formTitle}>Admin Girişi</h2>
      {error && <div style={{ ...formStyles.message, ...formStyles.errorMessage }}>{error}</div>}
      <form onSubmit={handleLogin}>
        <div style={formStyles.formGroup}>
          <label htmlFor="email" style={formStyles.label}>E-posta:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            style={formStyles.input}
            required
            disabled={loading}
          />
        </div>
        <div style={formStyles.formGroup}>
          <label htmlFor="password" style={formStyles.label}>Şifre:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            style={formStyles.input}
            required
            disabled={loading}
          />
        </div>
        <button type="submit" style={loading ? { ...formStyles.button, ...formStyles.buttonDisabled } : formStyles.button} disabled={loading}>
          {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
