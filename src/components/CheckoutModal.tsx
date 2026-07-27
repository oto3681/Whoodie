import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  CheckCircle2, 
  Smartphone, 
  CreditCard, 
  Building2, 
  Truck, 
  MapPin, 
  ShieldCheck, 
  Loader2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Order } from '../types';

export const CheckoutModal: React.FC = () => {
  const { cart, activeModal, setActiveModal, createOrder, showToast, wpSettings } = useApp();

  const [step, setStep] = useState<'details' | 'payment' | 'stk-push' | 'confirmed'>('details');
  const [customerName, setCustomerName] = useState('Kiprono M.');
  const [customerPhone, setCustomerPhone] = useState(wpSettings?.paybillAccount || '0797939199');
  const [customerEmail, setCustomerEmail] = useState('customer@gmail.com');
  const [deliveryCity, setDeliveryCity] = useState(wpSettings?.companyCity || 'Nairobi');
  const [deliveryAddress, setDeliveryAddress] = useState(wpSettings?.companyAddress || 'Ronald Ngala street, Gatkim complex building, 4th floor, Wing B, Room 4B1');
  const [deliveryType, setDeliveryType] = useState<'Pickup Station' | 'Express Home Delivery'>('Express Home Delivery');
  const [paymentMethod, setPaymentMethod] = useState<'M-Pesa'>('M-Pesa');

  // M-Pesa STK push simulation state
  const [stkStatus, setStkStatus] = useState<'sending' | 'prompt' | 'success'>('sending');
  const [stkCountdown, setStkCountdown] = useState(10);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  if (activeModal !== 'checkout') return null;

  const subtotal = cart.reduce((sum, item) => sum + item.calculatedPrice, 0);
  const shippingFee = deliveryType === 'Pickup Station' ? 0 : 300;
  const totalAmount = subtotal + shippingFee;

  const handleStartPayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName || !customerPhone || !customerAddressValid()) {
      showToast('Missing Details', 'Please complete name, phone, and delivery address.', 'error');
      return;
    }

    if (paymentMethod === 'M-Pesa') {
      setStep('stk-push');
      setStkStatus('sending');

      // STK Push sequence
      setTimeout(() => {
        setStkStatus('prompt');
        let count = 6;
        const timer = setInterval(() => {
          count -= 1;
          setStkCountdown(count);
          if (count <= 0) {
            clearInterval(timer);
            setStkStatus('success');
            // Finalize order
            const ord = finalizeOrder();
            setCreatedOrder(ord);
            setStep('confirmed');
          }
        }, 1000);
      }, 1500);

    } else {
      // Direct completion for other methods
      const ord = finalizeOrder();
      setCreatedOrder(ord);
      setStep('confirmed');
    }
  };

  const customerAddressValid = () => {
    return deliveryAddress.trim().length > 3;
  };

  const finalizeOrder = () => {
    return createOrder({
      customerName,
      customerPhone,
      customerEmail,
      deliveryCity,
      deliveryAddress,
      deliveryType,
      items: cart,
      subtotal,
      shippingFee,
      totalAmount,
      paymentMethod,
      paymentReference: `QGH${Math.floor(100000 + Math.random() * 900000)}`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-8 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="bg-orange-500 text-white text-xs font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider">
              WOODYNAT CHECKOUT
            </span>
            <h3 className="font-extrabold text-sm sm:text-base">
              {step === 'confirmed' ? 'Order Receipt & Tracking' : 'Secure Order Checkout'}
            </h3>
          </div>
          {step !== 'stk-push' && (
            <button
              onClick={() => setActiveModal(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6">
          
          {/* STEP 1 & 2: Details & Payment Method */}
          {(step === 'details' || step === 'payment') && (
            <form onSubmit={handleStartPayment} className="space-y-6">
              
              {/* Delivery Info */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                  <MapPin className="w-4 h-4 text-orange-600" /> 1. Shipping & Delivery Address
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Full Name:</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">M-Pesa / Phone Number:</label>
                    <input
                      type="tel"
                      required
                      placeholder="07XX XXX XXX"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Email Address:</label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">County / Delivery City:</label>
                    <select
                      value={deliveryCity}
                      onChange={(e) => setDeliveryCity(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none font-semibold"
                    >
                      <option value="Nairobi">Nairobi (CBD & Metropolitan)</option>
                      <option value="Mombasa">Mombasa</option>
                      <option value="Kisumu">Kisumu</option>
                      <option value="Nakuru">Nakuru</option>
                      <option value="Eldoret">Eldoret</option>
                      <option value="Other Town">Nationwide Pick-up Point</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Specific Building / Street / House No:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Industrial Area, Road A, Gate 4 OR CBD Pick-Up Station"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                {/* Delivery Type Option */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <label 
                    onClick={() => setDeliveryType('Express Home Delivery')}
                    className={`p-3 rounded-xl border-2 flex items-center gap-2 cursor-pointer transition-all ${
                      deliveryType === 'Express Home Delivery'
                        ? 'border-orange-500 bg-orange-50 text-orange-950 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Truck className="w-5 h-5 text-orange-600 shrink-0" />
                    <div>
                      <div className="text-xs">Express Door Delivery</div>
                      <div className="text-[10px] text-slate-500 font-normal">KSh 300 Courier Fee</div>
                    </div>
                  </label>

                  <label 
                    onClick={() => setDeliveryType('Pickup Station')}
                    className={`p-3 rounded-xl border-2 flex items-center gap-2 cursor-pointer transition-all ${
                      deliveryType === 'Pickup Station'
                        ? 'border-orange-500 bg-orange-50 text-orange-950 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Building2 className="w-5 h-5 text-orange-600 shrink-0" />
                    <div>
                      <div className="text-xs">Woodynat Pickup Station</div>
                      <div className="text-[10px] text-emerald-600 font-bold">FREE Collection</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" /> 2. Choose Payment Gateway
                </h4>

                <div className="grid grid-cols-1 gap-3">
                  
                  {/* M-Pesa Option */}
                  <div
                    onClick={() => setPaymentMethod('M-Pesa')}
                    className="p-3.5 rounded-xl border-2 border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs flex items-center gap-3 cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white font-extrabold flex items-center justify-center text-xs shrink-0">
                      M
                    </div>
                    <div>
                      <div className="text-xs font-extrabold flex items-center gap-1">
                        M-PESA Express STK <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.2 rounded">Instant</span>
                      </div>
                      <div className="text-[10px] text-slate-500">Pay directly from your phone / M-PESA Paybill</div>
                    </div>
                  </div>

                </div>

                {/* M-Pesa Official Paybill Direct Banner */}
                <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 space-y-1.5 text-xs text-emerald-950">
                  <div className="flex items-center justify-between font-extrabold text-emerald-900 border-b border-emerald-200/80 pb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-emerald-700" /> Official M-PESA Payment Details:
                    </span>
                    <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded font-black uppercase">Active</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 font-mono pt-0.5">
                    <div className="bg-white/80 p-2 rounded-lg border border-emerald-200">
                      <span className="text-[10px] text-slate-500 font-sans block font-semibold">PAYBILL NO:</span>
                      <span className="text-sm font-black text-slate-900">{wpSettings?.paybillNumber || '247247'}</span>
                    </div>
                    <div className="bg-white/80 p-2 rounded-lg border border-emerald-200">
                      <span className="text-[10px] text-slate-500 font-sans block font-semibold">ACCOUNT NO:</span>
                      <span className="text-sm font-black text-slate-900">{wpSettings?.paybillAccount || '0797939199'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Amount Summary */}
              <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Items Subtotal ({cart.length}):</span>
                  <span>KSh {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Shipping & Delivery Fee:</span>
                  <span>{shippingFee === 0 ? 'FREE' : `KSh ${shippingFee}`}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-amber-400 pt-2 border-t border-slate-800">
                  <span>Total Payable:</span>
                  <span>KSh {totalAmount.toLocaleString()}</span>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer mt-3"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Pay KSh {totalAmount.toLocaleString()} via {paymentMethod}</span>
                </button>
              </div>

            </form>
          )}

          {/* STEP: M-Pesa STK Push Simulation Screen */}
          {step === 'stk-push' && (
            <div className="py-10 text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 relative">
                <Smartphone className="w-10 h-10 animate-bounce" />
                <span className="absolute top-0 right-0 w-4 h-4 bg-emerald-500 rounded-full animate-ping"></span>
              </div>

              {stkStatus === 'sending' && (
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Initiating M-PESA STK Push...</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Sending payment prompt to <span className="font-bold text-slate-900">{customerPhone}</span>
                  </p>
                  <Loader2 className="w-6 h-6 text-emerald-600 animate-spin mx-auto mt-4" />
                </div>
              )}

              {stkStatus === 'prompt' && (
                <div className="max-w-md mx-auto bg-slate-900 text-white p-6 rounded-2xl shadow-xl space-y-4 border border-slate-800">
                  <div className="bg-emerald-600 text-white text-xs font-bold py-1 px-3 rounded-full inline-block">
                    M-PESA POPUP ON YOUR PHONE
                  </div>
                  <div className="font-mono text-xs text-emerald-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
                    Do you want to pay KSh {totalAmount.toLocaleString()} to WOODYNAT DESIGNERS LIMITED Paybill {wpSettings?.paybillNumber || '247247'} (Acc: {wpSettings?.paybillAccount || '0797939199'}) for Order Checkout?
                  </div>
                  <div className="text-xs text-slate-400 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 text-orange-400 animate-spin" />
                    <span>Enter M-PESA PIN on your phone ({stkCountdown}s)</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP: Order Confirmed Receipt */}
          {step === 'confirmed' && createdOrder && (
            <div className="space-y-6">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto text-2xl shadow-md">
                  ✓
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">Payment Verified & Order Confirmed!</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Thank you, <span className="font-bold text-slate-900">{createdOrder.customerName}</span>! Your print job has been placed and queued for proofing & press production.
                </p>
              </div>

              {/* Order Receipt Details */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-3">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-bold text-slate-500 uppercase tracking-wider">Order Tracking Code:</span>
                  <span className="font-mono font-extrabold text-base text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                    {createdOrder.id}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div><span className="font-bold">Payment Method:</span> {createdOrder.paymentMethod}</div>
                  <div><span className="font-bold">Transaction Ref:</span> {createdOrder.paymentReference}</div>
                  <div><span className="font-bold">Delivery Location:</span> {createdOrder.deliveryCity}</div>
                  <div><span className="font-bold">Estimated Delivery:</span> {createdOrder.estimatedDelivery}</div>
                </div>

                <div className="border-t pt-2 space-y-1">
                  <span className="font-bold text-slate-700 block">Ordered Items:</span>
                  {createdOrder.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-slate-600">
                      <span>• {it.product.name} (x{it.quantity})</span>
                      <span className="font-bold">KSh {it.calculatedPrice.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => {
                    setActiveModal('track');
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Track Order in Real-Time</span>
                </button>

                <button
                  onClick={() => setActiveModal(null)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Return to Shop
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
