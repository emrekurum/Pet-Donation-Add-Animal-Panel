// src/components/ShelterList.tsx
import React, { useState, useEffect } from 'react';
import { dbAdmin } from '../firebase';
import { collection, getDocs, doc, deleteDoc, type QueryDocumentSnapshot, type DocumentData } from 'firebase/firestore';

interface Shelter {
  id: string;
  name: string;
  city?: string;
  address?: string;
  // Diğer önemli alanlar buraya eklenebilir
}

interface ShelterListProps {
  onEditShelter: (shelterId: string) => void; // Düzenleme fonksiyonu için prop
}

const ShelterList: React.FC<ShelterListProps> = ({ onEditShelter }) => {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchShelters = async () => {
    setLoading(true);
    setError(null);
    try {
      const sheltersCollectionRef = collection(dbAdmin, 'shelters');
      const querySnapshot = await getDocs(sheltersCollectionRef);
      const sheltersList: Shelter[] = querySnapshot.docs.map(
        (docSnap: QueryDocumentSnapshot<DocumentData>) => ({
          id: docSnap.id,
          name: docSnap.data().name as string,
          city: docSnap.data().city as string,
          address: docSnap.data().address as string,
          // Diğer alanları da buraya ekleyebilirsiniz
        })
      );
      setShelters(sheltersList);
    } catch (err) {
      console.error("Barınaklar çekilirken hata:", err);
      setError('Barınaklar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShelters();
  }, []);

  const handleDeleteShelter = async (shelterId: string, shelterName: string) => {
    if (!window.confirm(`"${shelterName}" adlı barınağı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      return;
    }
    setDeletingId(shelterId);
    try {
      await deleteDoc(doc(dbAdmin, 'shelters', shelterId));
      setShelters(prevShelters => prevShelters.filter(shelter => shelter.id !== shelterId));
      alert(`"${shelterName}" başarıyla silindi.`);
    } catch (err) {
      console.error("Barınak silinirken hata:", err);
      setError(`Barınak silinirken bir hata oluştu: ${shelterName}`);
    } finally {
      setDeletingId(null);
    }
  };

  const listStyles = {
    container: { maxWidth: '900px', margin: '30px auto', padding: '20px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 6px 12px rgba(0,0,0,0.08)' },
    title: { textAlign: 'center' as const, color: '#2c3e50', marginBottom: '25px', fontSize: '1.8em', fontWeight: '600' as const },
    table: { width: '100%', borderCollapse: 'collapse' as const, marginTop: '20px' },
    th: { backgroundColor: '#f0f4f7', color: '#333', padding: '12px 15px', borderBottom: '2px solid #dde2e7', textAlign: 'left' as const, fontWeight: '600' as const },
    td: { padding: '12px 15px', borderBottom: '1px solid #e9ecef', color: '#495057' },
    trHover: { /* CSS ile :hover efekti eklemek daha iyi olur */ },
    actionsCell: { display: 'flex', gap: '10px', alignItems: 'center' },
    button: { padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', border: 'none', fontSize: '0.9em', fontWeight: '500' as const, transition: 'opacity 0.2s ease' },
    editButton: { backgroundColor: '#3498db', color: 'white' },
    deleteButton: { backgroundColor: '#e74c3c', color: 'white' },
    buttonDisabled: { opacity: 0.5, cursor: 'not-allowed' },
    message: { padding: '12px 15px', borderRadius: '6px', marginBottom: '20px', textAlign: 'center' as const, fontSize: '1em', borderWidth: '1px', borderStyle: 'solid' },
    errorMessage: { backgroundColor: '#fdecea', color: '#b71c1c', borderColor: '#f5c6cb' },
    noShelters: { textAlign: 'center' as const, padding: '20px', fontSize: '1.1em', color: '#6c757d' }
  };


  if (loading) {
    return <div style={listStyles.container}><p style={{textAlign: 'center'}}>Barınaklar yükleniyor...</p></div>;
  }

  if (error) {
    return <div style={{...listStyles.container, ...listStyles.message, ...listStyles.errorMessage}}>{error} <button onClick={fetchShelters}>Tekrar Dene</button></div>;
  }

  return (
    <div style={listStyles.container}>
      <h2 style={listStyles.title}>Kayıtlı Barınaklar</h2>
      {shelters.length === 0 ? (
        <p style={listStyles.noShelters}>Henüz kayıtlı barınak bulunmamaktadır.</p>
      ) : (
        <table style={listStyles.table}>
          <thead>
            <tr>
              <th style={listStyles.th}>Barınak Adı</th>
              <th style={listStyles.th}>Şehir</th>
              <th style={listStyles.th}>Adres (Kısmi)</th>
              <th style={listStyles.th}>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {shelters.map(shelter => (
              <tr key={shelter.id} /* onMouseEnter/Leave ile hover efekti eklenebilir */ >
                <td style={listStyles.td}>{shelter.name}</td>
                <td style={listStyles.td}>{shelter.city || '-'}</td>
                <td style={listStyles.td}>{shelter.address ? shelter.address.substring(0, 30) + (shelter.address.length > 30 ? '...' : '') : '-'}</td>
                <td style={{...listStyles.td, ...listStyles.actionsCell}}>
                  <button
                    style={{...listStyles.button, ...listStyles.editButton}}
                    onClick={() => onEditShelter(shelter.id)}
                    disabled={deletingId === shelter.id}
                  >
                    Düzenle
                  </button>
                  <button
                    style={{...listStyles.button, ...listStyles.deleteButton, ...(deletingId === shelter.id ? listStyles.buttonDisabled : {})}}
                    onClick={() => handleDeleteShelter(shelter.id, shelter.name)}
                    disabled={deletingId === shelter.id}
                  >
                    {deletingId === shelter.id ? 'Siliniyor...' : 'Sil'}
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

export default ShelterList;
