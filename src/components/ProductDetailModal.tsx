import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Star, 
  Upload, 
  Check, 
  Zap, 
  Clock, 
  MessageCircle, 
  ShoppingBag, 
  Calculator, 
  ShieldCheck, 
  FileText,
  Truck
} from 'lucide-react';
import { CustomArtwork } from '../types';

export const ProductDetailModal: React.FC = () => {
  const { 
    selectedProductForDetail, 
    setSelectedProductForDetail, 
    setActiveModal, 
    addToCart, 
    wpSettings 
  } = useApp();

  if (!selectedProductForDetail) return null;

  const product = selectedProductForDetail;

  const [quantity, setQuantity] = useState<number>(
    product.customizationOptions?.minQuantity || 1
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    product.customizationOptions?.sizes?.[0] || ''
  );
  const [selectedFinish, setSelectedFinish] = useState<string>(
    product.customizationOptions?.finishes?.[0] || ''
  );
  const [designInstructions, setDesignInstructions] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

  // Dynamic Base Price detection (e.g. Roll-up banner Large Base @ 8500 vs Light Base @ 6500)
  let currentBasePrice = product.price;
  if (selectedFinish.includes('8,500') || selectedFinish.includes('8500')) {
    currentBasePrice = 8500;
  } else if (selectedFinish.includes('6,500') || selectedFinish.includes('6500')) {
    currentBasePrice = 6500;
  }

  // Bulk Discount Calculator: 5% off for 10+, 10% off for 50+, 15% off for 100+
  let discountRate = 0;
  if (quantity >= 100) discountRate = 0.15;
  else if (quantity >= 50) discountRate = 0.10;
  else if (quantity >= 10) discountRate = 0.05;

  const unitPrice = currentBasePrice * (1 - discountRate);
  const totalPrice = Math.round(unitPrice * quantity);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFileName(e.target.files[0].name);
    }
  };

  const handleAddToCart = () => {
    const custom: CustomArtwork = {
      quantity,
      selectedSize,
      selectedFinish,
      instructions: designInstructions,
      fileName: uploadedFileName || 'Custom Artwork Attached',
    };

    // If quote-only product, prepare custom item with base price 0
    const itemProduct = { ...product, price: currentBasePrice };
    addToCart(itemProduct, quantity, custom);
    setSelectedProductForDetail(null);
    setActiveModal('cart');
  };

  const rawPhone = wpSettings.whatsappNumber.replace(/[^0-9]/g, '');
  const cleanPhone = rawPhone.startsWith('0') ? '254' + rawPhone.slice(1) : rawPhone;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="bg-orange-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              {product.category}
            </span>
            <h3 className="text-sm sm:text-base font-extrabold truncate max-w-md">{product.name}</h3>
          </div>
          <button
            onClick={() => setSelectedProductForDetail(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[80vh] overflow-y-auto">
          
          {/* Left Column: Image & Highlights */}
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-4/3">
              <img
                src={product.image}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              {product.isFlashDeal && (
                <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-black px-3 py-1 rounded-lg shadow-md flex items-center gap-1 uppercase tracking-wider">
                  <Zap className="w-3.5 h-3.5 fill-white" /> FLASH SALE
                </span>
              )}
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Key Features & Print Quality:</h4>
              <ul className="grid grid-cols-2 gap-2 text-xs text-slate-700">
                {product.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-200/60">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-orange-50 border border-orange-200 p-3 rounded-xl text-xs text-orange-950 space-y-1">
              <div className="font-bold flex items-center gap-1 text-orange-700">
                <Truck className="w-4 h-4 text-orange-600" /> Delivery & Proofing Guarantee
              </div>
              <p className="text-[11px] leading-relaxed text-orange-800">
                After placing your order, our Woodynat graphic design team sends you a digital vector proof for approval via WhatsApp before printing begins!
              </p>
            </div>
          </div>

          {/* Right Column: Customization & Instant Quote Calculator */}
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">{product.name}</h2>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center text-amber-500">
                  <Star className="w-4 h-4 fill-amber-500" />
                  <span className="text-xs font-bold text-slate-800 ml-1">{product.rating.toFixed(1)}</span>
                </div>
                <span className="text-xs text-slate-400">({product.reviewCount} customer reviews)</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Ready for Print
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Customization Options */}
            <div className="space-y-3 pt-3 border-t border-slate-200">
              
              {/* Size Selector if available */}
              {product.customizationOptions?.sizes && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Select Size / Dimension:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.customizationOptions.sizes.map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          selectedSize === sz
                            ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Finish Selector */}
              {product.customizationOptions?.finishes && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Select Print Technique / Finish:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.customizationOptions.finishes.map((fn) => (
                      <button
                        key={fn}
                        type="button"
                        onClick={() => setSelectedFinish(fn)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          selectedFinish === fn
                            ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {fn}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Input */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-slate-700">Quantity Required:</label>
                  {discountRate > 0 && (
                    <span className="text-[11px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      ⚡ {(discountRate * 100)}% Volume Discount Applied!
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-slate-50">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(product.customizationOptions?.minQuantity || 1, quantity - 1))}
                      className="px-3 py-2 text-slate-700 font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={product.customizationOptions?.minQuantity || 1}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 text-center text-xs font-bold text-slate-900 bg-white py-2 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2 text-slate-700 font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">units</span>
                </div>
              </div>

              {/* Upload Artwork File */}
              <div className="bg-slate-50 border-2 border-dashed border-orange-300 rounded-xl p-3 text-center">
                <input
                  type="file"
                  id="artwork-upload"
                  accept="image/*,.pdf,.ai,.psd,.eps"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label 
                  htmlFor="artwork-upload"
                  className="cursor-pointer flex flex-col items-center justify-center gap-1 text-slate-700 hover:text-orange-600"
                >
                  <Upload className="w-5 h-5 text-orange-500" />
                  <span className="text-xs font-bold">
                    {uploadedFileName ? `Attached: ${uploadedFileName}` : 'Upload Your Design Logo or PDF Artwork'}
                  </span>
                  <span className="text-[10px] text-slate-400">Supports PNG, JPG, PDF, AI, PSD vector files</span>
                </label>
              </div>

              {/* Special Instructions */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Branding Instructions / Custom Text / Tribute Names:
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Please print company logo on left chest in gold, and staff name 'John' on right sleeve..."
                  value={designInstructions}
                  onChange={(e) => setDesignInstructions(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:bg-white focus:outline-none"
                />
              </div>

            </div>

            {/* Instant Calculated Price Quote Box */}
            <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold flex items-center gap-1 text-orange-400">
                  <Calculator className="w-4 h-4" /> Calculated Quote Total:
                </span>
                <span className="text-xl font-extrabold text-orange-400">
                  {product.isQuoteOnly || currentBasePrice === 0 
                    ? 'Quote on Inquiry' 
                    : `KSh ${totalPrice.toLocaleString()}`}
                </span>
              </div>

              <div className="flex justify-between text-[11px] text-slate-400">
                <span>
                  {product.isQuoteOnly || currentBasePrice === 0 
                    ? 'Custom Quote via WhatsApp Inquiry' 
                    : `Unit Rate: KSh ${Math.round(unitPrice).toLocaleString()} / item`}
                </span>
                <span>Includes Design Verification</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-3 px-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>
                    {product.isQuoteOnly || currentBasePrice === 0 
                      ? 'Add to Inquiry Cart' 
                      : 'Add to Cart & Order'}
                  </span>
                </button>

                <a
                  href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hi Woodynat Designers Limited! I want a custom quote for ${product.name}.${quantity ? ` Qty: ${quantity}` : ''}${selectedFinish ? `, Finish: ${selectedFinish}` : ''}${selectedSize ? `, Size: ${selectedSize}` : ''}.${currentBasePrice > 0 ? ` Estimated Price: KSh ${totalPrice}` : ' Please provide pricing.'}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Ask on WhatsApp</span>
                </a>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
