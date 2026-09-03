import React, { useState, useEffect, useRef } from 'react';
import { Product, ProductCategory } from '../types';
import { INITIAL_PRODUCTS, getProductFallbackImage } from '../data/initialData';
import { optimizeProductImage } from '../utils/imageOptimizer';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  RotateCcw, 
  Save, 
  Edit3, 
  Plus, 
  Zap, 
  Clock, 
  Sparkles, 
  Check, 
  Camera, 
  ExternalLink,
  Tag,
  ShoppingBag,
  Layers,
  FileCheck,
  FolderPlus
} from 'lucide-react';
import { AdminCategoryManagerModal } from './AdminCategoryManagerModal';

interface AdminProductEditModalProps {
  product: Product;
  isNew?: boolean;
  categories: ProductCategory[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (savedProduct: Product) => void;
  showToast?: (title: string, description: string) => void;
}

export const AdminProductEditModal: React.FC<AdminProductEditModalProps> = ({
  product,
  isNew = false,
  categories,
  isOpen,
  onClose,
  onSave,
  showToast
}) => {
  const [formData, setFormData] = useState<Product>({ ...product });
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [imageUploadNotice, setImageUploadNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync internal form when product prop changes
  useEffect(() => {
    setFormData({ ...product });
  }, [product]);

  // Lock background body scroll while dialog is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Process & compress uploaded image file
  const handleFileProcess = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WEBP, or SVG).');
      return;
    }

    setIsProcessingImage(true);
    setImageUploadNotice('Compressing & optimizing image for HD live catalogue display...');

    try {
      const compressedDataUrl = await optimizeProductImage(file, {
        maxDimension: 900,
        quality: 0.85
      });

      setFormData(prev => ({ ...prev, image: compressedDataUrl }));
      setImageUploadNotice('Image uploaded & optimized successfully! 📸');
      if (showToast) {
        showToast('Image Uploaded! 📸', `New photo prepared for ${formData.name || 'product'}.`);
      }
      setTimeout(() => setImageUploadNotice(null), 3500);
    } catch (err) {
      console.warn('Image processing fallback:', err);
      // Fallback to basic FileReader
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          setFormData(prev => ({ ...prev, image: e.target?.result as string }));
          setImageUploadNotice('Image loaded successfully.');
          setTimeout(() => setImageUploadNotice(null), 3000);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('Please enter a product title / name.');
      return;
    }
    onSave(formData);
  };

  // Stock presets for quick photo swaps
  const stockPresets = [
    { label: '👕 T-Shirt', url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80' },
    { label: '🧥 Hoodie', url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80' },
    { label: '🎽 Reflector & Apron', url: '/assets/images/apron_bulk_production_1786094965199.jpg' },
    { label: '🚩 Rollup Banner', url: '/assets/images/rollup_banner_8500_1785222380932.jpg' },
    { label: '☕ Ceramic Mug', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80' },
    { label: '📄 Flyer / Poster', url: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=800&auto=format&fit=crop&q=80' },
    { label: '🕊️ Eulogy / Program', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80' },
    { label: '🧢 Embroidered Cap', url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&auto=format&fit=crop&q=80' },
    { label: '🏷️ Stickers & Decals', url: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=800&auto=format&fit=crop&q=80' },
    { label: '🏢 Acrylic Signage', url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80' }
  ];

  return (
    <div 
      id="admin-product-edit-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        id="admin-product-edit-modal-container"
        className="bg-slate-900 text-white border border-slate-700/80 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Sticky Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-white text-base shadow-md shrink-0">
              {isNew ? <Plus className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-base text-white">
                  {isNew ? 'Add New Product to Price Catalogue' : 'Update Price Catalogue Product'}
                </h3>
                <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {formData.category}
                </span>
                {!isNew && (
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Live in Catalogue
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isNew 
                  ? 'Upload images and enter price details to publish on the live catalogue' 
                  : `Editing: ${formData.name || 'Untitled Item'} • Changes reflect live instantly`}
              </p>
            </div>
          </div>

          <button
            id="close-product-edit-modal-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-700/80 transition-colors cursor-pointer shrink-0"
            title="Close dialogue box (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">

          {/* SECTION 1: PROMINENT IMAGE UPLOAD DIALOGUE BOX */}
          <div 
            id="product-image-upload-dialog-section"
            className="bg-slate-800/90 rounded-2xl p-4 sm:p-5 border-2 border-blue-500/40 shadow-inner space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider">
                    Product Images & Photo Asset Upload
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    Upload crystal-clear product photos for the shop and printed price catalogue
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="bg-slate-900 border border-slate-700 text-slate-300 text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                  <FileCheck className="w-3 h-3 text-emerald-400" /> Auto-Optimized for Live Catalogue
                </span>
              </div>
            </div>

            {/* Drag & Drop Upload Zone & Live Preview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* Photo Preview Box */}
              <div className="lg:col-span-5 flex flex-col gap-2">
                <div className="relative aspect-4/3 sm:aspect-16/10 bg-slate-950 rounded-2xl overflow-hidden border border-slate-700 shadow-md group flex items-center justify-center">
                  {formData.image ? (
                    <img
                      src={formData.image}
                      alt={formData.name || 'Product preview'}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = getProductFallbackImage(formData.name, formData.category);
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="text-center p-4 text-slate-500">
                      <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-50 text-slate-400" />
                      <span className="text-xs font-bold text-slate-300 block">No Image Selected</span>
                      <span className="text-[10px] text-slate-500">Drop an image or choose below</span>
                    </div>
                  )}

                  {/* Overlay Badge */}
                  <div className="absolute top-2.5 left-2.5 bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg border border-slate-700/80 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Live Catalogue Preview</span>
                  </div>

                  {/* Quick Change Overlay on hover */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-slate-950/70 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 cursor-pointer"
                  >
                    <Camera className="w-6 h-6 text-amber-300" />
                    <span className="text-xs font-bold">Click to Replace Photo</span>
                  </button>
                </div>

                {/* Reset to Original Template Button */}
                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-slate-400 font-medium">Original default template:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const defaultImg = INITIAL_PRODUCTS.find(p => p.id === formData.id)?.image || getProductFallbackImage(formData.name, formData.category);
                      setFormData(prev => ({ ...prev, image: defaultImg }));
                      if (showToast) {
                        showToast('Template Photo Restored 🔄', 'Restored default stock photo for this product.');
                      }
                    }}
                    className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                    title="Restore default stock photo"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset Default Photo
                  </button>
                </div>
              </div>

              {/* Upload Controls & Presets */}
              <div className="lg:col-span-7 space-y-3">
                {/* Drag and Drop Zone */}
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all duration-150 flex flex-col items-center justify-center gap-2 group ${
                    isDragging
                      ? 'border-blue-400 bg-blue-950/40 shadow-lg ring-2 ring-blue-400/50'
                      : 'border-slate-600 hover:border-blue-400 bg-slate-900/70 hover:bg-slate-900'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    id="product-modal-photo-file-input"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileProcess(file);
                      }
                    }}
                  />

                  <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-all shadow-sm">
                    {isProcessingImage ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Upload className="w-6 h-6" />
                    )}
                  </div>

                  <div>
                    <span className="text-xs sm:text-sm font-extrabold text-slate-100 block">
                      {isProcessingImage ? 'Optimizing Image...' : 'Click to Upload Product Photo or Drag & Drop Here'}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Supports PNG, JPG, WEBP, SVG • High-DPI Camera photos automatically scaled & compressed
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold border border-blue-500/30">
                    <Sparkles className="w-3 h-3 text-amber-300" /> Instant Live Price Catalogue Sync
                  </span>
                </div>

                {/* Status Notice if uploaded */}
                {imageUploadNotice && (
                  <div className="bg-emerald-950/80 border border-emerald-700/80 text-emerald-300 text-xs px-3 py-2 rounded-xl flex items-center gap-2 animate-in fade-in duration-150">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{imageUploadNotice}</span>
                  </div>
                )}

                {/* Quick Stock Sample Presets */}
                <div className="bg-slate-900/60 border border-slate-700/60 rounded-xl p-3 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Or Pick a High-Res Stock Preset:
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                    {stockPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, image: preset.url }));
                          setImageUploadNotice(`Selected stock photo for ${preset.label}.`);
                          setTimeout(() => setImageUploadNotice(null), 2500);
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white rounded-lg text-[11px] font-semibold transition-all border border-slate-700 hover:border-blue-500 cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Direct Image URL input */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase shrink-0">Image URL:</span>
                  <input
                    type="url"
                    placeholder="https://example.com/product-image.jpg"
                    value={formData.image}
                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: PRODUCT PRICING & CATALOGUE INFORMATION */}
          <div className="bg-slate-800/50 rounded-2xl p-4 sm:p-5 border border-slate-700/60 space-y-4">
            <h4 className="text-xs font-black text-blue-400 uppercase tracking-wider flex items-center gap-2">
              <Tag className="w-4 h-4" /> Price Catalogue Details & Specifications
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              {/* Product Title */}
              <div className="sm:col-span-2">
                <label className="text-slate-300 font-bold block mb-1.5">
                  Product Title / Name <span className="text-red-400">*</span>:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Roll-Up Banner Printing, Executive Polo Shirt..."
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-bold focus:border-blue-500 focus:outline-none placeholder-slate-500 text-sm"
                />
              </div>

              {/* Category */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-300 font-bold block">
                    Category <span className="text-red-400">*</span>:
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCategoryManagerOpen(true)}
                    className="text-[11px] text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Add or remove categories from catalogue"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    <span>Manage Categories</span>
                  </button>
                </div>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as ProductCategory }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-bold focus:border-blue-500 focus:outline-none"
                >
                  {categories.filter(c => c !== 'All').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Selling Price */}
              <div>
                <label className="text-slate-300 font-bold block mb-1.5">
                  Live Selling Price (KSh):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">KSh</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: Math.max(0, parseInt(e.target.value) || 0) }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-12 pr-3 text-emerald-400 font-black text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Original Price */}
              <div>
                <label className="text-slate-300 font-bold block mb-1.5">
                  Original Price (KSh strike-through):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">KSh</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.originalPrice || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: Math.max(0, parseInt(e.target.value) || 0) }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-12 pr-3 text-slate-300 font-semibold focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Custom Price Display Label */}
              <div>
                <label className="text-slate-300 font-bold block mb-1.5">
                  Custom Price Label (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. KSh 6,500 Light / KSh 8,500 Heavy"
                  value={formData.priceDisplay || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, priceDisplay: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:border-blue-500 focus:outline-none placeholder-slate-500"
                />
              </div>

              {/* Stock Quantity */}
              <div>
                <label className="text-slate-300 font-bold block mb-1.5">
                  Available Stock Count:
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stockCount}
                  onChange={(e) => setFormData(prev => ({ ...prev, stockCount: Math.max(0, parseInt(e.target.value) || 0) }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-bold focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Minimum Order Quantity */}
              <div>
                <label className="text-slate-300 font-bold block mb-1.5">
                  Minimum Order Quantity (MOQ):
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.customizationOptions?.minQuantity || 1}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    customizationOptions: {
                      ...prev.customizationOptions,
                      minQuantity: Math.max(1, parseInt(e.target.value) || 1)
                    }
                  }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-bold focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: SIZES & FINISHES */}
          <div className="bg-slate-800/40 rounded-2xl p-4 sm:p-5 border border-slate-700/60 space-y-3 text-xs">
            <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" /> Customization Options (Sizes & Finishes)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 font-bold block mb-1.5">Available Sizes (comma separated):</label>
                <input
                  type="text"
                  placeholder="S, M, L, XL, XXL or A4, A3, A2, 2x1m"
                  value={formData.customizationOptions?.sizes?.join(', ') || ''}
                  onChange={(e) => {
                    const sizesArr = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                    setFormData(prev => ({
                      ...prev,
                      customizationOptions: {
                        ...prev.customizationOptions,
                        sizes: sizesArr
                      }
                    }));
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono text-xs focus:border-blue-500 focus:outline-none placeholder-slate-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1.5">Available Finishes / Variations (comma separated):</label>
                <input
                  type="text"
                  placeholder="Screen Print, Embroidery, Matte Lamination, Glossy"
                  value={formData.customizationOptions?.finishes?.join(', ') || ''}
                  onChange={(e) => {
                    const finishesArr = e.target.value.split(',').map(f => f.trim()).filter(Boolean);
                    setFormData(prev => ({
                      ...prev,
                      customizationOptions: {
                        ...prev.customizationOptions,
                        finishes: finishesArr
                      }
                    }));
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono text-xs focus:border-blue-500 focus:outline-none placeholder-slate-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: DESCRIPTION & FEATURES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-300 font-bold block mb-1.5">Full Product Description:</label>
              <textarea
                rows={4}
                placeholder="Write detailed specifications, fabric GSM, print durability, turnaround time, or material details..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white leading-relaxed focus:border-blue-500 focus:outline-none placeholder-slate-500 text-xs"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1.5">Key Highlights & Features (one per line):</label>
              <textarea
                rows={4}
                placeholder={`High DPI 300DPI Print Clarity\nWaterproof & Fade-Resistant Inks\nFast Countrywide Express Delivery`}
                value={formData.features?.join('\n') || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  features: e.target.value.split('\n').filter(f => f.trim() !== '')
                }))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white leading-relaxed focus:border-blue-500 focus:outline-none placeholder-slate-500 font-mono text-[11px]"
              />
            </div>
          </div>

          {/* SECTION 5: BADGES & TOGGLES */}
          <div className="flex flex-wrap gap-3 items-center pt-1 border-t border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer bg-slate-800/80 hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-700 select-none">
              <input
                type="checkbox"
                checked={formData.isFlashDeal || false}
                onChange={(e) => setFormData(prev => ({ ...prev, isFlashDeal: e.target.checked }))}
                className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-600 focus:ring-0"
              />
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-amber-400" /> Flash Deal Banner
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer bg-slate-800/80 hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-700 select-none">
              <input
                type="checkbox"
                checked={formData.expressDeliveryAvailable || false}
                onChange={(e) => setFormData(prev => ({ ...prev, expressDeliveryAvailable: e.target.checked }))}
                className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-600 focus:ring-0"
              />
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> 24h Express Printing Ready
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer bg-slate-800/80 hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-700 select-none">
              <input
                type="checkbox"
                checked={formData.isQuoteOnly || false}
                onChange={(e) => setFormData(prev => ({ ...prev, isQuoteOnly: e.target.checked }))}
                className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-600 focus:ring-0"
              />
              <span className="text-xs font-bold text-slate-300">
                Quote-Only (WhatsApp Inquiry Required)
              </span>
            </label>
          </div>
        </div>

        {/* Sticky Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-800/90 border-t border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Changes persist immediately across the shop, rate card & price catalogue</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              id="cancel-product-edit-modal-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer border border-slate-700"
            >
              Cancel
            </button>

            <button
              id="save-product-edit-modal-btn"
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save & Update Price Catalogue</span>
            </button>
          </div>
        </div>
      </div>

      {/* Embedded Category Manager Dialogue Box */}
      <AdminCategoryManagerModal
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
        onSelectCategory={(newCat) => {
          setFormData(prev => ({ ...prev, category: newCat }));
        }}
      />
    </div>
  );
};
