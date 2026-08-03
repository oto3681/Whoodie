import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Search, 
  CheckCircle2, 
  Package, 
  Truck, 
  MessageCircle, 
  ShieldCheck, 
  AlertCircle,
  UserCheck,
  FileCheck,
  ArrowRight,
  Sparkles,
  Clock
} from 'lucide-react';
import { OrderStatus } from '../types';

interface TrackingStageConfig {
  id: OrderStatus;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const TRACKING_STAGES: TrackingStageConfig[] = [
  {
    id: 'Order Placed',
    label: 'Order Placed',
    shortLabel: 'Placed',
    icon: Package,
    description: 'Order placed & M-Pesa payment authorized successfully.'
  },
  {
    id: 'Order Received by Admin',
    label: 'Order Received by Admin',
    shortLabel: 'Admin Received',
    icon: UserCheck,
    description: 'Order acknowledged & assigned to Woodynat production team.'
  },
  {
    id: 'Design Approved',
    label: 'Design Approved',
    shortLabel: 'Design Approved',
    icon: FileCheck,
    description: 'Design proofing & artwork vectorization approved.'
  },
  {
    id: 'Quality Check',
    label: 'Quality Check',
    shortLabel: 'Quality Check',
    icon: ShieldCheck,
    description: 'Color inspection, print calibration & packaging check.'
  },
  {
    id: 'Out for Delivery',
    label: 'Out for Delivery',
    shortLabel: 'Out for Delivery',
    icon: Truck,
    description: 'Package handed over to dispatch courier rider.'
  },
  {
    id: 'Delivered',
    label: 'Delivered',
    shortLabel: 'Delivered',
    icon: CheckCircle2,
    description: 'Delivered to customer or designated pick-up station.'
  }
];

export const OrderTracker: React.FC = () => {
  const { 
    orders, 
    activeModal, 
    setActiveModal, 
    activeTrackingId, 
    setActiveTrackingId, 
    updateOrderStatus,
    wpSettings 
  } = useApp();

  const [inputCode, setInputCode] = useState(activeTrackingId || '');

  const rawPhone = wpSettings.whatsappNumber.replace(/[^0-9]/g, '');
  const cleanPhone = rawPhone.startsWith('0') ? '254' + rawPhone.slice(1) : rawPhone;

  if (activeModal !== 'track') return null;

  const currentOrder = orders.find(
    (o) => o.id.toLowerCase() === (inputCode || activeTrackingId || '').toLowerCase()
  ) || orders[0];

  const getStageIndex = (status: OrderStatus): number => {
    switch (status) {
      case 'Order Placed':
      case 'Order Received':
        return 0;
      case 'Order Received by Admin':
        return 1;
      case 'Design Approved':
      case 'Design Proof Approved':
      case 'Printing & Production':
        return 2;
      case 'Quality Check':
        return 3;
      case 'Out for Delivery':
        return 4;
      case 'Delivered':
        return 5;
      default:
        return 0;
    }
  };

  const activeStepIdx = currentOrder ? getStageIndex(currentOrder.orderStatus) : 0;
  
  // Percentage metrics
  const completionPercentage = Math.round(((activeStepIdx + 1) / TRACKING_STAGES.length) * 100);
  const pathFillPercentage = Math.round((activeStepIdx / (TRACKING_STAGES.length - 1)) * 100);

  const handleProgressNextStage = () => {
    if (!currentOrder) return;
    const nextIdx = Math.min(activeStepIdx + 1, TRACKING_STAGES.length - 1);
    const nextStage = TRACKING_STAGES[nextIdx].id;
    updateOrderStatus(currentOrder.id, nextStage);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-6 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">Live Delivery Progress</span>
              <h3 className="font-extrabold text-base sm:text-lg">Real-Time Order Tracking</h3>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close Tracker"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 space-y-6 max-h-[82vh] overflow-y-auto">
          
          {/* Tracking Search Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Enter Tracking ID (e.g. PX-98241 or PX-98102)"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-4 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 font-mono font-bold uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
            </div>
            <button
              onClick={() => {
                if (inputCode) setActiveTrackingId(inputCode);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer shadow-xs shrink-0"
            >
              Track Order
            </button>
          </div>

          {!currentOrder ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200">
              <AlertCircle className="w-10 h-10 text-blue-600 mx-auto mb-2 animate-bounce" />
              <h4 className="font-bold text-slate-800 text-sm">Tracking Code Not Found</h4>
              <p className="text-xs text-slate-500 mt-1">Please verify your tracking code from your M-Pesa SMS or receipt.</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Active Order Summary Header */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-4 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-400 block">
                      Active Order Reference:
                    </span>
                    <span className="text-xl font-mono font-extrabold text-white">{currentOrder.id}</span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      <span>Current Stage: {TRACKING_STAGES[activeStepIdx].label}</span>
                    </span>

                    {/* Progress Stage Simulation Button for Demo */}
                    {activeStepIdx < TRACKING_STAGES.length - 1 && (
                      <button
                        onClick={handleProgressNextStage}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-extrabold px-3 py-1 rounded-full transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                        title="Simulate next stage progression"
                      >
                        <Sparkles className="w-3 h-3 text-amber-200" />
                        <span>Advance Stage</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-300 pt-1">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Customer Name:</span>
                    <span className="font-bold text-white">{currentOrder.customerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Delivery Destination:</span>
                    <span className="font-bold text-white">{currentOrder.deliveryCity}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Estimated Arrival:</span>
                    <span className="font-bold text-blue-300">{currentOrder.estimatedDelivery}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Payment Status:</span>
                    <span className="font-bold text-emerald-400">Paid (KSh {currentOrder.totalAmount.toLocaleString()})</span>
                  </div>
                </div>
              </div>

              {/* PROGRESSIVE PATH & PERCENTAGE BAR COMPONENT */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-6 shadow-xs">
                
                {/* Percentage Header Meter */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <span>Order Fulfillment Roadmap</span>
                      <span className="bg-blue-100 text-blue-800 text-[11px] font-black px-2.5 py-0.5 rounded-md border border-blue-200">
                        Stage {activeStepIdx + 1} of 6
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Progressively updated as your order advances through production and dispatch.
                    </p>
                  </div>

                  {/* Percentage Chip */}
                  <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs self-start sm:self-auto">
                    <span className="text-xs font-extrabold text-slate-600">Total Progress:</span>
                    <span className="text-lg font-black text-blue-600 font-mono">
                      {completionPercentage}%
                    </span>
                  </div>
                </div>

                {/* THE PROGRESS BAR FILLING A PATH */}
                <div className="py-4 px-2 relative">
                  
                  {/* Desktop / Tablet Horizontal Path */}
                  <div className="hidden md:block relative my-4">
                    
                    {/* Background Track Path Line */}
                    <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-2.5 bg-slate-200 rounded-full z-0" />

                    {/* Animated Active Progress Fill Bar Line */}
                    <div 
                      className="absolute top-1/2 left-0 -translate-y-1/2 h-2.5 bg-gradient-to-r from-blue-600 via-sky-500 to-emerald-500 rounded-full transition-all duration-700 ease-out z-0 shadow-xs"
                      style={{ width: `${pathFillPercentage}%` }}
                    />

                    {/* 6 Stage Nodes along the Path */}
                    <div className="relative z-10 flex justify-between items-center">
                      {TRACKING_STAGES.map((stage, idx) => {
                        const isCompleted = idx <= activeStepIdx;
                        const isCurrent = idx === activeStepIdx;
                        const IconComponent = stage.icon;

                        return (
                          <div key={stage.id} className="flex flex-col items-center group relative">
                            
                            {/* Step Circle Node */}
                            <div 
                              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-md ${
                                isCompleted
                                  ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                                  : 'bg-white border-2 border-slate-300 text-slate-400'
                              } ${
                                isCurrent 
                                  ? 'bg-blue-600 text-white ring-4 ring-blue-200 scale-110 shadow-lg' 
                                  : ''
                              }`}
                            >
                              {isCompleted && !isCurrent ? (
                                <CheckCircle2 className="w-5 h-5 text-white" />
                              ) : (
                                <IconComponent className={`w-5 h-5 ${isCurrent ? 'animate-pulse' : ''}`} />
                              )}
                            </div>

                            {/* Node Label & Percentage Marker */}
                            <div className="mt-2 text-center max-w-[100px]">
                              <span className={`text-[11px] block font-bold leading-tight ${
                                isCurrent 
                                  ? 'text-blue-700 font-extrabold' 
                                  : isCompleted 
                                  ? 'text-slate-900' 
                                  : 'text-slate-400'
                              }`}>
                                {stage.shortLabel}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                                {Math.round(((idx + 1) / TRACKING_STAGES.length) * 100)}%
                              </span>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mobile Vertical Path (for screens < md) */}
                  <div className="block md:hidden relative space-y-6 before:absolute before:left-5 before:top-4 before:bottom-4 before:w-1.5 before:bg-slate-200">
                    
                    {/* Mobile Active Vertical Progress Bar */}
                    <div 
                      className="absolute left-5 top-4 w-1.5 bg-gradient-to-b from-blue-600 via-sky-500 to-emerald-500 rounded-full transition-all duration-700 ease-out z-0"
                      style={{ height: `${pathFillPercentage}%` }}
                    />

                    {TRACKING_STAGES.map((stage, idx) => {
                      const isCompleted = idx <= activeStepIdx;
                      const isCurrent = idx === activeStepIdx;
                      const IconComponent = stage.icon;

                      return (
                        <div key={stage.id} className="relative flex items-center gap-3 pl-12 z-10">
                          
                          {/* Circle Node */}
                          <div 
                            className={`absolute left-1.5 top-0.5 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-xs ${
                              isCompleted
                                ? 'bg-emerald-600 text-white ring-2 ring-emerald-100'
                                : 'bg-white border-2 border-slate-300 text-slate-400'
                            } ${
                              isCurrent 
                                ? 'bg-blue-600 text-white ring-4 ring-blue-200 scale-110' 
                                : ''
                            }`}
                          >
                            {isCompleted && !isCurrent ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <IconComponent className="w-4 h-4" />
                            )}
                          </div>

                          <div className="flex-1 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                            <div className="flex justify-between items-center">
                              <span className={`text-xs font-bold ${isCurrent ? 'text-blue-700' : isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                                {idx + 1}. {stage.label}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                {Math.round(((idx + 1) / TRACKING_STAGES.length) * 100)}%
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1">{stage.description}</p>
                          </div>

                        </div>
                      );
                    })}
                  </div>

                </div>

                {/* Progressive Step Log Table / Timeline */}
                <div className="border-t border-slate-200 pt-4 space-y-3">
                  <h5 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center justify-between">
                    <span>Fulfillment Step Details</span>
                    <span className="text-[10px] text-slate-400 font-normal">Updated Live</span>
                  </h5>

                  <div className="space-y-2">
                    {TRACKING_STAGES.map((stage, idx) => {
                      const isCompleted = idx <= activeStepIdx;
                      const isCurrent = idx === activeStepIdx;
                      const stepHistoryItem = currentOrder.trackingHistory?.find(s => s.status === stage.id);

                      return (
                        <div 
                          key={stage.id} 
                          className={`p-3 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all ${
                            isCurrent
                              ? 'bg-blue-50/80 border-blue-300 ring-1 ring-blue-200 shadow-2xs'
                              : isCompleted
                              ? 'bg-white border-slate-200 text-slate-800'
                              : 'bg-slate-50/60 border-slate-200/60 opacity-60'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 font-bold text-[10px] ${
                              isCompleted ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                            }`}>
                              {isCompleted ? '✓' : idx + 1}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`font-extrabold ${isCurrent ? 'text-blue-950' : 'text-slate-900'}`}>
                                  {stage.label}
                                </span>
                                {isCurrent && (
                                  <span className="bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                                    <Clock className="w-2.5 h-2.5 animate-spin" /> In Progress
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-600 mt-0.5">{stage.description}</p>
                            </div>
                          </div>

                          <div className="text-[11px] font-mono text-slate-500 shrink-0 self-end sm:self-auto bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/60">
                            {stepHistoryItem?.timestamp || (isCompleted ? currentOrder.createdAt : 'Pending')}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Rider & Dispatch Support Box */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Assigned Dispatch Manager: Peter Kimani</h5>
                    <p className="text-[11px] text-slate-600">Have special delivery instructions or custom artwork questions?</p>
                  </div>
                </div>

                <a
                  href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hi Woodynat Designers Limited! Inquiring about order tracking status for ${currentOrder.id}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Courier</span>
                </a>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
