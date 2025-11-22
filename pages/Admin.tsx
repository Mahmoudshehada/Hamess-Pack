
import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, Order, User, CategoryEnum, NotificationType } from '../types';
import { 
  LayoutDashboard, Package, Users, ShoppingCart, Settings, Tag, 
  LogOut, Plus, Search, Trash2, Edit2, Download, Upload, 
  DollarSign, Bell, Menu, XCircle, Brain, LayoutGrid,
  AlertTriangle, Calendar, Filter, ChevronDown, Check, ArrowUpRight,
  Lock, ChevronUp, ClipboardList, MapPin, Phone, Info, Eye, Save, X,
  Globe, CreditCard, Truck, Database, Shield, RefreshCw, MessageCircle,
  Loader, User as UserIcon, Map, Grid, CheckCircle, Mail, Smartphone, Camera
} from 'lucide-react';
import { SystemHealth } from '../components/SystemHealth';

interface AdminProps {
  onBack: () => void;
}

type View = 'dashboard' | 'products' | 'orders' | 'customers' | 'coupons' | 'settings' | 'notifications' | 'categories';

// --- SUB-VIEWS ---

const ProductsView: React.FC = () => {
    const { products, addProduct, updateProduct, deleteProduct, uploadProductImage, categories, user } = useStore();
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Product>>({});
    const [filter, setFilter] = useState('');

    const isAdmin = user?.role === 'admin';

    const handleEdit = (p: Product) => {
        if (!isAdmin) return;
        setFormData(p);
        setEditingId(p.id);
        setIsEditing(true);
    };

    const handleCreate = () => {
        if (!isAdmin) return;
        setFormData({
            id: `prod_${Date.now()}`,
            name: '',
            price: 0,
            category: categories[0],
            stock: 0,
            description: '',
            isCustomizable: false,
            rating: 5
        });
        setEditingId(null);
        setIsEditing(true);
    };

    const handleSave = async () => {
        if (!isAdmin) return;
        if (!formData.name || !formData.price) return;
        
        try {
            if (editingId) {
                await updateProduct(formData as Product);
            } else {
                await addProduct(formData as Product);
            }
            setIsEditing(false);
        } catch (e) {
            alert("Error saving product");
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isAdmin) return;
        if (e.target.files && e.target.files[0] && formData.id) {
            try {
                const stored = await uploadProductImage(e.target.files[0], formData.id);
                setFormData({ ...formData, image: stored.data, imageId: stored.id });
            } catch (err) {
                console.error(err);
                alert("Failed to upload image");
            }
        }
    };

    const filtered = products.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()));

    return (
        <div className="p-6 relative min-h-full">
            {/* Header & Actions */}
            <div className="flex justify-between items-center mb-6">
                <div className="relative w-64">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none" value={filter} onChange={e => setFilter(e.target.value)} />
                </div>
                {isAdmin && (
                    <button onClick={handleCreate} className="bg-brand-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-brand-700 shadow-sm transition">
                        <Plus size={18} /> Add Product
                    </button>
                )}
            </div>
            
            {/* Products Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase text-xs font-bold tracking-wider">
                            <tr>
                                <th className="p-4 w-20">Image</th>
                                <th className="p-4">Name</th>
                                <th className="p-4 hidden md:table-cell">Category</th>
                                <th className="p-4 text-center">Stock</th>
                                <th className="p-4">Price</th>
                                {isAdmin && <th className="p-4 text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map(p => (
                                <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="p-4">
                                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 relative">
                                            <img src={p.image} className="w-full h-full object-cover" alt={p.name} />
                                        </div>
                                    </td>
                                    <td className="p-4 font-bold text-gray-900">
                                        {p.name}
                                        <div className="text-xs text-gray-400 font-normal md:hidden">{p.category}</div>
                                    </td>
                                    <td className="p-4 text-gray-500 hidden md:table-cell">{p.category}</td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${p.stock <= 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                            {p.stock}
                                        </span>
                                    </td>
                                    <td className="p-4 font-bold text-brand-600">{p.price} <span className="text-[10px] text-gray-400">EGP</span></td>
                                    {isAdmin && (
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEdit(p)} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition"><Edit2 size={16} /></button>
                                                <button onClick={() => { if(confirm('Delete product?')) deleteProduct(p.id) }} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* EDIT COMPACT MODAL */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
                        
                        {/* Modal Header */}
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-gray-800">{editingId ? 'Edit Product' : 'New Product'}</h3>
                            <button onClick={() => setIsEditing(false)} className="p-1 hover:bg-gray-200 rounded-full text-gray-500 transition"><X size={20}/></button>
                        </div>

                        <div className="p-6 grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-6">
                            
                            {/* 1. Image Uploader (Compact) */}
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-28 h-28 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 relative overflow-hidden group cursor-pointer shadow-inner hover:border-brand-400 transition">
                                    {formData.image ? (
                                        <img src={formData.image} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                            <Camera size={24} />
                                            <span className="text-[10px] mt-1 font-medium">Add Photo</span>
                                        </div>
                                    )}
                                    
                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200">
                                        <Edit2 className="text-white" size={20} />
                                    </div>
                                    <input type="file" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                </div>
                                <p className="text-[10px] text-gray-400 text-center">Tap image to change</p>
                            </div>

                            {/* 2. Simple Fields */}
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name (English)</label>
                                    <input 
                                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition" 
                                        value={formData.name} 
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                        placeholder="Product Name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name (Arabic)</label>
                                    <input 
                                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-right focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition" 
                                        value={formData.nameAr || ''} 
                                        onChange={e => setFormData({...formData, nameAr: e.target.value})}
                                        placeholder="اسم المنتج"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price (EGP)</label>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                className="w-full pl-8 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition" 
                                                value={formData.price} 
                                                onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                                            />
                                            <span className="absolute left-3 top-2.5 text-gray-400 text-xs font-bold">EGP</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Stock</label>
                                        <input 
                                            type="number" 
                                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition" 
                                            value={formData.stock} 
                                            onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
                                        />
                                    </div>
                                </div>
                                <div>
                                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                                     <select 
                                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none" 
                                        value={formData.category} 
                                        onChange={e => setFormData({...formData, category: e.target.value})}
                                     >
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                     </select>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                            <button 
                                onClick={() => setIsEditing(false)} 
                                className="px-5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSave} 
                                className="px-6 py-2.5 bg-brand-600 text-white rounded-xl font-bold text-sm hover:bg-brand-700 shadow-lg shadow-brand-200 transition transform active:scale-95 flex items-center gap-2"
                            >
                                <Save size={16} /> Save Product
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const CategoriesView: React.FC = () => {
    const { categories, addCategory, deleteCategory, user } = useStore();
    const [newCat, setNewCat] = useState('');

    const isAdmin = user?.role === 'admin';

    const handleAdd = () => {
        if(newCat) { addCategory(newCat); setNewCat(''); }
    };

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-6">Categories Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(c => (
                    <div key={c} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center">
                        <span className="font-bold text-gray-700">{c}</span>
                        {isAdmin && (
                            <button onClick={() => { if(confirm('Delete Category?')) deleteCategory(c) }} className="text-red-400 hover:text-red-600 p-2">
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                ))}
                
                {isAdmin ? (
                    <div className="bg-gray-50 p-4 rounded-xl border-2 border-dashed border-gray-300 flex items-center gap-2">
                        <input 
                            type="text" 
                            placeholder="New Category Name" 
                            className="flex-1 bg-transparent outline-none text-sm"
                            value={newCat} onChange={e => setNewCat(e.target.value)}
                        />
                        <button onClick={handleAdd} className="bg-brand-600 text-white p-2 rounded-lg hover:bg-brand-700"><Plus size={16} /></button>
                    </div>
                ) : (
                    <div className="p-4 text-center text-gray-400 text-sm italic col-span-full border-2 border-dashed border-gray-200 rounded-xl">
                        Only Admins can modify categories. Staff has view-only access.
                    </div>
                )}
            </div>
        </div>
    );
};

const SettingsView: React.FC = () => {
    const { settings, updateSettings, user, resetSystem, exportSystemData, importSystemData } = useStore();
    const [activeTab, setActiveTab] = useState<'GENERAL' | 'SHIPPING' | 'NOTIFICATIONS' | 'SECURITY' | 'DATA'>('GENERAL');

    if (user?.role !== 'admin') return <div className="p-6">Access Denied</div>;

    const renderTabContent = () => {
        switch(activeTab) {
            case 'GENERAL': return (
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Brand Name</label>
                        <input type="text" value={settings.general.brandName} 
                            onChange={e => updateSettings({...settings, general: {...settings.general, brandName: e.target.value}})}
                            className="w-full p-3 border border-gray-300 rounded-xl"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Currency</label>
                        <select value={settings.general.currency} 
                             onChange={e => updateSettings({...settings, general: {...settings.general, currency: e.target.value}})}
                             className="w-full p-3 border border-gray-300 rounded-xl"
                        >
                            <option value="EGP">EGP - Egyptian Pound</option>
                            <option value="USD">USD - US Dollar</option>
                            <option value="SAR">SAR - Saudi Riyal</option>
                        </select>
                    </div>
                </div>
            );
            case 'SHIPPING': return (
                <div className="space-y-6">
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Flat Rate Delivery Fee</label>
                        <input type="number" value={settings.shipping.flatRate} 
                            onChange={e => updateSettings({...settings, shipping: {...settings.shipping, flatRate: Number(e.target.value)}})}
                            className="w-full p-3 border border-gray-300 rounded-xl"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Free Shipping Threshold</label>
                        <input type="number" value={settings.shipping.freeShippingThreshold} 
                            onChange={e => updateSettings({...settings, shipping: {...settings.shipping, freeShippingThreshold: Number(e.target.value)}})}
                            className="w-full p-3 border border-gray-300 rounded-xl"
                        />
                    </div>
                </div>
            );
            case 'NOTIFICATIONS': return (
                 <div className="space-y-6">
                    <div className="flex justify-between items-center p-4 border border-gray-200 rounded-xl">
                        <span>Enable WhatsApp Alerts</span>
                        <input type="checkbox" checked={settings.notifications.enableWhatsApp}
                           onChange={e => updateSettings({...settings, notifications: {...settings.notifications, enableWhatsApp: e.target.checked}})} 
                           className="w-5 h-5 accent-brand-600"
                        />
                    </div>
                    <div className="flex justify-between items-center p-4 border border-gray-200 rounded-xl">
                        <span>Enable Push Notifications</span>
                        <input type="checkbox" checked={settings.notifications.enablePush}
                           onChange={e => updateSettings({...settings, notifications: {...settings.notifications, enablePush: e.target.checked}})} 
                           className="w-5 h-5 accent-brand-600"
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Admin Contacts for Alerts</label>
                         {settings.notifications.admins.map((admin, idx) => (
                                 <div key={idx} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl mb-2">
                                     <div>
                                         <p className="font-bold text-sm">{admin.name}</p>
                                         <p className="text-xs text-gray-500">{admin.phone} • {admin.language.toUpperCase()}</p>
                                     </div>
                                 </div>
                             ))}
                     </div>
                 </div>
            );
            case 'SECURITY': return (
                <div className="space-y-6">
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Session Timeout (Minutes)</label>
                        <input type="number" value={settings.security.sessionTimeout} 
                            onChange={e => updateSettings({...settings, security: {...settings.security, sessionTimeout: Number(e.target.value)}})}
                            className="w-full p-3 border border-gray-300 rounded-xl"
                        />
                    </div>
                    <div className="p-4 bg-yellow-50 text-yellow-800 rounded-xl text-sm">
                        Ensure all staff accounts have strong passwords.
                    </div>
                </div>
            );
            case 'DATA': return (
                <div className="space-y-6">
                    <button onClick={exportSystemData} className="w-full p-4 border border-gray-300 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50">
                        <Download size={20}/> Export System Backup
                    </button>
                    <button onClick={resetSystem} className="w-full p-4 bg-red-50 text-red-600 border border-red-100 rounded-xl flex items-center justify-center gap-2 hover:bg-red-100">
                        <Trash2 size={20}/> Factory Reset System
                    </button>
                </div>
            );
        }
    };

    return (
        <div className="p-6 h-full flex flex-col">
            <h2 className="text-2xl font-bold mb-6">Settings</h2>
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 flex overflow-hidden">
                <div className="w-48 bg-gray-50 border-r border-gray-100 p-2 space-y-1">
                    {(['GENERAL', 'SHIPPING', 'NOTIFICATIONS', 'SECURITY', 'DATA'] as const).map(tab => (
                        <button key={tab} 
                            onClick={() => setActiveTab(tab)}
                            className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold ${activeTab === tab ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="flex-1 p-8 overflow-y-auto">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};

const NotificationsView: React.FC = () => {
    const { systemNotifications, markNotificationRead, deleteSystemNotification, clearAllNotifications, settings, updateSettings, user } = useStore();
    const [filter, setFilter] = useState<'ALL' | NotificationType>('ALL');

    const filtered = systemNotifications.filter(n => filter === 'ALL' || n.type === filter);
    const isRead = (n: any) => n.readBy?.includes(user?.id || '');

    const getIcon = (type: NotificationType) => {
        switch(type) {
            case 'ORDER': return <Package size={18} className="text-blue-500" />;
            case 'STOCK': return <AlertTriangle size={18} className="text-orange-500" />;
            case 'AI': return <Brain size={18} className="text-purple-500" />;
            case 'SYSTEM': return <Info size={18} className="text-gray-500" />;
            default: return <Bell size={18} />;
        }
    };

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
                    <p className="text-sm text-gray-500">System alerts and updates.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => clearAllNotifications()}
                        className="bg-brand-50 text-brand-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-brand-100"
                    >
                        Mark All Read
                    </button>
                </div>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                 {(['ALL', 'ORDER', 'STOCK', 'AI', 'SYSTEM'] as const).map(type => (
                     <button
                        key={type}
                        onClick={() => setFilter(type)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition ${filter === type ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
                     >
                         {type}
                     </button>
                 ))}
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
                {filtered.length === 0 ? (
                    <div className="text-center py-20 opacity-50">
                        <Bell size={48} className="mx-auto mb-4 text-gray-300"/>
                        <p>No notifications found</p>
                    </div>
                ) : (
                    filtered.map(n => (
                        <div 
                            key={n.id} 
                            onClick={() => markNotificationRead(n.id)}
                            className={`bg-white p-4 rounded-xl border transition hover:shadow-md cursor-pointer flex gap-4 ${
                                isRead(n) ? 'border-gray-100 opacity-60' : 'border-brand-100 bg-brand-50/10'
                            }`}
                        >
                             <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                 isRead(n) ? 'bg-gray-100 text-gray-400' : 'bg-white shadow-sm'
                             }`}>
                                 {getIcon(n.type)}
                             </div>
                             <div className="flex-1">
                                 <div className="flex justify-between items-start">
                                     <h4 className={`text-sm ${isRead(n) ? 'font-medium text-gray-700' : 'font-bold text-gray-900'}`}>{n.title}</h4>
                                     <span className="text-[10px] text-gray-400">{new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                 </div>
                                 <p className="text-xs text-gray-500 mt-1 line-clamp-2">{n.message}</p>
                             </div>
                             {user?.role === 'admin' && (
                                 <button 
                                    onClick={(e) => { e.stopPropagation(); deleteSystemNotification(n.id); }}
                                    className="text-gray-300 hover:text-red-500 self-center p-2"
                                 >
                                     <Trash2 size={16} />
                                 </button>
                             )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const OrdersView: React.FC = () => {
  const { orders, updateOrderStatus } = useStore();
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const filteredOrders = useMemo(() => {
    return filterStatus === 'All' ? orders : orders.filter(o => o.status === filterStatus);
  }, [orders, filterStatus]);

  const statusColors: Record<string, string> = {
     'Processing': 'bg-yellow-100 text-yellow-800',
     'Out for Delivery': 'bg-blue-100 text-blue-800',
     'Delivered': 'bg-green-100 text-green-800',
     'Cancelled': 'bg-red-100 text-red-800'
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-white border border-gray-200 py-2 px-4 rounded-lg text-sm font-medium">
             <option value="All">All Status</option>
             <option value="Processing">Processing</option>
             <option value="Out for Delivery">Out for Delivery</option>
             <option value="Delivered">Delivered</option>
          </select>
      </div>

      <div className="space-y-3">
         {filteredOrders.map(order => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div 
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                    onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-brand-50 text-brand-700 rounded-lg flex items-center justify-center font-bold text-sm">#{order.id}</div>
                        <div>
                            <p className="font-bold text-gray-900">{order.customerName}</p>
                            <p className="text-xs text-gray-500">{new Date(order.date).toLocaleDateString()} • {order.items.length} Items</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="font-bold text-brand-600">{order.total} EGP</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[order.status]}`}>{order.status}</span>
                        {expandedOrderId === order.id ? <ChevronUp size={20} className="text-gray-400"/> : <ChevronDown size={20} className="text-gray-400"/>}
                    </div>
                </div>

                {expandedOrderId === order.id && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50/30">
                        {/* Compact Grid for Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="bg-white p-3 rounded-lg border border-gray-100">
                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1"><UserIcon size={12}/> Customer</h4>
                                <p className="font-bold text-gray-900">{order.customerName}</p>
                                <p className="text-sm text-gray-600 font-mono mt-1">{order.customerPhone}</p>
                                <button className="mt-2 text-xs bg-green-50 text-green-700 px-2 py-1 rounded flex items-center gap-1 hover:bg-green-100 transition w-full justify-center">
                                    <MessageCircle size={12}/> WhatsApp
                                </button>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-gray-100">
                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1"><MapPin size={12}/> Delivery Address</h4>
                                {/* Ensure we show the persistent Delivery Location data */}
                                <div className="text-sm text-gray-800">
                                    {order.deliveryLocation ? (
                                        <>
                                           <p className="font-bold">{order.deliveryLocation.city}, {order.deliveryLocation.governorate}</p>
                                           <p className="text-gray-600 leading-snug mt-1">{order.deliveryLocation.address}</p>
                                           {order.deliveryLocation.notes && (
                                               <p className="mt-2 text-xs bg-yellow-50 text-yellow-800 p-1.5 rounded border border-yellow-100">
                                                   Note: {order.deliveryLocation.notes}
                                               </p>
                                           )}
                                           <p className="text-[10px] text-gray-400 mt-1">
                                                Receiver: {order.deliveryLocation.snapshotName || order.customerName} • {order.deliveryLocation.snapshotPhone || order.customerPhone}
                                           </p>
                                        </>
                                    ) : (
                                        <p>{order.address}</p>
                                    )}
                                </div>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-gray-100 flex flex-col justify-between">
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Order Status</h4>
                                    <select 
                                        value={order.status} 
                                        onClick={e => e.stopPropagation()}
                                        onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-sm font-bold"
                                    >
                                        <option value="Processing">Processing</option>
                                        <option value="Out for Delivery">Out for Delivery</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div className="flex justify-between items-end mt-2 pt-2 border-t border-gray-50">
                                     <span className="text-xs text-gray-400">Delivery Fee</span>
                                     <span className="text-sm font-bold">{order.deliveryFee} EGP</span>
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <table className="w-full text-sm bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                <tr>
                                    <th className="p-2 text-left">Item</th>
                                    <th className="p-2 text-center">Qty</th>
                                    <th className="p-2 text-right">Price</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {order.items.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="p-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded bg-gray-100 overflow-hidden"><img src={item.image} className="w-full h-full object-cover"/></div>
                                                <span>{item.name}</span>
                                            </div>
                                            {item.selectedColor && <span className="text-xs text-gray-400 ml-8">Color: {item.selectedColor}</span>}
                                        </td>
                                        <td className="p-2 text-center font-bold">{item.quantity}</td>
                                        <td className="p-2 text-right text-gray-600">{item.price * item.quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
         ))}
      </div>
    </div>
  );
};

const DashboardView: React.FC = () => {
    const { orders, products, users } = useStore();
    
    // Simple Metrics
    const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
    const lowStock = products.filter(p => p.stock <= 5).length;
    
    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Overview</h2>
            
            <SystemHealth />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg"><DollarSign size={20}/></div>
                        <span className="text-xs font-bold text-gray-400 uppercase">Total Sales</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{totalSales.toLocaleString()} EGP</p>
                </div>
                 <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><ShoppingCart size={20}/></div>
                        <span className="text-xs font-bold text-gray-400 uppercase">Orders</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
                </div>
                 <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Users size={20}/></div>
                        <span className="text-xs font-bold text-gray-400 uppercase">Customers</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{users.filter(u => u.role === 'customer').length}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><AlertTriangle size={18} className="text-red-500"/> Low Stock Alerts</h3>
                    <div className="space-y-3">
                        {products.filter(p => p.stock <= 5).slice(0, 5).map(p => (
                            <div key={p.id} className="flex justify-between items-center p-3 bg-red-50 rounded-xl border border-red-100">
                                <span className="text-sm font-medium text-red-900">{p.name}</span>
                                <span className="text-xs font-bold bg-white px-2 py-1 rounded text-red-600">{p.stock} left</span>
                            </div>
                        ))}
                        {lowStock === 0 && <p className="text-gray-400 text-sm">Inventory looks healthy.</p>}
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {orders.slice(0, 5).map(o => (
                            <div key={o.id} className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">New order from {o.customerName}</p>
                                    <p className="text-xs text-gray-400">{new Date(o.date).toLocaleString()}</p>
                                </div>
                                <span className="text-sm font-bold">{o.total} EGP</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- MAIN LAYOUT ---

export const Admin: React.FC<AdminProps> = ({ onBack }) => {
    const { user, systemNotifications } = useStore();
    const [activeView, setActiveView] = useState<View>('dashboard'); 
    
    // Count unread notifications for current user
    const unreadCount = systemNotifications.filter(n => !n.readBy?.includes(user?.id || '')).length;

    if (!user || (user.role !== 'admin' && user.role !== 'staff')) return <div>Access Denied</div>;

    const isAdmin = user.role === 'admin';

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'orders', label: 'Orders', icon: ShoppingCart },
        { id: 'products', label: 'Products', icon: Package },
        { id: 'categories', label: 'Categories', icon: Grid },
        { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
        ...(isAdmin ? [{ id: 'settings', label: 'Settings', icon: Settings }] : []),
    ];

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-gray-900">
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
                <div className="p-6 border-b border-gray-100">
                     <div className="flex items-center gap-2 font-bold text-xl text-brand-600">
                         <div className="w-8 h-8 bg-brand-600 text-white flex items-center justify-center rounded-lg">HP</div>
                         {isAdmin ? 'Admin' : 'Staff'} Panel
                     </div>
                </div>
                <nav className="p-4 space-y-1 flex-1">
                   {menuItems.map((item) => (
                      <button key={item.id} onClick={() => setActiveView(item.id as View)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${activeView === item.id ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                         <div className="relative">
                            <item.icon size={18} />
                            {item.badge ? (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center">
                                    {item.badge}
                                </span>
                            ) : null}
                         </div>
                         {item.label}
                      </button>
                   ))}
                </nav>
                <div className="p-4 border-t border-gray-100">
                   <div className="flex items-center gap-3 mb-4 px-2">
                       <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">{user.name.charAt(0)}</div>
                       <div className="overflow-hidden">
                           <p className="text-sm font-bold truncate">{user.name}</p>
                           <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                       </div>
                   </div>
                   <button onClick={onBack} className="w-full flex items-center gap-2 text-red-500 text-sm font-bold hover:bg-red-50 p-2 rounded-lg justify-center"><LogOut size={16}/> Exit to Shop</button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Mobile Header */}
                <header className="md:hidden bg-white h-16 border-b border-gray-200 flex items-center justify-between px-4">
                    <span className="font-bold text-lg">{isAdmin ? 'Admin' : 'Staff'} Panel</span>
                    <button onClick={onBack}><LogOut size={20}/></button>
                </header>
                
                <div className="flex-1 overflow-y-auto bg-gray-50">
                    {activeView === 'dashboard' && <DashboardView />}
                    {activeView === 'products' && <ProductsView />}
                    {activeView === 'orders' && <OrdersView />}
                    {activeView === 'categories' && <CategoriesView />}
                    {activeView === 'notifications' && <NotificationsView />}
                    {activeView === 'settings' && isAdmin && <SettingsView />}
                </div>
            </main>
        </div>
    );
};
