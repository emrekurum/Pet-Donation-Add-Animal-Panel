// src/components/AnimalDonationsModal.tsx
import React, { useState, useEffect, useCallback } from 'react';
// DÜZELTME: React Native importları kaldırıldı. Bu bir web projesi.
import { dbAdmin } from '../firebase';
import { collection, query, where, getDocs, orderBy, type QueryDocumentSnapshot, type DocumentData, type Timestamp } from 'firebase/firestore';

interface Donation {
  id: string;
  userId?: string;
  userName?: string;
  donationType?: string;
  amount?: number;
  currency?: string;
  description?: string;
  donationDate?: Timestamp;
}

interface AnimalDonationsModalProps {
  animalId: string | null;
  animalName?: string | null;
  isVisible: boolean;
  onClose: () => void;
}

// DÜZELTME: Modal için lokal renk tanımlamaları
const modalLocalColors = {
  primary: '#007bff',
  textPrimary: '#212529',
  textSecondary: '#6c757d',
  surface: '#ffffff',
  background: '#f8f9fa',
  border: '#e9ecef',
  error: '#dc3545', // Hata mesajları için
  shadow: 'rgba(0,0,0,0.3)',
  closeButtonBg: '#6c757d',
  closeButtonText: '#ffffff',
};

const modalStyles = {
  centeredView: {
    position: 'fixed' as 'fixed',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    backgroundColor: modalLocalColors.shadow, // DÜZELTME
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalView: {
    width: '90%',
    maxWidth: '700px',
    maxHeight: '80vh',
    backgroundColor: modalLocalColors.surface, // DÜZELTME
    borderRadius: '12px',
    padding: '25px',
    boxShadow: `0 5px 15px ${modalLocalColors.shadow}`, // DÜZELTME
    display: 'flex',
    flexDirection: 'column' as 'column',
  },
  modalTitle: {
    fontSize: '1.6em',
    fontWeight: '600' as '600',
    color: modalLocalColors.textPrimary, // DÜZELTME
    marginBottom: '20px',
    textAlign: 'center' as 'center',
    borderBottom: `1px solid ${modalLocalColors.border}`, // DÜZELTME
    paddingBottom: '15px',
  },
  listContainer: {
    flexGrow: 1,
    overflowY: 'auto' as 'auto',
    paddingRight: '10px',
  },
  donationItem: {
    backgroundColor: modalLocalColors.background, // DÜZELTME
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '12px',
    border: `1px solid ${modalLocalColors.border}`, // DÜZELTME
  },
  donationText: {
    fontSize: '1em',
    color: modalLocalColors.textSecondary, // DÜZELTME
    marginBottom: '5px',
  },
  donationDetail: {
    fontWeight: '500' as '500',
    color: modalLocalColors.textPrimary, // DÜZELTME
  },
  closeButtonContainer: {
    marginTop: '20px',
    textAlign: 'right' as 'right',
  },
  closeButton: {
    backgroundColor: modalLocalColors.closeButtonBg, // DÜZELTME
    color: modalLocalColors.closeButtonText, // DÜZELTME
    padding: '10px 20px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1em',
    fontWeight: '500' as '500',
  },
  noDonationsText: {
    textAlign: 'center' as 'center',
    padding: '20px',
    fontSize: '1.1em',
    color: modalLocalColors.textSecondary, // DÜZELTME
  },
  loadingContainer: {
    padding: '30px',
    textAlign: 'center' as 'center',
  },
  errorMessageText: { // Hata mesajı için stil
    textAlign: 'center' as 'center',
    padding: '20px',
    fontSize: '1.1em',
    color: modalLocalColors.error, // DÜZELTME
  }
};


const AnimalDonationsModal: React.FC<AnimalDonationsModalProps> = ({ animalId, animalName, isVisible, onClose }) => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDonationsForAnimal = useCallback(async () => {
    if (!animalId) {
      setDonations([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const donationsRef = collection(dbAdmin, 'donations');
      const q = query(
        donationsRef,
        where('animalId', '==', animalId),
        orderBy('donationDate', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const fetchedDonations: Donation[] = querySnapshot.docs.map(
        (doc: QueryDocumentSnapshot<DocumentData>) => ({
          id: doc.id,
          userId: doc.data().userId as string,
          userName: doc.data().userName as string || 'Bilinmiyor',
          donationType: doc.data().donationType as string,
          amount: doc.data().amount as number,
          currency: doc.data().currency as string,
          description: doc.data().description as string,
          donationDate: doc.data().donationDate as Timestamp,
        })
      );
      setDonations(fetchedDonations);
    } catch (err: any) {
      console.error(`Hayvan (${animalId}) için bağışlar çekilirken hata:`, err);
      if (err.code === 'firestore/failed-precondition') {
        setError("Bağışları listelemek için Firebase'de bir indeks oluşturmanız gerekebilir. Lütfen Firebase konsolundaki hata mesajını kontrol edin.");
      } else {
        setError('Bağışlar yüklenirken bir sorun oluştu.');
      }
    } finally {
      setLoading(false);
    }
  }, [animalId]);

  useEffect(() => {
    if (isVisible && animalId) {
      fetchDonationsForAnimal();
    } else {
      setDonations([]);
      setError(null);
    }
  }, [isVisible, animalId, fetchDonationsForAnimal]);

  if (!isVisible) {
    return null;
  }

  const formatDate = (timestamp: Timestamp | undefined) => {
    if (!timestamp) return 'Bilinmiyor';
    return new Date(timestamp.toDate().getTime()).toLocaleDateString('tr-TR', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div style={modalStyles.centeredView} onClick={onClose}> {/* Arka plana tıklayınca kapatma */}
      <div style={modalStyles.modalView} onClick={(e) => e.stopPropagation()}> {/* Modal içeriğine tıklayınca kapanmasını engelle */}
        <h3 style={modalStyles.modalTitle}>
          {animalName || 'Hayvan'} İçin Yapılan Bağışlar (ID: {animalId})
        </h3>
        <div style={modalStyles.listContainer}>
          {loading ? (
            <div style={modalStyles.loadingContainer}><p>Bağışlar yükleniyor...</p></div> // ActivityIndicator yerine metin
          ) : error ? (
            <p style={modalStyles.errorMessageText}>{error}</p> // DÜZELTME: Hata stili
          ) : donations.length === 0 ? (
            <p style={modalStyles.noDonationsText}>Bu hayvana henüz hiç bağış yapılmamış.</p>
          ) : (
            donations.map(donation => ( // FlatList yerine map kullanıldı (web için daha basit)
              <div key={donation.id} style={modalStyles.donationItem}>
                <p style={modalStyles.donationText}>
                  <strong>Bağış Yapan:</strong> <span style={modalStyles.donationDetail}>{donation.userName || donation.userId || 'Bilinmiyor'}</span>
                </p>
                <p style={modalStyles.donationText}>
                  <strong>Tür:</strong> <span style={modalStyles.donationDetail}>{donation.donationType || '-'}</span>
                </p>
                {donation.donationType === 'Nakit' && donation.amount != null && ( // null kontrolü eklendi
                  <p style={modalStyles.donationText}>
                    <strong>Miktar:</strong> <span style={modalStyles.donationDetail}>{donation.amount.toFixed(2)} {donation.currency || 'TL'}</span>
                  </p>
                )}
                {donation.description && (
                  <p style={modalStyles.donationText}>
                    <strong>Açıklama:</strong> <span style={modalStyles.donationDetail}>{donation.description}</span>
                  </p>
                )}
                <p style={modalStyles.donationText}>
                  <strong>Tarih:</strong> <span style={modalStyles.donationDetail}>{formatDate(donation.donationDate)}</span>
                </p>
              </div>
            ))
          )}
        </div>
        <div style={modalStyles.closeButtonContainer}>
          <button onClick={onClose} style={modalStyles.closeButton}>
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnimalDonationsModal;
