// src/components/AddShelterForm.tsx
import React, { useState } from 'react';
import { dbAdmin } from '../firebase'; // Admin paneli için Firebase instance'ı
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface ShelterFormData {
  name: string;
  city: string;
  address: string;
  contactPhone: string;
  contactEmail: string;
  description: string;
  imageUrl: string;
  // İleride eklenebilecekler: çalışma saatleri, web sitesi vb.
}

const AddShelterForm: React.FC = () => {
  const [formData, setFormData] = useState<ShelterFormData>({
    name: '',
    city: '',
    address: '',
    contactPhone: '',
    contactEmail: '',
    description: '',
    imageUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!formData.name || !formData.city || !formData.address) {
      setError('Lütfen Barınak Adı, Şehir ve Adres alanlarını doldurun.');
      setLoading(false);
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
        imageUrl: formData.imageUrl,
        createdAt: serverTimestamp(),
      });
      setSuccess(`${formData.name} barınağı başarıyla eklendi!`);
      setFormData({ // Formu sıfırla
        name: '', city: '', address: '', contactPhone: '',
        contactEmail: '', description: '', imageUrl: '',
      });
    } catch (err: unknown) {
      console.error("Barınak eklenirken hata:", err);
      if (err instanceof Error) {
        setError('Barınak eklenirken bir sorun oluştu: ' + err.message);
      } else {
        setError('Barınak eklenirken bilinmeyen bir sorun oluştu.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Stiller AddAnimalForm ile benzer olabilir, gerekirse özelleştirin
  const styles = { /* ... AddAnimalForm'daki stil nesnesini buraya kopyalayabilirsiniz ... */
    formContainer: { maxWidth: '600px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'Arial, sans-serif', },
    formGroup: { marginBottom: '15px' },
    label: { display: 'block', marginBottom: '5px', fontWeight: 'bold' },
    input: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' as const, },
    textarea: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '80px', boxSizing: 'border-box' as const, },
    button: { backgroundColor: '#007bff', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', },
    buttonDisabled: { backgroundColor: '#aaa', cursor: 'not-allowed' },
    message: { padding: '10px', borderRadius: '4px', marginBottom: '15px', textAlign: 'center' as const, },
    errorMessage: { backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb', },
    successMessage: { backgroundColor: '#d4edda', color: '#155724', border: '1px solid #c3e6cb', },
  };


  return (
    <div style={styles.formContainer}>
      <h2>Yeni Barınak Ekle</h2>
      {error && <div style={{...styles.message, ...styles.errorMessage}}>{error}</div>}
      {success && <div style={{...styles.message, ...styles.successMessage}}>{success}</div>}
      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label htmlFor="name" style={styles.label}>Barınak Adı:*</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} style={styles.input} required />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="city" style={styles.label}>Şehir:*</label>
          <input type="text" id="city" name="city" value={formData.city} onChange={handleChange} style={styles.input} required />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="address" style={styles.label}>Adres:*</label>
          <textarea id="address" name="address" value={formData.address} onChange={handleChange} style={styles.textarea} required />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="contactPhone" style={styles.label}>Telefon:</label>
          <input type="tel" id="contactPhone" name="contactPhone" value={formData.contactPhone} onChange={handleChange} style={styles.input} />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="contactEmail" style={styles.label}>E-posta:</label>
          <input type="email" id="contactEmail" name="contactEmail" value={formData.contactEmail} onChange={handleChange} style={styles.input} />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="description" style={styles.label}>Açıklama:</label>
          <textarea id="description" name="description" value={formData.description} onChange={handleChange} style={styles.textarea} />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="imageUrl" style={styles.label}>Barınak Resim URL'si:</label>
          <input type="url" id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleChange} style={styles.input} placeholder="https://example.com/shelter.jpg"/>
        </div>
        <button type="submit" style={loading ? {...styles.button, ...styles.buttonDisabled} : styles.button} disabled={loading}>
          {loading ? 'Ekleniyor...' : 'Barınağı Ekle'}
        </button>
      </form>
    </div>
  );
};

export default AddShelterForm;
