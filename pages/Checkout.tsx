
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { PaymentMethod, DeliveryLocation } from '../types';
import { MapPin, CreditCard, Truck, Banknote, CheckCircle, ChevronLeft, ShieldCheck, Info } from 'lucide-react';
import { MapPicker } from '../components/MapPicker';

interface CheckoutProps {
  onOrderComplete: () => void;
  onBack: () => void;
}

export const Checkout: React.FC<CheckoutProps> = ({ onOrderComplete, onBack }) => {
  const { cartTotal, placeOrder, user, cart, settings } = useStore();
  
  const [deliveryLocation, setDeliveryLocation] = useState<DeliveryLocation | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CARD);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [notes, setNotes] = useState('');

  // Dynamic Delivery Fee Logic
  let deliveryFee = settings.shipping.flatRate;
  if (deliveryLocation?.distanceKm) {
    // Example formula: Base 10 + 2 per KM
    const calcFee = Math.ceil(10 + (deliveryLocation.distanceKm * 2));
    deliveryFee = Math.max(settings.shipping.flatRate, calcFee);
  }
  if (cartTotal >= settings.shipping.freeShippingThreshold) {
    deliveryFee = 0;
  }

  const finalTotal = cartTotal + deliveryFee;

  const handlePlaceOrder = () => {
    if (!deliveryLocation) return;
    
    setIsProcessing(true);
    
    // Add user notes to the location object
    const finalLocation: DeliveryLocation = {
      ...deliveryLocation,
      notes: notes
    };

    // Simulate API call
    setTimeout(() => {
      placeOrder(finalLocation, paymentMethod);
      setIsProcessing(false);
      setShowSuccess(true);
    }, 2000);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-md w-full animate-fade-in">
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 mx-auto animate-bounce">
            <CheckCircle size={48} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Order Placed!</h2>
          <p className="text-gray-600 mb-8">Thank you for celebrating with Hamess Pack. Your items are on the way.</p>
          <button 
            onClick={onOrderComplete}
            className="bg-brand-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-brand-700 w-full"
          >
            Track Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full pt-8 pb-32 md:pb-12 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-8">
          <button onClick={onBack} className="text-gray-500 hover:text-brand-600 mr-4 flex items-center gap-1 font-medium transition">
            <ChevronLeft size={20} /> Back to Cart
          </button>
          <h1 className="text-2xl md:text-3xl font-bold">Checkout</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Column: Forms */}
          <div className="flex-1 w-full space-y-6">
            {/* Address */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                <div className="bg-brand-50 p-2 rounded-lg text-brand-600"><MapPin size={20} /></div>
                Delivery Location
              </h3>
              
              <div className="space-y-4">
                 <MapPicker 
                   onLocationSelect={setDeliveryLocation} 
                   initialLocation={deliveryLocation || undefined}
                 />

                 {deliveryLocation && (
                   <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <p className="font-bold text-sm text-gray-700">Selected Address:</p>
                      <p className="text-sm text-gray-600 mb-2">{deliveryLocation.address}</p>
                      <div className="flex gap-4 text-xs text-gray-500">
                        {deliveryLocation.distanceKm && (
                           <span><span className="font-bold">Distance:</span> {deliveryLocation.distanceKm.toFixed(1)} km</span>
                        )}
                        {deliveryLocation.estimatedDuration && (
                           <span><span className="font-bold">Est. Time:</span> {deliveryLocation.estimatedDuration}</span>
                        )}
                      </div>
                   </div>
                 )}

                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Notes (Optional)</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Gate code, leave at door, specific instructions..."
                      className="w-full p-3 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition shadow-sm text-sm"
                      rows={2}
                    />
                 </div>
              </div>
            </section>

            {/* Payment Method */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                <div className="bg-brand-50 p-2 rounded-lg text-brand-600"><CreditCard size={20} /></div>
                Payment Method
              </h3>
              
              <div className="space-y-3">
                <label className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === PaymentMethod.CARD ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-600 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    className="hidden" 
                    checked={paymentMethod === PaymentMethod.CARD} 
                    onChange={() => setPaymentMethod(PaymentMethod.CARD)}
                  />
                  <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${paymentMethod === PaymentMethod.CARD ? 'border-brand-600' : 'border-gray-300'}`}>
                    {paymentMethod === PaymentMethod.CARD && <div className="w-2.5 h-2.5 rounded-full bg-brand-600" />}
                  </div>
                  <CreditCard className="mr-4 text-gray-600" size={24} />
                  <div className="flex-1">
                    <span className="block font-bold text-gray-900">Credit/Debit Card</span>
                    <span className="block text-xs text-gray-500">Secure payment via Paymob</span>
                  </div>
                </label>

                <label className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === PaymentMethod.WALLET ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-600 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    className="hidden" 
                    checked={paymentMethod === PaymentMethod.WALLET} 
                    onChange={() => setPaymentMethod(PaymentMethod.WALLET)}
                  />
                   <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${paymentMethod === PaymentMethod.WALLET ? 'border-brand-600' : 'border-gray-300'}`}>
                    {paymentMethod === PaymentMethod.WALLET && <div className="w-2.5 h-2.5 rounded-full bg-brand-600" />}
                  </div>
                  <div className="mr-4 w-10 h-6 rounded bg-gray-800 flex items-center justify-center text-[10px] font-bold text-white">PAY</div>
                  <div className="flex-1">
                    <span className="block font-bold text-gray-900">Mobile Wallet</span>
                    <span className="block text-xs text-gray-500">Vodafone Cash, Etisalat, etc.</span>
                  </div>
                </label>

                <label className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === PaymentMethod.COD ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-600 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    className="hidden" 
                    checked={paymentMethod === PaymentMethod.COD} 
                    onChange={() => setPaymentMethod(PaymentMethod.COD)}
                  />
                   <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${paymentMethod === PaymentMethod.COD ? 'border-brand-600' : 'border-gray-300'}`}>
                    {paymentMethod === PaymentMethod.COD && <div className="w-2.5 h-2.5 rounded-full bg-brand-600" />}
                  </div>
                  <Banknote className="mr-4 text-gray-600" size={24} />
                  <span className="font-bold text-gray-900">Cash on Delivery</span>
                </label>
              </div>
            </section>
          </div>

          {/* Right Column: Order Summary */}
          <div className="w-full lg:w-96">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex gap-3 text-sm">
                       <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0">
                         <img src={item.image} className="w-full h-full object-cover rounded" />
                       </div>
                       <div className="flex-1">
                         <p className="font-medium text-gray-900 line-clamp-1">{item.name}</p>
                         <p className="text-gray-500">x{item.quantity}</p>
                       </div>
                       <div className="font-medium text-gray-900">{item.price * item.quantity} EGP</div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-gray-100 pt-4 space-y-2 mb-6">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>{cartTotal} EGP</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <span>Delivery Fee</span>
                      <Info size={12} className="text-gray-400" />
                    </div>
                    <span>{deliveryFee === 0 ? 'Free' : `${deliveryFee} EGP`}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-gray-900 pt-2">
                    <span>Total Amount</span>
                    <span className="text-brand-600">{finalTotal} EGP</span>
                  </div>
                </div>

                <button 
                  onClick={handlePlaceOrder}
                  disabled={!deliveryLocation || isProcessing}
                  className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all transform active:scale-95 ${
                    !deliveryLocation || isProcessing ? 'bg-gray-300 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-200'
                  }`}
                >
                  {isProcessing ? (
                    <span className="animate-pulse">Processing...</span>
                  ) : (
                    <>
                      <Truck size={20} /> Place Order
                    </>
                  )}
                </button>

                {!deliveryLocation && (
                  <p className="text-xs text-red-500 text-center mt-2">Please select a delivery location.</p>
                )}

                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                   <ShieldCheck size={14} /> Secure 256-bit SSL Encrypted
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
