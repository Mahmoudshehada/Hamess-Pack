import React, { useState } from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { ChevronLeft, Heart, Minus, Plus, Share2, ShoppingBag, Star, Check, Truck } from 'lucide-react';

interface ProductDetailProps {
  productId: string;
  onBack: () => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ productId, onBack }) => {
  const { products, addToCart } = useStore();
  const product = products.find(p => p.id === productId);
  
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(product?.colors?.[0]);
  const [customNote, setCustomNote] = useState('');
  const [isAdded, setIsAdded] = useState(false);

  if (!product) return <div>Product not found</div>;

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedColor, customNote);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="bg-white min-h-screen md:bg-gray-50 md:pt-6">
      <div className="max-w-7xl mx-auto md:px-6">
        {/* Desktop Back Button */}
        <button onClick={onBack} className="hidden md:flex items-center text-gray-500 hover:text-brand-600 mb-4 font-medium">
          <ChevronLeft size={20} /> Back to Browse
        </button>

        <div className="bg-white md:rounded-3xl md:shadow-sm md:overflow-hidden flex flex-col md:flex-row">
          
          {/* Image Section */}
          <div className="w-full md:w-1/2 relative bg-gray-100 md:h-[600px]">
             {/* Mobile Nav Over Image */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 md:hidden">
              <button onClick={onBack} className="w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-sm">
                <ChevronLeft size={24} />
              </button>
              <div className="flex gap-2">
                <button className="w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-sm text-gray-600">
                  <Share2 size={20} />
                </button>
              </div>
            </div>
            
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>

          {/* Details Section */}
          <div className="flex-1 p-6 md:p-10 flex flex-col relative">
            <div className="md:flex justify-between items-start mb-4">
               <div className="mb-2 md:mb-0">
                 <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                 <div className="flex items-center gap-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                         <Star key={i} size={16} fill={i < Math.floor(product.rating) ? "currentColor" : "none"} className={i < Math.floor(product.rating) ? "" : "text-gray-200"} />
                      ))}
                    </div>
                    <span className="text-sm text-gray-400 underline cursor-pointer hover:text-brand-600">120 reviews</span>
                 </div>
               </div>
               <div className="flex flex-col items-end">
                 <span className="text-3xl font-bold text-brand-600">{product.price} EGP</span>
                 <span className={`text-xs font-medium px-2 py-1 rounded mt-1 ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                   {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                 </span>
               </div>
            </div>

            <p className="text-gray-600 leading-relaxed mb-8 border-b border-gray-100 pb-6">
              {product.description}
            </p>

            <div className="space-y-6 mb-8">
              {/* Color Selection */}
              {product.colors && (
                <div>
                  <h3 className="font-bold mb-3 text-sm uppercase tracking-wide text-gray-800">Select Color</h3>
                  <div className="flex gap-3 flex-wrap">
                    {product.colors.map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition flex items-center gap-2 ${
                          selectedColor === color 
                            ? 'border-brand-600 bg-brand-50 text-brand-700 ring-1 ring-brand-600' 
                            : 'border-gray-200 text-gray-600 hover:border-gray-400'
                        }`}
                      >
                        {color}
                        {selectedColor === color && <Check size={14} />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Customization */}
              {product.isCustomizable && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <h3 className="font-bold mb-2 text-blue-900 flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Personalize It
                  </h3>
                  <p className="text-xs text-blue-600 mb-3">Add a name or special message for your packaging.</p>
                  <textarea
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder="E.g. Happy Birthday Sarah..."
                    className="w-full p-3 rounded-lg border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                    rows={2}
                  />
                </div>
              )}

              {/* Quantity */}
              <div>
                <h3 className="font-bold mb-3 text-sm uppercase tracking-wide text-gray-800">Quantity</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-300 rounded-xl bg-gray-50">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 flex items-center justify-center text-gray-600 hover:text-brand-600"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="font-bold text-xl w-12 text-center bg-white h-12 flex items-center justify-center border-x border-gray-300">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-12 h-12 flex items-center justify-center text-gray-600 hover:text-brand-600"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">
                    Total: <span className="font-bold text-gray-900">{product.price * quantity} EGP</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-auto pt-6 md:pt-0">
               {/* Mobile Fixed Bar Replacement for Desktop */}
               <div className="hidden md:flex gap-4">
                 <button
                    onClick={handleAddToCart}
                    disabled={isAdded}
                    className={`flex-1 py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 ${
                      isAdded ? 'bg-green-600' : 'bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-200'
                    }`}
                  >
                    {isAdded ? (
                      <>Added to Cart <CheckCircleIcon size={20}/></>
                    ) : (
                      <>
                        <ShoppingBag size={20} />
                        Add to Cart
                      </>
                    )}
                  </button>
                  <button className="p-4 rounded-xl border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition">
                    <Heart size={24} />
                  </button>
               </div>

               {/* Mobile Fixed Bar */}
               <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-2xl z-20 md:hidden">
                  <button
                    onClick={handleAddToCart}
                    disabled={isAdded}
                    className={`w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all transform ${
                      isAdded ? 'bg-green-600 scale-95' : 'bg-brand-600 hover:bg-brand-700 shadow-brand-200 shadow-xl'
                    }`}
                  >
                    {isAdded ? (
                      <span>Added!</span>
                    ) : (
                      <>
                        <ShoppingBag size={20} />
                        Add — {product.price * quantity} EGP
                      </>
                    )}
                  </button>
                </div>
            </div>
            
            <div className="mt-6 flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg md:bg-transparent md:p-0">
              <Truck size={16} className="text-brand-600" />
              <span>Free shipping on orders over 1000 EGP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckCircleIcon = ({size}:{size:number}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);