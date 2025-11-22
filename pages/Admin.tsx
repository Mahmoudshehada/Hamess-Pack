
import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, Order, User } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area 
} from 'recharts';
import { 
  LayoutDashboard, Package, Users, ShoppingCart, Settings, Tag, 
  LogOut, Plus, Search, Trash2, Edit2, Download, Upload, 
  DollarSign, Bell, Menu, XCircle, Brain, LayoutGrid,
  AlertTriangle, Calendar, Filter, ChevronDown, Check, ArrowUpRight,
  Lock, ChevronUp, ClipboardList, MapPin, Phone, Info, Eye, Save, X,
  Globe, CreditCard, Truck, Database, Shield, RefreshCw, MessageCircle,
  Loader, User as UserIcon, Map
} from 'lucide-react';
import { SystemHealth } from '../components/SystemHealth';
import { FloatingAssistant } from '../components/FloatingAssistant';

interface AdminProps {
  onBack: () => void;
}

type View = 'dashboard' | 'products' | 'orders' | 'customers' | 'coupons' | 'settings' | 'notifications' | 'categories';

// --- Sub-Views ---

const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetSystem, exportSystemData, importSystemData, notificationLogs } = useStore();
  const [activeTab, setActiveTab] = useState<'general'|'notifications'|'ai'|'shipping'|'data'|'security'>('general');
  
  // Temporary state for form handling before saving
  const [formData, setFormData] = useState(settings);
  const [newAdminPhone, setNewAdminPhone] = useState('');

  const handleChange = (section: keyof typeof settings, key: string, value: any) => {
     setFormData(prev => ({
       ...prev,
       [section]: {
         ...prev[section],
         [key]: value
       }
     }));
  };

  const handleSave = () => {
    updateSettings(formData);
  };

  const addAdminPhone = () => {
    if(newAdminPhone && !formData.notifications.admins.find(a => a.phone === newAdminPhone)) {
        const newAdmin = { name: 'New Admin', phone: newAdminPhone, language: 'en' as const, channels: ['WHATSAPP'] as any[] };
        const updatedAdmins = [...formData.notifications.admins, newAdmin];
        setFormData(prev => ({
            ...prev,
            notifications: { ...prev.notifications, admins: updatedAdmins }
        }));
        setNewAdminPhone('');
    }
  };

  const removeAdminPhone = (phone: string) => {
      const updatedAdmins = formData.notifications.admins.filter(a => a.phone !== phone);
      setFormData(prev => ({
          ...prev,
          notifications: { ...prev.notifications, admins: updatedAdmins }
      }));
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'ai', label: 'Smart AI', icon: Brain },
    { id: 'shipping', label: 'Shipping & Orders', icon: Truck },
    { id: 'data', label: 'Data & Backup', icon: Database },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 h-full overflow-hidden">
      
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 flex-shrink-0 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden h-fit">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
           <h3 className="font-bold text-gray-700">Configuration</h3>
        </div>
        <div className="p-2 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                activeTab === tab.id 
                  ? 'bg-brand-50 text-brand-700 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-12">
         <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <div>
                   <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      {tabs.find(t => t.id === activeTab)?.icon && React.createElement(tabs.find(t => t.id === activeTab)!.icon, { size: 24, className: "text-brand-600" })}
                      {tabs.find(t => t.id === activeTab)?.label} Settings
                   </h2>
                   <p className="text-sm text-gray-500 mt-1">Manage your application preferences and configurations.</p>
                </div>
                <button 
                   onClick={handleSave}
                   className="px-6 py-2 bg-brand-600 text-white rounded-xl font-bold shadow-lg hover:bg-brand-700 transition flex items-center gap-2 active:scale-95"
                >
                   <Save size={18} /> Save Changes
                </button>
            </div>

            {/* General Tab */}
            {activeTab === 'general' && (
               <div className="space-y-6 max-w-2xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Store Name</label>
                        <input 
                           type="text" 
                           value={formData.general.brandName}
                           onChange={e => handleChange('general', 'brandName', e.target.value)}
                           className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Contact Email</label>
                        <input 
                           type="email" 
                           value={formData.general.contactEmail}
                           onChange={e => handleChange('general', 'contactEmail', e.target.value)}
                           className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Currency</label>
                        <input 
                           type="text" 
                           value={formData.general.currency}
                           disabled
                           className="w-full p-3 border border-gray-200 bg-gray-50 text-gray-500 rounded-xl cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-400 mt-1">Currency is locked to EGP.</p>
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Default Language</label>
                        <select 
                           value={formData.general.language}
                           onChange={e => handleChange('general', 'language', e.target.value)}
                           className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                        >
                           <option value="en">English</option>
                           <option value="ar">Arabic</option>
                        </select>
                     </div>
                  </div>
               </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
               <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="p-4 border border-gray-200 rounded-xl flex items-center justify-between bg-gray-50">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-green-100 text-green-600 rounded-lg"><MessageCircle size={20}/></div>
                           <div>
                              <h4 className="font-bold text-gray-900">WhatsApp Alerts</h4>
                              <p className="text-xs text-gray-500">Send order & stock alerts to admins</p>
                           </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                           <input 
                              type="checkbox" 
                              checked={formData.notifications.enableWhatsApp} 
                              onChange={e => handleChange('notifications', 'enableWhatsApp', e.target.checked)} 
                              className="sr-only peer" 
                           />
                           <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                     </div>
                     
                     <div className="p-4 border border-gray-200 rounded-xl flex items-center justify-between bg-gray-50">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Bell size={20}/></div>
                           <div>
                              <h4 className="font-bold text-gray-900">Push Notifications</h4>
                              <p className="text-xs text-gray-500">In-app dashboard popups</p>
                           </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                           <input 
                              type="checkbox" 
                              checked={formData.notifications.enablePush} 
                              onChange={e => handleChange('notifications', 'enablePush', e.target.checked)} 
                              className="sr-only peer" 
                           />
                           <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                     </div>
                  </div>

                  <div className="border-t border-gray-100 pt-6">
                      <h3 className="font-bold text-lg text-gray-900 mb-4">Admin Phone Numbers (WhatsApp)</h3>
                      <div className="space-y-3 max-w-md">
                          {formData.notifications.admins.map((admin, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                                  <div>
                                      <p className="font-medium text-gray-900">{admin.name}</p>
                                      <p className="text-sm text-gray-500 font-mono">{admin.phone}</p>
                                  </div>
                                  <button onClick={() => removeAdminPhone(admin.phone)} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition"><Trash2 size={16}/></button>
                              </div>
                          ))}
                          
                          <div className="flex gap-2 mt-4">
                              <input 
                                  type="text" 
                                  placeholder="Add Phone (e.g. 010xxxx)" 
                                  className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                                  value={newAdminPhone}
                                  onChange={e => setNewAdminPhone(e.target.value)}
                              />
                              <button onClick={addAdminPhone} className="bg-gray-900 text-white px-4 rounded-lg text-sm font-bold">Add</button>
                          </div>
                      </div>
                  </div>
               </div>
            )}

            {/* Smart AI Tab */}
            {activeTab === 'ai' && (
                <div className="space-y-6">
                    <div className="bg-brand-50 border border-brand-100 p-6 rounded-2xl flex items-start gap-4">
                        <Brain size={32} className="text-brand-600 mt-1" />
                        <div>
                            <h3 className="font-bold text-brand-900 text-lg">Hamess AI Engine</h3>
                            <p className="text-brand-700 text-sm mt-1">The AI Assistant helps monitor stock, suggest pricing strategies, and draft reorder requests automatically.</p>
                        </div>
                        <div className="ml-auto">
                             <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={formData.ai.enabled} 
                                    onChange={e => handleChange('ai', 'enabled', e.target.checked)} 
                                    className="sr-only peer" 
                                />
                                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-brand-600"></div>
                             </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="p-4 border border-gray-200 rounded-xl flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-gray-900">Auto-Pricing Suggestions</h4>
                                <p className="text-xs text-gray-500">AI will suggest discounts for dead stock</p>
                            </div>
                            <input type="checkbox" className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500" checked={formData.ai.autoPricing} onChange={e => handleChange('ai', 'autoPricing', e.target.checked)} />
                         </div>
                         <div className="p-4 border border-gray-200 rounded-xl flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-gray-900">Auto-Reorder Drafts</h4>
                                <p className="text-xs text-gray-500">Draft POs when stock hits 0</p>
                            </div>
                            <input type="checkbox" className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500" checked={formData.ai.autoReorder} onChange={e => handleChange('ai', 'autoReorder', e.target.checked)} />
                         </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">AI Personality / Tone</label>
                        <select 
                           value={formData.ai.tone}
                           onChange={e => handleChange('ai', 'tone', e.target.value)}
                           className="w-full md:w-1/3 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                        >
                           <option value="Professional">Professional (Concise)</option>
                           <option value="Friendly">Friendly (Engaging)</option>
                           <option value="Urgent">Urgent (Alert Focused)</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Shipping Tab */}
            {activeTab === 'shipping' && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                           <label className="block text-sm font-bold text-gray-700 mb-2">Flat Rate Shipping (EGP)</label>
                           <div className="relative">
                               <span className="absolute left-3 top-3 text-gray-400">EGP</span>
                               <input 
                                  type="number" 
                                  value={formData.shipping.flatRate}
                                  onChange={e => handleChange('shipping', 'flatRate', Number(e.target.value))}
                                  className="w-full pl-12 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                               />
                           </div>
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-gray-700 mb-2">Free Shipping Threshold (EGP)</label>
                           <div className="relative">
                               <span className="absolute left-3 top-3 text-gray-400">EGP</span>
                               <input 
                                  type="number" 
                                  value={formData.shipping.freeShippingThreshold}
                                  onChange={e => handleChange('shipping', 'freeShippingThreshold', Number(e.target.value))}
                                  className="w-full pl-12 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                               />
                           </div>
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="font-bold text-gray-900 mb-4">Payment Gateways</h3>
                        <div className="space-y-3">
                            {['paymob', 'fawry', 'stripe'].map(gw => (
                                <div key={gw} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-gray-50">
                                    <span className="font-bold uppercase text-gray-700">{gw}</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={formData.paymentGateways[gw as keyof typeof formData.paymentGateways]} 
                                            onChange={e => setFormData(prev => ({ ...prev, paymentGateways: { ...prev.paymentGateways, [gw]: e.target.checked } }))} 
                                            className="sr-only peer" 
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Data Tab */}
            {activeTab === 'data' && (
                <div className="space-y-6">
                    <div className="p-6 border border-gray-200 rounded-2xl bg-blue-50">
                        <h3 className="font-bold text-blue-900 text-lg mb-2">Backup & Restore</h3>
                        <p className="text-blue-700 text-sm mb-6">Download a full JSON backup of your products, orders, and user data. Use this file to restore the system if needed.</p>
                        
                        <div className="flex gap-4">
                            <button 
                                onClick={exportSystemData}
                                className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-md"
                            >
                                <Download size={18} /> Export Data
                            </button>
                            <label className="flex items-center gap-2 px-5 py-3 bg-white text-blue-600 border border-blue-200 rounded-xl font-bold hover:bg-blue-50 transition shadow-sm cursor-pointer">
                                <Upload size={18} /> Import Data
                                <input type="file" className="hidden" accept=".json" onChange={e => e.target.files?.[0] && importSystemData(e.target.files[0])} />
                            </label>
                        </div>
                        {formData.backup.lastBackupDate && (
                            <p className="text-xs text-blue-500 mt-4">Last backup: {new Date(formData.backup.lastBackupDate).toLocaleString()}</p>
                        )}
                    </div>

                    <div className="p-6 border border-red-200 rounded-2xl bg-red-50">
                        <h3 className="font-bold text-red-900 text-lg mb-2">Danger Zone</h3>
                        <p className="text-red-700 text-sm mb-6">Irreversible actions. Please proceed with caution.</p>
                        <button 
                            onClick={resetSystem}
                            className="flex items-center gap-2 px-5 py-3 bg-white text-red-600 border border-red-200 rounded-xl font-bold hover:bg-red-100 transition shadow-sm"
                        >
                            <RefreshCw size={18} /> Factory Reset System
                        </button>
                    </div>
                </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Session Timeout (Minutes)</label>
                            <input 
                                type="number" 
                                value={formData.security.sessionTimeout}
                                onChange={e => handleChange('security', 'sessionTimeout', Number(e.target.value))}
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                            />
                        </div>
                        <div className="flex items-center justify-between p-3 border border-gray-200 rounded-xl mt-6">
                            <span className="text-sm font-bold text-gray-700">Require Complex Passwords</span>
                            <input type="checkbox" className="w-5 h-5 text-brand-600 rounded" checked={formData.security.requireComplexPassword} onChange={e => handleChange('security', 'requireComplexPassword', e.target.checked)} />
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                        <h3 className="font-bold text-gray-900 mb-4">Recent Activity</h3>
                        <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden max-h-60 overflow-y-auto">
                             {notificationLogs.length === 0 ? (
                                 <p className="p-4 text-center text-gray-500 text-sm">No activity logs found.</p>
                             ) : (
                                 <table className="w-full text-left text-xs">
                                     <thead className="bg-gray-100 text-gray-500">
                                         <tr>
                                             <th className="p-3">Time</th>
                                             <th className="p-3">Action/Message</th>
                                             <th className="p-3">Channel</th>
                                         </tr>
                                     </thead>
                                     <tbody className="divide-y divide-gray-200">
                                         {notificationLogs.slice(0, 10).map(log => (
                                             <tr key={log.id}>
                                                 <td className="p-3 text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</td>
                                                 <td className="p-3 text-gray-900 font-medium">{log.messageHeader}</td>
                                                 <td className="p-3"><span className="px-2 py-0.5 bg-white border border-gray-200 rounded-full text-[10px]">{log.channel}</span></td>
                                             </tr>
                                         ))}
                                     </tbody>
                                 </table>
                             )}
                        </div>
                    </div>
                </div>
            )}
         </div>
      </div>
    </div>
  );
};

const NotificationsView: React.FC = () => {
  const { systemNotifications, markNotificationRead, deleteSystemNotification, clearAllNotifications } = useStore();
  const [filter, setFilter] = useState<'ALL'|'UNREAD'>('ALL');

  const filtered = systemNotifications.filter(n => filter === 'ALL' ? true : !n.isRead);

  return (
     <div className="p-6 h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900"><Bell className="text-brand-600" /> Notification Center</h2>
            <div className="flex gap-2">
                <select 
                   value={filter} 
                   onChange={(e) => setFilter(e.target.value as any)}
                   className="p-2 bg-white border border-gray-300 rounded-lg text-sm outline-none"
                >
                    <option value="ALL">All Messages</option>
                    <option value="UNREAD">Unread Only</option>
                </select>
                <button onClick={clearAllNotifications} className="p-2 text-red-500 hover:bg-red-50 rounded-lg text-sm font-bold">Clear All</button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-gray-200 shadow-sm p-2 space-y-2">
            {filtered.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <Bell size={48} className="mb-4 opacity-20" />
                    <p>No notifications found.</p>
                </div>
            )}
            {filtered.map(n => (
                <div 
                  key={n.id} 
                  className={`p-4 rounded-xl border transition-all hover:shadow-md cursor-pointer relative group ${n.isRead ? 'bg-white border-gray-100' : 'bg-blue-50 border-blue-100'}`}
                  onClick={() => markNotificationRead(n.id)}
                >
                    <div className="flex justify-between items-start">
                        <div className="flex gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${n.priority === 'high' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                            <div>
                                <h4 className={`font-bold text-sm ${n.isRead ? 'text-gray-700' : 'text-gray-900'}`}>{n.title}</h4>
                                <p className="text-gray-600 text-sm mt-1">{n.message}</p>
                                <p className="text-xs text-gray-400 mt-2">{new Date(n.timestamp).toLocaleString()}</p>
                            </div>
                        </div>
                        <button 
                           onClick={(e) => { e.stopPropagation(); deleteSystemNotification(n.id); }}
                           className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
     </div>
  );
};

const CustomersView: React.FC = () => {
  const { users, orders } = useStore();
  const [searchTerm, setSearchTerm] = useState('');

  const customerStats = useMemo(() => {
    return users.map(u => {
      const userOrders = orders.filter(o => o.customerPhone === u.phone);
      const totalSpent = userOrders.reduce((acc, o) => acc + o.total, 0);
      const lastOrder = userOrders.length > 0 ? userOrders[0].date : null;
      return { ...u, orderCount: userOrders.length, totalSpent, lastOrder };
    }).filter(u => 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.phone.includes(searchTerm) ||
      u.email.toLowerCase().includes(searchTerm)
    );
  }, [users, orders, searchTerm]);

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
         <div>
            <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900"><Users className="text-brand-600"/> Customers</h2>
            <p className="text-sm text-gray-500 mt-1">View registered users and their purchase history.</p>
         </div>
         <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search name, phone..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
         </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
             <thead className="bg-gray-50 border-b border-gray-100">
               <tr>
                 <th className="p-4 font-medium text-gray-500">Customer</th>
                 <th className="p-4 font-medium text-gray-500">Contact</th>
                 <th className="p-4 font-medium text-gray-500">Orders</th>
                 <th className="p-4 font-medium text-gray-500">Total Spent</th>
                 <th className="p-4 font-medium text-gray-500">Last Active</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
               {customerStats.map(customer => (
                 <tr key={customer.id} className="hover:bg-gray-50 transition">
                   <td className="p-4">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">
                            {customer.name.charAt(0).toUpperCase()}
                         </div>
                         <div>
                            <p className="font-bold text-gray-900">{customer.name}</p>
                            <p className="text-xs text-gray-400">
                                {customer.role ? customer.role.toUpperCase() : (customer.isAdmin ? 'ADMIN' : 'CUSTOMER')}
                            </p>
                         </div>
                      </div>
                   </td>
                   <td className="p-4 text-gray-600">
                      <p>{customer.phone}</p>
                      <p className="text-xs text-gray-400">{customer.email}</p>
                   </td>
                   <td className="p-4 font-medium">{customer.orderCount}</td>
                   <td className="p-4 font-bold text-brand-600">{customer.totalSpent.toLocaleString()} EGP</td>
                   <td className="p-4 text-gray-500">
                      {customer.lastOrder ? new Date(customer.lastOrder).toLocaleDateString() : 'Never'}
                   </td>
                 </tr>
               ))}
               {customerStats.length === 0 && (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-400">No customers found.</td></tr>
               )}
             </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const OrdersView: React.FC = () => {
  const { orders, updateOrderStatus, user } = useStore();
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [dateRange, setDateRange] = useState<'All' | 'Today' | 'Week' | 'Month'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const filteredOrders = useMemo(() => {
    let res = orders;

    // Status Filter
    if (filterStatus !== 'All') {
       res = res.filter(o => o.status === filterStatus);
    }

    // Date Filter
    const now = new Date();
    if (dateRange === 'Today') {
       res = res.filter(o => new Date(o.date).toDateString() === now.toDateString());
    } else if (dateRange === 'Week') {
       const weekAgo = new Date(now.setDate(now.getDate() - 7));
       res = res.filter(o => new Date(o.date) >= weekAgo);
    } else if (dateRange === 'Month') {
       const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
       res = res.filter(o => new Date(o.date) >= monthAgo);
    }

    // Search Filter (ID or Phone)
    if (searchTerm) {
       const lower = searchTerm.toLowerCase();
       res = res.filter(o => 
          o.id.toLowerCase().includes(lower) || 
          o.customerPhone.includes(searchTerm) ||
          o.customerName.toLowerCase().includes(lower)
       );
    }

    return res;
  }, [orders, filterStatus, dateRange, searchTerm]);

  const statusColors: Record<string, string> = {
     'Processing': 'bg-yellow-100 text-yellow-800',
     'Out for Delivery': 'bg-blue-100 text-blue-800',
     'Delivered': 'bg-green-100 text-green-800',
     'Cancelled': 'bg-red-100 text-red-800'
  };

  const toggleExpand = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900"><ShoppingCart className="text-brand-600"/> Order Management</h2>
        <p className="text-gray-500 text-sm mt-1">View and process customer orders. Click on any order to view full packing details.</p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 justify-between items-end md:items-center">
         <div className="flex flex-wrap gap-3 w-full md:w-auto">
            {/* Status Filter */}
            <div className="relative">
               <select 
                 value={filterStatus}
                 onChange={(e) => setFilterStatus(e.target.value)}
                 className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
               >
                 <option value="All">All Status</option>
                 <option value="Processing">Processing</option>
                 <option value="Out for Delivery">Out for Delivery</option>
                 <option value="Delivered">Delivered</option>
                 <option value="Cancelled">Cancelled</option>
               </select>
               <ChevronDown size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
            </div>

            {/* Date Filter */}
            <div className="relative">
               <select 
                 value={dateRange}
                 onChange={(e) => setDateRange(e.target.value as any)}
                 className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
               >
                 <option value="All">All Time</option>
                 <option value="Today">Today</option>
                 <option value="Week">Last 7 Days</option>
                 <option value="Month">Last 30 Days</option>
               </select>
               <Calendar size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
            </div>
         </div>

         {/* Search */}
         <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
               type="text"
               placeholder="Search Order ID, Name..."
               className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
            />
         </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
               <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                     <th className="p-4 font-medium text-gray-500">Order ID</th>
                     <th className="p-4 font-medium text-gray-500">Date</th>
                     <th className="p-4 font-medium text-gray-500">Customer</th>
                     <th className="p-4 font-medium text-gray-500">Items</th>
                     <th className="p-4 font-medium text-gray-500">Total</th>
                     <th className="p-4 font-medium text-gray-500">Status</th>
                     <th className="p-4 font-medium text-gray-500 text-right">Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map(order => (
                     <React.Fragment key={order.id}>
                        <tr 
                           className={`hover:bg-gray-50 group cursor-pointer transition-colors ${expandedOrderId === order.id ? 'bg-gray-50' : ''}`}
                           onClick={() => toggleExpand(order.id)}
                        >
                           <td className="p-4 font-mono text-xs text-gray-500">
                              <div className="flex items-center gap-2">
                                 {expandedOrderId === order.id ? <ChevronUp size={16} className="text-brand-600" /> : <ChevronDown size={16} />}
                                 #{order.id}
                              </div>
                           </td>
                           <td className="p-4 text-gray-600">
                              {new Date(order.date).toLocaleDateString()}
                              <div className="text-xs text-gray-400">{new Date(order.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                           </td>
                           <td className="p-4">
                              <p className="font-bold text-gray-900">{order.customerName}</p>
                              <p className="text-xs text-gray-500">{order.customerPhone}</p>
                           </td>
                           <td className="p-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                 {order.items.reduce((acc, item) => acc + item.quantity, 0)} Items
                              </span>
                           </td>
                           <td className="p-4 font-bold text-brand-600">{order.total} EGP</td>
                           <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                                 {order.status}
                              </span>
                           </td>
                           <td className="p-4 text-right" onClick={e => e.stopPropagation()}>
                              <select 
                                 value={order.status}
                                 onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                                 className="bg-white border border-gray-200 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-brand-500 cursor-pointer"
                              >
                                 <option value="Processing">Processing</option>
                                 <option value="Out for Delivery">Out for Delivery</option>
                                 <option value="Delivered">Delivered</option>
                                 <option value="Cancelled">Cancelled</option>
                              </select>
                           </td>
                        </tr>
                        
                        {/* Expanded Detail View - Shows Full Item List */}
                        {expandedOrderId === order.id && (
                           <tr>
                              <td colSpan={7} className="p-0 border-b border-gray-100 bg-gray-50/50 animate-fade-in">
                                 <div className="p-4 md:p-6 shadow-inner bg-gray-50">
                                     
                                    {/* New Horizontal Layout for Customer Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                                        {/* Customer Name */}
                                        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center group hover:border-brand-200 transition-colors">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <div className="p-1 bg-blue-50 text-blue-600 rounded-md">
                                                    <UserIcon size={14} />
                                                </div>
                                                <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Customer</span>
                                            </div>
                                            <p className="font-bold text-gray-900 text-sm truncate" title={order.customerName}>{order.customerName}</p>
                                        </div>

                                        {/* Phone Number */}
                                        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center group hover:border-brand-200 transition-colors">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <div className="p-1 bg-green-50 text-green-600 rounded-md">
                                                    <Phone size={14} />
                                                </div>
                                                <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Phone</span>
                                            </div>
                                            <a href={`tel:${order.customerPhone}`} className="font-bold text-brand-600 text-sm hover:underline">{order.customerPhone}</a>
                                        </div>

                                        {/* Address */}
                                        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center group hover:border-brand-200 transition-colors">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <div className="p-1 bg-orange-50 text-orange-600 rounded-md">
                                                    <MapPin size={14} />
                                                </div>
                                                <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Address</span>
                                            </div>
                                            <p className="font-medium text-gray-900 text-xs leading-snug line-clamp-2" title={order.address}>
                                                {order.address}
                                            </p>
                                        </div>

                                        {/* Region */}
                                        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center group hover:border-brand-200 transition-colors">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <div className="p-1 bg-purple-50 text-purple-600 rounded-md">
                                                    <Map size={14} />
                                                </div>
                                                <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Region</span>
                                            </div>
                                            <p className="font-medium text-gray-900 text-xs">
                                                {order.deliveryLocation?.city || 'Unknown'}, {order.deliveryLocation?.governorate || 'Egypt'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Packing List Section - Full Width */}
                                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                       {/* Header with Notes */}
                                       <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex flex-wrap justify-between items-center gap-3">
                                          <h4 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                                              <ClipboardList size={16} className="text-gray-500" /> Packing List 
                                              <span className="ml-2 text-xs font-bold text-brand-600 bg-white px-2 py-0.5 rounded border border-brand-100">
                                                  {order.items.reduce((acc, i) => acc + i.quantity, 0)} Items
                                              </span>
                                          </h4>
                                          
                                          {/* Payment Method Badge */}
                                          <div className="flex items-center gap-3">
                                              {order.deliveryLocation?.notes && (
                                                  <div className="flex items-center gap-1.5 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-lg border border-yellow-100 text-xs">
                                                      <Info size={14} />
                                                      <span className="font-medium max-w-[200px] truncate" title={order.deliveryLocation.notes}>{order.deliveryLocation.notes}</span>
                                                  </div>
                                              )}
                                              <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border border-gray-200 text-xs shadow-sm">
                                                  <CreditCard size={14} className="text-gray-400"/>
                                                  <span className="font-bold text-gray-700">{order.paymentMethod}</span>
                                              </div>
                                          </div>
                                       </div>
                                       
                                       {/* Items List (Grid for better use of space) */}
                                       <div className="divide-y divide-gray-100">
                                           {order.items.map((item, idx) => (
                                                <div key={idx} className="flex items-start gap-4 p-4 hover:bg-gray-50 transition">
                                                   <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                                                       <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                                                   </div>
                                                   <div className="flex-1 min-w-0">
                                                       <div className="flex justify-between items-start">
                                                          <p className="font-bold text-gray-900 text-sm truncate pr-2">{item.name}</p>
                                                          <span className="text-sm font-bold text-brand-600 whitespace-nowrap">
                                                             x{item.quantity}
                                                          </span>
                                                       </div>
                                                       <div className="flex flex-wrap gap-2 mt-1">
                                                          {item.selectedColor && (
                                                             <span className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded border border-purple-100 font-bold flex items-center gap-1">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div> {item.selectedColor}
                                                             </span>
                                                          )}
                                                          {item.customizationNote && (
                                                              <span className="text-[10px] bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded border border-yellow-100 truncate max-w-[200px]">
                                                                  Note: {item.customizationNote}
                                                              </span>
                                                          )}
                                                       </div>
                                                   </div>
                                                   <div className="text-right min-w-[80px]">
                                                       <span className="font-medium text-gray-900 text-sm">
                                                           {(item.price * item.quantity).toLocaleString()} EGP
                                                       </span>
                                                   </div>
                                                </div>
                                           ))}
                                       </div>
                                       
                                       {/* Footer Totals */}
                                       <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end items-center gap-6">
                                           <div className="text-xs text-gray-500">
                                               Subtotal: <span className="font-medium text-gray-900">{(order.total - order.deliveryFee).toLocaleString()}</span>
                                           </div>
                                           <div className="text-xs text-gray-500">
                                               Delivery: <span className="font-medium text-gray-900">{order.deliveryFee}</span>
                                           </div>
                                           <div className="pl-6 border-l border-gray-200">
                                               <span className="text-sm text-gray-600 mr-2">Total:</span>
                                               <span className="font-bold text-brand-600 text-xl">{order.total.toLocaleString()} EGP</span>
                                           </div>
                                       </div>
                                    </div>

                                 </div>
                              </td>
                           </tr>
                        )}
                     </React.Fragment>
                  ))}
                  {filteredOrders.length === 0 && (
                     <tr><td colSpan={7} className="p-12 text-center text-gray-400">No orders found.</td></tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

const CategoriesView: React.FC = () => {
  const { categories, categoryImages, uploadCategoryImage, user, addCategory, renameCategory, deleteCategory } = useStore();
  const [uploadingCat, setUploadingCat] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  // Only Admin can Manage. Staff is Read-Only.
  const isStaff = user?.role === 'staff';

  const handleFileChange = async (category: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (isStaff) return;
    if (e.target.files && e.target.files[0]) {
      setUploadingCat(category);
      try {
        await uploadCategoryImage(category, e.target.files[0]);
      } catch (error) {
        console.error("Failed to upload category image", error);
      } finally {
        setUploadingCat(null);
      }
    }
  };

  const handleAdd = async () => {
    if(!newCategoryName.trim()) return;
    await addCategory(newCategoryName.trim());
    setNewCategoryName('');
    setIsAdding(false);
  };

  const startEdit = (cat: string) => {
    setEditingCategory(cat);
    setEditName(cat);
  };

  const saveEdit = async () => {
    if(editingCategory && editName.trim() && editName !== editingCategory) {
        await renameCategory(editingCategory, editName.trim());
    }
    setEditingCategory(null);
  };

  const handleDelete = async (cat: string) => {
    if(confirm(`Are you sure you want to delete "${cat}"? Products in this category will lose their category link.`)) {
        await deleteCategory(cat);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
            <LayoutGrid size={24} className="text-brand-600"/> Category Management
          </h2>
          {!isStaff && (
              <button onClick={() => setIsAdding(true)} className="px-4 py-2 bg-brand-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-brand-700 transition shadow-sm">
                  <Plus size={16} /> Add Category
              </button>
          )}
      </div>

      {/* Add Category Modal/Input */}
      {isAdding && (
          <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200 shadow-sm animate-fade-in flex gap-3 items-center max-w-lg">
              <input 
                type="text" 
                placeholder="New Category Name"
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                autoFocus
              />
              <button onClick={handleAdd} className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700">Save</button>
              <button onClick={() => setIsAdding(false)} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-bold text-sm hover:bg-gray-200">Cancel</button>
          </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((category) => (
          <div key={category} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden group hover:shadow-md transition-all duration-200">
            {/* Compact Image Area */}
            <div className="relative h-32 bg-gray-100 overflow-hidden">
               <img 
                 src={categoryImages[category] || 'https://via.placeholder.com/300?text=' + category.charAt(0)} 
                 alt={category} 
                 className="w-full h-full object-cover transform group-hover:scale-105 transition duration-500"
               />
               {/* Admin Image Upload Overlay */}
               {!isStaff && (
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label className="cursor-pointer bg-white text-gray-900 p-2 rounded-full shadow-lg hover:scale-110 transition transform">
                      {uploadingCat === category ? (
                        <Loader size={16} className="animate-spin" />
                      ) : (
                        <Upload size={16} />
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleFileChange(category, e)}
                        disabled={uploadingCat === category}
                      />
                    </label>
                 </div>
               )}
            </div>
            
            {/* Details Area */}
            <div className="p-3 bg-white">
               {editingCategory === category ? (
                   <div className="flex gap-1 items-center animate-fade-in">
                       <input 
                         value={editName}
                         onChange={e => setEditName(e.target.value)}
                         className="flex-1 p-1.5 border border-brand-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                         autoFocus
                       />
                       <button onClick={saveEdit} className="p-1.5 text-green-600 bg-green-50 hover:bg-green-100 rounded transition"><Check size={14}/></button>
                       <button onClick={() => setEditingCategory(null)} className="p-1.5 text-red-500 bg-red-50 hover:bg-red-100 rounded transition"><X size={14}/></button>
                   </div>
               ) : (
                   <div className="flex justify-between items-center">
                       <h3 className="font-bold text-gray-800 text-sm truncate pr-2" title={category}>{category}</h3>
                       {!isStaff && (
                           <div className="flex gap-1 shrink-0">
                               <button 
                                 onClick={() => startEdit(category)} 
                                 className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded transition"
                                 title="Rename"
                               >
                                 <Edit2 size={14} />
                               </button>
                               <button 
                                 onClick={() => handleDelete(category)} 
                                 className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                                 title="Delete"
                               >
                                 <Trash2 size={14} />
                               </button>
                           </div>
                       )}
                   </div>
               )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProductsView: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, uploadProductImage, user, categories } = useStore();
  const [viewMode, setViewMode] = useState<'list' | 'edit'>('list');
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);

  // STAFF RESTRICTIONS
  const isStaff = user?.role === 'staff';

  const handleEdit = (product: Product) => {
    // STAFF CANNOT EDIT
    if (isStaff) return;
    setFormData({ ...product });
    setViewMode('edit');
  };

  const handleCreate = () => {
    // STAFF CANNOT CREATE
    if (isStaff) return;
    setFormData({
      id: `PROD-${Date.now()}`, 
      name: '',
      price: 0,
      costPrice: 0,
      stock: 10,
      category: categories[0] || 'General', // Default to first available
      description: '',
      image: '',
      isCustomizable: false,
      rating: 5
    });
    setViewMode('edit');
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price) {
        alert("Please fill required fields (Name, Price)");
        return;
    }
    
    try {
        const productToSave = { ...formData } as Product;
        if (productToSave.imageId) {
            productToSave.image = '';
        }
        const existing = products.find(p => p.id === productToSave.id);
        if (existing) {
            await updateProduct(productToSave);
        } else {
            await addProduct(productToSave);
        }
        setViewMode('list');
    } catch (e) {
        console.error(e);
        alert("Error saving product");
    }
  };
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0] && formData.id) {
          setUploading(true);
          try {
              const stored = await uploadProductImage(e.target.files[0], formData.id);
              setFormData(prev => ({ ...prev, image: stored.data, imageId: stored.id }));
          } catch (err) {
              alert("Image upload failed");
          } finally {
              setUploading(false);
          }
      }
  };

  if (viewMode === 'edit') {
    const inputClass = "w-full px-3 py-1.5 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors placeholder-gray-400";
    const labelClass = "block text-xs font-bold text-gray-800 uppercase mb-1";
    
    return (
      <div className="p-6 max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 my-6 animate-fade-in">
         <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
            <h2 className="text-lg font-bold text-gray-900">{formData.name ? 'Edit Product' : 'New Product'}</h2>
            <button onClick={() => setViewMode('list')} className="p-1 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"><XCircle size={24} /></button>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
             <div className="md:col-span-4 space-y-3">
                 <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden relative border-2 border-dashed border-gray-300 flex items-center justify-center group hover:border-brand-400 transition-colors">
                     {formData.image ? (
                         <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                     ) : (
                         <div className="text-center text-gray-400">
                             <Upload size={40} className="mx-auto mb-2 opacity-50" />
                             <p className="text-xs font-medium">No Image</p>
                         </div>
                     )}
                     <label className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center cursor-pointer">
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        <span className="bg-white text-gray-900 px-4 py-2 rounded-lg font-bold text-xs opacity-0 group-hover:opacity-100 transition transform translate-y-2 group-hover:translate-y-0 shadow-lg">
                           {uploading ? 'Uploading...' : 'Change Image'}
                        </span>
                     </label>
                 </div>
                 <p className="text-[10px] text-gray-500 text-center leading-relaxed">Click to upload. Max 2MB.</p>
             </div>

             <div className="md:col-span-8 space-y-3">
                 <div>
                    <label className={labelClass}>Product Name</label>
                    <input 
                        className={inputClass}
                        value={formData.name || ''}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Category</label>
                        <select 
                           className={inputClass}
                           value={formData.category}
                           onChange={e => setFormData({...formData, category: e.target.value})}
                        >
                           {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Stock</label>
                        <input 
                            type="number"
                            className={inputClass}
                            value={formData.stock || 0}
                            onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
                        />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Price (EGP)</label>
                        <input 
                            type="number"
                            className={inputClass}
                            value={formData.price || 0}
                            onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Cost (EGP)</label>
                        <input 
                            type="number"
                            className={inputClass}
                            value={formData.costPrice || 0}
                            onChange={e => setFormData({...formData, costPrice: Number(e.target.value)})}
                        />
                    </div>
                 </div>

                 <div>
                     <label className={labelClass}>Description (English)</label>
                     <textarea 
                        rows={2}
                        className={inputClass}
                        value={formData.description || ''}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                     />
                 </div>
                 <div>
                     <label className={labelClass}>Description (Arabic)</label>
                     <textarea 
                        rows={2}
                        className={inputClass}
                        value={formData.descriptionAr || ''}
                        onChange={e => setFormData({...formData, descriptionAr: e.target.value})}
                        dir="rtl"
                     />
                 </div>

                 <div className="pt-2">
                     <button 
                        onClick={handleSave}
                        disabled={uploading}
                        className="w-full py-3 bg-brand-600 text-white font-bold rounded-xl shadow-md hover:bg-brand-700 transition flex items-center justify-center gap-2 active:scale-95 transform text-sm"
                     >
                        <Check size={18} /> Save Product
                     </button>
                 </div>
             </div>
         </div>
      </div>
    );
  }

  return (
      <div className="p-6 animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900"><Package className="text-brand-600"/> Product Management</h2>
                <p className="text-sm text-gray-500 mt-1">Manage inventory and pricing.</p>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search products..." 
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  {/* HIDE ADD BUTTON FOR STAFF */}
                  {!isStaff && (
                    <button onClick={handleCreate} className="px-5 py-2.5 bg-brand-900 hover:bg-brand-800 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg active:scale-95">
                        <Plus size={18} /> <span className="hidden md:inline">Add Product</span>
                    </button>
                  )}
              </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="p-4 font-medium text-gray-500">Product</th>
                            <th className="p-4 font-medium text-gray-500">Category</th>
                            <th className="p-4 font-medium text-gray-500">Price</th>
                            <th className="p-4 font-medium text-gray-500">Stock</th>
                            {!isStaff && <th className="p-4 font-medium text-gray-500 text-right">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(product => (
                            <tr key={product.id} className="hover:bg-gray-50 group transition">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 flex-shrink-0">
                                            <img src={product.image} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <span className="font-bold text-gray-900">{product.name}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-gray-500">{product.category}</td>
                                <td className="p-4 font-bold text-gray-900">{product.price} EGP</td>
                                <td className="p-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${product.stock <= 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                        {product.stock} Units
                                    </span>
                                </td>
                                {/* HIDE ACTIONS COLUMN FOR STAFF */}
                                {!isStaff && (
                                  <td className="p-4 text-right">
                                      <div className="flex items-center justify-end gap-2">
                                          <button onClick={() => handleEdit(product)} className="p-2 hover:bg-brand-50 text-gray-400 hover:text-brand-600 rounded-lg transition">
                                              <Edit2 size={18} />
                                          </button>
                                          <button onClick={() => deleteProduct(product.id)} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition">
                                              <Trash2 size={18} />
                                          </button>
                                      </div>
                                  </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
              </div>
          </div>
      </div>
  );
};

const DashboardView: React.FC = () => {
    const { orders, products, users, addNotification } = useStore();

    // KPI Calculations
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const activeUsersCount = new Set(orders.map(o => o.customerPhone)).size;
    const lowStockItems = products.filter(p => p.stock <= 10);
    
    // Sales Chart Data (Last 7 Days)
    const chartData = useMemo(() => {
        const data = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toDateString();
            const dailyTotal = orders
                .filter(o => new Date(o.date).toDateString() === dateStr)
                .reduce((acc, curr) => acc + curr.total, 0);
            
            data.push({
                name: d.toLocaleDateString('en-US', { weekday: 'short' }),
                sales: dailyTotal
            });
        }
        return data;
    }, [orders]);

    return (
       <div className="p-6 animate-fade-in space-y-6">
          {/* Top KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                   <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Revenue</p>
                   <h3 className="text-2xl font-bold text-gray-900">{totalRevenue.toLocaleString()} <span className="text-sm text-gray-400 font-normal">EGP</span></h3>
                </div>
                <div className="p-3 bg-green-50 text-green-600 rounded-xl"><DollarSign size={24} /></div>
             </div>
             <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                   <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Active Users</p>
                   <h3 className="text-2xl font-bold text-gray-900">{activeUsersCount} <span className="text-sm text-gray-400 font-normal">/ {users.length}</span></h3>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users size={24} /></div>
             </div>
             <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                   <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Orders</p>
                   <h3 className="text-2xl font-bold text-gray-900">{orders.length}</h3>
                </div>
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><ShoppingCart size={24} /></div>
             </div>
             <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                   <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Low Stock</p>
                   <h3 className="text-2xl font-bold text-red-600">{lowStockItems.length} <span className="text-sm text-gray-400 font-normal">Items</span></h3>
                </div>
                <div className="p-3 bg-red-50 text-red-600 rounded-xl"><AlertTriangle size={24} /></div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             {/* Sales Chart */}
             <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="font-bold text-gray-900 flex items-center gap-2"><ArrowUpRight className="text-brand-600" size={20}/> Sales Performance</h3>
                   <select className="bg-gray-50 border border-gray-200 text-xs rounded-lg px-3 py-1.5 outline-none">
                      <option>Last 7 Days</option>
                      <option>This Month</option>
                   </select>
                </div>
                <div className="h-64 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F84886" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#F84886" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                        <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)'}} />
                        <Area type="monotone" dataKey="sales" stroke="#F84886" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                      </AreaChart>
                   </ResponsiveContainer>
                </div>
             </div>

             {/* Low Stock Alerts Widget */}
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="text-red-500" size={20} /> Critical Inventory
                    <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full ml-auto">{lowStockItems.length}</span>
                </h3>
                <div className="flex-1 overflow-y-auto pr-2 space-y-3 max-h-64 custom-scrollbar">
                   {lowStockItems.length === 0 ? (
                       <div className="text-center text-gray-400 py-8 text-sm">Inventory looks good!</div>
                   ) : (
                       lowStockItems.map(item => (
                           <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-100">
                               <div className="w-10 h-10 bg-white rounded-lg overflow-hidden flex-shrink-0">
                                   <img src={item.image} className="w-full h-full object-cover" />
                               </div>
                               <div className="flex-1 min-w-0">
                                   <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                                   <p className="text-xs text-red-600 font-medium">{item.stock} units left</p>
                               </div>
                               <button 
                                  onClick={() => addNotification(`Reorder request sent for ${item.name}`, 'success')}
                                  className="p-2 bg-white text-gray-600 rounded-lg border border-red-200 hover:text-red-600 hover:border-red-300 transition text-xs font-bold"
                               >
                                  Restock
                               </button>
                           </div>
                       ))
                   )}
                </div>
                <button className="mt-4 w-full py-2 text-sm font-bold text-gray-500 hover:text-brand-600 transition border-t border-gray-100">
                    View Full Inventory Report
                </button>
             </div>
          </div>
          
          <SystemHealth />
       </div>
    );
};

// --- Main Admin Component ---

export const Admin: React.FC<AdminProps> = ({ onBack }) => {
    const { user } = useStore();
    const [activeView, setActiveView] = useState<View>('dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // SECURITY CHECK: Only Admin and Staff allowed
    if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center animate-fade-in">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-6 shadow-sm animate-bounce">
                    <XCircle size={48} />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
                <p className="text-gray-500 mt-2 mb-8 max-w-md mx-auto">You do not have administrative privileges to view this dashboard.</p>
                <button onClick={onBack} className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-black transition">
                  Return to App
                </button>
            </div>
        );
    }

    const isStaff = user.role === 'staff';

    // Filter Menu Items based on Role
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, allowed: true },
        { id: 'orders', label: 'Orders', icon: ShoppingCart, allowed: true },
        { id: 'customers', label: 'Customers', icon: Users, allowed: true }, 
        { id: 'products', label: 'Products', icon: Package, allowed: true },
        { id: 'categories', label: 'Categories', icon: LayoutGrid, allowed: true },
        { id: 'notifications', label: 'Notifications', icon: Bell, allowed: !isStaff }, 
        { id: 'settings', label: 'Settings', icon: Settings, allowed: !isStaff }, 
    ].filter(i => i.allowed);

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-gray-900">
            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
               <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`fixed md:static inset-y-0 left-0 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 z-50 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-serif font-bold">HP</div>
                        <span className="font-bold text-gray-900">Admin Panel</span>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-400"><LogOut size={20}/></button>
                </div>
                <div className="px-6 py-2">
                   <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      Role: <span className={`text-${isStaff ? 'blue' : 'brand'}-600`}>{user.role.toUpperCase()}</span>
                   </span>
                </div>
                <nav className="p-4 space-y-1">
                   {menuItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => { setActiveView(item.id as View); setIsMobileMenuOpen(false); }}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition ${
                           activeView === item.id ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                         <div className="flex items-center gap-3">
                            <item.icon size={18} />
                            {item.label}
                         </div>
                      </button>
                   ))}
                </nav>
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
                   <button onClick={onBack} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition">
                      <LogOut size={18} /> Exit to App
                   </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shrink-0 z-30">
                    <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-gray-500 p-2 hover:bg-gray-100 rounded-lg">
                       <Menu size={24} />
                    </button>
                    <div className="flex items-center gap-4 ml-auto">
                       <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold">
                          {user.name.charAt(0)}
                       </div>
                       <span className="text-sm font-medium hidden md:block">{user.name}</span>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto bg-gray-50">
                    {activeView === 'dashboard' && <DashboardView />}
                    {activeView === 'orders' && <OrdersView />}
                    {activeView === 'customers' && <CustomersView />}
                    {activeView === 'products' && <ProductsView />}
                    {activeView === 'categories' && <CategoriesView />}
                    
                    {!isStaff && activeView === 'settings' && (
                       <SettingsView />
                    )}
                    
                    {!isStaff && activeView === 'notifications' && (
                       <NotificationsView />
                    )}

                    {/* Safety Fallback for Staff attempting to access hidden views */}
                    {isStaff && (activeView === 'settings' || activeView === 'notifications') && (
                       <div className="flex flex-col items-center justify-center h-full text-center p-8">
                          <Lock size={48} className="text-gray-300 mb-4" />
                          <h3 className="text-xl font-bold text-gray-900">Restricted Access</h3>
                          <p className="text-gray-500">Staff members do not have permission to view this section.</p>
                       </div>
                    )}
                </div>
                
                {/* Floating Assistant available on all views */}
                <FloatingAssistant />
            </main>
        </div>
    );
};
