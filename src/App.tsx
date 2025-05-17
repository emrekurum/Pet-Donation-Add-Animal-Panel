// src/App.tsx
import React, { useState } from 'react';
import AddAnimalForm from './components/AddAnimalForm';
import AddShelterForm from './components/AddShelterForm';
import ShelterList from './components/ShelterList'; // ShelterList import edildi
// Hayvan listeleme için AnimalList bileşenini de import edeceğiz (bir sonraki adımda oluşturulabilir)
// import AnimalList from './components/AnimalList';

// Admin paneli için Firebase Authentication importu (giriş/çıkış işlemleri için)
// import { authAdmin } from './firebase';
// import { onAuthStateChanged, User } from 'firebase/auth';

type AdminView =
  | 'listShelters'
  | 'addShelter'
  | 'editShelter'
  | 'listAnimals'
  | 'addAnimal'
  | 'editAnimal'
  | 'none';

function App() {
  const [currentUser, setCurrentUser] = useState<any>(null); // Firebase User tipi kullanılmalı
  const [loadingAuth, setLoadingAuth] = useState(true); // Auth yükleme durumu

  const [currentView, setCurrentView] = useState<AdminView>('listShelters'); // Başlangıçta barınak listesi
  const [editingShelterId, setEditingShelterId] = useState<string | null>(null);
  const [editingAnimalId, setEditingAnimalId] = useState<string | null>(null);

  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(authAdmin, (user) => {
  //     setCurrentUser(user);
  //     setLoadingAuth(false);
  //   });
  //   return () => unsubscribe();
  // }, []);

  const isAdminLoggedIn = true; // TODO: Gerçek bir Firebase Auth kontrolü ile değiştirin
  // if (loadingAuth) {
  //   return <div style={appStyles.loadingScreen}>Kimlik doğrulaması yapılıyor...</div>;
  // }

  const handleEditShelter = (shelterId: string) => {
    setEditingShelterId(shelterId);
    setCurrentView('editShelter');
  };

  const handleEditAnimal = (animalId: string) => {
    setEditingAnimalId(animalId);
    setCurrentView('editAnimal');
  };

  const handleFormClose = (entityType: 'shelter' | 'animal') => {
    setEditingShelterId(null);
    setEditingAnimalId(null);
    if (entityType === 'shelter') {
      setCurrentView('listShelters');
    } else if (entityType === 'animal') {
      // setCurrentView('listAnimals'); // AnimalList eklendiğinde aktif edilecek
      setCurrentView('listShelters'); // Şimdilik barınak listesine dönsün
    }
  };


  const appStyles = { /* Önceki App.tsx'deki stil tanımlamaları aynı kalabilir veya güncellenebilir */
    container: { fontFamily: "'Roboto', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", color: '#333', minHeight: '100vh', backgroundColor: '#eef1f5', display: 'flex', flexDirection: 'column' as const, },
    header: { backgroundColor: '#ffffff', padding: '20px 30px', color: '#2c3e50', textAlign: 'center' as const, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderBottom: '1px solid #dde2e7', },
    headerTitle: { margin: 0, fontSize: '2em', fontWeight: '600' as const, },
    nav: { display: 'flex', justifyContent: 'center', flexWrap: 'wrap' as const, padding: '15px 0', backgroundColor: '#3498db', boxShadow: '0 2px 6px rgba(0,0,0,0.06)', marginBottom: '40px', },
    navButton: { background: 'none', border: 'none', color: '#ffffff', padding: '12px 22px', margin: '5px 10px', cursor: 'pointer', fontSize: '1em', borderRadius: '6px', transition: 'background-color 0.2s ease, color 0.2s ease', fontWeight: '500' as const, },
    navButtonActive: { backgroundColor: '#2980b9', color: '#ffffff', },
    mainContent: { flex: 1, width: '100%', maxWidth: '1000px', margin: '0 auto', padding: '0 20px 40px 20px', boxSizing: 'border-box' as const, },
    loginMessage: { textAlign: 'center' as const, fontSize: '1.2em', color: '#555', marginTop: '60px', padding: '30px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.06)', },
    footer: { textAlign: 'center' as const, padding: '25px', backgroundColor: '#2c3e50', color: '#bdc3c7', fontSize: '0.9em', marginTop: 'auto', borderTop: '1px solid #34495e', },
    loadingScreen: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.5em', color: '#3498db', }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    const isActive = e.currentTarget.style.backgroundColor === 'rgb(41, 128, 185)';
    if (!isActive) { e.currentTarget.style.backgroundColor = '#2c81b8'; }
  };
  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    const isActive = e.currentTarget.style.backgroundColor === 'rgb(41, 128, 185)';
     if (!isActive) { e.currentTarget.style.backgroundColor = 'transparent'; }
  };

  const renderActiveView = () => {
    switch (currentView) {
      case 'listShelters':
        return <ShelterList onEditShelter={handleEditShelter} />;
      case 'addShelter':
        return <AddShelterForm onFormClose={() => handleFormClose('shelter')} />;
      case 'editShelter':
        return <AddShelterForm shelterIdToEdit={editingShelterId} onFormClose={() => handleFormClose('shelter')} />;
      case 'addAnimal':
        return <AddAnimalForm />; // onFormClose eklenecek
      // case 'listAnimals':
      //   return <AnimalList onEditAnimal={handleEditAnimal} />; // AnimalList eklendiğinde
      // case 'editAnimal':
      //   return <AddAnimalForm animalIdToEdit={editingAnimalId} onFormClose={() => handleFormClose('animal')} />; // AddAnimalForm'a düzenleme modu eklendiğinde
      default:
        return <p style={{textAlign: 'center', fontSize: '1.1em', marginTop: '40px'}}>Lütfen bir işlem seçin veya varsayılan görünüme yönlendiriliyorsunuz.</p>;
    }
  };

  if (!isAdminLoggedIn) { /* ... (Giriş yapılmamışsa gösterilecek kısım aynı kalabilir) ... */
    return (
      <div style={appStyles.container}>
        <header style={appStyles.header}><h1 style={appStyles.headerTitle}>Sosyal Bağış Admin Paneli</h1></header>
        <main style={appStyles.mainContent}><p style={appStyles.loginMessage}>Lütfen admin olarak giriş yapın.</p></main>
        <footer style={appStyles.footer}><p>&copy; {new Date().getFullYear()} Sosyal Bağış Platformu</p></footer>
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
          style={currentView === 'listShelters' || currentView === 'editShelter' ? {...appStyles.navButton, ...appStyles.navButtonActive} : appStyles.navButton}
          onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
          onClick={() => { setCurrentView('listShelters'); setEditingShelterId(null); }}
        >
          Barınak Listesi
        </button>
        <button
          style={currentView === 'addShelter' ? {...appStyles.navButton, ...appStyles.navButtonActive} : appStyles.navButton}
          onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
          onClick={() => { setCurrentView('addShelter'); setEditingShelterId(null); }}
        >
          Yeni Barınak Ekle
        </button>
        <button
          style={currentView === 'addAnimal' /* || currentView === 'listAnimals' || currentView === 'editAnimal' */ ? {...appStyles.navButton, ...appStyles.navButtonActive} : appStyles.navButton}
          onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
          onClick={() => { setCurrentView('addAnimal'); /* Diğer state'leri sıfırla */ }}
        >
          Hayvan İşlemleri (Yeni Ekle)
        </button>
        {/* Hayvan Listesi ve Düzenleme için butonlar eklenecek */}
      </nav>
      <main style={appStyles.mainContent}>
        {renderActiveView()}
      </main>
      <footer style={appStyles.footer}>
        <p>&copy; {new Date().getFullYear()} Sosyal Bağış Platformu</p>
      </footer>
    </div>
  );
}

export default App;
