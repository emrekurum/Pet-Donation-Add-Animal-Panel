// src/components/AddAnimalForm.tsx
import React, { useState, useEffect } from 'react';
import { dbAdmin } from '../firebase'; // Admin paneli için Firebase instance'ı
import { collection, addDoc, serverTimestamp, getDocs, type DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';

interface Shelter {
  id: string;
  name: string;
  // İhtiyaç duyulabilecek diğer barınak alanları
}

interface AnimalFormData {
  name: string;
  type: string; // 'Kedi', 'Köpek', 'Diğer'
  breed: string;
  age: string;
  selectedShelterId: string; // Artık barınak adı yerine ID'sini tutacağız
  description: string;
  imageUrl: string;
  needs: string;
}

const AddAnimalForm: React.FC = () => {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [formData, setFormData] = useState<AnimalFormData>({
    name: '',
    type: 'Köpek',
    breed: '',
    age: '',
    selectedShelterId: '', // Başlangıçta boş
    description: '',
    imageUrl: '',
    needs: '',
  });
  const [loading, setLoading] = useState(false);
  const [loadingShelters, setLoadingShelters] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Component yüklendiğinde barınakları Firestore'dan çek
  useEffect(() => {
    const fetchShelters = async () => {
      setLoadingShelters(true);
      try {
        const sheltersCollectionRef = collection(dbAdmin, 'shelters');
        const querySnapshot = await getDocs(sheltersCollectionRef);
        const sheltersList: Shelter[] = querySnapshot.docs.map(
          (doc: QueryDocumentSnapshot<DocumentData>) => ({
          id: doc.id,
          name: doc.data().name as string, // name alanının string olduğunu varsayıyoruz
          // Diğer barınak alanlarını da buraya ekleyebilirsiniz
        }));
        setShelters(sheltersList);
        if (sheltersList.length > 0) {
          // Formdaki barınak ID'sini varsayılan olarak ilk barınağa ayarla
          // setFormData(prev => ({ ...prev, selectedShelterId: sheltersList[0].id }));
        }
      } catch (err) {
        console.error("Barınaklar çekilirken hata:", err);
        setError('Barınaklar yüklenemedi. Lütfen önce barınak eklediğinizden emin olun.');
      } finally {
        setLoadingShelters(false);
      }
    };

    fetchShelters();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!formData.name || !formData.type || !formData.selectedShelterId) {
      setError('Lütfen Hayvan Adı, Türü ve Barınak seçimini yapın.');
      setLoading(false);
      return;
    }

    // Seçilen barınağın adını bul
    const selectedShelter = shelters.find(s => s.id === formData.selectedShelterId);
    if (!selectedShelter) {
        setError('Geçerli bir barınak seçilemedi.');
        setLoading(false);
        return;
    }

    try {
      const animalsCollectionRef = collection(dbAdmin, 'animals');
      await addDoc(animalsCollectionRef, {
        name: formData.name,
        type: formData.type,
        breed: formData.breed,
        age: formData.age ? parseInt(formData.age, 10) : null,
        shelterId: formData.selectedShelterId, // Barınak ID'sini kaydet
        shelterName: selectedShelter.name, // Barınak adını da kolay erişim için kaydet
        description: formData.description,
        imageUrl: formData.imageUrl,
        needs: formData.needs.split(',').map(need => need.trim()).filter(need => need),
        dateAdded: serverTimestamp(),
      });
      setSuccess(`${formData.name} başarıyla ${selectedShelter.name} barınağına eklendi!`);
      setFormData({ // Formu sıfırla
        name: '', type: 'Köpek', breed: '', age: '',
        selectedShelterId: shelters.length > 0 ? shelters[0].id : '', // Varsa ilk barınağı seçili bırak
        description: '', imageUrl: '', needs: '',
      });
    } catch (err: unknown) {
      console.error("Hayvan eklenirken hata:", err);
      if (err instanceof Error) {
        setError('Hayvan eklenirken bir sorun oluştu: ' + err.message);
      } else {
        setError('Hayvan eklenirken bilinmeyen bir sorun oluştu.');
      }
    } finally {
      setLoading(false);
    }
  };

  const styles = { /* ... Önceki AddAnimalForm'daki stil nesnesi ... */
    formContainer: { maxWidth: '600px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'Arial, sans-serif', },
    formGroup: { marginBottom: '15px' },
    label: { display: 'block', marginBottom: '5px', fontWeight: 'bold' },
    input: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' as const, },
    textarea: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '80px', boxSizing: 'border-box' as const, },
    select: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' as const, },
    button: { backgroundColor: '#007bff', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', },
    buttonDisabled: { backgroundColor: '#aaa', cursor: 'not-allowed' },
    message: { padding: '10px', borderRadius: '4px', marginBottom: '15px', textAlign: 'center' as const, },
    errorMessage: { backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb', },
    successMessage: { backgroundColor: '#d4edda', color: '#155724', border: '1px solid #c3e6cb', },
  };

  if (loadingShelters) {
    return <div style={styles.formContainer}><p>Barınaklar yükleniyor...</p></div>;
  }

  return (
    <div style={styles.formContainer}>
      <h2>Yeni Hayvan Ekle</h2>
      {error && <div style={{...styles.message, ...styles.errorMessage}}>{error}</div>}
      {success && <div style={{...styles.message, ...styles.successMessage}}>{success}</div>}
      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label htmlFor="selectedShelterId" style={styles.label}>Barınak Seçin:*</label>
          <select
            id="selectedShelterId"
            name="selectedShelterId"
            value={formData.selectedShelterId}
            onChange={handleChange}
            style={styles.select}
            required
          >
            <option value="" disabled>Bir barınak seçin...</option>
            {shelters.map(shelter => (
              <option key={shelter.id} value={shelter.id}>
                {shelter.name}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="name" style={styles.label}>Hayvan Adı:*</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} style={styles.input} required />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="type" style={styles.label}>Tür:*</label>
          <select id="type" name="type" value={formData.type} onChange={handleChange} style={styles.select} required >
            <option value="Köpek">Köpek</option>
            <option value="Kedi">Kedi</option>
            <option value="Kuş">Kuş</option>
            <option value="Diğer">Diğer</option>
          </select>
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="breed" style={styles.label}>Cins:</label>
          <input type="text" id="breed" name="breed" value={formData.breed} onChange={handleChange} style={styles.input} />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="age" style={styles.label}>Yaş (Sayı Olarak):</label>
          <input type="number" id="age" name="age" value={formData.age} onChange={handleChange} style={styles.input} min="0" />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="description" style={styles.label}>Açıklama:</label>
          <textarea id="description" name="description" value={formData.description} onChange={handleChange} style={styles.textarea} />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="imageUrl" style={styles.label}>Resim URL'si:</label>
          <input type="url" id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleChange} style={styles.input} placeholder="https://example.com/image.jpg" />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="needs" style={styles.label}>Temel İhtiyaçlar (Virgülle ayırın):</label>
          <input type="text" id="needs" name="needs" value={formData.needs} onChange={handleChange} style={styles.input} placeholder="Özel mama, Günlük ilaç, Oyuncak" />
        </div>
        <button type="submit" style={loading ? {...styles.button, ...styles.buttonDisabled} : styles.button} disabled={loading || loadingShelters}>
          {loading ? 'Ekleniyor...' : 'Hayvanı Ekle'}
        </button>
      </form>
    </div>
  );
};

export default AddAnimalForm;
