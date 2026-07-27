import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Search, 
  CheckCircle2, 
  Clock, 
  Package, 
  Truck, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Printer, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';
import { OrderStatus } from '../types';

export const OrderTracker: React.FC = () => {
  const { 
    orders, 
    activeModal, 
    setActiveModal, 
    activeTrackingId, 
    setActiveTrackingId, 
    wpSettings 
  } = useApp();

  const [inputCode, setInputCode] = useState(activeTrackingId || '');

  const rawPhone = wpSettings.whatsappNumber.replace(/[^0-9]/g, '');
  const cleanPhone = rawPhone.startsWith('0') ? '254' + rawPhone.slice(1) : rawPhone;

  if (activeModal !== 'track') return null;

  const currentOrder = orders.find(
    (o) => o.id.toLowerCase() === (inputCode || activeTrackingId || '').toLowerCase()
  ) || orders[0]; // default to first mock order if empty

  const getStatusStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'Order Received': return 0;
      case 'Design Proof Approved': return 1;
      case 'Printing & Production': return 2;
      case 'Quality Check': return 3;
      case 'Out for Delivery': return 4;
      case 'Delivered': return 5;
      default: return 0;
    }
  };

  const activeStepIdx = currentOrder ? getStatusStepIndex(currentOrder.orderStatus) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-8 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-orange-400" />
            <h3 className="font-extrabold text-sm sm:text-base">Real-Time Order Tracking Platform</h3>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Tracking Search Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Enter Tracking ID (e.g. WD-98241 or WD-98102)"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-mono font-bold uppercase focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            </div>
            <button
              onClick={() => {
                if (inputCode) setActiveTrackingId(inputCode);
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
            >
              Track Order
            </button>
          </div>

          {!currentOrder ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200">
              <AlertCircle className="w-10 h-10 text-orange-500 mx-auto mb-2" />
              <h4 className="font-bold text-slate-800 text-sm">Tracking ID Not Found</h4>
              <p className="text-xs text-slate-500 mt-1">Please verify your tracking code from your SMS or M-Pesa receipt.</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Active Order Summary Card */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-3 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-orange-400 block">
                      Live Tracking Code:
                    </span>
                    <span className="text-lg font-mono font-extrabold text-white">{currentOrder.id}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping"></span>
                      {currentOrder.orderStatus}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-300 pt-1">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Customer:</span>
                    <span className="font-bold text-white">{currentOrder.customerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Delivery Location:</span>
                    <span className="font-bold text-white">{currentOrder.deliveryCity}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Estimated Arrival:</span>
                    <span className="font-bold text-orange-300">{currentOrder.estimatedDelivery}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Amount Paid:</span>
                    <span className="font-bold text-emerald-400">KSh {currentOrder.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Step-By-Step Interactive Timeline */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b pb-2 flex items-center justify-between">
                  <span>Production & Delivery Roadmap</span>
                  <span className="text-[11px] font-normal text-slate-500">Updated in Real-Time</span>
                </h4>

                <div className="space-y-6 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                  {currentOrder.trackingHistory.map((step, idx) => {
                    const isCompleted = idx <= activeStepIdx;
                    const isCurrent = idx === activeStepIdx;

                    return (
                      <div key={idx} className="relative flex items-start gap-4 pl-8">
                        
                        {/* Step Circle Indicator */}
                        <div 
                          className={`absolute left-0 top-0.5 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            isCompleted
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-white border-2 border-slate-300 text-slate-400'
                          } ${isCurrent ? 'ring-4 ring-emerald-100 scale-110' : ''}`}
                        >
                          {isCompleted ? '✓' : idx + 1}
                        </div>

                        {/* Step Details */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h5 className={`text-xs font-bold ${isCurrent ? 'text-orange-700 font-extrabold' : isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                              {step.status}
                              {isCurrent && (
                                <span className="ml-2 bg-orange-100 text-orange-700 text-[10px] px-2 py-0.5 rounded-md font-semibold">
                                  Current Progress
                                </span>
                              )}
                            </h5>
                            <span className="text-[10px] text-slate-400 font-mono">{step.timestamp}</span>
                          </div>

                          <p className="text-[11px] text-slate-500 mt-0.5">{step.description}</p>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Rider & Support Contact Box */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Assigned Dispatch Manager: Peter Kimani</h5>
                    <p className="text-[11px] text-slate-600">Need to update delivery instructions or address?</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hi Woodynat Designers Limited! Inquiring about order tracking status for ${currentOrder.id}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Courier</span>
                  </a>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
