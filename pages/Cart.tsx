import React from 'react';
import { useStore } from '../context/StoreContext';
import { Trash2, ArrowRight, AlertCircle, ShoppingBag } from 'lucide-react';

interface CartProps {
  onCheckout: () => void;
  onBrowse: () => void;
}

export const Cart: React.FC<CartProps> = ({ onCheckout, onBrowse }) => {
  const { cart, removeFromCart, cartTotal } = useStore();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-gray-50 pb-24">
        <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
          <ShoppingBag size={48} className="text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8 max-w-md">Looks like you haven't started the party yet! Browse our catalog to find the perfect supplies.</p>
        <button 
          onClick={onBrowse}
          className="bg-brand-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-brand-700 transition flex items-center gap-2"
        >
          Start Shopping <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full pt-8 pb-32 md:pb-12 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Shopping Cart <span className="text-gray-400 text-lg font-normal">({cart.length} items)</span></h1>
        
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Cart Items List */}
          <div className="flex-1 w-full space-y-4">
            {cart.map((item, index) => (
              <div key={`${item.id}-${index}`} className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 flex gap-4 md:gap-6 items-center transition hover:shadow-md">
                <div className="w-20 h-20 md:w-28 md:h-28 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-gray-500 mb-1 uppercase">{item.category}</p>
                      <h3 className="font-bold text-gray-900 text-sm md:text-lg line-clamp-2">{item.name}</h3>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.selectedColor && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Color: {item.selectedColor}</span>
                    )}
                    {item.customizationNote && (
                      <span className="text-xs bg-brand-50 text-brand-700 px-2 py-1 rounded border border-brand-100 italic">"{item.customizationNote}"</span>
                    )}
                  </div>

                  <div className="flex justify-between items-end mt-3 md:mt-4">
                    <div className="text-sm text-gray-500">
                      Qty: <span className="font-bold text-gray-900">{item.quantity}</span>
                    </div>
                    <span className="text-brand-600 font-bold text-lg">{item.price * item.quantity} EGP</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-96 lg:sticky lg:top-24">
             {/* Mobile/Tablet fixed bottom, Desktop Sticky Side */}
            <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
              <h2 className="font-bold text-xl mb-6">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>{cartTotal} EGP</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping Estimate</span>
                  <span>50 EGP</span>
                </div>
                <div className="flex justify-between text-sm text-green-600 font-medium">
                  <span>Discount</span>
                  <span>0 EGP</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mb-6 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-brand-600">{cartTotal + 50} EGP</span>
              </div>
              
              <button 
                onClick={onCheckout}
                className="w-full bg-brand-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-800 transition shadow-lg hover:shadow-xl transform active:scale-95"
              >
                Proceed to Checkout <ArrowRight size={20} />
              </button>

              <p className="text-xs text-gray-400 text-center mt-4">
                Secure Checkout • Satisfaction Guaranteed
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Fixed Bottom Summary (Only visible on small screens) */}
      <div className="lg:hidden fixed bottom-16 left-0 right-0 bg-white p-6 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] border-t border-gray-100 z-40">
         <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600">Total</span>
          <span className="text-xl font-bold text-brand-600">{cartTotal + 50} EGP</span>
        </div>
        <button 
          onClick={onCheckout}
          className="w-full bg-brand-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-900 transition"
        >
          Proceed to Checkout <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};