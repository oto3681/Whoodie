import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Logo } from './Logo';
import { 
  Search, 
  ShoppingBag, 
  MessageCircle,
  Package, 
  LayoutDashboard, 
  Menu, 
  X, 
  CheckCircle,
  Settings,
  LogOut,
  User,
  FileText
} from 'lucide-react';
import { ProductCategory } from '../types';

export const Header: React.FC = () => {
  const { 
    wpSettings, 
    searchQuery, 
    setSearchQuery, 
    categories, 
    selectedCategory, 
    setSelectedCategory,
    cart, 
    currentUser, 
    logout,
    setActiveModal, 
    activeView, 
    setActiveView 
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const rawPhone = wpSettings.whatsappNumber.replace(/[^0-9]/g, '');
  const cleanPhone = rawPhone.startsWith('0') ? '254' + rawPhone.slice(1) : rawPhone;

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Official WoodyNat Logo & Brand Name */}
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => { setActiveView('shop'); setSelectedCategory('All'); }}
              className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
              title="WoodyNat Designers Limited"
            >
              <Logo variant="compact" size="md" />
            </button>
          </div>

          {/* Jumia-Style Central Search & Category Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-2xl mx-4">
            <div className="flex w-full rounded-xl border-2 border-blue-600 bg-white focus-within:ring-2 focus-within:ring-blue-200 transition-all overflow-hidden shadow-xs">
              
              {/* Category Selector Dropdown inside Search */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as ProductCategory)}
                className="bg-slate-50 text-slate-700 text-xs font-bold px-3 py-2.5 border-r border-slate-200 focus:outline-none cursor-pointer max-w-[160px] truncate"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* Search Input */}
              <div className="relative flex-1 flex items-center">
                <input
                  type="text"
                  placeholder="Search T-Shirts, Hoodies, Banners, Eulogies, Stickers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs sm:text-sm text-slate-900 placeholder-slate-400 pl-3 pr-8 py-2.5 bg-transparent focus:outline-none"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Search Submit Button */}
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 flex items-center justify-center font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer">
                <Search className="w-4 h-4 mr-1" /> SEARCH
              </button>
            </div>
          </div>

          {/* Actions & Utilities */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* WhatsApp Direct Inquiry Button */}
            <a
              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent("Hi Woodynat Designers Limited! I would like to inquire about custom design & printing pricing.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 px-3 py-2 rounded-xl transition-colors"
            >
              <MessageCircle className="w-4 h-4 fill-emerald-600 text-emerald-50" />
              <span>WhatsApp Inquiry</span>
            </a>

            {/* Price Catalogue Button */}
            <button
              onClick={() => setActiveModal('catalogue')}
              className="hidden md:flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 px-3 py-2 rounded-xl transition-colors cursor-pointer shadow-2xs"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Price Catalogue</span>
            </button>

            {/* Tracking Button */}
            <button
              onClick={() => setActiveModal('track')}
              className="hidden md:flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-blue-600 px-2.5 py-2 rounded-xl hover:bg-blue-50 transition-colors cursor-pointer"
            >
              <Package className="w-4 h-4 text-blue-600" />
              <span>Track Order</span>
            </button>

            {/* If user logged in, show quick Account/Admin badge */}
            {currentUser ? (
              <div className="hidden md:flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setActiveView(currentUser.role === 'admin' ? 'admin' : 'dashboard')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeView === 'dashboard' || activeView === 'admin'
                      ? 'bg-slate-900 text-blue-400 shadow-xs' 
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  {currentUser.role === 'admin' ? (
                    <>
                      <Settings className="w-3.5 h-3.5" /> Admin
                    </>
                  ) : (
                    <>
                      <LayoutDashboard className="w-3.5 h-3.5" /> Account
                    </>
                  )}
                </button>

                <button
                  onClick={logout}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-extrabold text-red-600 hover:bg-red-50 border border-red-200 flex items-center gap-1 transition-all cursor-pointer"
                  title="Log Out of Account"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveModal('login')}
                className="hidden sm:flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-3.5 py-2 rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
              >
                <User className="w-3.5 h-3.5" />
                <span>Register / Sign In</span>
              </button>
            )}

            {/* Cart Button */}
            <button
              onClick={() => setActiveModal('cart')}
              className="relative bg-blue-600 hover:bg-blue-700 text-white font-extrabold p-2.5 sm:px-4 sm:py-2.5 rounded-xl flex items-center gap-2 transition-transform active:scale-95 shadow-md cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="hidden sm:inline text-xs uppercase tracking-wider">Cart</span>
              {cartItemsCount > 0 && (
                <span className="bg-white text-blue-600 text-xs font-black w-5 h-5 rounded-full flex items-center justify-center border border-blue-200 shadow-xs">
                  {cartItemsCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="lg:hidden pb-3">
          <div className="flex w-full rounded-xl border-2 border-blue-600 bg-white focus-within:bg-white overflow-hidden shadow-xs">
            <input
              type="text"
              placeholder="Search T-Shirts, Hoodies, Banners, Eulogies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs text-slate-900 px-3 py-2 bg-transparent focus:outline-none"
            />
            <button className="bg-blue-600 text-white px-3 flex items-center justify-center font-bold">
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills Navigation Bar */}
      <div className="bg-slate-100/80 border-t border-b border-slate-200 overflow-x-auto scrollbar-none py-2 px-4 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-start lg:justify-center gap-2 whitespace-nowrap min-w-max">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setActiveView('shop');
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 p-4 space-y-3 shadow-lg">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Navigation Menu
          </div>
          <button
            onClick={() => { setActiveView('shop'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 text-sm font-semibold text-slate-800 border-b border-slate-100 flex items-center justify-between"
          >
            <span>Browse Products</span>
            {activeView === 'shop' && <CheckCircle className="w-4 h-4 text-blue-600" />}
          </button>
          <button
            onClick={() => { setActiveModal('catalogue'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 text-sm font-semibold text-blue-600 font-bold border-b border-slate-100 flex items-center justify-between"
          >
            <span>Price Catalogue & Rate Card</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </button>
          <button
            onClick={() => { setActiveView('reviews'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 text-sm font-semibold text-slate-800 border-b border-slate-100 flex items-center justify-between"
          >
            <span>Customer Reviews</span>
            {activeView === 'reviews' && <CheckCircle className="w-4 h-4 text-blue-600" />}
          </button>
          <button
            onClick={() => { setActiveModal('track'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 text-sm font-semibold text-slate-800 border-b border-slate-100 flex items-center justify-between"
          >
            <span>Track My Order</span>
            <Package className="w-4 h-4 text-slate-400" />
          </button>
          
          <div className="pt-2 flex flex-col gap-2">
            {!currentUser ? (
              <button
                onClick={() => { setActiveModal('login'); setMobileMenuOpen(false); }}
                className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs text-center"
              >
                Sign In / Register
              </button>
            ) : (
              <button
                onClick={() => { 
                  setActiveView(currentUser.role === 'admin' ? 'admin' : 'dashboard'); 
                  setMobileMenuOpen(false); 
                }}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold text-center transition-colors shadow-xs"
              >
                Go to {currentUser.role === 'admin' ? 'Admin Console' : 'User Dashboard'}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
