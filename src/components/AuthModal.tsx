import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, User, ShieldCheck, ArrowRight, KeyRound, UserPlus, LogIn, CheckCircle2 } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { activeModal, setActiveModal, loginAsUser, loginAsAdmin, showToast } = useApp();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [roleMode, setRoleMode] = useState<'user' | 'admin'>('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  if (activeModal !== 'login') return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'register') {
      showToast('Registration successful! Welcome to Woodynat Designers.', 'success');
      loginAsUser();
    } else {
      if (roleMode === 'admin') {
        loginAsAdmin();
      } else {
        loginAsUser();
      }
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
                : roleMode === 'admin'
                ? 'WordPress & Shop Admin Login'
                : 'Customer Account Sign In'}
            </h3>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          
          {/* Main Auth Mode Tabs (Sign In vs Register) - Centered */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-xl border border-slate-200 max-w-xs mx-auto">
            <button
              onClick={() => setAuthMode('login')}
              className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                authMode === 'login'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" /> Sign In
            </button>

            <button
              onClick={() => setAuthMode('register')}
              className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                authMode === 'register'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" /> Register
            </button>
          </div>

          {/* Role Switcher Tabs (Only in Sign In Mode) - Centered */}
          {authMode === 'login' && (
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                onClick={() => setRoleMode('user')}
                className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                  roleMode === 'user'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5" /> Customer Portal
              </button>

              <button
                onClick={() => setRoleMode('admin')}
                className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                  roleMode === 'admin'
                    ? 'bg-slate-900 text-blue-400 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Admin Portal
              </button>
            </div>
          )}

          {/* Quick Demo Preset Buttons - Centered */}
          <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-2xl space-y-2 text-center">
            <span className="text-[11px] font-bold text-blue-950 uppercase tracking-wider block text-center">
              ⚡ Quick 1-Click Demo Authentication:
            </span>

            {authMode === 'register' ? (
              <button
                onClick={() => {
                  showToast('Registered & logged in as Demo Customer!', 'success');
                  loginAsUser();
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer text-center mx-auto"
              >
                <UserPlus className="w-4 h-4" />
                <span>Quick Register & Log In as Customer</span>
              </button>
            ) : roleMode === 'user' ? (
              <button
                onClick={loginAsUser}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer text-center mx-auto"
              >
                <User className="w-4 h-4" />
                <span>Log In as Customer (John Doe)</span>
              </button>
            ) : (
              <button
                onClick={loginAsAdmin}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer text-center mx-auto"
              >
                <KeyRound className="w-4 h-4 text-blue-400" />
                <span>Log In as Shop & WordPress Admin</span>
              </button>
            )}
          </div>

          {/* Divider - Centered */}
          <div className="relative text-center my-2">
            <span className="bg-white px-3 text-[11px] text-slate-400 relative z-10 font-bold uppercase text-center">
              {authMode === 'register' ? 'Or Fill Registration Form' : 'Or Enter Credentials'}
            </span>
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
          </div>

          {/* Form - Centered Action Button */}
          <form onSubmit={handleCustomSubmit} className="space-y-3">
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
                placeholder={roleMode === 'admin' ? 'admin@woodynatdesigners.com' : 'client@gmail.com'}
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

            {/* Main Submit Button - Centered */}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer text-center mx-auto"
            >
              <span>
                {authMode === 'register'
                  ? 'Complete Registration & Sign In'
                  : roleMode === 'admin'
                  ? 'Access Admin Console'
                  : 'Sign In to Account'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Bottom Switcher Link - Centered */}
          <div className="text-center pt-2 border-t border-slate-100">
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
            ) : (
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
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

