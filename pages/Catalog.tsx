
import React, { useState, useMemo } from 'react';
import { Product, Category } from '../types';
import { useStore } from '../context/StoreContext';
import { Filter, Search } from 'lucide-react';

interface CatalogProps {
  initialCategory?: string;
  onProductClick: (id: string) => void;
}

export const Catalog: React.FC<CatalogProps> = ({ initialCategory, onProductClick }) => {
  const { products, user } = useStore();
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory || 'All');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceSort, setPriceSort] = useState<'asc' | 'desc' | null>(null);

  const filteredProducts = useMemo(() => {
    let result = products;

    if (activeCategory !== 'All') {
      result = result.filter(p => p.category === activeCategory);
    }

    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(lower) || 
        (p.nameAr && p.nameAr.includes(searchQuery))
      );
    }

    if (priceSort) {
      result = [...result].sort((a, b) => priceSort === 'asc' ? a.price - b.price : b.price - a.price);
    }

    return result;
  }, [products, activeCategory, searchQuery, priceSort]);

  const getDisplayName = (product: Product) => {
    if (user?.language === 'ar' && product.nameAr) return product.nameAr;
    return product.name;
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-4 pb-24">
        
        {/* Search & Filter Header */}
        <div className="sticky md:static top-0 bg-gray-50 z-10 pb-4 pt-2">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={user?.language === 'ar' ? "بحث في المنتجات..." : "Search decorations, gifts..."}
                className="w-full pl-12 pr-4 py-3 md:py-4 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-brand-500 bg-white text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-4 top-3.5 md:top-4.5 text-gray-400" size={20} />
            </div>
            
            <button 
              onClick={() => setPriceSort(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="flex items-center justify-center gap-2 px-6 py-3 md:py-4 bg-white rounded-xl shadow-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              <Filter size={18} className="text-brand-600" /> 
              Price: {priceSort === 'asc' ? 'Low to High' : priceSort === 'desc' ? 'High to Low' : 'Sort'}
            </button>
          </div>

          {/* Categories Scroll */}
          <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-2 mask-fade-right">
            <button
              onClick={() => setActiveCategory('All')}
              className={`px-6 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition shadow-sm ${
                activeCategory === 'All' ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              All Items
            </button>
            {Object.values(Category).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition shadow-sm ${
                  activeCategory === cat ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-500 font-medium">
          Found {filteredProducts.length} items in {activeCategory}
        </div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => onProductClick(product.id)}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition duration-300 cursor-pointer group flex flex-col"
            >
              <div className="aspect-square relative bg-gray-100 overflow-hidden">
                <img src={product.image} alt={getDisplayName(product)} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                {product.stock < 5 && (
                  <span className="absolute bottom-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                    Low Stock
                  </span>
                )}
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">{product.category}</p>
                <h3 className="font-medium text-gray-900 text-sm md:text-base line-clamp-2 mb-2 flex-grow text-right-rtl">{getDisplayName(product)}</h3>
                <div className="mt-auto flex items-center justify-between">
                  <span className="font-bold text-brand-600 text-lg">{product.price} EGP</span>
                  <div className="w-8 h-8 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition">
                    <span className="text-xl leading-none mb-0.5">+</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center mt-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-gray-300" size={40} />
            </div>
            <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
            <button onClick={() => {setActiveCategory('All'); setSearchQuery('');}} className="text-brand-600 font-bold mt-2 hover:underline">
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
