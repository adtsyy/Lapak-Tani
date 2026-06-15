import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { mockDb } from '../services/mockDb';
import type { Product, Order, User } from '../services/mockDb';
import { SellerCharts } from '../components/SellerCharts';

interface SellerDashboardProps {
  currentUser: User;
  showToast: (msg: string) => void;
}

export const SellerDashboard = ({
  currentUser,
  showToast
}: SellerDashboardProps) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'products' | 'orders' | 'settings'>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states for Add/Edit Product
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formUnit, setFormUnit] = useState('kg');
  const [formCategory, setFormCategory] = useState<'Vegetables' | 'Fruits' | 'Grains' | 'Herbs & Spices' | 'Organic Items'>('Vegetables');
  const [formImage, setFormImage] = useState('https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600');

  // Order shipping modal states
  const [shippingOrderId, setShippingOrderId] = useState<string | null>(null);
  const [trackingCode, setTrackingCode] = useState('');

  // Sample seed photos for product creation
  const seedPhotos = [
    { label: 'Cabai Merah', url: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600' },
    { label: 'Beras Grains', url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600' },
    { label: 'Alpukat', url: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600' },
    { label: 'Sayur Hijau', url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600' },
    { label: 'Kopi Beans', url: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600' },
    { label: 'Ubi Madu', url: 'https://images.unsplash.com/photo-1596097561432-34a568c07b91?w=600' }
  ];

  const refreshData = () => {
    // Get products belonging to current farmer
    const allProducts = mockDb.getProducts();
    setProducts(allProducts.filter(p => p.farmerId === currentUser.id));

    // Get orders belonging to current farmer
    const allOrders = mockDb.getOrders();
    setOrders(allOrders.filter(o => o.farmerId === currentUser.id));
  };

  useEffect(() => {
    refreshData();
  }, [currentUser]);

  // Compute Dashboard Metrics
  const paidOrders = orders.filter(o => o.status !== 'pending' && o.status !== 'cancelled');
  const revenue = paidOrders.reduce((sum, o) => sum + o.subtotal, 0);
  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const shippedOrders = orders.filter(o => o.status === 'shipped').length;

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormTitle('');
    setFormDesc('');
    setFormPrice('15000');
    setFormStock('50');
    setFormUnit('kg');
    setFormCategory('Vegetables');
    setFormImage(seedPhotos[0].url);
    setShowProductModal(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setFormTitle(prod.title);
    setFormDesc(prod.description);
    setFormPrice(String(prod.price));
    setFormStock(String(prod.stock));
    setFormUnit(prod.unit);
    setFormCategory(prod.category);
    setFormImage(prod.image);
    setShowProductModal(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formPrice || !formStock) return;

    const prodData = {
      title: formTitle,
      description: formDesc,
      price: Number(formPrice),
      stock: Number(formStock),
      unit: formUnit,
      category: formCategory,
      image: formImage,
      farmerId: currentUser.id,
      farmerName: currentUser.name,
      farmerAvatar: currentUser.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      location: currentUser.location || 'Ciwidey, Bandung'
    };

    if (editingProduct) {
      mockDb.updateProduct({
        ...editingProduct,
        ...prodData
      });
      showToast('Produk berhasil diperbarui!');
    } else {
      mockDb.addProduct(prodData);
      showToast('Produk baru berhasil ditambahkan!');
    }

    setShowProductModal(false);
    refreshData();
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Hapus produk ini dari toko?')) {
      mockDb.deleteProduct(id);
      showToast('Produk dihapus');
      refreshData();
    }
  };

  const handleUpdateStatus = (orderId: string, status: Order['status']) => {
    if (status === 'shipped') {
      // Trigger modal to input tracking code
      setShippingOrderId(orderId);
      setTrackingCode(`AWB-${Math.floor(100000000 + Math.random() * 900000000)}`);
    } else {
      mockDb.updateOrderStatus(orderId, status);
      showToast(`Status pesanan diperbarui ke: ${status}`);
      refreshData();
    }
  };

  const handleShipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (shippingOrderId && trackingCode) {
      mockDb.updateOrderStatus(shippingOrderId, 'shipped', trackingCode);
      showToast('Pesanan berhasil dikirim dengan kurir!');
      setShippingOrderId(null);
      refreshData();
    }
  };

  const formatPrice = (price: number) => {
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      {/* Farmer Store Profile Header */}
      <div className="glass-card" style={styles.storeHeader}>
        <div style={styles.storeRow}>
          <img src={currentUser.avatar} alt={currentUser.name} style={styles.avatar} />
          <div>
            <h2 style={styles.storeName}>{currentUser.companyName || `${currentUser.name} Farm`}</h2>
            <p style={styles.storeLocation}>{currentUser.location || 'Bandung, Jawa Barat'}</p>
            <span style={styles.ratingText}>⭐ {currentUser.rating || 4.9} Penjual Terverifikasi</span>
          </div>
        </div>
      </div>

      {/* Sub-tabs bar navigation */}
      <div style={styles.tabBar}>
        <button 
          style={{ ...styles.tabItem, borderBottomColor: activeSubTab === 'overview' ? 'var(--primary)' : 'transparent', color: activeSubTab === 'overview' ? 'var(--primary)' : 'var(--text-muted)' }}
          onClick={() => setActiveSubTab('overview')}
        >
          Ringkasan
        </button>
        <button 
          style={{ ...styles.tabItem, borderBottomColor: activeSubTab === 'products' ? 'var(--primary)' : 'transparent', color: activeSubTab === 'products' ? 'var(--primary)' : 'var(--text-muted)' }}
          onClick={() => setActiveSubTab('products')}
        >
          Produk ({products.length})
        </button>
        <button 
          style={{ ...styles.tabItem, borderBottomColor: activeSubTab === 'orders' ? 'var(--primary)' : 'transparent', color: activeSubTab === 'orders' ? 'var(--primary)' : 'var(--text-muted)' }}
          onClick={() => setActiveSubTab('orders')}
        >
          Pesanan ({orders.length})
        </button>
      </div>

      {/* Sub-tab 1: Store Overview Analytics */}
      {activeSubTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Custom SVG charts */}
          <SellerCharts 
            revenue={revenue} 
            totalOrders={totalOrders} 
            completedOrdersCount={completedOrders}
            shippedOrdersCount={shippedOrders}
          />
        </div>
      )}

      {/* Sub-tab 2: Products Manager */}
      {activeSubTab === 'products' && (
        <div>
          <div style={styles.actionHeader}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Katalog Produk Toko</h3>
            <button className="btn btn-primary" style={styles.addBtn} onClick={handleOpenAdd}>
              <Plus size={14} /> <span>Tambah Produk</span>
            </button>
          </div>

          <div style={styles.prodList}>
            {products.length > 0 ? (
              products.map(prod => (
                <div key={prod.id} className="glass-card" style={styles.prodCard}>
                  <img src={prod.image} alt={prod.title} style={styles.prodImg} />
                  <div style={styles.prodInfo}>
                    <h4 style={styles.prodTitle}>{prod.title}</h4>
                    <span style={styles.prodPrice}>{formatPrice(prod.price)} / {prod.unit}</span>
                    <span style={styles.prodStock}>Stok: <strong>{prod.stock} {prod.unit}</strong></span>
                  </div>
                  <div style={styles.prodActions}>
                    <button style={styles.editBtn} onClick={() => handleOpenEdit(prod)}><Edit2 size={12} /></button>
                    <button style={styles.deleteBtn} onClick={() => handleDeleteProduct(prod.id)}><Trash2 size={12} /></button>
                  </div>
                </div>
              ))
            ) : (
              <div style={styles.emptyState}>
                <span style={{ fontSize: '2rem' }}>🥬</span>
                <p>Belum ada produk di toko Anda. Tambah produk pertama Anda!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {showProductModal && (
        <div style={styles.modalBackdrop}>
          <div className="glass-card" style={styles.modalContent}>
            <h3 style={styles.modalTitle}>{editingProduct ? 'Ubah Informasi Produk' : 'Tambah Produk Baru'}</h3>
            
            <form onSubmit={handleSaveProduct} style={styles.modalForm}>
              <div className="form-group">
                <label className="form-label">Nama Produk</label>
                <input 
                  type="text" 
                  value={formTitle} 
                  onChange={e => setFormTitle(e.target.value)} 
                  placeholder="Contoh: Beras Organik Super"
                  className="input-field" 
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Harga (IDR)</label>
                  <input 
                    type="number" 
                    value={formPrice} 
                    onChange={e => setFormPrice(e.target.value)} 
                    placeholder="25000"
                    className="input-field" 
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Stok Awal</label>
                  <input 
                    type="number" 
                    value={formStock} 
                    onChange={e => setFormStock(e.target.value)} 
                    placeholder="100"
                    className="input-field" 
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Satuan</label>
                  <select value={formUnit} onChange={e => setFormUnit(e.target.value)} className="input-field">
                    <option value="kg">kg (Kilogram)</option>
                    <option value="bunch">ikat (Bunch)</option>
                    <option value="bag">kantong (Bag)</option>
                    <option value="pack">kemasan (Pack)</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Kategori</label>
                  <select value={formCategory} onChange={e => setFormCategory(e.target.value as any)} className="input-field">
                    <option value="Vegetables">🥬 Sayuran</option>
                    <option value="Fruits">🍎 Buah-Buahan</option>
                    <option value="Grains">🌾 Biji & Beras</option>
                    <option value="Herbs & Spices">🌶️ Bumbu Dapur</option>
                    <option value="Organic Items">☕ Produk Organik</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Deskripsi Produk</label>
                <textarea 
                  value={formDesc} 
                  onChange={e => setFormDesc(e.target.value)} 
                  placeholder="Deskripsikan kesegaran produk pertanian Anda..."
                  className="input-field"
                  style={{ minHeight: '60px', resize: 'vertical' }}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Pilih Foto Komoditas</label>
                <div style={styles.imageSelector}>
                  {seedPhotos.map((photo, i) => (
                    <img 
                      key={i}
                      src={photo.url} 
                      alt={photo.label} 
                      onClick={() => setFormImage(photo.url)}
                      style={{
                        ...styles.selectorImg,
                        borderColor: formImage === photo.url ? 'var(--primary)' : 'var(--border)'
                      }}
                      title={photo.label}
                    />
                  ))}
                </div>
              </div>

              <div style={styles.modalActions}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowProductModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sub-tab 3: Orders Manager Inbox */}
      {activeSubTab === 'orders' && (
        <div style={styles.ordersSection}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px' }}>Inbox Pesanan Buyer</h3>
          {orders.length > 0 ? (
            <div style={styles.ordersList}>
              {orders.map(order => (
                <div key={order.id} className="glass-card" style={styles.orderCard}>
                  <div style={styles.orderCardHeader}>
                    <div>
                      <span style={styles.orderId}>{order.id}</span>
                      <span style={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString('id-ID')}</span>
                    </div>
                    <span style={{ 
                      fontSize: '0.65rem', 
                      fontWeight: 700, 
                      textTransform: 'uppercase'
                    }}>{order.status}</span>
                  </div>

                  <div style={styles.orderBody}>
                    <p style={styles.orderBuyer}>Pembeli: <strong>{order.buyerName}</strong> ({order.buyerPhone})</p>
                    <p style={styles.orderAddress}>Alamat: {order.buyerAddress}</p>
                    
                    <div style={styles.orderItems}>
                      {order.items.map((item, idx) => (
                        <div key={idx} style={styles.orderItemRow}>
                          <span>{item.title}</span>
                          <span>{item.quantity} {item.unit} x {formatPrice(item.price)}</span>
                        </div>
                      ))}
                    </div>

                    <div style={styles.orderTotalRow}>
                      <span>Total Tagihan:</span>
                      <span style={styles.orderTotalValue}>{formatPrice(order.total)}</span>
                    </div>

                    {/* Shipping and processing flow action controls */}
                    <div style={styles.orderActions}>
                      {order.status === 'paid' && (
                        <button 
                          className="btn btn-primary btn-block"
                          style={{ padding: '8px' }}
                          onClick={() => handleUpdateStatus(order.id, 'processing')}
                        >
                          Proses Pesanan (Packing)
                        </button>
                      )}

                      {order.status === 'processing' && (
                        <button 
                          className="btn btn-accent btn-block"
                          style={{ padding: '8px' }}
                          onClick={() => handleUpdateStatus(order.id, 'shipped')}
                        >
                          Kirim Barang (Panggil Kurir)
                        </button>
                      )}

                      {order.status === 'shipped' && (
                        <span style={styles.shippedLabel}>
                          🚚 Sedang dikirim ({order.deliveryPartner}) Resi: {order.trackingNumber}
                        </span>
                      )}

                      {order.status === 'completed' && (
                        <span style={styles.completedLabel}>✓ Pesanan Selesai & Diterima</span>
                      )}

                      {order.status === 'pending' && (
                        <span style={styles.pendingLabel}>⌛ Menunggu Pembayaran Buyer (Sistem)</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.emptyState}>
              <span style={{ fontSize: '2rem' }}>📦</span>
              <p>Belum ada pesanan masuk dari pembeli.</p>
            </div>
          )}
        </div>
      )}

      {/* Assign Shipping Tracking code Dialog */}
      {shippingOrderId && (
        <div style={styles.modalBackdrop}>
          <div className="glass-card" style={styles.modalContent}>
            <h4 style={{ marginBottom: '10px', fontFamily: 'var(--font-heading)' }}>Pengiriman Kurir</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Assign nomor resi pengiriman untuk order <strong>{shippingOrderId}</strong>.
            </p>
            <form onSubmit={handleShipSubmit}>
              <div className="form-group">
                <label className="form-label">Nomor Resi / AWB (Otomatis)</label>
                <input 
                  type="text" 
                  value={trackingCode} 
                  onChange={e => setTrackingCode(e.target.value)} 
                  className="input-field" 
                  required
                />
              </div>
              <div style={styles.modalActions}>
                <button type="button" className="btn btn-secondary" onClick={() => setShippingOrderId(null)}>Batal</button>
                <button type="submit" className="btn btn-primary">Konfirmasi Pengiriman</button>
              </div>
            </form>
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
  storeHeader: {
    padding: '14px',
    marginBottom: '16px',
  },
  storeRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 'var(--border-radius-sm)',
    objectFit: 'cover' as const,
    border: '2px solid var(--primary)',
  },
  storeName: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1rem',
    fontWeight: 800,
    color: 'var(--text-main)',
  },
  storeLocation: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    marginTop: '1px',
  },
  ratingText: {
    fontSize: '0.68rem',
    color: 'var(--primary-light)',
    fontWeight: 700,
    display: 'block',
    marginTop: '3px',
  },
  tabBar: {
    display: 'flex',
    borderBottom: '1px solid var(--border)',
    marginBottom: '16px',
  },
  tabItem: {
    flex: 1,
    padding: '10px 0',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    fontSize: '0.8rem',
    fontWeight: 700,
    cursor: 'pointer',
    textAlign: 'center' as const,
    transition: 'all var(--transition-fast)',
  },
  actionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px',
  },
  addBtn: {
    padding: '6px 12px',
    fontSize: '0.75rem',
    borderRadius: 'var(--border-radius-xs)',
  },
  prodList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  prodCard: {
    display: 'flex',
    gap: '12px',
    padding: '10px',
    alignItems: 'center',
  },
  prodImg: {
    width: 54,
    height: 54,
    borderRadius: 'var(--border-radius-xs)',
    objectFit: 'cover' as const,
  },
  prodInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
  },
  prodTitle: {
    fontSize: '0.78rem',
    fontWeight: 600,
    color: 'var(--text-main)',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  prodPrice: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'var(--primary)',
    marginTop: '2px',
  },
  prodStock: {
    fontSize: '0.68rem',
    color: 'var(--text-muted)',
  },
  prodActions: {
    display: 'flex',
    gap: '6px',
  },
  editBtn: {
    border: '1px solid var(--border)',
    background: 'var(--bg-surface-elevated)',
    color: 'var(--text-main)',
    width: 28,
    height: 28,
    borderRadius: 'var(--border-radius-xs)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  deleteBtn: {
    border: 'none',
    background: 'rgba(239, 68, 68, 0.08)',
    color: 'var(--danger)',
    width: 28,
    height: 28,
    borderRadius: 'var(--border-radius-xs)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  modalBackdrop: {
    position: 'absolute' as const,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
  },
  modalContent: {
    width: '100%',
    backgroundColor: 'var(--bg-surface)',
    padding: '14px',
    maxHeight: 'calc(100% - 32px)',
    overflowY: 'auto' as const,
  },
  modalTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1rem',
    fontWeight: 800,
    marginBottom: '12px',
    color: 'var(--text-main)',
  },
  modalForm: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0px',
  },
  imageSelector: {
    display: 'flex',
    gap: '6px',
    overflowX: 'auto' as const,
    paddingBottom: '6px',
  },
  selectorImg: {
    width: 44,
    height: 44,
    borderRadius: 'var(--border-radius-xs)',
    objectFit: 'cover' as const,
    border: '2px solid',
    cursor: 'pointer',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '10px',
  },
  ordersSection: {
    marginTop: '4px',
  },
  ordersList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  orderCard: {
    padding: '12px',
  },
  orderCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border)',
    paddingBottom: '6px',
    marginBottom: '8px',
  },
  orderId: {
    fontSize: '0.75rem',
    fontFamily: 'monospace',
    fontWeight: 700,
    color: 'var(--text-main)',
  },
  orderDate: {
    fontSize: '0.65rem',
    color: 'var(--text-muted)',
    marginLeft: '6px',
  },
  orderBody: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  orderBuyer: {
    fontSize: '0.75rem',
    color: 'var(--text-main)',
  },
  orderAddress: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    lineHeight: '1.3',
  },
  orderItems: {
    backgroundColor: 'var(--bg-surface-elevated)',
    borderRadius: 'var(--border-radius-xs)',
    padding: '8px',
    margin: '6px 0',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  orderItemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.7rem',
    color: 'var(--text-main)',
  },
  orderTotalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'var(--text-main)',
    borderTop: '1px solid var(--border)',
    paddingTop: '6px',
    marginTop: '4px',
  },
  orderTotalValue: {
    color: 'var(--primary)',
    fontWeight: 800,
  },
  orderActions: {
    marginTop: '10px',
  },
  shippedLabel: {
    display: 'block',
    textAlign: 'center' as const,
    fontSize: '0.72rem',
    color: 'var(--primary-light)',
    backgroundColor: 'rgba(21, 100, 49, 0.05)',
    padding: '6px',
    borderRadius: 'var(--border-radius-xs)',
    fontWeight: 700,
  },
  completedLabel: {
    display: 'block',
    textAlign: 'center' as const,
    fontSize: '0.72rem',
    color: 'var(--success)',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    padding: '6px',
    borderRadius: 'var(--border-radius-xs)',
    fontWeight: 700,
  },
  pendingLabel: {
    display: 'block',
    textAlign: 'center' as const,
    fontSize: '0.72rem',
    color: 'var(--warning)',
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
    padding: '6px',
    borderRadius: 'var(--border-radius-xs)',
    fontWeight: 700,
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '30px 10px',
    color: 'var(--text-muted)',
    fontSize: '0.8rem',
  }
};
