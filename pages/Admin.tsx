
import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Category, Product, Coupon } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { 
  LayoutDashboard, Package, Users, ShoppingCart, Settings, Tag, 
  LogOut, Plus, Search, Trash2, Edit2, Download, Upload, 
  RefreshCw, DollarSign, Truck, CreditCard, TrendingUp, TrendingDown, Image as ImageIcon, FileImage
} from 'lucide-react';

interface AdminProps {
  onBack: () => void;
}

type View = 'dashboard' | 'products' | 'orders' | 'users' | 'coupons' | 'settings';

// --- Sub-Components ---

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
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
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
      image: '', // Empty initially, requires upload
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
      const productId = editingProduct ? editingProduct.id : Math.random().toString(36).substr(2, 9);
      
      // Handle ID assignment if new
      if (!editingProduct) {
        finalProduct.id = productId;
      }

      // Handle Image Upload
      if (selectedFile) {
        const storedImage = await uploadProductImage(selectedFile, productId);
        finalProduct.imageId = storedImage.id;
        finalProduct.imagePath = storedImage.path;
        // We don't need to set 'image' manually here because the context will 
        // resolve it via imageId, but for consistency in the 'raw' data:
        // finalProduct.image = storedImage.data; // Optional, handled by context useMemo
      } else if (!editingProduct && !formData.image) {
        alert("Please upload an image for the new product");
        setIsUploading(false);
        return;
      }

      if (editingProduct) {
        updateProduct(finalProduct);
      } else {
        addProduct(finalProduct);
      }
      setShowModal(false);
    } catch (error) {
      console.error("Failed to save product", error);
      alert("Failed to save product. Please try again.");
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
                        {product.imagePath && <div className="absolute bottom-0 right-0 bg-brand-600 w-2 h-2 rounded-full border border-white"></div>}
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
                        <span className="text-xs text-gray-400 mt-1">JPG, PNG, WebP (Max 5MB)</span>
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
                          {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Stored in system'}
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
                  {isUploading ? 'Uploading...' : 'Save Product'}
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
  const { settings, updateSettings } = useStore();
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
           <span className="font-bold text-gray-800 capitalize">{currentView}</span>
        </header>
        
        <div className="animate-fade-in">
          {currentView === 'dashboard' && <DashboardView />}
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
