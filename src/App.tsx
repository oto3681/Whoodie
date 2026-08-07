import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { BannerNotice } from './components/BannerNotice';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { WhatsAppWidget } from './components/WhatsAppWidget';
import { ToastContainer } from './components/ToastContainer';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTracker } from './components/OrderTracker';
import { CustomerFeedback } from './components/CustomerFeedback';
import { SocialFeeds } from './components/SocialFeeds';
import { AuthModal } from './components/AuthModal';
import { PriceCatalogueModal } from './components/PriceCatalogueModal';
import { UserDashboard } from './components/UserDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { RegistrationGate } from './components/RegistrationGate';
import { 
  Zap, 
  Clock, 
  Sparkles, 
  Shirt, 
  Flag, 
  FileText, 
  Award, 
  Video, 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  Search,
  MessageCircle,
  Truck
} from 'lucide-react';
import { ProductCategory } from './types';

const ShopContent: React.FC = () => {
  const { 
    products, 
    selectedCategory, 
    setSelectedCategory, 
    searchQuery, 
    wpSettings, 
    setActiveModal, 
    activeView, 
    currentUser,
    isGuestBrowsing
  } = useApp();

  // Filter products by selectedCategory & searchQuery
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Countdown timer for Flash Sale
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!currentUser && !isGuestBrowsing) {
    return <RegistrationGate />;
  }

  if (activeView === 'dashboard' && currentUser) {
    return <UserDashboard />;
  }

  if (activeView === 'admin' && currentUser?.role === 'admin') {
    return <AdminDashboard />;
  }

  if (activeView === 'reviews') {
    return <CustomerFeedback />;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      
      {/* HIGH-CONVERSION E-COMMERCE HERO BANNER & PROMO CAROUSEL */}
      {selectedCategory === 'All' && !searchQuery && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Left Category Quick Navigation Menu */}
            <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 p-3 shadow-xs space-y-1">
              <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider px-3 py-1 block">
                Top Categories
              </span>
              {[
                { name: 'Printed T-Shirts', icon: Shirt },
                { name: 'Hoodies', icon: Layers },
                { name: 'Reflectors & Aprons', icon: Award },
                { name: 'Banners & Stickers', icon: Flag },
                { name: 'Branding & Signage', icon: Sparkles },
                { name: 'Flyers & Posters', icon: FileText },
                { name: 'Eulogies & Memorials', icon: Clock }
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => setSelectedCategory(item.name as ProductCategory)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                    selectedCategory === item.name
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <item.icon className="w-3.5 h-3.5" />
                    <span>{item.name}</span>
                  </span>
                  <span className={selectedCategory === item.name ? 'text-white font-bold' : 'text-slate-400'}>→</span>
                </button>
              ))}
            </div>

            {/* Central Main Promo Card */}
            <div className="lg:col-span-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[380px] border border-blue-500">
              
              {/* Decorative Background Artwork */}
              <div className="absolute -right-10 -bottom-10 opacity-15 pointer-events-none">
                <Shirt className="w-96 h-96 text-white" />
              </div>

              {/* Flash Badge */}
              <div className="flex flex-wrap items-center gap-3 z-10">
                <span className="bg-white text-blue-600 text-xs font-black px-3 py-1 rounded-lg flex items-center gap-1 shadow-md uppercase tracking-wider">
                  <Zap className="w-3.5 h-3.5 fill-blue-600" /> MEGA FLASH SALE
                </span>

                <div className="bg-blue-800/60 backdrop-blur-xs text-white text-xs font-mono font-bold px-3 py-1 rounded-lg border border-blue-300/40 flex items-center gap-1.5 shadow-xs">
                  <Clock className="w-3.5 h-3.5 text-blue-200" />
                  <span>Ends In: {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s</span>
                </div>
              </div>

              {/* Main Headline & Subheadline */}
              <div className="max-w-xl space-y-3 z-10 my-4">
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-snug drop-shadow-xs">
                  {wpSettings.heroHeadline}
                </h1>
                <p className="text-xs sm:text-sm text-blue-50 font-medium leading-relaxed drop-shadow-xs">
                  {wpSettings.heroSubheadline}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 z-10">
                <button
                  onClick={() => setActiveModal('catalogue')}
                  className="bg-slate-900 hover:bg-slate-950 text-white font-black px-6 py-3 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span>View Full Price Catalogue</span>
                  <ArrowRight className="w-4 h-4 text-blue-400" />
                </button>

                <button
                  onClick={() => setSelectedCategory('Printed T-Shirts')}
                  className="bg-blue-800/80 hover:bg-blue-800 text-white font-bold px-5 py-3 rounded-xl text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-md border border-blue-400/30"
                >
                  <span>Explore Bulk Deals</span>
                </button>

                <button
                  onClick={() => setActiveModal('track')}
                  className="bg-white hover:bg-blue-50 text-slate-900 font-bold px-5 py-3 rounded-xl text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-md"
                >
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>Track Order</span>
                </button>
              </div>

            </div>

          </div>
        </section>
      )}

      {/* 24-HOUR EXPRESS EULOGY & MEMORIALS SPOTLIGHT BANNER */}
      {selectedCategory === 'All' && !searchQuery && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border-2 border-blue-600 text-slate-900 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="space-y-2 text-center md:text-left z-10">
              <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider inline-block shadow-xs">
                ⚡ 24-Hour Express Emergency Service
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                Funeral Program Booklets, Tribute Books & Eulogies
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl font-medium">
                Respectful, dignified funeral service programs designed & printed in 24 hours with express overnight delivery nationwide. Free digital photo restoration included.
              </p>
            </div>

            <button
              onClick={() => setSelectedCategory('Eulogies & Memorials')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3.5 rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all shrink-0 cursor-pointer z-10"
            >
              <span>Order Eulogies Online</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* PRODUCTS DISPLAY CATALOG GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Catalog Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>{selectedCategory === 'All' ? 'Featured Products & Printing Packages' : selectedCategory}</span>
              <span className="text-xs font-bold text-slate-500 bg-slate-200 px-2.5 py-0.5 rounded-full">
                {filteredProducts.length} items
              </span>
            </h2>
            {searchQuery && (
              <p className="text-xs text-slate-500 mt-1">
                Showing search results for: "<span className="font-bold text-blue-600">{searchQuery}</span>"
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Sort by:</span>
            <select className="bg-white border border-slate-300 rounded-lg p-1.5 font-semibold text-slate-800 focus:outline-none">
              <option>Popularity & Flash Deals</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Top Customer Rated</option>
            </select>
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center space-y-3">
            <Search className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="font-bold text-slate-800 text-base">No Products Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try searching for another keyword or change the category filter above.
            </p>
            <button
              onClick={() => { setSelectedCategory('All'); }}
              className="bg-blue-600 text-white font-bold px-4 py-2 rounded-xl text-xs"
            >
              View All Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </section>

      {/* CUSTOMER FEEDBACK & TRUST SECTION */}
      {selectedCategory === 'All' && !searchQuery && <CustomerFeedback />}

      {/* SOCIAL MEDIA SHOWCASE FEEDS */}
      {selectedCategory === 'All' && !searchQuery && <SocialFeeds />}

    </main>
  );
};

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col justify-between">
        <BannerNotice />
        <Header />
        <ShopContent />
        <Footer />
        
        {/* Modals & Overlays */}
        <ProductDetailModal />
        <PriceCatalogueModal />
        <CartDrawer />
        <CheckoutModal />
        <OrderTracker />
        <AuthModal />

        {/* Widgets */}
        <WhatsAppWidget />
        <ToastContainer />
      </div>
    </AppProvider>
  );
}
