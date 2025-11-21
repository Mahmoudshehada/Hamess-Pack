
import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Package, MapPin, Settings, LogOut, Phone, User as UserIcon, 
  ChevronRight, X, Save, Calendar, Mail, Lock, Globe, Bell, 
  Plus, Trash2, Shield, Camera, Home, Map, ChevronLeft, Heart,
  Smartphone, Monitor, Download, Share, PlusSquare
} from 'lucide-react';
import { AddressSetup } from '../components/AddressSetup';
import { DeliveryLocation } from '../types';

interface ProfileProps {
  onLogout: () => void;
  onAdminClick: () => void;
}

type SettingsView = 'overview' | 'edit-profile' | 'addresses' | 'add-address' | 'security' | 'general' | 'install-app';

export const Profile: React.FC<ProfileProps> = ({ onLogout, onAdminClick }) => {
  const { user, orders, updateUser, changeLanguage, uploadUserAvatar, deleteAddress } = useStore();
  const [currentView, setCurrentView] = useState<SettingsView>('overview');
  
  // Form States
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', email: '', birthday: '', country: '' });
  
  // Initialize form when user data is available
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name,
        phone: user.phone,
        email: user.email,
        birthday: user.birthday || '',
        country: user.country || 'Egypt'
      });
    }
  }, [user]);

  // Other temporary states
  const [emailStep, setEmailStep] = useState<'request' | 'verify'>('request');

  if (!user) return null;

  const isRTL = user.language === 'ar';
  
  const ordersCount = orders.length;
  // Simulating returns for now
  const returnsCount = 0;

  // --- Handlers ---

  const handleEditProfileStart = () => {
    setProfileForm({
      name: user.name,
      phone: user.phone,
      email: user.email,
      birthday: user.birthday || '',
      country: user.country || 'Egypt'
    });
    setCurrentView('edit-profile');
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(profileForm);
    setCurrentView('overview');
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
       await uploadUserAvatar(e.target.files[0]);
    }
  };

  // --- Translations ---
  const t = {
    orders: isRTL ? 'الطلبات' : 'Orders',
    returns: isRTL ? 'المرتجعات' : 'Returns',
    account: isRTL ? 'الحساب' : 'Account',
    adminDash: isRTL ? 'لوحة التحكم' : 'Admin Dashboard',
    editProfile: isRTL ? 'تعديل الملف الشخصي' : 'Edit Profile',
    addresses: isRTL ? 'العناوين المحفوظة' : 'Saved Addresses',
    security: isRTL ? 'الأمان و كلمة المرور' : 'Security & Password',
    settings: isRTL ? 'الإعدادات العامة' : 'General Settings',
    logout: isRTL ? 'تسجيل الخروج' : 'Log Out',
    back: isRTL ? 'رجوع' : 'Back',
    save: isRTL ? 'حفظ التغييرات' : 'Save Changes',
    name: isRTL ? 'الاسم' : 'Full Name',
    phone: isRTL ? 'رقم الهاتف' : 'Phone Number',
    bday: isRTL ? 'تاريخ الميلاد' : 'Birthday',
    country: isRTL ? 'البلد' : 'Country',
    noOrders: isRTL ? 'لا يوجد طلبات حتى الآن' : 'No orders yet',
    items: isRTL ? 'عناصر' : 'Items',
    changePhoto: isRTL ? 'تغيير الصورة' : 'Tap to change photo',
    addressLabel: isRTL ? 'نوع العنوان' : 'Label (e.g. Home, Work)',
    addNewAddress: isRTL ? 'إضافة عنوان جديد' : 'Add New Address',
    notifications: isRTL ? 'الإشعارات' : 'Notifications',
    lang: isRTL ? 'اللغة' : 'Language',
    change: isRTL ? 'تغيير' : 'Change',
    emailNote: isRTL ? 'لتغيير البريد الإلكتروني، انتقل إلى إعدادات الأمان.' : 'To change email, go to Security settings.',
    securityTitle: isRTL ? 'الأمان' : 'Security',
    changePass: isRTL ? 'تغيير كلمة المرور' : 'Change Password',
    changeEmail: isRTL ? 'تغيير البريد الإلكتروني' : 'Change Email',
    currentPass: isRTL ? 'كلمة المرور الحالية' : 'Current Password',
    newPass: isRTL ? 'كلمة المرور الجديدة' : 'New Password',
    confirmPass: isRTL ? 'تأكيد كلمة المرور' : 'Confirm New Password',
    updatePass: isRTL ? 'تحديث كلمة المرور' : 'Update Password',
    verify: isRTL ? 'تحقق' : 'Verify',
    confirm: isRTL ? 'تأكيد' : 'Confirm',
    enterToken: isRTL ? 'أدخل الرمز' : 'Enter 4-digit Token',
    newEmail: isRTL ? 'البريد الإلكتروني الجديد' : 'New Email Address',
    delete: isRTL ? 'حذف' : 'Delete',
    default: isRTL ? 'افتراضي' : 'Default',
    hello: isRTL ? 'مرحباً' : 'Hello',
    emptyAddr: isRTL ? 'لا توجد عناوين محفوظة' : 'No saved addresses.',
    installApp: isRTL ? 'تحميل التطبيق' : 'Get the App',
    installDesc: isRTL ? 'حمل التطبيق على هاتفك' : 'Download for iOS & Android'
  };

  // --- Sub-Views ---

  const EditProfileView = () => (
    <div className="animate-slide-in">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setCurrentView('overview')} className="p-2 hover:bg-gray-100 rounded-full transition">
           <ChevronLeft size={24} className={isRTL ? 'rotate-180' : ''} />
        </button>
        <h2 className="text-xl font-bold">{t.editProfile}</h2>
      </div>

      <div className="flex flex-col items-center mb-8">
        <div className="relative group cursor-pointer">
          <div className="w-24 h-24 rounded-full bg-brand-100 overflow-hidden border-4 border-white shadow-lg">
            {user.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-brand-600 font-bold text-3xl">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="absolute bottom-0 right-0 bg-brand-600 text-white p-2 rounded-full shadow-sm border-2 border-white group-hover:scale-110 transition">
            <Camera size={14} />
          </div>
          <input 
             type="file" 
             className="absolute inset-0 opacity-0 cursor-pointer" 
             accept="image/*"
             onChange={handleAvatarChange}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">{t.changePhoto}</p>
      </div>

      <form onSubmit={handleProfileSave} className="space-y-4 max-w-md mx-auto">
        <div>
           <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.name}</label>
           <input 
              required 
              type="text" 
              value={profileForm.name} 
              onChange={e => setProfileForm({...profileForm, name: e.target.value})} 
              className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" 
           />
        </div>
        <div>
           <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.phone}</label>
           <input 
              required 
              type="tel" 
              value={profileForm.phone} 
              onChange={e => setProfileForm({...profileForm, phone: e.target.value})} 
              className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" 
           />
        </div>
        <div>
           <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
           <input 
              disabled 
              type="email" 
              value={profileForm.email} 
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-400 cursor-not-allowed" 
           />
           <p className="text-[10px] text-gray-400 mt-1">{t.emailNote}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
           <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.bday}</label>
             <input 
                type="date" 
                value={profileForm.birthday} 
                onChange={e => setProfileForm({...profileForm, birthday: e.target.value})} 
                className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" 
             />
           </div>
           <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t.country}</label>
             <select 
                value={profileForm.country} 
                onChange={e => setProfileForm({...profileForm, country: e.target.value})} 
                className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
             >
                <option value="Egypt">Egypt</option>
                <option value="UAE">UAE</option>
                <option value="KSA">KSA</option>
                <option value="Qatar">Qatar</option>
                <option value="Kuwait">Kuwait</option>
             </select>
           </div>
        </div>
        <button type="submit" className="w-full py-4 bg-brand-600 text-white rounded-xl font-bold shadow-lg mt-4 flex items-center justify-center gap-2 hover:bg-brand-700 transition">
          <Save size={18} /> {t.save}
        </button>
      </form>
    </div>
  );

  const AddressesView = () => (
    <div className="animate-slide-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentView('overview')} className="p-2 hover:bg-gray-100 rounded-full transition">
             <ChevronLeft size={24} className={isRTL ? 'rotate-180' : ''} />
        </button>
        <h2 className="text-xl font-bold">{t.addresses}</h2>
        </div>
        <button onClick={() => setCurrentView('add-address')} className="text-brand-600 text-sm font-bold flex items-center gap-1 hover:bg-brand-50 px-3 py-1 rounded-lg transition">
           <Plus size={16} /> {isRTL ? 'إضافة' : 'Add New'}
        </button>
      </div>

      <div className="space-y-4">
         {user.addresses.length === 0 && (
            <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
               <MapPin className="mx-auto text-gray-300 mb-2" size={32} />
               <p className="text-gray-400 text-sm">{t.emptyAddr}</p>
            </div>
         )}
         {user.addresses.map(addr => (
           <div key={addr.id} className="p-4 border border-gray-200 rounded-2xl flex items-start justify-between bg-white shadow-sm hover:shadow-md transition">
              <div className="flex items-start gap-3">
                 <div className="mt-1 text-brand-600 bg-brand-50 p-2 rounded-full"><Home size={18} /></div>
                 <div>
                    <h4 className="font-bold text-gray-900">{addr.label} {addr.isDefault && <span className="text-[10px] bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full ml-2">{t.default}</span>}</h4>
                    <p className="text-sm text-gray-500 mt-1 leading-snug">{addr.formattedAddress}</p>
                    <p className="text-xs text-gray-400 mt-1">{addr.contactName} • {addr.email}</p>
                 </div>
              </div>
              <button onClick={() => deleteAddress(addr.id)} className="text-gray-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition">
                 <Trash2 size={18} />
              </button>
           </div>
         ))}
      </div>
    </div>
  );

  const SecurityView = () => (
    <div className="animate-slide-in">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setCurrentView('overview')} className="p-2 hover:bg-gray-100 rounded-full transition">
           <ChevronLeft size={24} className={isRTL ? 'rotate-180' : ''} />
        </button>
        <h2 className="text-xl font-bold">{t.security}</h2>
      </div>

      <div className="space-y-8">
         {/* Change Password */}
         <section>
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Lock size={18} /> {t.changePass}</h3>
            <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); alert("Password Updated!"); }}>
               <input type="password" placeholder={t.currentPass} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" />
               <input type="password" placeholder={t.newPass} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" />
               <input type="password" placeholder={t.confirmPass} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" />
               <button type="submit" className="px-6 py-2 bg-gray-900 text-white rounded-lg font-bold text-sm hover:bg-black transition">{t.updatePass}</button>
            </form>
         </section>
         
         <hr className="border-gray-100" />

         {/* Change Email */}
         <section>
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Mail size={18} /> {t.changeEmail}</h3>
            {emailStep === 'request' ? (
               <div className="flex gap-2">
                  <input type="email" placeholder={t.newEmail} className="flex-1 p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" />
                  <button onClick={() => setEmailStep('verify')} className="px-4 bg-brand-50 text-brand-600 font-bold rounded-xl hover:bg-brand-100 transition">{t.verify}</button>
               </div>
            ) : (
               <div className="flex gap-2 animate-fade-in">
                  <input type="text" placeholder={t.enterToken} className="flex-1 p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-center tracking-widest" />
                  <button onClick={() => { alert("Email Changed!"); setEmailStep('request'); }} className="px-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition">{t.confirm}</button>
               </div>
            )}
         </section>
      </div>
    </div>
  );

  const InstallAppView = () => (
    <div className="animate-slide-in p-2">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setCurrentView('overview')} className="p-2 hover:bg-gray-100 rounded-full transition">
           <ChevronLeft size={24} className={isRTL ? 'rotate-180' : ''} />
        </button>
        <h2 className="text-xl font-bold">{t.installApp}</h2>
      </div>
      
      <div className="space-y-6">
         <div className="bg-brand-600 text-white p-6 rounded-3xl shadow-lg text-center">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4">
               <span className="font-serif font-bold text-brand-600 text-3xl">HP</span>
            </div>
            <h3 className="text-2xl font-bold mb-2">Hamess Pack</h3>
            <p className="text-brand-100 text-sm mb-6">The best experience for party shopping.</p>
         </div>

         {/* Android */}
         <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <Smartphone size={24} />
               </div>
               <div>
                  <h4 className="font-bold text-gray-900">Android</h4>
                  <p className="text-xs text-gray-500">Play Store / APK</p>
               </div>
            </div>
            <button 
               onClick={() => alert("Developer Note: This would link to the Google Play Store URL.")}
               className="px-4 py-2 bg-gray-900 text-white rounded-lg font-bold text-sm hover:bg-black transition"
            >
               Download
            </button>
         </div>

         {/* iOS */}
         <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                      <Smartphone size={24} />
                   </div>
                   <div>
                      <h4 className="font-bold text-gray-900">iPhone / iPad</h4>
                      <p className="text-xs text-gray-500">iOS App (TestFlight / Store)</p>
                   </div>
                </div>
                {/* For production, this links to App Store. For testing, it's TestFlight public link */}
                <button 
                   onClick={() => alert("Developer Note: You must upload the IPA to TestFlight first, then add the Public Link here.")}
                   className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-bold text-sm hover:bg-blue-100 transition"
                >
                   Open Store
                </button>
             </div>
             
             <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm">
               <h5 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                 <Download size={16} /> Install Immediately (No Store)
               </h5>
               <p className="text-gray-600 mb-3 text-xs">
                 Apple restricts direct downloads. To install now, use the "Add to Home Screen" feature:
               </p>
               <ol className="space-y-2 text-xs text-gray-500">
                 <li className="flex items-center gap-2">
                   <span className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center font-bold text-[10px]">1</span>
                   Tap the <Share size={14} className="text-blue-500 inline" /> <b>Share</b> icon in your Safari toolbar.
                 </li>
                 <li className="flex items-center gap-2">
                   <span className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center font-bold text-[10px]">2</span>
                   Scroll down and tap <PlusSquare size={14} className="inline" /> <b>Add to Home Screen</b>.
                 </li>
               </ol>
             </div>
         </div>

         {/* Desktop PWA */}
         <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
               <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                  <Monitor size={24} />
               </div>
               <div>
                  <h4 className="font-bold text-gray-900">Desktop / Web</h4>
                  <p className="text-xs text-gray-500">Install on Chrome or Edge</p>
               </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl text-sm text-gray-600 border border-gray-200">
               <p className="mb-2 flex items-center gap-2"><span className="bg-gray-200 w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs">1</span> Click the Install icon in your browser address bar.</p>
               <p className="flex items-center gap-2"><span className="bg-gray-200 w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs">2</span> Select "Install Hamess Pack".</p>
            </div>
         </div>
      </div>
    </div>
  );

  const GeneralSettingsView = () => (
    <div className="animate-slide-in">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setCurrentView('overview')} className="p-2 hover:bg-gray-100 rounded-full transition">
           <ChevronLeft size={24} className={isRTL ? 'rotate-180' : ''} />
        </button>
        <h2 className="text-xl font-bold">{t.settings}</h2>
      </div>

      <div className="space-y-4">
         {/* Language Toggle */}
         <div className="p-4 bg-white rounded-2xl border border-gray-200 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Globe size={20} /></div>
               <div>
                  <h4 className="font-bold">{t.lang} / اللغة</h4>
                  <p className="text-xs text-gray-500">{user.language === 'en' ? 'English' : 'العربية'}</p>
               </div>
            </div>
            <button 
               onClick={() => changeLanguage(user.language === 'en' ? 'ar' : 'en')}
               className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold transition text-gray-700"
            >
               {user.language === 'en' ? 'العربية' : 'English'}
            </button>
         </div>

         {/* Notifications Toggle */}
         <div className="p-4 bg-white rounded-2xl border border-gray-200 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg"><Bell size={20} /></div>
               <div>
                  <h4 className="font-bold">{t.notifications}</h4>
                  <p className="text-xs text-gray-500">{user.notificationsEnabled ? 'On' : 'Off'}</p>
               </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={user.notificationsEnabled} 
                onChange={() => updateUser({ notificationsEnabled: !user.notificationsEnabled })} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
            </label>
         </div>
      </div>
    </div>
  );

  // --- Main Overview View ---

  const Overview = () => (
    <>
      {/* Header Profile Section */}
      <div className="bg-brand-600 p-8 pb-28 md:rounded-t-3xl text-white text-center relative z-0 shadow-lg">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
             <div className="absolute -top-24 -right-24 w-64 h-64 bg-white rounded-full blur-3xl"></div>
             <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-900 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10">
            <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 border-4 border-brand-400/50 overflow-hidden shadow-xl flex items-center justify-center">
              {user.avatar ? (
                 <img src={user.avatar} className="w-full h-full object-cover" />
              ) : (
                 <span className="text-3xl font-bold text-brand-600">{user.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
            <p className="text-brand-100 text-sm font-medium mt-1 opacity-90">{user.phone}</p>
          </div>
        </div>

        <div className="flex-1 bg-gray-50 px-4 md:px-8 pb-12 relative z-10">
          
          {/* Floating Stats Card */}
          <div className="-mt-14 relative z-20 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 max-w-sm mx-auto overflow-hidden mb-8">
            <div className="grid grid-cols-2 divide-x divide-gray-50 rtl:divide-x-reverse">
              <div className="p-6 text-center group cursor-pointer hover:bg-gray-50 transition-colors">
                <span className="block text-3xl font-bold text-brand-600 mb-1 group-hover:scale-105 transition-transform">
                  {ordersCount}
                </span>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">{t.orders}</span>
              </div>
              <div className="p-6 text-center group cursor-pointer hover:bg-gray-50 transition-colors">
                <span className="block text-3xl font-bold text-brand-600 mb-1 group-hover:scale-105 transition-transform">
                  {returnsCount}
                </span>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">{t.returns}</span>
              </div>
            </div>
          </div>

          {/* Menu Content */}
          <div className="space-y-8">
            
            {/* Account Settings */}
            <div>
               <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1 px-2">{t.account}</h2>
               <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
                 {user.isAdmin && (
                   <button 
                    onClick={onAdminClick}
                    className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition text-left group text-start"
                   >
                     <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                        <Settings size={18} />
                     </div>
                     <div className="flex-1">
                        <span className="block font-bold text-gray-900">{t.adminDash}</span>
                     </div>
                     <ChevronRight size={18} className={`text-gray-300 ${isRTL ? 'rotate-180' : ''}`} />
                   </button>
                 )}
                 
                 <button onClick={handleEditProfileStart} className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition text-start">
                   <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><UserIcon size={18}/></div>
                   <div className="flex-1">
                     <span className="block font-medium text-gray-700">{t.editProfile}</span>
                     <span className="text-xs text-gray-500">{user.email}</span>
                   </div>
                   <ChevronRight size={18} className={`text-gray-300 ${isRTL ? 'rotate-180' : ''}`} />
                 </button>
                 
                 <button onClick={() => setCurrentView('addresses')} className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition text-start">
                   <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center"><MapPin size={18}/></div>
                   <span className="flex-1 font-medium text-gray-700">{t.addresses}</span>
                   <ChevronRight size={18} className={`text-gray-300 ${isRTL ? 'rotate-180' : ''}`} />
                 </button>

                 <button onClick={() => setCurrentView('security')} className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition text-start">
                   <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center"><Shield size={18}/></div>
                   <span className="flex-1 font-medium text-gray-700">{t.security}</span>
                   <ChevronRight size={18} className={`text-gray-300 ${isRTL ? 'rotate-180' : ''}`} />
                 </button>
                 
                 <button onClick={() => setCurrentView('general')} className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition text-start">
                   <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center"><Settings size={18}/></div>
                   <span className="flex-1 font-medium text-gray-700">{t.settings}</span>
                   <ChevronRight size={18} className={`text-gray-300 ${isRTL ? 'rotate-180' : ''}`} />
                 </button>
               </div>
            </div>
            
            {/* App Install Banner */}
            <div onClick={() => setCurrentView('install-app')} className="cursor-pointer">
               <div className="bg-gradient-to-r from-brand-600 to-accent-500 p-4 rounded-2xl shadow-md flex items-center justify-between text-white relative overflow-hidden group">
                   <div className="absolute right-0 top-0 h-full w-20 bg-white/10 -skew-x-12 transform translate-x-10 group-hover:translate-x-0 transition duration-500"></div>
                   <div className="flex items-center gap-3 relative z-10">
                      <div className="bg-white/20 p-2 rounded-lg">
                         <Download size={24} />
                      </div>
                      <div>
                         <h3 className="font-bold">{t.installApp}</h3>
                         <p className="text-xs text-brand-100">{t.installDesc}</p>
                      </div>
                   </div>
                   <ChevronRight size={20} className={`relative z-10 ${isRTL ? 'rotate-180' : ''}`} />
               </div>
            </div>

            {/* Recent Orders */}
            <div>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1 px-2">{t.orders}</h2>
              <div className="space-y-3">
                {orders.length === 0 ? (
                  <div className="text-center py-8 bg-white rounded-2xl border border-gray-100 border-dashed">
                    <Package size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-400 text-sm">{t.noOrders}</p>
                  </div>
                ) : (
                  orders.slice(0, 3).map(order => (
                    <div key={order.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-sm">
                          #{order.id.slice(-4)}
                        </div>
                        <div>
                           <p className="font-bold text-gray-900">{order.items.length} {t.items}</p>
                           <p className="text-xs text-gray-500">{new Date(order.date).toLocaleDateString()} • {order.status}</p>
                        </div>
                      </div>
                      <span className="font-bold text-brand-600 text-sm">{order.total} EGP</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button onClick={onLogout} className="w-full p-4 rounded-2xl border border-red-100 text-red-500 bg-white hover:bg-red-50 transition font-medium flex items-center justify-center gap-2 shadow-sm">
              <LogOut size={18} /> {t.logout}
            </button>
          </div>
        </div>
    </>
  );

  // --- Main Render ---

  return (
    <div className="min-h-screen bg-gray-50 w-full md:pb-12 relative">
      {/* Address Setup Modal / Overlay */}
      {currentView === 'add-address' && (
         <AddressSetup onClose={() => setCurrentView('addresses')} />
      )}

      <div className="max-w-3xl mx-auto bg-white min-h-screen md:min-h-0 md:mt-6 md:rounded-3xl md:shadow-sm md:border border-gray-100 overflow-hidden flex flex-col">
         {currentView === 'overview' && <Overview />}
         {currentView === 'edit-profile' && <EditProfileView />}
         {currentView === 'addresses' && <AddressesView />}
         {currentView === 'security' && <SecurityView />}
         {currentView === 'general' && <GeneralSettingsView />}
         {currentView === 'install-app' && <InstallAppView />}
      </div>
    </div>
  );
};
