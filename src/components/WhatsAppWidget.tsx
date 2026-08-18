import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  MessageCircle, 
  X, 
  Send, 
  Sparkles, 
  PhoneCall, 
  Bot, 
  CheckCheck, 
  ExternalLink, 
  MapPin, 
  CreditCard, 
  RotateCcw,
  Smartphone,
  QrCode,
  ShieldCheck,
  User,
  Phone
} from 'lucide-react';

interface WidgetMessage {
  id: string;
  sender: 'bot' | 'agent' | 'user';
  text: string;
  timestamp: string;
  quoteData?: {
    productName: string;
    price: number;
  };
}

export const WhatsAppWidget: React.FC = () => {
  const { wpSettings, botRules, addInquiry, sendMessageToThread, createNewThread, whatsappThreads } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'direct'>('chat');
  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadAlert, setUnreadAlert] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const officialNumber = '0797939199';
  const cleanPhone = '254797939199';

  const defaultInitialMessages: WidgetMessage[] = [
    {
      id: 'wm-01',
      sender: 'bot',
      text: `👋 Hello! Welcome to Woodynat Designers Limited (Official WhatsApp: ${officialNumber}).\n\nHow can our design & printing team help you today?`,
      timestamp: 'Just now'
    },
    {
      id: 'wm-02',
      sender: 'bot',
      text: `💡 Tap any quick topic below or type your custom inquiry:`,
      timestamp: 'Just now'
    }
  ];

  const [messages, setMessages] = useState<WidgetMessage[]>(() => {
    const saved = sessionStorage.getItem('woodynat_widget_chat');
    return saved ? JSON.parse(saved) : defaultInitialMessages;
  });

  useEffect(() => {
    sessionStorage.setItem('woodynat_widget_chat', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setUnreadAlert(false);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages, isTyping]);

  const quickChips = [
    { label: '1️⃣ T-Shirts & Polos', value: '1' },
    { label: '2️⃣ Custom Hoodies', value: '2' },
    { label: '3️⃣ Banners & Signage', value: '3' },
    { label: '4️⃣ M-Pesa Paybill', value: '4' },
    { label: '5️⃣ Shop Location', value: '5' },
    { label: '6️⃣ 24h Memorials', value: '6' },
    { label: '7️⃣ Live Specialist', value: '7' },
  ];

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userText = textToSend.trim();
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsgObj: WidgetMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: timeNow
    };

    setMessages((prev) => [...prev, userMsgObj]);
    setInputMsg('');
    setIsTyping(true);

    // Sync to AppContext inquiry & thread
    try {
      addInquiry({
        customerName: 'WhatsApp Widget Visitor',
        customerPhone: officialNumber,
        inquiryTopic: userText.slice(0, 50),
        notes: `Widget Live Chat inquiry: "${userText}"`,
        status: 'New'
      });
    } catch (e) {
      // Non-blocking
    }

    // Match WhatBot rules
    setTimeout(() => {
      setIsTyping(false);
      const lower = userText.toLowerCase();

      // Look up bot rules
      const matched = botRules.find((r) => {
        if (!r.enabled) return false;
        const keys = r.keyword.split('|').map((k) => k.trim().toLowerCase());
        return keys.some((k) => {
          if (k.length <= 2) return lower === k || lower.startsWith(`${k} `) || lower.includes(` ${k} `);
          return lower.includes(k);
        });
      });

      let botReplyText = '';
      if (matched) {
        botReplyText = matched.response;
      } else if (lower.includes('price') || lower.includes('cost') || lower.includes('quote') || lower.includes('rate')) {
        botReplyText = `📄 Woodynat Quick Print Rates:\n• Round Neck T-Shirts: KSh 550/pc\n• Heavy Polo Shirts: KSh 850/pc\n• Custom Hoodies: KSh 2,500/pc (Heavy 320GSM)\n• Roll-Up Banner: KSh 6,500 (Light) / KSh 8,500 (Large Base)\n• Reflectors: KSh 350/pc\n• Paybill: 247247 | Acc: 0797939199`;
      } else {
        botReplyText = `👋 Thank you for your inquiry!\n\nWoodynat Designers (0797939199) is ready to process your order. You can reply with a number (1 to 7) or tap "Open in Official WhatsApp" below to chat directly on your phone!`;
      }

      const botMsgObj: WidgetMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsgObj]);
    }, 600);
  };

  const handleResetChat = () => {
    setMessages(defaultInitialMessages);
    sessionStorage.removeItem('woodynat_widget_chat');
  };

  const openWhatsAppDirect = (customText?: string) => {
    const lastUserText = messages.filter((m) => m.sender === 'user').slice(-1)[0]?.text;
    const textToSend = customText || lastUserText || `Hi Woodynat Designers Limited (0797939199)! I would like to inquire about design and printing services.`;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(textToSend)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end print:hidden">
      
      {/* Floating Messenger Window */}
      {isOpen && (
        <div className="mb-3 w-[92vw] sm:w-[380px] bg-slate-900 rounded-3xl shadow-2xl border border-slate-700/80 overflow-hidden flex flex-col h-[560px] animate-in fade-in slide-in-from-bottom-6 duration-200">
          
          {/* WhatsApp Header */}
          <div className="bg-[#075E54] p-3.5 text-white flex items-center justify-between border-b border-[#054c44] shadow-sm shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-emerald-700 border-2 border-emerald-400 flex items-center justify-center font-black text-white text-base shadow-sm">
                  WD
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#075E54] rounded-full animate-pulse"></span>
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-extrabold text-sm text-white truncate max-w-[170px]">Woodynat Designers</h4>
                  <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
                </div>
                <p className="text-[11px] text-emerald-100 flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
                  Active: {officialNumber} (24/7 Live)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                className="p-1.5 text-emerald-100 hover:text-white hover:bg-emerald-800/60 rounded-lg transition-colors cursor-pointer"
                title="Restart Conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-emerald-100 hover:text-white hover:bg-emerald-800/60 rounded-lg transition-colors cursor-pointer"
                title="Close Widget"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Sub Navigation Bar */}
          <div className="bg-[#054c44] px-3 py-1.5 flex items-center justify-between text-xs text-emerald-100 border-b border-emerald-800/60 shrink-0">
            <div className="flex items-center gap-2 font-bold">
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-2.5 py-0.5 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'chat' ? 'bg-emerald-700 text-white shadow-xs' : 'text-emerald-200 hover:text-white'
                }`}
              >
                💬 Live Chatbot
              </button>
              <button
                onClick={() => setActiveTab('direct')}
                className={`px-2.5 py-0.5 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'direct' ? 'bg-emerald-700 text-white shadow-xs' : 'text-emerald-200 hover:text-white'
                }`}
              >
                📱 Direct & QR Code
              </button>
            </div>

            <a
              href={`tel:${officialNumber}`}
              className="flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-amber-200 bg-emerald-800/80 px-2 py-0.5 rounded-md transition-colors"
              title={`Call ${officialNumber} directly`}
            >
              <Phone className="w-3 h-3" />
              <span>Call Hotline</span>
            </a>
          </div>

          {/* TAB 1: LIVE CONVERSATION */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col bg-[#0b141a] relative overflow-hidden">
              
              {/* Chat Stream with WhatsApp Wallpaper styling */}
              <div 
                className="flex-1 p-3.5 space-y-3 overflow-y-auto"
                style={{
                  backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 0)',
                  backgroundSize: '16px 16px'
                }}
              >
                {/* Date / Security Notice Pill */}
                <div className="text-center my-1">
                  <span className="bg-[#182229] text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full border border-emerald-900/40 inline-flex items-center gap-1 shadow-xs">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    End-to-End Live Assistant • 0797939199
                  </span>
                </div>

                {messages.map((m) => {
                  const isBotOrAgent = m.sender === 'bot' || m.sender === 'agent';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isBotOrAgent ? 'items-start' : 'items-end'} animate-in fade-in duration-150`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-md ${
                          isBotOrAgent
                            ? 'bg-[#202c33] text-slate-100 rounded-tl-xs border border-slate-700/50'
                            : 'bg-[#005c4b] text-white rounded-tr-xs border border-emerald-700/40'
                        }`}
                      >
                        <div className="whitespace-pre-wrap font-medium">
                          {m.text}
                        </div>

                        <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-400">
                          <span>{m.timestamp}</span>
                          {!isBotOrAgent && <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex items-center gap-2 bg-[#202c33] text-slate-300 p-2.5 rounded-2xl rounded-tl-xs text-xs max-w-[170px] border border-slate-700/50">
                    <Bot className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                    <span className="font-semibold text-[11px] animate-pulse">WhatBot is typing...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Interactive Quick Action Buttons */}
              <div className="bg-[#111b21] p-2 border-t border-slate-800 shrink-0">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1 flex items-center justify-between">
                  <span>Quick Instant Prompts:</span>
                  <span className="text-emerald-400">0797939199</span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                  {quickChips.map((chip) => (
                    <button
                      key={chip.value}
                      onClick={() => handleSendMessage(chip.value)}
                      className="bg-[#202c33] hover:bg-[#005c4b] text-slate-200 hover:text-white px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-colors border border-slate-700 hover:border-emerald-500 cursor-pointer shadow-2xs"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Input & Action Controls */}
              <div className="bg-[#202c33] p-2.5 border-t border-slate-800 shrink-0 space-y-2">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage(inputMsg);
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    placeholder="Type a message or rate inquiry..."
                    className="flex-1 bg-[#2a3942] text-white placeholder-slate-400 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  />
                  <button
                    type="submit"
                    disabled={!inputMsg.trim()}
                    className="bg-[#00a884] hover:bg-[#008f6f] disabled:opacity-40 text-white p-2 rounded-xl transition-all cursor-pointer shadow-md shrink-0"
                    title="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

                {/* Primary Direct WhatsApp Handover Button */}
                <button
                  onClick={() => openWhatsAppDirect()}
                  className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-transform active:scale-98 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-slate-950 text-emerald-500" />
                  <span>Open & Continue in WhatsApp App (0797939199)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: DIRECT CLICK-TO-CHAT & QR CODE */}
          {activeTab === 'direct' && (
            <div className="flex-1 p-5 bg-[#0b141a] text-slate-200 overflow-y-auto space-y-4 text-xs">
              
              <div className="bg-[#182229] p-4 rounded-2xl border border-slate-700 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-sm">Official WhatsApp Desk</h4>
                  <p className="text-emerald-400 font-mono font-bold text-base mt-0.5">0797939199</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Direct International: +254 797 939 199
                  </p>
                </div>

                <a
                  href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent('Hi Woodynat Designers Limited! I am reaching out from your online portal.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-colors inline-block"
                >
                  <MessageCircle className="w-4 h-4 fill-slate-950 text-emerald-500" />
                  <span>Start WhatsApp Chat (1-Click)</span>
                </a>
              </div>

              {/* Workshop & Payment Quick Info */}
              <div className="space-y-2 bg-[#182229] p-3.5 rounded-2xl border border-slate-700/80">
                <div className="flex items-start gap-2 text-slate-300">
                  <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Physical Workshop:</span>
                    <span>Temple Road Gatkim Complex Building 4th Floor Wing B Room 4B1, Nairobi CBD.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-slate-300 pt-2 border-t border-slate-700/60">
                  <CreditCard className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Lipa na M-Pesa Paybill:</span>
                    <span>Business No: <strong className="text-white">247247</strong> | Account: <strong className="text-emerald-300">0797939199</strong></span>
                  </div>
                </div>
              </div>

              {/* Call Hotline */}
              <a
                href={`tel:${officialNumber}`}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-600 transition-colors"
              >
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span>Call Production Team ({officialNumber})</span>
              </a>

            </div>
          )}

        </div>
      )}

      {/* Floating Trigger Button with Live Indicator Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-[#25D366] hover:bg-[#20bd5a] text-white p-3.5 sm:p-4 rounded-full shadow-2xl flex items-center gap-2.5 hover:scale-105 active:scale-95 transition-all cursor-pointer group border-2 border-white"
        aria-label="Live WhatsApp Support 0797939199"
      >
        {/* Pulse beacon */}
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-600 border border-white text-[9px] font-black text-white items-center justify-center">1</span>
        </span>

        <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 fill-white text-emerald-600" />
        
        <div className="text-left pr-1 hidden sm:block">
          <div className="text-[11px] font-black leading-none text-slate-950">WhatsApp Live</div>
          <div className="text-[9px] font-bold text-emerald-950 font-mono">0797939199</div>
        </div>
      </button>

    </div>
  );
};
