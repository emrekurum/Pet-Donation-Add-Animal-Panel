// src/components/AnimalList.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { dbAdmin } from '../firebase';
import { collection, getDocs, doc, deleteDoc, type QueryDocumentSnapshot, type DocumentData } from 'firebase/firestore';

// Animal arayüzü güncellendi
interface Animal {
  id: string;
  name?: string;
  type?: string;
  breed?: string;
  shelterName?: string;
  imageUrl?: string;
  totalDonationAmount?: number; // Toplam bağış miktarı (opsiyonel, ileride eklenecek)
  donationCount?: number;     // Toplam bağış sayısı (opsiyonel, ileride eklenecek)
}

interface AnimalListProps {
  onEditAnimal: (animalId: string) => void;
  onViewDonations: (animalId: string, animalName?: string) => void; // Yeni prop: Bağışları görmek için
}

const AnimalList: React.FC<AnimalListProps> = ({ onEditAnimal, onViewDonations }) => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAnimals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const animalsCollectionRef = collection(dbAdmin, 'animals');
      // İleride orderBy eklenebilir, örneğin dateAdded'a göre
      const querySnapshot = await getDocs(animalsCollectionRef);
      const animalsList: Animal[] = querySnapshot.docs.map(
        (docSnap: QueryDocumentSnapshot<DocumentData>) => ({
          id: docSnap.id,
          name: docSnap.data().name as string,
          type: docSnap.data().type as string,
          breed: docSnap.data().breed as string,
          shelterName: docSnap.data().shelterName as string,
          imageUrl: docSnap.data().imageUrl as string,
          // Başlangıçta bu alanlar Firestore'dan gelmeyecek, yer tutucu olarak gösterilecek
          totalDonationAmount: docSnap.data().totalDonationAmount as number || 0, // Varsa al, yoksa 0
          donationCount: docSnap.data().donationCount as number || 0, // Varsa al, yoksa 0
        })
      );
      setAnimals(animalsList);
    } catch (err) {
      console.error("Hayvanlar çekilirken hata:", err);
      setError('Hayvanlar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnimals();
  }, [fetchAnimals]);

  const handleDeleteAnimal = async (animalId: string, animalName?: string) => {
    const confirmDelete = window.confirm(`"${animalName || 'Bu hayvanı'}" silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`);
    if (!confirmDelete) {
      return;
    }
    setDeletingId(animalId);
    try {
      await deleteDoc(doc(dbAdmin, 'animals', animalId));
      setAnimals(prevAnimals => prevAnimals.filter(animal => animal.id !== animalId));
      alert(`"${animalName || 'Hayvan'}" başarıyla silindi.`);
    } catch (err) {
      console.error("Hayvan silinirken hata:", err);
      setError(`Hayvan silinirken bir hata oluştu: ${animalName || 'Hayvan'}`);
    } finally {
      setDeletingId(null);
    }
  };

  const listStyles = {
    container: { maxWidth: '1200px', margin: '30px auto', padding: '25px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 6px 12px rgba(0,0,0,0.08)' },
    title: { textAlign: 'center' as const, color: '#2c3e50', marginBottom: '30px', fontSize: '2em', fontWeight: '600' as const },
    table: { width: '100%', borderCollapse: 'collapse' as const, marginTop: '20px', fontSize: '0.95em' },
    th: { backgroundColor: '#f0f4f7', color: '#333', padding: '14px 18px', borderBottom: '2px solid #dde2e7', textAlign: 'left' as const, fontWeight: '600' as const },
    td: { padding: '14px 18px', borderBottom: '1px solid #e9ecef', color: '#495057', verticalAlign: 'middle' as const },
    animalImage: { width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' as const, marginRight: '15px'},
    actionsCell: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' as const }, // Butonların sığması için flexWrap
    button: { padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', border: 'none', fontSize: '0.9em', fontWeight: '500' as const, transition: 'opacity 0.2s ease', whiteSpace: 'nowrap' as const },
    editButton: { backgroundColor: '#3498db', color: 'white' },
    deleteButton: { backgroundColor: '#e74c3c', color: 'white' },
    viewDonationsButton: { backgroundColor: '#2ecc71', color: 'white' }, // Yeşil buton
    buttonDisabled: { opacity: 0.6, cursor: 'not-allowed' },
    message: { padding: '15px', borderRadius: '6px', marginBottom: '20px', textAlign: 'center' as const, fontSize: '1em', borderWidth: '1px', borderStyle: 'solid' },
    errorMessage: { backgroundColor: '#fdecea', color: '#b71c1c', borderColor: '#f5c6cb' },
    noItems: { textAlign: 'center' as const, padding: '25px', fontSize: '1.1em', color: '#6c757d' }
  };

  if (loading) {
    return <div style={listStyles.container}><p style={{textAlign: 'center'}}>Hayvanlar yükleniyor...</p></div>;
  }

  if (error) {
    return <div style={{...listStyles.container, ...listStyles.message, ...listStyles.errorMessage}}>{error} <button onClick={fetchAnimals} style={{marginLeft: '10px', ...listStyles.button, backgroundColor: '#6c757d'}}>Tekrar Dene</button></div>;
  }

  return (
    <div style={listStyles.container}>
      <h2 style={listStyles.title}>Kayıtlı Hayvanlar</h2>
      {animals.length === 0 ? (
        <p style={listStyles.noItems}>Henüz kayıtlı hayvan bulunmamaktadır.</p>
      ) : (
        <div style={{overflowX: 'auto'}}> {/* Tablonun taşması durumunda scroll için */}
          <table style={listStyles.table}>
            <thead>
              <tr>
                <th style={listStyles.th}>Resim</th>
                <th style={listStyles.th}>Adı</th>
                <th style={listStyles.th}>Türü</th>
                <th style={listStyles.th}>Cinsi</th>
                <th style={listStyles.th}>Barınak</th>
                <th style={listStyles.th}>Bağış Sayısı</th>
                <th style={listStyles.th}>Toplam Bağış (TL)</th>
                <th style={listStyles.th}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {animals.map(animal => (
                <tr key={animal.id}>
                  <td style={listStyles.td}>
                    {animal.imageUrl ? (
                      <img src={animal.imageUrl} alt={animal.name || 'Hayvan Resmi'} style={listStyles.animalImage} />
                    ) : (
                      <div style={{...listStyles.animalImage, backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><span style={{fontSize: '11px', color: '#aaa'}}>Resim Yok</span></div>
                    )}
                  </td>
                  <td style={listStyles.td}>{animal.name || '-'}</td>
                  <td style={listStyles.td}>{animal.type || '-'}</td>
                  <td style={listStyles.td}>{animal.breed || '-'}</td>
                  <td style={listStyles.td}>{animal.shelterName || '-'}</td>
                  <td style={listStyles.td}>{animal.donationCount ?? '-'}</td>
                  <td style={listStyles.td}>{animal.totalDonationAmount ? `${animal.totalDonationAmount.toFixed(2)} TL` : '-'}</td>
                  <td style={{...listStyles.td, ...listStyles.actionsCell}}>
                    <button
                      style={{...listStyles.button, ...listStyles.editButton}}
                      onClick={() => onEditAnimal(animal.id)}
                      disabled={deletingId === animal.id}
                    >
                      Düzenle
                    </button>
                    <button
                      style={{...listStyles.button, ...listStyles.viewDonationsButton}}
                      onClick={() => onViewDonations(animal.id, animal.name)}
                      disabled={deletingId === animal.id}
                    >
                      Bağışları Gör
                    </button>
                    <button
                      style={{...listStyles.button, ...listStyles.deleteButton, ...(deletingId === animal.id ? listStyles.buttonDisabled : {})}}
                      onClick={() => handleDeleteAnimal(animal.id, animal.name)}
                      disabled={deletingId === animal.id}
                    >
                      {deletingId === animal.id ? 'Siliniyor...' : 'Sil'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AnimalList;
