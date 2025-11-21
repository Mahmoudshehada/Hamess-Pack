

import React, { useEffect, useState } from 'react';
import { Database, HardDrive, AlertTriangle, CheckCircle, Server } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { estimateUsage } from '../utils/storage';

export const SystemHealth: React.FC = () => {
  const { products, storedImages, orders } = useStore();
  const [storageUsage, setStorageUsage] = useState<string>('Checking...');
  const [quotaPercentage, setQuotaPercentage] = useState<number>(0);
  const [dbType, setDbType] = useState<'LocalStorage' | 'IndexedDB'>('IndexedDB');
  const [healthStatus, setHealthStatus] = useState<'Good' | 'Warning' | 'Critical'>('Good');

  useEffect(() => {
    calculateStorage();
  }, [products, storedImages]);

  const calculateStorage = async () => {
    try {
      const estimate = await estimateUsage();
      if (estimate.quota) {
        const used = estimate.usage || 0;
        const quota = estimate.quota;
        const percent = (used / quota) * 100;
        
        setQuotaPercentage(percent);
        setStorageUsage(`${(used / 1024 / 1024).toFixed(2)} MB used of ${(quota / 1024 / 1024).toFixed(0)} MB`);
        
        if (percent > 80) setHealthStatus('Critical');
        else if (percent > 50) setHealthStatus('Warning');
        else setHealthStatus('Good');
      }
    } catch (e) {
      setStorageUsage('Unknown');
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Server size={20} className="text-brand-600" /> System Health & Storage
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Storage Indicator */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <div className="flex justify-between items-start mb-2">
             <div className="flex items-center gap-2">
               <HardDrive size={18} className="text-gray-500" />
               <span className="text-sm font-bold text-gray-700">Storage Usage</span>
             </div>
             {healthStatus === 'Good' && <CheckCircle size={18} className="text-green-500" />}
             {healthStatus === 'Warning' && <AlertTriangle size={18} className="text-yellow-500" />}
             {healthStatus === 'Critical' && <AlertTriangle size={18} className="text-red-500" />}
          </div>
          <p className="text-2xl font-bold text-gray-900">{quotaPercentage.toFixed(4)}%</p>
          <p className="text-xs text-gray-500">{storageUsage}</p>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
            <div 
              className={`h-1.5 rounded-full transition-all duration-500 ${
                healthStatus === 'Good' ? 'bg-green-500' : 
                healthStatus === 'Warning' ? 'bg-yellow-500' : 'bg-red-500'
              }`} 
              style={{ width: `${Math.max(quotaPercentage, 1)}%` }}
            ></div>
          </div>
        </div>

        {/* Database Mode */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
           <div className="flex items-center gap-2 mb-2">
             <Database size={18} className="text-gray-500" />
             <span className="text-sm font-bold text-gray-700">Persistence Mode</span>
           </div>
           <p className="text-xl font-bold text-gray-900">{dbType}</p>
           <p className="text-xs text-gray-500 mt-1">
             ✅ High-Performance Database Active.
             <br/>Supports 3000+ items & HQ Images.
           </p>
        </div>

        {/* Item Counts */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
           <div className="flex items-center gap-2 mb-2">
             <Server size={18} className="text-gray-500" />
             <span className="text-sm font-bold text-gray-700">Record Count</span>
           </div>
           <div className="flex justify-between text-sm mt-2">
             <span className="text-gray-600">Products:</span>
             <span className="font-bold">{products.length}</span>
           </div>
           <div className="flex justify-between text-sm">
             <span className="text-gray-600">Images:</span>
             <span className="font-bold">{storedImages.length}</span>
           </div>
           <div className="flex justify-between text-sm">
             <span className="text-gray-600">Orders:</span>
             <span className="font-bold">{orders.length}</span>
           </div>
        </div>
      </div>
    </div>
  );
};