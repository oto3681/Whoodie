import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Lock, 
  UserPlus, 
  LogIn, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  KeyRound, 
  ShieldCheck, 
  Shirt, 
  Package, 
  Sparkles,
  Home
} from 'lucide-react';

export const RegistrationGate: React.FC = () => {
  const { loginAsUser, loginAsAdmin, setIsGuestBrowsing, showToast } = useApp();
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const cleanEmail = email.trim().toLowerCase();
    const isAdminEmail = cleanEmail === 'woodynatdesigners12@gmail' || cleanEmail === 'woodynatdesigners12@gmail.com' || cleanEmail === 'admin@woodynatdesigners.co.ke';

    if (isAdminEmail) {
      if (password === 'Sunflower_14' || password === '247247' || password === 'woodynatadmin') {
        loginAsAdmin('woodynatdesigners12@gmail.com');
        return;
      } else {
        setAuthError('Incorrect password for Admin account woodynatdesigners12@gmail.');
        return;
      }
    }

    if (authMode === 'register') {
      showToast('Account Created! Welcome to Woodynat Designers.', 'success');
      loginAsUser({ name: fullName, email, phone });
    } else {
      loginAsUser({ email });
    }
  };

  return (
    <div className="min-h-[85vh] bg-slate-50 flex flex-col items-center justify-center p-4 py-8">
      
      {/* Top Navigation Bar with Back Button */}
      <div className="max-w-4xl w-full mb-4 flex items-center justify-between">
        <button
          onClick={() => setIsGuestBrowsing(true)}
          className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-extrabold px-4 py-2.5 rounded-2xl text-xs shadow-xs transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Shop / Browse as Guest</span>
        </button>

        <span className="text-xs font-bold text-slate-400 hidden sm:inline-block">
          Woodynat Designers & Printing Services
        </span>
      </div>

      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Left Side: Brand Benefits & Security Info */}
        <div className="bg-slate-900 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/40 text-blue-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5" /> Customer Access Gate
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black leading-tight text-white">
                Register to Access Woodynat Printing Services
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                Create your account or log in to browse customized apparel, upload artwork, request quotes, place M-Pesa orders, and track jobs.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {[
                'Full access to T-Shirts, Hoodies, Banners & Eulogies catalog',
                'Funeral Program Booklets service',
                'Instant M-Pesa Push Checkout & Live Order Tracker',
                'Custom Artwork Vectorization & Proofing Engine'
              ].map((feat, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-200 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Woodynat Designers Limited</span>
            <span className="text-blue-400 font-bold">DaveTech Solutions</span>
          </div>
        </div>

        {/* Right Side: Registration / Sign In Form */}
        <div className="p-8 sm:p-10 flex flex-col justify-center space-y-5">
          
          {/* Mode Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setAuthMode('register')}
              className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'register' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" /> Create Account
            </button>
            <button
              onClick={() => setAuthMode('login')}
              className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'login' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" /> Sign In
            </button>
          </div>

          {/* Form Header */}
          <div>
            <h3 className="text-lg font-black text-slate-900">
              {authMode === 'register' ? 'Register Account' : 'Sign In to Your Account'}
            </h3>
            <p className="text-xs text-slate-500">
              {authMode === 'register'
                ? 'Fill in your details to access printing & branding services.'
                : 'Enter your account credentials to enter.'}
            </p>
          </div>

          {/* Quick 1-Click Demo Buttons */}
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-2xl space-y-2 text-center">
            <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block">
              ⚡ Instant 1-Click Customer Access:
            </span>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => {
                  showToast('Registered & logged in as Customer!', 'success');
                  loginAsUser();
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" /> Quick Customer Login
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {authError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold p-2.5 rounded-xl flex items-center gap-2">
                <span>{authError}</span>
              </div>
            )}
            {authMode === 'register' && (
              <>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Full Name:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jane Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number:</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 0712 345 678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Email Address:</label>
              <input
                type="email"
                required
                placeholder="client@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Password:</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
            >
              <span>{authMode === 'register' ? 'Register & Access Services' : 'Sign In & Access Services'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsGuestBrowsing(true)}
              className="w-full py-2.5 px-4 text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Browse Shop as Guest First</span>
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};
