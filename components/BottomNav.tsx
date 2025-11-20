import React from 'react';
import { Home, Search, ShoppingBag, User as UserIcon } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface BottomNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const { cart } = useStore();
  
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'catalog', icon: Search, label: 'Browse' },
    { id: 'cart', icon: ShoppingBag, label: 'Cart', badge: cart.length > 0 ? cart.length : undefined },
    { id: 'profile', icon: UserIcon, label: 'Profile' },
  ];

  return (
    <>
      {/* Desktop Top Navigation */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 px-6 lg:px-12 py-4 items-center justify-between shadow-sm">
        <div 
          className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition" 
          onClick={() => onTabChange('home')}
        >
             <div className="bg-accent-500 text-white w-12 h-12 rounded-full flex items-center justify-center font-serif font-bold text-2xl shadow-md border-2 border-white/50">
                <span className="tracking-tighter -ml-0.5">HP</span>
             </div>
             <div>
               <span className="block font-bold text-xl text-brand-600 leading-none uppercase tracking-tight font-sans">Hamess Pack</span>
               <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Plastics • Birthday • Party • Accessories</span>
             </div>
        </div>

        <div className="flex items-center gap-2">
           {navItems.map((item) => (
             <button 
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                  currentTab === item.id 
                    ? 'bg-brand-50 text-brand-700' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
             >
                <div className="relative">
                  <item.icon size={20} strokeWidth={currentTab === item.id ? 2.5 : 2} />
                  {item.badge && (
                    <span className="absolute -top-2 -right-2 bg-accent-500 text-white text-[10px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center border-2 border-white">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span>{item.label}</span>
             </button>
           ))}
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe pt-2 px-4 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-center max-w-md mx-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center w-16 py-1 ${
                currentTab === item.id ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className="relative">
                <item.icon size={24} strokeWidth={currentTab === item.id ? 2.5 : 2} />
                {item.badge && (
                  <span className="absolute -top-2 -right-2 bg-accent-500 text-white text-[10px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};