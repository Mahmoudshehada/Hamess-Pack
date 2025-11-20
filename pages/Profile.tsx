
import React from 'react';
import { useStore } from '../context/StoreContext';
import { Package, MapPin, Settings, LogOut, Phone, User as UserIcon, ChevronRight } from 'lucide-react';

interface ProfileProps {
  onLogout: () => void;
  onAdminClick: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ onLogout, onAdminClick }) => {
  const { user, orders } = useStore();

  // Explicitly define counts to ensure 0 is rendered correctly
  const ordersCount = orders.length;
  const returnsCount = 0; // Placeholder as returns logic is not yet implemented in store

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 w-full md:pb-12">
      <div className="max-w-3xl mx-auto bg-white min-h-screen md:min-h-0 md:mt-6 md:rounded-3xl md:shadow-sm md:border border-gray-100 overflow-hidden flex flex-col">
        
        {/* Header Profile Section */}
        <div className="bg-brand-600 p-8 pb-28 md:rounded-t-3xl text-white text-center relative z-0">
          {/* Background Decor */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
             <div className="absolute -top-24 -right-24 w-64 h-64 bg-white rounded-full blur-3xl"></div>
             <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-900 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10">
            <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 border-4 border-brand-400/50 overflow-hidden shadow-xl flex items-center justify-center">
              <span className="text-3xl font-bold text-brand-600">{user.name.charAt(0).toUpperCase()}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
            <p className="text-brand-100 text-sm font-medium mt-1 opacity-90">{user.phone}</p>
          </div>
        </div>

        <div className="flex-1 bg-gray-50 px-4 md:px-8 pb-12 relative z-10">
          
          {/* Floating Stats Card */}
          <div className="-mt-14 relative z-20 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 max-w-sm mx-auto overflow-hidden">
            <div className="grid grid-cols-2 divide-x divide-gray-50">
              <div className="p-6 text-center group cursor-pointer hover:bg-gray-50 transition-colors">
                <span className="block text-3xl font-bold text-brand-600 mb-1 group-hover:scale-105 transition-transform">
                  {ordersCount}
                </span>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Orders</span>
              </div>
              <div className="p-6 text-center group cursor-pointer hover:bg-gray-50 transition-colors">
                <span className="block text-3xl font-bold text-brand-600 mb-1 group-hover:scale-105 transition-transform">
                  {returnsCount}
                </span>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Returns</span>
              </div>
            </div>
          </div>

          {/* Menu Content */}
          <div className="mt-8 space-y-8">
            
            {/* Account Settings */}
            <div>
               <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">Account</h2>
               <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
                 {user.isAdmin && (
                   <button 
                    onClick={onAdminClick}
                    className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition text-left group"
                   >
                     <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                        <Settings size={18} />
                     </div>
                     <div className="flex-1">
                        <span className="block font-bold text-gray-900">Admin Dashboard</span>
                        <span className="text-xs text-gray-500">Manage products & orders</span>
                     </div>
                     <ChevronRight size={18} className="text-gray-300" />
                   </button>
                 )}
                 
                 <button className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition text-left">
                   <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><UserIcon size={18}/></div>
                   <span className="flex-1 font-medium text-gray-700">Edit Profile</span>
                   <ChevronRight size={18} className="text-gray-300" />
                 </button>
                 <button className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition text-left">
                   <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center"><MapPin size={18}/></div>
                   <span className="flex-1 font-medium text-gray-700">Saved Addresses</span>
                   <ChevronRight size={18} className="text-gray-300" />
                 </button>
               </div>
            </div>

            {/* Recent Orders */}
            <div>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">History</h2>
              <div className="space-y-3">
                {orders.length === 0 ? (
                  <div className="text-center py-8 bg-white rounded-2xl border border-gray-100 border-dashed">
                    <Package size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-400 text-sm">No orders yet.</p>
                  </div>
                ) : (
                  orders.slice(0, 3).map(order => (
                    <div key={order.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-sm">
                          #{order.id.slice(-4)}
                        </div>
                        <div>
                           <p className="font-bold text-gray-900">{order.items.length} Items</p>
                           <p className="text-xs text-gray-500">{new Date(order.date).toLocaleDateString()} • {order.status}</p>
                        </div>
                      </div>
                      <span className="font-bold text-brand-600 text-sm">{order.total} EGP</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button onClick={onLogout} className="w-full p-4 rounded-2xl border border-red-100 text-red-500 bg-white hover:bg-red-50 transition font-medium flex items-center justify-center gap-2">
              <LogOut size={18} /> Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
