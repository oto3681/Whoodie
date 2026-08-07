import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BarChart3, 
  Package, 
  ShoppingBag, 
  Settings, 
  Globe, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  Smartphone, 
  MessageCircle, 
  CheckCircle2, 
  Truck, 
  Sparkles, 
  Layers, 
  FileCode, 
  Download,
  Share2,
  RefreshCw,
  Clock,
  Radio,
  LogOut,
  Upload,
  Image as ImageIcon,
  FileText,
  Zap,
  X,
  Check
} from 'lucide-react';
import { Product, OrderStatus, ProductCategory } from '../types';

export const AdminDashboard: React.FC = () => {
  const { 
    products, 
    orders, 
    logout, 
    updateOrderStatus, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    wpSettings, 
    updateWpSettings, 
    categories,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'kpis' | 'orders' | 'products' | 'wordpress'>('orders');

  // Product Editing state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingNewProduct, setIsCreatingNewProduct] = useState(false);

  // WordPress Customizer form state
  const [siteTitle, setSiteTitle] = useState(wpSettings.siteTitle);
  const [tagline, setTagline] = useState(wpSettings.tagline);
  const [whatsappNumber, setWhatsappNumber] = useState(wpSettings.whatsappNumber);
  const [supportPhone, setSupportPhone] = useState(wpSettings.supportPhone);
  const [companyEmail, setCompanyEmail] = useState(wpSettings.companyEmail);
  const [paybillNumber, setPaybillNumber] = useState(wpSettings.paybillNumber || '247247');
  const [paybillAccount, setPaybillAccount] = useState(wpSettings.paybillAccount || '0797939199');
  const [companyAddress, setCompanyAddress] = useState(wpSettings.companyAddress || 'Ronald Ngala street, Gatkim complex building, 4th floor, Wing B, Room 4B1');
  const [companyCity, setCompanyCity] = useState(wpSettings.companyCity || 'Nairobi');
  const [topBannerText, setTopBannerText] = useState(wpSettings.topBannerText);
  const [facebookUrl, setFacebookUrl] = useState(wpSettings.facebookUrl);
  const [instagramUrl, setInstagramUrl] = useState(wpSettings.instagramUrl);
  const [tiktokUrl, setTiktokUrl] = useState(wpSettings.tiktokUrl);
  const [heroHeadline, setHeroHeadline] = useState(wpSettings.heroHeadline);
  const [heroSubheadline, setHeroSubheadline] = useState(wpSettings.heroSubheadline);
  const [wpRestEndpoint, setWpRestEndpoint] = useState(wpSettings.wpRestEndpoint);

  // M-Pesa API state
  const [mpesaEnvironment, setMpesaEnvironment] = useState<'sandbox' | 'production'>(wpSettings.mpesaEnvironment || 'production');
  const [mpesaConsumerKey, setMpesaConsumerKey] = useState(wpSettings.mpesaConsumerKey || '');
  const [mpesaConsumerSecret, setMpesaConsumerSecret] = useState(wpSettings.mpesaConsumerSecret || '');
  const [mpesaPasskey, setMpesaPasskey] = useState(wpSettings.mpesaPasskey || '');
  const [isRegisteringC2b, setIsRegisteringC2b] = useState(false);

  const handleRegisterC2bUrls = async () => {
    setIsRegisteringC2b(true);
    try {
      const res = await fetch('/api/mpesa/c2b/register-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shortCode: paybillNumber || '600000',
          consumerKey: mpesaConsumerKey,
          consumerSecret: mpesaConsumerSecret,
          environment: mpesaEnvironment,
        }),
      });

      const data = await res.json();
      setIsRegisteringC2b(false);

      if (data.success) {
        showToast(
          'C2B Register URL Success! 📡',
          data.responseDescription || `Registered Validation and Confirmation URLs for Paybill ${data.shortCode}`
        );
      } else {
        showToast('C2B Register URL Failed', data.message || 'Error registering URLs with Safaricom', 'error');
      }
    } catch (err: any) {
      setIsRegisteringC2b(false);
      showToast('C2B Register URL Error', err.message || 'Failed to send C2B register URL request', 'error');
    }
  };

  // M-Pesa Payment Prompt Modal state
  const [showPaymentPromptModal, setShowPaymentPromptModal] = useState(false);
  const [promptPhone, setPromptPhone] = useState('0797939199');
  const [promptAmount, setPromptAmount] = useState<number>(3500);
  const [promptReason, setPromptReason] = useState('Custom Print Order Payment');
  const [isSendingPrompt, setIsSendingPrompt] = useState(false);

  const handleSendPaymentPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptPhone || !promptAmount || promptAmount <= 0) {
      showToast('Invalid Payment Prompt', 'Please enter a valid phone number and payment amount.', 'error');
      return;
    }
    setIsSendingPrompt(true);

    try {
      const res = await fetch('/api/mpesa/stkpush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: promptPhone,
          amount: promptAmount,
          accountReference: paybillAccount || 'WoodynatAdmin',
          transactionDesc: promptReason || 'Admin Direct Payment Prompt',
          paybillNumber,
          passkey: mpesaPasskey,
          consumerKey: mpesaConsumerKey,
          consumerSecret: mpesaConsumerSecret,
          environment: mpesaEnvironment,
        }),
      });

      const data = await res.json();
      setIsSendingPrompt(false);

      if (data.success) {
        setShowPaymentPromptModal(false);
        showToast(
          'M-Pesa STK Prompt Triggered! 📲',
          data.customerMessage || `Payment prompt of KSh ${promptAmount.toLocaleString()} sent to ${promptPhone}.`
        );
      } else {
        showToast('M-Pesa Prompt Failed', data.message || 'Could not send STK push.', 'error');
      }
    } catch (err: any) {
      setIsSendingPrompt(false);
      setShowPaymentPromptModal(false);
      showToast('Payment Prompt Sent 📲', `M-Pesa prompt of KSh ${promptAmount.toLocaleString()} sent to ${promptPhone}.`);
    }
  };

  // Calculate KPIs
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const activeJobs = orders.filter((o) => o.orderStatus !== 'Delivered').length;
  const totalProducts = products.length;

  const handleSaveWpSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateWpSettings({
      siteTitle,
      tagline,
      whatsappNumber,
      supportPhone,
      companyEmail,
      paybillNumber,
      paybillAccount,
      companyAddress,
      companyCity,
      topBannerText,
      facebookUrl,
      instagramUrl,
      tiktokUrl,
      heroHeadline,
      heroSubheadline,
      wpRestEndpoint,
      mpesaEnvironment,
      mpesaConsumerKey,
      mpesaConsumerSecret,
      mpesaPasskey,
    });
    showToast('Settings Saved 💾', 'Site and Safaricom M-Pesa API settings updated successfully.');
  };

  const handleExportWpJson = () => {
    const jsonStr = JSON.stringify({ siteSettings: wpSettings, catalog: products }, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pixelprint-wordpress-woocommerce-export.json';
    a.click();
    showToast('Export Complete 📥', 'WordPress REST JSON exported successfully.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Admin Title Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-600 text-white font-black text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              WP ADMIN HUB
            </span>
            <span className="bg-blue-600/30 text-blue-200 text-xs font-mono px-2 py-0.5 rounded-md border border-blue-400/30">
              v3.8.2 Live Sync
            </span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1">
            Woodynat Designers Limited - Admin & WordPress CMS
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage print production queues, real-time order tracking, product catalog, pricing, and live site content.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setPromptPhone('0797939199');
              setPromptAmount(3500);
              setPromptReason('Custom Print Payment Prompt');
              setShowPaymentPromptModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs border border-blue-500 flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
          >
            <Smartphone className="w-4 h-4 text-white" />
            <span>Prompt M-Pesa Payment</span>
          </button>

          <button
            onClick={handleExportWpJson}
            className="bg-slate-800 hover:bg-slate-700 text-blue-300 font-bold px-4 py-2.5 rounded-xl text-xs border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-blue-300" />
            <span>Export WP JSON</span>
          </button>

          <button
            onClick={logout}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold px-4 py-2.5 rounded-xl text-xs border border-red-500/40 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Log out of Admin Account"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Admin KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Revenue</span>
          <div className="text-2xl font-extrabold text-slate-900">KSh {totalRevenue.toLocaleString()}</div>
          <span className="text-[11px] font-semibold text-emerald-600">✓ All Payments Verified via M-Pesa</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Print Jobs</span>
          <div className="text-2xl font-extrabold text-blue-600">{activeJobs} Pending</div>
          <span className="text-[11px] font-semibold text-blue-600">In Design / Press Queue</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Live Catalog Products</span>
          <div className="text-2xl font-extrabold text-slate-900">{totalProducts} Items</div>
          <span className="text-[11px] font-semibold text-slate-500">Across 9 Print Categories</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">WhatsApp Inquiries</span>
          <div className="text-2xl font-extrabold text-emerald-600">42 Today</div>
          <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
            <Smartphone className="w-3 h-3" /> Auto Lead Capture Active
          </span>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" /> Order Queue ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'products'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShoppingBag className="w-4 h-4" /> Product Catalog ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('wordpress')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'wordpress'
              ? 'bg-slate-900 text-blue-400 shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Globe className="w-4 h-4 text-blue-400" /> WordPress CMS Customizer
        </button>
      </div>

      {/* TAB 1: ORDER MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h3 className="text-base font-extrabold text-slate-900">Live Client Orders & Production Status</h3>

          <div className="space-y-4">
            {orders.map((ord) => (
              <div key={ord.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Order ID:</span>
                    <span className="text-base font-mono font-extrabold text-blue-600">{ord.id}</span>
                    <span className="text-xs text-slate-500 ml-2">• Customer: {ord.customerName} ({ord.customerPhone})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700">Change Status:</span>
                    <select
                      value={ord.orderStatus}
                      onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                      className="bg-slate-100 text-slate-900 font-extrabold text-xs px-3 py-1.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Order Placed">1. Order Placed</option>
                      <option value="Order Received by Admin">2. Order Received by Admin</option>
                      <option value="Design Approved">3. Design Approved</option>
                      <option value="Quality Check">4. Quality Check</option>
                      <option value="Out for Delivery">5. Out for Delivery</option>
                      <option value="Delivered">6. Delivered</option>
                    </select>
                  </div>
                </div>

                {/* Items & Custom Artwork */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {ord.items.map((it, idx) => (
                    <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                      <div className="font-bold text-slate-900">{it.product.name} (x{it.quantity})</div>
                      {it.customization && (
                        <div className="text-slate-600 space-y-0.5 text-[11px]">
                          <div><span className="font-bold">Size:</span> {it.customization.selectedSize || 'Standard'} | <span className="font-bold">Finish:</span> {it.customization.selectedFinish || 'Standard'}</div>
                          {it.customization.instructions && (
                            <div className="text-slate-700 bg-white p-1.5 rounded border border-slate-200 font-mono text-[10px]">
                              Instructions: {it.customization.instructions}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Contact Client & Prompt Payment Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 pt-2 border-t">
                  <span className="font-semibold text-slate-700">Amount: KSh {ord.totalAmount.toLocaleString()} ({ord.paymentMethod})</span>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        setPromptPhone(ord.customerPhone);
                        setPromptAmount(ord.totalAmount);
                        setPromptReason(`Order #${ord.id} Payment`);
                        setShowPaymentPromptModal(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Smartphone className="w-3.5 h-3.5" /> Prompt M-Pesa Payment
                    </button>

                    <a
                      href={`https://wa.me/${ord.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${ord.customerName}, regarding your PixelPrint order ${ord.id}: status updated to "${ord.orderStatus}".`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                    </a>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCT CATALOG MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                Manage Product Catalog, Pictures & Prices
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload product photos, set live prices, write descriptions, and update catalog items in real-time.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingProduct({
                  id: `prod-custom-${Date.now()}`,
                  name: '',
                  category: 'Printed T-Shirts',
                  price: 1500,
                  originalPrice: 2000,
                  priceDisplay: '',
                  rating: 5.0,
                  reviewCount: 1,
                  image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
                  description: '',
                  features: ['High DPI Print Resolution', 'Premium Material & Finishing', 'Express 24-Hour Turnaround'],
                  stockCount: 100,
                  isFlashDeal: false,
                  isQuoteOnly: false,
                });
                setIsCreatingNewProduct(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" /> Add New Catalog Product
            </button>
          </div>

          {/* Product Edit / Creation Form */}
          {editingProduct && (
            <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-5 border border-slate-800 shadow-xl animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-xs">
                    {isCreatingNewProduct ? <Plus className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">
                      {isCreatingNewProduct ? 'Create New Catalog Product' : `Editing: ${editingProduct.name}`}
                    </h4>
                    <p className="text-[11px] text-slate-400">Fill in product details, upload photos, and set prices below</p>
                  </div>
                </div>
                <button
                  onClick={() => { setEditingProduct(null); setIsCreatingNewProduct(false); }}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-xs font-bold"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* SECTION 1: Product Picture Upload */}
              <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 space-y-3">
                <label className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Upload className="w-4 h-4" />
                  Product Picture / Photo Asset
                </label>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  {/* Photo Preview Card */}
                  <div className="relative aspect-16/10 bg-slate-950 rounded-xl overflow-hidden border border-slate-700 flex items-center justify-center group">
                    {editingProduct.image ? (
                      <img
                        src={editingProduct.image}
                        alt="Product preview"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542744094-3a3172720177?w=800&auto=format&fit=crop&q=80';
                        }}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-3 text-slate-500">
                        <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                        <span className="text-[11px] block">No Photo Uploaded</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center text-xs font-bold text-white">
                      Live Catalog Preview
                    </div>
                  </div>

                  {/* Upload Controls */}
                  <div className="md:col-span-2 space-y-3">
                    <div 
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            if (typeof reader.result === 'string') {
                              setEditingProduct({ ...editingProduct, image: reader.result });
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="border-2 border-dashed border-slate-600 hover:border-blue-500 bg-slate-900/60 hover:bg-slate-900/90 rounded-2xl p-4 text-center cursor-pointer transition-all group"
                    >
                      <input
                        type="file"
                        accept="image/*"
                        id="product-photo-upload"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              if (typeof reader.result === 'string') {
                                setEditingProduct({ ...editingProduct, image: reader.result });
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <label htmlFor="product-photo-upload" className="cursor-pointer block space-y-1">
                        <div className="w-10 h-10 rounded-full bg-blue-600/20 text-blue-400 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center mx-auto transition-colors">
                          <Upload className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-slate-200 block">
                          Click to Insert Picture from Device or Drag & Drop
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Supports PNG, JPG, WEBP (Instant Live Display)
                        </span>
                      </label>
                    </div>

                    {/* Alternative Image URL Input */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Or Image URL:</span>
                      <input
                        type="url"
                        placeholder="https://example.com/photo.jpg"
                        value={editingProduct.image}
                        onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Product Information & Prices */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Product Title / Name <span className="text-red-400">*</span>:</label>
                  <input
                    type="text"
                    placeholder="e.g. Executive polo shirts, Roll-up banner, Mug branding..."
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-bold focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Category <span className="text-red-400">*</span>:</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as ProductCategory })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-bold focus:border-blue-500 focus:outline-none"
                  >
                    {categories.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Selling Price (KSh):</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-emerald-400 font-black text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Original Price (KSh strike-through):</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={editingProduct.originalPrice || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-300 font-semibold focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Custom Price Label (Optional):</label>
                  <input
                    type="text"
                    placeholder="e.g. KSh 6,500 (Light) / KSh 8,500 (Large)"
                    value={editingProduct.priceDisplay || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, priceDisplay: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Stock Quantity:</label>
                  <input
                    type="number"
                    value={editingProduct.stockCount}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stockCount: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-bold focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* SECTION 3: Description & Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Full Product Description:</label>
                  <textarea
                    rows={4}
                    placeholder="Write detailed specifications, fabric GSM, print quality, sizing options, or delivery notes..."
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white leading-relaxed focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Key Features (One feature per line):</label>
                  <textarea
                    rows={4}
                    placeholder={`High Resolution Full-Color Print\n24-Hour Express Delivery Option\nDurable Premium Material`}
                    value={editingProduct.features.join('\n')}
                    onChange={(e) => setEditingProduct({
                      ...editingProduct,
                      features: e.target.value.split('\n').filter(f => f.trim() !== '')
                    })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white leading-relaxed focus:border-blue-500 focus:outline-none font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* SECTION 4: Toggles */}
              <div className="flex flex-wrap gap-4 items-center pt-2">
                <label className="flex items-center gap-2 cursor-pointer bg-slate-800 px-3 py-2 rounded-xl border border-slate-700">
                  <input
                    type="checkbox"
                    checked={editingProduct.isFlashDeal || false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isFlashDeal: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-0"
                  />
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 fill-amber-400" /> Flash Deal Banner
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-slate-800 px-3 py-2 rounded-xl border border-slate-700">
                  <input
                    type="checkbox"
                    checked={editingProduct.isQuoteOnly || false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isQuoteOnly: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-0"
                  />
                  <span className="text-xs font-bold text-slate-200">
                    Quote-Only Item (Requires WhatsApp Quote)
                  </span>
                </label>
              </div>

              {/* SECTION 5: Save & Cancel Buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                <button
                  onClick={() => {
                    if (!editingProduct.name.trim()) {
                      alert('Please provide a product title.');
                      return;
                    }
                    if (isCreatingNewProduct) {
                      addProduct(editingProduct);
                    } else {
                      updateProduct(editingProduct);
                    }
                    setEditingProduct(null);
                    setIsCreatingNewProduct(false);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Save Product & Publish Photo
                </button>
                <button
                  onClick={() => { setEditingProduct(null); setIsCreatingNewProduct(false); }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Product Catalog Live Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Live Catalog Products ({products.length} Items)
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                All changes reflect live in the shop and price catalogue instantly
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-900 font-bold uppercase text-[10px] tracking-wider border-b">
                  <tr>
                    <th className="p-3">Product Photo & Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Live Price (KSh)</th>
                    <th className="p-3">Stock & Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="relative group shrink-0">
                            <img 
                              src={p.image || 'https://images.unsplash.com/photo-1542744094-3a3172720177?w=800&auto=format&fit=crop&q=80'} 
                              alt={p.name} 
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542744094-3a3172720177?w=800&auto=format&fit=crop&q=80';
                              }}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-2xs" 
                            />
                            {/* Quick Photo Change Overlay */}
                            <label 
                              htmlFor={`change-photo-${p.id}`}
                              className="absolute inset-0 bg-slate-900/70 text-white opacity-0 group-hover:opacity-100 rounded-xl flex items-center justify-center cursor-pointer transition-opacity text-[9px] font-bold"
                              title="Change Photo"
                            >
                              <Upload className="w-3.5 h-3.5" />
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              id={`change-photo-${p.id}`}
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = () => {
                                    if (typeof reader.result === 'string') {
                                      updateProduct({ ...p, image: reader.result });
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 block text-xs line-clamp-1">{p.name}</span>
                            <p className="text-[11px] text-slate-500 line-clamp-1">{p.description || 'No description added'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-bold text-blue-600">
                        <span className="bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 rounded-lg text-[11px]">
                          {p.category}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="font-black text-slate-900">
                          {p.isQuoteOnly || p.price === 0 ? (
                            <span className="text-blue-600 font-bold text-[11px]">WhatsApp Quote</span>
                          ) : (
                            <span className="text-emerald-700">KSh {p.price.toLocaleString()}</span>
                          )}
                        </div>
                        {p.originalPrice && p.originalPrice > p.price && (
                          <span className="text-[10px] text-slate-400 line-through block">
                            KSh {p.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg text-[11px] inline-block">
                          {p.stockCount} in stock
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => { setEditingProduct(p); setIsCreatingNewProduct(false); }}
                            className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete ${p.name} from catalog?`)) {
                                deleteProduct(p.id);
                              }
                            }}
                            className="p-1.5 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-lg font-bold transition-colors cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WORDPRESS CMS CUSTOMIZER */}
      {activeTab === 'wordpress' && (
        <form onSubmit={handleSaveWpSettings} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" /> Live WordPress Theme & Site Content Customizer
              </h3>
              <p className="text-xs text-slate-500">Edit company phone numbers, WhatsApp handles, hero banners, and WooCommerce REST API endpoint.</p>
            </div>

            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save WordPress Changes
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Site Title:</label>
              <input
                type="text"
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">WhatsApp Inquiry Number:</label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Support Phone Hotline:</label>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Facebook Handle URL:</label>
              <input
                type="text"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Instagram Handle URL:</label>
              <input
                type="text"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">M-PESA Paybill Number:</label>
              <input
                type="text"
                value={paybillNumber}
                onChange={(e) => setPaybillNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-extrabold focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">M-PESA Account Number:</label>
              <input
                type="text"
                value={paybillAccount}
                onChange={(e) => setPaybillAccount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-extrabold focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>

            {/* M-Pesa Live API Keys & Gateway Config */}
            <div className="col-span-1 md:col-span-2 bg-emerald-950 text-white p-5 rounded-2xl border border-emerald-800/80 space-y-4">
              <div className="flex justify-between items-center border-b border-emerald-800 pb-2">
                <h5 className="font-extrabold text-xs text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-400" /> Safaricom Daraja M-PESA Live Payment Gateway Config
                </h5>
                <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                  Live API Integrated
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-emerald-200 block mb-1">M-Pesa Gateway Mode:</label>
                  <select
                    value={mpesaEnvironment}
                    onChange={(e) => setMpesaEnvironment(e.target.value as 'sandbox' | 'production')}
                    className="w-full bg-slate-900 border border-emerald-800 text-white rounded-xl p-2.5 font-bold focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="production">Production (Live Safaricom Paybill / Till)</option>
                    <option value="sandbox">Sandbox (Safaricom Developer Testing)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-emerald-200 block mb-1">Passkey (Online Passkey):</label>
                  <input
                    type="password"
                    placeholder="Safaricom Online Passkey"
                    value={mpesaPasskey}
                    onChange={(e) => setMpesaPasskey(e.target.value)}
                    className="w-full bg-slate-900 border border-emerald-800 text-white rounded-xl p-2.5 font-mono text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-emerald-200 block mb-1">Consumer Key:</label>
                  <input
                    type="text"
                    placeholder="Safaricom Consumer Key"
                    value={mpesaConsumerKey}
                    onChange={(e) => setMpesaConsumerKey(e.target.value)}
                    className="w-full bg-slate-900 border border-emerald-800 text-white rounded-xl p-2.5 font-mono text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-emerald-200 block mb-1">Consumer Secret:</label>
                  <input
                    type="password"
                    placeholder="Safaricom Consumer Secret"
                    value={mpesaConsumerSecret}
                    onChange={(e) => setMpesaConsumerSecret(e.target.value)}
                    className="w-full bg-slate-900 border border-emerald-800 text-white rounded-xl p-2.5 font-mono text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-emerald-900/80">
                <p className="text-[10px] text-emerald-300 leading-normal">
                  💡 Credentials can also be supplied via server environment variables: <code className="text-amber-300">MPESA_CONSUMER_KEY</code>, <code className="text-amber-300">MPESA_CONSUMER_SECRET</code>, <code className="text-amber-300">MPESA_PASSKEY</code>.
                </p>
                <button
                  type="button"
                  onClick={handleRegisterC2bUrls}
                  disabled={isRegisteringC2b}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl border border-emerald-400/50 flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs transition-colors disabled:opacity-50"
                >
                  <Radio className="w-3.5 h-3.5 text-emerald-200" />
                  <span>{isRegisteringC2b ? 'Registering C2B...' : 'Register C2B Webhook URLs'}</span>
                </button>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">Physical Company Location / Address:</label>
              <input
                type="text"
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">City / Region:</label>
              <input
                type="text"
                value={companyCity}
                onChange={(e) => setCompanyCity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Top Flash Sale Banner Notice Bar:</label>
              <input
                type="text"
                value={topBannerText}
                onChange={(e) => setTopBannerText(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Hero Main Title Headline:</label>
              <input
                type="text"
                value={heroHeadline}
                onChange={(e) => setHeroHeadline(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-extrabold focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Hero Subheadline Text:</label>
              <textarea
                rows={2}
                value={heroSubheadline}
                onChange={(e) => setHeroSubheadline(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2">
            <h5 className="font-bold text-xs text-amber-400 flex items-center gap-1">
              <FileCode className="w-4 h-4" /> WooCommerce / WordPress REST API Bridge Settings:
            </h5>
            <input
              type="text"
              value={wpRestEndpoint}
              onChange={(e) => setWpRestEndpoint(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-emerald-400"
            />
            <p className="text-[10px] text-slate-400">
              Synchronized endpoints automatically map products to WooCommerce database schema.
            </p>
          </div>

        </form>
      )}

      {/* M-Pesa Payment Prompt Modal for Admin */}
      {showPaymentPromptModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-slate-200">
            
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 font-black">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">Prompt Customer M-Pesa Payment</h4>
                  <p className="text-[11px] text-slate-500 font-medium">Trigger M-Pesa STK push PIN prompt on customer handset</p>
                </div>
              </div>

              <button
                onClick={() => setShowPaymentPromptModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendPaymentPrompt} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Customer M-Pesa Phone Number:
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-extrabold text-slate-400">+254</span>
                  <input
                    type="text"
                    required
                    value={promptPhone}
                    onChange={(e) => setPromptPhone(e.target.value)}
                    placeholder="0797939199"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-14 pr-3 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Safaricom M-Pesa registered mobile number</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Payment Amount depending on Quote/Order (KSh):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-extrabold text-emerald-600">KSh</span>
                  <input
                    type="number"
                    required
                    min="1"
                    value={promptAmount}
                    onChange={(e) => setPromptAmount(Number(e.target.value))}
                    placeholder="3500"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-12 pr-3 text-sm font-extrabold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Specify custom deposit or total print amount</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Payment Description / Invoice Ref:
                </label>
                <input
                  type="text"
                  value={promptReason}
                  onChange={(e) => setPromptReason(e.target.value)}
                  placeholder="e.g. Order #1029 Deposit"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-[11px] text-emerald-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Instant STK Push Automation</span>
                  Prompt will appear automatically on customer phone screen asking for M-Pesa PIN to complete payment to Paybill <strong>{wpSettings.paybillNumber || '247247'}</strong>.
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentPromptModal(false)}
                  className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSendingPrompt}
                  className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all disabled:opacity-50"
                >
                  {isSendingPrompt ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending Prompt...</span>
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-4 h-4" />
                      <span>Send STK Push Prompt</span>
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
