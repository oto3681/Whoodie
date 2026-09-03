import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product, ProductCategory, CustomerInquiry, CataloguePrintConfig } from '../types';
import { safeCopyToClipboard } from '../utils/clipboard';
import { 
  generateCataloguePdf, 
  openPrintableCatalogueWindow, 
  formatCatalogueWhatsAppMessage, 
  formatCatalogueEmailBody 
} from '../utils/cataloguePdfGenerator';
import { 
  Printer, 
  Download, 
  MessageCircle, 
  Mail, 
  Copy, 
  Check, 
  Search, 
  Filter, 
  CheckSquare, 
  Square, 
  Users, 
  UserCheck, 
  Sparkles, 
  FileText, 
  Layers, 
  Plus, 
  Trash2, 
  Eye, 
  Clock, 
  Tag, 
  Percent, 
  Send,
  Building2,
  Phone,
  RefreshCw,
  X,
  ExternalLink,
  Edit3,
  Upload
} from 'lucide-react';
import { AdminProductEditModal } from './AdminProductEditModal';

export const AdminCatalogueStudio: React.FC = () => {
  const { 
    products, 
    orders, 
    inquiries, 
    addInquiry, 
    updateInquiryStatus, 
    deleteInquiry, 
    wpSettings, 
    categories, 
    updateProduct,
    addProduct,
    showToast 
  } = useApp();

  // Price Catalogue Product Edit Dialogue Box State
  const [editingProductModal, setEditingProductModal] = useState<Product | null>(null);
  const [isNewProductModal, setIsNewProductModal] = useState<boolean>(false);

  // Selected Products State
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(() => 
    products.map(p => p.id)
  );

  // Filters for Product Selection
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Catalogue Configuration State
  const [catalogueTitle, setCatalogueTitle] = useState<string>('Official Product Catalogue & Rate Card 2026');
  const [catalogueSubtitle, setCatalogueSubtitle] = useState<string>('Custom Commercial Printing, Apparel & Signage Rate Sheet');
  const [layoutStyle, setLayoutStyle] = useState<'grid' | 'table' | 'cards' | 'specsheet'>('table');
  const [showPrices, setShowPrices] = useState<boolean>(true);
  const [showImages, setShowImages] = useState<boolean>(true);
  const [showFeatures, setShowFeatures] = useState<boolean>(true);
  const [showPaybillInfo, setShowPaybillInfo] = useState<boolean>(true);
  const [showTerms, setShowTerms] = useState<boolean>(true);
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [customNotes, setCustomNotes] = useState<string>(
    'Delivery fee depends on the type of the product and the distance. 24h-48h turnaround upon design proof approval.'
  );

  // Customer / Target Inquiry State
  const [selectedInquiryId, setSelectedInquiryId] = useState<string>('');
  const [targetCustomerName, setTargetCustomerName] = useState<string>('');
  const [targetCustomerPhone, setTargetCustomerPhone] = useState<string>('');
  const [targetCustomerEmail, setTargetCustomerEmail] = useState<string>('');
  const [targetCompanyName, setTargetCompanyName] = useState<string>('');

  // New Inquiry Modal State
  const [isNewInquiryModalOpen, setIsNewInquiryModalOpen] = useState<boolean>(false);
  const [newInqName, setNewInqName] = useState<string>('');
  const [newInqPhone, setNewInqPhone] = useState<string>('');
  const [newInqEmail, setNewInqEmail] = useState<string>('');
  const [newInqCompany, setNewInqCompany] = useState<string>('');
  const [newInqTopic, setNewInqTopic] = useState<string>('Bulk Custom T-Shirts & Banners');
  const [newInqNotes, setNewInqNotes] = useState<string>('');
  const [newInqCategory, setNewInqCategory] = useState<ProductCategory>('Printed T-Shirts');
  const [newInqQty, setNewInqQty] = useState<number>(100);

  // UI Active Sub-view (Builder vs Inquiries vs Preview)
  const [activeSubView, setActiveSubView] = useState<'builder' | 'inquiries' | 'preview'>('builder');
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);

  // Filtered Products for the Selector List
  const filteredProducts = products.filter((p) => {
    const matchesCat = filterCategory === 'All' || p.category === filterCategory;
    const matchesSearch = searchQuery === '' || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Selected Products Objects
  const selectedProducts = products.filter(p => selectedProductIds.includes(p.id));

  // Current Config Object
  const currentConfig: CataloguePrintConfig = {
    title: catalogueTitle,
    subtitle: catalogueSubtitle,
    clientName: targetCustomerName,
    layoutStyle,
    showPrices,
    showImages,
    showFeatures,
    showPaybillInfo,
    showTerms,
    discountPercentage,
    customNotes,
  };

  // Selection Handlers
  const toggleSelectProduct = (id: string) => {
    if (selectedProductIds.includes(id)) {
      setSelectedProductIds(prev => prev.filter(item => item !== id));
    } else {
      setSelectedProductIds(prev => [...prev, id]);
    }
  };

  const handleSelectAll = () => {
    setSelectedProductIds(products.map(p => p.id));
    showToast('All Products Selected', `Selected all ${products.length} catalog items for catalogue.`);
  };

  const handleDeselectAll = () => {
    setSelectedProductIds([]);
    showToast('Selection Cleared', 'All products deselected.', 'info');
  };

  const handleSelectByCategory = (cat: ProductCategory) => {
    const catIds = products.filter(p => p.category === cat).map(p => p.id);
    setSelectedProductIds(catIds);
    showToast(`Selected Category: ${cat}`, `Loaded ${catIds.length} items from ${cat}.`);
  };

  const handleSelectFlashDeals = () => {
    const flashIds = products.filter(p => p.isFlashDeal).map(p => p.id);
    setSelectedProductIds(flashIds);
    showToast('Flash Deals Selected', `Loaded ${flashIds.length} promotional items.`);
  };

  // Customer Auto-fill from Inquiry Selection
  const handleSelectInquiry = (inqId: string) => {
    setSelectedInquiryId(inqId);
    if (!inqId) {
      setTargetCustomerName('');
      setTargetCustomerPhone('');
      setTargetCustomerEmail('');
      setTargetCompanyName('');
      return;
    }

    const inq = inquiries.find(i => i.id === inqId);
    if (inq) {
      setTargetCustomerName(inq.customerName);
      setTargetCustomerPhone(inq.customerPhone);
      setTargetCustomerEmail(inq.customerEmail || '');
      setTargetCompanyName(inq.companyName || '');
      setCatalogueSubtitle(`Customized Printing Quotation for ${inq.customerName}${inq.companyName ? ` (${inq.companyName})` : ''}`);

      if (inq.preferredCategory && inq.preferredCategory !== 'All') {
        const catIds = products.filter(p => p.category === inq.preferredCategory).map(p => p.id);
        if (catIds.length > 0) {
          setSelectedProductIds(catIds);
        }
      }
      showToast('Client Details Loaded', `Loaded contact and category preferences for ${inq.customerName}.`);
    }
  };

  // Export / Dispatch Handlers
  const handlePrint = () => {
    if (selectedProducts.length === 0) {
      showToast('No Products Selected', 'Please select at least 1 product to print catalogue.', 'error');
      return;
    }
    openPrintableCatalogueWindow(
      selectedProducts,
      currentConfig,
      wpSettings,
      { name: targetCustomerName, phone: targetCustomerPhone, companyName: targetCompanyName }
    );
    showToast('Print Preview Opened 🖨️', 'A4 Catalogue print dialog loaded.');
  };

  const handleDownloadPdf = () => {
    if (selectedProducts.length === 0) {
      showToast('No Products Selected', 'Please select at least 1 product to generate PDF.', 'error');
      return;
    }
    generateCataloguePdf(
      selectedProducts,
      currentConfig,
      wpSettings,
      { name: targetCustomerName, phone: targetCustomerPhone, email: targetCustomerEmail, companyName: targetCompanyName }
    );
    showToast('PDF Catalogue Downloaded 📄', `Generated Woodynat catalogue with ${selectedProducts.length} items.`);

    // If an inquiry was selected, auto-update status
    if (selectedInquiryId) {
      updateInquiryStatus(selectedInquiryId, 'Catalogue Sent');
    }
  };

  const handleSendWhatsApp = (customPhone?: string, customName?: string) => {
    if (selectedProducts.length === 0) {
      showToast('No Products Selected', 'Please select at least 1 product to send quotation.', 'error');
      return;
    }

    const phoneToSend = customPhone || targetCustomerPhone || wpSettings.whatsappNumber;
    const nameToSend = customName || targetCustomerName;

    const raw = phoneToSend.replace(/[^0-9]/g, '');
    const cleanPhone = raw.startsWith('0') ? '254' + raw.slice(1) : raw;

    const message = formatCatalogueWhatsAppMessage(
      selectedProducts,
      currentConfig,
      wpSettings,
      { name: nameToSend, phone: phoneToSend, companyName: targetCompanyName }
    );

    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');

    showToast('WhatsApp Quotation Dispatched 💬', `Opening WhatsApp conversation for ${nameToSend || cleanPhone}...`);

    if (selectedInquiryId) {
      updateInquiryStatus(selectedInquiryId, 'Catalogue Sent');
    }
  };

  const handleSendEmail = () => {
    if (selectedProducts.length === 0) {
      showToast('No Products Selected', 'Please select at least 1 product to email.', 'error');
      return;
    }

    const { subject, body } = formatCatalogueEmailBody(
      selectedProducts,
      currentConfig,
      wpSettings,
      { name: targetCustomerName, email: targetCustomerEmail }
    );

    const mailtoUrl = `mailto:${targetCustomerEmail || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;

    showToast('Email Client Opened ✉️', 'Pre-filled quotation ready in your email app.');

    if (selectedInquiryId) {
      updateInquiryStatus(selectedInquiryId, 'Catalogue Sent');
    }
  };

  const handleCopyFormattedText = () => {
    if (selectedProducts.length === 0) {
      showToast('No Products Selected', 'Please select at least 1 product to copy.', 'error');
      return;
    }

    const text = formatCatalogueWhatsAppMessage(
      selectedProducts,
      currentConfig,
      wpSettings,
      { name: targetCustomerName, phone: targetCustomerPhone, companyName: targetCompanyName }
    );

    safeCopyToClipboard(text).catch(() => {});
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 3000);
    showToast('Quotation Copied to Clipboard 📋', 'You can now paste it into WhatsApp, SMS, or Telegram!');
  };

  const handleCreateInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInqName || !newInqPhone) {
      showToast('Missing Fields', 'Please enter customer name and phone number.', 'error');
      return;
    }

    const created = addInquiry({
      customerName: newInqName,
      customerPhone: newInqPhone,
      customerEmail: newInqEmail,
      companyName: newInqCompany,
      inquiryTopic: newInqTopic,
      notes: newInqNotes,
      status: 'New',
      preferredCategory: newInqCategory,
      requestedQuantity: newInqQty
    });

    handleSelectInquiry(created.id);
    setIsNewInquiryModalOpen(false);
    setNewInqName('');
    setNewInqPhone('');
    setNewInqEmail('');
    setNewInqCompany('');
    setNewInqNotes('');
  };

  return (
    <div className="space-y-6">
      
      {/* Studio Header Bar */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-blue-600 text-white font-black text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-md flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              Catalogue & Quotation Studio
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border border-emerald-500/30">
              PDF & Print Ready
            </span>
            <span className="bg-slate-800 text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded-md">
              {selectedProducts.length} Items Selected
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Custom Catalogue Generator & Client Inquiry Dispatch
          </h2>
          <p className="text-xs text-slate-400 max-w-3xl">
            Choose exactly which products to include, customize wholesale rate cards or lookbooks, print in clean A4 format, download branded PDF documents, or dispatch instantly to clients who inquired.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            onClick={handlePrint}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer shadow-sm"
            title="Open high-resolution A4 printable view"
          >
            <Printer className="w-4 h-4 text-blue-400" />
            <span>Print Catalogue (A4)</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md border border-blue-500"
            title="Download multi-page PDF catalogue file"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Generate & Download PDF</span>
          </button>

          <button
            onClick={() => handleSendWhatsApp()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md border border-emerald-500"
            title="Send customized catalogue to customer via WhatsApp"
          >
            <MessageCircle className="w-4 h-4 text-white" />
            <span>Send via WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Sub-view Navigation Bar */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-2 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubView('builder')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubView === 'builder'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>1. Product Selector & Layout Config</span>
          </button>

          <button
            onClick={() => setActiveSubView('inquiries')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubView === 'inquiries'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>2. Inquiring Customers ({inquiries.length})</span>
            {inquiries.filter(i => i.status === 'New').length > 0 && (
              <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {inquiries.filter(i => i.status === 'New').length} New
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubView('preview')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubView === 'preview'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>3. Live Interactive Preview</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyFormattedText}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            {copiedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copiedSuccess ? 'Copied!' : 'Copy Quotation Text'}</span>
          </button>

          <button
            onClick={handleSendEmail}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5 text-blue-600" />
            <span>Send Email</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: BUILDER & CONFIGURATOR */}
      {activeSubView === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: PRODUCT PICKER & CATALOGUE SELECTOR (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                    <span>Choose Products to Include in Catalogue</span>
                  </h3>
                  <p className="text-xs text-slate-500">Check or uncheck items you want printed on this rate card or quotation.</p>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={handleSelectAll}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    Select All ({products.length})
                  </button>
                  <button
                    onClick={handleDeselectAll}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={handleSelectFlashDeals}
                    className="bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-amber-200 transition-colors cursor-pointer"
                  >
                    ⚡ Flash Deals
                  </button>
                  <button
                    id="catalogue-add-product-btn"
                    onClick={() => {
                      setEditingProductModal({
                        id: `prod-custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                        name: '',
                        category: (filterCategory !== 'All' ? filterCategory : 'Printed T-Shirts') as ProductCategory,
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
                      setIsNewProductModal(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-2xs shrink-0"
                    title="Add new product & upload images (Opens Dialogue Box)"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Product</span>
                  </button>
                </div>
              </div>

              {/* Search & Category Filter Pills */}
              <div className="space-y-2.5">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name, material, keyword (e.g. t-shirt, banner, hoodie)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Category quick selectors */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all cursor-pointer ${
                        filterCategory === cat
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Selection Items Grid / List */}
              <div className="max-h-[520px] overflow-y-auto space-y-2 pr-1 border border-slate-100 rounded-xl p-2 bg-slate-50/50">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-xs">
                    No products matched your search or category filter.
                  </div>
                ) : (
                  filteredProducts.map((product) => {
                    const isSelected = selectedProductIds.includes(product.id);
                    return (
                      <div
                        key={product.id}
                        onClick={() => toggleSelectProduct(product.id)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                          isSelected
                            ? 'bg-blue-50/70 border-blue-300 shadow-2xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 opacity-75'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="shrink-0 text-blue-600">
                            {isSelected ? (
                              <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-md border-2 border-slate-300 bg-white" />
                            )}
                          </div>

                          <div 
                            className="relative group shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingProductModal(product);
                              setIsNewProductModal(false);
                            }}
                            title="Click to Upload/Change Product Image"
                          >
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0 bg-white cursor-pointer"
                            />
                            <div className="absolute inset-0 bg-slate-950/60 text-white rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                              <Upload className="w-3.5 h-3.5 text-amber-300" />
                            </div>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-bold text-slate-500 uppercase">
                                {product.category}
                              </span>
                              {product.isFlashDeal && (
                                <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-1.5 py-0.2 rounded">
                                  Flash Deal
                                </span>
                              )}
                              {product.expressDeliveryAvailable && (
                                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-1.5 py-0.2 rounded">
                                  24h Ready
                                </span>
                              )}
                            </div>
                            <h4 className="text-xs font-bold text-slate-900 truncate">
                              {product.name}
                            </h4>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 pl-3">
                          <div className="text-right">
                            {product.isQuoteOnly || product.price === 0 ? (
                              <span className="text-[11px] font-bold text-blue-600 bg-blue-100/60 px-2 py-0.5 rounded">
                                Quote on Inquiry
                              </span>
                            ) : (
                              <div>
                                <div className="text-xs font-extrabold text-slate-900">
                                  KSh {discountPercentage > 0 
                                    ? Math.round(product.price * (1 - discountPercentage / 100)).toLocaleString()
                                    : product.price.toLocaleString()}
                                </div>
                                {discountPercentage > 0 && (
                                  <div className="text-[10px] text-slate-400 line-through">
                                    KSh {product.price.toLocaleString()}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <button
                            id={`edit-catalogue-item-btn-${product.id}`}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingProductModal(product);
                              setIsNewProductModal(false);
                            }}
                            className="p-1.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer border border-blue-200"
                            title="Edit price & upload product images (Opens Dialogue Box)"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom selection summary */}
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 bg-slate-100 p-3 rounded-xl">
                <span>
                  <strong>{selectedProducts.length}</strong> of <strong>{products.length}</strong> products selected for catalogue.
                </span>
                <span className="text-blue-600 font-extrabold">
                  {selectedProducts.length === products.length ? 'Full Catalog Mode' : 'Custom Curated Selection'}
                </span>
              </div>

            </div>
          </div>

          {/* RIGHT: CATALOGUE CUSTOMIZER & FORMAT SETTINGS (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Target Client / Inquiry Selector */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Target Client / Inquiry Recipient</span>
                </h3>

                <button
                  onClick={() => setIsNewInquiryModalOpen(true)}
                  className="text-blue-600 hover:text-blue-700 text-xs font-extrabold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Inquiry</span>
                </button>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Load from Inquiring Customer:
                </label>
                <select
                  value={selectedInquiryId}
                  onChange={(e) => handleSelectInquiry(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">-- General / No Specific Client Selected --</option>
                  {inquiries.map((inq) => (
                    <option key={inq.id} value={inq.id}>
                      {inq.customerName} {inq.companyName ? `(${inq.companyName})` : ''} - {inq.inquiryTopic} [{inq.status}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Client Name:</label>
                  <input
                    type="text"
                    value={targetCustomerName}
                    onChange={(e) => setTargetCustomerName(e.target.value)}
                    placeholder="e.g. Jane Wambui"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Company / Org:</label>
                  <input
                    type="text"
                    value={targetCompanyName}
                    onChange={(e) => setTargetCompanyName(e.target.value)}
                    placeholder="e.g. Apex Logistics"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-0.5">WhatsApp / Phone:</label>
                  <input
                    type="text"
                    value={targetCustomerPhone}
                    onChange={(e) => setTargetCustomerPhone(e.target.value)}
                    placeholder="0712345678"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Client Email:</label>
                  <input
                    type="email"
                    value={targetCustomerEmail}
                    onChange={(e) => setTargetCustomerEmail(e.target.value)}
                    placeholder="client@gmail.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Layout Style & Document Branding */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Document Format & Layout Style</span>
              </h3>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Catalogue Layout Style:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLayoutStyle('table')}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                      layoutStyle === 'table'
                        ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-[11px] font-extrabold">📊 Rate Card Table</div>
                    <div className="text-[10px] text-slate-500 font-normal">A4 Table layout, ideal for official multi-item quotes.</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLayoutStyle('cards')}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                      layoutStyle === 'cards'
                        ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-[11px] font-extrabold">🖼️ Lookbook Cards</div>
                    <div className="text-[10px] text-slate-500 font-normal">Feature badges and descriptions.</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Document Header Title:</label>
                <input
                  type="text"
                  value={catalogueTitle}
                  onChange={(e) => setCatalogueTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Subtitle / Brief Description:</label>
                <input
                  type="text"
                  value={catalogueSubtitle}
                  onChange={(e) => setCatalogueSubtitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                />
              </div>

              {/* Wholesale Discount Selector */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5 text-amber-600" />
                    <span>Special Wholesale Discount %:</span>
                  </label>
                  <span className="text-xs font-black text-amber-600">
                    {discountPercentage > 0 ? `${discountPercentage}% OFF Applied` : 'Standard Rates'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {[0, 5, 10, 15, 20, 25].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setDiscountPercentage(pct)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        discountPercentage === pct
                          ? 'bg-amber-500 text-white shadow-2xs font-extrabold'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {pct === 0 ? '0%' : `${pct}%`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Include/Exclude Toggles */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Document Sections & Options:
                </span>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showPrices}
                      onChange={(e) => setShowPrices(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-slate-700 font-medium">Show Item Prices</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showFeatures}
                      onChange={(e) => setShowFeatures(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-slate-700 font-medium">Show Features/Specs</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showPaybillInfo}
                      onChange={(e) => setShowPaybillInfo(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-slate-700 font-medium">M-Pesa Paybill Info</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showTerms}
                      onChange={(e) => setShowTerms(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-slate-700 font-medium">Delivery & Terms</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Custom Notes & Delivery Instructions:</label>
                <textarea
                  rows={2}
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800"
                />
              </div>

            </div>

          </div>

        </div>
      )}

      {/* VIEW 2: INQUIRIES & DISPATCH QUEUE */}
      {activeSubView === 'inquiries' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>Customer Inquiries & Direct Catalogue Dispatch</span>
              </h3>
              <p className="text-xs text-slate-500">
                View prospective clients who asked for quotes or pricing. Select any inquiry to instantly dispatch the tailored PDF catalogue or rate card.
              </p>
            </div>

            <button
              onClick={() => setIsNewInquiryModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Log New Client Inquiry</span>
            </button>
          </div>

          {/* Inquiries Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Client Name & Org</th>
                    <th className="py-3 px-4">Phone / WhatsApp</th>
                    <th className="py-3 px-4">Inquiry Subject & Qty</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Quick Dispatch Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inquiries.map((inq) => {
                    const isSelected = selectedInquiryId === inq.id;
                    return (
                      <tr 
                        key={inq.id}
                        className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-blue-50/70 font-medium' : ''}`}
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{inq.customerName}</div>
                          {inq.companyName && (
                            <div className="text-[10px] text-slate-500 flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              <span>{inq.companyName}</span>
                            </div>
                          )}
                          {inq.customerEmail && (
                            <div className="text-[10px] text-slate-400">{inq.customerEmail}</div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                          {inq.customerPhone}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{inq.inquiryTopic}</div>
                          {inq.notes && (
                            <div className="text-[11px] text-slate-500 max-w-xs truncate">{inq.notes}</div>
                          )}
                          {inq.requestedQuantity && (
                            <span className="inline-block bg-slate-100 text-slate-700 text-[10px] font-bold px-1.5 py-0.2 rounded mt-0.5">
                              Qty: {inq.requestedQuantity} pcs
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                          {inq.createdAt}
                        </td>

                        <td className="py-3.5 px-4">
                          <select
                            value={inq.status}
                            onChange={(e) => updateInquiryStatus(inq.id, e.target.value as any)}
                            className={`text-[10px] font-extrabold uppercase px-2 py-1 rounded-full border cursor-pointer ${
                              inq.status === 'New'
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : inq.status === 'Catalogue Sent'
                                ? 'bg-blue-100 text-blue-800 border-blue-300'
                                : inq.status === 'Quoted'
                                ? 'bg-purple-100 text-purple-800 border-purple-300'
                                : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            }`}
                          >
                            <option value="New">New Inquiry</option>
                            <option value="Catalogue Sent">Catalogue Sent</option>
                            <option value="Quoted">Quoted</option>
                            <option value="Approved">Approved</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                handleSelectInquiry(inq.id);
                                handleSendWhatsApp(inq.customerPhone, inq.customerName);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1.5 rounded-lg text-[11px] flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                              title="Send WhatsApp Catalogue Quotation"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </button>

                            <button
                              onClick={() => {
                                handleSelectInquiry(inq.id);
                                handleDownloadPdf();
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-2.5 py-1.5 rounded-lg text-[11px] flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                              title="Download PDF for this Client"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>PDF</span>
                            </button>

                            <button
                              onClick={() => deleteInquiry(inq.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete Inquiry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
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

      {/* VIEW 3: LIVE INTERACTIVE PREVIEW */}
      {activeSubView === 'preview' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                <span>Live Interactive A4 Catalogue Preview</span>
              </h3>
              <p className="text-xs text-slate-500">
                This shows exactly how your rate card will be structured when printed or sent as a PDF to the client.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handlePrint}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-4 h-4 text-blue-400" />
                <span>Print Document</span>
              </button>

              <button
                onClick={handleDownloadPdf}
                className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Save as PDF</span>
              </button>
            </div>
          </div>

          {/* Interactive Document Sheet (Simulated A4 Paper) */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-300 p-6 sm:p-10 space-y-6 text-slate-900">
            
            {/* Header */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl border-b-4 border-amber-500 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                  Official Printing & Branding Rate Card
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {wpSettings.siteTitle || 'Woodynat Designers Limited'}
              </h1>
              <p className="text-xs text-slate-300 font-medium">{catalogueTitle}</p>
              <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800 flex flex-wrap gap-x-4 gap-y-1">
                <span>📍 {wpSettings.companyAddress}, {wpSettings.companyCity}</span>
                <span>📞 WhatsApp: {wpSettings.whatsappNumber}</span>
                <span>✉️ {wpSettings.companyEmail}</span>
              </div>
            </div>

            {/* Recipient Box */}
            {(targetCustomerName || targetCompanyName) && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-1">
                <div className="font-extrabold text-slate-900 uppercase text-[11px] tracking-wider text-blue-700">
                  PROPOSAL & CATALOGUE PREPARED FOR:
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {targetCustomerName} {targetCompanyName ? `(${targetCompanyName})` : ''}
                </div>
                <div className="text-slate-600 text-[11px] flex gap-3 flex-wrap">
                  {targetCustomerPhone && <span>Phone: {targetCustomerPhone}</span>}
                  {targetCustomerEmail && <span>Email: {targetCustomerEmail}</span>}
                  {discountPercentage > 0 && (
                    <span className="font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      🎁 Special {discountPercentage}% Wholesale Discount Applied
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Products Table or Lookbook list */}
            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200">
              <div className="bg-slate-100 px-4 py-2.5 flex items-center justify-between text-xs font-black text-slate-700 uppercase tracking-wider">
                <span>Selected Items ({selectedProducts.length})</span>
                {showPrices && <span>Rate (KSh)</span>}
              </div>

              {selectedProducts.map((prod, idx) => {
                const discounted = discountPercentage > 0
                  ? Math.round(prod.price * (1 - discountPercentage / 100))
                  : prod.price;

                return (
                  <div key={prod.id} className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {showImages && (
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-14 h-14 rounded-lg object-cover border border-slate-200 bg-slate-50 shrink-0"
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded">
                            #{idx + 1}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">
                            {prod.category}
                          </span>
                          {prod.expressDeliveryAvailable && (
                            <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              24h Ready
                            </span>
                          )}
                        </div>
                        <h4 className="font-extrabold text-sm text-slate-900 mt-0.5">{prod.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{prod.description}</p>
                        
                        {showFeatures && prod.features && prod.features.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap mt-2">
                            {prod.features.slice(0, 3).map((f, fIdx) => (
                              <span key={fIdx} className="bg-slate-100 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded">
                                ✓ {f}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {showPrices && (
                      <div className="text-right shrink-0">
                        {prod.isQuoteOnly || prod.price === 0 ? (
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                            Quote on Inquiry
                          </span>
                        ) : (
                          <div>
                            <div className="text-base font-extrabold text-slate-900">
                              KSh {discounted.toLocaleString()}
                            </div>
                            {discountPercentage > 0 && (
                              <div className="text-xs text-slate-400 line-through">
                                KSh {prod.price.toLocaleString()}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Payment & Terms Section */}
            {showPaybillInfo && (
              <div className="bg-slate-100 border-l-4 border-amber-500 p-4 rounded-r-xl space-y-1.5 text-xs">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span>💳 M-PESA PAYMENT & PRODUCTION INSTRUCTIONS</span>
                </h4>
                <div className="text-slate-700">
                  1. Lipa na M-Pesa &gt; Paybill: <strong>{wpSettings.paybillNumber || '247247'}</strong>
                </div>
                <div className="text-slate-700">
                  2. Account Number: <strong>{wpSettings.paybillAccount || '0797939199'}</strong> (or your Job Reference)
                </div>
                <div className="text-slate-700">
                  3. Send transaction confirmation & logo files to WhatsApp: <strong>{wpSettings.whatsappNumber}</strong>
                </div>
              </div>
            )}

            {customNotes && (
              <div className="text-xs text-slate-600 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                <strong>Note:</strong> {customNotes}
              </div>
            )}

            {/* Document Footer */}
            <div className="text-center text-[10px] text-slate-400 pt-4 border-t border-slate-200">
              Woodynat Designers Limited • Gatkim Complex Building, Nairobi • Tel: {wpSettings.whatsappNumber} • Email: {wpSettings.companyEmail}
            </div>

          </div>
        </div>
      )}

      {/* MODAL: LOG NEW CUSTOMER INQUIRY */}
      {isNewInquiryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm">Log New Customer Inquiry</h4>
                  <span className="text-[10px] text-slate-400">Record client requirements for catalogue dispatch</span>
                </div>
              </div>
              <button
                onClick={() => setIsNewInquiryModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInquiry} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={newInqName}
                    onChange={(e) => setNewInqName(e.target.value)}
                    placeholder="e.g. Kennedy Omondi"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Phone / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={newInqPhone}
                    onChange={(e) => setNewInqPhone(e.target.value)}
                    placeholder="0712345678"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Company / Organization</label>
                  <input
                    type="text"
                    value={newInqCompany}
                    onChange={(e) => setNewInqCompany(e.target.value)}
                    placeholder="e.g. St. Peters Church"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={newInqEmail}
                    onChange={(e) => setNewInqEmail(e.target.value)}
                    placeholder="kennedy@gmail.com"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Product Category</label>
                  <select
                    value={newInqCategory}
                    onChange={(e) => setNewInqCategory(e.target.value as ProductCategory)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Estimated Qty (pcs)</label>
                  <input
                    type="number"
                    value={newInqQty}
                    onChange={(e) => setNewInqQty(Number(e.target.value))}
                    min={1}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Inquiry Subject / Topic</label>
                <input
                  type="text"
                  required
                  value={newInqTopic}
                  onChange={(e) => setNewInqTopic(e.target.value)}
                  placeholder="e.g. 100 Printed T-Shirts and 2 Roll-up Banners"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Notes & Specific Artwork Details</label>
                <textarea
                  rows={2}
                  value={newInqNotes}
                  onChange={(e) => setNewInqNotes(e.target.value)}
                  placeholder="e.g. Front & back screen printing, needs delivery in 3 days."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewInquiryModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs shadow-md transition-colors cursor-pointer"
                >
                  Save & Select Inquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Image Upload & Price Catalogue Edit Dialogue Box Modal */}
      {editingProductModal && (
        <AdminProductEditModal
          isOpen={Boolean(editingProductModal)}
          product={editingProductModal}
          isNew={isNewProductModal}
          categories={categories}
          onClose={() => {
            setEditingProductModal(null);
            setIsNewProductModal(false);
          }}
          onSave={(savedProduct) => {
            if (isNewProductModal) {
              addProduct(savedProduct);
              showToast('New Product Created! 🚀', `Published ${savedProduct.name} to live price catalogue.`);
            } else {
              updateProduct(savedProduct);
              showToast('Price Catalogue Updated! ✏️', `Saved changes and image for ${savedProduct.name}.`);
            }
            setEditingProductModal(null);
            setIsNewProductModal(false);
          }}
          showToast={showToast}
        />
      )}

    </div>
  );
};
