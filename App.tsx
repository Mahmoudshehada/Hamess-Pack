import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore, Notification } from './context/StoreContext';
import { BottomNav } from './components/BottomNav';
import { Home } from './pages/Home';
import { Catalog } from './pages/Catalog';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Profile } from './pages/Profile';
import { Admin } from './pages/Admin';
import { Auth } from './components/Auth';
import { CheckCircle, Info, AlertCircle, X, Loader } from 'lucide-react';

const SplashScreen = () => (
  <div className="fixed inset-0 bg-brand-600 flex flex-col items-center justify-center z-50 animate-fade-out">
    <div className="w-28 h-28 bg-accent-500 rounded-full flex items-center justify-center text-white mb-6 shadow-2xl animate-bounce border-4 border-white/20">
      <span className="font-serif font-bold text-5xl tracking-tighter -ml-1">HP</span>
    </div>
    <h1 className="text-4xl font-bold text-white tracking-tight uppercase font-sans">Hamess Pack</h1>
    <p className="text-brand-200 mt-2 tracking-widest text-xs uppercase font-bold">Plastics • Birthday • Party • Accessories</p>
  </div>
);

const LoadingScreen = () => (
   <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
      <Loader className="animate-spin text-brand-600 mb-4" size={40} />
      <p className="text-gray-500 font-medium">Loading Database...</p>
   </div>
);

const Toast: React.FC<{ notification: Notification; onClose: () => void }> = ({ notification, onClose }) => {
  const icons = {
    success: <CheckCircle size={20} className="text-green-500" />,
    info: <Info size={20} className="text-blue-500" />,
    error: <AlertCircle size={20} className="text-red-500" />
  };

  const colors = {
    success: 'bg-white border-l-4 border-green-500',
    info: 'bg-white border-l-4 border-blue-500',
    error: 'bg-white border-l-4 border-red-500'
  };

  return (
    <div className={`${colors[notification.type]} p-4 pr-12 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-sm animate-slide-in relative shadow-gray-200`}>
      {icons[notification.type]}
      <p className="text-sm font-medium text-gray-800 break-words flex-1">{notification.message}</p>
      <button 
        onClick={(e) => {
            e.stopPropagation();
            onClose();
        }} 
        className="absolute top-1 right-1 p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-50"
        aria-label="Close"
      >
        <X size={20} strokeWidth={2.5} />
      </button>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { user, logout, notifications, removeNotification, isLoading } = useStore();
  const [showSplash, setShowSplash] = useState(true);
  
  // Simple Routing State
  const [activeTab, setActiveTab] = useState('home');
  const [currentView, setCurrentView] = useState('main'); // main, product_detail, checkout, admin
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [catalogCategory, setCatalogCategory] = useState<string | undefined>(undefined);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  if (isLoading) {
      return <LoadingScreen />;
  }

  if (!user) {
    return <Auth />;
  }

  const renderContent = () => {
    if (currentView === 'admin') {
      return <Admin onBack={() => setCurrentView('main')} />;
    }

    if (currentView === 'product_detail' && selectedProductId) {
      return (
        <ProductDetail 
          productId={selectedProductId} 
          onBack={() => setCurrentView('main')} 
        />
      );
    }

    if (currentView === 'checkout') {
      return (
        <Checkout 
          onBack={() => {
            setCurrentView('main');
            setActiveTab('cart');
          }}
          onOrderComplete={() => {
            setCurrentView('main');
            setActiveTab('profile');
          }}
        />
      );
    }

    switch (activeTab) {
      case 'home':
        return (
          <Home 
            onNavigate={(tab, cat) => {
              setActiveTab(tab);
              if (cat) setCatalogCategory(cat);
            }}
            onProductClick={(id) => {
              setSelectedProductId(id);
              setCurrentView('product_detail');
            }}
          />
        );
      case 'catalog':
        return (
          <Catalog 
            initialCategory={catalogCategory} 
            onProductClick={(id) => {
              setSelectedProductId(id);
              setCurrentView('product_detail');
            }}
          />
        );
      case 'cart':
        return (
          <Cart 
            onCheckout={() => setCurrentView('checkout')} 
            onBrowse={() => setActiveTab('catalog')}
          />
        );
      case 'profile':
        return (
          <Profile 
            onLogout={logout}
            onAdminClick={() => setCurrentView('admin')}
          />
        );
      default:
        return <Home onNavigate={setActiveTab} onProductClick={(id) => { setSelectedProductId(id); setCurrentView('product_detail'); }} />;
    }
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen font-sans text-gray-900">
      {/* Render Header/Nav for both Desktop and Mobile */}
      {currentView === 'main' && <BottomNav currentTab={activeTab} onTabChange={setActiveTab} />}
      
      {/* Main Content Area */}
      <div className={`min-h-screen ${currentView === 'main' ? 'md:pt-20 pb-20 md:pb-0' : ''}`}>
        {renderContent()}
      </div>
      
      {/* Notification Container */}
      <div className="fixed top-20 right-4 z-[60] flex flex-col items-end gap-2 pointer-events-none">
        {notifications.map(n => (
          <div key={n.id} className="pointer-events-auto">
            <Toast notification={n} onClose={() => removeNotification(n.id)} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}