import { useEffect, useState } from 'react';
import { Heart, ShoppingBasket, Star, Search } from 'lucide-react';
import { mockDb } from '../services/mockDb';
import type { Product } from '../services/mockDb';

interface FavoritesProps {
  onNavigate: (page: string, params?: any) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onAddToCart: (product: Product) => void;
  showToast: (msg: string) => void;
}

export const Favorites = ({
  onNavigate,
  favorites,
  onToggleFavorite,
  onAddToCart,
  showToast
}: FavoritesProps) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const all = mockDb.getProducts();
    setProducts(all.filter(p => favorites.includes(p.id)));
  }, [favorites]);

  const formatPrice = (price: number) => `Rp ${price.toLocaleString('id-ID')}`;

  return (
    <div style={styles.container} className="animate-fade-in">
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Produk Favorit</h2>
          <p style={styles.subtitle}>
            {products.length > 0 ? `${products.length} produk tersimpan` : 'Belum ada produk tersimpan'}
          </p>
        </div>
        {products.length > 0 && (
          <span style={styles.heartIcon}>
            <Heart size={22} fill="var(--danger)" stroke="var(--danger)" />
          </span>
        )}
      </div>

      {products.length === 0 ? (
        <div style={styles.emptyState}>
          <span style={styles.emptyEmoji}>🤍</span>
          <h3 style={styles.emptyTitle}>Favorit Masih Kosong</h3>
          <p style={styles.emptyDesc}>
            Tekan ikon ❤️ pada produk mana saja untuk menyimpannya di sini.
          </p>
          <button
            className="btn btn-primary"
            style={styles.exploreBtn}
            onClick={() => onNavigate('explore')}
          >
            <Search size={14} />
            <span>Jelajahi Produk</span>
          </button>
        </div>
      ) : (
        <div style={styles.grid}>
          {products.map(prod => (
            <div key={prod.id} className="glass-card" style={styles.card}>
              {/* Image */}
              <div
                style={styles.imgWrapper}
                onClick={() => onNavigate('detail', { product: prod })}
              >
                <img src={prod.image} alt={prod.title} style={styles.img} />
                {/* Remove from favorite button */}
                <button
                  style={styles.removeBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(prod.id);
                    showToast('Dihapus dari favorit');
                  }}
                  title="Hapus dari favorit"
                >
                  <Heart size={13} fill="var(--danger)" stroke="var(--danger)" />
                </button>
              </div>

              {/* Body */}
              <div style={styles.body}>
                <span style={styles.location}>{prod.location}</span>
                <h4
                  style={styles.cardTitle}
                  onClick={() => onNavigate('detail', { product: prod })}
                >
                  {prod.title}
                </h4>

                <div style={styles.ratingRow}>
                  <Star size={11} fill="var(--accent)" stroke="none" />
                  <span style={styles.ratingVal}>{prod.rating}</span>
                  <span style={styles.soldText}>({prod.salesCount})</span>
                </div>

                <div style={styles.footer}>
                  <div style={styles.priceBlock}>
                    <span style={styles.price}>{formatPrice(prod.price)}</span>
                    <span style={styles.unit}>/{prod.unit}</span>
                  </div>
                  <button
                    style={styles.cartBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(prod);
                      showToast(`${prod.title} masuk keranjang`);
                    }}
                    title="Tambah ke keranjang"
                  >
                    <ShoppingBasket size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '16px',
    paddingBottom: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  title: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.15rem',
    fontWeight: 800,
    color: 'var(--text-main)',
  },
  subtitle: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    marginTop: '2px',
  },
  heartIcon: {
    display: 'flex',
    alignItems: 'center',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '50px 20px',
    textAlign: 'center' as const,
  },
  emptyEmoji: {
    fontSize: '3.5rem',
    marginBottom: '12px',
  },
  emptyTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1rem',
    fontWeight: 700,
    color: 'var(--text-main)',
    marginBottom: '8px',
  },
  emptyDesc: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    lineHeight: '1.5',
    maxWidth: '240px',
    marginBottom: '20px',
  },
  exploreBtn: {
    padding: '10px 24px',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
  card: {
    padding: '8px',
    borderRadius: 'var(--border-radius-sm)',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  imgWrapper: {
    position: 'relative' as const,
    height: 110,
    borderRadius: 'var(--border-radius-sm)',
    overflow: 'hidden',
    cursor: 'pointer',
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  removeBtn: {
    position: 'absolute' as const,
    top: 6,
    right: 6,
    background: 'rgba(255,255,255,0.9)',
    border: 'none',
    width: 26,
    height: 26,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
  },
  body: {
    padding: '8px 2px 2px 2px',
    display: 'flex',
    flexDirection: 'column' as const,
    flex: 1,
  },
  location: {
    fontSize: '0.6rem',
    color: 'var(--text-muted)',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.03em',
    marginBottom: '2px',
  },
  cardTitle: {
    fontSize: '0.78rem',
    fontWeight: 600,
    color: 'var(--text-main)',
    lineHeight: '1.2',
    height: '2.4em',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
    cursor: 'pointer',
    marginBottom: '4px',
  },
  ratingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    fontSize: '0.66rem',
    fontWeight: 600,
    color: 'var(--text-main)',
    marginBottom: '6px',
  },
  ratingVal: {
    color: 'var(--text-main)',
  },
  soldText: {
    color: 'var(--text-muted)',
    fontWeight: 500,
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  priceBlock: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  price: {
    fontSize: '0.82rem',
    fontWeight: 700,
    color: 'var(--primary)',
  },
  unit: {
    fontSize: '0.62rem',
    color: 'var(--text-muted)',
    fontWeight: 500,
  },
  cartBtn: {
    background: 'var(--primary)',
    border: 'none',
    color: '#fff',
    width: 28,
    height: 28,
    borderRadius: 'var(--border-radius-xs)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: 'var(--shadow-primary)',
  },
};
