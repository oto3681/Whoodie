import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MessageCircle, X, Send, Sparkles, PhoneCall } from 'lucide-react';

export const WhatsAppWidget: React.FC = () => {
  const { wpSettings } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('Custom Quotation');
  const [userMsg, setUserMsg] = useState('');

  const rawPhone = wpSettings.whatsappNumber.replace(/[^0-9]/g, '');
  const cleanPhone = rawPhone.startsWith('0') ? '254' + rawPhone.slice(1) : rawPhone;

  const quickTopics = [
    'Custom T-Shirt / Hoodie Quote',
    'Express 24h Funeral Program / Eulogy',
    'Banners & Vehicle Branding',
    'Bulk Sticker / Label Printing',
    'Documentary Filming Package'
  ];

  const handleSend = () => {
    const text = `Hi ${wpSettings.siteTitle}! I am inquiring about [${selectedTopic}]. ${userMsg ? `Details: ${userMsg}` : ''}`;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Floating Drawer Popup */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight">Woodynat Designers Live Support</h4>
                <p className="text-[11px] text-emerald-100 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" /> Online & Instant Replies
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-emerald-100 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3 bg-slate-50">
            <div className="bg-emerald-50 text-emerald-900 border border-emerald-200 p-3 rounded-xl text-xs leading-relaxed">
              👋 Hello! How can our design and printing team help you today? Choose an inquiry subject or type below:
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Select Service / Product:
              </label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {quickTopics.map((topic) => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Additional Instructions / Quantity:
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Need 50 Hoodies printed with logo on front & back..."
                value={userMsg}
                onChange={(e) => setUserMsg(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <button
              onClick={handleSend}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Start WhatsApp Chat</span>
            </button>

            <div className="text-[10px] text-center text-slate-400 flex items-center justify-center gap-1 pt-1">
              <PhoneCall className="w-3 h-3 text-emerald-600" /> Direct Call Hotline: {wpSettings.supportPhone}
            </div>
          </div>
        </div>
      )}

      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-full shadow-2xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all cursor-pointer group border-2 border-white"
        aria-label="WhatsApp Inquiry"
      >
        <MessageCircle className="w-7 h-7 fill-white text-emerald-500" />
        <span className="hidden group-hover:inline text-xs font-extrabold pr-1">
          WhatsApp Inquiry
        </span>
      </button>
    </div>
  );
};
