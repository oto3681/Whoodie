import React from 'react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { Star, Zap, Clock, ShoppingCart, MessageCircle, FileUp, ShieldCheck } from 'lucide-react';
import { getProductFallbackImage } from '../data/initialData';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { setSelectedProductForDetail, setActiveModal, addToCart, wpSettings } = useApp();

  const rawPhone = wpSettings.whatsappNumber.replace(/[^0-9]/g, '');
  const cleanPhone = rawPhone.startsWith('0') ? '254' + rawPhone.slice(1) : rawPhone;

  const discountPercent = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  const isTShirt = product.category === 'Printed T-Shirts' || 
    product.name.toLowerCase().includes('t-shirt') || 
    product.name.toLowerCase().includes('tshirt') || 
    product.name.toLowerCase().includes('polo') ||
    product.name.toLowerCase().includes('shirt');

  const isRollUpBanner = product.id === 'prod-rollup-banner' || 
    product.name.toLowerCase().includes('roll-up') || 
    product.name.toLowerCase().includes('rollup');

  const isReflector = product.id === 'prod-lightweight-reflectors' || 
    product.name.toLowerCase().includes('reflector');

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group relative">
      
      {/* Product Image & Badges */}
      <div 
        onClick={() => {
          setSelectedProductForDetail(product);
          setActiveModal('product-detail');
        }}
        className="relative bg-slate-100 aspect-4/3 overflow-hidden cursor-pointer"
      >
        <img
          src={product.image || getProductFallbackImage(product.name, product.category)}
          alt={product.name}
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = getProductFallbackImage(product.name, product.category);
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Top Floating Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.isFlashDeal && (
            <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1 uppercase tracking-wider">
              <Zap className="w-3 h-3 fill-white" /> FLASH SALE
            </span>
          )}
        </div>

        {/* Top Right Price & Discount Badge */}
        <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1 z-10">
          <span className="bg-slate-900/90 text-white text-[11px] font-black px-2.5 py-1 rounded-md shadow-md border border-slate-700/50 flex items-center gap-1.5">
            {product.isQuoteOnly || product.price === 0 
              ? 'WhatsApp Quote' 
              : `KSh ${product.price.toLocaleString()}`}
            <span className="bg-blue-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
              Bulk Production
            </span>
          </span>
          {discountPercent > 0 && (
            <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
              -{discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Custom Artwork Overlay Badge */}
        <div className="absolute bottom-2 left-2 right-2 bg-slate-900/85 backdrop-blur-xs text-blue-300 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="flex items-center gap-1">
            <FileUp className="w-3 h-3 text-blue-300" /> Upload Artwork / Logo
          </span>
          <span className="text-white text-[9px]">View Details →</span>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category Pill */}
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md inline-block mb-1 border border-blue-100">
            {product.category}
          </span>

          {/* Name */}
          <h3 
            onClick={() => {
              setSelectedProductForDetail(product);
              setActiveModal('product-detail');
            }}
            className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 hover:text-blue-600 cursor-pointer leading-snug mb-1.5"
          >
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              <span className="text-xs font-bold text-slate-800 ml-1">{product.rating.toFixed(1)}</span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">({product.reviewCount} ratings)</span>
          </div>

          {/* Price Display */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {product.isQuoteOnly || product.price === 0 ? (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                  {product.priceDisplay || 'Ask for Quote via WhatsApp'}
                </span>
                <span className="text-[10px] font-black text-blue-700 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-md uppercase tracking-wide inline-flex items-center">
                  Bulk Production
                </span>
              </div>
            ) : (
              <>
                <span className="text-base sm:text-lg font-black text-slate-900">
                  KSh {product.price.toLocaleString()}
                </span>
                <span className="text-[10px] font-black text-blue-700 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-md uppercase tracking-wide inline-flex items-center">
                  Bulk Production
                </span>
                {product.originalPrice && (
                  <span className="text-xs text-slate-400 line-through font-medium">
                    KSh {product.originalPrice.toLocaleString()}
                  </span>
                )}
              </>
            )}
          </div>

          {/* Roll-Up Banner Price Breakdown */}
          {isRollUpBanner && (
            <div className="w-full mb-2.5 p-2 bg-blue-50/90 border border-blue-200/80 rounded-xl flex flex-col gap-1 text-[11px] shadow-2xs">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span className="text-slate-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  Light weight:
                </span>
                <span className="text-blue-600 font-extrabold">KSh 6,500</span>
              </div>
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span className="text-slate-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-700"></span>
                  Heavy weight:
                </span>
                <span className="text-blue-600 font-extrabold">KSh 8,500</span>
              </div>
            </div>
          )}

          {/* Reflector Price Breakdown */}
          {isReflector && (
            <div className="w-full mb-2.5 p-2 bg-emerald-50/90 border border-emerald-200/80 rounded-xl flex flex-col gap-1 text-[11px] shadow-2xs">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span className="text-slate-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Light weight:
                </span>
                <span className="text-emerald-700 font-extrabold">KSh 350</span>
              </div>
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span className="text-slate-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  Heavy weight:
                </span>
                <span className="text-emerald-700 font-extrabold">Ask for a quote</span>
              </div>
            </div>
          )}

          {/* Stock Meter */}
          <div className="mb-3">
            <div className="flex justify-between text-[10px] font-semibold text-slate-500 mb-1">
              <span>In Stock: {product.stockCount} items</span>
              <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                <ShieldCheck className="w-3 h-3" /> Verified Print
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-blue-600 h-full rounded-full" 
                style={{ width: `${Math.min(100, (product.stockCount / 500) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-100">
          {product.isQuoteOnly || product.price === 0 ? (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setSelectedProductForDetail(product);
                  setActiveModal('product-detail');
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-2 rounded-xl text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-xs"
              >
                <span>Details / Proof</span>
              </button>
              <a
                href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hi Woodynat Designers Limited! Please give me a quote for ${product.name}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2 px-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-white text-emerald-600 shrink-0" />
                <span>Ask Quote</span>
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setSelectedProductForDetail(product);
                  setActiveModal('product-detail');
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-2 px-2 rounded-xl text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-xs"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>ADD TO CART</span>
              </button>

              <a
                href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hi Woodynat Designers Limited! I would like to inquire about ${product.name} (Price: KSh ${product.price.toLocaleString()}).`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold py-2 px-2 rounded-xl text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-emerald-600 text-emerald-50" />
                <span>Inquire</span>
              </a>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
