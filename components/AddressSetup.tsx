
import React, { useState, useEffect } from 'react';
import { X, Check, MapPin, AlertTriangle, Navigation } from 'lucide-react';
import { MapPicker } from './MapPicker';
import { useStore } from '../context/StoreContext';
import { DeliveryLocation } from '../types';

interface AddressSetupProps {
  onClose: () => void;
  initialAddress?: DeliveryLocation; // If editing
}

export const AddressSetup: React.FC<AddressSetupProps> = ({ onClose, initialAddress }) => {
  const { user, addAddress } = useStore();
  const isRTL = user?.language === 'ar';

  // Form State
  const [form, setForm] = useState({
    label: '', // Location (e.g. Street Name)
    apartment: '',
    email: user?.email || '',
    name: user?.name || '',
    instructions: '',
  });
  
  // Location State (from Map)
  const [locationData, setLocationData] = useState<{
    lat: number;
    lng: number;
    formattedAddress: string;
    placeId?: string;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Pre-fill if we are editing or have initial data
    if (initialAddress) {
        setLocationData({
            lat: initialAddress.lat,
            lng: initialAddress.lng,
            formattedAddress: initialAddress.address,
            placeId: initialAddress.placeId
        });
        setForm(prev => ({ ...prev, label: initialAddress.address }));
    }
  }, [initialAddress]);

  // Translations
  const t = {
    title: isRTL ? 'إعداد العنوان' : 'Setup your address',
    save: isRTL ? 'حفظ' : 'Save',
    location: isRTL ? 'الموقع (اسم المبنى، رقم الشارع)' : 'Location (e.g. building name, street #)',
    apt: isRTL ? 'رقم الشقة / المنزل' : 'Apartment / House number',
    email: isRTL ? 'البريد الإلكتروني' : 'Email Address',
    name: isRTL ? 'الاسم' : 'Name',
    notes: isRTL ? 'تعليمات خاصة بالعنوان (اختياري)' : 'Address Specific Instructions (Optional)',
    notesPlaceholder: isRTL ? 'مثال: يرجى طرق الباب بدلاً من الجرس' : 'E.g. Please knock the door instead of pressing the doorbell',
    req: isRTL ? 'هذا الحقل مطلوب' : 'This field is required',
    invEmail: isRTL ? 'بريد إلكتروني غير صحيح' : 'Invalid email address',
    confirmLoc: isRTL ? 'تأكيد الموقع في الخريطة أولاً' : 'Please confirm location on map first',
    saving: isRTL ? 'جاري الحفظ...' : 'Saving...',
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.label.trim()) newErrors.label = t.req;
    if (!form.name.trim()) newErrors.name = t.req;
    if (!form.email.trim()) {
       newErrors.email = t.req;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
       newErrors.email = t.invEmail;
    }
    if (!locationData || (locationData.lat === 0 && locationData.lng === 0)) {
        newErrors.map = t.confirmLoc;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addAddress({
        label: form.label,
        apartment: form.apartment,
        email: form.email,
        contactName: form.name,
        instructions: form.instructions,
        formattedAddress: locationData!.formattedAddress,
        lat: locationData!.lat,
        lng: locationData!.lng,
        placeId: locationData?.placeId,
        isDefault: false // handled in logic
      });
      onClose();
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
    }
  };

  const handleMapSelect = (loc: DeliveryLocation) => {
     setLocationData({
         lat: loc.lat,
         lng: loc.lng,
         formattedAddress: loc.address,
         placeId: loc.placeId
     });
     // Auto-fill label with the map address if empty or if user hasn't heavily edited it yet
     if (!form.label || form.label.length < 5 || form.label.includes(',')) {
         setForm(prev => ({ ...prev, label: loc.address }));
     }
     // Clear map error if exists
     if (errors.map) setErrors(prev => ({ ...prev, map: '' }));
  };

  return (
    <div className="fixed inset-0 bg-white z-[60] flex flex-col animate-slide-in">
      {/* Title Bar */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 bg-white shadow-sm z-20">
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500">
           <X size={24} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">{t.title}</h1>
        <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="p-2 text-brand-600 hover:bg-brand-50 rounded-full transition font-bold disabled:opacity-50"
        >
           <Check size={24} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
         {/* Map Section - Top */}
         <div className="bg-white border-b border-gray-200 pb-4 shadow-sm">
            <div className="h-64 w-full relative">
               <MapPicker 
                  onLocationSelect={handleMapSelect} 
                  initialLocation={initialAddress}
               />
            </div>
            {errors.map && (
                <div className="px-4 pt-2 text-red-500 text-xs flex items-center gap-1">
                    <AlertTriangle size={12} /> {errors.map}
                </div>
            )}
         </div>

         {/* Fields Section */}
         <div className="p-6 space-y-5 max-w-xl mx-auto">
            
            {/* 1. Location */}
            <div>
               <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                 {t.location} <span className="text-red-500">*</span>
               </label>
               <input 
                  type="text"
                  value={form.label}
                  onChange={e => setForm({...form, label: e.target.value})}
                  className={`w-full p-4 rounded-xl border bg-white focus:ring-2 focus:ring-brand-500 outline-none transition ${errors.label ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'}`}
                  placeholder="e.g. 123 Main St, Building 5"
               />
               {errors.label && <p className="text-xs text-red-500 mt-1">{errors.label}</p>}
            </div>

            {/* 2. Apartment */}
            <div>
               <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{t.apt}</label>
               <input 
                  type="text"
                  value={form.apartment}
                  onChange={e => setForm({...form, apartment: e.target.value})}
                  className="w-full p-4 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-brand-500 outline-none transition"
                  placeholder="e.g. Apt 4B"
               />
            </div>

             {/* 3. Email */}
             <div>
               <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                  {t.email} <span className="text-red-500">*</span>
               </label>
               <input 
                  type="email"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  className={`w-full p-4 rounded-xl border bg-white focus:ring-2 focus:ring-brand-500 outline-none transition ${errors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'}`}
               />
               {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            {/* 4. Name */}
            <div>
               <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                  {t.name} <span className="text-red-500">*</span>
               </label>
               <input 
                  type="text"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className={`w-full p-4 rounded-xl border bg-white focus:ring-2 focus:ring-brand-500 outline-none transition ${errors.name ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'}`}
               />
               {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            {/* 5. Instructions */}
            <div>
               <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{t.notes}</label>
               <textarea 
                  rows={3}
                  value={form.instructions}
                  onChange={e => setForm({...form, instructions: e.target.value})}
                  className="w-full p-4 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-brand-500 outline-none transition resize-none"
                  placeholder={t.notesPlaceholder}
               />
            </div>
         </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="p-4 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
         <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-brand-700 transition shadow-lg shadow-brand-200 active:scale-95 transform disabled:opacity-70 disabled:cursor-not-allowed"
         >
            {isSubmitting ? t.saving : t.save}
         </button>
      </div>
    </div>
  );
};
