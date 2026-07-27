import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Lock, User, ShieldCheck, ArrowRight, KeyRound, Sparkles } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { activeModal, setActiveModal, loginAsUser, loginAsAdmin } = useApp();
  const [roleMode, setRoleMode] = useState<'user' | 'admin'>('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (activeModal !== 'login') return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roleMode === 'admin') {
      loginAsAdmin();
    } else {
      loginAsUser();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 block">
              Woodynat Account Gateway
            </span>
            <h3 className="font-extrabold text-base sm:text-lg">
              {roleMode === 'admin' ? 'WordPress & Shop Admin Login' : 'Customer Account Sign In'}
            </h3>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          
          {/* Role Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setRoleMode('user')}
              className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                roleMode === 'user'
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" /> Customer Portal
            </button>

            <button
              onClick={() => setRoleMode('admin')}
              className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                roleMode === 'admin'
                  ? 'bg-slate-900 text-orange-400 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Admin Portal
            </button>
          </div>

          {/* Quick Demo Preset Login Buttons */}
          <div className="bg-orange-50 border border-orange-200 p-3.5 rounded-2xl space-y-2">
            <span className="text-[11px] font-bold text-orange-950 uppercase tracking-wider block">
              ⚡ Quick Demo 1-Click Authentication:
            </span>

            {roleMode === 'user' ? (
              <button
                onClick={loginAsUser}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>Log In as Customer (John Doe)</span>
              </button>
            ) : (
              <button
                onClick={loginAsAdmin}
                className="w-full bg-slate-900 hover:bg-slate-800 text-orange-400 border border-slate-700 font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <KeyRound className="w-4 h-4 text-orange-400" />
                <span>Log In as Shop & WordPress Admin</span>
              </button>
            )}
          </div>

          <div className="relative text-center my-2">
            <span className="bg-white px-3 text-[11px] text-slate-400 relative z-10 font-bold uppercase">Or Enter Credentials</span>
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleCustomSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Email Address:</label>
              <input
                type="email"
                required
                placeholder={roleMode === 'admin' ? 'admin@woodynatdesigners.com' : 'client@gmail.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
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
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
            >
              <span>{roleMode === 'admin' ? 'Access Admin Console' : 'Sign In to Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>
    </div>
  );
};
