import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Loader2, Copy, KeyRound } from 'lucide-react';
import { mockDb } from '../services/mockDb';
import type { Order } from '../services/mockDb';

interface PaymentGatewayProps {
  order: Order;
  paymentType: 'qris' | 'ewallet' | 'va';
  onNavigate: (page: string, params?: any) => void;
  onClearCart: () => void;
  showToast: (msg: string) => void;
}

export const PaymentGateway = ({
  order,
  paymentType,
  onNavigate,
  onClearCart,
  showToast
}: PaymentGatewayProps) => {
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success'>('pending');
  const [secondsLeft, setSecondsLeft] = useState(3);
  const [phoneNumber, setPhoneNumber] = useState('08123456789');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const formatPrice = (price: number) => {
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  // QRIS and VA direct auto-verification simulations
  useEffect(() => {
    if (paymentType === 'qris' || (paymentType === 'va' && paymentStatus === 'processing')) {
      if (paymentStatus === 'pending' && paymentType === 'qris') {
        // Start processing automatically for QRIS
        setPaymentStatus('processing');
      }

      if (paymentStatus === 'processing') {
        const interval = setInterval(() => {
          setSecondsLeft((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              // Mark order as paid in mock DB
              mockDb.updateOrderStatus(order.id, 'paid');
              onClearCart(); // empty basket
              setPaymentStatus('success');
              showToast('Pembayaran berhasil diverifikasi sistem!');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(interval);
      }
    }
  }, [paymentType, paymentStatus]);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    setOtpSent(true);
    showToast('Kode OTP berhasil dikirim via SMS');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) return;
    setPaymentStatus('processing');
    
    // Simulate short OTP validation delay
    setTimeout(() => {
      mockDb.updateOrderStatus(order.id, 'paid');
      onClearCart();
      setPaymentStatus('success');
      showToast('OTP Valid! Pembayaran diverifikasi sistem.');
    }, 2000);
  };

  const handleVaSimulation = () => {
    setPaymentStatus('processing');
    setSecondsLeft(3);
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      {paymentStatus !== 'success' && (
        <div style={styles.header}>
          <button onClick={() => onNavigate('checkout')} style={styles.backBtn}>
            <ArrowLeft size={16} />
          </button>
          <h3 style={styles.title}>Gerbang Pembayaran Sistem</h3>
        </div>
      )}

      {paymentStatus === 'pending' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* E-Wallet Phone Verification flow */}
          {paymentType === 'ewallet' && (
            <div className="glass-card" style={styles.centerCard}>
              <span style={styles.gatewayBadge}>E-Wallet Partner</span>
              <h4 style={styles.cardHeader}>Verifikasi Dompet Digital</h4>
              <p style={styles.cardDesc}>Masukkan nomor handphone Anda yang terdaftar pada {order.paymentChannel}.</p>
              
              {!otpSent ? (
                <form onSubmit={handleSendOtp} style={{ width: '100%', marginTop: '12px' }}>
                  <div className="form-group" style={{ textAlign: 'left' }}>
                    <label className="form-label">Nomor Handphone</label>
                    <input 
                      type="tel" 
                      value={phoneNumber} 
                      onChange={e => setPhoneNumber(e.target.value)} 
                      placeholder="Contoh: 08123456789"
                      className="input-field" 
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-block">Kirim Kode OTP</button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} style={{ width: '100%', marginTop: '12px' }}>
                  <div className="form-group" style={{ textAlign: 'left' }}>
                    <label className="form-label">Masukkan 4-Digit OTP</label>
                    <input 
                      type="text" 
                      maxLength={4}
                      value={otpCode} 
                      onChange={e => setOtpCode(e.target.value)} 
                      placeholder="Ketik 1234 (Simulasi)"
                      className="input-field"
                      style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.2rem', fontWeight: 700 }}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-block">
                    <KeyRound size={14} /> Verifikasi & Bayar {formatPrice(order.total)}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Virtual Account Info card */}
          {paymentType === 'va' && (
            <div className="glass-card" style={styles.centerCard}>
              <span style={styles.gatewayBadge}>Virtual Account</span>
              <h4 style={styles.cardHeader}>Transfer Virtual Account</h4>
              <p style={styles.cardDesc}>Transfer tepat nominal di bawah ini ke Virtual Account Bank Anda.</p>
              
              <div style={styles.vaCodeBox}>
                <span style={styles.vaLabel}>{order.paymentChannel} VA</span>
                <div style={styles.vaNumberRow}>
                  <code style={styles.vaCode}>8808 {order.buyerPhone.slice(1)}</code>
                  <button onClick={() => {
                    navigator.clipboard.writeText(`8808${order.buyerPhone.slice(1)}`);
                    showToast('VA disalin ke clipboard');
                  }} style={styles.copyBtn}><Copy size={12} /></button>
                </div>
              </div>

              <div style={styles.billBox}>
                <span>Jumlah Nominal</span>
                <span style={styles.billTotal}>{formatPrice(order.total)}</span>
              </div>

              <button className="btn btn-primary btn-block" onClick={handleVaSimulation} style={{ marginTop: '14px' }}>
                Simulasikan Pembayaran M-Banking
              </button>
            </div>
          )}
        </div>
      )}

      {/* Verification Loading screen */}
      {paymentStatus === 'processing' && (
        <div className="glass-card animate-pulse" style={styles.processingCard}>
          <Loader2 size={44} style={styles.spinner} />
          <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, marginTop: '16px' }}>Memverifikasi Transaksi</h4>
          <p style={styles.processingDesc}>Menghubungkan ke API Bank Indonesia Gateway...</p>
          <span style={styles.timer}>Selesai dalam {secondsLeft} detik</span>
        </div>
      )}

      {/* QRIS Scan Screen */}
      {paymentType === 'qris' && paymentStatus === 'processing' && (
        <div className="glass-card animate-fade-in" style={styles.centerCard}>
          <span style={styles.gatewayBadge}>QRIS National</span>
          <h4 style={styles.cardHeader}>Scan QRIS QR Code</h4>
          <p style={styles.cardDesc}>Pindai QR Code di bawah untuk membayar tagihan pesanan Anda.</p>

          <div style={styles.qrWrapper} className="animate-pulse">
            <svg viewBox="0 0 100 100" style={styles.qrSvg}>
              {/* Simulated QR Code drawing pattern */}
              <rect x="10" y="10" width="25" height="25" fill="var(--text-main)" />
              <rect x="15" y="15" width="15" height="15" fill="#fff" />
              <rect x="18" y="18" width="9" height="9" fill="var(--text-main)" />
              
              <rect x="65" y="10" width="25" height="25" fill="var(--text-main)" />
              <rect x="70" y="15" width="15" height="15" fill="#fff" />
              <rect x="73" y="18" width="9" height="9" fill="var(--text-main)" />
              
              <rect x="10" y="65" width="25" height="25" fill="var(--text-main)" />
              <rect x="15" y="70" width="15" height="15" fill="#fff" />
              <rect x="18" y="73" width="9" height="9" fill="var(--text-main)" />

              <rect x="45" y="20" width="8" height="8" fill="var(--text-main)" />
              <rect x="55" y="45" width="12" height="12" fill="var(--text-main)" />
              <rect x="30" y="45" width="10" height="10" fill="var(--text-main)" />
              <rect x="75" y="75" width="15" height="15" fill="var(--text-main)" />
              
              {/* Center green leaf emblem representing Lapak Tani */}
              <rect x="42" y="42" width="16" height="16" fill="var(--primary)" rx="4" />
              <text x="50" y="53" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">🌱</text>
            </svg>
          </div>

          <div style={styles.billBox}>
            <span>Total Tagihan</span>
            <span style={styles.billTotal}>{formatPrice(order.total)}</span>
          </div>

          <p style={styles.qrStatus}>
            <Loader2 size={12} style={styles.smallSpinner} />
            Menunggu Pembayaran (Sistem verifikasi otomatis: {secondsLeft} detik)
          </p>
        </div>
      )}

      {/* Success Receipt page */}
      {paymentStatus === 'success' && (
        <div style={styles.successScreen} className="animate-fade-in">
          <div style={styles.checkCircleWrapper}>
            <CheckCircle size={58} style={{ color: 'var(--success)' }} />
          </div>
          <h2 style={styles.successTitle}>Transaksi Sukses!</h2>
          <p style={styles.successDesc}>Sistem berhasil memverifikasi pembayaran Anda.</p>

          <div className="glass-card" style={styles.receiptCard}>
            <div style={styles.receiptHeader}>
              <span style={styles.receiptLogo}>🌱 Lapak Tani</span>
              <span style={styles.receiptTxId}>{order.id}</span>
            </div>
            
            <div style={styles.receiptDivider}></div>
            
            <div style={styles.receiptBody}>
              <div style={styles.receiptRow}>
                <span style={styles.receiptLabel}>Pembeli</span>
                <span style={styles.receiptVal}>{order.buyerName}</span>
              </div>
              <div style={styles.receiptRow}>
                <span style={styles.receiptLabel}>Pengiriman</span>
                <span style={styles.receiptVal}>{order.deliveryPartner}</span>
              </div>
              <div style={styles.receiptRow}>
                <span style={styles.receiptLabel}>Metode Pembayaran</span>
                <span style={styles.receiptVal}>{order.paymentChannel}</span>
              </div>
              
              <div style={styles.receiptDivider}></div>

              {order.items.map((item, idx) => (
                <div key={idx} style={styles.receiptRow}>
                  <span style={styles.receiptLabel}>{item.title} x {item.quantity}</span>
                  <span style={styles.receiptVal}>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}

              <div style={styles.receiptDivider}></div>

              <div style={{ ...styles.receiptRow, marginTop: '4px' }}>
                <span style={{ ...styles.receiptLabel, fontWeight: 700, color: 'var(--text-main)' }}>Total Bayar</span>
                <span style={{ ...styles.receiptVal, fontWeight: 800, color: 'var(--primary)' }}>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          <div style={styles.successActions}>
            <button className="btn btn-secondary" onClick={() => onNavigate('home')}>Belanja Lagi</button>
            <button className="btn btn-primary" onClick={() => onNavigate('profile')}>Lacak Pesanan</button>
          </div>
        </div>
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
  centerCard: {
    padding: '20px',
    textAlign: 'center' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '10px',
  },
  gatewayBadge: {
    fontSize: '0.58rem',
    background: 'rgba(21, 100, 49, 0.1)',
    color: 'var(--primary)',
    padding: '4px 10px',
    borderRadius: 'var(--border-radius-full)',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
  },
  cardHeader: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.05rem',
    fontWeight: 800,
    color: 'var(--text-main)',
  },
  cardDesc: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
  },
  vaCodeBox: {
    backgroundColor: 'var(--bg-surface-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '12px',
    width: '100%',
    margin: '10px 0',
    textAlign: 'left' as const,
  },
  vaLabel: {
    fontSize: '0.65rem',
    fontWeight: 700,
    color: 'var(--text-muted)',
    textTransform: 'uppercase' as const,
  },
  vaNumberRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '4px',
  },
  vaCode: {
    fontFamily: 'monospace',
    fontSize: '1.15rem',
    fontWeight: 700,
    color: 'var(--text-main)',
    letterSpacing: '1px',
  },
  copyBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--primary)',
    cursor: 'pointer',
  },
  billBox: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    padding: '12px 0',
    borderTop: '1px solid var(--border)',
    borderBottom: '1px solid var(--border)',
    fontSize: '0.82rem',
    fontWeight: 600,
    color: 'var(--text-main)',
    margin: '8px 0',
  },
  billTotal: {
    color: 'var(--primary)',
    fontWeight: 800,
  },
  qrWrapper: {
    width: 170,
    height: 170,
    border: '4px solid var(--primary)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '8px',
    backgroundColor: '#fff',
    margin: '12px 0',
  },
  qrSvg: {
    width: '100%',
    height: '100%',
  },
  qrStatus: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '8px',
  },
  processingCard: {
    padding: '40px 20px',
    textAlign: 'center' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    animation: 'spin 1.5s linear infinite',
    color: 'var(--primary)',
  },
  smallSpinner: {
    animation: 'spin 1.5s linear infinite',
    color: 'var(--text-muted)',
  },
  processingDesc: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    marginTop: '6px',
  },
  timer: {
    fontSize: '0.72rem',
    fontWeight: 700,
    color: 'var(--primary-light)',
    marginTop: '12px',
  },
  successScreen: {
    textAlign: 'center' as const,
    padding: '30px 10px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
  checkCircleWrapper: {
    marginBottom: '16px',
    animation: 'fadeIn 0.5s ease-out',
  },
  successTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.45rem',
    fontWeight: 800,
    color: 'var(--text-main)',
  },
  successDesc: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    marginTop: '4px',
    marginBottom: '24px',
  },
  receiptCard: {
    width: '100%',
    maxWidth: 320,
    padding: '16px',
    textAlign: 'left' as const,
    marginBottom: '24px',
    backgroundColor: 'var(--bg-surface)',
    borderStyle: 'dashed',
    boxShadow: 'var(--shadow-md)',
  },
  receiptHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptLogo: {
    fontFamily: 'var(--font-heading)',
    fontWeight: 800,
    color: 'var(--primary)',
    fontSize: '0.9rem',
  },
  receiptTxId: {
    fontSize: '0.68rem',
    color: 'var(--text-muted)',
    fontFamily: 'monospace',
  },
  receiptDivider: {
    height: '1px',
    borderTop: '1px dashed var(--border)',
    margin: '12px 0',
  },
  receiptBody: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  receiptRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
  },
  receiptLabel: {
    color: 'var(--text-muted)',
  },
  receiptVal: {
    color: 'var(--text-main)',
    fontWeight: 600,
  },
  successActions: {
    display: 'flex',
    gap: '12px',
    width: '100%',
  }
};
