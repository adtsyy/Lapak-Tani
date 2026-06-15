import { useState, useEffect, Fragment } from 'react';
import { Truck, LogOut, Package, RefreshCw } from 'lucide-react';
import { mockDb } from '../services/mockDb';
import type { User, Order } from '../services/mockDb';

interface ProfileProps {
  currentUser: User;
  onLogout: () => void;
  onSwitchRole: () => void;
  showToast: (msg: string) => void;
}

export const Profile = ({
  currentUser,
  onLogout,
  onSwitchRole,
  showToast
}: ProfileProps) => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // Filter orders by buyer ID
    const allOrders = mockDb.getOrders();
    const buyerOrders = allOrders.filter(o => o.buyerId === currentUser.id);
    setOrders(buyerOrders);
  }, [currentUser]);

  const formatPrice = (price: number) => {
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <span className="badge badge-warning">Belum Bayar</span>;
      case 'paid': return <span className="badge badge-primary">Dibayar</span>;
      case 'processing': return <span className="badge badge-primary">Diproses</span>;
      case 'shipped': return <span className="badge badge-success">Dikirim</span>;
      case 'completed': return <span className="badge badge-success">Selesai</span>;
      case 'cancelled': return <span className="badge badge-danger">Dibatalkan</span>;
    }
  };

  // Helper to draw tracking milestones
  const renderTrackingTimeline = (order: Order) => {
    const steps = [
      { key: 'pending', label: 'Dibuat' },
      { key: 'paid', label: 'Dibayar' },
      { key: 'shipped', label: 'Dikirim' },
      { key: 'completed', label: 'Selesai' }
    ];

    const currentIdx = steps.findIndex(s => s.key === order.status) !== -1 
      ? steps.findIndex(s => s.key === order.status) 
      : (order.status === 'processing' ? 1 : 0);

    return (
      <div style={styles.timelineContainer}>
        <div style={styles.timelineRow}>
          {steps.map((step, idx) => {
            const isDone = idx <= currentIdx;
            const isActive = idx === currentIdx;
            return (
              <Fragment key={step.key}>
                {idx > 0 && (
                  <div style={{
                    ...styles.timelineLine,
                    backgroundColor: isDone ? 'var(--primary-light)' : 'var(--border)'
                  }} />
                )}
                <div style={styles.timelineStep}>
                  <div style={{
                    ...styles.timelineCircle,
                    backgroundColor: isDone ? 'var(--primary)' : 'var(--bg-surface-elevated)',
                    borderColor: isDone ? 'var(--primary-light)' : 'var(--border)',
                    boxShadow: isActive ? '0 0 0 4px rgba(21, 100, 49, 0.15)' : 'none'
                  }}>
                    {isDone ? '✓' : idx + 1}
                  </div>
                  <span style={{
                    ...styles.timelineLabel,
                    fontWeight: isActive || isDone ? 700 : 500,
                    color: isDone ? 'var(--primary-light)' : 'var(--text-muted)'
                  }}>{step.label}</span>
                </div>
              </Fragment>
            );
          })}
        </div>
        {order.status === 'shipped' && order.trackingNumber && (
          <div style={styles.trackingDetails}>
            <Truck size={12} style={{ color: 'var(--primary-light)' }} />
            <span>Nomor Resi: <strong style={{ fontFamily: 'monospace' }}>{order.trackingNumber}</strong> ({order.deliveryPartner})</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      {/* Profile Details Card */}
      <div className="glass-card" style={styles.profileCard}>
        <div style={styles.profileRow}>
          <img src={currentUser.avatar} alt={currentUser.name} style={styles.avatar} />
          <div style={styles.profileInfo}>
            <h3 style={styles.profileName}>{currentUser.name}</h3>
            <span style={styles.profileEmail}>{currentUser.email}</span>
            <span style={styles.buyerBadge}>Pembeli Lapak Tani</span>
          </div>
        </div>

        <div style={styles.actionGrid}>
          <button style={styles.actionBtn} onClick={onSwitchRole}>
            <RefreshCw size={14} />
            <span>Pindah ke Menu Petani</span>
          </button>
          <button style={{ ...styles.actionBtn, color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.15)' }} onClick={onLogout}>
            <LogOut size={14} />
            <span>Keluar Akun</span>
          </button>
        </div>
      </div>

      {/* Shipping Addresses Book */}
      <h3 className="section-title">Daftar Alamat Saya</h3>
      <div style={styles.addressList}>
        {currentUser.addresses?.map(addr => (
          <div key={addr.id} className="glass-card" style={styles.addressCard}>
            <div style={styles.addrHeader}>
              <span style={styles.addrLabel}>{addr.label}</span>
              {addr.isDefault && <span style={styles.defaultBadge}>Utama</span>}
            </div>
            <p style={styles.addrContact}>{addr.recipientName} | {addr.recipientPhone}</p>
            <p style={styles.addrStreet}>{addr.street}, {addr.city}, {addr.province} {addr.postalCode}</p>
          </div>
        ))}
      </div>

      {/* Orders List */}
      <h3 className="section-title" style={{ marginTop: '20px' }}>Pesanan Saya</h3>
      {orders.length > 0 ? (
        <div style={styles.ordersList}>
          {orders.map(order => (
            <div key={order.id} className="glass-card" style={styles.orderCard}>
              <div style={styles.orderCardHeader}>
                <div>
                  <span style={styles.orderId}>{order.id}</span>
                  <span style={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                </div>
                {getStatusBadge(order.status)}
              </div>

              {/* Items row snippet */}
              <div style={styles.orderItems}>
                <Package size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <span style={styles.itemNames}>
                  {order.items.map(i => `${i.title} (${i.quantity}x)`).join(', ')}
                </span>
                <span style={styles.orderTotal}>{formatPrice(order.total)}</span>
              </div>

              {/* Live Tracking timeline */}
              {order.status !== 'cancelled' && renderTrackingTimeline(order)}

              {/* Buyer Action buttons */}
              {order.status === 'shipped' && (
                <button 
                  className="btn btn-primary btn-block" 
                  style={{ marginTop: '10px', padding: '8px' }}
                  onClick={() => {
                    mockDb.updateOrderStatus(order.id, 'completed');
                    // refresh orders
                    setOrders(mockDb.getOrders().filter(o => o.buyerId === currentUser.id));
                    showToast('Pesanan selesai! Terima kasih sudah mendukung petani lokal.');
                  }}
                >
                  Konfirmasi Barang Diterima
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.emptyOrders}>
          <span style={{ fontSize: '2rem' }}>📦</span>
          <h4>Belum Ada Pesanan</h4>
          <p>Daftar transaksi belanja pertanian Anda akan muncul di sini.</p>
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
  profileCard: {
    padding: '16px',
    marginBottom: '20px',
  },
  profileRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    marginBottom: '14px',
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 'var(--border-radius-full)',
    objectFit: 'cover' as const,
    border: '2px solid var(--primary)',
  },
  profileInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  profileName: {
    fontSize: '0.95rem',
    fontWeight: 700,
    color: 'var(--text-main)',
  },
  profileEmail: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    marginTop: '1px',
  },
  buyerBadge: {
    fontSize: '0.58rem',
    background: 'rgba(21, 100, 49, 0.08)',
    color: 'var(--primary)',
    padding: '2px 8px',
    borderRadius: 'var(--border-radius-full)',
    fontWeight: 700,
    width: 'fit-content',
    marginTop: '4px',
  },
  actionGrid: {
    display: 'flex',
    gap: '10px',
  },
  actionBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '8px 12px',
    borderRadius: 'var(--border-radius-xs)',
    border: '1px solid var(--border)',
    background: 'none',
    fontSize: '0.72rem',
    fontWeight: 600,
    color: 'var(--text-main)',
    cursor: 'pointer',
  },
  addressList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  addressCard: {
    padding: '12px',
  },
  addrHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  addrLabel: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'var(--text-main)',
  },
  defaultBadge: {
    fontSize: '0.58rem',
    backgroundColor: 'var(--primary-light)',
    color: '#fff',
    padding: '1px 6px',
    borderRadius: 'var(--border-radius-xs)',
    fontWeight: 700,
  },
  addrContact: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
  },
  addrStreet: {
    fontSize: '0.78rem',
    color: 'var(--text-main)',
    marginTop: '4px',
  },
  ordersList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  orderCard: {
    padding: '12px',
  },
  orderCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border)',
    paddingBottom: '8px',
    marginBottom: '8px',
  },
  orderId: {
    fontSize: '0.78rem',
    fontFamily: 'monospace',
    fontWeight: 700,
    color: 'var(--text-main)',
  },
  orderDate: {
    fontSize: '0.68rem',
    color: 'var(--text-muted)',
    marginLeft: '6px',
  },
  orderItems: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.75rem',
    marginBottom: '10px',
  },
  itemNames: {
    color: 'var(--text-main)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    flex: 1,
  },
  orderTotal: {
    fontWeight: 700,
    color: 'var(--primary)',
    marginLeft: 'auto',
  },
  timelineContainer: {
    borderTop: '1px dashed var(--border)',
    paddingTop: '10px',
    marginTop: '6px',
  },
  timelineRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 6px',
    position: 'relative' as const,
  },
  timelineStep: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    zIndex: 2,
    position: 'relative' as const,
  },
  timelineCircle: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.62rem',
    fontWeight: 700,
    color: '#fff',
    border: '2px solid',
  },
  timelineLabel: {
    fontSize: '0.58rem',
    marginTop: '4px',
  },
  timelineLine: {
    height: '2px',
    flex: 1,
    marginTop: '-16px',
    zIndex: 1,
  },
  trackingDetails: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.68rem',
    backgroundColor: 'var(--bg-surface-elevated)',
    padding: '6px 8px',
    borderRadius: 'var(--border-radius-xs)',
    marginTop: '10px',
    color: 'var(--text-muted)',
  },
  emptyOrders: {
    padding: '30px 10px',
    textAlign: 'center' as const,
    color: 'var(--text-muted)',
  },
  emptyOrdersIcon: {
    fontSize: '2rem',
    marginBottom: '8px',
  }
};
