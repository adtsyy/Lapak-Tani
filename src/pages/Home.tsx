import { useState, useEffect } from 'react';
import { Search, Heart, Star, ChevronRight, Award, Flame } from 'lucide-react';
import { mockDb } from '../services/mockDb';
import type { Product } from '../services/mockDb';

interface HomeProps {
  onNavigate: (page: string, params?: any) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onAddToCart: (product: Product) => void;
  showToast: (msg: string) => void;
}

export const Home = ({ 
  onNavigate, 
  favorites, 
  onToggleFavorite,
  onAddToCart,
  showToast
}: HomeProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  useEffect(() => {
    setProducts(mockDb.getProducts());
  }, []);

  const categories = ['All', 'Vegetables', 'Fruits', 'Grains', 'Herbs & Spices', 'Organic Items'];

  // Filtered by Category
  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  // Best Sellers (rating >= 4.8 and salesCount > 200)
  const bestSellers = products.filter(p => p.isBestSeller || p.salesCount > 250);

  // Favorites products lists
  const favProducts = products.filter(p => favorites.includes(p.id));

  const formatPrice = (price: number) => {
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      {/* Search Header Widget */}
      <div style={styles.searchSection} onClick={() => onNavigate('explore')}>
        <div style={styles.fakeSearchBar}>
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <span style={styles.fakeSearchPlaceholder}>Cari beras organik, cabai segar...</span>
        </div>
      </div>

      {/* Promotional Banner */}
      <div style={styles.promoBanner}>
        <div style={styles.promoContent}>
          <span style={styles.promoBadge}>🌾 Promo Panen Raya</span>
          <h2 style={styles.promoTitle}>Segar dari Kebun Ke Meja Anda</h2>
          <p style={styles.promoDesc}>Diskon hingga 15% untuk produk pilihan minggu ini.</p>
        </div>
        <div style={styles.promoAsset}>🌽</div>
      </div>

      {/* Categories Horizontal Scroll */}
      <div style={styles.sectionHeader}>
        <h3 className="section-title" style={{ margin: 0 }}>Kategori Pilihan</h3>
      </div>
      <div style={styles.categoryScroll}>
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              ...styles.categoryChip,
              backgroundColor: selectedCategory === cat ? 'var(--primary)' : 'var(--bg-surface)',
              color: selectedCategory === cat ? 'var(--text-inverse)' : 'var(--text-main)',
              borderColor: selectedCategory === cat ? 'var(--primary-light)' : 'var(--border)'
            }}
          >
            {cat === 'All' ? '📂 Semua' : 
             cat === 'Vegetables' ? '🥬 Sayur' : 
             cat === 'Fruits' ? '🍎 Buah' : 
             cat === 'Grains' ? '🌾 Beras' : 
             cat === 'Herbs & Spices' ? '🌶️ Bumbu' : '☕ Kopi'}
          </button>
        ))}
      </div>

      {/* Best Sellers (Horizontal Scroll) */}
      {selectedCategory === 'All' && bestSellers.length > 0 && (
        <div style={styles.bestSellersSection}>
          <div style={styles.sectionHeader}>
            <h3 className="section-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Flame size={18} style={{ color: 'var(--warning)' }} /> Best Seller
            </h3>
            <span style={styles.viewAll} onClick={() => onNavigate('explore')}>Lihat Semua <ChevronRight size={14} /></span>
          </div>
          <div style={styles.horizontalScroll}>
            {bestSellers.map(prod => (
              <div key={prod.id} className="glass-card" style={styles.bestSellerCard}>
                <div style={styles.cardImgWrapper} onClick={() => onNavigate('detail', { product: prod })}>
                  <img src={prod.image} alt={prod.title} style={styles.cardImg} />
                  <span style={styles.bestBadge}><Award size={12} /> Best</span>
                </div>
                <div style={styles.cardBody}>
                  <h4 style={styles.cardTitle} onClick={() => onNavigate('detail', { product: prod })}>{prod.title}</h4>
                  <div style={styles.ratingRow}>
                    <Star size={12} fill="var(--accent)" stroke="none" />
                    <span style={styles.ratingVal}>{prod.rating}</span>
                    <span style={styles.soldCount}>• Terjual {prod.salesCount}</span>
                  </div>
                  <div style={styles.priceRow}>
                    <span style={styles.priceText}>{formatPrice(prod.price)}<span style={styles.priceUnit}>/{prod.unit}</span></span>
                    <button 
                      style={styles.favBtn} 
                      onClick={() => {
                        onToggleFavorite(prod.id);
                        showToast(favorites.includes(prod.id) ? 'Dihapus dari favorit' : 'Ditambahkan ke favorit');
                      }}
                    >
                      <Heart size={14} fill={favorites.includes(prod.id) ? 'var(--danger)' : 'none'} stroke={favorites.includes(prod.id) ? 'var(--danger)' : 'currentColor'} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Favorites Section if items exist */}
      {selectedCategory === 'All' && favProducts.length > 0 && (
        <div style={styles.favoritesSection}>
          <div style={styles.sectionHeader}>
            <h3 className="section-title" style={{ margin: 0 }}>Favorit Anda</h3>
            <span style={styles.viewAll} onClick={() => onNavigate('favorites')}>Kelola</span>
          </div>
          <div style={styles.horizontalScroll}>
            {favProducts.map(prod => (
              <div key={prod.id} className="glass-card" style={styles.favSmallCard} onClick={() => onNavigate('detail', { product: prod })}>
                <img src={prod.image} alt={prod.title} style={styles.favSmallImg} />
                <div style={styles.favSmallText}>
                  <h4 style={styles.favSmallTitle}>{prod.title}</h4>
                  <span style={styles.favSmallPrice}>{formatPrice(prod.price)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid Feed */}
      <div style={styles.sectionHeader}>
        <h3 className="section-title" style={{ margin: 0 }}>
          {selectedCategory === 'All' ? 'Jelajahi Produk Segar' : `${selectedCategory}`}
        </h3>
      </div>

      <div style={styles.grid}>
        {filteredProducts.map(prod => (
          <div key={prod.id} className="glass-card" style={styles.gridCard}>
            <div style={styles.gridImgWrapper} onClick={() => onNavigate('detail', { product: prod })}>
              <img src={prod.image} alt={prod.title} style={styles.gridImg} />
              <button 
                style={styles.gridFavBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(prod.id);
                  showToast(favorites.includes(prod.id) ? 'Dihapus dari favorit' : 'Ditambahkan ke favorit');
                }}
              >
                <Heart size={14} fill={favorites.includes(prod.id) ? 'var(--danger)' : 'none'} stroke={favorites.includes(prod.id) ? 'var(--danger)' : '#fff'} />
              </button>
            </div>
            <div style={styles.gridBody}>
              <span style={styles.gridLoc}>{prod.location}</span>
              <h4 style={styles.gridTitle} onClick={() => onNavigate('detail', { product: prod })}>{prod.title}</h4>
              <div style={styles.gridRating}>
                <Star size={11} fill="var(--accent)" stroke="none" />
                <span>{prod.rating}</span>
                <span style={styles.gridSold}>({prod.salesCount})</span>
              </div>
              <div style={styles.gridFooter}>
                <span style={styles.gridPrice}>
                  {formatPrice(prod.price)}
                  <span style={styles.gridUnit}>/{prod.unit}</span>
                </span>
                <button 
                  style={styles.gridAddBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(prod);
                  }}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '16px',
  },
  searchSection: {
    marginBottom: '16px',
  },
  fakeSearchBar: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
  },
  fakeSearchPlaceholder: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
  },
  promoBanner: {
    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
    borderRadius: 'var(--border-radius-md)',
    padding: '20px',
    color: 'var(--text-inverse)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    boxShadow: 'var(--shadow-md)',
  },
  promoContent: {
    flex: 1,
  },
  promoBadge: {
    fontSize: '0.7rem',
    background: 'rgba(255,255,255,0.15)',
    padding: '4px 8px',
    borderRadius: 'var(--border-radius-xs)',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
  },
  promoTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.2rem',
    fontWeight: 800,
    marginTop: '8px',
    lineHeight: '1.2',
  },
  promoDesc: {
    fontSize: '0.75rem',
    opacity: '0.85',
    marginTop: '6px',
  },
  promoAsset: {
    fontSize: '3rem',
    marginLeft: '12px',
    transform: 'rotate(15deg)',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    marginTop: '10px',
  },
  viewAll: {
    fontSize: '0.75rem',
    color: 'var(--primary-light)',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  categoryScroll: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto' as const,
    paddingBottom: '12px',
    marginBottom: '16px',
    scrollbarWidth: 'none' as const, // Firefox
    msOverflowStyle: 'none' as const, // IE
  },
  categoryChip: {
    padding: '8px 14px',
    borderRadius: 'var(--border-radius-full)',
    border: '1px solid',
    fontSize: '0.78rem',
    fontWeight: 600,
    whiteSpace: 'nowrap' as const,
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  bestSellersSection: {
    marginBottom: '20px',
  },
  horizontalScroll: {
    display: 'flex',
    gap: '12px',
    overflowX: 'auto' as const,
    paddingBottom: '12px',
    scrollbarWidth: 'none' as const,
  },
  bestSellerCard: {
    width: 160,
    flexShrink: 0,
    padding: '8px',
    borderRadius: 'var(--border-radius-sm)',
  },
  cardImgWrapper: {
    position: 'relative' as const,
    height: 100,
    borderRadius: 'var(--border-radius-sm)',
    overflow: 'hidden',
    cursor: 'pointer',
  },
  cardImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  bestBadge: {
    position: 'absolute' as const,
    top: 6,
    left: 6,
    background: 'var(--accent)',
    color: '#fff',
    fontSize: '0.55rem',
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: 'var(--border-radius-xs)',
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
  },
  cardBody: {
    padding: '6px 2px 2px 2px',
  },
  cardTitle: {
    fontSize: '0.82rem',
    fontWeight: 600,
    color: 'var(--text-main)',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    cursor: 'pointer',
  },
  ratingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    marginTop: '3px',
  },
  ratingVal: {
    fontSize: '0.7rem',
    fontWeight: 600,
    color: 'var(--text-main)',
  },
  soldCount: {
    fontSize: '0.65rem',
    color: 'var(--text-muted)',
  },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '6px',
  },
  priceText: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: 'var(--primary)',
  },
  priceUnit: {
    fontSize: '0.65rem',
    color: 'var(--text-muted)',
    fontWeight: 500,
  },
  favBtn: {
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: 'var(--text-muted)',
  },
  favoritesSection: {
    marginBottom: '20px',
  },
  favSmallCard: {
    width: 180,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px',
    borderRadius: 'var(--border-radius-sm)',
    cursor: 'pointer',
  },
  favSmallImg: {
    width: 44,
    height: 44,
    borderRadius: 'var(--border-radius-xs)',
    objectFit: 'cover' as const,
  },
  favSmallText: {
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
  },
  favSmallTitle: {
    fontSize: '0.78rem',
    fontWeight: 600,
    color: 'var(--text-main)',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  favSmallPrice: {
    fontSize: '0.72rem',
    fontWeight: 700,
    color: 'var(--primary)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    paddingBottom: '20px',
  },
  gridCard: {
    padding: '8px',
    borderRadius: 'var(--border-radius-sm)',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  gridImgWrapper: {
    position: 'relative' as const,
    height: 110,
    borderRadius: 'var(--border-radius-sm)',
    overflow: 'hidden',
    cursor: 'pointer',
  },
  gridImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  gridFavBtn: {
    position: 'absolute' as const,
    top: 6,
    right: 6,
    background: 'rgba(0,0,0,0.3)',
    border: 'none',
    width: 24,
    height: 24,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    cursor: 'pointer',
  },
  gridBody: {
    padding: '8px 2px 2px 2px',
    display: 'flex',
    flexDirection: 'column' as const,
    flex: 1,
  },
  gridLoc: {
    fontSize: '0.62rem',
    color: 'var(--text-muted)',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.02em',
    marginBottom: '2px',
  },
  gridTitle: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'var(--text-main)',
    lineHeight: '1.2',
    height: '2.4em',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
    cursor: 'pointer',
  },
  gridRating: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    fontSize: '0.68rem',
    fontWeight: 600,
    marginTop: '4px',
    color: 'var(--text-main)',
  },
  gridSold: {
    color: 'var(--text-muted)',
    fontWeight: 500,
  },
  gridFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 'auto',
    paddingTop: '8px',
  },
  gridPrice: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: 'var(--primary)',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  gridUnit: {
    fontSize: '0.65rem',
    color: 'var(--text-muted)',
    fontWeight: 500,
  },
  gridAddBtn: {
    background: 'var(--primary)',
    border: 'none',
    color: '#fff',
    width: 28,
    height: 28,
    borderRadius: 'var(--border-radius-xs)',
    fontWeight: 700,
    fontSize: '1.1rem',
    lineHeight: '1',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--shadow-primary)',
    transition: 'all var(--transition-fast)',
  }
};
