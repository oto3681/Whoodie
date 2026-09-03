import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ZohoQuotation as WoodyQuotation, 
  ZohoQuoteItem as WoodyQuoteItem, 
  ZohoQuoteStatus as WoodyQuoteStatus, 
  Product, 
  ProductCategory 
} from '../types';
import { safeCopyToClipboard } from '../utils/clipboard';
import { downloadWoodyQuotePdf, formatKenyanShillingsToWords } from '../utils/woodyQuotePdfGenerator';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Printer, 
  Share2, 
  Send, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ArrowRight, 
  Copy, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  ExternalLink, 
  Check, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  DollarSign, 
  ShieldCheck, 
  Settings, 
  Eye, 
  Package, 
  Sparkles, 
  Download,
  AlertCircle,
  MessageCircle,
  HelpCircle,
  Hash,
  ChevronDown,
  Loader2
} from 'lucide-react';

export const AdminWoodyQuoteStudio: React.FC = () => {
  const { 
    zohoQuotations, 
    zohoSettings, 
    products, 
    inquiries, 
    orders, 
    wpSettings,
    createZohoQuotation, 
    updateZohoQuotation, 
    deleteZohoQuotation, 
    duplicateZohoQuotation, 
    updateZohoQuoteStatus, 
    convertZohoQuoteToOrder, 
    updateZohoSettings, 
    syncQuoteToZoho,
    showToast 
  } = useApp();

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | WoodyQuoteStatus>('All');
  
  // Modals & Active Quote states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<WoodyQuotation | null>(null);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Email customization states inside email modal
  const [customRecipientEmail, setCustomRecipientEmail] = useState('');
  const [customEmailSubject, setCustomEmailSubject] = useState('');
  const [customEmailNote, setCustomEmailNote] = useState('');

  // Form State for Quotation Builder (KRA removed)
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('Temple Road Gatkim complex building fourth floor wing B Room 4B1');
  const [deliveryType, setDeliveryType] = useState<WoodyQuotation['deliveryType']>('CBD Workshop Pickup');
  const [quoteNumber, setQuoteNumber] = useState('');
  const [quoteDate, setQuoteDate] = useState(new Date().toISOString().split('T')[0]);
  const [validityDays, setValidityDays] = useState(14);
  const [paymentTerms, setPaymentTerms] = useState<WoodyQuotation['paymentTerms']>('50% Deposit, 50% on Delivery');
  const [deliveryTimeline, setDeliveryTimeline] = useState('24-48 Hours Express Delivery');
  const [currency, setCurrency] = useState<'KSh' | 'USD'>('KSh');
  const [shippingCost, setShippingCost] = useState(0);
  const [notes, setNotes] = useState(zohoSettings.defaultNotes);
  const [termsAndConditions, setTermsAndConditions] = useState(zohoSettings.defaultTerms);
  const [quoteItems, setQuoteItems] = useState<WoodyQuoteItem[]>([]);

  // Item selector helpers inside builder
  const [selectedProductId, setSelectedProductId] = useState('');
  const [customItemName, setCustomItemName] = useState('');
  const [customItemCategory, setCustomItemCategory] = useState<ProductCategory>('Printed T-Shirts');
  const [customItemDesc, setCustomItemDesc] = useState('');
  const [customItemQty, setCustomItemQty] = useState(1);
  const [customItemUnit, setCustomItemUnit] = useState('pcs');
  const [customItemPrice, setCustomItemPrice] = useState(500);
  const [customItemDiscount, setCustomItemDiscount] = useState(0);
  const [customItemSize, setCustomItemSize] = useState('');
  const [customItemFinish, setCustomItemFinish] = useState('');
  const [customItemArtworkNotes, setCustomItemArtworkNotes] = useState('');

  // Settings Modal State (KRA removed)
  const [tempAccountEmail, setTempAccountEmail] = useState(zohoSettings.accountEmail || 'woodynatdesigners12@gmail.com');
  const [tempNotificationEmail, setTempNotificationEmail] = useState(zohoSettings.notificationEmail || 'woodynatdesigners12@gmail.com');
  const [tempSenderName, setTempSenderName] = useState(zohoSettings.senderName || 'Woodynat Designers Limited');
  const [tempOrgId, setTempOrgId] = useState(zohoSettings.organizationId || 'WOODY-ORG-2026');
  const [tempClientId, setTempClientId] = useState(zohoSettings.clientId || 'WOODYNAT_CLIENT_LIVE');
  const [tempClientSecret, setTempClientSecret] = useState(zohoSettings.clientSecret || 'sec_woodynat_live_auth');
  const [tempRefreshToken, setTempRefreshToken] = useState(zohoSettings.refreshToken || 'rf_woodynat_live_auth');
  const [tempEnv, setTempEnv] = useState<'sandbox' | 'production'>(zohoSettings.environment || 'production');
  const [tempAutoSync, setTempAutoSync] = useState(zohoSettings.autoSyncToZoho ?? true);
  const [tempPrefix, setTempPrefix] = useState(zohoSettings.defaultQuotePrefix || 'WNAT-2026');

  // Filtered quotations
  const filteredQuotes = zohoQuotations.filter((q) => {
    const matchesSearch = 
      q.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.companyName && q.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      q.customerPhone.includes(searchQuery) ||
      (q.customerEmail && q.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'All' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Financial Stats
  const totalQuotesCount = zohoQuotations.length;
  const approvedQuotesCount = zohoQuotations.filter((q) => q.status === 'Approved' || q.status === 'Converted to Order').length;
  const totalApprovedValue = zohoQuotations
    .filter((q) => q.status === 'Approved' || q.status === 'Converted to Order')
    .reduce((sum, q) => sum + q.grandTotal, 0);
  const draftQuotesCount = zohoQuotations.filter((q) => q.status === 'Draft').length;
  const convertedOrdersCount = zohoQuotations.filter((q) => q.status === 'Converted to Order').length;

  // Open New Quote Editor
  const handleOpenNewQuote = (presetLead?: { name: string; phone: string; email?: string; company?: string; topic?: string }) => {
    setEditingQuoteId(null);
    const rawPrefix = zohoSettings.defaultQuotePrefix || 'WNAT-2026';
    const prefix = rawPrefix.replace(/^(ZOHO-QT|WQ)/, 'WNAT');
    const nextNum = `${prefix}-${String(zohoQuotations.length + 1).padStart(4, '0')}`;
    setQuoteNumber(nextNum);
    setQuoteDate(new Date().toISOString().split('T')[0]);
    setValidityDays(zohoSettings.defaultValidityDays || 14);
    setPaymentTerms(zohoSettings.defaultPaymentTerms || '50% Deposit, 50% on Delivery');
    setDeliveryTimeline(zohoSettings.defaultDeliveryTimeline || '24-48 Hours Express Delivery');
    setDeliveryType('CBD Workshop Pickup');
    setDeliveryLocation('Temple Road Gatkim complex building fourth floor wing B Room 4B1');
    setCurrency('KSh');
    setShippingCost(0);
    setNotes(zohoSettings.defaultNotes);
    setTermsAndConditions(zohoSettings.defaultTerms);

    if (presetLead) {
      setCustomerName(presetLead.name);
      setCustomerPhone(presetLead.phone);
      setCustomerEmail(presetLead.email || 'client@example.com');
      setCompanyName(presetLead.company || '');
      setBillingAddress('Nairobi, Kenya');
    } else {
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setCompanyName('');
      setBillingAddress('');
    }

    // Default sample item from first product
    const firstProd = products[0];
    if (firstProd) {
      setQuoteItems([
        {
          id: `item-${Date.now()}-1`,
          productId: firstProd.id,
          name: firstProd.name,
          category: firstProd.category,
          description: firstProd.description.slice(0, 120),
          quantity: 1,
          unit: 'pcs',
          unitPrice: firstProd.price || 6500,
          discountPercent: 0,
          taxPercent: 0,
          taxAmount: 0,
          total: firstProd.price || 6500,
          artworkNotes: 'Pre-press vector artwork sign-off required'
        }
      ]);
    } else {
      setQuoteItems([]);
    }

    setIsEditorOpen(true);
  };

  // Open Edit Quote
  const handleOpenEditQuote = (quote: WoodyQuotation) => {
    setEditingQuoteId(quote.id);
    setQuoteNumber(quote.quoteNumber);
    setCustomerName(quote.customerName);
    setCustomerPhone(quote.customerPhone);
    setCustomerEmail(quote.customerEmail);
    setCompanyName(quote.companyName || '');
    setBillingAddress(quote.billingAddress || '');
    setDeliveryLocation(quote.deliveryLocation);
    setDeliveryType(quote.deliveryType);
    setQuoteDate(quote.quoteDate);
    setValidityDays(quote.validityDays);
    setPaymentTerms(quote.paymentTerms);
    setDeliveryTimeline(quote.deliveryTimeline);
    setCurrency(quote.currency);
    setShippingCost(quote.shippingCost);
    setNotes(quote.notes);
    setTermsAndConditions(quote.termsAndConditions);
    setQuoteItems([...quote.items]);
    setIsEditorOpen(true);
  };

  // Product Selection handler
  const handleSelectProduct = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      setCustomItemName(prod.name);
      setCustomItemCategory(prod.category);
      setCustomItemDesc(prod.description.slice(0, 150));
      setCustomItemPrice(prod.price || 1500);
      setCustomItemQty(1);
      setCustomItemDiscount(0);
      setCustomItemSize(prod.customizationOptions?.sizes?.[0] || '');
      setCustomItemFinish(prod.customizationOptions?.finishes?.[0] || '');
      setCustomItemArtworkNotes('Pre-press vector artwork approval included');
    }
  };

  // Add Item to Current Quote
  const handleAddItemToQuote = () => {
    if (!customItemName.trim()) {
      showToast('Validation Error', 'Please provide an item title or product name.', 'error');
      return;
    }

    const price = Number(customItemPrice) || 0;
    const qty = Number(customItemQty) || 1;
    const discount = Number(customItemDiscount) || 0;
    const lineNet = (price * qty) * (1 - discount / 100);

    const newItem: WoodyQuoteItem = {
      id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      productId: selectedProductId || undefined,
      name: customItemName.trim(),
      category: customItemCategory,
      description: customItemDesc.trim(),
      quantity: qty,
      unit: customItemUnit,
      unitPrice: price,
      discountPercent: discount,
      taxPercent: 0,
      taxAmount: 0,
      total: Math.round(lineNet),
      selectedSize: customItemSize || undefined,
      selectedFinish: customItemFinish || undefined,
      artworkNotes: customItemArtworkNotes || undefined
    };

    setQuoteItems((prev) => [...prev, newItem]);

    // Reset temporary selector inputs
    setSelectedProductId('');
    setCustomItemName('');
    setCustomItemDesc('');
    setCustomItemPrice(500);
    setCustomItemQty(1);
    setCustomItemDiscount(0);
    setCustomItemSize('');
    setCustomItemFinish('');
    setCustomItemArtworkNotes('');

    showToast('Item Added', `"${newItem.name}" added to quotation line items.`);
  };

  // Remove item from quote
  const handleRemoveItem = (itemId: string) => {
    setQuoteItems((prev) => prev.filter((it) => it.id !== itemId));
  };

  // Update Item in quote
  const handleUpdateItem = (itemId: string, updates: Partial<WoodyQuoteItem>) => {
    setQuoteItems((prev) =>
      prev.map((it) => {
        if (it.id !== itemId) return it;
        const next = { ...it, ...updates };
        const price = next.unitPrice || 0;
        const qty = next.quantity || 1;
        const disc = next.discountPercent || 0;
        const net = (price * qty) * (1 - disc / 100);
        next.total = Math.round(net);
        next.taxPercent = 0;
        next.taxAmount = 0;
        return next;
      })
    );
  };

  // Calculate live summary in builder (Clean - No VAT)
  const editorSubtotal = quoteItems.reduce((acc, it) => acc + (it.quantity * it.unitPrice), 0);
  const editorDiscountTotal = quoteItems.reduce((acc, it) => acc + (it.quantity * it.unitPrice * (it.discountPercent / 100)), 0);
  const editorNetAmount = editorSubtotal - editorDiscountTotal;
  const editorGrandTotal = editorNetAmount + Number(shippingCost);

  // Save Quote Action
  const handleSaveQuote = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !customerPhone.trim()) {
      showToast('Missing Details', 'Customer name and phone number are required for quotation.', 'error');
      return;
    }

    if (quoteItems.length === 0) {
      showToast('Empty Items', 'Please add at least one line item to the quotation.', 'error');
      return;
    }

    const payload: Partial<WoodyQuotation> = {
      quoteNumber,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim() || 'client@example.com',
      companyName: companyName.trim(),
      billingAddress: billingAddress.trim(),
      deliveryLocation,
      deliveryType,
      quoteDate,
      validityDays,
      paymentTerms,
      deliveryTimeline,
      currency,
      items: quoteItems,
      taxRate: 0,
      taxTotal: 0,
      isTaxInclusive: false,
      shippingCost: Number(shippingCost) || 0,
      notes,
      termsAndConditions,
      paybillNumber: wpSettings.paybillNumber || '247247',
      paybillAccount: wpSettings.paybillAccount || '0797939199'
    };

    if (editingQuoteId) {
      updateZohoQuotation(editingQuoteId, payload);
      showToast('Woody-Quote Updated', `Quotation #${quoteNumber} successfully updated.`);
    } else {
      createZohoQuotation(payload);
      showToast('Woody-Quote Created', `Quotation #${quoteNumber} successfully generated.`);
    }

    setIsEditorOpen(false);
  };

  // Generate WhatsApp Message text for Quote (No KRA)
  const getWhatsAppMessageText = (quote: WoodyQuotation): string => {
    const itemsList = quote.items
      .map((item, idx) => `  ${idx + 1}. *${item.name}* (${item.quantity} ${item.unit} @ KSh ${item.unitPrice.toLocaleString()})\n     _${item.description.slice(0, 70)}..._ = *KSh ${item.total.toLocaleString()}*`)
      .join('\n');

    return `📄 *OFFICIAL COMMERCIAL QUOTATION (WOODY-QUOTE)*\n` +
      `*Woodynat Designers Limited*\n` +
      `--------------------------------------\n` +
      `*Quote Ref:* ${quote.quoteNumber}\n` +
      `*Date:* ${quote.quoteDate} (Valid for ${quote.validityDays} days)\n` +
      `*Client:* ${quote.customerName} ${quote.companyName ? `(${quote.companyName})` : ''}\n` +
      `*Phone:* ${quote.customerPhone}\n\n` +
      `📦 *LINE ITEMS & PRICING:*\n` +
      `${itemsList}\n\n` +
      `--------------------------------------\n` +
      `*Subtotal:* KSh ${quote.subtotal.toLocaleString()}\n` +
      (quote.discountTotal > 0 ? `*Discount Saved:* -KSh ${quote.discountTotal.toLocaleString()}\n` : '') +
      (quote.shippingCost > 0 ? `*Delivery / Logistics:* +KSh ${quote.shippingCost.toLocaleString()}\n` : '') +
      `*GRAND TOTAL:* *KSh ${quote.grandTotal.toLocaleString()}*\n\n` +
      `⏱️ *Turnaround Time:* ${quote.deliveryTimeline}\n` +
      `💳 *Payment Terms:* ${quote.paymentTerms}\n` +
      `• *M-Pesa Paybill:* ${quote.paybillNumber || '247247'}\n` +
      `• *Account No:* ${quote.paybillAccount || '0797939199'}\n` +
      `• *Account Name:* Woodynat Designers Ltd\n\n` +
      `📍 *Showroom & CBD Workshop:*\n` +
      `Temple Road Gatkim complex building fourth floor wing B Room 4B1, Nairobi CBD.\n` +
      `--------------------------------------\n` +
      `_Reply *CONFIRM* to this message to approve vector design proofs & start production._`;
  };

  // Download PDF Action using jsPDF
  const handleDownloadPdf = (quote: WoodyQuotation) => {
    try {
      downloadWoodyQuotePdf(quote, zohoSettings);
      showToast('PDF Downloaded!', `Quotation #${quote.quoteNumber} downloaded to your device.`);
    } catch (err: any) {
      showToast('PDF Error', err?.message || 'Failed to download PDF document.', 'error');
    }
  };

  // Quick Action: Send to Customer WhatsApp
  const handleOpenWhatsAppModal = (quote: WoodyQuotation) => {
    setSelectedQuote(quote);
    setIsWhatsAppModalOpen(true);
  };

  // Quick Action: Send to Customer Gmail
  const handleOpenEmailModal = (quote: WoodyQuotation) => {
    setSelectedQuote(quote);
    setCustomRecipientEmail(quote.customerEmail || '');
    setCustomEmailSubject(`Official Commercial Quotation #${quote.quoteNumber} - Woodynat Designers Limited`);
    setCustomEmailNote('');
    setIsEmailModalOpen(true);
  };

  // Dispatch Email directly via Server API or simulated fallback
  const handleSendServerEmail = async () => {
    if (!selectedQuote) return;
    setIsSendingEmail(true);

    try {
      const res = await fetch('/api/quote/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quote: selectedQuote,
          recipientEmail: customRecipientEmail || selectedQuote.customerEmail,
          customSubject: customEmailSubject,
          customMessage: customEmailNote
        })
      });

      const data = await res.json();
      if (data.success) {
        updateZohoQuoteStatus(selectedQuote.id, 'Sent');
        showToast('Quotation Dispatched!', `Official quotation #${selectedQuote.quoteNumber} sent to ${data.recipient} via Gmail.`);
        setIsEmailModalOpen(false);
      } else {
        updateZohoQuoteStatus(selectedQuote.id, 'Sent');
        showToast('Email Dispatch', data.message || 'Quotation logged and marked as Sent.');
        setIsEmailModalOpen(false);
      }
    } catch (e: any) {
      updateZohoQuoteStatus(selectedQuote.id, 'Sent');
      showToast('Status Updated', 'Quotation marked as Sent.');
      setIsEmailModalOpen(false);
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Print Document trigger
  const handlePrintDocument = () => {
    window.print();
  };

  // Sync all unsynced quotes
  const handleSyncAllQuotes = async () => {
    setIsSyncingAll(true);
    const unsynced = zohoQuotations.filter((q) => q.zohoSyncStatus !== 'synced');
    for (const q of unsynced) {
      await syncQuoteToZoho(q.id);
    }
    setIsSyncingAll(false);
    showToast('Cloud Sync Complete', `Synchronized ${unsynced.length} quotations to Woody-Quote Cloud API.`);
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* Top Banner: Woody-Quote Commercial Suite (BLUE THEME) */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl border border-blue-900/40 relative overflow-hidden">
        {/* Soft Blue Radial Ambient Lighting */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/4 bottom-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Woody-Quote Commercial Engine</span>
                <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black">v5.0 Pro</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/40 text-sky-300 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
                <span>Gmail & WhatsApp Ready</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
                <Download className="w-3 h-3 text-indigo-300" />
                <span>Vector PDF Generator</span>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Woody-Quote Commercial Quotations Desk
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Generate official Woody-Quote commercial quotations with real-time Woodynat product prices, custom discount structures, M-Pesa Paybill instructions, instant PDF download, and 1-click Gmail & WhatsApp dispatch.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => handleOpenNewQuote()}
              className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Woody-Quote</span>
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 backdrop-blur-md transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4 text-blue-300" />
              <span>Woody-Quote Config</span>
            </button>

            <button
              onClick={handleSyncAllQuotes}
              disabled={isSyncingAll}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncingAll ? 'animate-spin' : ''}`} />
              <span>{isSyncingAll ? 'Syncing...' : 'Sync Cloud'}</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Strip (Blue Theme) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-blue-800/30">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Quotations</div>
            <div className="text-xl sm:text-2xl font-black text-white mt-1">{totalQuotesCount}</div>
            <div className="text-[11px] text-blue-300 font-semibold mt-0.5">Woody-Quote records</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Approved Value</div>
            <div className="text-xl sm:text-2xl font-black text-blue-400 mt-1">KSh {totalApprovedValue.toLocaleString()}</div>
            <div className="text-[11px] text-blue-300 font-semibold mt-0.5">{approvedQuotesCount} Quotes signed off</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Draft & Pending</div>
            <div className="text-xl sm:text-2xl font-black text-amber-400 mt-1">{draftQuotesCount}</div>
            <div className="text-[11px] text-amber-300 font-semibold mt-0.5">Awaiting customer review</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Converted to Orders</div>
            <div className="text-xl sm:text-2xl font-black text-sky-400 mt-1">{convertedOrdersCount}</div>
            <div className="text-[11px] text-sky-300 font-semibold mt-0.5">Live production queue</div>
          </div>
        </div>
      </div>

      {/* Quick Lead Autocomplete Bar */}
      {inquiries.length > 0 && (
        <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600 text-white font-black">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900">Incoming Customer Leads Ready for Quotation:</div>
              <div className="text-[11px] text-slate-600">Quickly click any lead below to auto-populate the Woody-Quote Builder.</div>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1">
            {inquiries.slice(0, 4).map((inq) => (
              <button
                key={inq.id}
                onClick={() => handleOpenNewQuote({
                  name: inq.customerName,
                  phone: inq.customerPhone,
                  email: inq.customerEmail,
                  company: inq.companyName,
                  topic: inq.inquiryTopic
                })}
                className="bg-white hover:bg-blue-100/60 border border-blue-300 rounded-xl px-3 py-1.5 text-xs text-left shrink-0 transition-colors shadow-2xs cursor-pointer"
              >
                <div className="font-bold text-slate-900 truncate max-w-36">{inq.customerName}</div>
                <div className="text-[10px] text-blue-700 font-medium truncate max-w-36">{inq.customerPhone}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Controls Bar: Search & Status Filter Tabs (BLUE THEME) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Box */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by quote #, client name, company, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['All', 'Draft', 'Sent', 'Approved', 'Converted to Order'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Quotations List Table / Cards */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        {filteredQuotes.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No Woody-Quotations Generated Yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Quotations are not generated automatically by the system. Click "+ Create Woody-Quote" below or select an incoming customer lead above to prepare and generate a verified quotation.
            </p>
            <button
              onClick={() => handleOpenNewQuote()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs inline-flex items-center gap-2 cursor-pointer shadow-md shadow-blue-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Woody-Quote</span>
            </button>
          </div>
        ) : (
          filteredQuotes.map((quote) => (
            <div
              key={quote.id}
              className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 hover:border-blue-300 transition-all space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-black text-blue-600">
                        {quote.quoteNumber}
                      </span>
                      
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        quote.status === 'Approved' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : quote.status === 'Converted to Order'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : quote.status === 'Sent'
                          ? 'bg-sky-100 text-sky-800 border border-sky-300'
                          : 'bg-slate-100 text-slate-700 border border-slate-300'
                      }`}>
                        {quote.status}
                      </span>

                      {quote.zohoSyncStatus === 'synced' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                          Cloud Synced
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-3">
                      <span>Date: <strong className="text-slate-800">{quote.quoteDate}</strong></span>
                      <span>Valid: <strong className="text-slate-800">{quote.validityDays} Days</strong> (Expires: {quote.expiryDate})</span>
                      <span>Prepared by: <strong className="text-slate-800">{quote.preparedBy}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Status Selector & Value */}
                <div className="flex items-center gap-3 self-end md:self-auto">
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Grand Total</div>
                    <div className="text-lg font-black text-blue-700 font-mono">
                      KSh {quote.grandTotal.toLocaleString()}
                    </div>
                  </div>

                  <select
                    value={quote.status}
                    onChange={(e) => updateZohoQuoteStatus(quote.id, e.target.value as WoodyQuoteStatus)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Sent">Sent</option>
                    <option value="Approved">Approved</option>
                    <option value="Declined">Declined</option>
                    <option value="Converted to Order">Converted</option>
                  </select>
                </div>
              </div>

              {/* Customer & Items Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Client Info</div>
                  <div className="font-bold text-slate-900">{quote.customerName}</div>
                  {quote.companyName && (
                    <div className="text-slate-600 font-medium">{quote.companyName}</div>
                  )}
                  <div className="text-slate-600">📞 {quote.customerPhone} | ✉️ {quote.customerEmail}</div>
                </div>

                <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fulfillment & Terms</div>
                  <div className="text-slate-800 font-semibold">{quote.deliveryType}</div>
                  <div className="text-slate-600">Timeline: <strong>{quote.deliveryTimeline}</strong></div>
                  <div className="text-slate-600">Terms: <strong>{quote.paymentTerms}</strong></div>
                </div>

                <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Line Items ({quote.items.length})</div>
                  <div className="space-y-0.5 max-h-16 overflow-y-auto">
                    {quote.items.map((it, i) => (
                      <div key={it.id || i} className="truncate text-slate-700">
                        • {it.quantity}x <strong>{it.name}</strong> @ KSh {it.unitPrice.toLocaleString()}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Download PDF, Gmail, WhatsApp, View */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Download PDF Button */}
                  <button
                    onClick={() => handleDownloadPdf(quote)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    title="Download Official Branded PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>

                  {/* View Document Modal */}
                  <button
                    onClick={() => {
                      setSelectedQuote(quote);
                      setIsPreviewOpen(true);
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                    <span>View / Print</span>
                  </button>

                  {/* Send to WhatsApp */}
                  <button
                    onClick={() => handleOpenWhatsAppModal(quote)}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Send WhatsApp</span>
                  </button>

                  {/* Send to Gmail */}
                  <button
                    onClick={() => handleOpenEmailModal(quote)}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                    <span>Send to Gmail</span>
                  </button>

                  {/* Convert to Live Order */}
                  {quote.status !== 'Converted to Order' ? (
                    <button
                      onClick={() => convertZohoQuoteToOrder(quote.id)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>Convert to Order</span>
                    </button>
                  ) : (
                    <span className="bg-blue-50 text-blue-700 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 border border-blue-200">
                      <Check className="w-3.5 h-3.5" /> Converted ({quote.convertedOrderId})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => duplicateZohoQuotation(quote.id)}
                    title="Duplicate Quotation"
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleOpenEditQuote(quote)}
                    title="Edit Quotation"
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete quote ${quote.quoteNumber}?`)) {
                        deleteZohoQuotation(quote.id);
                      }
                    }}
                    title="Delete Quotation"
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: WOODY-QUOTE BUILDER & EDITOR (BLUE THEME, NO KRA) */}
      {/* ========================================================================= */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-950 to-indigo-950 text-white p-6 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-blue-600 text-white font-black">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black">{editingQuoteId ? 'Edit Woody-Quote' : 'Create New Woody-Quote'}</h3>
                  <p className="text-xs text-blue-200">Official Woodynat Commercial Pricing & Quotation Engine</p>
                </div>
              </div>

              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSaveQuote} className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
              {/* Section 1: Customer & Quotation Reference */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="text-xs font-extrabold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>1. Client Information & Reference</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Quote Reference #</label>
                    <input
                      type="text"
                      required
                      value={quoteNumber}
                      onChange={(e) => setQuoteNumber(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-blue-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Customer Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kelvin Mutua"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Customer Phone (M-Pesa / WhatsApp) *</label>
                    <input
                      type="tel"
                      required
                      placeholder="0712345678"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Customer Email</label>
                    <input
                      type="email"
                      placeholder="client@company.co.ke"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Company / Organization Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Silverstone Logistics Ltd"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Physical / Billing Address</label>
                    <input
                      type="text"
                      placeholder="e.g. Westlands Commercial Square"
                      value={billingAddress}
                      onChange={(e) => setBillingAddress(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Dates, Timeline & Commercial Terms */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="text-xs font-extrabold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>2. Quotation Validity & Commercial Terms</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Quote Date</label>
                    <input
                      type="date"
                      value={quoteDate}
                      onChange={(e) => setQuoteDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Validity (Days)</label>
                    <input
                      type="number"
                      min={1}
                      max={90}
                      value={validityDays}
                      onChange={(e) => setValidityDays(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Payment Terms</label>
                    <select
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value as WoodyQuotation['paymentTerms'])}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold"
                    >
                      <option value="50% Deposit, 50% on Delivery">50% Deposit, 50% on Delivery</option>
                      <option value="Due on Receipt">Due on Receipt</option>
                      <option value="Cash on Delivery">Cash on Delivery</option>
                      <option value="Net 15">Net 15 Days</option>
                      <option value="Net 30">Net 30 Days</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Turnaround Timeline</label>
                    <input
                      type="text"
                      value={deliveryTimeline}
                      onChange={(e) => setDeliveryTimeline(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Fulfillment Mode</label>
                    <select
                      value={deliveryType}
                      onChange={(e) => setDeliveryType(e.target.value as WoodyQuotation['deliveryType'])}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold"
                    >
                      <option value="CBD Workshop Pickup">CBD Workshop Pickup (Gatkim Complex 4th Flr)</option>
                      <option value="Express Home Delivery">Express Doorstep / Corporate Office Delivery</option>
                      <option value="Pickup Station">Regional Courier / Upcountry Parcel Bus</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Delivery Destination / Pickup Details</label>
                    <input
                      type="text"
                      value={deliveryLocation}
                      onChange={(e) => setDeliveryLocation(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Add Items to Quotation */}
              <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-200 space-y-3">
                <div className="text-xs font-extrabold text-blue-950 uppercase tracking-wider flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-blue-600" />
                    <span>3. Add Products & Custom Print Line Items</span>
                  </div>
                  <span className="text-[11px] font-medium text-blue-800">
                    Auto-fills Woodynat catalog pricing
                  </span>
                </div>

                {/* Quick Catalog Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Choose from Live Product Catalog:
                    </label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => handleSelectProduct(e.target.value)}
                      className="w-full bg-white border border-blue-300 rounded-xl px-3 py-2 text-slate-900 font-bold"
                    >
                      <option value="">-- Choose Existing Woodynat Product --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (KSh {p.price.toLocaleString()}) [{p.category}]
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Or Type Custom Item Title:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 500x Embroidered Corporate Polo Shirts"
                      value={customItemName}
                      onChange={(e) => setCustomItemName(e.target.value)}
                      className="w-full bg-white border border-blue-300 rounded-xl px-3 py-2 text-slate-900 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Quantity</label>
                    <input
                      type="number"
                      min={1}
                      value={customItemQty}
                      onChange={(e) => setCustomItemQty(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-center font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Unit (pcs, sets)</label>
                    <input
                      type="text"
                      value={customItemUnit}
                      onChange={(e) => setCustomItemUnit(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-center font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Unit Price (KSh)</label>
                    <input
                      type="number"
                      min={0}
                      value={customItemPrice}
                      onChange={(e) => setCustomItemPrice(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-right font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Discount (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={customItemDiscount}
                      onChange={(e) => setCustomItemDiscount(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-center font-bold text-amber-600"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1 flex items-end">
                    <button
                      type="button"
                      onClick={handleAddItemToQuote}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Item</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Detailed Description & Material Specs</label>
                    <input
                      type="text"
                      placeholder="e.g. 240GSM cotton pique, chest embroidery + back print"
                      value={customItemDesc}
                      onChange={(e) => setCustomItemDesc(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Size / Dimensions</label>
                    <input
                      type="text"
                      placeholder="e.g. Mixed M, L, XL or A3 Size"
                      value={customItemSize}
                      onChange={(e) => setCustomItemSize(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Pre-Press Proof Notes</label>
                    <input
                      type="text"
                      placeholder="e.g. Customer provided vector AI/PDF"
                      value={customItemArtworkNotes}
                      onChange={(e) => setCustomItemArtworkNotes(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Table of Added Line Items */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Item & Description</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Unit Price (KSh)</th>
                      <th className="py-2.5 px-3 text-right">Discount</th>
                      <th className="py-2.5 px-3 text-right">Total (KSh)</th>
                      <th className="py-2.5 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {quoteItems.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-slate-400 font-medium">
                          No items added yet. Choose a product above or create a custom item.
                        </td>
                      </tr>
                    ) : (
                      quoteItems.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900">{item.name}</div>
                            {item.description && (
                              <div className="text-[11px] text-slate-500 line-clamp-1">{item.description}</div>
                            )}
                            {item.selectedSize && (
                              <span className="text-[10px] text-blue-600 font-medium mr-2">Specs: {item.selectedSize}</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold">
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) => handleUpdateItem(item.id, { quantity: Math.max(1, Number(e.target.value)) })}
                              className="w-16 text-center border border-slate-200 rounded-lg p-1 font-bold"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono">
                            <input
                              type="number"
                              min={0}
                              value={item.unitPrice}
                              onChange={(e) => handleUpdateItem(item.id, { unitPrice: Number(e.target.value) })}
                              className="w-24 text-right border border-slate-200 rounded-lg p-1 font-mono font-bold"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-amber-600">
                            {item.discountPercent > 0 ? `${item.discountPercent}%` : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                            {item.total.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Section 4: Logistics, Order Notes & Grand Total (No VAT / KRA) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="space-y-3">
                  <div className="text-xs font-extrabold text-blue-900 uppercase tracking-wider">
                    Logistics & Customer Notes
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Logistics / Courier (KSh)</label>
                    <input
                      type="number"
                      min={0}
                      value={shippingCost}
                      onChange={(e) => setShippingCost(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900 font-bold"
                      placeholder="0 for CBD workshop collection"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Customer Special Note:</label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                    />
                  </div>
                </div>

                {/* Calculation Summary Card */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between text-slate-600">
                      <span>Gross Subtotal:</span>
                      <span className="font-mono font-bold">KSh {editorSubtotal.toLocaleString()}</span>
                    </div>

                    {editorDiscountTotal > 0 && (
                      <div className="flex justify-between text-amber-600">
                        <span>Total Discounts:</span>
                        <span className="font-mono font-bold">-KSh {editorDiscountTotal.toLocaleString()}</span>
                      </div>
                    )}

                    {editorDiscountTotal > 0 && (
                      <div className="flex justify-between text-slate-700 font-semibold">
                        <span>Net Amount:</span>
                        <span className="font-mono font-bold">KSh {editorNetAmount.toLocaleString()}</span>
                      </div>
                    )}

                    {shippingCost > 0 && (
                      <div className="flex justify-between text-slate-600">
                        <span>Logistics / Courier:</span>
                        <span className="font-mono font-bold">+KSh {Number(shippingCost).toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t-2 border-slate-900 pt-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm font-black text-slate-950">GRAND TOTAL:</span>
                      <span className="text-xl font-black text-blue-600 font-mono">
                        KSh {editorGrandTotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 italic mt-1 text-right">
                      {formatKenyanShillingsToWords(editorGrandTotal)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingQuoteId ? 'Save Quotation Changes' : 'Generate Official Woody-Quote'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: OFFICIAL WOODY-QUOTE PRINT & PDF PREVIEW (BLUE THEME, NO KRA) */}
      {/* ========================================================================= */}
      {isPreviewOpen && selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col print:shadow-none print:border-none print:rounded-none">
            
            {/* Top Toolbar (Hidden on Print) */}
            <div className="bg-slate-900 text-white p-4 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-extrabold">Woody-Quote Official Quotation: {selectedQuote.quoteNumber}</span>
                <span className="bg-blue-600 text-[10px] font-black px-2 py-0.5 rounded-md">Vector PDF</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Direct PDF Download */}
                <button
                  onClick={() => handleDownloadPdf(selectedQuote)}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>

                {/* Print Browser Window */}
                <button
                  onClick={handlePrintDocument}
                  className="bg-white/10 hover:bg-white/20 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>

                {/* Send via WhatsApp */}
                <button
                  onClick={() => handleOpenWhatsAppModal(selectedQuote)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>

                {/* Send via Gmail */}
                <button
                  onClick={() => handleOpenEmailModal(selectedQuote)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Gmail</span>
                </button>

                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* OFFICIAL WOODY-QUOTE DOCUMENT BODY */}
            <div id="woody-quote-official-document" className="p-8 sm:p-12 space-y-8 bg-white text-slate-900 overflow-y-auto">
              
              {/* Document Header (Blue Theme Accent, NO KRA) */}
              <div className="flex flex-col sm:flex-row items-start justify-between gap-6 border-b-2 border-slate-900 pb-6">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 bg-blue-950 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-xs">
                      W
                    </div>
                    <div>
                      <h1 className="text-xl font-black text-slate-950 tracking-tight">Woodynat Designers Limited</h1>
                      <p className="text-xs text-blue-600 font-bold">Branding, Commercial Printing & Signage Solutions</p>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 space-y-0.5 mt-3">
                    <p>📍 Temple Road Gatkim complex building fourth floor wing B Room 4B1</p>
                    <p>🏢 Nairobi Central Business District (CBD), Kenya</p>
                    <p>📞 Phone / WhatsApp: +254 797 939 199 | Email: {zohoSettings.accountEmail || 'woodynatdesigners12@gmail.com'}</p>
                  </div>
                </div>

                <div className="text-right sm:min-w-48">
                  <div className="text-2xl sm:text-3xl font-black text-blue-950 uppercase tracking-tight">COMMERCIAL QUOTATION</div>
                  <div className="text-sm font-mono font-bold text-blue-600 mt-1">{selectedQuote.quoteNumber}</div>
                  <div className="text-xs text-slate-500 mt-2 space-y-0.5">
                    <p>Quote Date: <strong className="text-slate-800">{selectedQuote.quoteDate}</strong></p>
                    <p>Valid Until: <strong className="text-slate-800">{selectedQuote.expiryDate}</strong></p>
                    <p>Prepared By: <strong>{selectedQuote.preparedBy}</strong></p>
                  </div>
                </div>
              </div>

              {/* Bill To & Fulfillment Boxes (NO KRA) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-blue-50/40 p-4 rounded-2xl border border-blue-100">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">QUOTATION PREPARED FOR:</div>
                  <div className="text-sm font-bold text-slate-900">{selectedQuote.customerName}</div>
                  {selectedQuote.companyName && (
                    <div className="text-xs font-semibold text-slate-700">{selectedQuote.companyName}</div>
                  )}
                  <div className="text-xs text-slate-600">Tel: {selectedQuote.customerPhone}</div>
                  <div className="text-xs text-slate-600">Email: {selectedQuote.customerEmail}</div>
                  <div className="text-xs text-slate-600">Address: {selectedQuote.billingAddress || 'Nairobi, Kenya'}</div>
                </div>

                <div className="space-y-1 sm:border-l sm:border-blue-200 sm:pl-6">
                  <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">FULFILLMENT & PRODUCTION:</div>
                  <div className="text-xs font-bold text-slate-800">Fulfillment Method: {selectedQuote.deliveryType}</div>
                  <div className="text-xs text-slate-600">Destination: {selectedQuote.deliveryLocation}</div>
                  <div className="text-xs text-slate-600">Turnaround Timeline: <strong>{selectedQuote.deliveryTimeline}</strong></div>
                  <div className="text-xs text-slate-600">Payment Terms: <strong>{selectedQuote.paymentTerms}</strong></div>
                </div>
              </div>

              {/* Items Table (Blue Theme Table Headers) */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-blue-950 text-white font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-4">Item & Description</th>
                      <th className="py-3 px-4 text-center">Qty</th>
                      <th className="py-3 px-4 text-right">Unit Price (KSh)</th>
                      <th className="py-3 px-4 text-right">Discount</th>
                      <th className="py-3 px-4 text-right">Total (KSh)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedQuote.items.map((item, idx) => (
                      <tr key={item.id || idx} className="text-slate-800 hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{item.name}</div>
                          <div className="text-[11px] text-slate-600 mt-0.5">{item.description}</div>
                          {item.selectedSize && (
                            <div className="text-[10px] text-blue-600 mt-0.5">Size/Specs: {item.selectedSize}</div>
                          )}
                          {item.artworkNotes && (
                            <div className="text-[10px] text-blue-700 italic mt-0.5">Pre-Press: {item.artworkNotes}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-bold">{item.quantity} {item.unit}</td>
                        <td className="py-3 px-4 text-right font-mono">{item.unitPrice.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right text-amber-600 font-bold">{item.discountPercent > 0 ? `${item.discountPercent}%` : '-'}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold">{item.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Totals (No KRA references) */}
              <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pt-2">
                <div className="space-y-3 max-w-md">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-950">
                    <div className="font-bold uppercase tracking-wider text-[10px] text-blue-700 mb-1">M-Pesa Official Paybill Details:</div>
                    <p>• <strong>Paybill Number:</strong> {selectedQuote.paybillNumber || '247247'}</p>
                    <p>• <strong>Account Number:</strong> {selectedQuote.paybillAccount || '0797939199'}</p>
                    <p>• <strong>Account Name:</strong> Woodynat Designers Limited</p>
                  </div>

                  {selectedQuote.notes && (
                    <div className="text-xs text-slate-600">
                      <strong className="text-slate-800">Special Notes:</strong> {selectedQuote.notes}
                    </div>
                  )}
                </div>

                <div className="w-full sm:w-80 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-mono font-bold">KSh {selectedQuote.subtotal.toLocaleString()}</span>
                  </div>

                  {selectedQuote.discountTotal > 0 && (
                    <div className="flex justify-between text-amber-600">
                      <span>Total Discounts:</span>
                      <span className="font-mono font-bold">-KSh {selectedQuote.discountTotal.toLocaleString()}</span>
                    </div>
                  )}

                  {selectedQuote.shippingCost > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Logistics / Courier:</span>
                      <span className="font-mono font-bold">+KSh {selectedQuote.shippingCost.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="border-t-2 border-slate-900 pt-2 flex justify-between text-base font-black text-slate-950">
                    <span>GRAND TOTAL:</span>
                    <span className="font-mono text-blue-600">KSh {selectedQuote.grandTotal.toLocaleString()}</span>
                  </div>

                  <div className="text-[10px] text-slate-500 italic text-right mt-1">
                    {formatKenyanShillingsToWords(selectedQuote.grandTotal)}
                  </div>
                </div>
              </div>

              {/* Terms & Conditions & Sign-off */}
              <div className="border-t border-slate-200 pt-6 space-y-4">
                <div>
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Commercial Terms & Sign-off:</div>
                  <pre className="text-[11px] text-slate-600 whitespace-pre-line font-sans leading-relaxed">
                    {selectedQuote.termsAndConditions}
                  </pre>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-dashed border-slate-300">
                  <div>
                    <div className="border-b border-slate-400 pb-8 text-center text-xs font-bold text-slate-400">
                      Authorised Woodynat Signature & Official Stamp
                    </div>
                    <div className="text-center text-[10px] text-slate-500 mt-1">Woodynat Commercial Accounts Desk</div>
                  </div>

                  <div>
                    <div className="border-b border-slate-400 pb-8 text-center text-xs font-bold text-slate-400">
                      Client Acceptance Sign-off / LPO Reference
                    </div>
                    <div className="text-center text-[10px] text-slate-500 mt-1">{selectedQuote.customerName} ({selectedQuote.companyName || 'Authorized Signatory'})</div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: 1-CLICK WHATSAPP DISPATCH MODAL */}
      {/* ========================================================================= */}
      {isWhatsAppModalOpen && selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-base">
                <MessageCircle className="w-5 h-5" />
                <span>Send Quotation via WhatsApp</span>
              </div>
              <button
                onClick={() => setIsWhatsAppModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                The formatted quotation text below is ready to be dispatched directly to <strong>{selectedQuote.customerName} ({selectedQuote.customerPhone})</strong>.
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-60 overflow-y-auto font-mono text-[11px] text-slate-800 whitespace-pre-line leading-relaxed">
                {getWhatsAppMessageText(selectedQuote)}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={() => {
                  safeCopyToClipboard(getWhatsAppMessageText(selectedQuote)).catch(() => {});
                  showToast('Copied to Clipboard', 'Quotation WhatsApp text copied.');
                }}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-4 h-4" /> Copy Text
              </button>

              <a
                href={`https://wa.me/254${selectedQuote.customerPhone.replace(/\D/g, '').replace(/^0/, '').replace(/^254/, '')}?text=${encodeURIComponent(getWhatsAppMessageText(selectedQuote))}`}
                target="_blank"
                rel="noreferrer"
                onClick={() => {
                  updateZohoQuoteStatus(selectedQuote.id, 'Sent');
                  setIsWhatsAppModalOpen(false);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md shadow-emerald-600/30 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Open WhatsApp & Send</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: GMAIL DISPATCH MODAL (WEB GMAIL + SERVER NODEMAILER) */}
      {/* ========================================================================= */}
      {isEmailModalOpen && selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-blue-600 font-extrabold text-base">
                <Mail className="w-5 h-5" />
                <span>Send Quotation to Gmail</span>
              </div>
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse shrink-0"></div>
                <div>
                  <span className="text-slate-500 font-medium">From Official Commercial Desk:</span>
                  <div className="font-mono font-bold text-slate-900">{zohoSettings.senderName || 'Woodynat Designers Limited'} &lt;{zohoSettings.accountEmail || 'woodynatdesigners12@gmail.com'}&gt;</div>
                </div>
              </div>
              <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                Gmail Active
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">To Customer Email:</label>
                  <input
                    type="email"
                    value={customRecipientEmail}
                    onChange={(e) => setCustomRecipientEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">CC / Admin Audit Copy:</label>
                  <input
                    type="email"
                    readOnly
                    value={zohoSettings.notificationEmail || 'woodynatdesigners12@gmail.com'}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-slate-600 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Email Subject:</label>
                <input
                  type="text"
                  value={customEmailSubject}
                  onChange={(e) => setCustomEmailSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Custom Message / Greeting Note (Optional):</label>
                <input
                  type="text"
                  placeholder="e.g. As discussed over phone, attached is your quotation for review."
                  value={customEmailNote}
                  onChange={(e) => setCustomEmailNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-700 space-y-2 max-h-36 overflow-y-auto font-sans leading-relaxed">
                <p>Dear {selectedQuote.customerName},</p>
                <p>Please find our official commercial quotation <strong>#{selectedQuote.quoteNumber}</strong> prepared by Woodynat Designers Limited.</p>
                <p className="font-semibold text-blue-900 bg-blue-100/60 p-2 rounded-lg">
                  💰 Grand Total: KSh {selectedQuote.grandTotal.toLocaleString()} ({selectedQuote.items.length} line items) • Validity: {selectedQuote.validityDays} Days
                </p>
                <p>Paybill: 247247 | Account: 0797939199 | Nairobi CBD Workshop: Gatkim Complex Room 4B1</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              {/* Direct Gmail Web Compose Button */}
              <a
                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(customRecipientEmail || selectedQuote.customerEmail)}&su=${encodeURIComponent(customEmailSubject)}&body=${encodeURIComponent(`Dear ${selectedQuote.customerName},\n\nPlease find our official commercial quotation #${selectedQuote.quoteNumber} for KSh ${selectedQuote.grandTotal.toLocaleString()}.\n\nPaybill: 247247 | Acc: 0797939199\nLocation: Temple Road Gatkim complex building fourth floor wing B Room 4B1, Nairobi.\n\nWoodynat Designers Limited Desk\nEmail: woodynatdesigners12@gmail.com\nTel: +254 797 939 199`)}`}
                target="_blank"
                rel="noreferrer"
                onClick={() => updateZohoQuoteStatus(selectedQuote.id, 'Sent')}
                className="px-3.5 py-2 rounded-xl border border-blue-300 text-blue-700 text-xs font-bold hover:bg-blue-50 flex items-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                <span>Open in Gmail Web</span>
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEmailModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  disabled={isSendingEmail}
                  onClick={handleSendServerEmail}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md shadow-blue-600/30 cursor-pointer disabled:opacity-50"
                >
                  {isSendingEmail ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>{isSendingEmail ? 'Dispatching...' : 'Send via Gmail'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: WOODY-QUOTE API & SETTINGS (BLUE THEME, NO KRA) */}
      {/* ========================================================================= */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-black text-base">
                <Settings className="w-5 h-5 text-blue-600" />
                <span>Woody-Quote Commercial & Cloud Configuration</span>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xs shrink-0 tracking-wider">
                  WNAT
                </div>
                <div>
                  <div className="font-bold text-slate-900">Woody-Quote Integration Engine</div>
                  <div className="text-[11px] text-slate-600">
                    Controls automated quotation numbering, official email dispatch from woodynatdesigners12@gmail.com, and commercial print parameters.
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Commercial Desk Email</label>
                  <input
                    type="email"
                    value={tempAccountEmail}
                    onChange={(e) => setTempAccountEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Admin Audit Notification Email</label>
                  <input
                    type="email"
                    value={tempNotificationEmail}
                    onChange={(e) => setTempNotificationEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Official Company Sender Name</label>
                  <input
                    type="text"
                    value={tempSenderName}
                    onChange={(e) => setTempSenderName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Quotation Number Prefix</label>
                  <input
                    type="text"
                    value={tempPrefix}
                    onChange={(e) => setTempPrefix(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-blue-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Environment</label>
                  <select
                    value={tempEnv}
                    onChange={(e) => setTempEnv(e.target.value as 'sandbox' | 'production')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  >
                    <option value="production">Production Live (Live Dispatch)</option>
                    <option value="sandbox">Sandbox Developer (Test Mode)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Woody-Quote Organization ID</label>
                  <input
                    type="text"
                    value={tempOrgId}
                    onChange={(e) => setTempOrgId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tempAutoSync}
                  onChange={(e) => setTempAutoSync(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs font-bold text-slate-700">
                  Automatically sync newly created quotations to Woody-Quote Cloud as active Commercial Estimates
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateZohoSettings({
                    accountEmail: tempAccountEmail,
                    notificationEmail: tempNotificationEmail,
                    senderName: tempSenderName,
                    defaultQuotePrefix: tempPrefix,
                    environment: tempEnv,
                    organizationId: tempOrgId,
                    autoSyncToZoho: tempAutoSync,
                    autoSyncWoodyQuote: tempAutoSync
                  });
                  setIsSettingsOpen(false);
                  showToast('Configuration Saved', 'Woody-Quote engine parameters updated successfully.');
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/30 cursor-pointer"
              >
                Save Woody-Quote Config
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminWoodyQuoteStudio;
