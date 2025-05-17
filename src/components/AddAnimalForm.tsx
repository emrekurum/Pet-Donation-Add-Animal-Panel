// src/components/AddAnimalForm.tsx
import React, { useState, useEffect, useCallback } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { dbAdmin } from '../firebase'; // storageAdmin kaldırıldı
import {
  collection, addDoc, serverTimestamp, getDocs,
  doc, getDoc, updateDoc, // Firestore'dan doc, getDoc, updateDoc import edildi
  type QueryDocumentSnapshot, type DocumentData
} from 'firebase/firestore';

interface Shelter {
  id: string;
  name: string;
}

interface AnimalFormData {
  name: string;
  type: string;
  breed: string;
  age: string;
  gender: string;
  description: string;
  imageUrl: string;
  photoUrlsInput: string; // Kullanıcıdan virgülle ayrılmış URL'leri almak için
  needs: string;
  selectedShelterId: string;
  // virtualAdoptersCount: number; // Bu alan Firestore'a yazılırken 0 olarak ayarlanacak
}

interface AddAnimalFormProps {
  animalIdToEdit?: string | null; // Düzenlenecek hayvanın ID'si
  onFormClose?: () => void;      // Form kapandığında çağrılacak fonksiyon
}

const AddAnimalForm: React.FC<AddAnimalFormProps> = ({ animalIdToEdit, onFormClose }) => {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [formData, setFormData] = useState<AnimalFormData>({
    name: '',
    type: 'Köpek',
    breed: '',
    age: '',
    gender: 'Dişi',
    description: '',
    imageUrl: '',
    photoUrlsInput: '',
    needs: '',
    selectedShelterId: '',
  });

  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingShelters, setLoadingShelters] = useState(true);
  const [loadingInitialData, setLoadingInitialData] = useState(false); // Düzenleme için veri yükleme
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isEditMode = Boolean(animalIdToEdit);

  // Barınakları çekme
  useEffect(() => {
    const fetchShelters = async () => {
      setLoadingShelters(true);
      try {
        const sheltersCollectionRef = collection(dbAdmin, 'shelters');
        const querySnapshot = await getDocs(sheltersCollectionRef);
        const sheltersList: Shelter[] = querySnapshot.docs.map(
          (docSnap: QueryDocumentSnapshot<DocumentData>) => ({
            id: docSnap.id,
            name: docSnap.data().name as string,
          })
        );
        setShelters(sheltersList);
        if (sheltersList.length > 0 && !isEditMode) { // Sadece yeni ekleme modunda varsayılanı ayarla
          setFormData(prev => ({ ...prev, selectedShelterId: sheltersList[0].id }));
        } else if (sheltersList.length === 0) {
          setError('Hiç barınak bulunamadı. Lütfen önce bir barınak ekleyin.');
        }
      } catch (err) {
        console.error("Barınaklar çekilirken hata:", err);
        setError('Barınaklar yüklenemedi.');
      } finally {
        setLoadingShelters(false);
      }
    };
    fetchShelters();
  }, [isEditMode]); // isEditMode değiştiğinde de çalışabilir, ama genellikle bir kere yeterli

  // Düzenleme modu için hayvan verilerini çekme
  useEffect(() => {
    if (isEditMode && animalIdToEdit) {
      setLoadingInitialData(true);
      const fetchAnimalData = async () => {
        try {
          const animalDocRef = doc(dbAdmin, 'animals', animalIdToEdit);
          const docSnap = await getDoc(animalDocRef);
          if (docSnap.exists()) {
            const animalDataFromDb = docSnap.data() as DocumentData;
            setFormData({
              name: animalDataFromDb.name || '',
              type: animalDataFromDb.type || 'Köpek',
              breed: animalDataFromDb.breed || '',
              age: animalDataFromDb.age || '',
              gender: animalDataFromDb.gender || 'Dişi',
              description: animalDataFromDb.description || '',
              imageUrl: animalDataFromDb.imageUrl || '',
              photoUrlsInput: (animalDataFromDb.photos as string[] || []).join(', '), // Diziyi string'e çevir
              needs: (animalDataFromDb.needs as string[] || []).join(', '), // Diziyi string'e çevir
              selectedShelterId: animalDataFromDb.shelterId || (shelters.length > 0 ? shelters[0].id : ''),
            });
          } else {
            setError('Düzenlenecek hayvan bulunamadı.');
            if (onFormClose) onFormClose(); // Hayvan yoksa formu kapat
          }
        } catch (err) {
          console.error("Hayvan verisi çekilirken hata (düzenleme):", err);
          setError('Hayvan bilgileri yüklenemedi.');
        } finally {
          setLoadingInitialData(false);
        }
      };
      fetchAnimalData();
    } else if (!isEditMode) {
        // Yeni ekleme modu için formu sıfırla (barınak seçimi hariç)
        setFormData(prev => ({
            name: '', type: 'Köpek', breed: '', age: '', gender: 'Dişi',
            description: '', imageUrl: '', photoUrlsInput: '', needs: '',
            selectedShelterId: prev.selectedShelterId || (shelters.length > 0 ? shelters[0].id : ''),
        }));
    }
  }, [animalIdToEdit, isEditMode, shelters, onFormClose]);


  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoadingSubmit(true);
    setError(null);
    setSuccess(null);

    if (!formData.name || !formData.type || !formData.selectedShelterId) {
      setError('Lütfen Hayvan Adı, Türü ve Barınak seçimini yapın.');
      setLoadingSubmit(false);
      return;
    }
    const selectedShelter = shelters.find(s => s.id === formData.selectedShelterId);
    if (!selectedShelter) {
      setError('Geçerli bir barınak seçilemedi.');
      setLoadingSubmit(false);
      return;
    }

    try {
      const photoUrlsArray = formData.photoUrlsInput
        .split(',')
        .map(url => url.trim())
        .filter(url => url && (url.startsWith('http://') || url.startsWith('https://')));

      const dataToSave = {
        name: formData.name,
        type: formData.type,
        breed: formData.breed,
        age: formData.age,
        gender: formData.gender,
        shelterId: formData.selectedShelterId,
        shelterName: selectedShelter.name,
        description: formData.description,
        imageUrl: formData.imageUrl.trim(),
        photos: photoUrlsArray,
        needs: formData.needs.split(',').map(need => need.trim()).filter(need => need),
        // virtualAdoptersCount: isEditMode ? animal?.virtualAdoptersCount : 0, // Düzenlemede mevcut değeri koru
      };

      if (isEditMode && animalIdToEdit) {
        const animalDocRef = doc(dbAdmin, 'animals', animalIdToEdit);
        await updateDoc(animalDocRef, {
            ...dataToSave,
            lastUpdated: serverTimestamp(),
        });
        setSuccess(`${formData.name} başarıyla güncellendi!`);
      } else {
        const animalsCollectionRef = collection(dbAdmin, 'animals');
        await addDoc(animalsCollectionRef, {
          ...dataToSave,
          dateAdded: serverTimestamp(),
          virtualAdoptersCount: 0,
        });
        setSuccess(`${formData.name} başarıyla ${selectedShelter.name} barınağına eklendi!`);
        // Yeni ekleme sonrası formu sıfırla
        setFormData(prev => ({
            name: '', type: 'Köpek', breed: '', age: '', gender: 'Dişi',
            description: '', imageUrl: '', photoUrlsInput: '', needs: '',
            selectedShelterId: prev.selectedShelterId, // Barınak seçimini koru
        }));
      }
      if(onFormClose) onFormClose(); // İşlem sonrası formu kapat

    } catch (err: unknown) {
      console.error(`Hayvan ${isEditMode ? 'güncellenirken' : 'eklenirken'} hata:`, err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Hayvan ${isEditMode ? 'güncellenirken' : 'eklenirken'} bir sorun oluştu: ${errorMessage}`);
    } finally {
      setLoadingSubmit(false);
    }
  };

  const formStyles = { /* ... Önceki AddAnimalForm'daki stil nesnesi (tasarım güncellemesi yapılmış hali) ... */
    formContainer: { maxWidth: '750px', margin: '0 auto 30px auto', padding: '30px', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 8px 25px rgba(0,0,0,0.07)', border: '1px solid #e9ecef', },
    formTitle: { textAlign: 'center' as const, color: '#2c3e50', marginBottom: '30px', fontSize: '1.8em', fontWeight: '600' as const, },
    formGroup: { marginBottom: '25px', },
    label: { display: 'block', marginBottom: '10px', fontWeight: '500' as const, color: '#495057', fontSize: '1em', },
    input: { width: '100%', padding: '14px 18px', border: '1px solid #ced4da', borderRadius: '8px', boxSizing: 'border-box' as const, fontSize: '1em', color: '#495057', backgroundColor: '#f8f9fa', transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out', },
    textarea: { width: '100%', padding: '14px 18px', border: '1px solid #ced4da', borderRadius: '8px', minHeight: '120px', boxSizing: 'border-box' as const, fontSize: '1em', color: '#495057', backgroundColor: '#f8f9fa', transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out', },
    select: { width: '100%', padding: '14px 18px', border: '1px solid #ced4da', borderRadius: '8px', boxSizing: 'border-box' as const, fontSize: '1em', backgroundColor: '#f8f9fa', color: '#495057', appearance: 'none' as const, backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007bff%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.9z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em', paddingRight: '2.5rem', },
    button: { backgroundColor: '#007bff', color: 'white', padding: '14px 22px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.05em', fontWeight: '600' as const, transition: 'background-color 0.2s ease, transform 0.1s ease', display: 'inline-block', width: 'auto', minWidth: '150px', textAlign: 'center' as const, },
    buttonDisabled: { backgroundColor: '#a0c7e8', cursor: 'not-allowed', opacity: 0.7, },
    message: { padding: '15px 20px', borderRadius: '8px', marginBottom: '25px', textAlign: 'center' as const, fontSize: '1em', borderWidth: '1px', borderStyle: 'solid', },
    errorMessage: { backgroundColor: '#fdecea', color: '#b71c1c', borderColor: '#f5c6cb', },
    successMessage: { backgroundColor: '#d1f7d7', color: '#116328', borderColor: '#c3e6cb', },
    loadingIndicatorContainer: { textAlign: 'center' as const, padding: '20px', fontSize: '1.1em', color: '#495057' }
  };

  if (loadingShelters || (isEditMode && loadingInitialData)) {
    return <div style={formStyles.loadingIndicatorContainer}><p>{isEditMode ? 'Hayvan bilgileri' : 'Barınaklar'} yükleniyor...</p></div>;
  }

  return (
    <div style={formStyles.formContainer}>
      <h2 style={formStyles.formTitle}>{isEditMode ? 'Hayvanı Düzenle' : 'Yeni Hayvan Ekle'}</h2>
      {error && <div style={{...formStyles.message, ...formStyles.errorMessage}}>{error}</div>}
      {success && <div style={{...formStyles.message, ...formStyles.successMessage}}>{success}</div>}
      <form onSubmit={handleSubmit}>
        {/* Form alanları aynı kalacak, sadece buton metni değişecek */}
        <div style={formStyles.formGroup}>
          <label htmlFor="selectedShelterId" style={formStyles.label}>Barınak Seçin:*</label>
          <select id="selectedShelterId" name="selectedShelterId" value={formData.selectedShelterId} onChange={handleChange} style={formStyles.select} required >
            <option value="" disabled>Bir barınak seçin...</option>
            {shelters.map(shelter => ( <option key={shelter.id} value={shelter.id}>{shelter.name}</option> ))}
          </select>
        </div>

        <div style={formStyles.formGroup}>
          <label htmlFor="name" style={formStyles.label}>Hayvan Adı:*</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} style={formStyles.input} required />
        </div>

        <div style={formStyles.formGroup}>
          <label htmlFor="type" style={formStyles.label}>Tür:*</label>
          <select id="type" name="type" value={formData.type} onChange={handleChange} style={formStyles.select} required >
            <option value="Köpek">Köpek</option> <option value="Kedi">Kedi</option>
            <option value="Kuş">Kuş</option> <option value="Diğer">Diğer</option>
          </select>
        </div>
         <div style={formStyles.formGroup}>
          <label htmlFor="breed" style={formStyles.label}>Cins:</label>
          <input type="text" id="breed" name="breed" value={formData.breed} onChange={handleChange} style={formStyles.input} />
        </div>

        <div style={formStyles.formGroup}>
          <label htmlFor="age" style={formStyles.label}>Yaş (Örn: 2 Yaşında, 6 Aylık):</label>
          <input type="text" id="age" name="age" value={formData.age} onChange={handleChange} style={formStyles.input} placeholder="Örn: 2 Yaşında"/>
        </div>

        <div style={formStyles.formGroup}>
          <label htmlFor="gender" style={formStyles.label}>Cinsiyet:*</label>
          <select id="gender" name="gender" value={formData.gender} onChange={handleChange} style={formStyles.select} required >
            <option value="Dişi">Dişi</option> <option value="Erkek">Erkek</option>
          </select>
        </div>

        <div style={formStyles.formGroup}>
          <label htmlFor="description" style={formStyles.label}>Açıklama:</label>
          <textarea id="description" name="description" value={formData.description} onChange={handleChange} style={formStyles.textarea} />
        </div>

        <div style={formStyles.formGroup}>
          <label htmlFor="imageUrl" style={formStyles.label}>Ana Resim URL'si:</label>
          <input type="url" id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleChange} style={formStyles.input} placeholder="https://example.com/ana-resim.jpg" />
        </div>

        <div style={formStyles.formGroup}>
          <label htmlFor="photoUrlsInput" style={formStyles.label}>Galeri Resim URL'leri (Virgülle ayırın):</label>
          <textarea id="photoUrlsInput" name="photoUrlsInput" value={formData.photoUrlsInput} onChange={handleChange} style={formStyles.textarea} placeholder="https://example.com/resim1.jpg, https://example.com/resim2.jpg" />
        </div>

        <div style={formStyles.formGroup}>
          <label htmlFor="needs" style={formStyles.label}>Temel İhtiyaçlar (Virgülle ayırın):</label>
          <input type="text" id="needs" name="needs" value={formData.needs} onChange={handleChange} style={formStyles.input} placeholder="Özel mama, Günlük ilaç, Oyuncak" />
        </div>

        <div style={{ textAlign: 'center' }}>
            <button type="submit" style={loadingSubmit ? {...formStyles.button, ...formStyles.buttonDisabled} : formStyles.button} disabled={loadingSubmit || loadingShelters || (isEditMode && loadingInitialData)}>
            {loadingSubmit ? (isEditMode ? 'Güncelleniyor...' : 'Ekleniyor...') : (isEditMode ? 'Hayvanı Güncelle' : 'Hayvanı Ekle')}
            </button>
        </div>
      </form>
    </div>
  );
};

export default AddAnimalForm;
