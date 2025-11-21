
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ArrowRight, Smartphone, Lock, User, Mail } from 'lucide-react';

export const Auth: React.FC = () => {
  const { login } = useStore();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  const [step, setStep] = useState<'phone' | 'otp' | 'register' | 'password'>('phone');

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    // Check for admins - Redirect to Password Flow
    if (phone === '01066665153' || phone === '01010340487') {
      setStep('password');
      return;
    }
    if (phone.length > 8) setStep('otp');
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 4) {
      // Existing demo user for quick login
      if (phone === '0000') {
        login(phone);
      } else {
        // New users go to registration
        setStep('register');
      }
    }
  };

  const handleVerifyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would verify the hash on the server.
    // Here we simulate the check against the known credentials for the specific admin users.
    const validAdmins = {
      '01066665153': '66666666', // Walid El Sheikh
      '01010340487': '77779999'  // Mahmoud Shehada
    };

    if (validAdmins[phone as keyof typeof validAdmins] === password) {
       login(phone);
    } else {
       alert("Invalid Password");
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email) {
      login(phone, name, email);
    }
  };

  return (
    <div className="min-h-screen bg-brand-600 flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-brand-500 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-brand-700 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 opacity-50"></div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <div className="w-28 h-28 bg-accent-500 rounded-full flex items-center justify-center text-white shadow-xl mb-2 border-4 border-white/20">
             <span className="font-serif font-bold text-5xl tracking-tighter -ml-1">HP</span>
          </div>
          <h1 className="text-3xl font-bold mt-4 uppercase tracking-wide font-sans">Hamess Pack</h1>
          <p className="text-brand-200 text-[10px] tracking-widest uppercase mt-2 font-bold">Plastics • Birthday • Party • Accessories</p>
        </div>

        <div className="bg-white text-gray-800 rounded-2xl shadow-2xl p-6 animate-fade-in">
          {step === 'phone' && (
            <form onSubmit={handleSendOtp}>
              <h2 className="text-xl font-bold mb-4">Welcome</h2>
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-3.5 text-gray-400" size={20} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition"
                    placeholder="01xxxxxxxxx"
                    autoFocus
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">Use '0000' for Demo.</p>
              </div>
              <button 
                type="submit"
                className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-700 transition"
              >
                Continue <ArrowRight size={18} />
              </button>
            </form>
          )}

          {step === 'password' && (
            <form onSubmit={handleVerifyPassword}>
              <h2 className="text-xl font-bold mb-4">Admin Login</h2>
              <p className="text-sm text-gray-500 mb-4">Welcome back, {phone === '01066665153' ? 'Walid' : 'Mahmoud'}.</p>
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 text-gray-400" size={20} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition text-lg"
                    placeholder="••••••••"
                    autoFocus
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 transition"
              >
                Login
              </button>
              <button 
                type="button" 
                onClick={() => setStep('phone')}
                className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700"
              >
                Change Phone Number
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerify}>
              <h2 className="text-xl font-bold mb-4">Enter OTP</h2>
              <p className="text-sm text-gray-500 mb-4">We sent a code to {phone}</p>
              <div className="mb-6">
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition tracking-widest text-lg"
                    placeholder="XXXX"
                    maxLength={4}
                    autoFocus
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 transition"
              >
                Verify
              </button>
              <button 
                type="button" 
                onClick={() => setStep('phone')}
                className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700"
              >
                Change Phone Number
              </button>
            </form>
          )}

          {step === 'register' && (
            <form onSubmit={handleRegister}>
              <h2 className="text-xl font-bold mb-2">Complete Profile</h2>
              <p className="text-sm text-gray-500 mb-4">Tell us a bit about yourself.</p>
              
              <div className="mb-3">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition"
                    placeholder="e.g. Ahmed Ali"
                    required
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 text-gray-400" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 transition"
              >
                Start Shopping
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};