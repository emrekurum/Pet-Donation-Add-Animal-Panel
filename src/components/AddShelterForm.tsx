// src/components/AddShelterForm.tsx
import React, { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react'; // DÜZELTME: Tip-sadece import kullanıldı
import { dbAdmin } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Türkiye'nin 81 ili
const turkishProvinces = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin",
  "Aydın", "Balıkesir", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale",
  "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir",
  "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Isparta", "Mersin", "İstanbul", "İzmir",
  "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir", "Kocaeli", "Konya", "Kütahya", "Malatya",
  "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Rize", "Sakarya",
  "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Şanlıurfa", "Uşak",
  "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman", "Kırıkkale", "Batman", "Şırnak",
  "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
];

interface ShelterFormData {
  name: string;
  city: string;
  address: string;
  contactPhone: string;
  contactEmail: string;
  description: string;
  imageUrl: string;
}

const AddShelterForm: React.FC = () => {
  const [formData, setFormData] = useState<ShelterFormData>({
    name: '',
    city: turkishProvinces[0],
    address: '',
    contactPhone: '',
    contactEmail: '',
    description: '',
    imageUrl: '',
  });
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoadingSubmit(true);
    setError(null);
    setSuccess(null);

    if (!formData.name || !formData.city || !formData.address) {
      setError('Lütfen Barınak Adı, Şehir ve Adres alanlarını doldurun.');
      setLoadingSubmit(false);
      return;
    }

    try {
      const sheltersCollectionRef = collection(dbAdmin, 'shelters');
      await addDoc(sheltersCollectionRef, {
        name: formData.name,
        city: formData.city,
        address: formData.address,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
        description: formData.description,
        imageUrl: formData.imageUrl.trim(),
        createdAt: serverTimestamp(),
      });
      setSuccess(`${formData.name} barınağı (${formData.city}) başarıyla eklendi!`);
      setFormData({
        name: '', city: turkishProvinces[0], address: '', contactPhone: '',
        contactEmail: '', description: '', imageUrl: '',
      });
    } catch (err: unknown) {
      console.error("Barınak eklenirken hata:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError('Barınak eklenirken bir sorun oluştu: ' + errorMessage);
    } finally {
      setLoadingSubmit(false);
    }
  };

  const formStyles = {
    formContainer: {
      maxWidth: '750px',
      margin: '0 auto 30px auto', // Alt boşluk eklendi, üstteki App.tsx'den gelecek
      padding: '30px',
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 8px 25px rgba(0,0,0,0.07)',
      border: '1px solid #e9ecef',
    },
    formTitle: {
      textAlign: 'center' as const,
      color: '#2c3e50',
      marginBottom: '30px',
      fontSize: '1.8em',
      fontWeight: '600' as const,
    },
    formGroup: {
      marginBottom: '25px',
    },
    label: {
      display: 'block',
      marginBottom: '10px',
      fontWeight: '500' as const,
      color: '#495057',
      fontSize: '1em',
    },
    input: {
      width: '100%',
      padding: '14px 18px',
      border: '1px solid #ced4da',
      borderRadius: '8px',
      boxSizing: 'border-box' as const,
      fontSize: '1em',
      color: '#495057',
      backgroundColor: '#f8f9fa',
      transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    },
    textarea: {
      width: '100%',
      padding: '14px 18px',
      border: '1px solid #ced4da',
      borderRadius: '8px',
      minHeight: '120px',
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
      backgroundColor: '#f8f9fa',
      color: '#495057',
      appearance: 'none' as const,
      backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007bff%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.9z%22%2F%3E%3C%2Fsvg%3E")',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 1rem center',
      backgroundSize: '1em',
      paddingRight: '2.5rem',
    },
    button: {
      backgroundColor: '#007bff',
      color: 'white',
      padding: '14px 22px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '1.05em',
      fontWeight: '600' as const,
      transition: 'background-color 0.2s ease, transform 0.1s ease',
      display: 'inline-block',
      width: 'auto',
      minWidth: '150px',
      textAlign: 'center' as const,
    },
    buttonDisabled: {
      backgroundColor: '#a0c7e8',
      cursor: 'not-allowed',
      opacity: 0.7,
    },
    message: {
      padding: '15px 20px',
      borderRadius: '8px',
      marginBottom: '25px',
      textAlign: 'center' as const,
      fontSize: '1em',
      borderWidth: '1px',
      borderStyle: 'solid',
    },
    errorMessage: {
      backgroundColor: '#fdecea',
      color: '#b71c1c',
      borderColor: '#f5c6cb',
    },
    successMessage: {
      backgroundColor: '#d1f7d7',
      color: '#116328',
      borderColor: '#c3e6cb',
    },
  };

  return (
    <div style={formStyles.formContainer}>
      <h2 style={formStyles.formTitle}>Yeni Barınak Ekle</h2>
      {error && <div style={{...formStyles.message, ...formStyles.errorMessage}}>{error}</div>}
      {success && <div style={{...formStyles.message, ...formStyles.successMessage}}>{success}</div>}
      <form onSubmit={handleSubmit}>
        <div style={formStyles.formGroup}>
          <label htmlFor="name" style={formStyles.label}>Barınak Adı:*</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} style={formStyles.input} required />
        </div>

        <div style={formStyles.formGroup}>
          <label htmlFor="city" style={formStyles.label}>Şehir:*</label>
          <select
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            style={formStyles.select}
            required
          >
            {turkishProvinces.map(province => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>
        </div>

        <div style={formStyles.formGroup}>
          <label htmlFor="address" style={formStyles.label}>Adres:*</label>
          <textarea id="address" name="address" value={formData.address} onChange={handleChange} style={formStyles.textarea} required />
        </div>
        <div style={formStyles.formGroup}>
          <label htmlFor="contactPhone" style={formStyles.label}>Telefon:</label>
          <input type="tel" id="contactPhone" name="contactPhone" value={formData.contactPhone} onChange={handleChange} style={formStyles.input} />
        </div>
        <div style={formStyles.formGroup}>
          <label htmlFor="contactEmail" style={formStyles.label}>E-posta:</label>
          <input type="email" id="contactEmail" name="contactEmail" value={formData.contactEmail} onChange={handleChange} style={formStyles.input} />
        </div>
        <div style={formStyles.formGroup}>
          <label htmlFor="description" style={formStyles.label}>Açıklama:</label>
          <textarea id="description" name="description" value={formData.description} onChange={handleChange} style={formStyles.textarea} />
        </div>
        <div style={formStyles.formGroup}>
          <label htmlFor="imageUrl" style={formStyles.label}>Barınak Fotoğrafı/Logosu URL'si:</label>
          <input type="url" id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleChange} style={formStyles.input} placeholder="https://example.com/barinak-logosu.jpg"/>
        </div>
        <div style={{ textAlign: 'center' }}>
            <button type="submit" style={loadingSubmit ? {...formStyles.button, ...formStyles.buttonDisabled} : formStyles.button} disabled={loadingSubmit}>
            {loadingSubmit ? 'Ekleniyor...' : 'Barınağı Ekle'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default AddShelterForm;
