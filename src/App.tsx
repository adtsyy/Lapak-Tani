import { useState, useEffect } from 'react';
import { mockDb } from './services/mockDb';
import type { User, Product, CartItem } from './services/mockDb';
import { MobileFrame } from './components/MobileFrame';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';

// Pages
import { Home } from './pages/Home';
import { Explore } from './pages/Explore';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { PaymentGateway } from './pages/PaymentGateway';
import { Profile } from './pages/Profile';
import { SellerDashboard } from './pages/SellerDashboard';
import { Favorites } from './pages/Favorites';
import { Login } from './pages/Login';

export default function App() {
  // Application states
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [pageParams, setPageParams] = useState<any>({});
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // Toast notifications
  const [toast, setToast] = useState<string | null>(null);

  // Initialize DB on mount
  useEffect(() => {
    mockDb.init();
    setCurrentUser(mockDb.getCurrentUser());
    setCart(mockDb.getCart());
    setFavorites(mockDb.getFavorites());
  }, []);

  // Update theme document attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  // Navigations handler
  const handleNavigate = (page: string, params: any = {}) => {
    setCurrentPage(page);
    setPageParams(params);
    
    // Scroll viewport to top on page changes
    const appViewport = document.querySelector('.app-content');
    if (appViewport) {
      appViewport.scrollTop = 0;
    }
  };

  // Role quick toggler for evaluation convenience
  const handleSwitchRole = () => {
    const users = mockDb.getUsers();
    if (!currentUser) {
      // Default to login page if guest
      handleNavigate('login');
      showToast('Silakan masuk terlebih dahulu');
      return;
    }

    if (currentUser.role === 'buyer') {
      // Switch from buyer to default farmer (Pak Ketut)
      const farmer = users.find(u => u.role === 'seller');
      if (farmer) {
        mockDb.setCurrentUser(farmer);
        setCurrentUser(farmer);
        handleNavigate('dashboard');
        showToast('Beralih ke Dashboard Petani (Pak Ketut)');
      }
    } else {
      // Switch from seller to default buyer (Budi Santoso)
      const buyer = users.find(u => u.role === 'buyer');
      if (buyer) {
        mockDb.setCurrentUser(buyer);
        setCurrentUser(buyer);
        handleNavigate('home');
        showToast('Beralih ke Halaman Pembeli (Budi)');
      }
    }
  };

  // Logout handler
  const handleLogout = () => {
    mockDb.setCurrentUser(null);
    setCurrentUser(null);
    handleNavigate('home');
    showToast('Berhasil keluar akun');
  };

  // Cart operations
  const handleAddToCart = (product: Product, quantity: number = 1) => {
    mockDb.addToCart(product, quantity);
    setCart(mockDb.getCart());
    showToast(`${product.title} ditambahkan ke keranjang`);
  };

  const handleUpdateCartQty = (productId: string, quantity: number) => {
    mockDb.updateCartQty(productId, quantity);
    setCart(mockDb.getCart());
  };

  const handleClearCart = () => {
    mockDb.clearCart();
    setCart([]);
  };

  // Favorite operations
  const handleToggleFavorite = (productId: string) => {
    mockDb.toggleFavorite(productId);
    setFavorites(mockDb.getFavorites());
  };

  // Cart badge calculations
  const cartBadgeCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Router dispatcher
  const renderPageContent = () => {
    switch (currentPage) {
      case 'home':
        return (
          <Home 
            onNavigate={handleNavigate}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onAddToCart={handleAddToCart}
            showToast={showToast}
          />
        );
      case 'explore':
        return (
          <Explore 
            onNavigate={handleNavigate}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onAddToCart={handleAddToCart}
            showToast={showToast}
          />
        );
      case 'detail':
        return (
          <ProductDetail 
            product={pageParams.product}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onAddToCart={handleAddToCart}
            onNavigate={handleNavigate}
            showToast={showToast}
          />
        );
      case 'cart':
        return (
          <Cart 
            cart={cart}
            onUpdateQty={handleUpdateCartQty}
            onNavigate={handleNavigate}
            currentUser={currentUser}
            showToast={showToast}
          />
        );
      case 'checkout':
        if (!currentUser) return <Login onNavigate={handleNavigate} onLoginSuccess={setCurrentUser} redirectTo="checkout" showToast={showToast} />;
        return (
          <Checkout 
            cart={cart}
            currentUser={currentUser}
            onNavigate={handleNavigate}
            showToast={showToast}
          />
        );
      case 'payment':
        return (
          <PaymentGateway 
            order={pageParams.order}
            paymentType={pageParams.paymentType}
            onNavigate={handleNavigate}
            onClearCart={handleClearCart}
            showToast={showToast}
          />
        );
      case 'profile':
        if (!currentUser) return <Login onNavigate={handleNavigate} onLoginSuccess={setCurrentUser} showToast={showToast} />;
        return (
          <Profile 
            currentUser={currentUser}
            onLogout={handleLogout}
            onSwitchRole={handleSwitchRole}
            showToast={showToast}
          />
        );
      case 'dashboard':
        if (!currentUser || currentUser.role !== 'seller') {
          return <Login onNavigate={handleNavigate} onLoginSuccess={setCurrentUser} redirectTo="dashboard" showToast={showToast} />;
        }
        return (
          <SellerDashboard 
            currentUser={currentUser}
            showToast={showToast}
          />
        );
      case 'favorites':
        return (
          <Favorites
            onNavigate={handleNavigate}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onAddToCart={handleAddToCart}
            showToast={showToast}
          />
        );
      case 'login':
        return (
          <Login 
            onNavigate={handleNavigate}
            onLoginSuccess={(user) => {
              setCurrentUser(user);
              refreshFavoritesAndCart();
            }}
            redirectTo={pageParams.redirectTo}
            showToast={showToast}
          />
        );
      default:
        return <Home onNavigate={handleNavigate} favorites={favorites} onToggleFavorite={handleToggleFavorite} onAddToCart={handleAddToCart} showToast={showToast} />;
    }
  };

  const refreshFavoritesAndCart = () => {
    setCart(mockDb.getCart());
    setFavorites(mockDb.getFavorites());
  };

  // Determine active Bottom Navigation Tab matching the page
  const getActiveTab = () => {
    if (currentPage === 'dashboard') return 'dashboard';
    if (currentPage === 'profile') return 'profile';
    if (['home', 'explore', 'cart', 'favorites'].includes(currentPage)) {
      return currentPage;
    }
    return 'home';
  };

  return (
    <MobileFrame theme={theme} setTheme={setTheme}>
      {/* Toast Notification Pop-up */}
      {toast && (
        <div className="toast-pill">
          <span>🌿</span>
          <span>{toast}</span>
        </div>
      )}

      {/* Main app header */}
      {currentPage !== 'payment' && currentPage !== 'login' && (
        <Navbar 
          currentUser={currentUser}
          onSwitchRole={handleSwitchRole}
          onNavigate={handleNavigate}
        />
      )}

      {/* Scrollable body content */}
      <div className="app-content">
        {renderPageContent()}
      </div>

      {/* Navigation bottom tab-bar */}
      {currentPage !== 'payment' && currentPage !== 'login' && currentPage !== 'checkout' && (
        <BottomNav 
          activeTab={getActiveTab()}
          onNavigate={handleNavigate}
          cartCount={cartBadgeCount}
          currentUser={currentUser}
        />
      )}
    </MobileFrame>
  );
}
