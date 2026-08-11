import React from 'react';
import { useApp } from '../context/AppContext';
import { Zap, Phone, Truck } from 'lucide-react';

export const BannerNotice: React.FC = () => {
  const { wpSettings, setActiveModal } = useApp();

  const rawPhone = wpSettings.whatsappNumber.replace(/[^0-9]/g, '');
  const cleanPhone = rawPhone.startsWith('0') ? '254' + rawPhone.slice(1) : rawPhone;

  return (
    <div className="bg-slate-100 text-slate-800 text-xs py-2 px-4 border-b border-slate-200 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
        <div className="flex items-center gap-2 overflow-hidden text-center md:text-left">
          <span className="bg-blue-600 text-white font-extrabold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider flex items-center gap-1 shrink-0 shadow-xs">
            <Zap className="w-3 h-3 fill-white" /> MEGA FLASH SALE
          </span>
          <p className="truncate font-semibold text-slate-700 text-xs">
            {wpSettings.topBannerText}
          </p>
        </div>

        <div className="flex items-center gap-4 text-slate-600 text-xs shrink-0 font-medium">
          <span className="hidden sm:flex items-center gap-1 text-slate-700 font-semibold">
            <Truck className="w-3.5 h-3.5 text-blue-600" /> Countrywide Delivery
          </span>
          <a 
            href={`https://wa.me/${cleanPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-bold"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-600" /> Call/WhatsApp: {wpSettings.whatsappNumber}
          </a>
          <button
            onClick={() => setActiveModal('track')}
            className="text-blue-600 hover:text-blue-700 font-extrabold underline cursor-pointer"
          >
            Track Order
          </button>
        </div>
      </div>
    </div>
  );
};
