import { Trash2, ShoppingBasket, ArrowRight, ArrowLeft } from 'lucide-react';
import type { CartItem } from '../services/mockDb';

interface CartProps {
  cart: CartItem[];
  onUpdateQty: (productId: string, qty: number) => void;
  onNavigate: (page: string, params?: any) => void;
  currentUser: any;
  showToast: (msg: string) => void;
}

export const Cart = ({
  cart,
  onUpdateQty,
  onNavigate,
  currentUser,
  showToast
}: CartProps) => {
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const formatPrice = (price: number) => {
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  const handleCheckout = () => {
    if (!currentUser) {
      showToast('Silakan masuk akun terlebih dahulu!');
      // Navigate to login, telling it to return to checkout afterwards
      onNavigate('login', { redirectTo: 'checkout' });
    } else {
      onNavigate('checkout');
    }
  };

  if (cart.length === 0) {
    return (
      <div style={styles.emptyContainer} className="animate-fade-in">
        <div style={styles.emptyCircle}>
          <ShoppingBasket size={44} style={{ color: 'var(--text-muted)' }} />
        </div>
        <h3 style={styles.emptyTitle}>Keranjang Anda Kosong</h3>
        <p style={styles.emptyText}>Mulai belanja buah dan sayur segar pilihan Anda langsung dari petani lokal.</p>
        <button style={styles.shopBtn} onClick={() => onNavigate('home')}>
          Mulai Belanja
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.header}>
        <button onClick={() => onNavigate('home')} style={styles.backBtn}>
          <ArrowLeft size={16} />
        </button>
        <h3 style={styles.title}>Keranjang Belanja</h3>
        <span style={styles.countText}>({cart.length} item)</span>
      </div>

      {/* Cart Items List */}
      <div style={styles.itemsList}>
        {cart.map((item) => (
          <div key={item.product.id} className="glass-card" style={styles.itemCard}>
            <img src={item.product.image} alt={item.product.title} style={styles.itemImg} />
            <div style={styles.itemDetails}>
              <span style={styles.farmerLabel}>{item.product.farmerName} • {item.product.location}</span>
              <h4 style={styles.itemTitle}>{item.product.title}</h4>
              <span style={styles.itemPrice}>{formatPrice(item.product.price)} <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>/ {item.product.unit}</span></span>
              
              <div style={styles.cardFooter}>
                {/* Quantity adjust */}
                <div style={styles.qtyContainer}>
                  <button onClick={() => onUpdateQty(item.product.id, item.quantity - 1)} style={styles.qtyBtn}>-</button>
                  <span style={styles.qtyVal}>{item.quantity}</span>
                  <button onClick={() => onUpdateQty(item.product.id, item.quantity + 1)} style={styles.qtyBtn}>+</button>
                </div>

                <button onClick={() => {
                  onUpdateQty(item.product.id, 0);
                  showToast(`${item.product.title} dihapus`);
                }} style={styles.deleteBtn}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Summary Card */}
      <div className="glass-card" style={styles.summaryCard}>
        <h4 style={styles.summaryTitle}>Ringkasan Belanja</h4>
        <div style={styles.summaryRow}>
          <span>Total Harga ({cart.reduce((s, i) => s + i.quantity, 0)} Barang)</span>
          <span style={styles.summaryVal}>{formatPrice(subtotal)}</span>
        </div>
        <div style={styles.summaryRow}>
          <span>Biaya Layanan Jasa</span>
          <span>Rp 1.000</span>
        </div>
        <div style={{ ...styles.summaryRow, borderTop: '1px solid var(--border)', paddingTop: '10px', marginTop: '10px' }}>
          <span style={{ fontWeight: 700 }}>Total Pembayaran</span>
          <span style={styles.totalVal}>{formatPrice(subtotal + 1000)}</span>
        </div>

        <button style={styles.checkoutBtn} onClick={handleCheckout}>
          <span>Lanjut ke Pembayaran</span>
          <ArrowRight size={16} />
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
  countText: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontWeight: 600,
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
    marginBottom: '20px',
  },
  itemCard: {
    display: 'flex',
    gap: '12px',
    padding: '10px',
  },
  itemImg: {
    width: 68,
    height: 68,
    borderRadius: 'var(--border-radius-xs)',
    objectFit: 'cover' as const,
    flexShrink: 0,
  },
  itemDetails: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
  },
  farmerLabel: {
    fontSize: '0.6rem',
    color: 'var(--text-muted)',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
  },
  itemTitle: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'var(--text-main)',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginTop: '2px',
  },
  itemPrice: {
    fontSize: '0.82rem',
    fontWeight: 700,
    color: 'var(--primary)',
    marginTop: '2px',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '8px',
  },
  qtyContainer: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid var(--border)',
    borderRadius: 'var(--border-radius-xs)',
    padding: '2px',
  },
  qtyBtn: {
    width: 22,
    height: 22,
    borderRadius: '4px',
    border: 'none',
    background: 'none',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
    color: 'var(--text-main)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyVal: {
    minWidth: 22,
    textAlign: 'center' as const,
    fontSize: '0.78rem',
    fontWeight: 700,
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '4px',
  },
  summaryCard: {
    padding: '16px',
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
  summaryVal: {
    color: 'var(--text-main)',
    fontWeight: 600,
  },
  totalVal: {
    fontSize: '1rem',
    fontWeight: 800,
    color: 'var(--primary)',
  },
  checkoutBtn: {
    width: '100%',
    backgroundColor: 'var(--primary)',
    color: '#fff',
    border: 'none',
    padding: '12px 16px',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.88rem',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer',
    marginTop: '16px',
    boxShadow: 'var(--shadow-primary)',
    transition: 'all var(--transition-fast)',
  },
  emptyContainer: {
    padding: '60px 24px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center' as const,
  },
  emptyCircle: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    backgroundColor: 'var(--bg-surface-elevated)',
    border: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.1rem',
    fontWeight: 800,
    color: 'var(--text-main)',
    marginBottom: '8px',
  },
  emptyText: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
    marginBottom: '20px',
  },
  shopBtn: {
    backgroundColor: 'var(--primary)',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: 'var(--border-radius-sm)',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer',
    boxShadow: 'var(--shadow-primary)',
  }
};
