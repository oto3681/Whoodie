import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ZohoQuotation, 
  ZohoQuoteItem, 
  ZohoQuoteStatus, 
  Product, 
  ProductCategory 
} from '../types';
import { safeCopyToClipboard } from '../utils/clipboard';
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
  Layers, 
  Package, 
  Sparkles, 
  Download,
  AlertCircle,
  MessageCircle,
  HelpCircle,
  Hash,
  ChevronDown
} from 'lucide-react';

export const AdminZohoQuotesStudio: React.FC = () => {
  const { 
    zohoQuotations, 
    zohoSettings, 
    products, 
    inquiries, 
    whatsappThreads, 
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
  const [statusFilter, setStatusFilter] = useState<'All' | ZohoQuoteStatus>('All');
  
  // Modals & Active Quote states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<ZohoQuotation | null>(null);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  // Form State for Quotation Builder
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [customerKraPin, setCustomerKraPin] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('Temple Road Gatkim complex building fourth floor wing B Room 4B1');
  const [deliveryType, setDeliveryType] = useState<ZohoQuotation['deliveryType']>('CBD Workshop Pickup');
  const [quoteNumber, setQuoteNumber] = useState('');
  const [quoteDate, setQuoteDate] = useState(new Date().toISOString().split('T')[0]);
  const [validityDays, setValidityDays] = useState(14);
  const [paymentTerms, setPaymentTerms] = useState<ZohoQuotation['paymentTerms']>('50% Deposit, 50% on Delivery');
  const [deliveryTimeline, setDeliveryTimeline] = useState('24-48 Hours Express Delivery');
  const [currency, setCurrency] = useState<'KSh' | 'USD'>('KSh');
  const [taxRate, setTaxRate] = useState(16);
  const [isTaxInclusive, setIsTaxInclusive] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);
  const [notes, setNotes] = useState(zohoSettings.defaultNotes);
  const [termsAndConditions, setTermsAndConditions] = useState(zohoSettings.defaultTerms);
  const [quoteItems, setQuoteItems] = useState<ZohoQuoteItem[]>([]);

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

  // Settings Modal State
  const [tempAccountEmail, setTempAccountEmail] = useState(zohoSettings.accountEmail || 'woodynatdesigners12@gmail.com');
  const [tempNotificationEmail, setTempNotificationEmail] = useState(zohoSettings.notificationEmail || 'woodynatdesigners12@gmail.com');
  const [tempSenderName, setTempSenderName] = useState(zohoSettings.senderName || 'Woodynat Designers Limited');
  const [tempOrgId, setTempOrgId] = useState(zohoSettings.organizationId);
  const [tempClientId, setTempClientId] = useState(zohoSettings.clientId);
  const [tempClientSecret, setTempClientSecret] = useState(zohoSettings.clientSecret);
  const [tempRefreshToken, setTempRefreshToken] = useState(zohoSettings.refreshToken);
  const [tempEnv, setTempEnv] = useState(zohoSettings.environment);
  const [tempAutoSync, setTempAutoSync] = useState(zohoSettings.autoSyncToZoho);
  const [tempPrefix, setTempPrefix] = useState(zohoSettings.defaultQuotePrefix);
  const [tempKraPin, setTempKraPin] = useState(zohoSettings.companyKraPin);

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
    const nextNum = `ZOHO-QT-2026-${String(zohoQuotations.length + 1).padStart(4, '0')}`;
    setQuoteNumber(nextNum);
    setQuoteDate(new Date().toISOString().split('T')[0]);
    setValidityDays(zohoSettings.defaultValidityDays || 14);
    setPaymentTerms(zohoSettings.defaultPaymentTerms || '50% Deposit, 50% on Delivery');
    setDeliveryTimeline(zohoSettings.defaultDeliveryTimeline || '24-48 Hours Express Delivery');
    setDeliveryType('CBD Workshop Pickup');
    setDeliveryLocation('Temple Road Gatkim complex building fourth floor wing B Room 4B1');
    setCurrency('KSh');
    setTaxRate(zohoSettings.defaultTaxRate);
    setIsTaxInclusive(false);
    setShippingCost(0);
    setNotes(zohoSettings.defaultNotes);
    setTermsAndConditions(zohoSettings.defaultTerms);

    if (presetLead) {
      setCustomerName(presetLead.name);
      setCustomerPhone(presetLead.phone);
      setCustomerEmail(presetLead.email || 'client@example.com');
      setCompanyName(presetLead.company || '');
      setCustomerKraPin('');
      setBillingAddress('Nairobi, Kenya');
    } else {
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setCompanyName('');
      setCustomerKraPin('');
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
          taxPercent: 16,
          taxAmount: Math.round((firstProd.price || 6500) * 0.16),
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
  const handleOpenEditQuote = (quote: ZohoQuotation) => {
    setEditingQuoteId(quote.id);
    setQuoteNumber(quote.quoteNumber);
    setCustomerName(quote.customerName);
    setCustomerPhone(quote.customerPhone);
    setCustomerEmail(quote.customerEmail);
    setCompanyName(quote.companyName || '');
    setCustomerKraPin(quote.customerKraPin || '');
    setBillingAddress(quote.billingAddress || '');
    setDeliveryLocation(quote.deliveryLocation);
    setDeliveryType(quote.deliveryType);
    setQuoteDate(quote.quoteDate);
    setValidityDays(quote.validityDays);
    setPaymentTerms(quote.paymentTerms);
    setDeliveryTimeline(quote.deliveryTimeline);
    setCurrency(quote.currency);
    setTaxRate(quote.taxRate);
    setIsTaxInclusive(quote.isTaxInclusive);
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
      setCustomItemUnit(prod.category === 'Eulogies & Memorials' ? 'books' : 'pcs');
      setCustomItemSize(prod.customizationOptions?.sizes?.[0] || '');
      setCustomItemFinish(prod.customizationOptions?.finishes?.[0] || '');
      setCustomItemArtworkNotes('Client digital artwork sign-off');
    }
  };

  // Add Item to Quotation
  const handleAddItemToQuote = () => {
    if (!customItemName.trim()) {
      showToast('Item Name Required', 'Please enter or select a product for the line item.', 'error');
      return;
    }

    const netUnit = customItemPrice * (1 - customItemDiscount / 100);
    const lineTotal = Math.round(netUnit * customItemQty);
    const lineTax = isTaxInclusive ? 0 : Math.round(lineTotal * (taxRate / 100));

    const newItem: ZohoQuoteItem = {
      id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      productId: selectedProductId || undefined,
      name: customItemName,
      category: customItemCategory,
      description: customItemDesc,
      quantity: Number(customItemQty) || 1,
      unit: customItemUnit,
      unitPrice: Number(customItemPrice) || 0,
      discountPercent: Number(customItemDiscount) || 0,
      taxPercent: taxRate,
      taxAmount: lineTax,
      total: lineTotal,
      selectedSize: customItemSize || undefined,
      selectedFinish: customItemFinish || undefined,
      artworkNotes: customItemArtworkNotes || undefined
    };

    setQuoteItems([...quoteItems, newItem]);

    // Reset item form
    setCustomItemName('');
    setCustomItemDesc('');
    setSelectedProductId('');
    setCustomItemDiscount(0);
    setCustomItemQty(1);
    setCustomItemArtworkNotes('');
    showToast('Item Added', `${newItem.name} added to quote items.`);
  };

  // Remove Item
  const handleRemoveItem = (index: number) => {
    setQuoteItems(quoteItems.filter((_, i) => i !== index));
  };

  // Calculate live totals for the editor
  const editorSubtotal = quoteItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const editorDiscountTotal = quoteItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice * (item.discountPercent / 100)), 0);
  const editorNetTaxable = editorSubtotal - editorDiscountTotal;
  const editorTaxTotal = isTaxInclusive ? 0 : Math.round(editorNetTaxable * (taxRate / 100));
  const editorGrandTotal = editorNetTaxable + editorTaxTotal + Number(shippingCost || 0);

  // Save Quote Handler
  const handleSaveQuote = (statusOverride?: ZohoQuoteStatus) => {
    if (!customerName.trim() || !customerPhone.trim()) {
      showToast('Missing Details', 'Please provide at least a customer name and phone number.', 'error');
      return;
    }

    if (quoteItems.length === 0) {
      showToast('No Line Items', 'Please add at least one product line item to the quotation.', 'error');
      return;
    }

    const expiryDate = new Date(new Date(quoteDate).getTime() + validityDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    if (editingQuoteId) {
      updateZohoQuotation(editingQuoteId, {
        quoteNumber,
        customerName,
        customerPhone,
        customerEmail,
        companyName,
        customerKraPin,
        billingAddress,
        deliveryLocation,
        deliveryType,
        quoteDate,
        expiryDate,
        validityDays,
        paymentTerms,
        deliveryTimeline,
        currency,
        items: quoteItems,
        taxRate,
        isTaxInclusive,
        shippingCost: Number(shippingCost || 0),
        notes,
        termsAndConditions,
        status: statusOverride || 'Draft'
      });
    } else {
      createZohoQuotation({
        quoteNumber,
        customerName,
        customerPhone,
        customerEmail,
        companyName,
        customerKraPin,
        billingAddress,
        deliveryLocation,
        deliveryType,
        quoteDate,
        expiryDate,
        validityDays,
        paymentTerms,
        deliveryTimeline,
        currency,
        items: quoteItems,
        taxRate,
        isTaxInclusive,
        shippingCost: Number(shippingCost || 0),
        notes,
        termsAndConditions,
        status: statusOverride || 'Draft'
      });
    }

    setIsEditorOpen(false);
  };

  // Convert Number to Kenyan Shillings words representation
  const formatAmountToWords = (amount: number): string => {
    return `Kenya Shillings ${amount.toLocaleString()} Only (Tax & Production Inclusive)`;
  };

  // Generate WhatsApp Message text for Quote
  const getWhatsAppMessageText = (quote: ZohoQuotation): string => {
    const itemsList = quote.items
      .map((item, idx) => `  ${idx + 1}. *${item.name}* (${item.quantity} ${item.unit} @ KSh ${item.unitPrice.toLocaleString()})\n     _${item.description.slice(0, 70)}..._ = *KSh ${item.total.toLocaleString()}*`)
      .join('\n');

    return `📄 *OFFICIAL COMMERCIAL QUOTATION*\n` +
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
      (quote.taxTotal > 0 ? `*16% KRA VAT:* +KSh ${quote.taxTotal.toLocaleString()}\n` : '') +
      (quote.shippingCost > 0 ? `*Delivery / Logistics:* +KSh ${quote.shippingCost.toLocaleString()}\n` : '') +
      `*GRAND TOTAL:* *KSh ${quote.grandTotal.toLocaleString()}*\n\n` +
      `⏱️ *Turnaround Time:* ${quote.deliveryTimeline}\n` +
      `💳 *Payment Terms:* ${quote.paymentTerms}\n` +
      `• *M-Pesa Paybill:* ${quote.paybillNumber}\n` +
      `• *Account No:* ${quote.paybillAccount}\n` +
      `• *Account Name:* Woodynat Designers Ltd\n\n` +
      `📍 *Physical Showroom & CBD Workshop:*\n` +
      `Temple Road Gatkim complex building fourth floor wing B Room 4B1, Nairobi CBD.\n` +
      `--------------------------------------\n` +
      `_Reply *CONFIRM* to this message to approve vector design proofs & start production._`;
  };

  // Quick Action: Send to Customer WhatsApp
  const handleOpenWhatsAppModal = (quote: ZohoQuotation) => {
    setSelectedQuote(quote);
    setIsWhatsAppModalOpen(true);
  };

  // Quick Action: Send to Customer Email
  const handleOpenEmailModal = (quote: ZohoQuotation) => {
    setSelectedQuote(quote);
    setIsEmailModalOpen(true);
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
    showToast('Zoho Sync Complete', `Synchronized ${unsynced.length} quotations to Zoho Books API.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Zoho Books Commercial Suite */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-6 shadow-xl border border-blue-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Zoho Books & Invoice Engine</span>
                <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black">v4.2 Live</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Linked Zoho Email:</span>
                <span className="font-mono text-white underline underline-offset-2">{zohoSettings.accountEmail || 'woodynatdesigners12@gmail.com'}</span>
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Commercial Quotations & Custom Pricing Desk
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Generate official Zoho Books quotations with real-time Woodynat product prices, 16% KRA VAT calculations, M-Pesa Paybill instructions, and instant 1-click WhatsApp/Email dispatch.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => handleOpenNewQuote()}
              className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Zoho Quotation</span>
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 backdrop-blur-md transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4 text-blue-300" />
              <span>Zoho API Config</span>
            </button>

            <button
              onClick={handleSyncAllQuotes}
              disabled={isSyncingAll}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncingAll ? 'animate-spin' : ''}`} />
              <span>{isSyncingAll ? 'Syncing...' : 'Sync Zoho Cloud'}</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Quotations</div>
            <div className="text-xl sm:text-2xl font-black text-white mt-1">{totalQuotesCount}</div>
            <div className="text-[11px] text-blue-300 font-semibold mt-0.5">Active quote records</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Approved Value</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">KSh {totalApprovedValue.toLocaleString()}</div>
            <div className="text-[11px] text-emerald-300 font-semibold mt-0.5">{approvedQuotesCount} Quotes signed off</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Draft & Pending</div>
            <div className="text-xl sm:text-2xl font-black text-amber-400 mt-1">{draftQuotesCount}</div>
            <div className="text-[11px] text-amber-300 font-semibold mt-0.5">Awaiting customer review</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Converted to Orders</div>
            <div className="text-xl sm:text-2xl font-black text-blue-400 mt-1">{convertedOrdersCount}</div>
            <div className="text-[11px] text-blue-300 font-semibold mt-0.5">Live production queue</div>
          </div>
        </div>
      </div>

      {/* Quick Lead Autocomplete Bar */}
      {inquiries.length > 0 && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500 text-slate-950 font-black">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900">Incoming Customer Leads Ready for Quotation:</div>
              <div className="text-[11px] text-slate-600">Quickly click any lead below to auto-populate the Zoho Quotation Builder.</div>
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
                className="bg-white hover:bg-amber-100 border border-amber-300 hover:border-amber-400 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl shrink-0 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Plus className="w-3 h-3 text-amber-600" />
                <span>{inq.customerName} ({inq.requestedQuantity || 1}x {inq.inquiryTopic.slice(0, 18)}...)</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by quote #, client, phone..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-bold text-slate-500 shrink-0">Filter Status:</span>
          {(['All', 'Draft', 'Sent', 'Approved', 'Converted to Order', 'Declined'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Quotations List */}
      <div className="space-y-3.5">
        {filteredQuotes.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
            <FileText className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-extrabold text-slate-800">No Quotations Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No commercial quotations match your search criteria. Create a new quotation using the button above.
            </p>
            <button
              onClick={() => handleOpenNewQuote()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs inline-flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" /> Create First Quotation
            </button>
          </div>
        ) : (
          filteredQuotes.map((quote) => (
            <div
              key={quote.id}
              className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-5 shadow-xs transition-all space-y-4"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 font-mono font-black text-sm">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-mono font-black text-slate-900">{quote.quoteNumber}</span>
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        quote.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : quote.status === 'Converted to Order'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : quote.status === 'Sent'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : quote.status === 'Declined'
                          ? 'bg-red-100 text-red-800 border border-red-300'
                          : 'bg-slate-100 text-slate-700 border border-slate-300'
                      }`}>
                        {quote.status}
                      </span>
                      {quote.zohoSyncStatus === 'synced' && (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Zoho Synced ({quote.zohoEstimateId})
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                      <span>Client: <strong className="text-slate-800">{quote.customerName}</strong> {quote.companyName ? `(${quote.companyName})` : ''}</span>
                      <span>•</span>
                      <span>Tel: <strong className="text-slate-700">{quote.customerPhone}</strong></span>
                      <span>•</span>
                      <span>Issued: {quote.quoteDate}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-bold">Status:</span>
                  <select
                    value={quote.status}
                    onChange={(e) => updateZohoQuoteStatus(quote.id, e.target.value as ZohoQuoteStatus)}
                    className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Sent">Sent</option>
                    <option value="Approved">Approved</option>
                    <option value="Converted to Order">Converted to Order</option>
                    <option value="Declined">Declined</option>
                  </select>
                </div>
              </div>

              {/* Items Summary Table */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200 pb-1">
                      <th className="pb-1.5">Item & Description</th>
                      <th className="pb-1.5 text-center">Qty</th>
                      <th className="pb-1.5 text-right">Unit Price</th>
                      <th className="pb-1.5 text-right">Discount</th>
                      <th className="pb-1.5 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {quote.items.map((it) => (
                      <tr key={it.id} className="text-slate-700">
                        <td className="py-2 pr-3">
                          <div className="font-bold text-slate-900">{it.name}</div>
                          <div className="text-[11px] text-slate-500 line-clamp-1">{it.description}</div>
                          {it.artworkNotes && (
                            <div className="text-[10px] text-blue-600 font-medium italic mt-0.5">Artwork: {it.artworkNotes}</div>
                          )}
                        </td>
                        <td className="py-2 px-2 text-center font-bold text-slate-900">{it.quantity} {it.unit}</td>
                        <td className="py-2 px-2 text-right font-mono text-slate-600">KSh {it.unitPrice.toLocaleString()}</td>
                        <td className="py-2 px-2 text-right text-amber-600 font-bold">{it.discountPercent > 0 ? `${it.discountPercent}%` : '-'}</td>
                        <td className="py-2 pl-2 text-right font-mono font-bold text-slate-900">KSh {it.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals & Quick Dispatch Bar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                  <span className="bg-slate-100 px-2.5 py-1 rounded-lg">
                    ⏱️ Turnaround: <strong>{quote.deliveryTimeline}</strong>
                  </span>
                  <span className="bg-slate-100 px-2.5 py-1 rounded-lg">
                    💳 Terms: <strong>{quote.paymentTerms}</strong>
                  </span>
                  <span className="bg-slate-100 px-2.5 py-1 rounded-lg">
                    📍 Delivery: <strong>{quote.deliveryType}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-4 text-right self-end lg:self-auto">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Grand Total (Inc. VAT & Delivery)</div>
                    <div className="text-lg font-mono font-black text-blue-600">
                      KSh {quote.grandTotal.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => {
                      setSelectedQuote(quote);
                      setIsPreviewOpen(true);
                    }}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Official Zoho PDF</span>
                  </button>

                  <button
                    onClick={() => handleOpenWhatsAppModal(quote)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Quote</span>
                  </button>

                  <button
                    onClick={() => handleOpenEmailModal(quote)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Quote</span>
                  </button>

                  {quote.status !== 'Converted to Order' ? (
                    <button
                      onClick={() => convertZohoQuoteToOrder(quote.id)}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>Convert to Live Order</span>
                    </button>
                  ) : (
                    <span className="bg-blue-50 text-blue-700 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 border border-blue-200">
                      <Check className="w-3.5 h-3.5" /> Converted ({quote.convertedOrderId})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => syncQuoteToZoho(quote.id)}
                    title="Sync to Zoho Books Cloud API"
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>

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
      {/* MODAL 1: ZOHO QUOTATION BUILDER & EDITOR */}
      {/* ========================================================================= */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-300">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black">{editingQuoteId ? 'Edit Zoho Quotation' : 'Create New Zoho Quotation'}</h3>
                  <p className="text-xs text-blue-200">Configure client details, dynamic catalogue line items, VAT rates, and terms.</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form Body (Scrollable) */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              
              {/* Section 1: Customer Profile & Identification */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>Customer & Organization Details</span>
                  </h4>
                  <span className="text-[11px] text-slate-400 font-semibold">Auto-fill or enter manually</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Customer / Contact Name *</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Jane Wambui"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Phone Number (WhatsApp) *</label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. 0712345678"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="client@company.co.ke"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Company / Organization Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Safari Adventures Ltd"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Customer KRA PIN (ETR Tax)</label>
                    <input
                      type="text"
                      value={customerKraPin}
                      onChange={(e) => setCustomerKraPin(e.target.value)}
                      placeholder="e.g. P051283940A"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Billing / Physical Address</label>
                    <input
                      type="text"
                      value={billingAddress}
                      onChange={(e) => setBillingAddress(e.target.value)}
                      placeholder="e.g. Westlands Commercial Center, Nairobi"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Quote Settings & Terms */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Quotation Reference & Commercial Terms</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Quote Reference #</label>
                    <input
                      type="text"
                      value={quoteNumber}
                      onChange={(e) => setQuoteNumber(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Quote Issue Date</label>
                    <input
                      type="date"
                      value={quoteDate}
                      onChange={(e) => setQuoteDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Validity Period</label>
                    <select
                      value={validityDays}
                      onChange={(e) => setValidityDays(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value={7}>7 Days (Urgent)</option>
                      <option value={14}>14 Calendar Days (Standard)</option>
                      <option value={30}>30 Calendar Days (Tender)</option>
                      <option value={60}>60 Calendar Days</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Payment Terms</label>
                    <select
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value as ZohoQuotation['paymentTerms'])}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="50% Deposit, 50% on Delivery">50% Deposit, 50% on Delivery</option>
                      <option value="Due on Receipt">Due on Receipt (100% upfront)</option>
                      <option value="Net 15">Net 15 Days (Corporate LPO)</option>
                      <option value="Net 30">Net 30 Days (Approved Accounts)</option>
                      <option value="Cash on Delivery">Cash on Delivery / Pickup</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Production & Delivery Timeline</label>
                    <input
                      type="text"
                      value={deliveryTimeline}
                      onChange={(e) => setDeliveryTimeline(e.target.value)}
                      placeholder="e.g. 24-48 Hours Express Delivery"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Delivery Fulfillment Type</label>
                    <select
                      value={deliveryType}
                      onChange={(e) => setDeliveryType(e.target.value as ZohoQuotation['deliveryType'])}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="CBD Workshop Pickup">CBD Workshop Pickup (Gatkim Complex)</option>
                      <option value="Express Home Delivery">Express Doorstep Delivery</option>
                      <option value="Pickup Station">Courier Pickup Station (G4S / Fargo)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as 'KSh' | 'USD')}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="KSh">KSh (Kenyan Shillings)</option>
                      <option value="USD">USD ($)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Dynamic Item Builder from Real Catalogue */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    <span>Line Items & Product Selector</span>
                  </h4>
                  <span className="text-[11px] text-blue-600 font-bold">
                    Pulls available catalogue products & pricing automatically
                  </span>
                </div>

                {/* Add Item Form Box */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Select from Available Woodynat Catalogue:
                      </label>
                      <select
                        value={selectedProductId}
                        onChange={(e) => handleSelectProduct(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="">-- Choose Catalogue Product (or type custom item below) --</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            [{p.category}] {p.name} {p.price ? `- KSh ${p.price.toLocaleString()}` : '(Quote Based)'}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Category</label>
                      <select
                        value={customItemCategory}
                        onChange={(e) => setCustomItemCategory(e.target.value as ProductCategory)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="Printed T-Shirts">Printed T-Shirts</option>
                        <option value="Hoodies">Hoodies</option>
                        <option value="Reflectors & Aprons">Reflectors & Aprons</option>
                        <option value="Banners & Stickers">Banners & Stickers</option>
                        <option value="Branding & Signage">Branding & Signage</option>
                        <option value="Flyers & Posters">Flyers & Posters</option>
                        <option value="Eulogies & Memorials">Eulogies & Memorials</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Item Title / Product Name *</label>
                      <input
                        type="text"
                        value={customItemName}
                        onChange={(e) => setCustomItemName(e.target.value)}
                        placeholder="e.g. Roll-Up Banner Printing (Light Base)"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={customItemQty}
                        onChange={(e) => setCustomItemQty(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Unit</label>
                      <select
                        value={customItemUnit}
                        onChange={(e) => setCustomItemUnit(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="pcs">Pieces (pcs)</option>
                        <option value="books">Books / Booklets</option>
                        <option value="sets">Sets</option>
                        <option value="rolls">Rolls</option>
                        <option value="sq.ft">Sq. Feet</option>
                        <option value="boxes">Boxes</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Unit Price (KSh) *</label>
                      <input
                        type="number"
                        min="0"
                        value={customItemPrice}
                        onChange={(e) => setCustomItemPrice(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Discount (% per item)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={customItemDiscount}
                        onChange={(e) => setCustomItemDiscount(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-amber-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Size / Variant</label>
                      <input
                        type="text"
                        value={customItemSize}
                        onChange={(e) => setCustomItemSize(e.target.value)}
                        placeholder="e.g. Mixed Sizes (M: 20, L: 30)"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Item Description & Specifications</label>
                    <textarea
                      rows={2}
                      value={customItemDesc}
                      onChange={(e) => setCustomItemDesc(e.target.value)}
                      placeholder="e.g. High-density screen printed 180GSM 100% cotton with front chest logo."
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="text-xs font-bold text-slate-600">
                      Calculated Line Total: <span className="text-blue-600 font-mono font-black">KSh {(customItemPrice * (1 - customItemDiscount/100) * customItemQty).toLocaleString()}</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddItemToQuote}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Add Line Item to Quote</span>
                    </button>
                  </div>
                </div>

                {/* Current Items Table in Builder */}
                {quoteItems.length > 0 && (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                    <div className="bg-slate-100 px-4 py-2.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                      <span>Quotation Items ({quoteItems.length})</span>
                      <span>Item Totals</span>
                    </div>

                    <div className="divide-y divide-slate-100 bg-white">
                      {quoteItems.map((item, idx) => (
                        <div key={item.id} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                          <div className="flex-1">
                            <div className="font-bold text-slate-900 flex items-center gap-2">
                              <span>#{idx + 1} {item.name}</span>
                              <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                {item.quantity} {item.unit}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{item.description}</div>
                            {item.selectedSize && (
                              <div className="text-[10px] text-slate-500">Size/Specs: {item.selectedSize}</div>
                            )}
                          </div>

                          <div className="text-right shrink-0">
                            <div className="font-mono font-black text-slate-900 text-sm">
                              KSh {item.total.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              @ KSh {item.unitPrice.toLocaleString()} {item.discountPercent > 0 ? `(-${item.discountPercent}%)` : ''}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Section 4: Taxes, Logistics & Summary */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  <span>Tax & Logistics Breakdown</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">KRA VAT Rate (%)</label>
                    <select
                      value={taxRate}
                      onChange={(e) => setTaxRate(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value={16}>16% Standard VAT (KRA ETR)</option>
                      <option value={0}>0% Tax Exempt / Zero-Rated</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Tax Inclusivity</label>
                    <select
                      value={isTaxInclusive ? 'inclusive' : 'exclusive'}
                      onChange={(e) => setIsTaxInclusive(e.target.value === 'inclusive')}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="exclusive">Tax Exclusive (+16% added to subtotal)</option>
                      <option value="inclusive">Tax Inclusive (Included in prices)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Shipping / Courier Logistics Fee (KSh)</label>
                    <input
                      type="number"
                      min="0"
                      value={shippingCost}
                      onChange={(e) => setShippingCost(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Calculation Box */}
                <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1 text-xs text-slate-700">
                    <div>Items Subtotal: <strong>KSh {editorSubtotal.toLocaleString()}</strong></div>
                    {editorDiscountTotal > 0 && (
                      <div className="text-amber-700">Total Discounts: <strong>-KSh {editorDiscountTotal.toLocaleString()}</strong></div>
                    )}
                    {editorTaxTotal > 0 && (
                      <div>16% KRA VAT: <strong>+KSh {editorTaxTotal.toLocaleString()}</strong></div>
                    )}
                    {shippingCost > 0 && (
                      <div>Logistics & Delivery: <strong>+KSh {Number(shippingCost).toLocaleString()}</strong></div>
                    )}
                  </div>

                  <div className="text-right sm:border-l sm:border-blue-200 sm:pl-6">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Estimated Grand Total</div>
                    <div className="text-2xl font-mono font-black text-blue-700">
                      KSh {editorGrandTotal.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {formatAmountToWords(editorGrandTotal)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 5: Notes & Terms */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Notes & Terms & Conditions</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Customer Special Instructions / Notes</label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Commercial Terms & Conditions</label>
                    <textarea
                      rows={3}
                      value={termsAndConditions}
                      onChange={(e) => setTermsAndConditions(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer Buttons */}
            <div className="bg-slate-100 p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveQuote('Draft')}
                  className="bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Save as Draft
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveQuote('Sent')}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl transition-colors cursor-pointer shadow-md shadow-blue-600/30 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Save & Ready to Send</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: OFFICIAL ZOHO BOOKS / INVOICE PRINT & PDF PREVIEW */}
      {/* ========================================================================= */}
      {isPreviewOpen && selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col print:shadow-none print:border-none print:rounded-none">
            
            {/* Top Toolbar (Hidden on Print) */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0 print:hidden">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-extrabold">Zoho Books Official Quotation: {selectedQuote.quoteNumber}</span>
                <span className="bg-blue-600 text-[10px] font-black px-2 py-0.5 rounded-md">Print-Ready</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintDocument}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>

                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* OFFICIAL ZOHO BOOKS DOCUMENT BODY */}
            <div id="zoho-official-quote-document" className="p-8 sm:p-12 space-y-8 bg-white text-slate-900 overflow-y-auto">
              
              {/* Document Header */}
              <div className="flex flex-col sm:flex-row items-start justify-between gap-6 border-b-2 border-slate-900 pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-xs">
                      W
                    </div>
                    <div>
                      <h1 className="text-xl font-black text-slate-950 tracking-tight">Woodynat Designers Limited</h1>
                      <p className="text-xs text-slate-600 font-semibold">Branding, Commercial Printing & Signage Solutions</p>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 space-y-0.5 mt-3">
                    <p>📍 Temple Road Gatkim complex building fourth floor wing B Room 4B1</p>
                    <p>🏢 Nairobi Central Business District (CBD), Kenya</p>
                    <p>📞 Phone / WhatsApp: +254 797 939 199 | Email: {zohoSettings.accountEmail || 'woodynatdesigners12@gmail.com'}</p>
                    <p className="font-bold text-slate-800">KRA PIN: {zohoSettings.companyKraPin || 'P051982734Z'} (VAT Registered)</p>
                  </div>
                </div>

                <div className="text-right sm:min-w-48">
                  <div className="text-3xl font-black text-slate-900 uppercase tracking-tight">QUOTATION</div>
                  <div className="text-sm font-mono font-bold text-blue-600 mt-1">{selectedQuote.quoteNumber}</div>
                  <div className="text-xs text-slate-500 mt-2 space-y-0.5">
                    <p>Quote Date: <strong className="text-slate-800">{selectedQuote.quoteDate}</strong></p>
                    <p>Valid Until: <strong className="text-slate-800">{selectedQuote.expiryDate}</strong></p>
                    <p>Prepared By: <strong>{selectedQuote.preparedBy}</strong></p>
                  </div>
                </div>
              </div>

              {/* Bill To & Ship To Boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">QUOTATION PREPARED FOR:</div>
                  <div className="text-sm font-bold text-slate-900">{selectedQuote.customerName}</div>
                  {selectedQuote.companyName && (
                    <div className="text-xs font-semibold text-slate-700">{selectedQuote.companyName}</div>
                  )}
                  {selectedQuote.customerKraPin && (
                    <div className="text-xs text-slate-600 font-mono">KRA PIN: {selectedQuote.customerKraPin}</div>
                  )}
                  <div className="text-xs text-slate-600">Tel: {selectedQuote.customerPhone}</div>
                  <div className="text-xs text-slate-600">Email: {selectedQuote.customerEmail}</div>
                  <div className="text-xs text-slate-600">Address: {selectedQuote.billingAddress || 'Nairobi, Kenya'}</div>
                </div>

                <div className="space-y-1 sm:border-l sm:border-slate-200 sm:pl-6">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">FULFILLMENT & DELIVERY:</div>
                  <div className="text-xs font-bold text-slate-800">Fulfillment Method: {selectedQuote.deliveryType}</div>
                  <div className="text-xs text-slate-600">Destination: {selectedQuote.deliveryLocation}</div>
                  <div className="text-xs text-slate-600">Turnaround Timeline: <strong>{selectedQuote.deliveryTimeline}</strong></div>
                  <div className="text-xs text-slate-600">Payment Terms: <strong>{selectedQuote.paymentTerms}</strong></div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px]">
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
                      <tr key={item.id} className="text-slate-800">
                        <td className="py-3 px-4 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{item.name}</div>
                          <div className="text-[11px] text-slate-600 mt-0.5">{item.description}</div>
                          {item.selectedSize && (
                            <div className="text-[10px] text-slate-500 mt-0.5">Size/Specs: {item.selectedSize}</div>
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

              {/* Financial Totals & Words representation */}
              <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pt-2">
                <div className="space-y-3 max-w-md">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-950">
                    <div className="font-bold uppercase tracking-wider text-[10px] text-blue-700 mb-1">M-Pesa Official Paybill Instructions:</div>
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

                  {selectedQuote.taxTotal > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>16% KRA VAT:</span>
                      <span className="font-mono font-bold">+KSh {selectedQuote.taxTotal.toLocaleString()}</span>
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
                    {formatAmountToWords(selectedQuote.grandTotal)}
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
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
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
                href={`https://wa.me/254${selectedQuote.customerPhone.replace(/^0/, '')}?text=${encodeURIComponent(getWhatsAppMessageText(selectedQuote))}`}
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
      {/* MODAL 4: 1-CLICK EMAIL DISPATCH MODAL */}
      {/* ========================================================================= */}
      {isEmailModalOpen && selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-blue-600 font-extrabold text-base">
                <Mail className="w-5 h-5" />
                <span>Send Quotation via Zoho Mail Engine</span>
              </div>
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
                <div>
                  <span className="text-slate-500 font-medium">From (Linked Zoho Account):</span>
                  <div className="font-mono font-bold text-slate-900">{zohoSettings.senderName || 'Woodynat Designers Limited'} &lt;{zohoSettings.accountEmail || 'woodynatdesigners12@gmail.com'}&gt;</div>
                </div>
              </div>
              <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                Zoho Connected
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">To Customer Email:</label>
                  <input
                    type="email"
                    defaultValue={selectedQuote.customerEmail}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">CC / Audit Copy (Zoho Admin):</label>
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
                  defaultValue={`Official Commercial Quotation #${selectedQuote.quoteNumber} - Woodynat Designers Limited`}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                />
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-700 space-y-2 max-h-48 overflow-y-auto font-sans leading-relaxed">
                <p>Dear {selectedQuote.customerName},</p>
                <p>Please find attached our official commercial quotation <strong>#{selectedQuote.quoteNumber}</strong> prepared by Woodynat Designers Limited for your requested items.</p>
                <p className="font-semibold text-blue-900 bg-blue-100/60 p-2 rounded-lg">
                  💰 Grand Total: KSh {selectedQuote.grandTotal.toLocaleString()} ({selectedQuote.items.length} line items) • Validity: {selectedQuote.validityDays} Days
                </p>
                <p>We are ready to commence production immediately upon digital proof approval and deposit confirmation via <strong>M-Pesa Paybill: 247247 | Account: 0797939199</strong>.</p>
                <p>Physical Location: Temple Road Gatkim complex building fourth floor wing B Room 4B1, Nairobi CBD.</p>
                <p>Warm regards,<br/><strong>Woodynat Designers Limited Commercial Sales Desk</strong><br/>Email: {zohoSettings.accountEmail || 'woodynatdesigners12@gmail.com'} | Tel: 0797939199</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <a
                href={`mailto:${selectedQuote.customerEmail}?cc=${encodeURIComponent(zohoSettings.accountEmail || 'woodynatdesigners12@gmail.com')}&subject=${encodeURIComponent(`Official Quotation #${selectedQuote.quoteNumber} - Woodynat Designers Limited`)}&body=${encodeURIComponent(`Dear ${selectedQuote.customerName},\n\nPlease find our official commercial quotation #${selectedQuote.quoteNumber} for KSh ${selectedQuote.grandTotal.toLocaleString()}.\n\nPaybill: 247247 | Acc: 0797939199\nLocation: Temple Road Gatkim complex building fourth floor wing B Room 4B1, Nairobi.\n\nWoodynat Designers Limited Desk\nEmail: woodynatdesigners12@gmail.com\nTel: 0797939199`)}`}
                className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                <span>Open in Gmail App</span>
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEmailModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
                    updateZohoQuoteStatus(selectedQuote.id, 'Sent');
                    setIsEmailModalOpen(false);
                    showToast('Quotation Email Sent via Zoho!', `Official quotation ${selectedQuote.quoteNumber} dispatched from ${zohoSettings.accountEmail || 'woodynatdesigners12@gmail.com'} to ${selectedQuote.customerEmail}.`);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md shadow-blue-600/30 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Send via Zoho Mail</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: ZOHO API & CLOUD INTEGRATION SETTINGS */}
      {/* ========================================================================= */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-black text-base">
                <Settings className="w-5 h-5 text-blue-600" />
                <span>Zoho Books / Invoice & Mail Configuration</span>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            {/* Verified Account Status */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
                <div>
                  <div className="font-bold text-slate-900">Linked Zoho Primary Email</div>
                  <div className="font-mono text-emerald-800 font-black">{tempAccountEmail}</div>
                </div>
              </div>
              <span className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
                Active & Linked
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Zoho Account Email (Primary SSO)</label>
                  <input
                    type="email"
                    value={tempAccountEmail}
                    onChange={(e) => setTempAccountEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-blue-700 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Quotation Audit Notification Email</label>
                  <input
                    type="email"
                    value={tempNotificationEmail}
                    onChange={(e) => setTempNotificationEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Authorized Sender Name</label>
                  <input
                    type="text"
                    value={tempSenderName}
                    onChange={(e) => setTempSenderName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Environment</label>
                  <select
                    value={tempEnv}
                    onChange={(e) => setTempEnv(e.target.value as 'sandbox' | 'production')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                  >
                    <option value="production">Production Live (api.zoho.com)</option>
                    <option value="sandbox">Sandbox Developer (sandbox.zoho.com)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Zoho Organization ID</label>
                  <input
                    type="text"
                    value={tempOrgId}
                    onChange={(e) => setTempOrgId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Default Quote Prefix</label>
                  <input
                    type="text"
                    value={tempPrefix}
                    onChange={(e) => setTempPrefix(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">OAuth Client ID</label>
                <input
                  type="text"
                  value={tempClientId}
                  onChange={(e) => setTempClientId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">OAuth Client Secret</label>
                <input
                  type="password"
                  value={tempClientSecret}
                  onChange={(e) => setTempClientSecret(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Company KRA PIN</label>
                  <input
                    type="text"
                    value={tempKraPin}
                    onChange={(e) => setTempKraPin(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">OAuth Refresh Token</label>
                  <input
                    type="password"
                    value={tempRefreshToken}
                    onChange={(e) => setTempRefreshToken(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="autoSyncCheck"
                  checked={tempAutoSync}
                  onChange={(e) => setTempAutoSync(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="autoSyncCheck" className="text-xs font-bold text-slate-700">
                  Automatically sync newly created quotations to Zoho Books as active Estimates
                </label>
              </div>
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
                    organizationId: tempOrgId,
                    clientId: tempClientId,
                    clientSecret: tempClientSecret,
                    refreshToken: tempRefreshToken,
                    environment: tempEnv,
                    autoSyncToZoho: tempAutoSync,
                    defaultQuotePrefix: tempPrefix,
                    companyKraPin: tempKraPin
                  });
                  setIsSettingsOpen(false);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs shadow-md shadow-blue-600/30 cursor-pointer"
              >
                Save Zoho Config
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
