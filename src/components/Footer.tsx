import React from 'react';
import { useApp } from '../context/AppContext';
import { Logo } from './Logo';
import { 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  CreditCard, 
  Smartphone, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { wpSettings, setActiveModal, setActiveView, currentUser, logout } = useApp();

  const rawPhone = wpSettings.whatsappNumber.replace(/[^0-9]/g, '');
  const cleanPhone = rawPhone.startsWith('0') ? '254' + rawPhone.slice(1) : rawPhone;

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Trust Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-slate-800">
          <div className="flex items-center gap-3 bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
            <div className="p-3 bg-blue-500/20 text-blue-400 rounded-lg shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Quality Guaranteed</h4>
              <p className="text-xs text-slate-400">300DPI HD Precision Print</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-lg shrink-0">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Instant Payment</h4>
              <p className="text-xs text-slate-400">M-PESA Express STK & Paybill</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-lg shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Express 24h Service</h4>
              <p className="text-xs text-slate-400">Eulogies & Event Banners</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
            <div className="p-3 bg-violet-500/20 text-violet-400 rounded-lg shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Real-Time Tracking</h4>
              <p className="text-xs text-slate-400">Live Delivery Updates</p>
            </div>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 py-12 border-b border-slate-800">
          
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <Logo variant="white" size="md" />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm font-medium">
              {wpSettings.tagline}. Commercial graphics, printing, custom apparel branding, corporate video production, and memorial publication studio.
            </p>

            {/* Social Media Handles */}
            <div className="pt-2">
              <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
                Follow Us On Social Media
              </h5>
              <div className="flex items-center gap-3">
                <a 
                  href={wpSettings.facebookUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                >
                  <span>Facebook</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <a 
                  href={wpSettings.instagramUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-slate-800 hover:bg-pink-600 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                >
                  <span>Instagram</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <a 
                  href={wpSettings.tiktokUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-slate-800 hover:bg-slate-950 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                >
                  <span>TikTok</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Services & Products */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Products & Print</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><button onClick={() => setActiveView('shop')} className="hover:text-blue-400 transition-colors">Printed T-Shirts & Polos</button></li>
              <li><button onClick={() => setActiveView('shop')} className="hover:text-blue-400 transition-colors">Custom Branded Hoodies</button></li>
              <li><button onClick={() => setActiveView('shop')} className="hover:text-blue-400 transition-colors">Safety Vests & Reflectors</button></li>
              <li><button onClick={() => setActiveView('shop')} className="hover:text-blue-400 transition-colors">Rollup & Vinyl Banners</button></li>
              <li><button onClick={() => setActiveView('shop')} className="hover:text-blue-400 transition-colors">Vehicle & Office Signage</button></li>
              <li><button onClick={() => setActiveView('shop')} className="hover:text-blue-400 transition-colors">Die-Cut Waterproof Stickers</button></li>
              <li><button onClick={() => setActiveView('shop')} className="hover:text-blue-400 transition-colors">24h Express Eulogies</button></li>
            </ul>
          </div>

          {/* Col 3: Customer Care */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Customer Care</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><button onClick={() => setActiveModal('track')} className="hover:text-blue-400 font-semibold transition-colors">Track Real-Time Order</button></li>
              <li><button onClick={() => setActiveView('reviews')} className="hover:text-blue-400 transition-colors">Customer Feedback & Reviews</button></li>
              {currentUser ? (
                <li><button onClick={logout} className="text-red-400 hover:text-red-300 font-bold transition-colors">Log Out ({currentUser.name})</button></li>
              ) : (
                <li><button onClick={() => setActiveModal('login')} className="hover:text-blue-400 font-semibold transition-colors">User & Admin Login</button></li>
              )}
              <li><a href="#payment-methods" className="hover:text-blue-400 transition-colors">Accepted Payments</a></li>
              <li><button onClick={() => setActiveModal('track')} className="hover:text-blue-400 transition-colors">Shipping & Pick-Up Stations</button></li>
            </ul>
          </div>

          {/* Col 4: Contact & WhatsApp */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Inquiry & Office</h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>{wpSettings.companyAddress || 'Ronald Ngala street, Gatkim complex building, 4th floor, Wing B, Room 4B1'}, {wpSettings.companyCity || 'Nairobi'}, Kenya</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{wpSettings.supportPhone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <a href={`mailto:${wpSettings.companyEmail}`} className="hover:text-blue-400 transition-colors">{wpSettings.companyEmail}</a>
              </div>
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-lg font-bold text-xs shadow-xs transition-colors"
              >
                <Smartphone className="w-4 h-4" />
                <span>WhatsApp ({wpSettings.whatsappNumber})</span>
              </a>
            </div>
          </div>

        </div>

        {/* Payments & Legal Bar */}
        <div id="payment-methods" className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">Supported Payment Gateway:</span>
            
            {/* M-Pesa Badge */}
            <span className="bg-emerald-950/80 border border-emerald-600/40 text-emerald-300 font-extrabold px-2.5 py-1 rounded text-[11px] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> M-PESA Paybill: {wpSettings.paybillNumber || '247247'} | Acc: {wpSettings.paybillAccount || '0797939199'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-right">
            <span className="text-slate-400">© 2026 {wpSettings.siteTitle}. All rights reserved.</span>
            <span className="text-slate-400 font-medium text-[11px] flex items-center gap-1">
              • A craft designed and developed by <strong className="text-blue-400 font-bold">DaveTech Solutions</strong>
            </span>
            <span className="bg-slate-800 text-orange-400 px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1 border border-slate-700">
              <Sparkles className="w-3 h-3" /> WordPress WooCommerce Sync
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
