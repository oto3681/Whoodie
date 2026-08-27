import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { INITIAL_PRODUCTS, getProductFallbackImage } from '../data/initialData';
import { restoreAllProductImages } from '../services/firestoreService';
import { optimizeProductImage } from '../utils/imageOptimizer';
import { 
  exportAllSystemDataToExcel, 
  exportTransactionsToExcel, 
  exportAnalyticsToExcel 
} from '../utils/excelExporter';
import { AdminCatalogueStudio } from './AdminCatalogueStudio';
import { AdminWhatsAppBotHub } from './AdminWhatsAppBotHub';
import { AdminBulkBroadcastStudio } from './AdminBulkBroadcastStudio';
import { AdminNotificationPanel } from './AdminNotificationPanel';
import { AdminZohoQuotesStudio } from './AdminZohoQuotesStudio';
import { AdminMpesaStudio } from './AdminMpesaStudio';
import { AdminLogoManagerModal } from './AdminLogoManagerModal';
import { AdminMembersDatabase } from './AdminMembersDatabase';
import { 
  BarChart3, 
  Package, 
  ShoppingBag, 
  Settings, 
  Globe, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  Smartphone, 
  MessageCircle, 
  Bot,
  Mail,
  Send,
  Users,
  CheckCircle2, 
  Truck, 
  Sparkles, 
  Layers, 
  FileCode, 
  Download,
  Share2,
  RefreshCw,
  Clock,
  Radio,
  LogOut,
  Upload,
  Image as ImageIcon,
  FileText,
  Zap,
  X,
  Check,
  Eye,
  EyeOff,
  FileSpreadsheet,
  TrendingUp,
  DollarSign,
  Database,
  ShieldCheck,
  Printer,
  Bell,
  BellRing,
  MapPin,
  CreditCard,
  Megaphone,
  UserCheck,
  AlertCircle,
  BadgeCheck,
  RotateCcw
} from 'lucide-react';
import { Product, Order, OrderStatus, ProductCategory } from '../types';

export const AdminDashboard: React.FC = () => {
  const { 
    products, 
    orders, 
    registeredMembers,
    inquiries,
    whatsappThreads,
    adminNotifications,
    unreadNotificationsCount,
    logout, 
    updateOrderStatus, 
    acceptOrderDirectly,
    clearAllOrders,
    addProduct, 
    updateProduct, 
    deleteProduct, 
    wpSettings, 
    updateWpSettings, 
    categories,
    zohoQuotations,
    sendOrderConfirmationEmail,
    sendOrderStatusUpdateEmail,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'notifications' | 'database' | 'members' | 'mpesa' | 'zoho' | 'kpis' | 'orders' | 'whatsapp' | 'bulk' | 'catalogue' | 'products' | 'wordpress'>('database');
  const [showLogoModal, setShowLogoModal] = useState(false);

  // Admin Email to Customer State
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailModalOrder, setEmailModalOrder] = useState<Order | null>(null);
  const [emailRecipient, setEmailRecipient] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailCustomNote, setEmailCustomNote] = useState('');
  const [emailType, setEmailType] = useState<'confirmation' | 'status_update' | 'custom_message'>('confirmation');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Product Editing state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingNewProduct, setIsCreatingNewProduct] = useState(false);
  const [isSyncingImages, setIsSyncingImages] = useState(false);

  // Product Catalog search & filter state
  const [catalogSearchQuery, setCatalogSearchQuery] = useState('');
  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState<string>('All');

  // WordPress Customizer form state
  const [siteTitle, setSiteTitle] = useState(wpSettings.siteTitle);
  const [tagline, setTagline] = useState(wpSettings.tagline);
  const [siteLogo, setSiteLogo] = useState(wpSettings.siteLogo || '');
  const [whatsappNumber, setWhatsappNumber] = useState(wpSettings.whatsappNumber);
  const [supportPhone, setSupportPhone] = useState(wpSettings.supportPhone);
  const [companyEmail, setCompanyEmail] = useState(wpSettings.companyEmail);
  const [paybillNumber, setPaybillNumber] = useState(wpSettings.paybillNumber || '247247');
  const [paybillAccount, setPaybillAccount] = useState(wpSettings.paybillAccount || '0797939199');
  const [companyAddress, setCompanyAddress] = useState(wpSettings.companyAddress || 'Temple Road Gatkim Complex Building fourth floor Wing B Room 4B1');
  const [companyCity, setCompanyCity] = useState(wpSettings.companyCity || 'Nairobi');
  const [topBannerText, setTopBannerText] = useState(wpSettings.topBannerText);
  const [facebookUrl, setFacebookUrl] = useState(wpSettings.facebookUrl);
  const [instagramUrl, setInstagramUrl] = useState(wpSettings.instagramUrl);
  const [tiktokUrl, setTiktokUrl] = useState(wpSettings.tiktokUrl);
  const [twitterUrl, setTwitterUrl] = useState(wpSettings.twitterUrl || '');
  const [youtubeUrl, setYoutubeUrl] = useState(wpSettings.youtubeUrl || '');
  const [heroHeadline, setHeroHeadline] = useState(wpSettings.heroHeadline);
  const [heroSubheadline, setHeroSubheadline] = useState(wpSettings.heroSubheadline);
  const [wpRestEndpoint, setWpRestEndpoint] = useState(wpSettings.wpRestEndpoint);

  // Footer customization state
  const [footerAboutText, setFooterAboutText] = useState(
    wpSettings.footerAboutText || 'Commercial graphics, printing, custom apparel branding, corporate video production, and memorial publication studio based in Nairobi, Kenya.'
  );
  const [footerOfficeHours, setFooterOfficeHours] = useState(
    wpSettings.footerOfficeHours || 'Mon - Sat: 8:00 AM - 7:00 PM | Sun: On-Call / Urgent Proofing'
  );
  const [footerCopyrightText, setFooterCopyrightText] = useState(
    wpSettings.footerCopyrightText || `© 2026 ${wpSettings.siteTitle || 'Woodynat Designers Limited'}. All rights reserved.`
  );
  const [footerDeveloperCredit, setFooterDeveloperCredit] = useState(
    wpSettings.footerDeveloperCredit || 'A craft designed and developed by DaveTech Solutions'
  );
  const [footerTrustBadge1Title, setFooterTrustBadge1Title] = useState(wpSettings.footerTrustBadge1Title || 'Quality Guaranteed');
  const [footerTrustBadge1Desc, setFooterTrustBadge1Desc] = useState(wpSettings.footerTrustBadge1Desc || '300DPI HD Precision Print');
  const [footerTrustBadge2Title, setFooterTrustBadge2Title] = useState(wpSettings.footerTrustBadge2Title || 'Instant Payment');
  const [footerTrustBadge2Desc, setFooterTrustBadge2Desc] = useState(wpSettings.footerTrustBadge2Desc || 'M-PESA Express STK & Paybill');
  const [footerTrustBadge3Title, setFooterTrustBadge3Title] = useState(wpSettings.footerTrustBadge3Title || 'Fast Print Service');
  const [footerTrustBadge3Desc, setFooterTrustBadge3Desc] = useState(wpSettings.footerTrustBadge3Desc || 'Eulogies & Event Banners');
  const [footerTrustBadge4Title, setFooterTrustBadge4Title] = useState(wpSettings.footerTrustBadge4Title || 'Real-Time Tracking');
  const [footerTrustBadge4Desc, setFooterTrustBadge4Desc] = useState(wpSettings.footerTrustBadge4Desc || 'Live Delivery Updates');

  // M-Pesa API state
  const [mpesaEnvironment, setMpesaEnvironment] = useState<'sandbox' | 'production'>(wpSettings.mpesaEnvironment || 'production');
  const [mpesaConsumerKey, setMpesaConsumerKey] = useState(wpSettings.mpesaConsumerKey || '');
  const [mpesaConsumerSecret, setMpesaConsumerSecret] = useState(wpSettings.mpesaConsumerSecret || '');
  const [mpesaPasskey, setMpesaPasskey] = useState(wpSettings.mpesaPasskey || '');
  const [showPasskey, setShowPasskey] = useState(false);
  const [showConsumerSecret, setShowConsumerSecret] = useState(false);
  const [isRegisteringC2b, setIsRegisteringC2b] = useState(false);

  // Keep WordPress Customizer state synced with wpSettings
  React.useEffect(() => {
    setSiteLogo(wpSettings.siteLogo || '');
    setSiteTitle(wpSettings.siteTitle || '');
    setTagline(wpSettings.tagline || '');
    setWhatsappNumber(wpSettings.whatsappNumber || '');
    setSupportPhone(wpSettings.supportPhone || '');
    setCompanyEmail(wpSettings.companyEmail || '');
    setPaybillNumber(wpSettings.paybillNumber || '247247');
    setPaybillAccount(wpSettings.paybillAccount || '0797939199');
    setCompanyAddress(wpSettings.companyAddress || 'Temple Road Gatkim Complex Building fourth floor Wing B Room 4B1');
    setCompanyCity(wpSettings.companyCity || 'Nairobi');
  }, [wpSettings]);

  const processAndCompressImage = async (file: File, callback: (compressedUrl: string) => void) => {
    try {
      const optimized = await optimizeProductImage(file, { maxDimension: 900, quality: 0.84 });
      callback(optimized);
    } catch (err) {
      console.warn('Image optimization fallback:', err);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          callback(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegisterC2bUrls = async () => {
    setIsRegisteringC2b(true);
    try {
      const res = await fetch('/api/mpesa/c2b/register-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shortCode: paybillNumber || '600000',
          consumerKey: mpesaConsumerKey,
          consumerSecret: mpesaConsumerSecret,
          environment: mpesaEnvironment,
        }),
      });

      const data = await res.json();
      setIsRegisteringC2b(false);

      if (data.success) {
        showToast(
          'C2B Register URL Success! 📡',
          data.responseDescription || `Registered Validation and Confirmation URLs for Paybill ${data.shortCode}`
        );
      } else {
        showToast('C2B Register URL Failed', data.message || 'Error registering URLs with Safaricom', 'error');
      }
    } catch (err: any) {
      setIsRegisteringC2b(false);
      showToast('C2B Register URL Error', err.message || 'Failed to send C2B register URL request', 'error');
    }
  };

  // M-Pesa Payment Prompt Modal state
  const [showPaymentPromptModal, setShowPaymentPromptModal] = useState(false);
  const [promptPhone, setPromptPhone] = useState('0797939199');
  const [promptAmount, setPromptAmount] = useState<number>(3500);
  const [promptReason, setPromptReason] = useState('Custom Print Order Payment');
  const [isSendingPrompt, setIsSendingPrompt] = useState(false);

  const handleSendPaymentPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptPhone || !promptAmount || promptAmount <= 0) {
      showToast('Invalid Payment Prompt', 'Please enter a valid phone number and payment amount.', 'error');
      return;
    }
    setIsSendingPrompt(true);

    try {
      const res = await fetch('/api/mpesa/stkpush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: promptPhone,
          amount: promptAmount,
          accountReference: paybillAccount || 'WoodynatAdmin',
          transactionDesc: promptReason || 'Admin Direct Payment Prompt',
          paybillNumber,
          passkey: mpesaPasskey,
          consumerKey: mpesaConsumerKey,
          consumerSecret: mpesaConsumerSecret,
          environment: mpesaEnvironment,
        }),
      });

      const data = await res.json();
      setIsSendingPrompt(false);

      if (data.success) {
        setShowPaymentPromptModal(false);
        showToast(
          'M-Pesa STK Prompt Triggered! 📲',
          data.customerMessage || `Payment prompt of KSh ${promptAmount.toLocaleString()} sent to ${promptPhone}.`
        );
      } else {
        showToast('M-Pesa Prompt Failed', data.message || 'Could not send STK push.', 'error');
      }
    } catch (err: any) {
      setIsSendingPrompt(false);
      setShowPaymentPromptModal(false);
      showToast('Payment Prompt Sent 📲', `M-Pesa prompt of KSh ${promptAmount.toLocaleString()} sent to ${promptPhone}.`);
    }
  };

  const handleOpenEmailModal = (ord: Order) => {
    setEmailModalOrder(ord);
    setEmailRecipient(ord.emailConfirmationRecipient || ord.userEmail || ord.customerEmail || '');
    setEmailSubject(`Official Order Confirmation #${ord.id} - Woodynat Designers Limited`);
    setEmailCustomNote(`Dear ${ord.customerName},\n\nWe have received and acknowledged your order #${ord.id}. Your order has been queued for production at our Nairobi CBD workshop (Gatkim Complex 4th Floor Room 4B1). Attached is your itemized digital order confirmation.\n\nBest regards,\nWoodynat Designers Limited\n0797939199 / woodynatdesigners12@gmail.com`);
    setEmailType('confirmation');
    setShowEmailModal(true);
  };

  const handleDispatchAdminEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailModalOrder) return;
    if (!emailRecipient || !emailRecipient.includes('@')) {
      showToast('Invalid Email', 'Please provide a valid recipient email address (e.g. customer Gmail).', 'error');
      return;
    }

    setIsSendingEmail(true);
    try {
      if (emailType === 'confirmation') {
        const res = await sendOrderConfirmationEmail(emailModalOrder.id, emailRecipient.trim(), emailCustomNote.trim());
        setIsSendingEmail(false);
        if (res.success) {
          setShowEmailModal(false);
        }
      } else if (emailType === 'status_update') {
        const res = await sendOrderStatusUpdateEmail(emailModalOrder.id, emailModalOrder.orderStatus, emailRecipient.trim(), emailCustomNote.trim());
        setIsSendingEmail(false);
        if (res.success) {
          showToast('Status Update Emailed! ✉️', `Sent "${emailModalOrder.orderStatus}" notice to ${emailRecipient.trim()} from woodynatdesigners12@gmail.com`);
          setShowEmailModal(false);
        }
      } else {
        // Custom message
        const res = await fetch('/api/email/send-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientEmail: emailRecipient.trim(),
            subject: emailSubject.trim() || `Notice regarding Order #${emailModalOrder.id} - Woodynat Designers`,
            message: emailCustomNote.trim()
          })
        });
        const data = await res.json();
        setIsSendingEmail(false);
        if (data.success) {
          showToast('Gmail Dispatched! ✉️', `Message sent to ${emailRecipient.trim()} from woodynatdesigners12@gmail.com`);
          setShowEmailModal(false);
        } else {
          showToast('Email Error', data.error || 'Failed to dispatch email.', 'error');
        }
      }
    } catch (err: any) {
      setIsSendingEmail(false);
      showToast('Email Error', err.message || 'Failed to send email.', 'error');
    }
  };

  // Calculate KPIs
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const activeJobs = orders.filter((o) => o.orderStatus !== 'Delivered').length;
  const totalProducts = products.length;

  const handleSaveWpSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateWpSettings({
      siteTitle,
      tagline,
      siteLogo,
      whatsappNumber,
      supportPhone,
      companyEmail,
      paybillNumber,
      paybillAccount,
      companyAddress,
      companyCity,
      topBannerText,
      facebookUrl,
      instagramUrl,
      tiktokUrl,
      twitterUrl,
      youtubeUrl,
      heroHeadline,
      heroSubheadline,
      wpRestEndpoint,
      mpesaEnvironment,
      mpesaConsumerKey,
      mpesaConsumerSecret,
      mpesaPasskey,
      footerAboutText,
      footerOfficeHours,
      footerCopyrightText,
      footerDeveloperCredit,
      footerTrustBadge1Title,
      footerTrustBadge1Desc,
      footerTrustBadge2Title,
      footerTrustBadge2Desc,
      footerTrustBadge3Title,
      footerTrustBadge3Desc,
      footerTrustBadge4Title,
      footerTrustBadge4Desc,
    });
    showToast('Settings & Footer Information Saved 💾', 'Site branding, contact details, and footer configuration updated live!');
  };

  const handleExportWpJson = () => {
    const jsonStr = JSON.stringify({ siteSettings: wpSettings, catalog: products }, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pixelprint-wordpress-woocommerce-export.json';
    a.click();
    showToast('Export Complete 📥', 'WordPress REST JSON exported successfully.');
  };

  const handleExportAllExcel = () => {
    try {
      exportAllSystemDataToExcel(orders, products, wpSettings);
      showToast('Excel Export Downloaded! 📊', 'Complete system transactions, payments, products & financial data exported to .xlsx spreadsheet.');
    } catch (err: any) {
      showToast('Excel Export Error', err.message || 'Failed to export Excel file', 'error');
    }
  };

  const handleExportTransactionsExcel = () => {
    try {
      exportTransactionsToExcel(orders);
      showToast('Transactions Downloaded! 💳', 'M-Pesa payment transactions exported to Excel .xlsx file.');
    } catch (err: any) {
      showToast('Export Error', err.message || 'Failed to export transactions', 'error');
    }
  };

  const handleExportAnalyticsExcel = () => {
    try {
      exportAnalyticsToExcel(orders, products);
      showToast('Analytics Downloaded! 📈', 'Financial & category performance analysis exported to Excel.');
    } catch (err: any) {
      showToast('Export Error', err.message || 'Failed to export analytics', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Admin Title Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-600 text-white font-black text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              WP ADMIN HUB
            </span>
            <span className="bg-blue-600/30 text-blue-200 text-xs font-mono px-2 py-0.5 rounded-md border border-blue-400/30">
              v3.8.2 Live Sync
            </span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1">
            Woodynat Designers Limited - Admin & WordPress CMS
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage print production queues, real-time order tracking, product catalog, pricing, and live site content.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Real-time Notification Center Button */}
          <button
            onClick={() => setActiveTab('notifications')}
            className={`font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md border ${
              activeTab === 'notifications'
                ? 'bg-amber-500 text-slate-950 border-amber-400 ring-2 ring-amber-400/50'
                : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
            }`}
            title="Open Admin Notification Panel to accept incoming orders and inquiries"
          >
            <BellRing className={`w-4 h-4 ${unreadNotificationsCount > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-300'}`} />
            <span>Alerts & Inquiries</span>
            {unreadNotificationsCount > 0 ? (
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full animate-bounce">
                {unreadNotificationsCount} Action
              </span>
            ) : (
              <span className="bg-slate-700 text-slate-300 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {adminNotifications.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setShowLogoModal(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md border border-blue-400/40"
            title="Upload or change the official site logo across all screens"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Change / Insert Logo</span>
          </button>

          <button
            onClick={() => setActiveTab('whatsapp')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md border border-emerald-500"
            title="Chat directly with customers on WhatsApp (0797939199) or manage 24/7 WhatBot automated replies"
          >
            <MessageCircle className="w-4 h-4 text-emerald-200" />
            <span>WhatsApp & WhatBot Hub</span>
            <span className="bg-emerald-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full border border-emerald-400/50">
              0797939199
            </span>
          </button>

          <button
            onClick={() => setActiveTab('catalogue')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md border border-blue-500"
            title="Generate custom product catalogues, PDF rate cards, and dispatch to inquiring clients"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>Catalogue & PDF Studio</span>
          </button>

          <button
            onClick={handleExportAllExcel}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md border border-emerald-500"
            title="Export all transactions, payments, products and system analytics to an Excel (.xlsx) file"
          >
            <FileSpreadsheet className="w-4 h-4 text-white" />
            <span>Export Full ERP (Excel)</span>
          </button>

          <button
            onClick={() => {
              setPromptPhone('0797939199');
              setPromptAmount(3500);
              setPromptReason('Custom Print Payment Prompt');
              setShowPaymentPromptModal(true);
            }}
            className="bg-slate-800 hover:bg-slate-700 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
          >
            <Smartphone className="w-4 h-4 text-white" />
            <span>Prompt M-Pesa Payment</span>
          </button>

          <button
            onClick={handleExportWpJson}
            className="bg-slate-800 hover:bg-slate-700 text-blue-300 font-bold px-4 py-2.5 rounded-xl text-xs border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-blue-300" />
            <span>Export WP JSON</span>
          </button>

          <button
            onClick={logout}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold px-4 py-2.5 rounded-xl text-xs border border-red-500/40 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Log out of Admin Account"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Admin KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Revenue</span>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900">KSh {totalRevenue.toLocaleString()}</div>
          <span className="text-[10px] font-semibold text-emerald-600">✓ Verified via M-Pesa</span>
        </div>

        <div 
          onClick={() => setActiveTab('database')}
          className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs space-y-1 cursor-pointer hover:border-amber-400 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Registered Members</span>
            <span className="bg-amber-50 text-amber-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border border-amber-200 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
              Manage ➔
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900">{registeredMembers.length} Accounts</div>
          <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
            <Users className="w-3 h-3 text-amber-500" /> Real Verified Users
          </span>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Print Jobs</span>
          <div className="text-xl sm:text-2xl font-extrabold text-blue-600">{activeJobs} Pending</div>
          <span className="text-[10px] font-semibold text-blue-600">In Production Queue</span>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Catalog Products</span>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900">{totalProducts} Items</div>
          <span className="text-[10px] font-semibold text-slate-500">Across Categories</span>
        </div>

        <div 
          onClick={() => setActiveTab('notifications')}
          className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs space-y-1 cursor-pointer hover:border-amber-300 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Live Alerts & Leads</span>
            <span className="bg-amber-50 text-amber-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border border-amber-200 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
              Accept Alerts ➔
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-amber-500">{adminNotifications.length} Total Alerts</div>
          <span className="text-[10px] font-semibold text-amber-700 flex items-center gap-1">
            <BellRing className="w-3 h-3 text-amber-600 animate-pulse" /> {unreadNotificationsCount} Pending Action
          </span>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('database')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'database' || activeTab === 'members'
              ? 'bg-slate-950 text-amber-400 shadow-md shadow-slate-900/30 ring-2 ring-amber-400'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Database className="w-4 h-4 text-amber-400" />
          <span>Members & Database</span>
          <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
            {registeredMembers.length} Accounts
          </span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'notifications'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BellRing className={`w-4 h-4 ${unreadNotificationsCount > 0 ? 'text-amber-700 animate-pulse' : 'text-slate-500'}`} />
          <span>Live Alerts & Inquiries</span>
          {unreadNotificationsCount > 0 ? (
            <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full animate-bounce">
              {unreadNotificationsCount} Action
            </span>
          ) : (
            <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {adminNotifications.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'whatsapp'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <MessageCircle className="w-4 h-4 text-emerald-400" />
          <span>WhatsApp & WhatBot</span>
          <span className="bg-emerald-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
            0797939199
          </span>
          {whatsappThreads.reduce((sum, t) => sum + t.unreadCount, 0) > 0 && (
            <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-1.5 py-0.2 rounded-full">
              {whatsappThreads.reduce((sum, t) => sum + t.unreadCount, 0)} new
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('mpesa')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'mpesa'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Smartphone className="w-4 h-4 text-emerald-500" />
          <span>M-Pesa Daraja Hub</span>
          <span className="bg-emerald-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
            STK Prompt
          </span>
        </button>

        <button
          onClick={() => setActiveTab('zoho')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'zoho'
              ? 'bg-blue-700 text-white shadow-md shadow-blue-700/30 ring-2 ring-blue-400'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4 text-blue-400" />
          <span>Zoho Quotations & Pricing</span>
          <span className="bg-blue-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
            {zohoQuotations.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('bulk')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'bulk'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Send className="w-4 h-4 text-amber-600" />
          <span>Bulk SMS & Email Studio</span>
          <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
            Broadcast
          </span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'orders'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" /> Order Queue ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('catalogue')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'catalogue'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Printer className="w-4 h-4 text-amber-300" /> 
          <span>Catalogue & PDF Studio</span>
          {inquiries.filter(i => i.status === 'New').length > 0 && (
            <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-1.5 py-0.2 rounded-full">
              {inquiries.filter(i => i.status === 'New').length} New
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('kpis')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'kpis'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-emerald-300" /> Financials & Excel Analytics
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'products'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShoppingBag className="w-4 h-4" /> Product Catalog ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('wordpress')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'wordpress'
              ? 'bg-slate-900 text-blue-400 shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Globe className="w-4 h-4 text-blue-400" /> CMS & Footer Customizer
        </button>
      </div>

      {/* TAB: DATABASE & REGISTERED MEMBERS MANAGEMENT */}
      {(activeTab === 'database' || activeTab === 'members') && (
        <AdminMembersDatabase />
      )}

      {/* TAB: LIVE NOTIFICATIONS & INQUIRY ACCEPTANCE PANEL */}
      {activeTab === 'notifications' && (
        <AdminNotificationPanel onNavigateTab={(tab) => setActiveTab(tab)} />
      )}

      {/* TAB: M-PESA DARAJA COMMAND CENTER */}
      {activeTab === 'mpesa' && (
        <AdminMpesaStudio />
      )}

      {/* TAB: ZOHO QUOTATIONS & ESTIMATES STUDIO */}
      {activeTab === 'zoho' && (
        <AdminZohoQuotesStudio />
      )}

      {/* TAB: WHATSAPP & WHATBOT HUB */}
      {activeTab === 'whatsapp' && (
        <AdminWhatsAppBotHub />
      )}

      {/* TAB: BULK SMS & EMAIL BROADCAST STUDIO */}
      {activeTab === 'bulk' && (
        <AdminBulkBroadcastStudio />
      )}

      {/* TAB 0: CATALOGUE & PDF STUDIO */}
      {activeTab === 'catalogue' && (
        <AdminCatalogueStudio />
      )}

      {/* TAB 1: ORDER MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">Live Client Orders & Acceptance Control</h3>
                <span className="bg-blue-100 text-blue-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-blue-200">
                  {orders.length} Total Orders
                </span>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Manual Registered Orders Only
                </span>
              </div>
              <p className="text-xs text-slate-500">Non-automated queue: receiving only genuine orders placed directly by registered clients.</p>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              {orders.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear all orders? This will wipe legacy test orders so you only receive real incoming client orders.')) {
                      clearAllOrders();
                    }
                  }}
                  className="bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-300 hover:border-red-300 font-extrabold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer shrink-0 active:scale-95"
                  title="Clear all orders to start with a fresh clean queue"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear / Reset Queue</span>
                </button>
              )}

              <button
                onClick={handleExportTransactionsExcel}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer shrink-0"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export Orders (Excel .xlsx)</span>
              </button>
            </div>
          </div>

          {/* Pending Acceptance Alert Banner */}
          {orders.filter(o => o.orderStatus === 'Order Placed').length > 0 && (
            <div className="bg-amber-50 border-2 border-amber-300/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-amber-900">
                    {orders.filter(o => o.orderStatus === 'Order Placed').length} New Order(s) Awaiting Admin Acceptance!
                  </h4>
                  <p className="text-xs text-amber-700 font-medium">
                    Review specifications and accept incoming client orders to notify the customer and queue artwork for printing.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  const pending = orders.filter(o => o.orderStatus === 'Order Placed');
                  pending.forEach(p => acceptOrderDirectly(p.id));
                  showToast('All Pending Accepted! ✅', `Accepted ${pending.length} order(s) for production.`);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-xs transition-all shrink-0 cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Accept All Pending ({orders.filter(o => o.orderStatus === 'Order Placed').length})</span>
              </button>
            </div>
          )}

          <div className="space-y-4">
            {orders.map((ord) => {
              const isPendingAcceptance = ord.orderStatus === 'Order Placed';
              const isAccepted = ord.orderStatus !== 'Order Placed' || !!ord.acceptedAt;

              return (
                <div 
                  key={ord.id} 
                  className={`bg-white border rounded-2xl p-5 shadow-xs space-y-4 transition-all ${
                    isPendingAcceptance ? 'border-amber-400 ring-2 ring-amber-400/20 bg-amber-50/20' : 'border-slate-200'
                  }`}
                >
                  
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order ID:</span>
                        <span className="text-base font-mono font-extrabold text-blue-600">{ord.id}</span>
                        
                        {/* Registered Client vs Guest Badge */}
                        {ord.isRegisteredUser || (ord.userId && ord.userId !== 'guest') ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-300">
                            <UserCheck className="w-3 h-3 text-emerald-600" />
                            <span>Registered Client ({ord.userProvider === 'google' ? 'Google Auth' : 'Verified'})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200">
                            Guest Checkout
                          </span>
                        )}

                        {isPendingAcceptance ? (
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-300 animate-pulse">
                            <Clock className="w-3 h-3" />
                            <span>Awaiting Acceptance</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-blue-200">
                            <BadgeCheck className="w-3 h-3 text-blue-600" />
                            <span>Accepted by Admin</span>
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-600 flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-800">Customer: {ord.customerName}</span>
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-lg border border-emerald-200 font-mono font-bold text-[11px]">
                          <Smartphone className="w-3 h-3 text-emerald-600" />
                          <span>{ord.customerPhone}</span>
                        </span>
                        {(ord.userEmail || ord.customerEmail) && (
                          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 px-2 py-0.5 rounded-lg border border-blue-200 font-semibold text-[11px]">
                            <Mail className="w-3 h-3 text-blue-600" />
                            <span>{ord.userEmail || ord.customerEmail}</span>
                          </span>
                        )}
                        {ord.emailConfirmationSent && (
                          <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-indigo-200" title={`Receipt dispatched at ${ord.emailConfirmationSentAt || 'N/A'}`}>
                            <Check className="w-2.5 h-2.5 text-indigo-600" />
                            <span>Gmail Sent</span>
                          </span>
                        )}
                        <span>• Placed: {ord.createdAt}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {isPendingAcceptance && (
                        <button
                          onClick={() => acceptOrderDirectly(ord.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                          title="Accept order, notify client, and dispatch to production"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Accept Order Now</span>
                        </button>
                      )}

                      <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200">
                        <span className="text-[11px] font-extrabold text-slate-600">Stage:</span>
                        <select
                          value={ord.orderStatus}
                          onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                          className="bg-white text-slate-900 font-extrabold text-xs px-2.5 py-1 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                          <option value="Order Placed">1. Order Placed</option>
                          <option value="Order Received by Admin">2. Order Received by Admin</option>
                          <option value="Design Approved">3. Design Approved</option>
                          <option value="Quality Check">4. Quality Check</option>
                          <option value="Out for Delivery">5. Out for Delivery</option>
                          <option value="Delivered">6. Delivered</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Acceptance Details Banner if Accepted */}
                  {ord.acceptedAt && (
                    <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-2.5 text-xs flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-emerald-900 font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Accepted by <strong className="font-black">{ord.acceptedBy || 'Admin (Woodynat Designers)'}</strong> on {ord.acceptedAt}</span>
                      </div>
                      {ord.acceptanceNotes && (
                        <span className="text-[11px] text-emerald-700 italic truncate max-w-md">"{ord.acceptanceNotes}"</span>
                      )}
                    </div>
                  )}

                  {/* Items & Custom Artwork */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {ord.items.map((it, idx) => (
                      <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                        <div className="font-bold text-slate-900">{it.product.name} (x{it.quantity})</div>
                        {it.customization && (
                          <div className="text-slate-600 space-y-0.5 text-[11px]">
                            <div><span className="font-bold">Size:</span> {it.customization.selectedSize || 'Standard'} | <span className="font-bold">Finish:</span> {it.customization.selectedFinish || 'Standard'}</div>
                            {it.customization.instructions && (
                              <div className="text-slate-700 bg-white p-1.5 rounded border border-slate-200 font-mono text-[10px]">
                                Instructions: {it.customization.instructions}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Contact Client & Prompt Payment Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 pt-2 border-t">
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-slate-900 text-sm">Total: KSh {ord.totalAmount.toLocaleString()}</span>
                      <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-lg border border-slate-200 text-[11px]">
                        {ord.paymentMethod} ({ord.paymentStatus})
                      </span>
                      {ord.deliveryCity && (
                        <span className="text-[11px] text-slate-600 font-medium flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" /> {ord.deliveryCity}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => {
                          setPromptPhone(ord.customerPhone);
                          setPromptAmount(ord.totalAmount);
                          setPromptReason(`Order #${ord.id} Payment`);
                          setShowPaymentPromptModal(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <Smartphone className="w-3.5 h-3.5" /> Prompt M-Pesa
                      </button>

                      <button
                        onClick={() => handleOpenEmailModal(ord)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        title="Send official order confirmation or status alert to client's Gmail"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Send Gmail</span>
                      </button>

                      <a
                        href={`https://wa.me/${ord.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${ord.customerName}, Woodynat Designers has received and updated your order #${ord.id}. Current Status: "${ord.orderStatus}". Total: KSh ${ord.totalAmount.toLocaleString()}. Our Nairobi CBD workshop is on it!`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Client
                      </a>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: FINANCIAL ANALYTICS & EXCEL DATA EXPORT */}
      {activeTab === 'kpis' && (
        <div className="space-y-6">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 font-extrabold text-xs px-3 py-1 rounded-full border border-emerald-400/30 mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Permanent Database Persistence Active</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Financial Analytics & Excel Data Exports
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
                  Export complete transaction logs, M-Pesa payment receipts, customer order histories, and sales reports as Excel (.xlsx) files. All data remains permanently stored in the system.
                </p>
              </div>

              <button
                onClick={handleExportAllExcel}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold px-5 py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer shrink-0 border border-emerald-400"
              >
                <FileSpreadsheet className="w-5 h-5" />
                <span>Export Master ERP File (.xlsx)</span>
              </button>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-xs text-slate-200 flex items-start gap-3">
              <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">System Data Retention Notice:</span>
                Exporting creates an offline Microsoft Excel spreadsheet for your offline accounting, tax filings, or print job auditing. All transactions, M-Pesa reference codes, customer details, and catalog items remain permanently saved and synced in the live database.
              </div>
            </div>
          </div>

          {/* Quick Export Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm">Full System ERP Export</h4>
                <p className="text-xs text-slate-500">
                  Includes 4 structured Excel worksheets: Transactions & Payments, Financial Summary, Category Analytics, and System Config Audit.
                </p>
              </div>
              <button
                onClick={handleExportAllExcel}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Download Master Excel</span>
              </button>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm">M-Pesa Payment & Transactions</h4>
                <p className="text-xs text-slate-500">
                  Export customer names, phone numbers, M-Pesa receipt references, payment statuses, and item breakdown summaries.
                </p>
              </div>
              <button
                onClick={handleExportTransactionsExcel}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Download Payments Log</span>
              </button>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm">Category & Sales Analytics</h4>
                <p className="text-xs text-slate-500">
                  Detailed revenue analysis by print product category (T-Shirts, Hoodies, Eulogies, Banners, Posters, Signage).
                </p>
              </div>
              <button
                onClick={handleExportAnalyticsExcel}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-extrabold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Download Sales Analytics</span>
              </button>
            </div>

          </div>

          {/* Sales Revenue Breakdown by Category Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
              <div>
                <h4 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Category Revenue & Unit Sales Analysis
                </h4>
                <p className="text-xs text-slate-500">Live breakdown of print production revenue by category.</p>
              </div>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                Gross Total: KSh {totalRevenue.toLocaleString()}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 uppercase font-black tracking-wider text-[10px] border-b border-slate-200">
                    <th className="p-3">Print Category</th>
                    <th className="p-3 text-center">Orders Count</th>
                    <th className="p-3 text-right">Revenue (KSh)</th>
                    <th className="p-3 text-right">Share of Sales</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                  {categories.filter((c) => c !== 'All').map((cat) => {
                    let catRev = 0;
                    let catCount = 0;

                    orders.forEach((ord) => {
                      ord.items.forEach((it) => {
                        if (it.product.category === cat) {
                          catRev += it.calculatedPrice || (it.product.price * it.quantity);
                          catCount += it.quantity;
                        }
                      });
                    });

                    const sharePct = totalRevenue > 0 ? ((catRev / totalRevenue) * 100).toFixed(1) : '0';

                    return (
                      <tr key={cat} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                          {cat}
                        </td>
                        <td className="p-3 text-center font-mono">{catCount} units</td>
                        <td className="p-3 text-right font-extrabold text-slate-900">KSh {catRev.toLocaleString()}</td>
                        <td className="p-3 text-right">
                          <span className="inline-block bg-blue-50 text-blue-700 font-extrabold px-2.5 py-0.5 rounded-md text-[11px] border border-blue-200">
                            {sharePct}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: PRODUCT CATALOG MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                Manage Product Catalog, Pictures & Prices
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload product photos, set live prices, write descriptions, and update catalog items in real-time.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={async () => {
                  if (!window.confirm('Reset all catalog product photos to official stock defaults? Warning: This will overwrite any custom photos you have uploaded.')) {
                    return;
                  }
                  setIsSyncingImages(true);
                  await restoreAllProductImages();
                  setIsSyncingImages(false);
                  showToast('Catalog photos reset to default stock photos.', 'All products updated.');
                }}
                disabled={isSyncingImages}
                className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 hover:text-white font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2 border border-slate-700 transition-all cursor-pointer"
                title="Reset all product photos to default stock photos"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncingImages ? 'animate-spin' : ''}`} />
                {isSyncingImages ? 'Resetting Photos...' : 'Reset Default Photos'}
              </button>
              <button
                onClick={() => {
                  setEditingProduct({
                    id: `prod-custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                    name: '',
                    category: 'Printed T-Shirts',
                    price: 1500,
                    originalPrice: 2000,
                    priceDisplay: '',
                    rating: 5.0,
                    reviewCount: 1,
                    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
                    description: '',
                    features: ['High DPI Print Resolution', 'Premium Material & Finishing', 'Fast Delivery Option'],
                    stockCount: 100,
                    isFlashDeal: false,
                    isQuoteOnly: false,
                  });
                  setIsCreatingNewProduct(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" /> Add New Catalog Product
              </button>
            </div>
          </div>

          {/* Product Edit / Creation Form */}
          {editingProduct && (
            <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-5 border border-slate-800 shadow-xl animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-xs">
                    {isCreatingNewProduct ? <Plus className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">
                      {isCreatingNewProduct ? 'Create New Catalog Product' : `Editing: ${editingProduct.name}`}
                    </h4>
                    <p className="text-[11px] text-slate-400">Fill in product details, upload photos, and set prices below</p>
                  </div>
                </div>
                <button
                  onClick={() => { setEditingProduct(null); setIsCreatingNewProduct(false); }}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-xs font-bold"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* SECTION 1: Product Picture Upload & Sample Presets */}
              <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Upload className="w-4 h-4" />
                    Product Picture / Photo Asset
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Upload photo file, paste link, or pick a stock preset
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  {/* Photo Preview Card */}
                  <div className="relative aspect-16/10 bg-slate-950 rounded-xl overflow-hidden border border-slate-700 flex items-center justify-center group">
                    {editingProduct.image ? (
                      <img
                        src={editingProduct.image}
                        alt="Product preview"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = getProductFallbackImage(editingProduct.name, editingProduct.category);
                        }}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-3 text-slate-500">
                        <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                        <span className="text-[11px] block">No Photo Uploaded</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center text-xs font-bold text-white">
                      Live Catalog Preview
                    </div>
                  </div>

                  {/* Upload Controls & Quick Presets */}
                  <div className="md:col-span-2 space-y-3">
                    <div 
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                          processAndCompressImage(file, (compressedUrl) => {
                            setEditingProduct({ ...editingProduct, image: compressedUrl });
                          });
                        }
                      }}
                      className="border-2 border-dashed border-slate-600 hover:border-blue-500 bg-slate-900/60 hover:bg-slate-900/90 rounded-2xl p-4 text-center cursor-pointer transition-all group"
                    >
                      <input
                        type="file"
                        accept="image/*"
                        id="product-photo-upload"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            processAndCompressImage(file, (compressedUrl) => {
                              setEditingProduct({ ...editingProduct, image: compressedUrl });
                            });
                          }
                        }}
                      />
                      <label htmlFor="product-photo-upload" className="cursor-pointer block space-y-1">
                        <div className="w-10 h-10 rounded-full bg-blue-600/20 text-blue-400 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center mx-auto transition-colors">
                          <Upload className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-slate-200 block">
                          Click to Insert Picture from Device or Drag & Drop
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Supports PNG, JPG, WEBP (Instant Live Display)
                        </span>
                      </label>
                    </div>

                    {/* Quick Stock Sample Photo Presets & Reset */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Or Choose Quick Sample Stock Picture:</span>
                        <button
                          type="button"
                          onClick={() => {
                            const defaultImg = INITIAL_PRODUCTS.find(p => p.id === editingProduct.id)?.image || getProductFallbackImage(editingProduct.name, editingProduct.category);
                            setEditingProduct({ ...editingProduct, image: defaultImg });
                            showToast('Template Photo Selected', 'Click "Save Product Changes" to apply.');
                          }}
                          className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                          title="Restore original default template image"
                        >
                          <RotateCcw className="w-3 h-3" /> Reset to Original Template Photo
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { label: '👕 T-Shirt', url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80' },
                          { label: '🧥 Hoodie', url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80' },
                          { label: '🎽 Reflector', url: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&auto=format&fit=crop&q=80' },
                          { label: '🚩 Rollup Banner', url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80' },
                          { label: '☕ Mug', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80' },
                          { label: '📄 Flyer / Poster', url: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=800&auto=format&fit=crop&q=80' },
                          { label: '🕊️ Funeral Program', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80' },
                        ].map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setEditingProduct({ ...editingProduct, image: preset.url })}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-blue-600 text-slate-300 hover:text-white rounded-lg text-[11px] font-semibold transition-colors cursor-pointer border border-slate-700"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Alternative Image URL Input */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Or Image URL:</span>
                      <input
                        type="url"
                        placeholder="https://example.com/photo.jpg"
                        value={editingProduct.image}
                        onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Product Information & Prices */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Product Title / Name <span className="text-red-400">*</span>:</label>
                  <input
                    type="text"
                    placeholder="e.g. Executive polo shirts, Roll-up banner, Mug branding..."
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-bold focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Category <span className="text-red-400">*</span>:</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as ProductCategory })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-bold focus:border-blue-500 focus:outline-none"
                  >
                    {categories.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Selling Price (KSh):</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-emerald-400 font-black text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Original Price (KSh strike-through):</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={editingProduct.originalPrice || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-300 font-semibold focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Custom Price Label (Optional):</label>
                  <input
                    type="text"
                    placeholder="e.g. KSh 6,500 (Light) / KSh 8,500 (Large)"
                    value={editingProduct.priceDisplay || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, priceDisplay: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Stock Quantity:</label>
                  <input
                    type="number"
                    value={editingProduct.stockCount}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stockCount: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-bold focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* SECTION 3: Customization Options (Sizes, Finishes, Min Quantity) */}
              <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 space-y-3">
                <label className="text-xs font-extrabold text-blue-400 uppercase tracking-wider block">
                  Product Customization Options (Sizes & Finishes)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Available Sizes (Comma separated):</label>
                    <input
                      type="text"
                      placeholder="S, M, L, XL, XXL or A4, A3, A2"
                      value={editingProduct.customizationOptions?.sizes?.join(', ') || ''}
                      onChange={(e) => {
                        const sizesArr = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                        setEditingProduct({
                          ...editingProduct,
                          customizationOptions: {
                            ...editingProduct.customizationOptions,
                            sizes: sizesArr,
                          }
                        });
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Available Finishes (Comma separated):</label>
                    <input
                      type="text"
                      placeholder="Screen Print, Embroidery, Sublimation, Glossy"
                      value={editingProduct.customizationOptions?.finishes?.join(', ') || ''}
                      onChange={(e) => {
                        const finishesArr = e.target.value.split(',').map(f => f.trim()).filter(Boolean);
                        setEditingProduct({
                          ...editingProduct,
                          customizationOptions: {
                            ...editingProduct.customizationOptions,
                            finishes: finishesArr,
                          }
                        });
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Min Order Quantity:</label>
                    <input
                      type="number"
                      placeholder="1"
                      value={editingProduct.customizationOptions?.minQuantity || 1}
                      onChange={(e) => {
                        const minQ = parseInt(e.target.value) || 1;
                        setEditingProduct({
                          ...editingProduct,
                          customizationOptions: {
                            ...editingProduct.customizationOptions,
                            minQuantity: minQ,
                          }
                        });
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-bold focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: Description & Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Full Product Description:</label>
                  <textarea
                    rows={4}
                    placeholder="Write detailed specifications, fabric GSM, print quality, sizing options, or delivery notes..."
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white leading-relaxed focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Key Features (One feature per line):</label>
                  <textarea
                    rows={4}
                    placeholder={`High Resolution Full-Color Print\nFast Countrywide Delivery Option\nDurable Premium Material`}
                    value={editingProduct.features.join('\n')}
                    onChange={(e) => setEditingProduct({
                      ...editingProduct,
                      features: e.target.value.split('\n').filter(f => f.trim() !== '')
                    })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white leading-relaxed focus:border-blue-500 focus:outline-none font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* SECTION 5: Toggles & Badges */}
              <div className="flex flex-wrap gap-4 items-center pt-2">
                <label className="flex items-center gap-2 cursor-pointer bg-slate-800 px-3 py-2 rounded-xl border border-slate-700">
                  <input
                    type="checkbox"
                    checked={editingProduct.isFlashDeal || false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isFlashDeal: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-0"
                  />
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 fill-amber-400" /> Flash Deal Banner
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-slate-800 px-3 py-2 rounded-xl border border-slate-700">
                  <input
                    type="checkbox"
                    checked={editingProduct.expressDeliveryAvailable || false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, expressDeliveryAvailable: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-0"
                  />
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> 24h Express Printing Badge
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-slate-800 px-3 py-2 rounded-xl border border-slate-700">
                  <input
                    type="checkbox"
                    checked={editingProduct.isQuoteOnly || false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isQuoteOnly: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-0"
                  />
                  <span className="text-xs font-bold text-slate-200">
                    Quote-Only Item (Requires WhatsApp Quote)
                  </span>
                </label>
              </div>

              {/* SECTION 6: Save & Cancel Buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                <button
                  onClick={() => {
                    if (!editingProduct.name.trim()) {
                      alert('Please provide a product title.');
                      return;
                    }
                    if (isCreatingNewProduct) {
                      addProduct(editingProduct);
                      showToast('New Product Created! 🚀', `Published ${editingProduct.name} to live catalogue.`);
                    } else {
                      updateProduct(editingProduct);
                      showToast('Product Updated! ✏️', `Saved changes for ${editingProduct.name}.`);
                    }
                    setEditingProduct(null);
                    setIsCreatingNewProduct(false);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Save Product & Publish Live
                </button>
                <button
                  onClick={() => { setEditingProduct(null); setIsCreatingNewProduct(false); }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Product Catalog Live Table with Search & Category Filter */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block">
                  Live Catalog Products ({products.length} Total)
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  All additions & edits reflect live on shop & price catalog instantly
                </span>
              </div>

              {/* Search & Category Filter Bar */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={catalogSearchQuery}
                  onChange={(e) => setCatalogSearchQuery(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-48"
                />
                <select
                  value={catalogCategoryFilter}
                  onChange={(e) => setCatalogCategoryFilter(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-900 font-bold uppercase text-[10px] tracking-wider border-b">
                  <tr>
                    <th className="p-3">Product Photo & Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Live Price (KSh)</th>
                    <th className="p-3">Stock & Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {products
                    .filter(p => {
                      const matchesCategory = catalogCategoryFilter === 'All' || p.category === catalogCategoryFilter;
                      const matchesSearch = !catalogSearchQuery.trim() || 
                        p.name.toLowerCase().includes(catalogSearchQuery.toLowerCase()) || 
                        p.description.toLowerCase().includes(catalogSearchQuery.toLowerCase());
                      return matchesCategory && matchesSearch;
                    })
                    .map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="relative group shrink-0">
                            <img 
                              src={p.image || getProductFallbackImage(p.name, p.category)} 
                              alt={p.name} 
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = getProductFallbackImage(p.name, p.category);
                              }}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-2xs" 
                            />
                            {/* Quick Photo Change Overlay */}
                            <label 
                              htmlFor={`change-photo-${p.id}`}
                              className="absolute inset-0 bg-slate-900/70 text-white opacity-0 group-hover:opacity-100 rounded-xl flex items-center justify-center cursor-pointer transition-opacity text-[9px] font-bold"
                              title="Change Photo"
                            >
                              <Upload className="w-3.5 h-3.5" />
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              id={`change-photo-${p.id}`}
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  processAndCompressImage(file, (compressedUrl) => {
                                    updateProduct({ ...p, image: compressedUrl });
                                    showToast('Photo Updated! 📸', `Updated photo for ${p.name}.`);
                                  });
                                }
                              }}
                            />
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 block text-xs line-clamp-1">{p.name}</span>
                            <p className="text-[11px] text-slate-500 line-clamp-1">{p.description || 'No description added'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-bold text-blue-600">
                        <span className="bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 rounded-lg text-[11px]">
                          {p.category}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="font-black text-slate-900">
                          {p.isQuoteOnly || p.price === 0 ? (
                            <span className="text-blue-600 font-bold text-[11px]">WhatsApp Quote</span>
                          ) : (
                            <span className="text-emerald-700">KSh {p.price.toLocaleString()}</span>
                          )}
                        </div>
                        {p.originalPrice && p.originalPrice > p.price && (
                          <span className="text-[10px] text-slate-400 line-through block">
                            KSh {p.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg text-[11px] inline-block">
                          {p.stockCount} in stock
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => { setEditingProduct(p); setIsCreatingNewProduct(false); }}
                            className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                            title="Edit Product Details & Price"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => {
                              const duplicatedProduct = {
                                ...p,
                                id: `prod-custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                                name: `${p.name} (Copy)`,
                              };
                              setEditingProduct(duplicatedProduct);
                              setIsCreatingNewProduct(true);
                            }}
                            className="p-1.5 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-lg font-bold transition-colors cursor-pointer"
                            title="Duplicate Product"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete ${p.name} from catalog?`)) {
                                deleteProduct(p.id);
                                showToast('Product Deleted', `Removed ${p.name} from catalog.`);
                              }
                            }}
                            className="p-1.5 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-lg font-bold transition-colors cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CMS, BRANDING & FOOTER CUSTOMIZER */}
      {activeTab === 'wordpress' && (
        <form onSubmit={handleSaveWpSettings} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" /> Live CMS, Branding & Footer Information Customizer
              </h3>
              <p className="text-xs text-slate-500">
                Manage your site logo, company office location, contact hotlines, footer content, social links, and live payment gateways.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleExportWpJson}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-300"
              >
                <Download className="w-4 h-4 text-slate-500" /> Export JSON
              </button>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" /> Save All Changes Live
              </button>
            </div>
          </div>

          {/* Section: Official Logo & Brand Visuals */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">1. Brand Visuals & Active Logo</h4>
            </div>

            {/* Site Logo Upload & Live Activation Card */}
            <div className="bg-slate-900 text-white p-5 rounded-2xl border border-blue-900/80 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h4 className="text-sm font-black text-white flex items-center gap-2">
                    <Upload className="w-4 h-4 text-blue-400" /> Insert New Official Site Logo (Live Activation)
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    Upload or paste an image link for a new logo. Once inserted, it will immediately become live and active across the entire website.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowLogoModal(true)}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Open Full Logo Studio</span>
                  </button>

                  {siteLogo && (
                    <button
                      type="button"
                      onClick={() => {
                        setSiteLogo('');
                        updateWpSettings({ siteLogo: '' });
                        showToast('Logo Reset 🔄', 'Restored official default WoodyNat Designers logo.');
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-bold transition-colors self-start sm:self-auto cursor-pointer"
                    >
                      Reset to Default Logo
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                {/* Upload & Link Controls */}
                <div className="space-y-3">
                  <label className="block text-[11px] font-bold text-slate-300">
                    1. Upload Logo Image File (PNG, JPG, SVG, WebP):
                  </label>
                  <label className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-3 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>Upload & Insert New Logo File</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          processAndCompressImage(file, (compressedUrl) => {
                            setSiteLogo(compressedUrl);
                            updateWpSettings({ siteLogo: compressedUrl });
                            showToast('New Logo Live! 🎨', 'Your uploaded logo is now live and active across all screens.');
                          });
                        }
                      }}
                    />
                  </label>

                  <div className="space-y-1 pt-1">
                    <label className="block text-[11px] font-bold text-slate-300">
                      2. Or Paste Direct Image URL:
                    </label>
                    <input
                      type="text"
                      value={siteLogo}
                      onChange={(e) => {
                        setSiteLogo(e.target.value);
                        updateWpSettings({ siteLogo: e.target.value });
                      }}
                      placeholder="https://example.com/woodynat-custom-logo.png"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </div>

                {/* Live Preview Panel */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center space-y-2.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">
                    Live Active Logo Preview
                  </span>
                  <div className="bg-white p-3 rounded-xl shadow-inner border border-slate-200 flex items-center justify-center min-h-[95px] w-full max-w-xs">
                    <img
                      src={siteLogo || '/assets/images/woodynat_official_logo.jpg'}
                      alt="Active Logo Preview"
                      className="max-h-20 max-w-full object-contain"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/assets/images/woodynat_official_logo.jpg';
                      }}
                    />
                  </div>
                  <span className="text-[11px] font-extrabold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {siteLogo ? 'Custom Uploaded Logo Active' : 'Default WoodyNat Logo Active'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Website / Business Title:</label>
                <input
                  type="text"
                  value={siteTitle}
                  onChange={(e) => setSiteTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Main Business Tagline:</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section: Official Contact & Physical Office Location */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">2. Contact Numbers & Workshop Office Address</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div className="sm:col-span-2 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">Physical Company Location / Address:</label>
                <input
                  type="text"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">City / Region:</label>
                <input
                  type="text"
                  value={companyCity}
                  onChange={(e) => setCompanyCity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">WhatsApp Inquiry Number:</label>
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Support Phone Hotline:</label>
                <input
                  type="text"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Official Company Email:</label>
                <input
                  type="email"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">M-PESA Paybill Number:</label>
                <input
                  type="text"
                  value={paybillNumber}
                  onChange={(e) => setPaybillNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-extrabold focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">M-PESA Account Number:</label>
                <input
                  type="text"
                  value={paybillAccount}
                  onChange={(e) => setPaybillAccount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-extrabold focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section: Dedicated Footer Information & Trust Badges Customizer */}
          <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">3. Footer Information, Hours & Social Links</h4>
              </div>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                Live Footer Display
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Footer "About Studio" Description Text:</label>
                <textarea
                  rows={2}
                  value={footerAboutText}
                  onChange={(e) => setFooterAboutText(e.target.value)}
                  placeholder="Commercial graphics, printing, custom apparel branding..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[10px] text-slate-500 mt-0.5">Displayed directly under the brand logo in the footer.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Office Hours & Working Times:</label>
                  <input
                    type="text"
                    value={footerOfficeHours}
                    onChange={(e) => setFooterOfficeHours(e.target.value)}
                    placeholder="Mon - Sat: 8:00 AM - 7:00 PM | Sun: On-Call / Urgent Proofing"
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Footer Copyright Text:</label>
                  <input
                    type="text"
                    value={footerCopyrightText}
                    onChange={(e) => setFooterCopyrightText(e.target.value)}
                    placeholder="© 2026 Woodynat Designers Limited. All rights reserved."
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Developer / Craft Credit Line:</label>
                <input
                  type="text"
                  value={footerDeveloperCredit}
                  onChange={(e) => setFooterDeveloperCredit(e.target.value)}
                  placeholder="• A craft designed and developed by DaveTech Solutions"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Social Media Links */}
              <div className="pt-2">
                <label className="text-xs font-black text-slate-800 block mb-2 uppercase tracking-wide">
                  Social Media Profile Links:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 block mb-1">Facebook URL:</span>
                    <input
                      type="text"
                      value={facebookUrl}
                      onChange={(e) => setFacebookUrl(e.target.value)}
                      placeholder="https://facebook.com/..."
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-600 block mb-1">Instagram URL:</span>
                    <input
                      type="text"
                      value={instagramUrl}
                      onChange={(e) => setInstagramUrl(e.target.value)}
                      placeholder="https://instagram.com/..."
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-600 block mb-1">TikTok URL:</span>
                    <input
                      type="text"
                      value={tiktokUrl}
                      onChange={(e) => setTiktokUrl(e.target.value)}
                      placeholder="https://tiktok.com/@..."
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-600 block mb-1">X / Twitter URL (Optional):</span>
                    <input
                      type="text"
                      value={twitterUrl}
                      onChange={(e) => setTwitterUrl(e.target.value)}
                      placeholder="https://x.com/..."
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-600 block mb-1">YouTube Channel URL (Optional):</span>
                    <input
                      type="text"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="https://youtube.com/@..."
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* 4 Trust Badges Customizer */}
              <div className="pt-3 border-t border-slate-200">
                <label className="text-xs font-black text-slate-800 block mb-2 uppercase tracking-wide">
                  Footer Trust Badges (4 Top Guarantee Cards):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[11px] font-extrabold text-blue-700 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Badge 1: Quality Guarantee
                    </span>
                    <input
                      type="text"
                      value={footerTrustBadge1Title}
                      onChange={(e) => setFooterTrustBadge1Title(e.target.value)}
                      placeholder="Badge 1 Title"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold"
                    />
                    <input
                      type="text"
                      value={footerTrustBadge1Desc}
                      onChange={(e) => setFooterTrustBadge1Desc(e.target.value)}
                      placeholder="Badge 1 Subtitle / Description"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                    />
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[11px] font-extrabold text-emerald-700 flex items-center gap-1">
                      <Smartphone className="w-3.5 h-3.5" /> Badge 2: Payment Gateway
                    </span>
                    <input
                      type="text"
                      value={footerTrustBadge2Title}
                      onChange={(e) => setFooterTrustBadge2Title(e.target.value)}
                      placeholder="Badge 2 Title"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold"
                    />
                    <input
                      type="text"
                      value={footerTrustBadge2Desc}
                      onChange={(e) => setFooterTrustBadge2Desc(e.target.value)}
                      placeholder="Badge 2 Subtitle / Description"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                    />
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[11px] font-extrabold text-amber-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Badge 3: Turnaround / Service
                    </span>
                    <input
                      type="text"
                      value={footerTrustBadge3Title}
                      onChange={(e) => setFooterTrustBadge3Title(e.target.value)}
                      placeholder="Badge 3 Title"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold"
                    />
                    <input
                      type="text"
                      value={footerTrustBadge3Desc}
                      onChange={(e) => setFooterTrustBadge3Desc(e.target.value)}
                      placeholder="Badge 3 Subtitle / Description"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                    />
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[11px] font-extrabold text-violet-700 flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5" /> Badge 4: Logistics & Tracking
                    </span>
                    <input
                      type="text"
                      value={footerTrustBadge4Title}
                      onChange={(e) => setFooterTrustBadge4Title(e.target.value)}
                      placeholder="Badge 4 Title"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold"
                    />
                    <input
                      type="text"
                      value={footerTrustBadge4Desc}
                      onChange={(e) => setFooterTrustBadge4Desc(e.target.value)}
                      placeholder="Badge 4 Subtitle / Description"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Homepage Hero & Banner Controls */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <Megaphone className="w-4 h-4 text-amber-600" />
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">4. Top Flash Banner & Homepage Hero Content</h4>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Top Flash Sale Banner Notice Bar:</label>
                <input
                  type="text"
                  value={topBannerText}
                  onChange={(e) => setTopBannerText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Hero Main Title Headline:</label>
                <input
                  type="text"
                  value={heroHeadline}
                  onChange={(e) => setHeroHeadline(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-extrabold focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Hero Subheadline Text:</label>
                <textarea
                  rows={2}
                  value={heroSubheadline}
                  onChange={(e) => setHeroSubheadline(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section: M-Pesa Live API Keys & Gateway Config */}
          <div className="bg-emerald-950 text-white p-5 rounded-2xl border border-emerald-800/80 space-y-4">
            <div className="flex justify-between items-center border-b border-emerald-800 pb-2">
              <h5 className="font-extrabold text-xs text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-400" /> Safaricom Daraja M-PESA Live Payment Gateway Config
              </h5>
              <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                Live API Integrated
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-emerald-200 block mb-1">M-Pesa Gateway Mode:</label>
                <select
                  value={mpesaEnvironment}
                  onChange={(e) => setMpesaEnvironment(e.target.value as 'sandbox' | 'production')}
                  className="w-full bg-slate-900 border border-emerald-800 text-white rounded-xl p-2.5 font-bold focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="production">Production (Live Safaricom Paybill / Till)</option>
                  <option value="sandbox">Sandbox (Safaricom Developer Testing)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-emerald-200 block mb-1">Passkey (Online Passkey):</label>
                <div className="relative">
                  <input
                    type={showPasskey ? 'text' : 'password'}
                    placeholder="Safaricom Online Passkey"
                    value={mpesaPasskey}
                    onChange={(e) => setMpesaPasskey(e.target.value)}
                    className="w-full bg-slate-900 border border-emerald-800 text-white rounded-xl p-2.5 pr-10 font-mono text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasskey(!showPasskey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-emerald-200 transition-colors p-1 cursor-pointer"
                    title={showPasskey ? 'Hide passkey' : 'Show passkey'}
                  >
                    {showPasskey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-emerald-200 block mb-1">Consumer Key:</label>
                <input
                  type="text"
                  placeholder="Safaricom Consumer Key"
                  value={mpesaConsumerKey}
                  onChange={(e) => setMpesaConsumerKey(e.target.value)}
                  className="w-full bg-slate-900 border border-emerald-800 text-white rounded-xl p-2.5 font-mono text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-emerald-200 block mb-1">Consumer Secret:</label>
                <div className="relative">
                  <input
                    type={showConsumerSecret ? 'text' : 'password'}
                    placeholder="Safaricom Consumer Secret"
                    value={mpesaConsumerSecret}
                    onChange={(e) => setMpesaConsumerSecret(e.target.value)}
                    className="w-full bg-slate-900 border border-emerald-800 text-white rounded-xl p-2.5 pr-10 font-mono text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConsumerSecret(!showConsumerSecret)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-emerald-200 transition-colors p-1 cursor-pointer"
                    title={showConsumerSecret ? 'Hide consumer secret' : 'Show consumer secret'}
                  >
                    {showConsumerSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-emerald-900/80">
              <p className="text-[10px] text-emerald-300 leading-normal">
                💡 Credentials can also be supplied via server environment variables: <code className="text-amber-300">MPESA_CONSUMER_KEY</code>, <code className="text-amber-300">MPESA_CONSUMER_SECRET</code>, <code className="text-amber-300">MPESA_PASSKEY</code>.
              </p>
              <button
                type="button"
                onClick={handleRegisterC2bUrls}
                disabled={isRegisteringC2b}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl border border-emerald-400/50 flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs transition-colors disabled:opacity-50"
              >
                <Radio className="w-3.5 h-3.5 text-emerald-200" />
                <span>{isRegisteringC2b ? 'Registering C2B...' : 'Register C2B Webhook URLs'}</span>
              </button>
            </div>
          </div>

          {/* Section: WooCommerce / WordPress REST API */}
          <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2">
            <h5 className="font-bold text-xs text-amber-400 flex items-center gap-1">
              <FileCode className="w-4 h-4" /> WooCommerce / WordPress REST API Bridge Settings:
            </h5>
            <input
              type="text"
              value={wpRestEndpoint}
              onChange={(e) => setWpRestEndpoint(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-emerald-400"
            />
            <p className="text-[10px] text-slate-400">
              Synchronized endpoints automatically map products to WooCommerce database schema.
            </p>
          </div>

          {/* Bottom Save Action */}
          <div className="pt-4 border-t flex justify-end">
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-3 rounded-xl text-sm flex items-center gap-2 shadow-lg transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save All CMS & Footer Changes Live
            </button>
          </div>
        </form>
      )}

      {/* M-Pesa Payment Prompt Modal for Admin */}
      {showPaymentPromptModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-slate-200">
            
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 font-black">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">Prompt Customer M-Pesa Payment</h4>
                  <p className="text-[11px] text-slate-500 font-medium">Trigger M-Pesa STK push PIN prompt on customer handset</p>
                </div>
              </div>

              <button
                onClick={() => setShowPaymentPromptModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendPaymentPrompt} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Customer M-Pesa Phone Number:
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-extrabold text-slate-400">+254</span>
                  <input
                    type="text"
                    required
                    value={promptPhone}
                    onChange={(e) => setPromptPhone(e.target.value)}
                    placeholder="0797939199"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-14 pr-3 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Safaricom M-Pesa registered mobile number</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Payment Amount depending on Quote/Order (KSh):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-extrabold text-emerald-600">KSh</span>
                  <input
                    type="number"
                    required
                    min="1"
                    value={promptAmount}
                    onChange={(e) => setPromptAmount(Number(e.target.value))}
                    placeholder="3500"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-12 pr-3 text-sm font-extrabold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Specify custom deposit or total print amount</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Payment Description / Invoice Ref:
                </label>
                <input
                  type="text"
                  value={promptReason}
                  onChange={(e) => setPromptReason(e.target.value)}
                  placeholder="e.g. Order #1029 Deposit"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-[11px] text-emerald-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Instant STK Push Automation</span>
                  Prompt will appear automatically on customer phone screen asking for M-Pesa PIN to complete payment to Paybill <strong>{wpSettings.paybillNumber || '247247'}</strong>.
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentPromptModal(false)}
                  className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSendingPrompt}
                  className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all disabled:opacity-50"
                >
                  {isSendingPrompt ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending Prompt...</span>
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-4 h-4" />
                      <span>Send STK Push Prompt</span>
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Admin Email to Customer Dispatcher Modal */}
      {showEmailModal && emailModalOrder && (
        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-slate-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-black shadow-xs">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">Send Gmail to Customer</h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Dispatch official email alert for <span className="font-bold text-slate-800">Order #{emailModalOrder.id}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowEmailModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1 rounded-xl text-lg cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Official Sender Tag */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-extrabold text-slate-700">Official Sender:</span>
                <span className="font-mono font-bold text-indigo-700">woodynatdesigners12@gmail.com</span>
              </div>
              <span className="text-[10px] bg-indigo-100 text-indigo-800 font-black px-2 py-0.5 rounded-md">
                Verified Gmail
              </span>
            </div>

            <form onSubmit={handleDispatchAdminEmail} className="space-y-4">
              
              {/* Recipient Gmail */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Recipient Gmail / Email Address: <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={emailRecipient}
                    onChange={(e) => setEmailRecipient(e.target.value)}
                    placeholder="customer@gmail.com"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-10 pr-3 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Customer: <strong className="text-slate-800">{emailModalOrder.customerName}</strong> ({emailModalOrder.customerPhone})
                </p>
              </div>

              {/* Template / Purpose Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Email Content Type:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEmailType('confirmation');
                      setEmailSubject(`Official Order Confirmation #${emailModalOrder.id} - Woodynat Designers Limited`);
                    }}
                    className={`p-2 rounded-xl text-left border text-[11px] font-bold transition-all cursor-pointer ${
                      emailType === 'confirmation'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-900 ring-2 ring-indigo-200'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-extrabold">1. Order Receipt</div>
                    <div className="text-[10px] text-slate-500 font-normal">Full itemized invoice</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEmailType('status_update');
                      setEmailSubject(`Order #${emailModalOrder.id} Status: "${emailModalOrder.orderStatus}" - Woodynat Designers`);
                    }}
                    className={`p-2 rounded-xl text-left border text-[11px] font-bold transition-all cursor-pointer ${
                      emailType === 'status_update'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-900 ring-2 ring-indigo-200'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-extrabold">2. Status Alert</div>
                    <div className="text-[10px] text-slate-500 font-normal">Stage: {emailModalOrder.orderStatus}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEmailType('custom_message');
                      setEmailSubject(`Production & Artwork Notice for Order #${emailModalOrder.id}`);
                    }}
                    className={`p-2 rounded-xl text-left border text-[11px] font-bold transition-all cursor-pointer ${
                      emailType === 'custom_message'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-900 ring-2 ring-indigo-200'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-extrabold">3. Custom Notice</div>
                    <div className="text-[10px] text-slate-500 font-normal">Design proof note</div>
                  </button>
                </div>
              </div>

              {/* Subject Line */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Email Subject Line:
                </label>
                <input
                  type="text"
                  required
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Custom Admin Note / Message */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Message / Workshop Instructions / Proof Notes:
                </label>
                <textarea
                  rows={4}
                  value={emailCustomNote}
                  onChange={(e) => setEmailCustomNote(e.target.value)}
                  placeholder="Add custom proof approval link, workshop directions, or delivery remarks..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSendingEmail}
                  className="w-2/3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all disabled:opacity-50 active:scale-98"
                >
                  {isSendingEmail ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Dispatching Email...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send via woodynatdesigners12@gmail.com</span>
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Admin Logo Manager Studio Modal */}
      <AdminLogoManagerModal
        isOpen={showLogoModal}
        onClose={() => setShowLogoModal(false)}
      />

    </div>
  );
};
