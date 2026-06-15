// Mock Database Service for Lapak Tani

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'buyer' | 'seller';
  companyName?: string;
  location?: string;
  avatar?: string;
  rating?: number;
  bankAccount?: string;
  shippingPartners?: string[];
  paymentMethods?: string[];
  addresses?: Address[];
}

export interface Address {
  id: string;
  label: string; // Home, Office
  recipientName: string;
  recipientPhone: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  category: 'Vegetables' | 'Fruits' | 'Grains' | 'Herbs & Spices' | 'Organic Items';
  price: number; // IDR per unit
  unit: string; // kg, bunch, bag
  stock: number;
  image: string;
  farmerId: string;
  farmerName: string;
  farmerAvatar: string;
  location: string;
  rating: number;
  salesCount: number;
  isBestSeller?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  buyerAddress: string;
  items: {
    productId: string;
    title: string;
    price: number;
    quantity: number;
    unit: string;
    image: string;
  }[];
  subtotal: number;
  deliveryFee: number;
  deliveryMethod: string;
  deliveryPartner: string; // e.g. "GoSend", "JNE"
  paymentMethod: string;
  paymentChannel: string; // e.g. "QRIS", "GoPay", "BCA Virtual Account"
  total: number;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  trackingNumber?: string;
  farmerId: string; // simplified: maps to primary farmer of items
  createdAt: string;
  updatedAt: string;
}

// Initial Data Seed
const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod1',
    title: 'Cabai Merah Keriting Fresh',
    description: 'Cabai merah keriting segar dipetik langsung dari kebun Ciwidey pagi hari. Sangat pedas dan segar, cocok untuk aneka sambal.',
    category: 'Herbs & Spices',
    price: 32000,
    unit: 'kg',
    stock: 85,
    image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&auto=format&fit=crop&q=80',
    farmerId: 'farmer1',
    farmerName: 'Pak Ketut',
    farmerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    location: 'Ciwidey, Bandung',
    rating: 4.8,
    salesCount: 420,
    isBestSeller: true
  },
  {
    id: 'prod2',
    title: 'Beras Organik Cianjur Pandan Wangi',
    description: 'Beras organik khas Cianjur dengan aroma wangi pandan alami. Tanpa pemutih, tanpa pengawet, dan bebas pestisida kimia.',
    category: 'Grains',
    price: 19500,
    unit: 'kg',
    stock: 250,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
    farmerId: 'farmer2',
    farmerName: 'Bu Jamilah',
    farmerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    location: 'Cianjur, Jawa Barat',
    rating: 4.9,
    salesCount: 580,
    isBestSeller: true
  },
  {
    id: 'prod3',
    title: 'Alpukat Mentega Super',
    description: 'Alpukat mentega super dengan daging buah tebal, legit, dan lembut. Dipanen dalam kondisi tua pohon, siap dikonsumsi 2-3 hari.',
    category: 'Fruits',
    price: 28000,
    unit: 'kg',
    stock: 60,
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&auto=format&fit=crop&q=80',
    farmerId: 'farmer1',
    farmerName: 'Pak Ketut',
    farmerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    location: 'Ciwidey, Bandung',
    rating: 4.7,
    salesCount: 310
  },
  {
    id: 'prod4',
    title: 'Biji Kopi Arabika Gayo Organik',
    description: 'Biji kopi arabika single origin Gayo, ditanam di ketinggian 1400 mdpl. Proses semi-washed, rasa seimbang dengan keasaman segar.',
    category: 'Organic Items',
    price: 120000,
    unit: 'kg',
    stock: 40,
    image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&auto=format&fit=crop&q=80',
    farmerId: 'farmer3',
    farmerName: 'Pak Gayo',
    farmerAvatar: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=80',
    location: 'Takengon, Aceh',
    rating: 4.9,
    salesCount: 190,
    isBestSeller: true
  },
  {
    id: 'prod5',
    title: 'Bayam Hijau Hidroponik',
    description: 'Bayam hijau hidroponik bebas pestisida, ditanam di rumah kaca higienis. Daun lebar, bersih, renyah, dan kaya akan nutrisi.',
    category: 'Vegetables',
    price: 8500,
    unit: 'bunch',
    stock: 120,
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80',
    farmerId: 'farmer2',
    farmerName: 'Bu Jamilah',
    farmerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    location: 'Cianjur, Jawa Barat',
    rating: 4.6,
    salesCount: 150
  },
  {
    id: 'prod6',
    title: 'Ubi Madu Cilembu Panggang',
    description: 'Ubi jalar madu Cilembu asli. Tekstur sangat manis mengeluarkan karamel madu saat dipanggang. Kaya serat dan karbohidrat baik.',
    category: 'Organic Items',
    price: 15000,
    unit: 'kg',
    stock: 110,
    image: 'https://images.unsplash.com/photo-1596097561432-34a568c07b91?w=600&auto=format&fit=crop&q=80',
    farmerId: 'farmer2',
    farmerName: 'Bu Jamilah',
    farmerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    location: 'Cianjur, Jawa Barat',
    rating: 4.8,
    salesCount: 280
  }
];

const DEFAULT_FARMERS: User[] = [
  {
    id: 'farmer1',
    email: 'farmer1@agri.id',
    name: 'Pak Ketut',
    role: 'seller',
    companyName: 'Tani Jaya Mandiri',
    location: 'Ciwidey, Bandung',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    rating: 4.8,
    bankAccount: 'BCA - 8290192019 (a/n Ketut Widnyana)',
    shippingPartners: ['gosend', 'grabexpress', 'jne', 'sicepat'],
    paymentMethods: ['qris', 'gopay', 'ovo', 'bca_va']
  },
  {
    id: 'farmer2',
    email: 'farmer2@agri.id',
    name: 'Bu Jamilah',
    role: 'seller',
    companyName: 'Kelompok Wanita Tani Cianjur',
    location: 'Cianjur, Jawa Barat',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    rating: 4.9,
    bankAccount: 'Mandiri - 132009876543 (a/n Jamilah Astuti)',
    shippingPartners: ['jne', 'sicepat', 'jnt'],
    paymentMethods: ['qris', 'dana', 'mandiri_va']
  },
  {
    id: 'farmer3',
    email: 'farmer3@agri.id',
    name: 'Pak Gayo',
    role: 'seller',
    companyName: 'Koperasi Kopi Gayo Lestari',
    location: 'Takengon, Aceh',
    avatar: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=80',
    rating: 4.9,
    bankAccount: 'BRI - 0032010203040506 (a/n Gayo Coffee Corp)',
    shippingPartners: ['jne', 'sicepat'],
    paymentMethods: ['qris', 'bca_va']
  }
];

const DEFAULT_BUYER: User = {
  id: 'buyer1',
  email: 'budi@agri.id',
  name: 'Budi Santoso',
  role: 'buyer',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  addresses: [
    {
      id: 'addr1',
      label: 'Rumah Utama',
      recipientName: 'Budi Santoso',
      recipientPhone: '081234567890',
      street: 'Jl. Dago Asri No. 45',
      city: 'Bandung',
      province: 'Jawa Barat',
      postalCode: '40135',
      isDefault: true
    },
    {
      id: 'addr2',
      label: 'Kantor',
      recipientName: 'Budi Santoso (Lobby)',
      recipientPhone: '081234567891',
      street: 'Paskal Hyper Square Blok B-12',
      city: 'Bandung',
      province: 'Jawa Barat',
      postalCode: '40181',
      isDefault: false
    }
  ]
};

// Database Initialization Helper
const getOrInit = <T>(key: string, defaultValue: T): T => {
  const item = localStorage.getItem(key);
  if (!item) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  return JSON.parse(item);
};

export const mockDb = {
  // Initialize Database
  init: () => {
    getOrInit('agri_products', DEFAULT_PRODUCTS);
    getOrInit('agri_farmers', DEFAULT_FARMERS);
    getOrInit('agri_orders', []);
    getOrInit('agri_favorites', []);
    getOrInit('agri_search_history', ['Cabai', 'Beras Organik', 'Alpukat']);
    getOrInit('agri_cart', []);
    
    // Set default active user to guest by default, but we can seed the accounts
    getOrInit('agri_users', [DEFAULT_BUYER, ...DEFAULT_FARMERS]);
    
    // Ensure we keep logged-in session state
    const currentUser = localStorage.getItem('agri_current_user');
    if (!currentUser) {
      // Start as Guest (null) by default
      localStorage.setItem('agri_current_user', JSON.stringify(null));
    }
  },

  // Products
  getProducts: (): Product[] => {
    return getOrInit('agri_products', DEFAULT_PRODUCTS);
  },

  saveProducts: (products: Product[]) => {
    localStorage.setItem('agri_products', JSON.stringify(products));
  },

  addProduct: (product: Omit<Product, 'id' | 'rating' | 'salesCount'>) => {
    const products = mockDb.getProducts();
    const newProduct: Product = {
      ...product,
      id: 'prod_' + Math.random().toString(36).substring(2, 9),
      rating: 5.0,
      salesCount: 0
    };
    products.unshift(newProduct);
    mockDb.saveProducts(products);
    return newProduct;
  },

  updateProduct: (updated: Product) => {
    const products = mockDb.getProducts();
    const index = products.findIndex(p => p.id === updated.id);
    if (index !== -1) {
      products[index] = updated;
      mockDb.saveProducts(products);
    }
  },

  deleteProduct: (id: string) => {
    const products = mockDb.getProducts();
    const filtered = products.filter(p => p.id !== id);
    mockDb.saveProducts(filtered);
  },

  // Users & Session
  getUsers: (): User[] => {
    return getOrInit('agri_users', [DEFAULT_BUYER, ...DEFAULT_FARMERS]);
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('agri_current_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  setCurrentUser: (user: User | null) => {
    localStorage.setItem('agri_current_user', JSON.stringify(user));
    // If user is updated, sync back to general users store
    if (user) {
      const users = mockDb.getUsers();
      const idx = users.findIndex(u => u.id === user.id);
      if (idx !== -1) {
        users[idx] = user;
      } else {
        users.push(user);
      }
      localStorage.setItem('agri_users', JSON.stringify(users));
    }
  },

  registerUser: (name: string, email: string, role: 'buyer' | 'seller', companyName?: string, location?: string) => {
    const users = mockDb.getUsers();
    
    // Verify email doesn't exist
    const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) return exists;

    const newUser: User = {
      id: (role === 'seller' ? 'farmer_' : 'buyer_') + Math.random().toString(36).substring(2, 9),
      email,
      name,
      role,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
      ...(role === 'seller' ? {
        companyName: companyName || `${name} Farm`,
        location: location || 'Bandung, Jawa Barat',
        rating: 5.0,
        bankAccount: 'BCA - 0000000000',
        shippingPartners: ['jne', 'sicepat'],
        paymentMethods: ['qris', 'bca_va']
      } : {
        addresses: [{
          id: 'addr_' + Math.random().toString(36).substring(2, 9),
          label: 'Rumah Utama',
          recipientName: name,
          recipientPhone: '08123456789',
          street: 'Jl. Baru No. 12',
          city: 'Bandung',
          province: 'Jawa Barat',
          postalCode: '40111',
          isDefault: true
        }]
      })
    };

    users.push(newUser);
    localStorage.setItem('agri_users', JSON.stringify(users));
    mockDb.setCurrentUser(newUser);
    return newUser;
  },

  // Cart (Basket)
  getCart: (): CartItem[] => {
    return getOrInit('agri_cart', []);
  },

  saveCart: (cart: CartItem[]) => {
    localStorage.setItem('agri_cart', JSON.stringify(cart));
  },

  addToCart: (product: Product, quantity: number = 1) => {
    const cart = mockDb.getCart();
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ product, quantity });
    }
    mockDb.saveCart(cart);
  },

  updateCartQty: (productId: string, quantity: number) => {
    let cart = mockDb.getCart();
    if (quantity <= 0) {
      cart = cart.filter(item => item.product.id !== productId);
    } else {
      const item = cart.find(item => item.product.id === productId);
      if (item) item.quantity = quantity;
    }
    mockDb.saveCart(cart);
  },

  clearCart: () => {
    localStorage.setItem('agri_cart', JSON.stringify([]));
  },

  // Favorites
  getFavorites: (): string[] => {
    return getOrInit('agri_favorites', []);
  },

  toggleFavorite: (productId: string) => {
    const favorites = mockDb.getFavorites();
    const index = favorites.indexOf(productId);
    if (index === -1) {
      favorites.push(productId);
    } else {
      favorites.splice(index, 1);
    }
    localStorage.setItem('agri_favorites', JSON.stringify(favorites));
    return favorites.includes(productId);
  },

  // Search History
  getSearchHistory: (): string[] => {
    return getOrInit('agri_search_history', []);
  },

  addSearchQuery: (query: string) => {
    if (!query.trim()) return;
    let history = mockDb.getSearchHistory();
    history = history.filter(q => q.toLowerCase() !== query.toLowerCase());
    history.unshift(query);
    history = history.slice(0, 10); // cap at 10 items
    localStorage.setItem('agri_search_history', JSON.stringify(history));
  },

  clearSearchHistory: () => {
    localStorage.setItem('agri_search_history', JSON.stringify([]));
  },

  // Orders
  getOrders: (): Order[] => {
    return getOrInit('agri_orders', []);
  },

  createOrder: (orderData: Omit<Order, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    const orders = mockDb.getOrders();
    const newOrder: Order = {
      ...orderData,
      id: 'TRX-' + Math.floor(100000 + Math.random() * 900000),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    orders.unshift(newOrder);
    localStorage.setItem('agri_orders', JSON.stringify(orders));
    return newOrder;
  },

  updateOrderStatus: (orderId: string, status: Order['status'], trackingNumber?: string) => {
    const orders = mockDb.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      orders[index].status = status;
      if (trackingNumber) {
        orders[index].trackingNumber = trackingNumber;
      }
      orders[index].updatedAt = new Date().toISOString();
      localStorage.setItem('agri_orders', JSON.stringify(orders));
      
      // If payment completed, increment sales metrics of products in mock db
      if (status === 'paid') {
        const products = mockDb.getProducts();
        orders[index].items.forEach(item => {
          const prodIdx = products.findIndex(p => p.id === item.productId);
          if (prodIdx !== -1) {
            products[prodIdx].salesCount += item.quantity;
            if (products[prodIdx].stock >= item.quantity) {
              products[prodIdx].stock -= item.quantity;
            }
          }
        });
        mockDb.saveProducts(products);
      }
    }
  }
};
