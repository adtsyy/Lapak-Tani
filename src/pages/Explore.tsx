import { useState, useEffect } from 'react';
import { Search, Trash2, SlidersHorizontal, Heart, Star } from 'lucide-react';
import { mockDb } from '../services/mockDb';
import type { Product } from '../services/mockDb';

interface ExploreProps {
  onNavigate: (page: string, params?: any) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onAddToCart: (product: Product) => void;
  showToast: (msg: string) => void;
}

export const Explore = ({
  onNavigate,
  favorites,
  onToggleFavorite,
  onAddToCart,
  showToast
}: ExploreProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCat, setSelectedCat] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLoc, setSelectedLoc] = useState('All');

  useEffect(() => {
    setHistory(mockDb.getSearchHistory());
    setProducts(mockDb.getProducts());
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      mockDb.addSearchQuery(searchQuery);
      setHistory(mockDb.getSearchHistory());
    }
  };

  const handleHistoryClick = (query: string) => {
    setSearchQuery(query);
    mockDb.addSearchQuery(query);
    setHistory(mockDb.getSearchHistory());
  };

  const clearHistory = () => {
    mockDb.clearSearchHistory();
    setHistory([]);
    showToast('Riwayat pencarian dihapus');
  };

  const formatPrice = (price: number) => {
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  // Filtering Logic
  const filtered = products.filter(p => {
    // Search query matches title, description, or location
    const q = searchQuery.toLowerCase().trim();
    const matchQuery = !q || 
      p.title.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q) || 
      p.location.toLowerCase().includes(q) ||
      p.farmerName.toLowerCase().includes(q);

    // Category Match
    const matchCat = selectedCat === 'All' || p.category === selectedCat;

    // Location Match
    const matchLoc = selectedLoc === 'All' || p.location.includes(selectedLoc);

    return matchQuery && matchCat && matchLoc;
  });

  // Extract unique locations for the filter option
  const locations = ['All', ...Array.from(new Set(products.map(p => p.location.split(',')[1]?.trim() || p.location)))];
  const categories = ['All', 'Vegetables', 'Fruits', 'Grains', 'Herbs & Spices', 'Organic Items'];

  return (
    <div style={styles.container} className="animate-fade-in">
      {/* Search Header */}
      <form onSubmit={handleSearchSubmit} style={styles.searchForm}>
        <div style={styles.searchBarWrapper}>
          <Search size={16} style={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Cari sayur, buah, kopi..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery('')} style={styles.clearInputBtn}>×</button>
          )}
        </div>
        <button 
          type="button" 
          onClick={() => setShowFilters(!showFilters)} 
          style={{
            ...styles.filterBtn,
            backgroundColor: showFilters || selectedLoc !== 'All' ? 'var(--primary)' : 'var(--bg-surface)',
            color: showFilters || selectedLoc !== 'All' ? '#fff' : 'var(--text-main)'
          }}
        >
          <SlidersHorizontal size={16} />
        </button>
      </form>

      {/* Advanced Filters Expandable Drawer */}
      {showFilters && (
        <div className="glass-card" style={styles.filtersDrawer}>
          <h4 style={styles.filterTitle}>Filter Pencarian</h4>
          
          <div style={styles.filterGroup}>
            <span style={styles.filterLabel}>Wilayah Asal Pertanian</span>
            <div style={styles.chipRow}>
              {locations.map(loc => (
                <button
                  key={loc}
                  onClick={() => setSelectedLoc(loc)}
                  style={{
                    ...styles.filterChip,
                    backgroundColor: selectedLoc === loc ? 'var(--primary)' : 'var(--bg-surface-elevated)',
                    color: selectedLoc === loc ? '#fff' : 'var(--text-main)'
                  }}
                >
                  {loc === 'All' ? '🌍 Semua Wilayah' : loc}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.filterGroup}>
            <span style={styles.filterLabel}>Kategori Produk</span>
            <div style={styles.chipRow}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCat(cat)}
                  style={{
                    ...styles.filterChip,
                    backgroundColor: selectedCat === cat ? 'var(--primary)' : 'var(--bg-surface-elevated)',
                    color: selectedCat === cat ? '#fff' : 'var(--text-main)'
                  }}
                >
                  {cat === 'All' ? '📂 Semua Kategori' : cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent History List */}
      {!searchQuery && history.length > 0 && (
        <div style={styles.historySection}>
          <div style={styles.historyHeader}>
            <span style={styles.historyTitle}>Pencarian Terakhir</span>
            <button onClick={clearHistory} style={styles.trashBtn}>
              <Trash2 size={12} />
              <span>Bersihkan</span>
            </button>
          </div>
          <div style={styles.historyTags}>
            {history.map((h, i) => (
              <span key={i} onClick={() => handleHistoryClick(h)} style={styles.historyTag}>
                {h}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Results Header */}
      <div style={styles.resultsHeader}>
        <span>Hasil Pencarian</span>
        <span style={styles.countText}>{filtered.length} produk ditemukan</span>
      </div>

      {/* Search Grid */}
      {filtered.length > 0 ? (
        <div style={styles.resultsGrid}>
          {filtered.map(prod => (
            <div key={prod.id} className="glass-card" style={styles.resultCard} onClick={() => onNavigate('detail', { product: prod })}>
              <img src={prod.image} alt={prod.title} style={styles.resultImg} />
              <div style={styles.resultDetails}>
                <span style={styles.resultFarmer}>{prod.farmerName} • {prod.location}</span>
                <h4 style={styles.resultTitle}>{prod.title}</h4>
                <div style={styles.ratingRow}>
                  <Star size={12} fill="var(--accent)" stroke="none" />
                  <span style={styles.ratingText}>{prod.rating}</span>
                  <span style={styles.salesText}>({prod.salesCount} terjual)</span>
                </div>
                <div style={styles.resultFooter}>
                  <span style={styles.resultPrice}>{formatPrice(prod.price)}<span style={styles.resultUnit}>/{prod.unit}</span></span>
                  <div style={styles.actionRow} onClick={e => e.stopPropagation()}>
                    <button 
                      style={styles.actionHeart}
                      onClick={() => onToggleFavorite(prod.id)}
                    >
                      <Heart size={14} fill={favorites.includes(prod.id) ? 'var(--danger)' : 'none'} stroke={favorites.includes(prod.id) ? 'var(--danger)' : 'currentColor'} />
                    </button>
                    <button 
                      style={styles.actionAdd}
                      onClick={() => {
                        onAddToCart(prod);
                        showToast(`${prod.title} masuk keranjang`);
                      }}
                    >
                      + Keranjang
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.emptyState}>
          <span style={styles.emptyIcon}>🚜</span>
          <h4>Produk Tidak Ditemukan</h4>
          <p>Coba gunakan kata kunci lain seperti "beras" atau "cabai".</p>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '16px',
  },
  searchForm: {
    display: 'flex',
    gap: '8px',
    marginBottom: '12px',
  },
  searchBarWrapper: {
    position: 'relative' as const,
    flex: 1,
  },
  searchIcon: {
    position: 'absolute' as const,
    left: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-muted)',
  },
  searchInput: {
    width: '100%',
    padding: '10px 36px 10px 36px',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--bg-surface)',
    color: 'var(--text-main)',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.88rem',
    outline: 'none',
  },
  clearInputBtn: {
    position: 'absolute' as const,
    right: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    border: 'none',
    background: 'none',
    fontSize: '1.2rem',
    color: 'var(--text-muted)',
    cursor: 'pointer',
  },
  filterBtn: {
    border: '1px solid var(--border)',
    borderRadius: 'var(--border-radius-sm)',
    width: 42,
    height: 42,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  filtersDrawer: {
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: 'var(--bg-surface-elevated)',
  },
  filterTitle: {
    fontSize: '0.8rem',
    fontWeight: 700,
    marginBottom: '8px',
    color: 'var(--text-main)',
  },
  filterGroup: {
    marginBottom: '12px',
  },
  filterLabel: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    fontWeight: 600,
    marginBottom: '6px',
    display: 'block',
  },
  chipRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '6px',
  },
  filterChip: {
    border: '1px solid var(--border)',
    padding: '6px 10px',
    borderRadius: 'var(--border-radius-xs)',
    fontSize: '0.72rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  historySection: {
    marginBottom: '16px',
  },
  historyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  historyTitle: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontWeight: 600,
  },
  trashBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--danger)',
    fontSize: '0.7rem',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    cursor: 'pointer',
  },
  historyTags: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '8px',
  },
  historyTag: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--border-radius-xs)',
    padding: '6px 10px',
    fontSize: '0.75rem',
    color: 'var(--text-main)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  resultsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.78rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    marginBottom: '10px',
    borderBottom: '1px solid var(--border)',
    paddingBottom: '6px',
  },
  countText: {
    color: 'var(--primary-light)',
  },
  resultsGrid: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  resultCard: {
    display: 'flex',
    gap: '12px',
    padding: '10px',
    borderRadius: 'var(--border-radius-sm)',
    cursor: 'pointer',
  },
  resultImg: {
    width: 80,
    height: 80,
    borderRadius: 'var(--border-radius-xs)',
    objectFit: 'cover' as const,
    flexShrink: 0,
  },
  resultDetails: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  resultFarmer: {
    fontSize: '0.62rem',
    color: 'var(--text-muted)',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
  },
  resultTitle: {
    fontSize: '0.82rem',
    fontWeight: 600,
    color: 'var(--text-main)',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginTop: '2px',
  },
  ratingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    marginTop: '2px',
  },
  ratingText: {
    fontSize: '0.72rem',
    fontWeight: 600,
    color: 'var(--text-main)',
  },
  salesText: {
    fontSize: '0.68rem',
    color: 'var(--text-muted)',
  },
  resultFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '4px',
  },
  resultPrice: {
    fontSize: '0.88rem',
    fontWeight: 700,
    color: 'var(--primary)',
  },
  resultUnit: {
    fontSize: '0.68rem',
    color: 'var(--text-muted)',
    fontWeight: 500,
  },
  actionRow: {
    display: 'flex',
    gap: '6px',
  },
  actionHeart: {
    backgroundColor: 'var(--bg-surface-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--border-radius-xs)',
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'var(--text-muted)',
  },
  actionAdd: {
    backgroundColor: 'var(--primary)',
    color: '#fff',
    border: 'none',
    padding: '0 10px',
    borderRadius: 'var(--border-radius-xs)',
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: 'var(--shadow-primary)',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    textAlign: 'center' as const,
    color: 'var(--text-muted)',
  },
  emptyIcon: {
    fontSize: '2.5rem',
    marginBottom: '10px',
  }
};
