import { useState } from 'react';
import { ArrowLeft, MapPin, Truck, CreditCard, ChevronRight } from 'lucide-react';
import { mockDb } from '../services/mockDb';
import type { CartItem, User, Address } from '../services/mockDb';

interface CheckoutProps {
  cart: CartItem[];
  currentUser: User;
  onNavigate: (page: string, params?: any) => void;
  showToast: (msg: string) => void;
}

interface CourierOption {
  id: string;
  name: string;
  partner: string;
  fee: number;
  eta: string;
}

interface PaymentOption {
  id: string;
  name: string;
  channel: string;
  type: 'qris' | 'ewallet' | 'va';
}

export const Checkout = ({
  cart,
  currentUser,
  onNavigate,
  showToast
}: CheckoutProps) => {
  const [selectedAddress, setSelectedAddress] = useState<Address>(
    currentUser.addresses?.find(a => a.isDefault) || currentUser.addresses?.[0] || {
      id: 'addr_new',
      label: 'Rumah',
      recipientName: currentUser.name,
      recipientPhone: '08123456789',
      street: 'Jl. Merdeka Baru No. 12',
      city: 'Bandung',
      province: 'Jawa Barat',
      postalCode: '40115',
      isDefault: true
    }
  );

  const [selectedCourier, setSelectedCourier] = useState<string>('gosend');
  const [selectedPayment, setSelectedPayment] = useState<string>('qris');
  const [showAddressModal, setShowAddressModal] = useState(false);

  // Address form fields for editing
  const [editStreet, setEditStreet] = useState(selectedAddress.street);
  const [editCity, setEditCity] = useState(selectedAddress.city);
  const [editLabel, setEditLabel] = useState(selectedAddress.label);

  const itemSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const serviceFee = 1000;

  const couriers: CourierOption[] = [
    { id: 'gosend', name: 'GoSend Instant (Mitra Lokal)', partner: 'GoSend', fee: 15000, eta: '1-2 Jam' },
    { id: 'grab', name: 'GrabExpress Sameday (Mitra Lokal)', partner: 'GrabExpress', fee: 12000, eta: '3-6 Jam' },
    { id: 'jne', name: 'JNE Regular Cargo', partner: 'JNE', fee: 9000, eta: '1-2 Hari' },
    { id: 'sicepat', name: 'Sicepat Halu Pekat', partner: 'Sicepat', fee: 8000, eta: '2-3 Hari' }
  ];

  const payments: PaymentOption[] = [
    { id: 'qris', name: 'QRIS (Gopay/OVO/DANA/QR Code)', channel: 'QRIS', type: 'qris' },
    { id: 'gopay', name: 'GoPay E-Wallet', channel: 'GoPay', type: 'ewallet' },
    { id: 'dana', name: 'DANA E-Wallet', channel: 'DANA', type: 'ewallet' },
    { id: 'bca_va', name: 'BCA Virtual Account Transfer', channel: 'BCA Virtual Account', type: 'va' },
    { id: 'mandiri_va', name: 'Mandiri Virtual Account Transfer', channel: 'Mandiri Virtual Account', type: 'va' }
  ];

  const activeCourier = couriers.find(c => c.id === selectedCourier) || couriers[0];
  const activePayment = payments.find(p => p.id === selectedPayment) || payments[0];
  
  const deliveryFee = activeCourier.fee;
  const totalBill = itemSubtotal + serviceFee + deliveryFee;

  const formatPrice = (price: number) => {
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  const handleSaveAddress = () => {
    const updatedAddr: Address = {
      ...selectedAddress,
      street: editStreet,
      city: editCity,
      label: editLabel
    };
    setSelectedAddress(updatedAddr);
    
    // Sync with User Object
    const updatedUser = { ...currentUser };
    if (!updatedUser.addresses) updatedUser.addresses = [];
    const idx = updatedUser.addresses.findIndex(a => a.id === selectedAddress.id);
    if (idx !== -1) {
      updatedUser.addresses[idx] = updatedAddr;
    } else {
      updatedUser.addresses.push(updatedAddr);
    }
    mockDb.setCurrentUser(updatedUser);
    
    setShowAddressModal(false);
    showToast('Alamat pengiriman diperbarui');
  };

  const handlePlaceOrder = () => {
    // Create new order mapping primary farmer of first cart item for dashboard tracking
    const orderItems = cart.map(item => ({
      productId: item.product.id,
      title: item.product.title,
      price: item.product.price,
      quantity: item.quantity,
      unit: item.product.unit,
      image: item.product.image
    }));

    const orderData = {
      buyerId: currentUser.id,
      buyerName: currentUser.name,
      buyerPhone: selectedAddress.recipientPhone || '08123456789',
      buyerAddress: `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.province} ${selectedAddress.postalCode}`,
      items: orderItems,
      subtotal: itemSubtotal,
      deliveryFee,
      deliveryMethod: activeCourier.name,
      deliveryPartner: activeCourier.partner,
      paymentMethod: activePayment.name,
      paymentChannel: activePayment.channel,
      total: totalBill,
      farmerId: cart[0].product.farmerId // simplified store assign
    };

    const newOrder = mockDb.createOrder(orderData);
    
    // Navigate to simulated payment verification screen
    onNavigate('payment', { order: newOrder, paymentType: activePayment.type });
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.header}>
        <button onClick={() => onNavigate('cart')} style={styles.backBtn}>
          <ArrowLeft size={16} />
        </button>
        <h3 style={styles.title}>Pengiriman & Pembayaran</h3>
      </div>

      {/* Address Block */}
      <div className="glass-card" style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.cardHeaderTitle}>
            <MapPin size={16} style={{ color: 'var(--primary)' }} />
            <span>Alamat Pengiriman</span>
          </div>
          <button style={styles.changeBtn} onClick={() => {
            setEditStreet(selectedAddress.street);
            setEditCity(selectedAddress.city);
            setEditLabel(selectedAddress.label);
            setShowAddressModal(true);
          }}>Ubah</button>
        </div>
        <div style={styles.addressBody}>
          <h4 style={styles.addressName}>{selectedAddress.recipientName} ({selectedAddress.label})</h4>
          <p style={styles.addressPhone}>{selectedAddress.recipientPhone}</p>
          <p style={styles.addressStreet}>{selectedAddress.street}</p>
          <p style={styles.addressCity}>{selectedAddress.city}, {selectedAddress.province} {selectedAddress.postalCode}</p>
        </div>
      </div>

      {/* Address Edit Dialog Mock */}
      {showAddressModal && (
        <div style={styles.modalBackdrop}>
          <div className="glass-card" style={styles.modalContent}>
            <h4 style={{ marginBottom: '14px', fontFamily: 'var(--font-heading)' }}>Ubah Alamat Pengiriman</h4>
            
            <div className="form-group">
              <label className="form-label">Label Alamat</label>
              <input 
                type="text" 
                value={editLabel} 
                onChange={(e) => setEditLabel(e.target.value)} 
                className="input-field" 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Jalan / No. Rumah</label>
              <input 
                type="text" 
                value={editStreet} 
                onChange={(e) => setEditStreet(e.target.value)} 
                className="input-field" 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Kota / Kabupaten</label>
              <input 
                type="text" 
                value={editCity} 
                onChange={(e) => setEditCity(e.target.value)} 
                className="input-field" 
              />
            </div>

            <div style={styles.modalActions}>
              <button className="btn btn-secondary" onClick={() => setShowAddressModal(false)}>Batal</button>
              <button className="btn btn-primary" onClick={handleSaveAddress}>Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Courier Selector */}
      <div className="glass-card" style={styles.card}>
        <div style={styles.cardHeaderTitle}>
          <Truck size={16} style={{ color: 'var(--primary)' }} />
          <span>Pilih Kurir Pengiriman</span>
        </div>
        <div style={styles.optionList}>
          {couriers.map((cour) => (
            <label 
              key={cour.id} 
              style={{
                ...styles.optionRow,
                borderColor: selectedCourier === cour.id ? 'var(--primary)' : 'var(--border)',
                backgroundColor: selectedCourier === cour.id ? 'rgba(21, 100, 49, 0.03)' : 'transparent'
              }}
            >
              <input 
                type="radio" 
                name="courier" 
                checked={selectedCourier === cour.id}
                onChange={() => setSelectedCourier(cour.id)}
                style={styles.radioInput}
              />
              <div style={styles.optionText}>
                <span style={styles.optionName}>{cour.name}</span>
                <span style={styles.optionEta}>Estimasi: {cour.eta}</span>
              </div>
              <span style={styles.optionFee}>{formatPrice(cour.fee)}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Payment Partner Selector */}
      <div className="glass-card" style={styles.card}>
        <div style={styles.cardHeaderTitle}>
          <CreditCard size={16} style={{ color: 'var(--primary)' }} />
          <span>Metode Pembayaran</span>
        </div>
        <div style={styles.optionList}>
          {payments.map((pay) => (
            <label 
              key={pay.id} 
              style={{
                ...styles.optionRow,
                borderColor: selectedPayment === pay.id ? 'var(--primary)' : 'var(--border)',
                backgroundColor: selectedPayment === pay.id ? 'rgba(21, 100, 49, 0.03)' : 'transparent'
              }}
            >
              <input 
                type="radio" 
                name="payment" 
                checked={selectedPayment === pay.id}
                onChange={() => setSelectedPayment(pay.id)}
                style={styles.radioInput}
              />
              <div style={styles.optionText}>
                <span style={styles.optionName}>{pay.name}</span>
                <span style={styles.paymentBadge}>{pay.type.toUpperCase()}</span>
              </div>
              <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
            </label>
          ))}
        </div>
      </div>

      {/* Bill Tally Summary */}
      <div className="glass-card" style={styles.summaryCard}>
        <h4 style={styles.summaryTitle}>Rincian Tagihan</h4>
        <div style={styles.summaryRow}>
          <span>Subtotal Produk</span>
          <span>{formatPrice(itemSubtotal)}</span>
        </div>
        <div style={styles.summaryRow}>
          <span>Biaya Layanan Jasa</span>
          <span>{formatPrice(serviceFee)}</span>
        </div>
        <div style={styles.summaryRow}>
          <span>Biaya Pengiriman ({activeCourier.partner})</span>
          <span>{formatPrice(deliveryFee)}</span>
        </div>
        <div style={{ ...styles.summaryRow, borderTop: '1px solid var(--border)', paddingTop: '10px', marginTop: '10px' }}>
          <span style={{ fontWeight: 700 }}>Total Tagihan</span>
          <span style={styles.totalVal}>{formatPrice(totalBill)}</span>
        </div>

        <button style={styles.orderBtn} onClick={handlePlaceOrder}>
          Buat Pesanan ({formatPrice(totalBill)})
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '16px',
    paddingBottom: '30px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  backBtn: {
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: 'var(--text-main)',
  },
  title: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.15rem',
    fontWeight: 800,
    color: 'var(--text-main)',
  },
  card: {
    padding: '14px',
    marginBottom: '12px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  cardHeaderTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.82rem',
    fontWeight: 700,
    color: 'var(--text-main)',
    marginBottom: '10px',
  },
  changeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--primary-light)',
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  addressBody: {
    lineHeight: '1.4',
  },
  addressName: {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: 'var(--text-main)',
  },
  addressPhone: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    marginTop: '2px',
  },
  addressStreet: {
    fontSize: '0.78rem',
    color: 'var(--text-main)',
    marginTop: '4px',
  },
  addressCity: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  optionList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    marginTop: '6px',
  },
  optionRow: {
    border: '1px solid var(--border)',
    borderRadius: 'var(--border-radius-xs)',
    padding: '10px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  radioInput: {
    accentColor: 'var(--primary)',
  },
  optionText: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1px',
  },
  optionName: {
    fontSize: '0.78rem',
    fontWeight: 600,
    color: 'var(--text-main)',
  },
  optionEta: {
    fontSize: '0.68rem',
    color: 'var(--text-muted)',
  },
  optionFee: {
    fontSize: '0.82rem',
    fontWeight: 700,
    color: 'var(--text-main)',
  },
  paymentBadge: {
    fontSize: '0.55rem',
    backgroundColor: 'var(--border)',
    padding: '2px 6px',
    borderRadius: 'var(--border-radius-xs)',
    width: 'fit-content',
    fontWeight: 700,
    color: 'var(--text-muted)',
    marginTop: '3px',
  },
  summaryCard: {
    padding: '16px',
    marginTop: '16px',
  },
  summaryTitle: {
    fontSize: '0.85rem',
    fontWeight: 700,
    marginBottom: '12px',
    color: 'var(--text-main)',
    borderBottom: '1px solid var(--border)',
    paddingBottom: '8px',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    marginBottom: '6px',
  },
  totalVal: {
    fontSize: '1rem',
    fontWeight: 800,
    color: 'var(--primary)',
  },
  orderBtn: {
    width: '100%',
    backgroundColor: 'var(--accent)',
    color: '#fff',
    border: 'none',
    padding: '12px 16px',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.88rem',
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: '16px',
    boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)',
    transition: 'all var(--transition-fast)',
  },
  modalBackdrop: {
    position: 'absolute' as const,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  modalContent: {
    width: '100%',
    backgroundColor: 'var(--bg-surface)',
    padding: '20px',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '16px',
  }
};
