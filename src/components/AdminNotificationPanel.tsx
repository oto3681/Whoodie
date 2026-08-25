import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AdminNotification } from '../types';
import { 
  Bell, 
  BellRing, 
  CheckCircle2, 
  Clock, 
  ShoppingBag, 
  FileText, 
  MessageCircle, 
  Phone, 
  Smartphone, 
  ArrowRight, 
  Trash2, 
  CheckCheck, 
  Filter, 
  Search, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  X, 
  Send, 
  Layers, 
  AlertCircle,
  Building2,
  Mail,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Zap,
  RefreshCw,
  Plus
} from 'lucide-react';
import { playNotificationSound } from '../utils/audioNotification';

interface AdminNotificationPanelProps {
  onNavigateTab?: (tab: 'orders' | 'catalogue' | 'whatsapp' | 'bulk' | 'wordpress' | 'zoho' | 'kpis' | 'products') => void;
}

export const AdminNotificationPanel: React.FC<AdminNotificationPanelProps> = ({ onNavigateTab }) => {
  const {
    adminNotifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    acceptOrderFromNotification,
    acceptInquiryFromNotification,
    declineNotification,
    deleteNotification,
    clearAllNotifications,
    simulateIncomingOrderNotification,
    simulateIncomingInquiryNotification,
    sendOrderConfirmationEmail,
    wpSettings,
    showToast
  } = useApp();

  const [filterType, setFilterType] = useState<'all' | 'pending' | 'orders' | 'inquiries' | 'accepted'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedNotifForModal, setSelectedNotifForModal] = useState<AdminNotification | null>(null);
  const [customActionNote, setCustomActionNote] = useState('');
  const [isAcceptingId, setIsAcceptingId] = useState<string | null>(null);
  const [isSendingEmailId, setIsSendingEmailId] = useState<string | null>(null);

  // Filter logic
  const filteredNotifications = adminNotifications.filter((n) => {
    // Type/Status filter
    if (filterType === 'pending' && n.status !== 'pending') return false;
    if (filterType === 'orders' && n.type !== 'order_placed') return false;
    if (filterType === 'inquiries' && n.type !== 'inquiry_submitted') return false;
    if (filterType === 'accepted' && n.status !== 'accepted') return false;

    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = n.title.toLowerCase().includes(q);
      const matchMsg = n.message.toLowerCase().includes(q);
      const matchName = n.referenceData?.customerName?.toLowerCase().includes(q);
      const matchPhone = n.referenceData?.customerPhone?.includes(q);
      const matchRef = n.referenceId?.toLowerCase().includes(q);
      const matchCompany = n.referenceData?.companyName?.toLowerCase().includes(q);
      return matchTitle || matchMsg || matchName || matchPhone || matchRef || matchCompany;
    }

    return true;
  });

  const pendingOrdersCount = adminNotifications.filter(n => n.type === 'order_placed' && n.status === 'pending').length;
  const pendingInquiriesCount = adminNotifications.filter(n => n.type === 'inquiry_submitted' && n.status === 'pending').length;
  const acceptedCount = adminNotifications.filter(n => n.status === 'accepted').length;

  const handleDirectAccept = (notif: AdminNotification) => {
    setIsAcceptingId(notif.id);
    setTimeout(() => {
      if (notif.type === 'order_placed') {
        acceptOrderFromNotification(notif.id, notif.referenceId, 'Order verified and accepted by Admin. Production line activated.');
      } else {
        acceptInquiryFromNotification(notif.id, notif.referenceId, 'Inquiry acknowledged and accepted. Quotation rate sheet prepared.');
      }
      setIsAcceptingId(null);
    }, 400);
  };

  const handleOpenCustomAcceptModal = (notif: AdminNotification) => {
    setSelectedNotifForModal(notif);
    setCustomActionNote(
      notif.type === 'order_placed'
        ? `Order #${notif.referenceId} accepted by Admin. Assigned to WoodyNat pre-press queue at Gatkim Complex 4th Floor.`
        : `Quote inquiry for ${notif.referenceData.customerName} accepted. Official 2026 catalogue & pricing prepared.`
    );
  };

  const handleConfirmModalAccept = () => {
    if (!selectedNotifForModal) return;
    if (selectedNotifForModal.type === 'order_placed') {
      acceptOrderFromNotification(selectedNotifForModal.id, selectedNotifForModal.referenceId, customActionNote);
    } else {
      acceptInquiryFromNotification(selectedNotifForModal.id, selectedNotifForModal.referenceId, customActionNote);
    }
    setSelectedNotifForModal(null);
  };

  const handleQuickSendEmail = async (notif: AdminNotification) => {
    const targetEmail = notif.referenceData?.customerEmail;
    if (!targetEmail || !targetEmail.includes('@')) {
      showToast('Missing Email ⚠️', 'No valid email address found for this customer.', 'warning');
      return;
    }

    setIsSendingEmailId(notif.id);
    try {
      if (notif.type === 'order_placed' && notif.referenceId) {
        const res = await sendOrderConfirmationEmail(notif.referenceId, targetEmail);
        if (res.success) {
          showToast('Official Receipt Emailed! ✉️', `Confirmation sent to ${targetEmail} from woodynatdesigners12@gmail.com`);
        }
      } else {
        const res = await fetch('/api/email/send-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientEmail: targetEmail,
            subject: `Woodynat Designers - Follow-up on Inquiry regarding ${notif.referenceData.topic || 'Commercial Printing'}`,
            message: `Dear ${notif.referenceData.customerName},\n\nThank you for reaching out to Woodynat Designers Limited. Our design and pre-press desk at Nairobi CBD (Gatkim Complex 4th Floor) has reviewed your inquiry. We have reserved production time for your project.\n\nPlease feel free to reply directly or WhatsApp 0797939199 to finalize dimensions and artwork.\n\nWarm regards,\nWoodynat Designers Limited`
          })
        });
        const data = await res.json();
        if (data.success) {
          showToast('Gmail Follow-up Sent! ✉️', `Follow-up email delivered to ${targetEmail} from woodynatdesigners12@gmail.com`);
        } else {
          showToast('Email Dispatch', data.error || 'Follow-up email dispatched.', 'info');
        }
      }
    } catch (err: any) {
      showToast('Email Error', err.message || 'Failed to dispatch email.', 'error');
    } finally {
      setIsSendingEmailId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Hero Notification Banner & Simulation Controls */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-800 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 font-extrabold text-xs px-3 py-1 rounded-full border border-blue-400/30">
              <BellRing className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span>Real-Time Admin Dispatch Center</span>
              {unreadNotificationsCount > 0 && (
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full ml-1">
                  {unreadNotificationsCount} Action Required
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
              <span>Customer Inquiries & Order Notifications</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Instantly receive real-time notifications when a client submits a quote inquiry or places an M-Pesa order. Review customer specifications and click <span className="text-emerald-400 font-bold">Accept Order</span> or <span className="text-blue-400 font-bold">Accept Inquiry</span> to trigger pre-press queues and WhatsApp acknowledgments.
            </p>
          </div>

          {/* Test Simulation Controls */}
          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-2 shrink-0">
            <button
              onClick={() => {
                if (soundEnabled) playNotificationSound('order');
                simulateIncomingOrderNotification();
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer border border-emerald-400/40"
              title="Simulate a real customer placing a new print order"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-200" />
              <span>+ Simulate Incoming Order</span>
            </button>

            <button
              onClick={() => {
                if (soundEnabled) playNotificationSound('inquiry');
                simulateIncomingInquiryNotification();
              }}
              className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer border border-blue-400/40"
              title="Simulate a corporate lead submitting a custom quote inquiry"
            >
              <FileText className="w-4 h-4 text-blue-200" />
              <span>+ Simulate Quote Inquiry</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800 text-xs">
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-bold block text-[10px] uppercase">Unread / Pending</span>
            <div className="text-xl font-extrabold text-amber-400">{unreadNotificationsCount} Alerts</div>
            <span className="text-[10px] text-slate-400">Awaiting acceptance</span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-bold block text-[10px] uppercase">Orders to Accept</span>
            <div className="text-xl font-extrabold text-emerald-400">{pendingOrdersCount} New Orders</div>
            <span className="text-[10px] text-slate-400">M-Pesa paid checkout</span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-bold block text-[10px] uppercase">Quote Inquiries</span>
            <div className="text-xl font-extrabold text-blue-400">{pendingInquiriesCount} Inquiries</div>
            <span className="text-[10px] text-slate-400">Pending rate cards</span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-bold block text-[10px] uppercase">Accepted by Admin</span>
            <div className="text-xl font-extrabold text-white">{acceptedCount} Processed</div>
            <span className="text-[10px] text-emerald-400 font-semibold">✓ In production queue</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Filters, Search & Bulk Actions */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                filterType === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Alerts ({adminNotifications.length})
            </button>

            <button
              onClick={() => setFilterType('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                filterType === 'pending'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Pending Acceptance ({unreadNotificationsCount})</span>
            </button>

            <button
              onClick={() => setFilterType('orders')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                filterType === 'orders'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Orders ({adminNotifications.filter(n => n.type === 'order_placed').length})</span>
            </button>

            <button
              onClick={() => setFilterType('inquiries')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                filterType === 'inquiries'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Inquiries ({adminNotifications.filter(n => n.type === 'inquiry_submitted').length})</span>
            </button>

            <button
              onClick={() => setFilterType('accepted')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                filterType === 'accepted'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Accepted ({acceptedCount})</span>
            </button>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playNotificationSound('alert');
                showToast(soundEnabled ? 'Chime Muted 🔕' : 'Chime Enabled 🔔', soundEnabled ? 'Notification sounds silenced.' : 'Web Audio chimes active for incoming orders.');
              }}
              className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                soundEnabled 
                  ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' 
                  : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'
              }`}
              title={soundEnabled ? 'Mute notification sound' : 'Unmute notification sound'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-600" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              <span className="hidden sm:inline">{soundEnabled ? 'Sound On' : 'Muted'}</span>
            </button>

            <button
              onClick={markAllNotificationsAsRead}
              disabled={unreadNotificationsCount === 0}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
              title="Mark all notifications as read"
            >
              <CheckCheck className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Mark All Read</span>
            </button>

            <button
              onClick={() => {
                if (confirm('Clear all notification history from panel?')) {
                  clearAllNotifications();
                }
              }}
              disabled={adminNotifications.length === 0}
              className="px-3 py-2 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-600 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-red-200"
              title="Clear all alerts"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
              <span className="hidden sm:inline">Clear All</span>
            </button>
          </div>

        </div>

        {/* Search Field */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notifications by customer name, phone (e.g. 0797...), order #PX-..., or company..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3.5">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-xs">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
              <Bell className="w-7 h-7" />
            </div>
            <h4 className="font-extrabold text-slate-800 text-base">No Notifications Found</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {searchQuery 
                ? 'No alerts match your search query. Try clearing the search keyword.' 
                : 'There are currently no notifications matching this filter category. You can simulate incoming orders or quote inquiries above to test the workflow.'}
            </p>
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={simulateIncomingOrderNotification}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Simulate Test Order
              </button>
              <button
                onClick={simulateIncomingInquiryNotification}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Simulate Test Inquiry
              </button>
            </div>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const isOrder = notif.type === 'order_placed';
            const isPending = notif.status === 'pending';
            const isAccepted = notif.status === 'accepted';
            const isDeclined = notif.status === 'declined';
            const cleanPhone = notif.referenceData?.customerPhone ? notif.referenceData.customerPhone.replace(/[^0-9]/g, '') : '';
            const intlPhone = cleanPhone.startsWith('0') ? '254' + cleanPhone.slice(1) : cleanPhone;

            return (
              <div
                key={notif.id}
                onClick={() => {
                  if (!notif.read) markNotificationAsRead(notif.id);
                }}
                className={`border rounded-2xl p-4 sm:p-5 transition-all shadow-xs space-y-4 ${
                  !notif.read && isPending
                    ? 'bg-amber-50/40 border-amber-300 ring-1 ring-amber-300/60'
                    : isAccepted
                    ? 'bg-emerald-50/20 border-emerald-200'
                    : isDeclined
                    ? 'bg-slate-50 border-slate-200 opacity-70'
                    : 'bg-white border-slate-200'
                }`}
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-start sm:items-center gap-2.5">
                    
                    {/* Icon Badge */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isOrder 
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                        : 'bg-blue-100 text-blue-700 border border-blue-200'
                    }`}>
                      {isOrder ? <ShoppingBag className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isOrder
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {isOrder ? 'New Customer Order' : 'Commercial Quote Inquiry'}
                        </span>

                        <span className="font-mono text-xs font-extrabold text-slate-700">
                          Ref: {notif.referenceId}
                        </span>

                        {isPending && (
                          <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                            Awaiting Acceptance
                          </span>
                        )}

                        {isAccepted && (
                          <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Accepted by Admin
                          </span>
                        )}

                        {isDeclined && (
                          <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Declined / Archived
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-extrabold text-slate-900 mt-0.5">
                        {notif.title}
                      </h3>
                    </div>
                  </div>

                  {/* Timestamp & Quick Read Toggle */}
                  <div className="flex items-center gap-2 text-xs text-slate-400 self-start sm:self-auto">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5" /> {notif.timestamp}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notif.id);
                      }}
                      className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors cursor-pointer"
                      title="Delete alert"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Message Body */}
                <div className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
                  {notif.message}
                </div>

                {/* Structured Reference Meta Box */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
                  
                  {/* Customer Identity */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customer Details</span>
                    <div className="font-extrabold text-slate-900 flex items-center gap-1">
                      <span>{notif.referenceData.customerName}</span>
                      {notif.referenceData.companyName && (
                        <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded font-bold">
                          {notif.referenceData.companyName}
                        </span>
                      )}
                    </div>
                    <div className="text-slate-700 flex items-center gap-1 text-[11px]">
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200 font-mono font-bold">
                        <Smartphone className="w-3 h-3 text-emerald-600" />
                        <a href={`tel:${notif.referenceData.customerPhone}`} className="hover:underline">
                          {notif.referenceData.customerPhone}
                        </a>
                      </span>
                    </div>
                    {notif.referenceData.customerEmail ? (
                      <div className="text-slate-700 flex items-center gap-1 text-[11px] truncate">
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded border border-blue-200 font-medium truncate max-w-[200px]" title={notif.referenceData.customerEmail}>
                          <Mail className="w-3 h-3 text-blue-600 shrink-0" />
                          <span className="truncate">{notif.referenceData.customerEmail}</span>
                        </span>
                      </div>
                    ) : (
                      <div className="text-slate-400 text-[10px] italic">No Gmail provided</div>
                    )}
                  </div>

                  {/* Specific Order or Inquiry Details */}
                  {isOrder ? (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Order & M-Pesa Total</span>
                      <div className="text-sm font-black text-emerald-700">
                        KSh {notif.referenceData.amount?.toLocaleString() || '0'}
                      </div>
                      <div className="text-slate-600 text-[11px]">
                        Items: <span className="font-semibold text-slate-800">{notif.referenceData.itemsSummary || `${notif.referenceData.itemsCount || 1} Item(s)`}</span>
                      </div>
                      {notif.referenceData.deliveryCity && (
                        <div className="text-slate-500 flex items-center gap-1 text-[11px]">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{notif.referenceData.deliveryCity} ({notif.referenceData.deliveryType || 'Express'})</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Inquiry Topic & Volume</span>
                      <div className="font-extrabold text-blue-700 text-xs">
                        {notif.referenceData.topic || 'Custom Commercial Print Inquiry'}
                      </div>
                      <div className="text-slate-600 text-[11px]">
                        Quantity: <span className="font-bold text-slate-900">{notif.referenceData.requestedQuantity ? `${notif.referenceData.requestedQuantity} pcs` : 'Bulk / Custom'}</span>
                      </div>
                      {notif.referenceData.category && (
                        <div className="text-slate-500 text-[11px]">
                          Category: <span className="font-semibold text-slate-700">{notif.referenceData.category}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Artwork / Notes & Action Status */}
                  <div className="space-y-1 sm:col-span-2 md:col-span-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Artwork Instructions / Notes</span>
                    <p className="text-[11px] text-slate-600 line-clamp-2 italic bg-slate-50 p-1.5 rounded border border-slate-100">
                      {notif.referenceData.notes || 'Standard specifications requested. Vector logos / proof approval required.'}
                    </p>
                    {isAccepted && notif.acceptedAt && (
                      <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 mt-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Accepted {notif.acceptedAt}</span>
                      </div>
                    )}
                  </div>

                </div>

                {/* Accepted Action Notes Banner if already processed */}
                {isAccepted && notif.actionTakenNotes && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-2.5 rounded-xl text-xs flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-emerald-800">Admin Action Completed:</span>
                      <span>{notif.actionTakenNotes}</span>
                    </div>
                  </div>
                )}

                {/* Primary Action Buttons (Accept Order / Accept Inquiry) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1 border-t border-slate-100">
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Instant Direct Accept Button */}
                    {isPending ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDirectAccept(notif);
                        }}
                        disabled={isAcceptingId === notif.id}
                        className={`font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer ${
                          isOrder
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {isAcceptingId === notif.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        <span>{isOrder ? 'Accept Order (Assign Production)' : 'Accept Inquiry (Approve Quote)'}</span>
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Accepted & Synchronized</span>
                      </span>
                    )}

                    {/* Custom Note Accept / Edit Acceptance */}
                    {isPending && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenCustomAcceptModal(notif);
                        }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer border border-slate-200"
                        title="Accept with custom production note or WhatsApp notification"
                      >
                        Accept with Note...
                      </button>
                    )}

                    {/* Decline Button */}
                    {isPending && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          declineNotification(notif.id, 'Declined by Admin due to capacity or scheduling.');
                        }}
                        className="bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-600 font-bold px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        Decline
                      </button>
                    )}
                  </div>

                  {/* Right Action Tools: WhatsApp, Send Gmail & Direct Jump */}
                  <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto">
                    
                    {/* 1-Click WhatsApp Pre-Filled Reply */}
                    <a
                      href={`https://wa.me/${intlPhone}?text=${encodeURIComponent(
                        isOrder
                          ? `Hi ${notif.referenceData.customerName}, this is Woodynat Designers Limited (Gatkim Complex, CBD). Your Order #${notif.referenceId} has been officially ACCEPTED and is now in production! Total: KSh ${(notif.referenceData.amount || 0).toLocaleString()}. Feel free to reply here if you have any artwork questions.`
                          : `Hi ${notif.referenceData.customerName}, thank you for your inquiry regarding "${notif.referenceData.topic || 'commercial printing'}" with Woodynat Designers Limited. Your inquiry has been ACCEPTED by our design desk and we have prepared your rate card quotation. When is a good time to review?`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      title="Send WhatsApp confirmation to client"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp Client</span>
                    </a>

                    {/* 1-Click Send Gmail */}
                    {notif.referenceData.customerEmail && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickSendEmail(notif);
                        }}
                        disabled={isSendingEmailId === notif.id}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                        title={`Send official confirmation from woodynatdesigners12@gmail.com to ${notif.referenceData.customerEmail}`}
                      >
                        {isSendingEmailId === notif.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Mail className="w-3.5 h-3.5" />
                        )}
                        <span>Send Gmail</span>
                      </button>
                    )}

                    {/* Jump to specific section */}
                    {onNavigateTab && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isOrder) {
                            onNavigateTab('orders');
                          } else {
                            onNavigateTab('catalogue');
                          }
                        }}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        title={isOrder ? 'View in Orders Tab' : 'View in Catalogue/Inquiry Studio'}
                      >
                        <span>{isOrder ? 'View Order' : 'View Inquiry'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Acceptance Modal with Custom Notes & Client Dispatch Confirmation */}
      {selectedNotifForModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Accept {selectedNotifForModal.type === 'order_placed' ? 'Customer Order' : 'Quote Inquiry'}
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">Ref: {selectedNotifForModal.referenceId}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedNotifForModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between font-bold text-slate-800">
                <span>Client: {selectedNotifForModal.referenceData.customerName}</span>
                <span className="text-blue-600 font-mono">{selectedNotifForModal.referenceData.customerPhone}</span>
              </div>
              <p className="text-slate-600">{selectedNotifForModal.message}</p>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-extrabold text-slate-800 block">
                Production / Acceptance Notes (Logged to Audit Trail):
              </label>
              <textarea
                rows={3}
                value={customActionNote}
                onChange={(e) => setCustomActionNote(e.target.value)}
                placeholder="Enter production assignment notes, proofing instructions, or client quotation details..."
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium"
              />
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-[11px] text-emerald-900 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-emerald-800">Automated Workflow:</span>
                Accepting updates order tracking status to <span className="font-bold">"Order Received by Admin"</span>, sends notification chimes, and prepares 1-click WhatsApp customer dispatch.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setSelectedNotifForModal(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmModalAccept}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Accept</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
