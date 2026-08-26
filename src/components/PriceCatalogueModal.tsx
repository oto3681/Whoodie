import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCategory, Product } from '../types';
import { getProductFallbackImage } from '../data/initialData';
import { generateCataloguePdf, openPrintableCatalogueWindow } from '../utils/cataloguePdfGenerator';
import { 
  X, 
  Search, 
  FileText, 
  Printer, 
  Download,
  MessageCircle, 
  Zap, 
  CheckCircle2, 
  ShoppingBag, 
  Sparkles,
  PhoneCall,
  ArrowRight,
  Clock,
  ShieldCheck
} from 'lucide-react';

export const PriceCatalogueModal: React.FC = () => {
  const { 
    products, 
    activeModal, 
    setActiveModal, 
    setSelectedProductForDetail, 
    wpSettings,
    showToast
  } = useApp();

  const [catalogueSearch, setCatalogueSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<ProductCategory>('All');

  if (activeModal !== 'catalogue') return null;

  const rawPhone = wpSettings.whatsappNumber.replace(/[^0-9]/g, '');
  const cleanPhone = rawPhone.startsWith('0') ? '254' + rawPhone.slice(1) : rawPhone;

  // Filter products for catalogue
  const filteredCatalogue = products.filter((p) => {
    const matchesCat = selectedCat === 'All' || p.category === selectedCat;
    const matchesSearch = catalogueSearch === '' || 
      p.name.toLowerCase().includes(catalogueSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(catalogueSearch.toLowerCase()) ||
      p.description.toLowerCase().includes(catalogueSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const categories: ProductCategory[] = [
    'All',
    'Printed T-Shirts',
    'Hoodies',
    'Reflectors & Aprons',
    'Banners & Stickers',
    'Branding & Signage',
    'Flyers & Posters',
    'Eulogies & Memorials'
  ];

  const handlePrint = () => {
    openPrintableCatalogueWindow(filteredCatalogue, {
      title: 'Woodynat Designers Limited - Official Product Catalogue & Rates 2026',
      layoutStyle: 'table',
      showPrices: true,
      showImages: true,
      showFeatures: true,
      showPaybillInfo: true,
      showTerms: true
    }, wpSettings);
  };

  const handleDownloadPdf = () => {
    generateCataloguePdf(filteredCatalogue, {
      title: 'Woodynat Designers Limited - Official Rate Card & Product Catalogue 2026',
      subtitle: selectedCat !== 'All' ? `Category: ${selectedCat}` : 'Complete Commercial Printing & Branding Rate Card',
      layoutStyle: 'table',
      showPrices: true,
      showImages: true,
      showFeatures: true,
      showPaybillInfo: true,
      showTerms: true
    }, wpSettings);
    showToast('PDF Catalogue Downloaded 📄', `Downloaded Woodynat catalogue with ${filteredCatalogue.length} items.`);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Official Rate Card 2026
                </span>
                <span className="text-emerald-400 text-[10px] font-extrabold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Live Prices Updated
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-extrabold text-white tracking-tight">
                Woodynat Price Catalogue & Printing Rates
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              title="Download PDF Rate Card"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="hidden sm:flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              title="Print Price Catalogue"
            >
              <Printer className="w-4 h-4 text-blue-400" />
              <span>Print</span>
            </button>
            <button
              onClick={() => setActiveModal(null)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search items, prices, banners, mugs..."
                value={catalogueSearch}
                onChange={(e) => setCatalogueSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              {catalogueSearch && (
                <button 
                  onClick={() => setCatalogueSearch('')}
                  className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs font-bold cursor-pointer"
                >
                  ×
                </button>
              )}
            </div>

            {/* Quick Contact Header */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <a
                href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent('Hi Woodynat Designers Limited! Please send me your complete PDF Price Catalogue & Custom Wholesale Quotation.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Get PDF via WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1 pb-0.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedCat === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Catalogue Body Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 bg-slate-100/50 dark:bg-slate-950">
          
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Showing <strong className="text-slate-900 dark:text-white">{filteredCatalogue.length} items</strong> in price catalogue</span>
            <span className="hidden sm:inline">All item photos are live and updated</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredCatalogue.map((item) => {
              const isQuote = item.isQuoteOnly || item.price === 0;

              return (
                <div 
                  key={item.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
                >
                  {/* Item Image */}
                  <div 
                    onClick={() => {
                      setSelectedProductForDetail(item);
                      setActiveModal('product-detail');
                    }}
                    className="relative bg-slate-100 dark:bg-slate-800 aspect-16/10 overflow-hidden cursor-pointer"
                  >
                    <img
                      src={item.image || getProductFallbackImage(item.name, item.category)}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = getProductFallbackImage(item.name, item.category);
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                      <span className="bg-slate-900/90 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider backdrop-blur-xs">
                        {item.category}
                      </span>
                    </div>

                    {item.isFlashDeal && (
                      <span className="absolute top-2.5 right-2.5 bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1 uppercase tracking-wider">
                        <Zap className="w-3 h-3 fill-white" /> FLASH DEAL
                      </span>
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 
                        onClick={() => {
                          setSelectedProductForDetail(item);
                          setActiveModal('product-detail');
                        }}
                        className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer mb-2"
                      >
                        {item.name}
                      </h3>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                        {item.description}
                      </p>

                      {/* Features */}
                      <ul className="space-y-1 mb-4">
                        {item.features.slice(0, 3).map((f, i) => (
                          <li key={i} className="text-[11px] text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span className="truncate">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Price & Action */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block uppercase tracking-wider">Catalog Rate:</span>
                        <div className="font-black text-slate-900 dark:text-white text-sm sm:text-base">
                          {isQuote ? (
                            <span className="text-blue-600 dark:text-blue-400 text-xs sm:text-sm">WhatsApp Quote</span>
                          ) : (
                            <span className="text-emerald-700 dark:text-emerald-400">KSh {item.price.toLocaleString()}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedProductForDetail(item);
                            setActiveModal('product-detail');
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center gap-1"
                        >
                          <span>Order</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-900 text-slate-300 p-4 sm:p-5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-400 text-center sm:text-left">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Woodynat Designers Limited • All prices inclusive of high quality materials & custom proofing.</span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors cursor-pointer"
            >
              Close Catalogue
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
