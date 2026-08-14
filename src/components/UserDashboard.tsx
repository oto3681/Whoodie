import React from 'react';
import { useApp } from '../context/AppContext';
import { OrderStatus } from '../types';
import { getProductFallbackImage } from '../data/initialData';
import { 
  Package, 
  Truck, 
  Clock, 
  CheckCircle2, 
  FileCheck, 
  ShoppingBag, 
  User, 
  Phone, 
  MapPin, 
  LogOut, 
  Sparkles 
} from 'lucide-react';

export const UserDashboard: React.FC = () => {
  const { currentUser, orders, logout, setActiveModal, setActiveTrackingId } = useApp();

  if (!currentUser) return null;

  // Filter orders for logged-in user or general mock orders
  const myOrders = orders.filter((o) => o.userId === currentUser.id || o.userId === 'user-01' || o.customerName.includes('Kiprono') || o.customerName.includes('John'));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Banner Profile Summary */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={currentUser.name}
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
            }}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">{currentUser.name}</h2>
              <span className="bg-blue-600/80 text-blue-200 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border border-blue-400/40">
                Verified Client
              </span>
              {currentUser.provider === 'google' && (
                <span className="bg-red-500/20 text-red-300 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border border-red-500/40 flex items-center gap-1">
                  <span>✉️ Signed in via Gmail</span>
                </span>
              )}
              {currentUser.provider === 'facebook' && (
                <span className="bg-[#1877F2]/30 text-blue-200 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border border-blue-400/40 flex items-center gap-1">
                  <span>🌐 Signed in via Facebook</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-1 flex items-center gap-3">
              <span>✉️ {currentUser.email}</span>
              <span>📞 {currentUser.phone}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-stretch md:self-auto">
          <button
            onClick={() => setActiveModal('track')}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors cursor-pointer"
          >
            <Package className="w-4 h-4" />
            <span>Track Order Status</span>
          </button>

          <button
            onClick={logout}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Orders Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" /> My Orders & Print Jobs ({myOrders.length})
          </h3>
          <span className="text-xs text-slate-500 font-medium">Real-time status synced</span>
        </div>

        {myOrders.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-12 text-center space-y-3">
            <ShoppingBag className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">No Active Orders Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">Place your order for T-Shirts, Hoodies, Eulogies, or Banners online with M-Pesa checkout!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myOrders.map((ord) => (
              <div 
                key={ord.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 hover:border-blue-300 transition-colors"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Tracking Code:
                    </span>
                    <span className="text-sm font-mono font-extrabold text-blue-600">{ord.id}</span>
                    <span className="text-xs text-slate-400 ml-2">({ord.createdAt})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold text-xs px-3 py-1 rounded-full flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                      {ord.orderStatus}
                    </span>

                    <button
                      onClick={() => {
                        setActiveTrackingId(ord.id);
                        setActiveModal('track');
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1 rounded-xl text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                    >
                      <Truck className="w-3.5 h-3.5 text-amber-400" /> Track Live
                    </button>
                  </div>
                </div>

                {/* Order Progress Bar filling a path */}
                {(() => {
                  const getStageIdx = (status: OrderStatus) => {
                    switch (status) {
                      case 'Order Placed': case 'Order Received': return 0;
                      case 'Order Received by Admin': return 1;
                      case 'Design Approved': case 'Design Proof Approved': case 'Printing & Production': return 2;
                      case 'Quality Check': return 3;
                      case 'Out for Delivery': return 4;
                      case 'Delivered': return 5;
                      default: return 0;
                    }
                  };
                  const sIdx = getStageIdx(ord.orderStatus);
                  const pct = Math.round(((sIdx + 1) / 6) * 100);
                  const pathFill = Math.round((sIdx / 5) * 100);

                  return (
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-slate-800">
                          Status: <span className="text-blue-600 font-black">{ord.orderStatus}</span>
                        </span>
                        <span className="font-mono font-black text-blue-600 bg-blue-100 px-2 py-0.5 rounded text-[11px]">
                          {pct}% Complete
                        </span>
                      </div>

                      {/* Bar Filling a Path */}
                      <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-600 via-sky-500 to-emerald-500 transition-all duration-500 rounded-full"
                          style={{ width: `${pathFill}%` }}
                        />
                      </div>

                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>1. Placed</span>
                        <span>2. Admin</span>
                        <span>3. Design</span>
                        <span>4. Quality</span>
                        <span>5. Delivery</span>
                        <span>6. Delivered</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Items in order */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {ord.items.map((item, idx) => (
                    <div key={idx} className="flex gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                      <img
                        src={item.product.image || getProductFallbackImage(item.product.name, item.product.category)}
                        alt={item.product.name}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = getProductFallbackImage(item.product.name, item.product.category);
                        }}
                        className="w-14 h-14 object-cover rounded-lg border border-slate-200 shrink-0"
                      />
                      <div className="space-y-0.5 text-xs">
                        <h5 className="font-bold text-slate-900">{item.product.name}</h5>
                        <p className="text-slate-500">Qty: {item.quantity} | Total: KSh {item.calculatedPrice.toLocaleString()}</p>
                        {item.customization?.fileName && (
                          <span className="text-emerald-700 font-bold text-[10px] flex items-center gap-1">
                            <FileCheck className="w-3 h-3" /> Artwork Attached
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer summary */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100 gap-2">
                  <div>
                    <span className="font-bold">Delivery Address:</span> {ord.deliveryAddress}, {ord.deliveryCity}
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm">
                    Total: KSh {ord.totalAmount.toLocaleString()} ({ord.paymentMethod} Paid)
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
