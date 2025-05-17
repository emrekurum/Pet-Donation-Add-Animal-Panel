// src/components/AddAnimalForm.tsx
import React, { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { dbAdmin } from '../firebase'; // storageAdmin kaldırıldı, çünkü URL ile ekleme yapıyoruz
import { collection, addDoc, serverTimestamp, getDocs, type QueryDocumentSnapshot, type DocumentData } from 'firebase/firestore';
// Firebase Storage importları kaldırıldı

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
  photoUrlsInput: string;
  needs: string;
  selectedShelterId: string;
}

const AddAnimalForm: React.FC = () => {
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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchShelters = async () => {
      setLoadingShelters(true);
      try {
        const sheltersCollectionRef = collection(dbAdmin, 'shelters');
        const querySnapshot = await getDocs(sheltersCollectionRef);
        const sheltersList: Shelter[] = querySnapshot.docs.map(
          (doc: QueryDocumentSnapshot<DocumentData>) => ({
            id: doc.id,
            name: doc.data().name as string,
          })
        );
        setShelters(sheltersList);
        if (sheltersList.length === 0) {
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
  }, []);

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
        .filter(url => url && (url.startsWith('http://') || url.startsWith('https://'))); // Sadece geçerli URL'leri al

      const animalsCollectionRef = collection(dbAdmin, 'animals');
      const newAnimalData = {
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
        dateAdded: serverTimestamp(),
        virtualAdoptersCount: 0,
      };

      await addDoc(animalsCollectionRef, newAnimalData);
      setSuccess(`${formData.name} başarıyla ${selectedShelter.name} barınağına eklendi!`);
      setFormData({
        name: '', type: 'Köpek', breed: '', age: '', gender: 'Dişi',
        selectedShelterId: shelters.length > 0 ? shelters[0].id : '',
        description: '', imageUrl: '', photoUrlsInput: '', needs: '',
      });
    } catch (err: unknown) {
      console.error("Hayvan eklenirken hata:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError('Hayvan eklenirken bir sorun oluştu: ' + errorMessage);
    } finally {
      setLoadingSubmit(false);
    }
  };

  // TASARIM GÜNCELLEMESİ: formStyles objesi
  const formStyles = {
    formContainer: {
      maxWidth: '750px', // Biraz daha geniş
      margin: '30px auto',
      padding: '30px', // İç boşluk artırıldı
      backgroundColor: '#ffffff', // Beyaz arka plan
      borderRadius: '12px', // Daha yuvarlak köşeler
      boxShadow: '0 8px 25px rgba(0,0,0,0.07)', // Daha belirgin ama yumuşak gölge
      border: '1px solid #e9ecef', // Hafif bir kenarlık
    },
    formTitle: {
      textAlign: 'center' as const,
      color: '#2c3e50', // Koyu mavi/gri başlık
      marginBottom: '30px', // Başlık altı boşluk
      fontSize: '1.8em', // Başlık font boyutu
      fontWeight: '600' as const,
    },
    formGroup: {
      marginBottom: '25px', // Alanlar arası boşluk artırıldı
    },
    label: {
      display: 'block',
      marginBottom: '10px', // Etiket altı boşluk artırıldı
      fontWeight: '500' as const, // Biraz daha ince font ağırlığı
      color: '#495057', // Orta gri etiket rengi
      fontSize: '1em', // Etiket font boyutu
    },
    input: {
      width: '100%',
      padding: '14px 18px', // İç dolgu artırıldı
      border: '1px solid #ced4da', // Açık gri kenarlık
      borderRadius: '8px', // Daha yuvarlak input köşeleri
      boxSizing: 'border-box' as const,
      fontSize: '1em',
      color: '#495057', // Input yazı rengi
      backgroundColor: '#f8f9fa', // Çok hafif gri input arka planı
      transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    },
    // Input:focus stili için CSS class'ı veya JS ile dinamik stil eklemek daha iyi olur.
    // Şimdilik placeholder'da belirtiyorum.
    // inputFocus: { borderColor: '#80bdff', boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)' },
    textarea: {
      width: '100%',
      padding: '14px 18px',
      border: '1px solid #ced4da',
      borderRadius: '8px',
      minHeight: '120px', // Textarea yüksekliği artırıldı
      boxSizing: 'border-box' as const,
      fontSize: '1em',
      color: '#495057',
      backgroundColor: '#f8f9fa',
      transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    },
    select: {
      width: '100%',
      padding: '14px 18px',
      border: '1px solid #ced4da',
      borderRadius: '8px',
      boxSizing: 'border-box' as const,
      fontSize: '1em',
      backgroundColor: '#f8f9fa', // Inputlarla aynı arka plan
      color: '#495057',
      appearance: 'none' as const, // Tarayıcı varsayılan okunu kaldır
      backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007bff%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.9z%22%2F%3E%3C%2Fsvg%3E")',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 1rem center',
      backgroundSize: '1em',
      paddingRight: '2.5rem', // Ok için yer aç
    },
    button: {
      backgroundColor: '#007bff', // Ana mavi renk (App.tsx'deki nav ile uyumlu olabilir)
      color: 'white',
      padding: '14px 22px', // Buton iç boşluğu
      border: 'none',
      borderRadius: '8px', // Daha yuvarlak buton köşeleri
      cursor: 'pointer',
      fontSize: '1.05em',
      fontWeight: '600' as const, // Font ağırlığı artırıldı
      transition: 'background-color 0.2s ease, transform 0.1s ease',
      display: 'inline-block', // Butonun tam genişlik kaplamaması için
      width: 'auto', // İçeriğe göre genişlik
      minWidth: '150px', // Minimum genişlik
      textAlign: 'center' as const,
    },
    // buttonHover: { backgroundColor: '#0056b3', transform: 'translateY(-1px)' }, // CSS class ile daha iyi
    buttonDisabled: {
      backgroundColor: '#a0c7e8', // Daha açık mavi, devre dışı
      cursor: 'not-allowed',
      opacity: 0.7,
    },
    message: {
      padding: '15px 20px', // Mesaj kutusu iç boşluğu
      borderRadius: '8px',
      marginBottom: '25px',
      textAlign: 'center' as const,
      fontSize: '1em',
      borderWidth: '1px',
      borderStyle: 'solid',
    },
    errorMessage: {
      backgroundColor: '#fdecea', // Daha yumuşak hata rengi
      color: '#b71c1c', // Koyu kırmızı yazı
      borderColor: '#f5c6cb',
    },
    successMessage: {
      backgroundColor: '#d1f7d7', // Daha yumuşak başarı rengi
      color: '#116328', // Koyu yeşil yazı
      borderColor: '#c3e6cb',
    },
    loadingIndicatorContainer: {
        textAlign: 'center' as const,
        padding: '20px',
        fontSize: '1.1em',
        color: '#495057'
    }
  };

  if (loadingShelters) {
    return <div style={formStyles.loadingIndicatorContainer}><p>Barınaklar yükleniyor...</p></div>;
  }

  return (
    <div style={formStyles.formContainer}>
      <h2 style={formStyles.formTitle}>Yeni Hayvan Ekle</h2>
      {error && <div style={{...formStyles.message, ...formStyles.errorMessage}}>{error}</div>}
      {success && <div style={{...formStyles.message, ...formStyles.successMessage}}>{success}</div>}
      <form onSubmit={handleSubmit}>
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

        <div style={{ textAlign: 'center' }}> {/* Butonu ortalamak için */}
            <button type="submit" style={loadingSubmit ? {...formStyles.button, ...formStyles.buttonDisabled} : formStyles.button} disabled={loadingSubmit || loadingShelters}>
            {loadingSubmit ? 'Ekleniyor...' : 'Hayvanı Ekle'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default AddAnimalForm;
