
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Category, Product, Coupon, AIRecommendation, PurchaseOrder, Supplier } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, LineChart, Line, AreaChart, Area } from 'recharts';
import { 
  LayoutDashboard, Package, Users, ShoppingCart, Settings, Tag, 
  LogOut, Plus, Search, Trash2, Edit2, Download, Upload, 
  RefreshCw, DollarSign, Truck, CreditCard, TrendingUp, TrendingDown, 
  Image as ImageIcon, FileImage, Brain, AlertTriangle, Zap, MessageCircle,
  Factory, CheckCircle, XCircle, Send, HardDrive, AlertOctagon, Bell, Mail, Smartphone
} from 'lucide-react';
import { SystemHealth } from '../components/SystemHealth';

interface AdminProps {
  onBack: () => void;
}

type View = 'dashboard' | 'products' | 'orders' | 'users' | 'coupons' | 'settings' | 'assistant' | 'supply_chain' | 'notifications';

// --- AI Logic Helper ---
const generateInsights = (products: Product[], orders: any[]): AIRecommendation[] => {
  const recommendations: AIRecommendation[] = [];

  // 1. Calculate Velocity (Sales per day over last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const productSales: Record<string, number> = {};
  
  orders.forEach(order => {
    if (new Date(order.date) >= thirtyDaysAgo) {
      order.items.forEach((item: any) => {
        productSales[item.id] = (productSales[item.id] || 0) + item.quantity;
      });
    }
  });

  products.forEach(product => {
    const salesLast30Days = productSales[product.id] || 0;
    const velocity = salesLast30Days / 30; // Daily sales
    const daysRemaining = velocity > 0 ? product.stock / velocity : 999;

    // Logic A: Urgent Reorder (Stock < 2 days or absolute stock < 5 for active items)
    if ((daysRemaining < 2 || product.stock <= 5) && velocity > 0.1) {
      const reorderQty = Math.ceil(velocity * 30); // Suggest 30 days stock
      recommendations.push({
        id: `rec_${product.id}_urgent`,
        type: 'REORDER',
        severity: 'URGENT',
        productId: product.id,
        productName: product.name,
        currentStock: product.stock,
        velocity: Number(velocity.toFixed(2)),
        daysRemaining: Number(daysRemaining.toFixed(1)),
        suggestion: {
          action: 'Restock Immediate',
          value: reorderQty,
          rationaleEn: `Critical Low Stock. Will run out in ~${(daysRemaining * 24).toFixed(0)} hours based on sales.`,
          rationaleAr: `مخزون حرج. سينفذ خلال ${(daysRemaining * 24).toFixed(0)} ساعة بناءً على المبيعات.`
        }
      });
    }
    // Logic B: Warning (Stock < 7 days)
    else if (daysRemaining < 7 && velocity > 0.1) {
      recommendations.push({
        id: `rec_${product.id}_warn`,
        type: 'REORDER',
        severity: 'WARNING',
        productId: product.id,
        productName: product.name,
        currentStock: product.stock,
        velocity: Number(velocity.toFixed(2)),
        daysRemaining: Number(daysRemaining.toFixed(1)),
        suggestion: {
          action: 'Plan Restock',
          value: Math.ceil(velocity * 14),
          rationaleEn: `Stock running low. Coverage for ${daysRemaining.toFixed(0)} days remaining.`,
          rationaleAr: `المخزون ينخفض. يكفي لمدة ${daysRemaining.toFixed(0)} يوم فقط.`
        }
      });
    }
    // Logic C: Dead Stock Opportunity (Days Remaining > 90 days & Stock > 20 units)
    else if (daysRemaining > 90 && product.stock > 20) {
      recommendations.push({
        id: `rec_${product.id}_deal`,
        type: 'DISCOUNT',
        severity: 'OPPORTUNITY',
        productId: product.id,
        productName: product.name,
        currentStock: product.stock,
        velocity: Number(velocity.toFixed(2)),
        daysRemaining: 999, // effectively infinite
        suggestion: {
          action: 'Flash Sale',
          value: '20%',
          rationaleEn: `Slow moving item. Apply 20% discount to free up capital.`,
          rationaleAr: `حركة بطيئة. خصم 20% قد يساعد في تحريك المخزون.`
        }
      });
    }
  });

  return recommendations.sort((a, b) => {
    const severityOrder = { URGENT: 0, WARNING: 1, OPPORTUNITY: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
};

// --- Sub-Components ---

const NotificationsView: React.FC = () => {
  const { settings, updateSettings, notificationLogs, sendTestNotification } = useStore();
  const [activeTab, setActiveTab] = useState<'config' | 'logs'>('config');

  const toggleChannel = (channel: 'enableWhatsApp' | 'enablePush' | 'enableEmailDigest') => {
     updateSettings({
       ...settings,
       notifications: {
         ...settings.notifications,
         [channel]: !settings.notifications[channel]
       }
     });
  };

  const updateThreshold = (val: number) => {
     updateSettings({
       ...settings,
       notifications: {
         ...settings.notifications,
         orderAmountThreshold: val
       }
     });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
       <div className="flex justify-between items-center mb-6">
         <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
           <Bell className="text-brand-600" /> Notification Center
         </h2>
         <div className="flex bg-white rounded-lg p-1 border border-gray-200">
            <button 
              onClick={() => setActiveTab('config')}
              className={`px-4 py-2 rounded-md text-sm font-bold transition ${activeTab === 'config' ? 'bg-brand-50 text-brand-700' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Settings
            </button>
            <button 
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-2 rounded-md text-sm font-bold transition ${activeTab === 'logs' ? 'bg-brand-50 text-brand-700' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Logs
            </button>
         </div>
       </div>

       {activeTab === 'config' ? (
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Col: Toggles */}
            <div className="lg:col-span-2 space-y-6">
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-lg mb-4">Global Channels</h3>
                  <div className="space-y-4">
                     <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
                        <div className="flex items-center gap-3">
                           <div className="bg-green-100 p-2 rounded-full text-green-600"><MessageCircle size={20} /></div>
                           <div>
                              <h4 className="font-bold text-gray-900">WhatsApp Alerts</h4>
                              <p className="text-xs text-gray-500">Real-time order messages via Twilio.</p>
                           </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={settings.notifications?.enableWhatsApp} onChange={() => toggleChannel('enableWhatsApp')} className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                        </label>
                     </div>

                     <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-3">
                           <div className="bg-blue-100 p-2 rounded-full text-blue-600"><Smartphone size={20} /></div>
                           <div>
                              <h4 className="font-bold text-gray-900">Push Notifications</h4>
                              <p className="text-xs text-gray-500">Mobile app push via Firebase (FCM).</p>
                           </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={settings.notifications?.enablePush} onChange={() => toggleChannel('enablePush')} className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                        </label>
                     </div>

                     <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 opacity-75">
                        <div className="flex items-center gap-3">
                           <div className="bg-gray-200 p-2 rounded-full text-gray-600"><Mail size={20} /></div>
                           <div>
                              <h4 className="font-bold text-gray-900">Daily Email Digest</h4>
                              <p className="text-xs text-gray-500">Summary of daily sales at 10 PM.</p>
                           </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={settings.notifications?.enableEmailDigest} onChange={() => toggleChannel('enableEmailDigest')} className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                        </label>
                     </div>
                  </div>
               </div>

               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-lg mb-4">Rules & Thresholds</h3>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Order Amount</label>
                     <div className="flex items-center gap-4">
                        <input 
                           type="number" 
                           value={settings.notifications?.orderAmountThreshold} 
                           onChange={(e) => updateThreshold(Number(e.target.value))}
                           className="w-32 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                        />
                        <p className="text-xs text-gray-500">Only notify admins if order total is greater than this amount. Set to 0 to notify for all orders.</p>
                     </div>
                  </div>
               </div>
               
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-lg mb-4">Testing</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">Send a test notification to verify WhatsApp templates and logging.</p>
                    <button 
                      onClick={sendTestNotification}
                      className="px-4 py-2 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-700 flex items-center gap-2"
                    >
                       <Send size={16} /> Send Test
                    </button>
                  </div>
               </div>
            </div>

            {/* Right Col: Admin List */}
            <div className="space-y-6">
               <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl text-white shadow-lg">
                  <h3 className="font-bold text-lg mb-4">Active Admins</h3>
                  <div className="space-y-4">
                     {settings.notifications?.admins.map((admin, idx) => (
                        <div key={idx} className="bg-white/10 p-3 rounded-xl border border-white/10">
                           <div className="flex justify-between items-start mb-1">
                              <span className="font-bold text-sm">{admin.name}</span>
                              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded text-white font-mono">{admin.language.toUpperCase()}</span>
                           </div>
                           <p className="text-xs text-gray-400 mb-2">{admin.phone}</p>
                           <div className="flex gap-2">
                              {admin.channels.map(ch => (
                                 <span key={ch} className="text-[10px] font-bold text-brand-200 bg-brand-900/50 px-1.5 py-0.5 rounded">{ch}</span>
                              ))}
                           </div>
                        </div>
                     ))}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-4">Admin list is managed in system config.</p>
               </div>
            </div>
         </div>
       ) : (
         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left text-sm">
               <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                     <th className="p-4 font-medium text-gray-500">Time</th>
                     <th className="p-4 font-medium text-gray-500">Recipient</th>
                     <th className="p-4 font-medium text-gray-500">Order ID</th>
                     <th className="p-4 font-medium text-gray-500">Channel</th>
                     <th className="p-4 font-medium text-gray-500">Status</th>
                     <th className="p-4 font-medium text-gray-500">Message Preview</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {notificationLogs.map(log => (
                     <tr key={log.id} className="hover:bg-gray-50">
                        <td className="p-4 text-gray-500 whitespace-nowrap">{new Date(log.timestamp).toLocaleTimeString()}</td>
                        <td className="p-4 font-bold text-gray-900">{log.recipient}</td>
                        <td className="p-4 font-mono text-xs">{log.orderId}</td>
                        <td className="p-4">
                           {log.channel === 'WHATSAPP' && <span className="flex items-center gap-1 text-green-600 font-bold text-xs"><MessageCircle size={14} /> WhatsApp</span>}
                           {log.channel === 'IN_APP' && <span className="flex items-center gap-1 text-blue-600 font-bold text-xs"><Bell size={14} /> In-App</span>}
                        </td>
                        <td className="p-4">
                           <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">{log.status}</span>
                        </td>
                        <td className="p-4 text-gray-600 max-w-xs truncate" title={log.messageBody}>
                           {log.messageHeader} - {log.messageBody.substring(0, 30)}...
                        </td>
                     </tr>
                  ))}
                  {notificationLogs.length === 0 && (
                     <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-400">No notification logs found.</td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
       )}
    </div>
  );
};

const SupplyChainView: React.FC = () => {
  const { products } = useStore();
  
  // Mock Suppliers
  const [suppliers] = useState<Supplier[]>([
    { id: 'sup-001', name: 'Al-Amal Plastics', contactPhone: '01012345678', email: 'orders@alamal.com', leadTimeDays: 3 },
    { id: 'sup-002', name: 'Cairo Packaging Co.', contactPhone: '01234567890', email: 'sales@cairopack.com', leadTimeDays: 5 }
  ]);

  // Mock POs
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([
    {
      id: 'PO-2024-001',
      supplierId: 'sup-001',
      supplierName: 'Al-Amal Plastics',
      status: 'draft',
      createdDate: new Date().toISOString(),
      items: [
        { productId: 'prod-cub-2025', productName: 'Cub 2025 (Blue Cups)', currentStock: 15, reorderQty: 500, cost: 4000 }
      ],
      totalCost: 4000
    },
     {
      id: 'PO-2024-002',
      supplierId: 'sup-002',
      supplierName: 'Cairo Packaging Co.',
      status: 'sent',
      createdDate: new Date(Date.now() - 86400000).toISOString(),
      items: [
        { productId: '2', productName: 'Luxury Gift Box', currentStock: 8, reorderQty: 200, cost: 12000 }
      ],
      totalCost: 12000
    }
  ]);

  // Mock Forecast Data
  const forecastData = [
    { day: 'Mon', actual: 120, predicted: 130 },
    { day: 'Tue', actual: 132, predicted: 125 },
    { day: 'Wed', actual: 101, predicted: 110 },
    { day: 'Thu', actual: 134, predicted: 140 },
    { day: 'Fri', actual: 190, predicted: 180 },
    { day: 'Sat', actual: 230, predicted: 210 },
    { day: 'Sun', actual: 210, predicted: 200 },
    { day: 'Next Mon', predicted: 140 },
    { day: 'Next Tue', predicted: 135 },
  ];

  const handleApprovePO = (id: string) => {
    setPurchaseOrders(prev => prev.map(po => 
      po.id === id ? { ...po, status: 'sent' } : po
    ));
    alert(`PO #${id} approved and sent to supplier via WhatsApp.`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in space-y-8">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
             <Factory className="text-brand-600" /> Supply Chain Autopilot
           </h2>
           <p className="text-gray-500 text-sm mt-1">Auto-generated purchase orders & demand forecasting.</p>
        </div>
        <button className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-brand-700">
          <Plus size={16} /> New PO
        </button>
      </div>

      {/* Forecasting Chart */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-blue-600" /> AI Demand Forecast
        </h3>
        <div className="h-64 w-full">
           <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData}>
                <defs>
                  <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d6336c" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#d6336c" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={12} tick={{fill: '#9ca3af'}} />
                <YAxis axisLine={false} tickLine={false} fontSize={12} tick={{fill: '#9ca3af'}} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}} />
                <Legend />
                <Area type="monotone" dataKey="actual" stroke="#1f2937" fill="transparent" strokeWidth={3} name="Actual Sales" />
                <Area type="monotone" dataKey="predicted" stroke="#d6336c" fill="url(#colorPred)" strokeWidth={3} strokeDasharray="5 5" name="AI Prediction" />
              </AreaChart>
           </ResponsiveContainer>
        </div>
      </div>

      {/* Draft POs */}
      <div>
        <h3 className="font-bold text-lg text-gray-900 mb-4">Pending Approvals</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
           {purchaseOrders.filter(po => po.status === 'draft').map(po => (
             <div key={po.id} className="bg-white p-5 rounded-2xl border border-orange-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-orange-100 text-orange-700 text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase">
                   Action Required
                </div>
                <div className="flex items-center justify-between mb-3">
                   <h4 className="font-bold text-gray-900">{po.id}</h4>
                   <span className="text-xs text-gray-500">{new Date(po.createdDate).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-gray-600 mb-1"><span className="font-bold">Supplier:</span> {po.supplierName}</p>
                <p className="text-sm text-gray-600 mb-3"><span className="font-bold">Total:</span> {po.totalCost} EGP</p>
                
                <div className="bg-gray-50 p-3 rounded-xl mb-4">
                   <p className="text-xs font-bold text-gray-500 uppercase mb-1">Items to Reorder</p>
                   {po.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                         <span>{item.productName}</span>
                         <span className="font-bold">x{item.reorderQty}</span>
                      </div>
                   ))}
                </div>

                <div className="flex gap-2">
                   <button 
                    onClick={() => handleApprovePO(po.id)}
                    className="flex-1 bg-brand-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-brand-700 flex items-center justify-center gap-2"
                   >
                     <Send size={14} /> Approve & Send
                   </button>
                   <button className="px-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                     <Trash2 size={18} />
                   </button>
                </div>
             </div>
           ))}
           {purchaseOrders.filter(po => po.status === 'draft').length === 0 && (
             <div className="col-span-full p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <CheckCircle className="mx-auto text-green-400 mb-2" size={32} />
                <p className="text-gray-500">No pending purchase orders.</p>
             </div>
           )}
        </div>
      </div>

      {/* Order History Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
         <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-900">Order History</h3>
            <button className="text-brand-600 text-sm font-bold">View All</button>
         </div>
         <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                 <th className="p-4 font-medium text-gray-500">PO ID</th>
                 <th className="p-4 font-medium text-gray-500">Supplier</th>
                 <th className="p-4 font-medium text-gray-500">Date</th>
                 <th className="p-4 font-medium text-gray-500">Status</th>
                 <th className="p-4 font-medium text-gray-500 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
               {purchaseOrders.filter(po => po.status !== 'draft').map(po => (
                 <tr key={po.id} className="hover:bg-gray-50">
                    <td className="p-4 font-bold text-gray-900">{po.id}</td>
                    <td className="p-4">{po.supplierName}</td>
                    <td className="p-4 text-gray-500">{new Date(po.createdDate).toLocaleDateString()}</td>
                    <td className="p-4">
                       <span className={`px-2 py-1 rounded text-xs font-bold ${
                         po.status === 'sent' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                       }`}>
                         {po.status.toUpperCase()}
                       </span>
                    </td>
                    <td className="p-4 text-right font-medium">{po.totalCost} EGP</td>
                 </tr>
               ))}
            </tbody>
         </table>
      </div>

    </div>
  );
};

const AIAssistantView: React.FC = () => {
  const { products, orders, updateProduct, bulkUpdatePrices } = useStore();
  const recommendations = useMemo(() => generateInsights(products, orders), [products, orders]);
  
  const urgentCount = recommendations.filter(r => r.severity === 'URGENT').length;
  const opportunityCount = recommendations.filter(r => r.severity === 'OPPORTUNITY').length;

  const handleApplyAction = (rec: AIRecommendation) => {
    if (rec.type === 'DISCOUNT') {
      const discount = parseInt(rec.suggestion.value as string);
      const product = products.find(p => p.id === rec.productId);
      if (product) {
        const newPrice = Math.floor(product.price * (1 - discount/100));
        updateProduct({ ...product, price: newPrice });
        alert(`Applied ${discount}% discount to ${product.name}. New Price: ${newPrice}`);
      }
    } else if (rec.type === 'REORDER') {
      // In a real app, this would generate a PO PDF or email supplier
      const message = `
        SUPPLIER ORDER REQUEST
        ----------------------
        Product: ${rec.productName}
        Qty Needed: ${rec.suggestion.value}
        Urgency: ${rec.severity}
      `;
      alert("Reorder Request Generated:\n" + message);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
            <Brain className="text-brand-600" /> Smart Assistant
          </h2>
          <p className="text-gray-500 text-sm mt-1">AI-driven inventory analysis & growth suggestions</p>
        </div>
        
        <div className="flex gap-4">
           <div className="bg-red-50 px-4 py-2 rounded-xl border border-red-100 flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-full text-red-600"><AlertTriangle size={16} /></div>
              <div>
                <span className="block text-xl font-bold text-red-700 leading-none">{urgentCount}</span>
                <span className="text-[10px] text-red-400 uppercase font-bold">Critical</span>
              </div>
           </div>
           <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full text-blue-600"><Zap size={16} /></div>
              <div>
                <span className="block text-xl font-bold text-blue-700 leading-none">{opportunityCount}</span>
                <span className="text-[10px] text-blue-400 uppercase font-bold">Opportunities</span>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Alerts Feed */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-bold text-gray-800 text-lg">Insights Feed</h3>
          
          {recommendations.length === 0 && (
            <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center">
               <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Zap size={32} />
               </div>
               <h4 className="font-bold text-gray-900">All Systems Optimal</h4>
               <p className="text-gray-500 text-sm">Inventory levels are healthy and prices are competitive.</p>
            </div>
          )}

          {recommendations.map(rec => (
            <div 
              key={rec.id} 
              className={`p-5 rounded-2xl border shadow-sm relative overflow-hidden transition hover:shadow-md ${
                rec.severity === 'URGENT' ? 'bg-white border-red-100 border-l-4 border-l-red-500' : 
                rec.severity === 'WARNING' ? 'bg-white border-yellow-100 border-l-4 border-l-yellow-500' :
                'bg-white border-blue-100 border-l-4 border-l-blue-500'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                   <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        rec.severity === 'URGENT' ? 'bg-red-100 text-red-700' : 
                        rec.severity === 'WARNING' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {rec.severity}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">{rec.productId}</span>
                   </div>
                   <h4 className="font-bold text-gray-900 text-lg">{rec.productName}</h4>
                   <div className="flex gap-4 mt-2 text-sm text-gray-600">
                      <span>Current Stock: <b className="text-gray-900">{rec.currentStock}</b></span>
                      <span>Daily Sales: <b className="text-gray-900">{rec.velocity}</b>/day</span>
                   </div>
                   
                   <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex gap-2 mb-1">
                         <span className="text-xs font-bold text-gray-500 uppercase">EN:</span>
                         <p className="text-sm text-gray-700">{rec.suggestion.rationaleEn}</p>
                      </div>
                      <div className="flex gap-2">
                         <span className="text-xs font-bold text-gray-500 uppercase">AR:</span>
                         <p className="text-sm text-gray-700 font-sans" dir="rtl">{rec.suggestion.rationaleAr}</p>
                      </div>
                   </div>
                </div>

                <div className="flex flex-col items-end gap-2 min-w-[120px] ml-4">
                   <div className="text-right">
                      <span className="block text-xs text-gray-400 uppercase font-bold">Suggestion</span>
                      <span className="block text-xl font-bold text-brand-600">
                        {rec.type === 'DISCOUNT' ? `${rec.suggestion.value} OFF` : `+${rec.suggestion.value} Units`}
                      </span>
                   </div>
                   <button 
                      onClick={() => handleApplyAction(rec)}
                      className={`mt-2 w-full py-2 px-3 rounded-lg text-xs font-bold text-white shadow-sm transition transform active:scale-95 ${
                         rec.type === 'DISCOUNT' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-900 hover:bg-black'
                      }`}
                   >
                      {rec.type === 'DISCOUNT' ? 'Apply Offer' : 'Create PO'}
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Alerts Config */}
        <div className="space-y-6">
           <div className="bg-gradient-to-br from-brand-900 to-brand-700 p-6 rounded-2xl shadow-lg text-white">
              <div className="flex items-start justify-between mb-4">
                 <div>
                   <h3 className="font-bold text-lg">Admin Alerts</h3>
                   <p className="text-brand-200 text-xs">Real-time notification service.</p>
                 </div>
                 <Bell className="text-brand-200" />
              </div>
              <div className="space-y-3">
                 <div className="flex items-center gap-3 bg-white/10 p-2 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center font-bold text-xs">WS</div>
                    <div>
                       <p className="text-xs font-bold">Walid El Sheikh</p>
                       <p className="text-[10px] text-brand-200">Arabic (WhatsApp)</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3 bg-white/10 p-2 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center font-bold text-xs">MS</div>
                    <div>
                       <p className="text-xs font-bold">Mahmoud Shehada</p>
                       <p className="text-[10px] text-brand-200">English (WhatsApp)</p>
                    </div>
                 </div>
              </div>
              <p className="text-[10px] text-brand-300 mt-4 opacity-80">
                Status: Online • Twilio Service Active
              </p>
           </div>
        </div>

      </div>
    </div>
  );
};

const DashboardView: React.FC = () => {
  const { orders } = useStore();
  
  // Financial Calculations
  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
  
  // Calculate total cost of goods sold (COGS)
  const totalCost = orders.reduce((acc, order) => {
    const orderCost = order.items.reduce((itemAcc, item) => {
      return itemAcc + ((item.costPrice || 0) * item.quantity);
    }, 0);
    return acc + orderCost;
  }, 0);

  const netProfit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0';

  const recentOrders = orders.slice(0, 5);

  // Chart Data - Simulating daily breakdown
  const chartData = [
    { name: 'Mon', Revenue: 4000, Profit: 2400 },
    { name: 'Tue', Revenue: 3000, Profit: 1398 },
    { name: 'Wed', Revenue: 2000, Profit: 980 },
    { name: 'Thu', Revenue: 2780, Profit: 1908 },
    { name: 'Fri', Revenue: 1890, Profit: 800 },
    { name: 'Sat', Revenue: 2390, Profit: 1800 },
    { name: 'Sun', Revenue: 3490, Profit: 2300 },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* SYSTEM HEALTH CHECK - NEW COMPONENT */}
      <SystemHealth />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Sales</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalRevenue.toLocaleString()} EGP</h3>
            </div>
            <div className="bg-brand-100 p-2 rounded-lg text-brand-600">
              <DollarSign size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Cost</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalCost.toLocaleString()} EGP</h3>
            </div>
            <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
              <TrendingDown size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Net Profit</p>
              <h3 className="text-2xl font-bold text-green-600 mt-1">{netProfit.toLocaleString()} EGP</h3>
            </div>
            <div className="bg-green-100 p-2 rounded-lg text-green-600">
              <TrendingUp size={24} />
            </div>
          </div>
           <p className="text-gray-400 text-xs mt-2">Margin: {profitMargin}%</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Orders</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{orders.length}</h3>
            </div>
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
              <ShoppingCart size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts & Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-96">
          <h3 className="font-bold text-gray-800 mb-4">Revenue vs Profit</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
              <YAxis axisLine={false} tickLine={false} fontSize={12} />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Legend />
              <Bar dataKey="Revenue" fill="var(--color-brand-200)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Profit" fill="var(--color-brand-600)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800">Recent Transactions</h3>
            <button className="text-brand-600 text-sm font-medium">View Orders</button>
          </div>
          <div className="space-y-4">
            {recentOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition border border-transparent hover:border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-50 rounded-full flex items-center justify-center text-brand-600 font-bold text-xs">
                    {order.customerName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{order.customerName}</p>
                    <p className="text-xs text-gray-500">#{order.id} • {new Date(order.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{order.total} EGP</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                    order.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>{order.status}</span>
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && <p className="text-gray-500 text-sm">No recent orders.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductsView: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, bulkUpdatePrices, uploadProductImage } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Bulk Update State
  const [bulkPercent, setBulkPercent] = useState(0);
  const [bulkCategory, setBulkCategory] = useState<string>('All');

  // Product Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    category: Category.PARTY_SUPPLIES,
    isCustomizable: false,
    stock: 0,
    price: 0,
    costPrice: 0,
    image: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (selectedFile) {
        // Fast preview for UI
        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    } else if (formData.image) {
      setPreviewUrl(formData.image);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile, formData.image]);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setPreviewUrl(product.image);
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({
      category: Category.PARTY_SUPPLIES,
      isCustomizable: false,
      stock: 10,
      price: 100,
      costPrice: 50,
      rating: 5,
      image: '',
      colors: []
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setShowModal(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let finalProduct = { ...formData } as Product;
      // Generate ID if new
      const productId = editingProduct ? editingProduct.id : `prod_${Date.now()}_${Math.random().toString(36).substr(2,5)}`;
      finalProduct.id = productId;
      
      // 1. Save Product Basic Info (Critical Path) - ATOMIC SAVE
      if (!finalProduct.image) {
          finalProduct.image = 'https://via.placeholder.com/400?text=No+Image'; 
      }

      if (editingProduct) {
        await updateProduct(finalProduct);
      } else {
        await addProduct(finalProduct);
      }

      // 2. Handle Image Upload (Secondary Path)
      if (selectedFile) {
         try {
            const uploadedImg = await uploadProductImage(selectedFile, productId);
            finalProduct.imageId = uploadedImg.id;
            const productToPersist = {
              ...finalProduct,
              image: uploadedImg.path 
            };
            await updateProduct(productToPersist);
         } catch (imgErr) {
            console.error("Image upload failed", imgErr);
            alert("Product saved successfully, but image upload failed.");
         }
      }

      setShowModal(false);
    } catch (error) {
      console.error("Failed to save product", error);
      alert("Failed to save product. Storage might be full.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Price', 'Cost Price', 'Category', 'Stock', 'Description'];
    const rows = products.map(p => [p.id, p.name, p.price, p.costPrice || 0, p.category, p.stock, `"${p.description}"`]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hamess_inventory.csv';
    a.click();
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full md:w-auto">
          <input
            type="text"
            placeholder="Search products..."
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
          <button onClick={handleExportCSV} className="px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center gap-2 text-sm whitespace-nowrap">
            <Download size={16} /> Report
          </button>
          <button onClick={() => setShowBulkModal(true)} className="px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center gap-2 text-sm whitespace-nowrap">
            <RefreshCw size={16} /> Bulk Price
          </button>
          <button onClick={handleAdd} className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 flex items-center gap-2 text-sm font-medium whitespace-nowrap">
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 font-medium text-gray-500">Product</th>
                <th className="p-4 font-medium text-gray-500">Category</th>
                <th className="p-4 font-medium text-gray-500">Price (Sell)</th>
                <th className="p-4 font-medium text-gray-500">Cost (Buy)</th>
                <th className="p-4 font-medium text-gray-500">Stock</th>
                <th className="p-4 font-medium text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-gray-50 group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 relative">
                        <img src={product.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                         <span className="font-medium text-gray-900 block">{product.name}</span>
                         {product.imagePath && <span className="text-[10px] text-gray-400 block max-w-[150px] truncate">{product.imagePath}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{product.category}</td>
                  <td className="p-4 font-medium">{product.price} EGP</td>
                  <td className="p-4 text-gray-500">{product.costPrice || '-'} EGP</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${product.stock < 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={() => handleEdit(product)} className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => deleteProduct(product.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 animate-slide-in">
            <h2 className="text-xl font-bold mb-4">{editingProduct ? 'Edit Product' : 'New Product'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input required type="text" className="w-full p-2 border rounded-lg" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              
              {/* Price & Cost Section */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Selling Price (EGP)</label>
                  <input required type="number" className="w-full p-2 border rounded-lg font-bold text-brand-600" value={formData.price || 0} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cost Price (EGP)</label>
                  <input type="number" className="w-full p-2 border rounded-lg text-gray-600" value={formData.costPrice || 0} onChange={e => setFormData({...formData, costPrice: Number(e.target.value)})} placeholder="For profit calc" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                  <input required type="number" className="w-full p-2 border rounded-lg" value={formData.stock || 0} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} />
                </div>
                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select className="w-full p-2 border rounded-lg" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as Category})}>
                    {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              
              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                
                <div className="space-y-4">
                  {/* Drag & Drop / Click Area */}
                  <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-brand-50 hover:border-brand-300 transition cursor-pointer group bg-gray-50">
                     <input 
                       type="file" 
                       accept="image/png, image/jpeg, image/webp" 
                       onChange={handleFileSelect} 
                       className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                     />
                     <div className="flex flex-col items-center justify-center text-gray-500 group-hover:text-brand-600">
                        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition">
                           <Upload size={20} className="text-brand-600" />
                        </div>
                        <span className="text-sm font-bold">Click to Upload Image</span>
                        <span className="text-xs text-gray-400 mt-1">JPG, PNG, WebP (Max 10MB)</span>
                     </div>
                  </div>

                  {/* Preview Area */}
                  {previewUrl && (
                    <div className="relative flex items-center gap-4 p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {selectedFile ? selectedFile.name : (formData.imagePath ? formData.imagePath.split('/').pop() : 'Current Image')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB (will compress)` : 'Stored in system'}
                        </p>
                        {selectedFile && (
                           <span className="inline-block mt-1 text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">New Upload</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea className="w-full p-2 border rounded-lg" rows={3} value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 border border-gray-200 rounded-lg text-gray-600 font-medium hover:bg-gray-50">Cancel</button>
                <button 
                  type="submit" 
                  disabled={isUploading}
                  className="flex-1 py-3 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-700 shadow-lg shadow-brand-200 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {isUploading ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Price Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-slide-in">
            <h2 className="text-xl font-bold mb-4">Bulk Price Update</h2>
            <p className="text-sm text-gray-500 mb-4">Adjust prices for all products or specific categories.</p>
            
            <div className="space-y-4">
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                 <select className="w-full p-2 border rounded-lg" value={bulkCategory} onChange={e => setBulkCategory(e.target.value)}>
                   <option value="All">All Categories</option>
                   {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Percentage Change (+/-)</label>
                 <input type="number" className="w-full p-2 border rounded-lg" value={bulkPercent} onChange={e => setBulkPercent(Number(e.target.value))} placeholder="e.g. 10 for +10%, -5 for -5%" />
              </div>
            </div>

            <div className="flex gap-3 pt-6">
              <button onClick={() => setShowBulkModal(false)} className="flex-1 py-2 border border-gray-200 rounded-lg text-gray-600">Cancel</button>
              <button onClick={() => { bulkUpdatePrices(bulkPercent, bulkCategory); setShowBulkModal(false); }} className="flex-1 py-2 bg-brand-600 text-white rounded-lg font-bold">Apply Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const OrdersView: React.FC = () => {
  const { orders, updateOrderStatus } = useStore();
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const filteredOrders = filterStatus === 'All' ? orders : orders.filter(o => o.status === filterStatus);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Order Management</h2>
        <div className="flex gap-2">
          {['All', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filterStatus === status ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-600'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredOrders.map(order => (
          <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900">Order #{order.id}</h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{new Date(order.date).toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{order.customerName} • {order.customerPhone}</p>
                <p className="text-sm text-gray-500">{order.address}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right mr-2">
                  <p className="font-bold text-lg text-brand-600">{order.total} EGP</p>
                  <p className="text-xs text-gray-400">{order.paymentMethod}</p>
                </div>
                <select
                  value={order.status}
                  onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                  className={`text-sm font-bold px-3 py-2 rounded-lg border-none focus:ring-2 focus:ring-brand-500 outline-none cursor-pointer ${
                    order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                    order.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                    order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  <option value="Processing">Processing</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            
            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs font-medium text-gray-500 mb-2">ITEMS</p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg min-w-[200px]">
                    <img src={item.image} className="w-8 h-8 rounded bg-white" />
                    <div className="overflow-hidden">
                      <p className="text-xs font-medium truncate w-32">{item.name}</p>
                      <p className="text-[10px] text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
        {filteredOrders.length === 0 && <p className="text-center text-gray-500 py-10">No orders found.</p>}
      </div>
    </div>
  );
};

const CouponsView: React.FC = () => {
  const { coupons, addCoupon, deleteCoupon } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState<Partial<Coupon>>({ discountPercentage: 10, isActive: true });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code) return;
    addCoupon({
      id: Date.now().toString(),
      code: newCoupon.code.toUpperCase(),
      discountPercentage: newCoupon.discountPercentage || 10,
      expiryDate: newCoupon.expiryDate || '2025-01-01',
      isActive: true,
      usageCount: 0
    } as Coupon);
    setShowModal(false);
    setNewCoupon({ discountPercentage: 10, isActive: true });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Coupons & Marketing</h2>
        <button onClick={() => setShowModal(true)} className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-brand-700">
          <Plus size={16} /> Create Coupon
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 font-medium text-gray-500">Code</th>
              <th className="p-4 font-medium text-gray-500">Discount</th>
              <th className="p-4 font-medium text-gray-500">Expiry</th>
              <th className="p-4 font-medium text-gray-500">Status</th>
              <th className="p-4 font-medium text-gray-500 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {coupons.map(coupon => (
              <tr key={coupon.id} className="hover:bg-gray-50">
                <td className="p-4 font-bold text-brand-600">{coupon.code}</td>
                <td className="p-4">{coupon.discountPercentage}%</td>
                <td className="p-4 text-gray-500">{new Date(coupon.expiryDate).toLocaleDateString()}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {coupon.isActive ? 'Active' : 'Expired'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => deleteCoupon(coupon.id)} className="text-red-400 hover:text-red-600 p-1">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 animate-slide-in">
            <h2 className="text-xl font-bold mb-4">New Coupon</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                <input required type="text" placeholder="SUMMER20" className="w-full p-2 border rounded-lg uppercase" value={newCoupon.code || ''} onChange={e => setNewCoupon({...newCoupon, code: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount %</label>
                <input required type="number" max="100" className="w-full p-2 border rounded-lg" value={newCoupon.discountPercentage} onChange={e => setNewCoupon({...newCoupon, discountPercentage: Number(e.target.value)})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input required type="date" className="w-full p-2 border rounded-lg" value={newCoupon.expiryDate || ''} onChange={e => setNewCoupon({...newCoupon, expiryDate: e.target.value})} />
              </div>
              <button type="submit" className="w-full py-2 bg-brand-600 text-white rounded-lg font-bold mt-2">Create Coupon</button>
              <button type="button" onClick={() => setShowModal(false)} className="w-full py-2 border border-gray-200 rounded-lg text-gray-600">Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetSystem } = useStore();
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    updateSettings(localSettings);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Store Settings</h2>
      
      <div className="space-y-8">
        {/* Branding */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Tag size={20} className="text-brand-600" /> Branding
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Brand Color</label>
              <div className="flex gap-4 items-center">
                <input 
                  type="color" 
                  value={localSettings.brandColor} 
                  onChange={e => setLocalSettings({...localSettings, brandColor: e.target.value})}
                  className="h-10 w-20 rounded cursor-pointer border-0"
                />
                <span className="text-sm text-gray-500 font-mono">{localSettings.brandColor}</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">Changing this will update the app theme immediately.</p>
            </div>
          </div>
        </section>

        {/* Payment */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <CreditCard size={20} className="text-brand-600" /> Payment Gateways
          </h3>
          <div className="space-y-3">
            {Object.entries(localSettings.paymentGateways).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="capitalize font-medium">{key}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={val} 
                    onChange={e => setLocalSettings({
                      ...localSettings, 
                      paymentGateways: { ...localSettings.paymentGateways, [key]: e.target.checked }
                    })}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                </label>
              </div>
            ))}
          </div>
        </section>

         {/* Shipping */}
         <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Truck size={20} className="text-brand-600" /> Shipping Configuration
          </h3>
          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Flat Rate (EGP)</label>
               <input 
                 type="number" 
                 value={localSettings.shipping.flatRate}
                 onChange={e => setLocalSettings({
                    ...localSettings, 
                    shipping: { ...localSettings.shipping, flatRate: Number(e.target.value) }
                 })}
                 className="w-full p-2 border rounded-lg"
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Free Shipping Over</label>
               <input 
                 type="number" 
                 value={localSettings.shipping.freeShippingThreshold}
                 onChange={e => setLocalSettings({
                    ...localSettings, 
                    shipping: { ...localSettings.shipping, freeShippingThreshold: Number(e.target.value) }
                 })}
                 className="w-full p-2 border rounded-lg"
               />
             </div>
          </div>
        </section>

        <button onClick={handleSave} className="w-full py-3 bg-brand-600 text-white rounded-xl font-bold shadow-lg hover:bg-brand-700 flex items-center justify-center gap-2">
          <RefreshCw size={20} /> Save Settings
        </button>
        
        {/* New Reload Button */}
        <button onClick={() => window.location.reload()} className="w-full py-3 bg-gray-800 text-white rounded-xl font-bold shadow-lg hover:bg-gray-900 flex items-center justify-center gap-2 mt-4">
          <RefreshCw size={20} /> Reload System
        </button>

        {/* Danger Zone */}
        <section className="bg-red-50 p-6 rounded-2xl border border-red-100 mt-8">
          <h3 className="font-bold text-lg mb-2 flex items-center gap-2 text-red-700">
            <AlertOctagon size={20} /> Danger Zone
          </h3>
          <p className="text-sm text-red-600 mb-4">
            Use this to wipe all products, orders, and data if the system becomes unstable or you want to start fresh. This cannot be undone.
          </p>
          <button 
             onClick={() => {
                if(confirm("Are you absolutely sure? This will delete ALL products, images, and orders.")) {
                   resetSystem();
                }
             }}
             className="w-full py-3 bg-white border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-100 flex items-center justify-center gap-2"
          >
             <Trash2 size={20} /> Factory Reset System
          </button>
        </section>
      </div>
    </div>
  );
};

const UsersView: React.FC = () => {
  const { users, toggleUserAdmin } = useStore();

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-6">User Management</h2>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 font-medium text-gray-500">User</th>
              <th className="p-4 font-medium text-gray-500">Contact</th>
              <th className="p-4 font-medium text-gray-500">Role</th>
              <th className="p-4 font-medium text-gray-500 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="p-4">
                  <div className="font-bold text-gray-900">{u.name}</div>
                  <div className="text-xs text-gray-400">ID: {u.id}</div>
                </td>
                <td className="p-4">
                  <div>{u.phone}</div>
                  <div className="text-xs text-gray-500">{u.email}</div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${u.isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                    {u.isAdmin ? 'Admin' : 'Customer'}
                  </span>
                </td>
                <td className="p-4 text-right">
                   <button 
                     onClick={() => toggleUserAdmin(u.id)}
                     className="text-xs font-medium text-brand-600 hover:underline"
                   >
                     {u.isAdmin ? 'Revoke Admin' : 'Promote to Admin'}
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Main Layout ---

export const Admin: React.FC<AdminProps> = ({ onBack }) => {
  const [currentView, setCurrentView] = useState<View>('dashboard');

  const navItems: { id: View, label: string, icon: any }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'notifications', label: 'Notifications', icon: Bell }, // Added Notification Nav
    { id: 'assistant', label: 'Smart Assistant', icon: Brain },
    { id: 'supply_chain', label: 'Supply Chain', icon: Factory },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'coupons', label: 'Coupons', icon: Tag },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="bg-gray-900 text-gray-300 w-full md:w-64 flex-shrink-0 flex flex-col">
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <h1 className="text-white font-bold text-xl tracking-tight">Hamess Admin</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                currentView === item.id ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/50' : 'hover:bg-gray-800'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button onClick={onBack} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-gray-800 transition">
            <LogOut size={20} />
            <span className="font-medium">Exit Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto relative">
        <header className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10 flex justify-between items-center md:hidden">
           <span className="font-bold text-gray-800 capitalize">{currentView.replace('_', ' ')}</span>
        </header>
        
        <div className="animate-fade-in">
          {currentView === 'dashboard' && <DashboardView />}
          {currentView === 'assistant' && <AIAssistantView />}
          {currentView === 'notifications' && <NotificationsView />} 
          {currentView === 'supply_chain' && <SupplyChainView />}
          {currentView === 'products' && <ProductsView />}
          {currentView === 'orders' && <OrdersView />}
          {currentView === 'users' && <UsersView />}
          {currentView === 'coupons' && <CouponsView />}
          {currentView === 'settings' && <SettingsView />}
        </div>
      </main>
    </div>
  );
};
