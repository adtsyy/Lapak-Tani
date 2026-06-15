import { User, MapPin, RefreshCw } from 'lucide-react';
import type { User as UserType } from '../services/mockDb';

interface NavbarProps {
  currentUser: UserType | null;
  onSwitchRole: () => void;
  onNavigate: (page: string) => void;
}

export const Navbar = ({ currentUser, onSwitchRole, onNavigate }: NavbarProps) => {
  const defaultAddress = currentUser?.addresses?.find(a => a.isDefault) || currentUser?.addresses?.[0];

  return (
    <header style={styles.header}>
      <div style={styles.topRow}>
        <div style={styles.brand} onClick={() => onNavigate('home')}>
          <span style={styles.logoIcon}>🌱</span>
          <h1 style={styles.logoText}>Lapak Tani</h1>
        </div>

        <div style={styles.actions}>
          {/* Quick Role Switch Shortcut */}
          <button 
            onClick={onSwitchRole} 
            style={styles.roleToggle}
            title={`Switch to ${currentUser?.role === 'seller' ? 'Buyer' : 'Seller'} view`}
          >
            <RefreshCw size={14} style={{ color: 'var(--primary-light)' }} />
            <span style={styles.roleToggleText}>
              {currentUser?.role === 'seller' ? 'Seller Mode' : 'Buyer Mode'}
            </span>
          </button>

          {currentUser ? (
            <div style={styles.avatarWrapper} onClick={() => onNavigate(currentUser.role === 'seller' ? 'dashboard' : 'profile')}>
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                style={styles.avatar} 
              />
            </div>
          ) : (
            <button style={styles.loginBtn} onClick={() => onNavigate('login')}>
              <User size={14} />
              <span>Masuk</span>
            </button>
          )}
        </div>
      </div>

      {/* Location / Subtitle Row */}
      {currentUser?.role !== 'seller' && (
        <div style={styles.addressRow}>
          <MapPin size={12} style={{ color: 'var(--primary-light)', flexShrink: 0 }} />
          <span style={styles.addressText}>
            {currentUser 
              ? (defaultAddress ? `Kirim ke: ${defaultAddress.label} (${defaultAddress.city})` : 'Simpan lokasi pengiriman Anda')
              : 'Silakan masuk untuk berbelanja'
            }
          </span>
        </div>
      )}
    </header>
  );
};

const styles = {
  header: {
    padding: '12px 16px 8px 16px',
    backgroundColor: 'var(--bg-surface)',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
    position: 'sticky' as const,
    top: 0,
    zIndex: 900,
  },
  topRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
  },
  logoIcon: {
    fontSize: '1.4rem',
  },
  logoText: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.25rem',
    fontWeight: 800,
    color: 'var(--primary)',
    letterSpacing: '-0.02em',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  roleToggle: {
    background: 'rgba(21, 100, 49, 0.08)',
    border: 'none',
    padding: '6px 10px',
    borderRadius: 'var(--border-radius-xs)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  roleToggleText: {
    fontSize: '0.72rem',
    fontWeight: 700,
    color: 'var(--primary-light)',
  },
  avatarWrapper: {
    width: 32 - 0, // fix typing
    height: 32,
    borderRadius: 'var(--border-radius-full)',
    overflow: 'hidden',
    border: '2px solid var(--primary-light)',
    cursor: 'pointer',
  },
  avatar: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  loginBtn: {
    background: 'var(--primary)',
    border: 'none',
    color: 'var(--text-inverse)',
    padding: '6px 12px',
    borderRadius: 'var(--border-radius-xs)',
    fontSize: '0.78rem',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    cursor: 'pointer',
  },
  addressRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    paddingTop: '4px',
    borderTop: '1px solid var(--border)',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    overflow: 'hidden',
    whiteSpace: 'nowrap' as const,
    textOverflow: 'ellipsis',
  },
  addressText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }
};
