
import React from 'react';
import { useStore } from '../context/StoreContext';
import { ArrowRight } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: string, category?: string) => void;
  onProductClick: (productId: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate, onProductClick }) => {
  const { products, categoryImages, categories } = useStore();

  return (
    <div className="animate-fade-in w-full">
      {/* Hero / Header */}
      <div className="md:max-w-7xl md:mx-auto md:px-6">
        <header className="bg-brand-600 text-white p-6 md:p-12 rounded-b-3xl md:rounded-3xl shadow-lg transition-colors duration-300 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-4 md:hidden">
                 <div className="bg-accent-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-serif font-bold text-lg shadow-md border-2 border-white/20">
                    <span className="tracking-tighter -ml-0.5">HP</span>
                 </div>
                <div>
                  <span className="block font-bold text-white text-xl uppercase tracking-wide leading-none">Hamess Pack</span>
                  <span className="block text-[8px] text-brand-100 uppercase tracking-wider font-bold opacity-80">Plastics • Birthday • Party • Accessories</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-2 md:mb-4 leading-tight">Let's make your party <br className="hidden md:block" />unforgettable!</h1>
              <p className="text-brand-100 text-sm md:text-lg mb-6">Premium supplies, gifts, and decorations delivered to your door.</p>
              
              <button 
                onClick={() => onNavigate('catalog')}
                className="bg-white text-brand-900 px-6 py-3 rounded-xl font-bold hover:bg-brand-50 transition shadow-lg inline-flex items-center gap-2"
              >
                Shop Collections <ArrowRight size={18} />
              </button>
            </div>

            {/* Promo Banner Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl text-white md:w-80 shadow-2xl transform md:rotate-3 hover:rotate-0 transition duration-300">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-bold text-2xl">20% OFF</p>
                  <p className="text-brand-100 text-sm">First Order Discount</p>
                </div>
                <div className="bg-white text-brand-600 text-xs font-bold px-2 py-1 rounded">NEW20</div>
              </div>
              <p className="text-xs text-brand-100 leading-relaxed">
                Use code <span className="font-mono font-bold text-white">NEW20</span> at checkout to get 20% off your first purchase of any party supplies.
              </p>
            </div>
          </div>
          
          {/* Background Decor */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-30"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-800 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 opacity-50"></div>
        </header>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-24">
        {/* Categories */}
        <section className="mt-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Shop by Category</h2>
            <button onClick={() => onNavigate('catalog')} className="text-brand-600 font-medium flex items-center hover:underline">
              View All <ArrowRight size={16} className="ml-1" />
            </button>
          </div>
          
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4 md:gap-6">
            {categories.slice(0, 6).map((cat) => (
              <div 
                key={cat} 
                onClick={() => onNavigate('catalog', cat)}
                className="flex flex-col items-center gap-3 cursor-pointer group"
              >
                <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl group-hover:-translate-y-1 transition duration-300 bg-white">
                  <img 
                    src={categoryImages[cat] || 'https://via.placeholder.com/400?text=' + cat} 
                    alt={cat} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/400?text=No+Image';
                    }}
                  />
                </div>
                <span className="text-xs md:text-sm font-medium text-center text-gray-700 group-hover:text-brand-600 leading-tight">{cat}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section className="mt-12">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Featured for You</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {products.slice(0, 5).map((product) => (
              <div 
                key={product.id} 
                onClick={() => onProductClick(product.id)}
                className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-brand-100 transition cursor-pointer group flex flex-col h-full"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-gray-100">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  {product.isCustomizable && (
                    <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                      Custom
                    </span>
                  )}
                </div>
                <h3 className="font-medium text-gray-900 text-sm md:text-base line-clamp-2 mb-2 flex-grow">{product.name}</h3>
                <div className="flex justify-between items-center mt-auto">
                  <span className="font-bold text-brand-600 text-lg">{product.price} EGP</span>
                  <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition">
                    <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
