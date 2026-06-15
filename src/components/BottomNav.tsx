import { Home, Search, Heart, ShoppingBasket, Store, User } from 'lucide-react';
import type { User as UserType } from '../services/mockDb';

interface BottomNavProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  cartCount: number;
  currentUser: UserType | null;
}

export const BottomNav = ({ 
  activeTab, 
  onNavigate, 
  cartCount,
  currentUser 
}: BottomNavProps) => {
  return (
    <nav style={styles.navBar}>
      <button 
        style={{ ...styles.navItem, color: activeTab === 'home' ? 'var(--primary)' : 'var(--text-muted)' }} 
        onClick={() => onNavigate('home')}
      >
        <Home size={20} style={activeTab === 'home' ? styles.activeIcon : {}} />
        <span style={styles.navLabel}>Beranda</span>
      </button>

      <button 
        style={{ ...styles.navItem, color: activeTab === 'explore' ? 'var(--primary)' : 'var(--text-muted)' }} 
        onClick={() => onNavigate('explore')}
      >
        <Search size={20} style={activeTab === 'explore' ? styles.activeIcon : {}} />
        <span style={styles.navLabel}>Cari</span>
      </button>

      <button 
        style={{ ...styles.navItem, color: activeTab === 'favorites' ? 'var(--primary)' : 'var(--text-muted)' }} 
        onClick={() => onNavigate('favorites')}
      >
        <Heart size={20} style={activeTab === 'favorites' ? styles.activeIcon : {}} />
        <span style={styles.navLabel}>Favorit</span>
      </button>

      <button 
        style={{ ...styles.navItem, color: activeTab === 'cart' ? 'var(--primary)' : 'var(--text-muted)' }} 
        onClick={() => onNavigate('cart')}
      >
        <div style={styles.badgeContainer}>
          <ShoppingBasket size={20} style={activeTab === 'cart' ? styles.activeIcon : {}} />
          {cartCount > 0 && (
            <span style={styles.badge}>{cartCount}</span>
          )}
        </div>
        <span style={styles.navLabel}>Keranjang</span>
      </button>

      {currentUser?.role === 'seller' ? (
        <button 
          style={{ ...styles.navItem, color: activeTab === 'dashboard' ? 'var(--primary)' : 'var(--text-muted)' }} 
          onClick={() => onNavigate('dashboard')}
        >
          <Store size={20} style={activeTab === 'dashboard' ? styles.activeIcon : {}} />
          <span style={styles.navLabel}>Toko Saya</span>
        </button>
      ) : (
        <button 
          style={{ ...styles.navItem, color: activeTab === 'profile' ? 'var(--primary)' : 'var(--text-muted)' }} 
          onClick={() => onNavigate('profile')}
        >
          <User size={20} style={activeTab === 'profile' ? styles.activeIcon : {}} />
          <span style={styles.navLabel}>Akun</span>
        </button>
      )}
    </nav>
  );
};

const styles = {
  navBar: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: 'var(--bg-surface)',
    borderTop: '1px solid var(--border)',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: '8px',
    paddingTop: '8px',
    zIndex: 900,
    backdropFilter: 'blur(10px)',
  },
  navItem: {
    background: 'none',
    border: 'none',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '4px',
    cursor: 'pointer',
    flex: 1,
    padding: '4px 0',
    transition: 'all var(--transition-fast)',
  },
  activeIcon: {
    transform: 'scale(1.1)',
    transition: 'transform var(--transition-spring)',
  },
  navLabel: {
    fontSize: '0.68rem',
    fontWeight: 600,
  },
  badgeContainer: {
    position: 'relative' as const,
    display: 'inline-flex',
  },
  badge: {
    position: 'absolute' as const,
    top: -6,
    right: -10,
    background: 'var(--accent)',
    color: '#fff',
    fontSize: '0.62rem',
    fontWeight: 700,
    minWidth: 16,
    height: 16,
    borderRadius: 'var(--border-radius-full)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 4px',
    border: '2px solid var(--bg-surface)',
  }
};
