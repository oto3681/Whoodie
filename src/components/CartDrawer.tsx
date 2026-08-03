import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck, 
  FileCheck, 
  Sparkles,
  Truck
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const { cart, activeModal, setActiveModal, removeFromCart, updateCartQuantity } = useApp();

  if (activeModal !== 'cart') return null;

  const subtotal = cart.reduce((sum, item) => sum + item.calculatedPrice, 0);
  const freeShippingThreshold = 10000;
  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blue-400" />
            <h3 className="font-extrabold text-sm sm:text-base">Your Print Order Cart ({cart.length})</h3>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Delivery Meter */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 text-xs">
          <div className="flex justify-between font-bold text-slate-700 mb-1">
            <span className="flex items-center gap-1 text-slate-800">
              <Truck className="w-4 h-4 text-emerald-600" /> 
              {subtotal >= freeShippingThreshold 
                ? '🎉 You qualify for FREE Nationwide Delivery!' 
                : `Add KSh ${(freeShippingThreshold - subtotal).toLocaleString()} for Free Delivery`}
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressToFreeShipping}%` }}
            ></div>
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-800 text-base">Your Cart is Empty</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Explore our printed T-Shirts, Hoodies, Banners, Eulogies, and Branding services.
              </p>
              <button
                onClick={() => setActiveModal(null)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cart.map((item, index) => (
              <div 
                key={index} 
                className="bg-white border border-slate-200 rounded-xl p-3 flex gap-3 shadow-xs relative"
              >
                <img
                  src={item.product.image || 'https://images.unsplash.com/photo-1542744094-3a3172720177?w=800&auto=format&fit=crop&q=80'}
                  alt={item.product.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542744094-3a3172720177?w=800&auto=format&fit=crop&q=80';
                  }}
                  className="w-16 h-16 object-cover rounded-lg border border-slate-200 shrink-0"
                />

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex justify-between items-start gap-1">
                    <h5 className="text-xs font-bold text-slate-900 truncate">{item.product.name}</h5>
                    <button
                      onClick={() => removeFromCart(index)}
                      className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500 font-semibold">
                    Category: {item.product.category}
                  </p>

                  {/* Customization Badges */}
                  {item.customization && (
                    <div className="text-[10px] bg-slate-50 p-1.5 rounded-md border border-slate-200/80 text-slate-600 space-y-0.5">
                      {item.customization.selectedSize && (
                        <div><span className="font-bold text-slate-700">Size:</span> {item.customization.selectedSize}</div>
                      )}
                      {item.customization.selectedFinish && (
                        <div><span className="font-bold text-slate-700">Finish:</span> {item.customization.selectedFinish}</div>
                      )}
                      {item.customization.instructions && (
                        <div className="truncate"><span className="font-bold text-slate-700">Notes:</span> {item.customization.instructions}</div>
                      )}
                      {item.customization.fileName && (
                        <div className="text-emerald-700 font-bold flex items-center gap-1">
                          <FileCheck className="w-3 h-3" /> Artwork Attached
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quantity & Price */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                      <button
                        onClick={() => updateCartQuantity(index, item.quantity - 1)}
                        className="px-2 py-0.5 text-xs font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-2 text-xs font-bold text-slate-800">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(index, item.quantity + 1)}
                        className="px-2 py-0.5 text-xs font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <span className="text-xs font-extrabold text-slate-900">
                      KSh {item.calculatedPrice.toLocaleString()}
                    </span>
                  </div>

                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout Summary */}
        {cart.length > 0 && (
          <div className="bg-slate-900 text-white p-4 border-t border-slate-800 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal ({cart.length} items):</span>
                <span>KSh {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Estimated Delivery Fee:</span>
                <span>{subtotal >= freeShippingThreshold ? 'FREE' : 'KSh 300'}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-blue-400 pt-1 border-t border-slate-800">
                <span>Total Payable:</span>
                <span>KSh {(subtotal + (subtotal >= freeShippingThreshold ? 0 : 300)).toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveModal('checkout');
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer uppercase tracking-wider"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Secure Instant Payment via M-PESA Express
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
