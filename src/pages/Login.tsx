import { useState } from 'react';
import { ArrowLeft, Mail, Shield, Building, Home, Landmark } from 'lucide-react';
import { mockDb } from '../services/mockDb';

interface LoginProps {
  onNavigate: (page: string, params?: any) => void;
  onLoginSuccess: (user: any) => void;
  redirectTo?: string;
  showToast: (msg: string) => void;
}

export const Login = ({
  onNavigate,
  onLoginSuccess,
  redirectTo,
  showToast
}: LoginProps) => {
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  
  // Login fields
  const [email, setEmail] = useState('');
  
  // Registration fields
  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [location, setLocation] = useState('');
  const [nik, setNik] = useState('');
  const [bankAccount, setBankAccount] = useState('');

  const handleGoogleLogin = (selectedRole: 'buyer' | 'seller') => {
    // Simulated Google single-sign-on
    const users = mockDb.getUsers();
    let user;
    if (selectedRole === 'seller') {
      user = users.find(u => u.email === 'farmer1@agri.id');
    } else {
      user = users.find(u => u.email === 'budi@agri.id');
    }

    if (user) {
      mockDb.setCurrentUser(user);
      onLoginSuccess(user);
      showToast(`Masuk sebagai ${user.name} via Google`);
      
      if (redirectTo === 'checkout') {
        onNavigate('checkout');
      } else {
        onNavigate('home');
      }
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const users = mockDb.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());

    if (user) {
      mockDb.setCurrentUser(user);
      onLoginSuccess(user);
      showToast(`Selamat datang kembali, ${user.name}!`);
      
      if (redirectTo === 'checkout') {
        onNavigate('checkout');
      } else {
        onNavigate('home');
      }
    } else {
      showToast('Email belum terdaftar! Silakan mendaftar.');
      setIsRegister(true);
      setRegEmail(email);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !regEmail) return;

    // Register user in local storage DB
    const user = mockDb.registerUser(
      name,
      regEmail,
      role,
      role === 'seller' ? companyName : undefined,
      role === 'seller' ? location : undefined
    );

    // Add extra seller specific data to profile if applicable
    if (role === 'seller' && user) {
      const updatedUser = {
        ...user,
        bankAccount: bankAccount || 'BCA - 0000000000',
        companyName: companyName || `${name} Tani`,
        location: location || 'Bandung, Jawa Barat'
      };
      mockDb.setCurrentUser(updatedUser);
    }

    showToast(`Pendaftaran ${role === 'seller' ? 'Petani' : 'Pembeli'} berhasil!`);
    onLoginSuccess(mockDb.getCurrentUser());

    if (redirectTo === 'checkout') {
      onNavigate('checkout');
    } else {
      onNavigate('home');
    }
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.header}>
        <button onClick={() => onNavigate('home')} style={styles.backBtn}>
          <ArrowLeft size={16} />
        </button>
        <h3 style={styles.title}>{isRegister ? 'Buat Akun Lapak Tani' : 'Masuk Akun'}</h3>
      </div>

      {/* Simulated Google Authentication Buttons */}
      {!isRegister && (
        <div className="glass-card" style={styles.googleBox}>
          <h4 style={styles.googleTitle}>Masuk Cepat via Google</h4>
          <p style={styles.googleDesc}>Simulasi login menggunakan salah satu akun demo berikut:</p>
          <div style={styles.googleBtnRow}>
            <button className="btn btn-primary" onClick={() => handleGoogleLogin('buyer')} style={styles.googleBtn}>
              🌐 Demo Pembeli (Budi)
            </button>
            <button className="btn btn-accent" onClick={() => handleGoogleLogin('seller')} style={styles.googleBtn}>
              🚜 Demo Petani (Pak Ketut)
            </button>
          </div>
        </div>
      )}

      {/* Login Form */}
      {!isRegister ? (
        <form onSubmit={handleLoginSubmit} className="glass-card" style={styles.formCard}>
          <div className="form-group">
            <label className="form-label">Alamat Email</label>
            <div style={styles.inputWrapper}>
              <Mail size={16} style={styles.inputIcon} />
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="budi@agri.id atau farmer1@agri.id" 
                className="input-field" 
                style={{ paddingLeft: '36px' }}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '10px' }}>
            Masuk dengan Email
          </button>
          
          <div style={styles.toggleRow}>
            <span>Belum punya akun?</span>
            <button type="button" onClick={() => setIsRegister(true)} style={styles.toggleBtn}>Daftar Baru</button>
          </div>
        </form>
      ) : (
        /* Register Form */
        <form onSubmit={handleRegisterSubmit} className="glass-card" style={styles.formCard}>
          
          {/* Role selector toggle */}
          <div style={styles.roleToggleWrapper}>
            <button 
              type="button" 
              onClick={() => setRole('buyer')}
              style={{
                ...styles.roleTab,
                backgroundColor: role === 'buyer' ? 'var(--primary)' : 'var(--bg-surface-elevated)',
                color: role === 'buyer' ? '#fff' : 'var(--text-main)'
              }}
            >
              🛍️ Sebagai Pembeli
            </button>
            <button 
              type="button" 
              onClick={() => setRole('seller')}
              style={{
                ...styles.roleTab,
                backgroundColor: role === 'seller' ? 'var(--primary)' : 'var(--bg-surface-elevated)',
                color: role === 'seller' ? '#fff' : 'var(--text-main)'
              }}
            >
              🚜 Sebagai Petani (Seller)
            </button>
          </div>

          <div className="form-group">
            <label className="form-label">Nama Lengkap</label>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Contoh: Budi Santoso" 
              className="input-field" 
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Alamat Email</label>
            <input 
              type="email" 
              value={regEmail}
              onChange={e => setRegEmail(e.target.value)}
              placeholder="budi@email.com" 
              className="input-field" 
              required
            />
          </div>

          {/* Seller / Farmer specific registration sheets */}
          {role === 'seller' && (
            <div className="animate-fade-in" style={styles.sellerFields}>
              <div style={styles.divider}>Informasi Kelompok Tani / Usaha</div>

              <div className="form-group">
                <label className="form-label">Nomor KTP / NIK</label>
                <div style={styles.inputWrapper}>
                  <Shield size={14} style={styles.inputIcon} />
                  <input 
                    type="text" 
                    maxLength={16}
                    value={nik}
                    onChange={e => setNik(e.target.value)}
                    placeholder="3204xxxxxxxxxxxx" 
                    className="input-field" 
                    style={{ paddingLeft: '36px' }}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Nama Perusahaan / Kelompok Tani</label>
                <div style={styles.inputWrapper}>
                  <Building size={14} style={styles.inputIcon} />
                  <input 
                    type="text" 
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    placeholder="Contoh: Kelompok Tani Lestari Ciwidey" 
                    className="input-field" 
                    style={{ paddingLeft: '36px' }}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Lokasi Pertanian (Kabupaten, Provinsi)</label>
                <div style={styles.inputWrapper}>
                  <Home size={14} style={styles.inputIcon} />
                  <input 
                    type="text" 
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="Contoh: Ciwidey, Bandung" 
                    className="input-field" 
                    style={{ paddingLeft: '36px' }}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Informasi Rekening Bank (Penarikan Dana)</label>
                <div style={styles.inputWrapper}>
                  <Landmark size={14} style={styles.inputIcon} />
                  <input 
                    type="text" 
                    value={bankAccount}
                    onChange={e => setBankAccount(e.target.value)}
                    placeholder="Contoh: BCA - 829012345 (a/n Budi)" 
                    className="input-field" 
                    style={{ paddingLeft: '36px' }}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '12px' }}>
            Daftar Akun Baru
          </button>

          <div style={styles.toggleRow}>
            <span>Sudah memiliki akun?</span>
            <button type="button" onClick={() => setIsRegister(false)} style={styles.toggleBtn}>Masuk Disini</button>
          </div>
        </form>
      )}
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
  googleBox: {
    padding: '14px',
    marginBottom: '14px',
    textAlign: 'center' as const,
    backgroundColor: 'rgba(21, 100, 49, 0.03)',
    borderColor: 'rgba(21, 100, 49, 0.15)',
  },
  googleTitle: {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: 'var(--primary)',
  },
  googleDesc: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    marginTop: '2px',
    marginBottom: '12px',
  },
  googleBtnRow: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  googleBtn: {
    padding: '10px',
    fontSize: '0.78rem',
    fontWeight: 600,
  },
  formCard: {
    padding: '16px',
  },
  inputWrapper: {
    position: 'relative' as const,
    width: '100%',
  },
  inputIcon: {
    position: 'absolute' as const,
    left: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-muted)',
  },
  toggleRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '6px',
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    marginTop: '14px',
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--primary-light)',
    fontWeight: 700,
    cursor: 'pointer',
  },
  roleToggleWrapper: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
  },
  roleTab: {
    flex: 1,
    padding: '8px',
    border: 'none',
    borderRadius: 'var(--border-radius-xs)',
    fontSize: '0.72rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  sellerFields: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  divider: {
    fontSize: '0.7rem',
    color: 'var(--primary-light)',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    textAlign: 'center' as const,
    margin: '12px 0 8px 0',
    borderBottom: '1px dashed var(--border)',
    paddingBottom: '6px',
  }
};
