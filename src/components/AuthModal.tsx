import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, User, ShieldCheck, ArrowRight, KeyRound, UserPlus, LogIn, Lock, AlertCircle, Eye, EyeOff, Mail, Facebook, UserCheck } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { currentUser, activeModal, setActiveModal, loginAsUser, loginWithGoogle, loginWithFacebook, loginAsAdmin, showToast } = useApp();
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'staff'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [adminPasscode, setAdminPasscode] = useState('');
  const [showAdminPasscode, setShowAdminPasscode] = useState(false);
  const [staffAuthError, setStaffAuthError] = useState('');

  // Social Auth Modal states
  const [socialModal, setSocialModal] = useState<'google' | 'facebook' | null>(null);
  const [socialEmail, setSocialEmail] = useState('');
  const [socialName, setSocialName] = useState('');

  if (activeModal !== 'login' && currentUser) return null;
  if (!currentUser && activeModal !== 'login') {
    // If not logged in and modal is not active, return null because App.tsx main body renders the Registration Gateway
    return null;
  }

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStaffAuthError('');

    const cleanEmail = email.trim().toLowerCase();
    const isAdminEmail = cleanEmail === 'woodynatdesigners12@gmail' || cleanEmail === 'woodynatdesigners12@gmail.com' || cleanEmail === 'admin@woodynatdesigners.co.ke';

    if (authMode === 'staff') {
      // Validate Admin Passcode or Password
      const code = adminPasscode.trim();
      if (code === 'Natookoth_14' || code === '247247' || code.toLowerCase() === 'woodynatadmin' || code === 'Sunflower_14' || code === '9824') {
        loginAsAdmin('woodynatdesigners12@gmail.com');
      } else {
        setStaffAuthError('Invalid Admin Security Passcode or Password. Access denied.');
      }
      return;
    }

    if (isAdminEmail) {
      if (password === 'Natookoth_14' || password === 'Sunflower_14' || password === '247247' || password === 'woodynatadmin') {
        loginAsAdmin('woodynatdesigners12@gmail.com');
        return;
      } else {
        setStaffAuthError('Incorrect password for Admin account woodynatdesigners12@gmail.');
        return;
      }
    }

    if (authMode === 'register') {
      showToast('Registration successful! Welcome to Woodynat Designers.', 'success');
      loginAsUser({ name: fullName, email, phone });
    } else {
      loginAsUser({ email });
    }
  };

  const handleOpenGoogle = () => {
    setSocialName(fullName || 'Jane Wambui');
    setSocialEmail(email && email.includes('@') ? email : 'oto36810@gmail.com');
    setSocialModal('google');
  };

  const handleOpenFacebook = () => {
    setSocialName(fullName || 'David Ochieng');
    setSocialEmail(email && email.includes('@') ? email : 'david.ochieng@facebook.com');
    setSocialModal('facebook');
  };

  const handleConfirmSocial = (provider: 'google' | 'facebook') => {
    if (provider === 'google') {
      loginWithGoogle({
        name: socialName || 'Google User',
        email: socialEmail || 'user@gmail.com',
      });
    } else {
      loginWithFacebook({
        name: socialName || 'Facebook User',
        email: socialEmail || 'user@facebook.com',
      });
    }
    setSocialModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        
        {/* Modal Header - Centered */}
        <div className="bg-slate-900 text-white p-5 text-center relative border-b border-slate-800">
          <div className="flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block mb-1">
              Woodynat Account Gateway
            </span>
            <h3 className="font-extrabold text-base sm:text-lg text-center">
              {authMode === 'register'
                ? 'Create New Customer Account'
                : authMode === 'login'
                ? 'Customer Account Sign In'
                : 'Authorized Staff Access'}
            </h3>
          </div>
          {currentUser && (
            <button
              onClick={() => setActiveModal(null)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="p-6 space-y-5">
          
          {/* Main Auth Mode Tabs (Sign In vs Register) - Centered */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-xl border border-slate-200 max-w-xs mx-auto">
            <button
              onClick={() => { setAuthMode('login'); setStaffAuthError(''); }}
              className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                authMode === 'login'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" /> Sign In
            </button>

            <button
              onClick={() => { setAuthMode('register'); setStaffAuthError(''); }}
              className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                authMode === 'register'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" /> Register
            </button>
          </div>

          {authMode !== 'staff' && (
            <>
              {/* SOCIAL SIGN UP / SIGN IN OPTIONS */}
              <div className="space-y-2">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 text-center">
                  ⚡ 1-Click Social Sign {authMode === 'register' ? 'Up' : 'In'}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleOpenGoogle}
                    className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-bold py-2.5 px-3 rounded-xl border border-slate-300 shadow-xs text-xs transition-all cursor-pointer group"
                  >
                    <div className="w-4 h-4 rounded-full bg-red-50 flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <span>{authMode === 'register' ? 'Sign up with Gmail' : 'Sign in with Gmail'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenFacebook}
                    className="w-full flex items-center justify-center gap-2 bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold py-2.5 px-3 rounded-xl shadow-xs text-xs transition-all cursor-pointer group"
                  >
                    <Facebook className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                    <span>{authMode === 'register' ? 'Sign up with Facebook' : 'Sign in with Facebook'}</span>
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="relative text-center my-2">
                <span className="bg-white px-3 text-[11px] text-slate-400 relative z-10 font-bold uppercase text-center">
                  {authMode === 'register' ? 'Or Fill Registration Form' : 'Or Enter Credentials'}
                </span>
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
              </div>
            </>
          )}

          {/* Form */}
          <form onSubmit={handleCustomSubmit} className="space-y-3">
            {authMode === 'staff' ? (
              <div className="space-y-3 bg-slate-900 p-4 rounded-2xl border border-slate-800 text-white">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" /> Protected Staff Portal
                </div>
                <p className="text-xs text-slate-300">
                  Enter the administrative passcode to access management tools, order status controls, and WordPress settings.
                </p>

                {staffAuthError && (
                  <div className="bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold p-2.5 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{staffAuthError}</span>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Admin Security Passcode / PIN:</label>
                  <div className="relative">
                    <input
                      type={showAdminPasscode ? 'text' : 'password'}
                      required
                      placeholder="Enter Admin Passcode (e.g. 247247)"
                      value={adminPasscode}
                      onChange={(e) => setAdminPasscode(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 pr-10 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPasscode(!showAdminPasscode)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-400 transition-colors p-1 cursor-pointer"
                      title={showAdminPasscode ? 'Hide passcode' : 'Show passcode'}
                    >
                      {showAdminPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Authenticate Admin Access</span>
                </button>
              </div>
            ) : (
              <>
                {staffAuthError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold p-2.5 rounded-xl flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{staffAuthError}</span>
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

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer text-center mx-auto"
                >
                  <span>
                    {authMode === 'register'
                      ? 'Complete Registration & Sign In'
                      : 'Sign In to Customer Account'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </form>

          {/* Bottom Switcher Link - Centered */}
          <div className="text-center pt-2 border-t border-slate-100 space-y-2">
            {authMode === 'login' ? (
              <p className="text-xs text-slate-600 font-medium">
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className="font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                >
                  Register / Create Account
                </button>
              </p>
            ) : authMode === 'register' ? (
              <p className="text-xs text-slate-600 font-medium">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                >
                  Sign In to Account
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-600 font-medium">
                Are you a customer?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                >
                  Return to Customer Sign In
                </button>
              </p>
            )}

            <div className="flex flex-col items-center gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-1 cursor-pointer"
              >
                <span>← Back to Shop / Browse Catalog</span>
              </button>

              {authMode !== 'staff' && (
                <button
                  type="button"
                  onClick={() => { setAuthMode('staff'); setStaffAuthError(''); }}
                  className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors cursor-pointer pt-2 font-medium"
                  title="Woodynat Authorized Staff Login"
                >
                  🔒 Authorized Staff Access
                </button>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* POPUP / MODAL FOR GOOGLE GMAIL SIGN UP */}
      {socialModal === 'google' && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
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
                Connect your Google account to register and unlock full access to our customized print catalogue:
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
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
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
                Log in with Facebook to link your profile with Woodynat Designers:
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


