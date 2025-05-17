// src/App.tsx
import { useState, useEffect } from 'react'; // DÜZELTME: React importu kaldırıldı
import AddAnimalForm from './components/AddAnimalForm';
import AddShelterForm from './components/AddShelterForm';
import ShelterList from './components/ShelterList';
import AnimalList from './components/AnimalList';
import LoginForm from './components/LoginForm';
import AnimalDonationsModal from './components/AnimalDonationsModal';

import { authAdmin } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';

type AdminView =
  | 'listShelters'
  | 'addShelter'
  | 'editShelter'
  | 'listAnimals'
  | 'addAnimal'
  | 'editAnimal'
  | 'login'
  | 'none'; // viewAnimalDonations kaldırıldı, modal ile yönetilecek

const appStyles = {
    container: { fontFamily: "'Roboto', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", color: '#333', minHeight: '100vh', backgroundColor: '#eef1f5', display: 'flex', flexDirection: 'column' as const, },
    header: { backgroundColor: '#ffffff', padding: '20px 30px', color: '#2c3e50', textAlign: 'center' as const, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderBottom: '1px solid #dde2e7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    headerTitle: { margin: 0, fontSize: '2em', fontWeight: '600' as const, },
    nav: { display: 'flex', justifyContent: 'center', flexWrap: 'wrap' as const, padding: '15px 0', backgroundColor: '#3498db', boxShadow: '0 2px 6px rgba(0,0,0,0.06)', marginBottom: '40px', },
    navButton: { background: 'none', border: 'none', color: '#ffffff', padding: '12px 22px', margin: '5px 10px', cursor: 'pointer', fontSize: '1em', borderRadius: '6px', transition: 'background-color 0.2s ease, color 0.2s ease', fontWeight: '500' as const, },
    navButtonActive: { backgroundColor: '#2980b9', color: '#ffffff', },
    logoutButton: { backgroundColor: '#e74c3c', color: 'white', padding: '10px 18px', fontSize: '0.9em'},
    mainContent: { flex: 1, width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '0 20px 40px 20px', boxSizing: 'border-box' as const, },
    footer: { textAlign: 'center' as const, padding: '25px', backgroundColor: '#2c3e50', color: '#bdc3c7', fontSize: '0.9em', marginTop: 'auto', borderTop: '1px solid #34495e', },
    loadingScreen: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.5em', color: '#3498db', }
};

function App() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [currentView, setCurrentView] = useState<AdminView>('login');
  const [editingShelterId, setEditingShelterId] = useState<string | null>(null);
  const [editingAnimalId, setEditingAnimalId] = useState<string | null>(null);
  const [viewingDonationsForAnimal, setViewingDonationsForAnimal] = useState<{id: string; name?: string} | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(authAdmin, (user) => {
      setCurrentUser(user);
      setLoadingAuth(false);
      if (user) {
        if (currentView === 'login' || currentView === 'none') {
            setCurrentView('listShelters');
        }
      } else {
        setCurrentView('login');
      }
    });
    return () => unsubscribe();
  }, [currentView]); // currentView bağımlılığı, login sonrası yönlendirme için eklendi

  const handleLogout = async () => {
      try { await signOut(authAdmin); console.log('Çıkış başarılı!');}
      catch (error) { console.error('Çıkış hatası:', error); window.alert('Hata: Çıkış yapılırken bir sorun oluştu.');}
  };
  const handleEditShelter = (shelterId: string) => { setEditingShelterId(shelterId); setCurrentView('editShelter'); };
  const handleEditAnimal = (animalId: string) => { setEditingAnimalId(animalId); setCurrentView('editAnimal'); };

  const handleFormClose = (entityType: 'shelter' | 'animal') => {
    setEditingShelterId(null);
    setEditingAnimalId(null);
    if (entityType === 'shelter') {
      setCurrentView('listShelters');
    } else if (entityType === 'animal') {
      setCurrentView('listAnimals');
    }
  };

  const handleViewAnimalDonations = (animalId: string, animalName?: string) => {
    setViewingDonationsForAnimal({ id: animalId, name: animalName });
  };

  const closeDonationsModal = () => {
    setViewingDonationsForAnimal(null);
  };

  // DÜZELTME: handleMouseEnter ve handleMouseLeave fonksiyonları eventTarget parametresini kullanacak şekilde güncellendi
  const handleMouseEnter = (eventTarget: HTMLButtonElement) => {
    if (eventTarget.style.backgroundColor !== 'rgb(41, 128, 185)') { eventTarget.style.backgroundColor = '#2c81b8'; }
  };
  const handleMouseLeave = (eventTarget: HTMLButtonElement) => {
     if (eventTarget.style.backgroundColor !== 'rgb(41, 128, 185)') { eventTarget.style.backgroundColor = 'transparent'; }
  };

  const renderActiveView = () => {
    if (!currentUser && currentView !== 'login') {
        return <LoginForm onLoginSuccess={() => setCurrentView('listShelters')} />;
    }
    if (currentView === 'login') {
      return <LoginForm onLoginSuccess={() => setCurrentView('listShelters')} />;
    }

    switch (currentView) {
      case 'listShelters':
        return <ShelterList onEditShelter={handleEditShelter} />;
      case 'addShelter':
        return <AddShelterForm onFormClose={() => handleFormClose('shelter')} />;
      case 'editShelter':
        return <AddShelterForm shelterIdToEdit={editingShelterId} onFormClose={() => handleFormClose('shelter')} />;
      case 'listAnimals':
        return <AnimalList onEditAnimal={handleEditAnimal} onViewDonations={handleViewAnimalDonations} />;
      case 'addAnimal':
        return <AddAnimalForm onFormClose={() => handleFormClose('animal')} />;
      case 'editAnimal':
        return <AddAnimalForm animalIdToEdit={editingAnimalId} onFormClose={() => handleFormClose('animal')} />;
      default:
        return <p style={{textAlign: 'center', fontSize: '1.1em', marginTop: '40px'}}>Lütfen bir işlem seçin.</p>;
    }
  };

  if (loadingAuth) { return <div style={appStyles.loadingScreen}>Yükleniyor...</div>; }

  return (
    <div style={appStyles.container}>
      <header style={appStyles.header}>
        <h1 style={appStyles.headerTitle}>Sosyal Bağış Admin Paneli</h1>
        {currentUser && ( <button onClick={handleLogout} style={{...appStyles.navButton, ...appStyles.logoutButton}} onMouseEnter={(e) => handleMouseEnter(e.currentTarget)} onMouseLeave={(e) => handleMouseLeave(e.currentTarget)} >Çıkış Yap ({currentUser.email || 'Admin'})</button> )}
      </header>
      {currentUser && (
      <nav style={appStyles.nav}>
        <button style={currentView.startsWith('listShelters') || currentView === 'editShelter' ? {...appStyles.navButton, ...appStyles.navButtonActive} : appStyles.navButton} onMouseEnter={(e) => handleMouseEnter(e.currentTarget)} onMouseLeave={(e) => handleMouseLeave(e.currentTarget)} onClick={() => { setCurrentView('listShelters'); setEditingShelterId(null); setEditingAnimalId(null); setViewingDonationsForAnimal(null);}}>Barınak Listesi</button>
        <button style={currentView === 'addShelter' ? {...appStyles.navButton, ...appStyles.navButtonActive} : appStyles.navButton} onMouseEnter={(e) => handleMouseEnter(e.currentTarget)} onMouseLeave={(e) => handleMouseLeave(e.currentTarget)} onClick={() => { setCurrentView('addShelter'); setEditingShelterId(null); setEditingAnimalId(null); setViewingDonationsForAnimal(null);}}>Yeni Barınak Ekle</button>
        <button style={currentView.startsWith('listAnimals') || currentView === 'editAnimal' ? {...appStyles.navButton, ...appStyles.navButtonActive} : appStyles.navButton} onMouseEnter={(e) => handleMouseEnter(e.currentTarget)} onMouseLeave={(e) => handleMouseLeave(e.currentTarget)} onClick={() => { setCurrentView('listAnimals'); setEditingShelterId(null); setEditingAnimalId(null); setViewingDonationsForAnimal(null);}}>Hayvan Listesi</button>
        <button style={currentView === 'addAnimal' ? {...appStyles.navButton, ...appStyles.navButtonActive} : appStyles.navButton} onMouseEnter={(e) => handleMouseEnter(e.currentTarget)} onMouseLeave={(e) => handleMouseLeave(e.currentTarget)} onClick={() => { setCurrentView('addAnimal'); setEditingShelterId(null); setEditingAnimalId(null); setViewingDonationsForAnimal(null);}}>Yeni Hayvan Ekle</button>
      </nav>
      )}
      <main style={appStyles.mainContent}>
        {renderActiveView()}
      </main>

      <AnimalDonationsModal
        animalId={viewingDonationsForAnimal?.id || null}
        animalName={viewingDonationsForAnimal?.name || null}
        isVisible={!!viewingDonationsForAnimal}
        onClose={closeDonationsModal}
      />

      <footer style={appStyles.footer}>
        <p>&copy; {new Date().getFullYear()} Sosyal Bağış Platformu</p>
      </footer>
    </div>
  );
}

export default App;
