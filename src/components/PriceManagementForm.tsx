// src/components/PriceManagementForm.tsx
import React, { useState, useEffect } from 'react';
// DÜZELTME: Tip-sadece importlar kullanıldı
import type { FormEvent, ChangeEvent } from 'react';
import { dbAdmin } from '../firebase';
// DÜZELTME: getDoc kaldırıldı, getDocs zaten import edilmişti.
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';

interface ItemPrice {
  id: string;
  name: string;
  unitPrice: number;
}

const initialItemPrices: ItemPrice[] = [
  { id: 'Mama', name: 'Mama', unitPrice: 50 },
  { id: 'Oyuncak', name: 'Oyuncak', unitPrice: 30 },
  { id: 'İlaç', name: 'İlaç Desteği', unitPrice: 75 },
];

const PriceManagementForm: React.FC = () => {
  const [itemPrices, setItemPrices] = useState<ItemPrice[]>(initialItemPrices);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // pricesCollectionRef component dışında veya useCallback içinde tanımlanabilir,
  // şimdilik burada bırakıyorum, useEffect bağımlılıklarından çıkarıldı.
  // const pricesCollectionRef = collection(dbAdmin, 'donationItemPrices');

  useEffect(() => {
    const fetchPrices = async () => {
      setLoading(true);
      setError(null);
      const pricesCollectionRef = collection(dbAdmin, 'donationItemPrices'); // useEffect içinde tanımlandı
      try {
        const querySnapshot = await getDocs(pricesCollectionRef);
        if (querySnapshot.empty) {
          console.log("Firestore'da fiyat kaydı bulunamadı, varsayılanlar kullanılıyor. Kaydetmek için 'Fiyatları Güncelle' butonunu kullanın.");
          setItemPrices([...initialItemPrices]);
        } else {
          const fetchedPrices: ItemPrice[] = [];
          querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            fetchedPrices.push({
              id: docSnap.id,
              name: data.name || docSnap.id,
              unitPrice: data.unitPrice === undefined || data.unitPrice === null ? 0 : Number(data.unitPrice), // Sayı olduğundan emin ol
            });
          });
          const updatedPrices = initialItemPrices.map(initialItem => {
            const fetched = fetchedPrices.find(fp => fp.id === initialItem.id);
            return fetched ? { ...initialItem, unitPrice: fetched.unitPrice, name: fetched.name } : initialItem;
          });
          setItemPrices(updatedPrices);
        }
      } catch (err) {
        console.error("Fiyatlar çekilirken hata:", err);
        setError('Fiyatlar yüklenemedi. Lütfen sayfayı yenileyin.');
        setItemPrices([...initialItemPrices]);
      } finally {
        setLoading(false);
      }
    };
    fetchPrices();
  }, []); // Bağımlılık dizisi boş bırakıldı, sadece component mount olduğunda çalışır

  const handlePriceChange = (id: string, value: string) => {
    // Kullanıcı input'u sildiğinde value boş string olabilir, bu durumda NaN'a çevrilmemeli
    const newPrice = value === '' ? 0 : parseFloat(value); // Boşsa 0 kabul et veya isteğe bağlı olarak hata ver
    setItemPrices(prevPrices =>
      prevPrices.map(item =>
        item.id === id ? { ...item, unitPrice: isNaN(newPrice) ? item.unitPrice : newPrice } : item // Eğer NaN ise eski değeri koru
      )
    );
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // DÜZELTME: Kullanılmayan 'batch' ve 'itemDocRef' kaldırıldı.
      // Firestore'a yazma işlemi döngü içinde tek tek yapılıyor.
      // Çok sayıda item varsa batch write düşünülebilir, ama 3 item için bu yeterli.
      for (const item of itemPrices) {
        if (isNaN(item.unitPrice) || item.unitPrice < 0) {
            setError(`${item.name} için geçerli bir fiyat girin (negatif olamaz).`);
            setSaving(false);
            return;
        }
        const itemDocRefToSet = doc(dbAdmin, 'donationItemPrices', item.id); // Yeni değişken adı
        await setDoc(itemDocRefToSet, { name: item.name, unitPrice: Number(item.unitPrice) }, { merge: true });
      }
      setSuccess('Fiyatlar başarıyla güncellendi!');
    } catch (err) {
      console.error("Fiyatlar güncellenirken hata:", err);
      setError('Fiyatlar güncellenirken bir sorun oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const formStyles = {
    formContainer: { maxWidth: '600px', margin: '30px auto', padding: '30px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 6px 12px rgba(0,0,0,0.08)', border: '1px solid #e9ecef', fontFamily: "'Roboto', sans-serif" },
    formTitle: { textAlign: 'center' as const, color: '#2c3e50', marginBottom: '30px', fontSize: '1.8em', fontWeight: '600' as const },
    formGroup: { marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    label: { fontWeight: '500' as const, color: '#495057', fontSize: '1.1em', marginRight: '15px', flexBasis: '40%' },
    input: { width: '100%', padding: '12px 15px', border: '1px solid #ced4da', borderRadius: '6px', boxSizing: 'border-box' as const, fontSize: '1em', color: '#495057', backgroundColor: '#f8f9fa', flexBasis: '55%' },
    button: { backgroundColor: '#007bff', color: 'white', padding: '12px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1.05em', fontWeight: 'bold', display: 'block', width: '100%', marginTop: '10px' },
    buttonDisabled: { backgroundColor: '#a0c7e8', cursor: 'not-allowed' },
    message: { padding: '12px 15px', borderRadius: '6px', marginBottom: '20px', textAlign: 'center' as const, fontSize: '1em', borderWidth: '1px', borderStyle: 'solid' },
    errorMessage: { backgroundColor: '#fdecea', color: '#b71c1c', borderColor: '#f5c6cb' },
    successMessage: { backgroundColor: '#d1f7d7', color: '#116328', borderColor: '#c3e6cb' },
    loadingText: { textAlign: 'center' as const, fontSize: '1.1em', color: '#495057', padding: '20px'}
  };

  if (loading) {
    return <div style={formStyles.loadingText}>Fiyatlar yükleniyor...</div>;
  }

  return (
    <div style={formStyles.formContainer}>
      <h2 style={formStyles.formTitle}>Bağış Item Fiyatlarını Yönet</h2>
      {error && <div style={{...formStyles.message, ...formStyles.errorMessage}}>{error}</div>}
      {success && <div style={{...formStyles.message, ...formStyles.successMessage}}>{success}</div>}
      <form onSubmit={handleSubmit}>
        {itemPrices.map(item => (
          <div key={item.id} style={formStyles.formGroup}>
            <label htmlFor={`price-${item.id}`} style={formStyles.label}>{item.name} Birim Fiyatı (TL):</label>
            <input
              type="number"
              id={`price-${item.id}`}
              name={item.id}
              value={item.unitPrice} // unitPrice artık number tipinde
              onChange={(e: ChangeEvent<HTMLInputElement>) => handlePriceChange(item.id, e.target.value)} // ChangeEvent burada kullanılıyor
              style={formStyles.input}
              min="0"
              step="0.01"
            />
          </div>
        ))}
        <button type="submit" style={saving ? {...formStyles.button, ...formStyles.buttonDisabled} : formStyles.button} disabled={saving}>
          {saving ? 'Kaydediliyor...' : 'Fiyatları Güncelle'}
        </button>
      </form>
    </div>
  );
};

export default PriceManagementForm;
