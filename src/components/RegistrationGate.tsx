import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Lock, 
  UserPlus, 
  LogIn, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Mail, 
  Facebook, 
  Sparkles, 
  X, 
  UserCheck,
  QrCode,
  Smartphone
} from 'lucide-react';

export const RegistrationGate: React.FC = () => {
  const { loginAsUser, loginWithGoogle, loginWithFacebook, loginAsAdmin, showToast } = useApp();
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isFromQrScan, setIsFromQrScan] = useState(false);

  // Check URL for QR scan parameters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const auth = params.get('auth') || params.get('action');
      const ref = params.get('ref');
      if (ref?.includes('qrcode') || params.get('scan') === 'true' || auth) {
        setIsFromQrScan(true);
      }
      if (auth === 'login' || auth === 'signin') {
        setAuthMode('login');
      } else if (auth === 'register' || auth === 'signup') {
        setAuthMode('register');
      }
    }
  }, []);

  // Social Auth Modal states
  const [socialModal, setSocialModal] = useState<'google' | 'facebook' | null>(null);
  const [socialEmail, setSocialEmail] = useState('');
  const [socialName, setSocialName] = useState('');
  const [socialPhone, setSocialPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const cleanEmail = email.trim().toLowerCase();
    const isAdminEmail = cleanEmail === 'woodynatdesigners12@gmail' || cleanEmail === 'woodynatdesigners12@gmail.com' || cleanEmail === 'admin@woodynatdesigners.co.ke';

    if (isAdminEmail) {
      if (password === 'Natookoth_14' || password === 'Sunflower_14' || password === '247247' || password === 'woodynatadmin') {
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

  const handleOpenGoogle = () => {
    setSocialName(fullName || 'Jane Wambui');
    setSocialEmail(email && email.includes('@') ? email : 'oto36810@gmail.com');
    setSocialPhone(phone || '0712345678');
    setSocialModal('google');
  };

  const handleOpenFacebook = () => {
    setSocialName(fullName || 'David Ochieng');
    setSocialEmail(email && email.includes('@') ? email : 'david.ochieng@facebook.com');
    setSocialPhone(phone || '0722889900');
    setSocialModal('facebook');
  };

  const handleConfirmSocial = (provider: 'google' | 'facebook') => {
    if (provider === 'google') {
      loginWithGoogle({
        name: socialName || 'Google User',
        email: socialEmail || 'user@gmail.com',
        phone: socialPhone || '+254700123456'
      });
    } else {
      loginWithFacebook({
        name: socialName || 'Facebook User',
        email: socialEmail || 'user@facebook.com',
        phone: socialPhone || '+254711889900'
      });
    }
    setSocialModal(null);
  };

  return (
    <div className="min-h-[85vh] bg-slate-50 flex flex-col items-center justify-center p-4 py-8 relative">
      
      {/* Top Banner Notice */}
      <div className="max-w-4xl w-full mb-4 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-300 text-amber-900 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs">
          <Lock className="w-4 h-4 text-amber-600" />
          <span>Registration Required: Account creation or Sign In is mandatory to access products catalog.</span>
        </div>

        <span className="text-xs font-bold text-slate-400 hidden sm:inline-block">
          Woodynat Designers & Printing Services
        </span>
      </div>

      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Left Side: Brand Benefits & Security Info */}
        <div className="bg-slate-900 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/40 text-blue-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" /> Customer Registration Gate
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black leading-tight text-white">
                Register to Unlock All Products & Services
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                Please create your account or log in with Gmail, Facebook, or Email to view our full customized apparel catalog, upload artwork, request quotes, place M-Pesa orders, and track jobs.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {[
                'Full access to T-Shirts, Hoodies, Banners & Eulogies catalog',
                'Funeral Program Booklets & Tribute Books',
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
        <div className="p-8 sm:p-10 flex flex-col justify-center space-y-4">
          
          {/* QR Code Scanned Welcome Banner */}
          {isFromQrScan && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-300 rounded-2xl p-3 flex items-center gap-3 text-xs text-blue-950 shadow-xs animate-in fade-in">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                <QrCode className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <div className="font-extrabold flex items-center gap-1.5">
                  <span>Welcome! You Scanned Store QR Code</span>
                  <span className="bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                    Verified
                  </span>
                </div>
                <p className="text-[11px] text-blue-800 leading-tight">
                  {authMode === 'register' 
                    ? 'Create your account below to start ordering and receiving instant proofing.'
                    : 'Sign in to access your registered Woodynat account and view quotes.'}
                </p>
              </div>
            </div>
          )}

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
              {authMode === 'register' ? 'Register Account to Enter' : 'Sign In to Your Account'}
            </h3>
            <p className="text-xs text-slate-500">
              {authMode === 'register'
                ? 'Sign up with Gmail, Facebook, or your Email details.'
                : 'Sign in with your preferred method to access products.'}
            </p>
          </div>

          {/* SOCIAL SIGN UP / SIGN IN OPTIONS */}
          <div className="space-y-2.5">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 text-center">
              ⚡ Fast 1-Click Social Sign {authMode === 'register' ? 'Up' : 'In'}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Google / Gmail Button */}
              <button
                type="button"
                onClick={handleOpenGoogle}
                className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold py-2.5 px-3 rounded-xl border border-slate-300 shadow-xs hover:border-slate-400 text-xs transition-all cursor-pointer group"
              >
                <div className="w-4 h-4 rounded-full bg-red-50 flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <span>{authMode === 'register' ? 'Sign up with Gmail' : 'Sign in with Gmail'}</span>
              </button>

              {/* Facebook Button */}
              <button
                type="button"
                onClick={handleOpenFacebook}
                className="w-full flex items-center justify-center gap-2.5 bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold py-2.5 px-3 rounded-xl shadow-xs text-xs transition-all cursor-pointer group"
              >
                <Facebook className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                <span>{authMode === 'register' ? 'Sign up with Facebook' : 'Sign in with Facebook'}</span>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="grow border-t border-slate-200"></div>
            <span className="shrink mx-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Or {authMode === 'register' ? 'register with details' : 'sign in with email'}
            </span>
            <div className="grow border-t border-slate-200"></div>
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
                    placeholder="e.g. Jane Wambui"
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
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 pr-10 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors p-1 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
            >
              <span>{authMode === 'register' ? 'Register & Unlock Catalog' : 'Sign In & Unlock Catalog'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Direct WhatsApp Live Chat Option (No Login Needed) */}
          <div className="mt-4 pt-4 border-t border-slate-200">
            <a
              href="https://wa.me/254797939199?text=Hi%20Woodynat%20Designers%20Limited!%20I%20need%20instant%20print%20quotes%20and%20rates%20for%20my%20order."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-extrabold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all group"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
              </span>
              <span>Direct WhatsApp Inquiry: <strong>0797939199</strong> (Live 24/7)</span>
            </a>
          </div>

        </div>
      </div>

      {/* POPUP / MODAL FOR GOOGLE GMAIL SIGN UP */}
      {socialModal === 'google' && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm">Sign in with Google / Gmail</h4>
                  <span className="text-[10px] text-slate-300">Woodynat Designers OAuth 2.0</span>
                </div>
              </div>
              <button 
                onClick={() => setSocialModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Connect your Google account to instantly register and unlock full access to our print catalogue and services:
              </p>

              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Google Display Name:</label>
                  <input
                    type="text"
                    value={socialName}
                    onChange={(e) => setSocialName(e.target.value)}
                    placeholder="Your Google Account Name"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Gmail Address:</label>
                  <input
                    type="email"
                    value={socialEmail}
                    onChange={(e) => setSocialEmail(e.target.value)}
                    placeholder="user@gmail.com"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Phone Number (for M-Pesa order delivery):</label>
                  <input
                    type="tel"
                    value={socialPhone}
                    onChange={(e) => setSocialPhone(e.target.value)}
                    placeholder="0712 345 678"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleConfirmSocial('google')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Authorize & Sign Up with Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSocialModal(null)}
                  className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer text-center"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POPUP / MODAL FOR FACEBOOK SIGN UP */}
      {socialModal === 'facebook' && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="bg-[#1877F2] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Facebook className="w-5 h-5 text-white" />
                <div>
                  <h4 className="font-extrabold text-sm">Sign in with Facebook</h4>
                  <span className="text-[10px] text-blue-100">Woodynat Designers Facebook Login</span>
                </div>
              </div>
              <button 
                onClick={() => setSocialModal(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Log in with Facebook to link your profile with Woodynat Designers for easy order tracking:
              </p>

              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Facebook Profile Name:</label>
                  <input
                    type="text"
                    value={socialName}
                    onChange={(e) => setSocialName(e.target.value)}
                    placeholder="Your Facebook Name"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Associated Email:</label>
                  <input
                    type="email"
                    value={socialEmail}
                    onChange={(e) => setSocialEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Phone Number (for M-Pesa order delivery):</label>
                  <input
                    type="tel"
                    value={socialPhone}
                    onChange={(e) => setSocialPhone(e.target.value)}
                    placeholder="0722 889 900"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleConfirmSocial('facebook')}
                  className="w-full bg-[#1877F2] hover:bg-[#166fe5] text-white font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
                >
                  <Facebook className="w-4 h-4" />
                  <span>Authorize & Sign Up with Facebook</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSocialModal(null)}
                  className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer text-center"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
