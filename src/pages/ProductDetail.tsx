import { useState, useEffect } from 'react';
import { ArrowLeft, Heart, Star, ShoppingBag, ShieldCheck, MapPin, Truck } from 'lucide-react';
import { mockDb } from '../services/mockDb';
import type { Product } from '../services/mockDb';

interface ProductDetailProps {
  product: Product;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onNavigate: (page: string, params?: any) => void;
  showToast: (msg: string) => void;
}

export const ProductDetail = ({
  product,
  favorites,
  onToggleFavorite,
  onAddToCart,
  onNavigate,
  showToast
}: ProductDetailProps) => {
  const [qty, setQty] = useState(1);
  const [farmer, setFarmer] = useState<any>(null);

  useEffect(() => {
    // Find the farmer in DB
    const farmers = mockDb.getUsers().filter(u => u.role === 'seller');
    const fObj = farmers.find(f => f.id === product.farmerId);
    setFarmer(fObj || {
      name: product.farmerName,
      companyName: 'Petani Mitra Lokal',
      location: product.location,
      avatar: product.farmerAvatar,
      rating: 4.8,
      shippingPartners: ['jne', 'sicepat'],
      paymentMethods: ['qris', 'gopay']
    });
  }, [product]);

  const handleIncrement = () => {
    if (qty < product.stock) {
      setQty(qty + 1);
    } else {
      showToast('Stok produk terbatas!');
    }
  };

  const handleDecrement = () => {
    if (qty > 1) {
      setQty(qty - 1);
    }
  };

  const handleAddToBasket = () => {
    onAddToCart(product, qty);
    showToast(`${qty} ${product.unit} ${product.title} ditambahkan!`);
  };

  const formatPrice = (price: number) => {
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  const isFavorite = favorites.includes(product.id);

  return (
    <div style={styles.container} className="animate-fade-in">
      {/* Header action bar overlay */}
      <div style={styles.topBar}>
        <button onClick={() => onNavigate('home')} style={styles.backBtn}>
          <ArrowLeft size={18} />
        </button>
        <button 
          onClick={() => {
            onToggleFavorite(product.id);
            showToast(isFavorite ? 'Dihapus dari favorit' : 'Ditambahkan ke favorit');
          }}
          style={styles.heartBtn}
        >
          <Heart size={18} fill={isFavorite ? 'var(--danger)' : 'none'} stroke={isFavorite ? 'var(--danger)' : 'currentColor'} />
        </button>
      </div>

      {/* Hero Image */}
      <div style={styles.imageWrapper}>
        <img src={product.image} alt={product.title} style={styles.heroImg} />
      </div>

      {/* Info Panel */}
      <div style={styles.infoPanel}>
        <div style={styles.categoryRow}>
          <span className="badge badge-primary">{product.category}</span>
          <span style={styles.stockText}>Stok: <strong>{product.stock} {product.unit}</strong></span>
        </div>

        <h2 style={styles.title}>{product.title}</h2>

        <div style={styles.ratingRow}>
          <Star size={14} fill="var(--accent)" stroke="none" />
          <span style={styles.ratingVal}>{product.rating}</span>
          <span style={styles.soldCount}>• Terjual {product.salesCount} {product.unit}</span>
          <span style={styles.locationText}><MapPin size={12} /> {product.location}</span>
        </div>

        <div style={styles.priceContainer}>
          <span style={styles.priceBig}>
            {formatPrice(product.price)}
            <span style={styles.priceUnit}>/{product.unit}</span>
          </span>
        </div>

        {/* Product Description */}
        <div style={styles.descSection}>
          <h3 style={styles.sectionHeader}>Deskripsi Produk</h3>
          <p style={styles.descParagraph}>{product.description}</p>
        </div>

        {/* Farmer Profile Card */}
        {farmer && (
          <div className="glass-card" style={styles.farmerCard}>
            <h4 style={styles.farmerHeader}>Informasi Penjual (Petani)</h4>
            <div style={styles.farmerRow}>
              <img src={farmer.avatar} alt={farmer.name} style={styles.farmerAvatar} />
              <div style={styles.farmerInfo}>
                <h4 style={styles.farmerName}>{farmer.name}</h4>
                <p style={styles.farmerCompany}>{farmer.companyName}</p>
                <div style={styles.ratingRow}>
                  <Star size={12} fill="var(--accent)" stroke="none" />
                  <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>{farmer.rating || 4.9}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>• {farmer.location}</span>
                </div>
              </div>
            </div>
            
            <div style={styles.farmerMetas}>
              <div style={styles.metaRow}>
                <Truck size={12} style={{ color: 'var(--primary-light)' }} />
                <span style={styles.metaText}>
                  Mitra Pengiriman: <strong>{farmer.shippingPartners?.map((s: string) => s.toUpperCase()).join(', ') || 'JNE, GoSend'}</strong>
                </span>
              </div>
              <div style={styles.metaRow}>
                <ShieldCheck size={12} style={{ color: 'var(--primary-light)' }} />
                <span style={styles.metaText}>
                  Pembayaran: Terverifikasi Otomatis Sistem
                </span>
              </div>
            </div>
            
            {/* WhatsApp Contact Simulation */}
            <button 
              style={styles.chatBtn}
              onClick={() => showToast(`Simulasi: Membuka WhatsApp chat ke ${farmer.name}...`)}
            >
              💬 Hubungi Petani via WhatsApp
            </button>
          </div>
        )}

        {/* Quality Guarantee Note */}
        <div style={styles.guaranteeBox}>
          <span style={{ fontSize: '1.2rem' }}>🤝</span>
          <div>
            <h4 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)' }}>Lapak Tani Quality Guarantee</h4>
            <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Sayuran dan buah dipetik segar, dikemas steril, dan langsung dikirim dari lahan petani lokal Indonesia.</p>
          </div>
        </div>
      </div>

      {/* Floating Sticky Bottom Bar for Basket Addition */}
      <div style={styles.floatingBar}>
        <div style={styles.qtyContainer}>
          <button onClick={handleDecrement} style={styles.qtyBtn}>-</button>
          <span style={styles.qtyVal}>{qty}</span>
          <button onClick={handleIncrement} style={styles.qtyBtn}>+</button>
        </div>
        
        <button onClick={handleAddToBasket} style={styles.actionBtn}>
          <ShoppingBag size={16} />
          <div style={styles.actionBtnText}>
            <span>Beli Sekarang</span>
            <span style={styles.actionTotal}>{formatPrice(product.price * qty)}</span>
          </div>
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    paddingBottom: '100px', // space for floating bar
  },
  topBar: {
    position: 'absolute' as const,
    top: 12,
    left: 12,
    right: 12,
    display: 'flex',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    border: 'none',
    boxShadow: 'var(--shadow-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'var(--text-main)',
  },
  heartBtn: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    border: 'none',
    boxShadow: 'var(--shadow-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'var(--text-main)',
  },
  imageWrapper: {
    height: 250,
    width: '100%',
    overflow: 'hidden',
  },
  heroImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  infoPanel: {
    padding: '16px',
    borderTopLeftRadius: 'var(--border-radius-md)',
    borderTopRightRadius: 'var(--border-radius-md)',
    backgroundColor: 'var(--bg-surface)',
    marginTop: '-20px',
    position: 'relative' as const,
    boxShadow: '0 -4px 10px rgba(0,0,0,0.02)',
  },
  categoryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  stockText: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  title: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.25rem',
    fontWeight: 800,
    color: 'var(--text-main)',
    marginBottom: '8px',
    lineHeight: '1.2',
  },
  ratingRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: '4px',
    marginBottom: '14px',
  },
  ratingVal: {
    fontSize: '0.78rem',
    fontWeight: 700,
    color: 'var(--text-main)',
  },
  soldCount: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  locationText: {
    fontSize: '0.72rem',
    color: 'var(--primary-light)',
    fontWeight: 600,
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
  },
  priceContainer: {
    backgroundColor: 'rgba(21, 100, 49, 0.05)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '12px',
    marginBottom: '16px',
  },
  priceBig: {
    fontSize: '1.45rem',
    fontWeight: 800,
    color: 'var(--primary)',
  },
  priceUnit: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    fontWeight: 500,
  },
  descSection: {
    marginBottom: '20px',
  },
  sectionHeader: {
    fontSize: '0.9rem',
    fontWeight: 700,
    marginBottom: '8px',
    color: 'var(--text-main)',
  },
  descParagraph: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    lineHeight: '1.5',
  },
  farmerCard: {
    padding: '12px',
    marginBottom: '16px',
  },
  farmerHeader: {
    fontSize: '0.78rem',
    fontWeight: 700,
    marginBottom: '10px',
    color: 'var(--text-main)',
  },
  farmerRow: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    borderBottom: '1px solid var(--border)',
    paddingBottom: '10px',
    marginBottom: '10px',
  },
  farmerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 'var(--border-radius-full)',
    objectFit: 'cover' as const,
  },
  farmerInfo: {
    flex: 1,
  },
  farmerName: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: 'var(--text-main)',
  },
  farmerCompany: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    marginTop: '1px',
  },
  farmerMetas: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
    marginBottom: '10px',
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  metaText: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
  },
  chatBtn: {
    background: '#128C7E',
    border: 'none',
    color: '#fff',
    padding: '8px 12px',
    borderRadius: 'var(--border-radius-xs)',
    fontSize: '0.78rem',
    fontWeight: 600,
    width: '100%',
    cursor: 'pointer',
    textAlign: 'center' as const,
    boxShadow: '0 4px 10px rgba(18, 140, 126, 0.2)',
  },
  guaranteeBox: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
    border: '1px dashed var(--accent)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '10px 12px',
  },
  floatingBar: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'var(--bg-surface)',
    borderTop: '1px solid var(--border)',
    padding: '12px 16px 20px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 -6px 18px rgba(0,0,0,0.06)',
    zIndex: 890,
  },
  qtyContainer: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid var(--border)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '4px',
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 'var(--border-radius-xs)',
    border: 'none',
    background: 'none',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    color: 'var(--text-main)',
  },
  qtyVal: {
    minWidth: 28,
    textAlign: 'center' as const,
    fontSize: '0.88rem',
    fontWeight: 700,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: 'var(--primary)',
    border: 'none',
    color: '#fff',
    padding: '10px 16px',
    borderRadius: 'var(--border-radius-sm)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    justifyContent: 'center',
    boxShadow: 'var(--shadow-primary)',
  },
  actionBtnText: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    lineHeight: '1.2',
  },
  actionTotal: {
    fontSize: '0.72rem',
    fontWeight: 500,
    opacity: 0.9,
  }
};
