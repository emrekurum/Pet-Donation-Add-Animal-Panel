// src/App.tsx
import React, { useState } from 'react';
import AddAnimalForm from './components/AddAnimalForm';
import AddShelterForm from './components/AddShelterForm';

function App() {
  const [activeForm, setActiveForm] = useState<'animal' | 'shelter' | 'none'>('shelter');
  const isAdminLoggedIn = true; // TODO: Gerçek bir Firebase Auth kontrolü ile değiştirin

  const appStyles = {
    container: {
      fontFamily: "'Roboto', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      color: '#333',
      minHeight: '100vh',
      backgroundColor: '#f4f7f6', // Daha açık ve yumuşak bir arka plan
      display: 'flex',
      flexDirection: 'column' as const,
    },
    header: {
      backgroundColor: '#ffffff',
      padding: '20px 30px', // Dikey padding artırıldı
      color: '#2c3e50',
      textAlign: 'center' as const,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)', // Gölge biraz daha belirgin
      borderBottom: '1px solid #dde2e7',
    },
    headerTitle: {
      margin: 0,
      fontSize: '2em', // Başlık boyutu biraz büyütüldü
      fontWeight: '600' as const,
    },
    nav: {
      display: 'flex',
      justifyContent: 'center',
      padding: '15px 0', // Dikey padding artırıldı
      backgroundColor: '#3498db',
      boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
      marginBottom: '40px', // Navigasyon ve içerik arası boşluk artırıldı
    },
    navButton: {
      background: 'none',
      border: 'none',
      color: '#ffffff',
      padding: '12px 28px', // Buton iç boşluğu artırıldı
      margin: '0 10px', // Butonlar arası boşluk
      cursor: 'pointer',
      fontSize: '1.05em', // Font boyutu biraz büyütüldü
      borderRadius: '6px',
      transition: 'background-color 0.2s ease, color 0.2s ease',
      fontWeight: '500' as const,
    },
    navButtonActive: {
        backgroundColor: '#2980b9',
        color: '#ffffff',
    },
    mainContent: {
      flex: 1,
      width: '100%', // Tam genişlik alması için
      maxWidth: '800px', // Formların maksimum genişliği (AddShelterForm'daki 750px ile uyumlu)
      margin: '0 auto', // Yatayda ortalamak için
      padding: '0 20px 40px 20px', // Yan ve alt boşluklar
      boxSizing: 'border-box' as const,
    },
    loginMessage: {
      textAlign: 'center' as const,
      fontSize: '1.2em',
      color: '#555',
      marginTop: '60px',
      padding: '30px', // İç boşluk artırıldı
      backgroundColor: '#fff',
      borderRadius: '10px', // Daha yuvarlak köşeler
      boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
    },
    footer: {
        textAlign: 'center' as const,
        padding: '25px', // Dikey padding artırıldı
        backgroundColor: '#2c3e50', // Header ile uyumlu koyu renk
        color: '#bdc3c7', // Daha açık gri yazı
        fontSize: '0.9em',
        marginTop: 'auto',
        borderTop: '1px solid #34495e',
    }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    const isActive = e.currentTarget.style.backgroundColor === 'rgb(41, 128, 185)';
    if (!isActive) {
         e.currentTarget.style.backgroundColor = '#2c81b8';
    }
  };
  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    const isActive = e.currentTarget.style.backgroundColor === 'rgb(41, 128, 185)';
     if (!isActive) {
        e.currentTarget.style.backgroundColor = 'transparent';
     }
  };

  if (!isAdminLoggedIn) {
    return (
      <div style={appStyles.container}>
        <header style={appStyles.header}>
          <h1 style={appStyles.headerTitle}>Sosyal Bağış Admin Paneli</h1>
        </header>
        <main style={appStyles.mainContent}>
            <p style={appStyles.loginMessage}>
            Lütfen admin olarak giriş yapın.
            </p>
        </main>
        <footer style={appStyles.footer}>
            <p>&copy; {new Date().getFullYear()} Sosyal Bağış Platformu</p>
        </footer>
      </div>
    );
  }

  return (
    <div style={appStyles.container}>
      <header style={appStyles.header}>
        <h1 style={appStyles.headerTitle}>Sosyal Bağış Admin Paneli</h1>
      </header>
      <nav style={appStyles.nav}>
        <button
          style={activeForm === 'shelter' ? {...appStyles.navButton, ...appStyles.navButtonActive} : appStyles.navButton}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={() => setActiveForm('shelter')}
        >
          Barınak İşlemleri
        </button>
        <button
          style={activeForm === 'animal' ? {...appStyles.navButton, ...appStyles.navButtonActive} : appStyles.navButton}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={() => setActiveForm('animal')}
        >
          Hayvan İşlemleri
        </button>
      </nav>
      <main style={appStyles.mainContent}>
        {activeForm === 'shelter' && <AddShelterForm />}
        {activeForm === 'animal' && <AddAnimalForm />}
        {activeForm === 'none' && <p style={{textAlign: 'center', fontSize: '1.1em', marginTop: '40px'}}>Lütfen bir işlem seçin.</p>}
      </main>
      <footer style={appStyles.footer}>
        <p>&copy; {new Date().getFullYear()} Sosyal Bağış Platformu</p>
      </footer>
    </div>
  );
}

export default App;
