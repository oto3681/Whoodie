import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, User, ShieldCheck, ArrowRight, KeyRound, UserPlus, LogIn, Lock, AlertCircle } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { currentUser, activeModal, setActiveModal, loginAsUser, loginAsAdmin, showToast } = useApp();
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'staff'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [adminPasscode, setAdminPasscode] = useState('');
  const [staffAuthError, setStaffAuthError] = useState('');

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
      if (code === '247247' || code.toLowerCase() === 'woodynatadmin' || code === 'Sunflower_14' || code === '9824') {
        loginAsAdmin('woodynatdesigners12@gmail.com');
      } else {
        setStaffAuthError('Invalid Admin Security Passcode or Password. Access denied.');
      }
      return;
    }

    if (isAdminEmail) {
      if (password === 'Sunflower_14' || password === '247247' || password === 'woodynatadmin') {
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
              {/* Quick Customer Authentication Button */}
              <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-2xl space-y-2 text-center">
                <span className="text-[11px] font-bold text-blue-950 uppercase tracking-wider block text-center">
                  ⚡ Quick 1-Click Customer Access:
                </span>

                {authMode === 'register' ? (
                  <button
                    onClick={() => {
                      showToast('Registered & logged in as Customer!', 'success');
                      loginAsUser();
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer text-center mx-auto"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Quick Register & Log In as Customer</span>
                  </button>
                ) : (
                  <button
                    onClick={loginAsUser}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer text-center mx-auto"
                  >
                    <User className="w-4 h-4" />
                    <span>Log In as Customer Account</span>
                  </button>
                )}
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
                  <input
                    type="password"
                    required
                    placeholder="Enter Admin Passcode (e.g. 247247)"
                    value={adminPasscode}
                    onChange={(e) => setAdminPasscode(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
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
    </div>
  );
};


