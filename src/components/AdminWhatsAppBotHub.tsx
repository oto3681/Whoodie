import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { WhatsAppChatThread, BotRule, Product } from '../types';
import { 
  MessageCircle, 
  Bot, 
  Send, 
  Sparkles, 
  Phone, 
  ExternalLink, 
  DollarSign, 
  Plus, 
  Search, 
  Check, 
  CheckCheck, 
  User, 
  Settings, 
  FileText, 
  Smartphone, 
  ShieldCheck, 
  Zap, 
  RefreshCw, 
  Trash2, 
  Edit, 
  Building2, 
  Paperclip, 
  HelpCircle,
  Clock,
  CheckCircle2,
  XCircle,
  X,
  Play,
  Share2
} from 'lucide-react';

export const AdminWhatsAppBotHub: React.FC = () => {
  const { 
    whatsappThreads, 
    botRules, 
    activeThreadId, 
    isWhatBotGlobalActive,
    setActiveThreadId, 
    setIsWhatBotGlobalActive,
    sendMessageToThread, 
    toggleThreadBot, 
    updateThreadStatus, 
    createNewThread, 
    addBotRule, 
    updateBotRule, 
    deleteBotRule, 
    toggleBotRule, 
    simulateIncomingCustomerMessage,
    products,
    wpSettings,
    showToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'quoted' | 'paid' | 'proof_pending' | 'resolved'>('all');
  const [inputText, setInputText] = useState('');
  
  // Modals
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showBotRulesModal, setShowBotRulesModal] = useState(false);
  const [showSimulatorModal, setShowSimulatorModal] = useState(false);
  const [showProductAttachModal, setShowProductAttachModal] = useState(false);
  const [showPaymentAttachModal, setShowPaymentAttachModal] = useState(false);

  // New Chat Form
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustCompany, setNewCustCompany] = useState('');
  const [newCustTopic, setNewCustTopic] = useState('Custom Quotation & Branding');

  // New Bot Rule Form
  const [editingRule, setEditingRule] = useState<BotRule | null>(null);
  const [ruleKeyword, setRuleKeyword] = useState('');
  const [ruleTitle, setRuleTitle] = useState('');
  const [ruleCategory, setRuleCategory] = useState('General');
  const [ruleResponse, setRuleResponse] = useState('');

  // Simulator input
  const [simMessage, setSimMessage] = useState('');

  // Payment prompt amount
  const [customPayAmount, setCustomPayAmount] = useState('5500');
  const [customPayReason, setCustomPayReason] = useState('Commercial Print Order Deposit');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeThread = whatsappThreads.find((t) => t.id === activeThreadId) || whatsappThreads[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThread?.messages]);

  // Clean phone helper
  const formatPhoneForWa = (phone: string) => {
    const raw = phone.replace(/[^0-9]/g, '');
    return raw.startsWith('0') ? '254' + raw.slice(1) : raw;
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeThread) return;
    sendMessageToThread(activeThread.id, inputText.trim(), 'agent');
    setInputText('');
  };

  const handleSendViaWhatsAppWeb = (customText?: string) => {
    if (!activeThread) return;
    const textToSend = customText || inputText || `Hi ${activeThread.customerName}, this is Woodynat Designers Limited (0797939199). In regards to your inquiry on [${activeThread.topic}]...`;
    const cleanNumber = formatPhoneForWa(activeThread.customerPhone);
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(textToSend)}`;
    window.open(url, '_blank');
    if (inputText.trim()) {
      sendMessageToThread(activeThread.id, inputText.trim(), 'agent');
      setInputText('');
    }
  };

  const handleCreateNewChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim() || !newCustPhone.trim()) {
      showToast('Missing Fields', 'Please provide a customer name and phone number.', 'warning');
      return;
    }
    const created = createNewThread(newCustName.trim(), newCustPhone.trim(), newCustTopic.trim(), newCustCompany.trim());
    setShowNewChatModal(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustCompany('');
  };

  const handleSaveBotRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleKeyword.trim() || !ruleTitle.trim() || !ruleResponse.trim()) {
      showToast('Missing Info', 'Please fill in all rule fields.', 'warning');
      return;
    }

    if (editingRule) {
      updateBotRule({
        ...editingRule,
        keyword: ruleKeyword.trim(),
        title: ruleTitle.trim(),
        categoryTag: ruleCategory,
        response: ruleResponse.trim()
      });
    } else {
      addBotRule({
        keyword: ruleKeyword.trim(),
        title: ruleTitle.trim(),
        categoryTag: ruleCategory,
        response: ruleResponse.trim(),
        enabled: true
      });
    }

    setEditingRule(null);
    setRuleKeyword('');
    setRuleTitle('');
    setRuleResponse('');
  };

  const filteredThreads = whatsappThreads.filter((t) => {
    const matchesSearch = 
      t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customerPhone.includes(searchQuery) ||
      (t.companyName && t.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      t.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sendQuickResponse = (text: string) => {
    if (!activeThread) return;
    sendMessageToThread(activeThread.id, text, 'agent');
  };

  const handleAttachProductQuote = (p: Product) => {
    if (!activeThread) return;
    const quoteText = `📄 Official Quote for ${p.name}:\n• Unit Price: KSh ${p.price.toLocaleString()}\n• Delivery: Same-day / 24-48 Hours\n• Paybill: 247247 | Account: 0797939199`;
    sendMessageToThread(
      activeThread.id, 
      quoteText, 
      'agent', 
      'quote', 
      {
        productName: p.name,
        amount: p.price,
        paybill: '247247',
        account: '0797939199',
        imageUrl: p.image
      }
    );
    setShowProductAttachModal(false);
  };

  const handleAttachPaymentRequest = () => {
    if (!activeThread) return;
    const amountNum = parseFloat(customPayAmount) || 0;
    const payText = `💳 M-Pesa Payment Request for ${customPayReason}:\n• Amount: KSh ${amountNum.toLocaleString()}\n• Paybill: 247247\n• Account: 0797939199\n• Business: Woodynat Designers Limited\n\nOnce paid, please reply with the M-Pesa message reference here!`;
    sendMessageToThread(
      activeThread.id, 
      payText, 
      'agent', 
      'payment_request', 
      {
        productName: customPayReason,
        amount: amountNum,
        paybill: '247247',
        account: '0797939199'
      }
    );
    setShowPaymentAttachModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner / Controls */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-black px-3 py-1 rounded-full border border-emerald-500/40 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              WhatsApp Live: 0797939199
            </span>
            <span className="bg-blue-500/20 text-blue-300 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/40 flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-blue-300" />
              WhatBot 24/7 Smart Engine
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white mt-2 flex items-center gap-2">
            <span>Direct WhatsApp Customer Chat & WhatBot Automation Hub</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Chat in real-time with clients, auto-respond via keyword bot, dispatch product quotes & prompt M-Pesa payments (0797939199 / Paybill: 247247).
          </p>
        </div>

        {/* Global Controls & Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Global Bot Toggle */}
          <button
            onClick={() => {
              setIsWhatBotGlobalActive(!isWhatBotGlobalActive);
              showToast(
                !isWhatBotGlobalActive ? 'WhatBot Globally Active 🤖' : 'WhatBot Globally Paused ⏸️',
                !isWhatBotGlobalActive ? 'All incoming chats will receive instant automated answers.' : 'Automated replies paused. Manual live agent mode active.'
              );
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-sm border ${
              isWhatBotGlobalActive 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title="Toggle automated 24/7 WhatBot responses"
          >
            <Bot className="w-4 h-4" />
            <span>Auto-Bot: {isWhatBotGlobalActive ? 'ON' : 'OFF'}</span>
          </button>

          {/* Bot Rules Manager */}
          <button
            onClick={() => setShowBotRulesModal(true)}
            className="bg-slate-800 hover:bg-slate-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
            title="Configure WhatBot keyword triggers, rates, and answers"
          >
            <Settings className="w-4 h-4 text-blue-400" />
            <span>Bot Rules ({botRules.length})</span>
          </button>

          {/* Customer Simulator */}
          <button
            onClick={() => setShowSimulatorModal(true)}
            className="bg-purple-700 hover:bg-purple-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm border border-purple-600"
            title="Simulate incoming customer questions to test WhatBot responses"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Test Simulator</span>
          </button>

          {/* Start New Chat */}
          <button
            onClick={() => setShowNewChatModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm border border-blue-500"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Messenger Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[620px]">
        
        {/* LEFT COLUMN: Chat Threads List (4 cols) */}
        <div className="lg:col-span-4 border-r border-slate-200 flex flex-col bg-slate-50/50">
          
          {/* Search & Filter Header */}
          <div className="p-3.5 border-b border-slate-200 space-y-2 bg-white">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search conversations, names, phones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 font-medium placeholder-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              {(['all', 'active', 'quoted', 'paid', 'proof_pending', 'resolved'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg font-bold capitalize whitespace-nowrap transition-colors cursor-pointer ${
                    statusFilter === st 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'proof_pending' ? 'Proof Pending' : st}
                </button>
              ))}
            </div>
          </div>

          {/* Threads List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[580px]">
            {filteredThreads.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <MessageCircle className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-semibold">No conversations found.</p>
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="mt-3 text-xs text-blue-600 font-bold hover:underline"
                >
                  + Start a new WhatsApp chat
                </button>
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const isSelected = activeThread?.id === thread.id;
                return (
                  <div
                    key={thread.id}
                    onClick={() => setActiveThreadId(thread.id)}
                    className={`p-3.5 transition-all cursor-pointer relative flex gap-3 items-start ${
                      isSelected 
                        ? 'bg-blue-50/80 border-l-4 border-l-blue-600' 
                        : 'hover:bg-slate-100/70 bg-white'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      {thread.customerAvatar ? (
                        <img 
                          src={thread.customerAvatar} 
                          alt={thread.customerName} 
                          className="w-11 h-11 rounded-full object-cover border border-slate-200 shadow-xs"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                          {thread.customerName.charAt(0)}
                        </div>
                      )}
                      {thread.isBotActive ? (
                        <span className="absolute -bottom-1 -right-1 bg-purple-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white" title="WhatBot active">
                          🤖
                        </span>
                      ) : (
                        <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white" title="Live Agent active">
                          👨‍💼
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className="text-xs font-black text-slate-900 truncate">
                          {thread.customerName}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                          {thread.lastMessageTime}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[11px] font-bold text-emerald-700">
                          {thread.customerPhone}
                        </span>
                        {thread.companyName && (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium truncate">
                            {thread.companyName}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-600 truncate leading-snug">
                        {thread.lastMessage}
                      </p>

                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100/60">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full capitalize ${
                          thread.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                          thread.status === 'quoted' ? 'bg-blue-100 text-blue-800' :
                          thread.status === 'proof_pending' ? 'bg-amber-100 text-amber-800' :
                          thread.status === 'resolved' ? 'bg-slate-100 text-slate-700' :
                          'bg-indigo-50 text-indigo-700'
                        }`}>
                          {thread.status === 'proof_pending' ? 'Proof Pending' : thread.status}
                        </span>

                        {thread.unreadCount > 0 && (
                          <span className="bg-emerald-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                            {thread.unreadCount} new
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Stats Footer */}
          <div className="p-3 bg-slate-100 border-t border-slate-200 text-[11px] font-semibold text-slate-600 flex items-center justify-between">
            <span>{whatsappThreads.length} Total Threads</span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {whatsappThreads.filter(t => t.isBotActive).length} Bot Auto-Managed
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: Active Chat Window (8 cols) */}
        {activeThread ? (
          <div className="lg:col-span-8 flex flex-col h-full bg-slate-100/60">
            
            {/* Active Thread Header */}
            <div className="p-3.5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {activeThread.customerAvatar ? (
                    <img 
                      src={activeThread.customerAvatar} 
                      alt={activeThread.customerName} 
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-sm">
                      {activeThread.customerName.charAt(0)}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-sm text-slate-900">
                      {activeThread.customerName}
                    </h3>
                    {activeThread.companyName && (
                      <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        {activeThread.companyName}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span className="font-bold text-emerald-700">{activeThread.customerPhone}</span>
                    <span>•</span>
                    <span className="text-slate-600 truncate max-w-[220px]">Inquiry: {activeThread.topic}</span>
                  </div>
                </div>
              </div>

              {/* Header Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Bot Toggle for this thread */}
                <button
                  onClick={() => toggleThreadBot(activeThread.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                    activeThread.isBotActive
                      ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  }`}
                  title="Toggle WhatBot for this specific conversation"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>{activeThread.isBotActive ? 'WhatBot Replying' : 'Manual Agent Mode'}</span>
                </button>

                {/* Status Dropdown */}
                <select
                  value={activeThread.status}
                  onChange={(e) => updateThreadStatus(activeThread.id, e.target.value as any)}
                  className="bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="active">Status: Active</option>
                  <option value="quoted">Status: Quoted</option>
                  <option value="paid">Status: Paid (Paybill 247247)</option>
                  <option value="proof_pending">Status: Proof Pending</option>
                  <option value="resolved">Status: Resolved / Closed</option>
                </select>

                {/* Direct wa.me WhatsApp Button */}
                <button
                  onClick={() => handleSendViaWhatsAppWeb()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  title="Open real chat with this customer on WhatsApp Web/App (0797939199)"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Open WhatsApp</span>
                  <ExternalLink className="w-3 h-3 text-emerald-200" />
                </button>
              </div>
            </div>

            {/* Message Stream Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] max-h-[380px] min-h-[340px]">
              
              {/* Encryption & Woodynat Notice */}
              <div className="text-center my-2">
                <span className="bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-semibold px-3 py-1 rounded-full shadow-2xs inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  Woodynat Official WhatsApp Gateway (0797939199) • Direct Customer Line Active
                </span>
              </div>

              {activeThread.messages.map((msg) => {
                const isAgent = msg.sender === 'agent';
                const isBot = msg.sender === 'bot';
                const isCustomer = msg.sender === 'customer';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl shadow-xs space-y-2 relative ${
                        isCustomer
                          ? 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
                          : isBot
                          ? 'bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-tr-none border border-purple-800'
                          : 'bg-emerald-700 text-white rounded-tr-none shadow-md'
                      }`}
                    >
                      {/* Sender label */}
                      <div className="flex items-center justify-between gap-3 text-[10px] font-bold opacity-85">
                        <span className="flex items-center gap-1">
                          {isCustomer ? (
                            <span className="text-slate-600 font-extrabold">{activeThread.customerName} (Client)</span>
                          ) : isBot ? (
                            <span className="text-amber-300 font-extrabold flex items-center gap-1">
                              <Bot className="w-3 h-3" /> WhatBot Auto-Assistant
                            </span>
                          ) : (
                            <span className="text-emerald-100 font-extrabold flex items-center gap-1">
                              <User className="w-3 h-3" /> Woodynat Live Agent (0797939199)
                            </span>
                          )}
                        </span>
                        <span className="text-[10px]">{msg.timestamp}</span>
                      </div>

                      {/* Message body with preserved linebreaks */}
                      <div className="text-xs leading-relaxed whitespace-pre-wrap font-medium">
                        {msg.text}
                      </div>

                      {/* Rich Attachment Card if present */}
                      {msg.attachmentType === 'quote' && msg.attachmentData && (
                        <div className={`p-2.5 rounded-xl text-xs space-y-1 mt-2 border ${
                          isCustomer ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-white/10 border-white/20 text-white'
                        }`}>
                          <div className="flex items-center justify-between font-extrabold">
                            <span>📦 {msg.attachmentData.productName}</span>
                            <span className="text-amber-300">KSh {msg.attachmentData.amount?.toLocaleString()}</span>
                          </div>
                          <div className="text-[10px] opacity-90">
                            Paybill: 247247 | Acc: 0797939199
                          </div>
                        </div>
                      )}

                      {msg.attachmentType === 'payment_request' && msg.attachmentData && (
                        <div className="bg-amber-500/20 border border-amber-400/40 p-2.5 rounded-xl text-xs text-amber-200 space-y-1 mt-2">
                          <div className="font-extrabold text-amber-300 flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5" /> M-Pesa Prompt: KSh {msg.attachmentData.amount?.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-amber-100">
                            Business Paybill: 247247 • Account: 0797939199
                          </div>
                        </div>
                      )}

                      {/* Delivery Status indicator for agent */}
                      {!isCustomer && (
                        <div className="flex items-center justify-end gap-1 text-[10px] opacity-75 pt-0.5">
                          {msg.status === 'read' ? (
                            <CheckCheck className="w-3 h-3 text-blue-300" />
                          ) : (
                            <Check className="w-3 h-3 text-slate-300" />
                          )}
                          <span className="capitalize">{msg.status}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Canned Responses Bar */}
            <div className="px-4 py-2 bg-white border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" /> Quick Reply:
              </span>
              <button
                onClick={() => sendQuickResponse("💳 Official M-Pesa Paybill: 247247 | Account: 0797939199 | Business: Woodynat Designers Limited. Please share transaction code once done!")}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold px-2.5 py-1 rounded-lg shrink-0 transition-colors cursor-pointer"
              >
                💳 Paybill 247247
              </button>
              <button
                onClick={() => sendQuickResponse("📍 We are located at Temple Road Gatkim complex building fourth floor wing B Room 4B1, Nairobi CBD. Open Mon-Sat 7:30 AM to 6:30 PM.")}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold px-2.5 py-1 rounded-lg shrink-0 transition-colors cursor-pointer"
              >
                📍 Gatkim Complex CBD
              </button>
              <button
                onClick={() => sendQuickResponse("👕 Custom Round Neck T-Shirt: KSh 550 per piece (100% Combed Cotton, includes front logo print). Available in all sizes & colors!")}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold px-2.5 py-1 rounded-lg shrink-0 transition-colors cursor-pointer"
              >
                👕 T-Shirts @550
              </button>
              <button
                onClick={() => sendQuickResponse("🧥 Heavyweight Cotton Fleece Hoodies (280GSM): KSh 1,800/pc with full-color DTF print or embroidery included. Turnaround 2 days.")}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold px-2.5 py-1 rounded-lg shrink-0 transition-colors cursor-pointer"
              >
                🧥 Hoodies @1800
              </button>
              <button
                onClick={() => sendQuickResponse("🏁 Roll-Up Banners: Light Base @ KSh 6,500 | Large Heavy Duty Base @ KSh 8,500. Anti-curl satin film with padded carry case included.")}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold px-2.5 py-1 rounded-lg shrink-0 transition-colors cursor-pointer"
              >
                🏁 Banners Rate Card
              </button>
              <button
                onClick={() => sendQuickResponse("🕊️ Memorial & Funeral Programs: Express 24-hour turnaround available. 4-page glossy from KSh 50/pc, 8-page booklet from KSh 90/pc with portrait layout.")}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold px-2.5 py-1 rounded-lg shrink-0 transition-colors cursor-pointer"
              >
                🕊️ 24h Memorial
              </button>
            </div>

            {/* Input & Action Bar */}
            <div className="p-3 bg-white border-t border-slate-200 space-y-2">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                
                {/* Attach Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowProductAttachModal(true)}
                    className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                    title="Attach Product Price Quote"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPaymentAttachModal(true)}
                    className="p-2 rounded-xl text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                    title="Attach M-Pesa Paybill Request"
                  >
                    <DollarSign className="w-4 h-4" />
                  </button>
                </div>

                {/* Text input */}
                <input
                  type="text"
                  placeholder={`Reply as Woodynat Live Agent (0797939199) to ${activeThread.customerName}...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium"
                />

                {/* Send via App */}
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>

                {/* Send via WhatsApp Web */}
                <button
                  type="button"
                  onClick={() => handleSendViaWhatsAppWeb()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                  title="Dispatch drafted text directly to customer's WhatsApp (0797939199)"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 flex flex-col items-center justify-center p-12 text-slate-400 text-center">
            <MessageCircle className="w-16 h-16 text-slate-300 mb-3" />
            <h3 className="font-extrabold text-slate-700 text-base mb-1">No Active Chat Selected</h3>
            <p className="text-xs text-slate-500 max-w-sm mb-4">
              Select a customer conversation from the list or start a new WhatsApp thread.
            </p>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs"
            >
              + Start New WhatsApp Conversation
            </button>
          </div>
        )}
      </div>

      {/* ================= MODAL 1: START NEW CHAT ================= */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Initiate WhatsApp Conversation</h3>
                  <p className="text-[11px] text-slate-500">Official Sender: Woodynat (0797939199)</p>
                </div>
              </div>
              <button onClick={() => setShowNewChatModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewChat} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Peter Njoroge"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">WhatsApp Phone Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 0712345678 or +254712345678"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Company / Organization (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Safaricom Marathon / St. Jude School"
                  value={newCustCompany}
                  onChange={(e) => setNewCustCompany(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Inquiry Topic</label>
                <select
                  value={newCustTopic}
                  onChange={(e) => setNewCustTopic(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Round Neck T-Shirts & Polos Quote">Round Neck T-Shirts & Polos Quote</option>
                  <option value="Custom Fleece Hoodies & Sweaters">Custom Fleece Hoodies & Sweaters</option>
                  <option value="Roll-Up & Teardrop Banners">Roll-Up & Teardrop Banners</option>
                  <option value="Safety Reflectors & Aprons">Safety Reflectors & Aprons</option>
                  <option value="24h Urgent Memorial Programs">24h Urgent Memorial Programs</option>
                  <option value="Branding & Acrylic Signage">Branding & Acrylic Signage</option>
                  <option value="General Commercial Quote">General Commercial Quote</option>
                </select>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewChatModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 rounded-xl transition-colors shadow-md flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Start Chat</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: WHATBOT RULES MANAGER ================= */}
      {showBotRulesModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 space-y-4 border border-slate-200 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">WhatBot Keyword Triggers & Auto-Replies</h3>
                  <p className="text-xs text-slate-500">Configure automated response rules for 0797939199</p>
                </div>
              </div>
              <button onClick={() => setShowBotRulesModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Rule Creator Form */}
            <form onSubmit={handleSaveBotRule} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
              <div className="font-extrabold text-slate-800 flex items-center justify-between">
                <span>{editingRule ? 'Edit Trigger Rule' : 'Add New WhatBot Trigger Rule'}</span>
                {editingRule && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingRule(null);
                      setRuleKeyword('');
                      setRuleTitle('');
                      setRuleResponse('');
                    }}
                    className="text-[11px] text-blue-600 font-bold hover:underline"
                  >
                    Cancel Editing
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="font-bold text-slate-700 block mb-1">Rule Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mug Printing Rates"
                    value={ruleTitle}
                    onChange={(e) => setRuleTitle(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="font-bold text-slate-700 block mb-1">Keywords (Pipe | Separated)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. mug|mugs|magic mug|cups"
                    value={ruleKeyword}
                    onChange={(e) => setRuleKeyword(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={ruleCategory}
                    onChange={(e) => setRuleCategory(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-semibold focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="General">General</option>
                    <option value="Apparel">Apparel (T-Shirts/Hoodies)</option>
                    <option value="Signage & Banners">Signage & Banners</option>
                    <option value="Stationery">Stationery & Memorials</option>
                    <option value="Payments">Payments & Paybill</option>
                    <option value="Support">Support & Live Agent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Auto-Response Content (WhatsApp Formatted)</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Type the message WhatBot will send when keyword triggers..."
                  value={ruleResponse}
                  onChange={(e) => setRuleResponse(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800 focus:ring-2 focus:ring-purple-500 font-mono"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-purple-700 hover:bg-purple-800 text-white font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>{editingRule ? 'Save Rule Changes' : 'Create Bot Rule'}</span>
                </button>
              </div>
            </form>

            {/* Rules List */}
            <div className="flex-1 overflow-y-auto space-y-2 max-h-[300px]">
              <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Active Bot Rules ({botRules.length})
              </h4>
              {botRules.map((rule) => (
                <div 
                  key={rule.id}
                  className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs transition-colors ${
                    rule.enabled ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-slate-900">{rule.title}</span>
                      <span className="bg-purple-50 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded border border-purple-200">
                        {rule.categoryTag || 'General'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Keywords: [{rule.keyword}]
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 whitespace-pre-wrap font-sans bg-slate-50 p-2 rounded-lg border border-slate-100">
                      {rule.response}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start">
                    <button
                      onClick={() => toggleBotRule(rule.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-colors ${
                        rule.enabled 
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      {rule.enabled ? 'Active' : 'Disabled'}
                    </button>
                    <button
                      onClick={() => {
                        setEditingRule(rule);
                        setRuleKeyword(rule.keyword);
                        setRuleTitle(rule.title);
                        setRuleCategory(rule.categoryTag || 'General');
                        setRuleResponse(rule.response);
                      }}
                      className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Edit rule"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteBotRule(rule.id)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete rule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowBotRulesModal(false)}
                className="bg-slate-900 text-white font-bold px-4 py-2 rounded-xl text-xs"
              >
                Close Rule Manager
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: CUSTOMER SIMULATOR BENCH ================= */}
      {showSimulatorModal && activeThread && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4 text-purple-700" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">WhatBot Customer Simulator</h3>
                  <p className="text-[11px] text-slate-500">Test incoming messages for {activeThread.customerName}</p>
                </div>
              </div>
              <button onClick={() => setShowSimulatorModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Click any preset client inquiry below or type a custom question to simulate a real customer message sent to WhatsApp <strong>0797939199</strong>:
              </p>

              {/* Quick Preset Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    simulateIncomingCustomerMessage(activeThread.id, "Hi");
                    setShowSimulatorModal(false);
                  }}
                  className="bg-slate-100 hover:bg-purple-100 hover:text-purple-900 text-slate-700 font-bold p-2 rounded-xl text-left transition-colors border border-slate-200"
                >
                  💬 "Hi" (Welcome Menu)
                </button>
                <button
                  onClick={() => {
                    simulateIncomingCustomerMessage(activeThread.id, "1");
                    setShowSimulatorModal(false);
                  }}
                  className="bg-slate-100 hover:bg-purple-100 hover:text-purple-900 text-slate-700 font-bold p-2 rounded-xl text-left transition-colors border border-slate-200"
                >
                  👕 "1" (T-Shirts Rates)
                </button>
                <button
                  onClick={() => {
                    simulateIncomingCustomerMessage(activeThread.id, "2");
                    setShowSimulatorModal(false);
                  }}
                  className="bg-slate-100 hover:bg-purple-100 hover:text-purple-900 text-slate-700 font-bold p-2 rounded-xl text-left transition-colors border border-slate-200"
                >
                  🧥 "2" (Hoodies Pricing)
                </button>
                <button
                  onClick={() => {
                    simulateIncomingCustomerMessage(activeThread.id, "4");
                    setShowSimulatorModal(false);
                  }}
                  className="bg-slate-100 hover:bg-purple-100 hover:text-purple-900 text-slate-700 font-bold p-2 rounded-xl text-left transition-colors border border-slate-200"
                >
                  💳 "4" (Paybill 247247)
                </button>
                <button
                  onClick={() => {
                    simulateIncomingCustomerMessage(activeThread.id, "Where are you located in CBD?");
                    setShowSimulatorModal(false);
                  }}
                  className="bg-slate-100 hover:bg-purple-100 hover:text-purple-900 text-slate-700 font-bold p-2 rounded-xl text-left transition-colors border border-slate-200"
                >
                  📍 "Where are you located?"
                </button>
                <button
                  onClick={() => {
                    simulateIncomingCustomerMessage(activeThread.id, "I need to talk to a human specialist");
                    setShowSimulatorModal(false);
                  }}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold p-2 rounded-xl text-left transition-colors border border-rose-200"
                >
                  👨‍💼 "7" (Request Live Agent)
                </button>
              </div>

              {/* Freeform input */}
              <div className="pt-2">
                <label className="font-bold text-slate-700 block mb-1">Or Type Custom Client Message:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Can you print 200 reflective safety vests?"
                    value={simMessage}
                    onChange={(e) => setSimMessage(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      if (!simMessage.trim()) return;
                      simulateIncomingCustomerMessage(activeThread.id, simMessage.trim());
                      setSimMessage('');
                      setShowSimulatorModal(false);
                    }}
                    className="bg-purple-700 hover:bg-purple-800 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs"
                  >
                    Simulate
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: ATTACH PRODUCT QUOTE ================= */}
      {showProductAttachModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-sm text-slate-900">Select Product to Attach Quote</h3>
              </div>
              <button onClick={() => setShowProductAttachModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 max-h-[360px] divide-y divide-slate-100">
              {products.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleAttachProductQuote(p)}
                  className="p-3 rounded-xl hover:bg-blue-50/70 transition-colors cursor-pointer flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img src={p.image} alt={p.name} className="w-12 h-12 rounded-lg object-cover border border-slate-200" />
                    <div>
                      <h4 className="font-extrabold text-slate-900">{p.name}</h4>
                      <span className="text-slate-500 text-[11px]">{p.category}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-black text-emerald-700 text-sm block">KSh {p.price.toLocaleString()}</span>
                    <span className="text-blue-600 text-[11px] font-bold">Attach ➔</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 5: ATTACH M-PESA PAYMENT PROMPT ================= */}
      {showPaymentAttachModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <DollarSign className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-sm text-slate-900">Send M-Pesa Paybill Request</h3>
              </div>
              <button onClick={() => setShowPaymentAttachModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-emerald-50 text-emerald-900 p-3 rounded-xl border border-emerald-200 space-y-1 text-xs">
                <div className="font-extrabold">Official Account Configured:</div>
                <div>• Paybill: <strong>247247</strong></div>
                <div>• Account Number: <strong>0797939199</strong></div>
                <div>• Business Name: <strong>Woodynat Designers Limited</strong></div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Reason / Order Description</label>
                <input
                  type="text"
                  value={customPayReason}
                  onChange={(e) => setCustomPayReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Amount to Prompt (KSh)</label>
                <input
                  type="number"
                  value={customPayAmount}
                  onChange={(e) => setCustomPayAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-emerald-700 text-base"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentAttachModal(false)}
                  className="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAttachPaymentRequest}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 rounded-xl shadow-md flex items-center justify-center gap-1.5"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Send Request</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
