
import React, { useState, useEffect, useMemo } from 'react';
import { X, Check, Home, User, Smartphone, FileText, Search, MapPin, Building } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Address } from '../types';

// --- Reference Data (Egypt Governorates & Cities) ---
const LOCATIONS = [
  {
    gov: "Cairo", govAr: "القاهرة",
    cities: ["Nasr City", "Heliopolis", "Maadi", "Zamalek", "Downtown", "New Cairo", "Fifth Settlement", "Rehab", "Madinaty", "Shoubra", "Mokattam"]
  },
  {
    gov: "Giza", govAr: "الجيزة",
    cities: ["Sheikh Zayed", "6th of October", "Dokki", "Mohandessin", "Agouza", "Haram", "Faisal", "Imbaba", "Giza District"]
  },
  {
    gov: "Alexandria", govAr: "الإسكندرية",
    cities: ["Smouha", "Gleem", "Miami", "Montaza", "Stanley", "Sidi Gaber", "Agami", "Borg El Arab"]
  },
  {
    gov: "Qalyubia", govAr: "القليوبية",
    cities: ["Banha", "Shoubra El Kheima", "Qalyub", "Khanka"]
  },
  {
    gov: "Sharqia", govAr: "الشرقية",
    cities: ["Zagazig", "10th of Ramadan", "Belbeis", "Minya El Qamh"]
  },
  {
    gov: "Dakahlia", govAr: "الدقهلية",
    cities: ["Mansoura", "Talkha", "Mit Ghamr"]
  }
];

interface AddressSetupProps {
  onClose: () => void;
  initialAddress?: Address;
}

export const AddressSetup: React.FC<AddressSetupProps> = ({ onClose, initialAddress }) => {
  const { user, addAddress } = useStore();
  
  // Form State
  const [form, setForm] = useState({
    location: '', // The manual location string
    apartment: '',
    governorate: '',
    city: '',
    phone: user?.phone || '',
    name: user?.name || '',
    instructions: '',
  });

  // Search States
  const [govSearch, setGovSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [showGovList, setShowGovList] = useState(false);
  const [showCityList, setShowCityList] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialAddress) {
      setForm({
        location: initialAddress.label,
        apartment: initialAddress.apartment || '',
        governorate: initialAddress.governorate,
        city: initialAddress.city,
        phone: initialAddress.phone,
        name: initialAddress.contactName,
        instructions: initialAddress.instructions || '',
      });
      setGovSearch(initialAddress.governorate);
      setCitySearch(initialAddress.city);
    }
  }, [initialAddress]);

  // --- Search Logic ---
  const filteredGovs = useMemo(() => {
    if (!govSearch) return LOCATIONS;
    const lower = govSearch.toLowerCase();
    return LOCATIONS.filter(l => l.gov.toLowerCase().includes(lower) || l.govAr.includes(lower));
  }, [govSearch]);

  const filteredCities = useMemo(() => {
    const selectedGovData = LOCATIONS.find(l => l.gov === form.governorate);
    if (!selectedGovData) return [];
    if (!citySearch) return selectedGovData.cities;
    const lower = citySearch.toLowerCase();
    return selectedGovData.cities.filter(c => c.toLowerCase().includes(lower));
  }, [form.governorate, citySearch]);

  // --- Handlers ---
  const handleGovSelect = (gov: string) => {
    setForm(prev => ({ ...prev, governorate: gov, city: '' })); // Reset city on gov change
    setGovSearch(gov);
    setCitySearch('');
    setShowGovList(false);
  };

  const handleCitySelect = (city: string) => {
    setForm(prev => ({ ...prev, city }));
    setCitySearch(city);
    setShowCityList(false);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!form.location.trim()) newErrors.location = "Location is required";
    if (!form.governorate) newErrors.governorate = "Governorate is required";
    if (!form.city) newErrors.city = "City is required";
    if (!form.name.trim()) newErrors.name = "Name is required";
    
    // Phone Validation (Egypt)
    const phoneRegex = /^01[0125][0-9]{8}$/;
    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(form.phone.replace(/\s/g, ''))) {
      newErrors.phone = "Invalid Egyptian phone number (e.g. 010xxxxxxxxx)";
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
        label: form.location,
        formattedAddress: `${form.location}, ${form.city}, ${form.governorate}`,
        governorate: form.governorate,
        city: form.city,
        apartment: form.apartment,
        phone: form.phone,
        contactName: form.name,
        instructions: form.instructions,
        isDefault: false,
        // Geo fields intentionally omitted/null
        lat: undefined,
        lng: undefined,
        placeId: undefined
      });
      onClose();
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-end md:items-center justify-center p-0 md:p-4 animate-fade-in">
      <div className="bg-white w-full md:max-w-2xl h-[90vh] md:h-auto md:max-h-[90vh] md:rounded-3xl flex flex-col shadow-2xl animate-slide-in overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white z-20">
            <h1 className="text-xl font-bold text-gray-900">{initialAddress ? 'Edit Address' : 'New Address'}</h1>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500">
               <X size={24} />
            </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6 space-y-6">
            
            {/* Section 1: Region */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4 relative z-10">
                <div className="flex items-center gap-2 text-brand-600 mb-2">
                    <MapPin size={18} />
                    <h3 className="font-bold text-sm uppercase tracking-wider">Region Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Governorate Search */}
                    <div className="relative">
                        <label className="block text-xs font-bold text-gray-700 mb-1">Governorate <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <input 
                                type="text"
                                value={govSearch}
                                onChange={e => { setGovSearch(e.target.value); setShowGovList(true); }}
                                onFocus={() => setShowGovList(true)}
                                className={`w-full p-3 rounded-xl border outline-none text-sm bg-white text-gray-900 ${errors.governorate ? 'border-red-500' : 'border-gray-200 focus:border-brand-500'}`}
                                placeholder="Search governorate..."
                            />
                            <Search className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" size={16} />
                        </div>
                        {showGovList && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-48 overflow-y-auto z-50">
                                {filteredGovs.length > 0 ? filteredGovs.map(g => (
                                    <div 
                                        key={g.gov} 
                                        onClick={() => handleGovSelect(g.gov)}
                                        className="p-3 hover:bg-brand-50 cursor-pointer text-sm border-b border-gray-50 last:border-0 flex justify-between"
                                    >
                                        <span className="font-medium">{g.gov}</span>
                                        <span className="text-gray-400 text-xs">{g.govAr}</span>
                                    </div>
                                )) : (
                                    <div className="p-3 text-xs text-gray-400">No matches found</div>
                                )}
                            </div>
                        )}
                        {errors.governorate && <p className="text-xs text-red-500 mt-1">{errors.governorate}</p>}
                    </div>

                    {/* City Search */}
                    <div className="relative">
                        <label className="block text-xs font-bold text-gray-700 mb-1">City / Area <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <input 
                                type="text"
                                value={citySearch}
                                onChange={e => { setCitySearch(e.target.value); setShowCityList(true); }}
                                onFocus={() => setShowCityList(true)}
                                disabled={!form.governorate}
                                className={`w-full p-3 rounded-xl border outline-none text-sm text-gray-900 ${errors.city ? 'border-red-500' : 'border-gray-200 focus:border-brand-500'} ${!form.governorate ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                                placeholder={form.governorate ? "Search area..." : "Select governorate first"}
                            />
                            <Search className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" size={16} />
                        </div>
                        {showCityList && form.governorate && (
                             <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-48 overflow-y-auto z-50">
                                {filteredCities.length > 0 ? filteredCities.map(c => (
                                    <div 
                                        key={c} 
                                        onClick={() => handleCitySelect(c)}
                                        className="p-3 hover:bg-brand-50 cursor-pointer text-sm border-b border-gray-50 last:border-0"
                                    >
                                        {c}
                                    </div>
                                )) : (
                                    <div className="p-3 text-xs text-gray-400">No matches found</div>
                                )}
                            </div>
                        )}
                        {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                    </div>
                </div>
            </div>

            {/* Section 2: Address Details */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <div className="flex items-center gap-2 text-brand-600 mb-2">
                    <Building size={18} />
                    <h3 className="font-bold text-sm uppercase tracking-wider">Building Details</h3>
                </div>

                {/* Location String */}
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Address Line <span className="text-red-500">*</span></label>
                    <input 
                        type="text"
                        value={form.location}
                        onChange={e => setForm({...form, location: e.target.value})}
                        className={`w-full p-3 rounded-xl border outline-none text-sm bg-white text-gray-900 ${errors.location ? 'border-red-500' : 'border-gray-200 focus:ring-2 focus:ring-brand-500'}`}
                        placeholder="e.g. Building 15, Street 9, Near Metro Market"
                    />
                    {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
                </div>

                {/* Apartment */}
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Apartment / Unit (Optional)</label>
                    <div className="relative">
                        <Home className="absolute top-3.5 left-3.5 text-gray-400" size={18} />
                        <input 
                            type="text"
                            value={form.apartment}
                            onChange={e => setForm({...form, apartment: e.target.value})}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none text-sm bg-white text-gray-900"
                            placeholder="e.g. Apt 4, Floor 2"
                        />
                    </div>
                </div>
            </div>

            {/* Section 3: Contact */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <div className="flex items-center gap-2 text-brand-600 mb-2">
                    <User size={18} />
                    <h3 className="font-bold text-sm uppercase tracking-wider">Contact Info</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Contact Name <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <User className="absolute top-3.5 left-3.5 text-gray-400" size={18} />
                            <input 
                                type="text"
                                value={form.name}
                                onChange={e => setForm({...form, name: e.target.value})}
                                className={`w-full pl-10 pr-4 py-3 rounded-xl border outline-none text-sm bg-white text-gray-900 ${errors.name ? 'border-red-500' : 'border-gray-200 focus:ring-2 focus:ring-brand-500'}`}
                            />
                        </div>
                         {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <Smartphone className="absolute top-3.5 left-3.5 text-gray-400" size={18} />
                            <input 
                                type="tel"
                                value={form.phone}
                                onChange={e => setForm({...form, phone: e.target.value})}
                                className={`w-full pl-10 pr-4 py-3 rounded-xl border outline-none text-sm bg-white text-gray-900 ${errors.phone ? 'border-red-500' : 'border-gray-200 focus:ring-2 focus:ring-brand-500'}`}
                                placeholder="01xxxxxxxxx"
                            />
                        </div>
                        {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                    </div>
                </div>
                
                {/* Instructions */}
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Delivery Instructions</label>
                    <div className="relative">
                        <FileText className="absolute top-3.5 left-3.5 text-gray-400" size={18} />
                        <textarea 
                            rows={2}
                            value={form.instructions}
                            onChange={e => setForm({...form, instructions: e.target.value})}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none text-sm resize-none bg-white text-gray-900"
                            placeholder="e.g. Leave with security"
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 md:p-6 bg-white border-t border-gray-100 z-30">
            <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-brand-700 transition shadow-lg shadow-brand-200 active:scale-95 transform disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isSubmitting ? (
                    <span>Saving...</span>
                ) : (
                    <>
                        <Check size={20} /> Save Address
                    </>
                )}
            </button>
        </div>
      </div>
    </div>
  );
};
