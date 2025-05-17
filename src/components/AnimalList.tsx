// src/components/AnimalList.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { dbAdmin } from '../firebase'; // Admin paneli için Firebase instance'ı
import { collection, getDocs, doc, deleteDoc, type QueryDocumentSnapshot, type DocumentData } from 'firebase/firestore';

// Animal arayüzü (mobil uygulamadaki AnimalDetails ile uyumlu olmalı)
interface Animal {
  id: string;
  name?: string;
  type?: string;
  breed?: string;
  shelterName?: string; // Hangi barınakta olduğu bilgisi
  imageUrl?: string; // Ana resim URL'si
}

interface AnimalListProps {
  onEditAnimal: (animalId: string) => void; // Düzenleme fonksiyonu için prop
  // İleride filtreleme için barınak ID'si de eklenebilir: selectedShelterId?: string | null;
}

const AnimalList: React.FC<AnimalListProps> = ({ onEditAnimal }) => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAnimals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: İleride barınağa göre filtreleme eklenebilir.
      // const animalsCollectionRef = query(collection(dbAdmin, 'animals'), where('shelterId', '==', selectedShelterId));
      const animalsCollectionRef = collection(dbAdmin, 'animals');
      const querySnapshot = await getDocs(animalsCollectionRef);
      const animalsList: Animal[] = querySnapshot.docs.map(
        (docSnap: QueryDocumentSnapshot<DocumentData>) => ({
          id: docSnap.id,
          name: docSnap.data().name as string,
          type: docSnap.data().type as string,
          breed: docSnap.data().breed as string,
          shelterName: docSnap.data().shelterName as string, // Barınak adını da alıyoruz
          imageUrl: docSnap.data().imageUrl as string, // Ana resmi alıyoruz
        })
      );
      setAnimals(animalsList);
    } catch (err) {
      console.error("Hayvanlar çekilirken hata:", err);
      setError('Hayvanlar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, []); // selectedShelterId eklendiğinde bağımlılıklara eklenmeli

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

  // Stiller ShelterList ile benzer, gerekirse özelleştirilebilir
  const listStyles = {
    container: { maxWidth: '1000px', margin: '30px auto', padding: '20px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 6px 12px rgba(0,0,0,0.08)' },
    title: { textAlign: 'center' as const, color: '#2c3e50', marginBottom: '25px', fontSize: '1.8em', fontWeight: '600' as const },
    table: { width: '100%', borderCollapse: 'collapse' as const, marginTop: '20px' },
    th: { backgroundColor: '#f0f4f7', color: '#333', padding: '12px 15px', borderBottom: '2px solid #dde2e7', textAlign: 'left' as const, fontWeight: '600' as const },
    td: { padding: '12px 15px', borderBottom: '1px solid #e9ecef', color: '#495057', verticalAlign: 'middle' as const },
    animalImage: { width: '50px', height: '50px', borderRadius: '4px', objectFit: 'cover' as const, marginRight: '10px'},
    actionsCell: { display: 'flex', gap: '10px', alignItems: 'center' },
    button: { padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', border: 'none', fontSize: '0.9em', fontWeight: '500' as const, transition: 'opacity 0.2s ease' },
    editButton: { backgroundColor: '#3498db', color: 'white' },
    deleteButton: { backgroundColor: '#e74c3c', color: 'white' },
    buttonDisabled: { opacity: 0.5, cursor: 'not-allowed' },
    message: { padding: '12px 15px', borderRadius: '6px', marginBottom: '20px', textAlign: 'center' as const, fontSize: '1em', borderWidth: '1px', borderStyle: 'solid' },
    errorMessage: { backgroundColor: '#fdecea', color: '#b71c1c', borderColor: '#f5c6cb' },
    noItems: { textAlign: 'center' as const, padding: '20px', fontSize: '1.1em', color: '#6c757d' }
  };

  if (loading) {
    return <div style={listStyles.container}><p style={{textAlign: 'center'}}>Hayvanlar yükleniyor...</p></div>;
  }

  if (error) {
    return <div style={{...listStyles.container, ...listStyles.message, ...listStyles.errorMessage}}>{error} <button onClick={fetchAnimals}>Tekrar Dene</button></div>;
  }

  return (
    <div style={listStyles.container}>
      <h2 style={listStyles.title}>Kayıtlı Hayvanlar</h2>
      {animals.length === 0 ? (
        <p style={listStyles.noItems}>Henüz kayıtlı hayvan bulunmamaktadır.</p>
      ) : (
        <table style={listStyles.table}>
          <thead>
            <tr>
              <th style={listStyles.th}>Resim</th>
              <th style={listStyles.th}>Adı</th>
              <th style={listStyles.th}>Türü</th>
              <th style={listStyles.th}>Cinsi</th>
              <th style={listStyles.th}>Barınak</th>
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
                    <div style={{...listStyles.animalImage, backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><span style={{fontSize: '12px', color: '#aaa'}}>Resim Yok</span></div>
                  )}
                </td>
                <td style={listStyles.td}>{animal.name || '-'}</td>
                <td style={listStyles.td}>{animal.type || '-'}</td>
                <td style={listStyles.td}>{animal.breed || '-'}</td>
                <td style={listStyles.td}>{animal.shelterName || '-'}</td>
                <td style={{...listStyles.td, ...listStyles.actionsCell}}>
                  <button
                    style={{...listStyles.button, ...listStyles.editButton}}
                    onClick={() => onEditAnimal(animal.id)}
                    disabled={deletingId === animal.id}
                  >
                    Düzenle
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
      )}
    </div>
  );
};

export default AnimalList;
