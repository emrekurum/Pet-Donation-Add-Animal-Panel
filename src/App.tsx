// src/App.tsx
// import React from 'react'; // Modern JSX transform ile genellikle gerekli değil
import AddAnimalForm from './components/AddAnimalForm';
import AddShelterForm from './components/AddShelterForm'; // Yeni barınak formunu import et

// import './App.css';

function App() {
  const appStyles = {
    textAlign: 'center' as const,
    fontFamily: 'Arial, sans-serif',
  };
  const headerStyles = {
    backgroundColor: '#282c34',
    padding: '20px',
    color: 'white',
    marginBottom: '30px',
  };
  const sectionStyles = {
    marginBottom: '40px',
    paddingBottom: '20px',
    borderBottom: '1px solid #eee'
  }


  const isAdminLoggedIn = true; // TODO: Gerçek bir auth kontrolü ekle

  return (
    <div style={appStyles}>
      <header style={headerStyles}>
        <h1>Sosyal Bağış Admin Paneli</h1>
      </header>
      <main>
        {isAdminLoggedIn ? (
          <>
            <div style={sectionStyles}>
              <AddShelterForm />
            </div>
            <div>
              <AddAnimalForm />
            </div>
          </>
        ) : (
          <p>Lütfen admin olarak giriş yapın.</p> // TODO: Login formu oluştur
        )}
      </main>
    </div>
  );
}

export default App;
