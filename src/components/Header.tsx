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
  FileText,
  Sun,
  Moon
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
    setActiveView,
    theme,
    toggleTheme
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const rawPhone = wpSettings.whatsappNumber.replace(/[^0-9]/g, '');
  const cleanPhone = rawPhone.startsWith('0') ? '254' + rawPhone.slice(1) : rawPhone;

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors duration-200">
      {/* Main Centered Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-3">
        
        {/* 3-Column Balanced Layout: Left Links | EXACT MIDDLE CENTER LOGO | Right Actions */}
        <div className="grid grid-cols-3 items-center gap-2 sm:gap-4 w-full">
          
          {/* Column 1: Left Quick Links */}
          <div className="flex items-center justify-start gap-1.5 sm:gap-2">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer"
              title="Open Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* WhatsApp Direct Inquiry Button */}
            <a
              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent("Hi Woodynat Designers Limited! I would like to inquire about custom design & printing pricing.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 px-3 py-2 rounded-xl transition-colors shrink-0"
            >
              <MessageCircle className="w-4 h-4 fill-emerald-600 dark:fill-emerald-400 text-emerald-50 dark:text-slate-900" />
              <span>WhatsApp Inquiry</span>
            </a>

            {/* Price Catalogue Button */}
            <button
              onClick={() => {
                if (!currentUser) {
                  setActiveModal('login');
                } else {
                  setActiveModal('catalogue');
                }
              }}
              className="hidden md:flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-3 py-2 rounded-xl transition-colors cursor-pointer shadow-2xs shrink-0"
            >
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Price Catalogue</span>
            </button>

            {/* Tracking Button */}
            <button
              onClick={() => {
                if (!currentUser) {
                  setActiveModal('login');
                } else {
                  setActiveModal('track');
                }
              }}
              className="hidden xl:flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 px-2.5 py-2 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            >
              <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Track Order</span>
            </button>
          </div>

          {/* Column 2: EXACT MIDDLE CENTER LOGO (ENLARGED) */}
          <div className="flex items-center justify-center text-center my-auto py-1">
            <button 
              onClick={() => { setActiveView('shop'); setSelectedCategory('All'); }}
              className="flex flex-col items-center justify-center text-center group cursor-pointer focus:outline-none"
              title="WoodyNat Designers Limited - Your Reliable Partner in Design and Branding"
            >
              <Logo variant={theme === 'dark' ? 'white' : 'full'} size="xl" className="mx-auto transition-transform hover:scale-105" />
            </button>
          </div>

          {/* Column 3: Right Actions & Cart */}
          <div className="flex items-center justify-end gap-2 sm:gap-3 shrink-0">
            
            {/* Theme Toggle Button (Light / Dark Mode) */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-700 dark:text-amber-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-2xs flex items-center justify-center"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 fill-amber-400/20 animate-spin-slow" />
              ) : (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
              )}
            </button>

            {/* User Account or Admin Console */}
            {currentUser ? (
              <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setActiveView(currentUser.role === 'admin' ? 'admin' : 'dashboard')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeView === 'dashboard' || activeView === 'admin'
                      ? 'bg-slate-900 dark:bg-blue-600 text-blue-400 dark:text-white shadow-xs' 
                      : 'text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white'
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
                  className="px-2 py-1.5 rounded-lg text-xs font-extrabold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center gap-1 transition-all cursor-pointer"
                  title="Log Out of Account"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Log Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveModal('login')}
                className="hidden sm:flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Register / Sign In</span>
                <span className="md:hidden">Sign In</span>
              </button>
            )}

            {/* Cart Button */}
            <button
              onClick={() => {
                if (!currentUser) {
                  setActiveModal('login');
                } else {
                  setActiveModal('cart');
                }
              }}
              className="relative bg-blue-600 hover:bg-blue-700 text-white font-extrabold p-2 sm:px-3.5 sm:py-2 rounded-xl flex items-center gap-1.5 transition-transform active:scale-95 shadow-md cursor-pointer shrink-0"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline text-xs uppercase tracking-wider">Cart</span>
              {cartItemsCount > 0 && (
                <span className="bg-white text-blue-600 text-xs font-black w-5 h-5 rounded-full flex items-center justify-center border border-blue-200 shadow-xs">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Central Search & Category Selector Bar */}
        <div className="max-w-3xl mx-auto w-full">
          <div className="flex w-full rounded-xl border-2 border-blue-600 bg-white dark:bg-slate-800 focus-within:ring-2 focus-within:ring-blue-200 dark:focus-within:ring-blue-900 transition-all overflow-hidden shadow-xs">
            
            {/* Category Selector Dropdown inside Search */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as ProductCategory)}
              className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold px-3 py-2.5 border-r border-slate-200 dark:border-slate-700 focus:outline-none cursor-pointer max-w-[160px] truncate hidden sm:block"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="dark:bg-slate-800 dark:text-slate-200">
                  {cat}
                </option>
              ))}
            </select>

            {/* Search Input */}
            <div className="relative flex-1 flex items-center">
              <input
                type="text"
                placeholder="Search T-Shirts, Hoodies, Caps, Banners, Eulogies, Stickers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 pl-3 pr-8 py-2.5 bg-transparent focus:outline-none"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 text-xs font-bold cursor-pointer"
                >
                  ×
                </button>
              )}
            </div>

            {/* Search Submit Button */}
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 sm:px-6 flex items-center justify-center font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shrink-0">
              <Search className="w-4 h-4 mr-1" /> <span className="hidden sm:inline">SEARCH</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills Navigation Bar */}
      <div className="bg-slate-100/80 dark:bg-slate-800/80 border-t border-b border-slate-200 dark:border-slate-700/80 overflow-x-auto scrollbar-none py-2 px-4 shadow-2xs">
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
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-slate-600 hover:text-blue-600 dark:hover:text-white'
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
        <div className="lg:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Navigation Menu
            </span>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-700" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>
          </div>
          <button
            onClick={() => { setActiveView('shop'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between"
          >
            <span>Browse Products</span>
            {activeView === 'shop' && <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
          </button>
          <button
            onClick={() => { 
              if (!currentUser) {
                setActiveModal('login');
              } else {
                setActiveModal('catalogue');
              }
              setMobileMenuOpen(false); 
            }}
            className="w-full text-left py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 font-bold border-b border-slate-100 dark:border-slate-800 flex items-center justify-between"
          >
            <span>Price Catalogue & Rate Card</span>
            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </button>
          <button
            onClick={() => { setActiveView('reviews'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between"
          >
            <span>Customer Reviews</span>
            {activeView === 'reviews' && <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
          </button>
          <button
            onClick={() => { 
              if (!currentUser) {
                setActiveModal('login');
              } else {
                setActiveModal('track');
              }
              setMobileMenuOpen(false); 
            }}
            className="w-full text-left py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between"
          >
            <span>Track My Order</span>
            <Package className="w-4 h-4 text-slate-400" />
          </button>
          
          <div className="pt-2 flex flex-col gap-2">
            {!currentUser ? (
              <button
                onClick={() => { setActiveModal('login'); setMobileMenuOpen(false); }}
                className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs text-center cursor-pointer"
              >
                Sign In / Register
              </button>
            ) : (
              <button
                onClick={() => { 
                  setActiveView(currentUser.role === 'admin' ? 'admin' : 'dashboard'); 
                  setMobileMenuOpen(false); 
                }}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold text-center transition-colors shadow-xs cursor-pointer"
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
