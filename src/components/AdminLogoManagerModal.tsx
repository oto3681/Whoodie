import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { optimizeProductImage } from '../utils/imageOptimizer';
import { 
  Upload, 
  X, 
  Sparkles, 
  CheckCircle2, 
  RotateCcw, 
  Image as ImageIcon, 
  Eye, 
  Link, 
  Check, 
  ShieldCheck,
  Smartphone,
  Globe,
  FileText
} from 'lucide-react';
import { Logo } from './Logo';

interface AdminLogoManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminLogoManagerModal: React.FC<AdminLogoManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { wpSettings, updateWpSettings, showToast } = useApp();

  const [logoInputType, setLogoInputType] = useState<'upload' | 'url' | 'presets'>('upload');
  const [newLogoUrl, setNewLogoUrl] = useState(wpSettings.siteLogo || '');
  const [previewLogo, setPreviewLogo] = useState(wpSettings.siteLogo || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const officialPresets = [
    {
      name: 'Default Official WoodyNat Logo (Emblem & Typography)',
      url: '/assets/images/woodynat_official_logo.jpg',
      desc: 'The official high-definition WoodyNat Designers Ltd graphic logo with Red emblem and Blue N oval.'
    },
    {
      name: 'Clean Vector Emblem',
      url: '',
      desc: 'Default built-in scalable SVG vector emblem.'
    }
  ];

  const processAndCompressFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Invalid File Type', 'Please upload a valid image file (PNG, JPG, SVG, WebP).', 'warning');
      return;
    }

    setIsProcessing(true);
    setSelectedFileName(file.name);

    try {
      const optimized = await optimizeProductImage(file, { maxDimension: 900, quality: 0.88 });
      setPreviewLogo(optimized);
      setNewLogoUrl(optimized);
      setIsProcessing(false);
    } catch (err) {
      console.warn('Logo optimization fallback:', err);
      const reader = new FileReader();
      reader.onload = (e) => {
        const fallbackUrl = e.target?.result as string;
        setPreviewLogo(fallbackUrl);
        setNewLogoUrl(fallbackUrl);
        setIsProcessing(false);
      };
      reader.onerror = () => {
        setIsProcessing(false);
        showToast('Image Load Error', 'Could not parse the selected image file.', 'error');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processAndCompressFile(e.dataTransfer.files[0]);
    }
  };

  const handleSaveAndActivateLogo = () => {
    updateWpSettings({ siteLogo: previewLogo });
    showToast(
      'New Logo Activated! 🎨',
      previewLogo ? 'Your new custom logo is now live across all website pages and navigation headers.' : 'Restored official default WoodyNat Designers logo.'
    );
    onClose();
  };

  const handleResetToDefault = () => {
    setPreviewLogo('');
    setNewLogoUrl('');
    setSelectedFileName('');
    updateWpSettings({ siteLogo: '' });
    showToast('Logo Reset 🔄', 'Restored official default WoodyNat Designers Ltd logo.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150 my-8">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-black">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white">
                  Insert / Change Official Site Logo
                </h3>
                <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Admin CMS
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload or paste a new logo image. Updates become live immediately across the entire site.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Method Selection Tabs */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setLogoInputType('upload')}
              className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                logoInputType === 'upload'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload Image File</span>
            </button>

            <button
              type="button"
              onClick={() => setLogoInputType('url')}
              className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                logoInputType === 'url'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Link className="w-4 h-4" />
              <span>Paste Image URL</span>
            </button>

            <button
              type="button"
              onClick={() => setLogoInputType('presets')}
              className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                logoInputType === 'presets'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Official Presets</span>
            </button>
          </div>

          {/* TAB 1: FILE UPLOAD (DRAG & DROP) */}
          {logoInputType === 'upload' && (
            <div className="space-y-3">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50/80 scale-[1.01]'
                    : 'border-slate-300 hover:border-blue-500 bg-slate-50/70 hover:bg-blue-50/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp, image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) processAndCompressFile(file);
                  }}
                />

                <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
                  <Upload className="w-7 h-7" />
                </div>

                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-slate-800">
                    Click to browse or drag and drop your logo file here
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Supports PNG (with transparency), SVG, JPG, WebP, GIF. High-resolution vector or 300DPI graphics recommended.
                  </p>
                </div>

                {selectedFileName && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 mt-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    Selected: {selectedFileName}
                  </span>
                )}

                {isProcessing && (
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-600 animate-pulse">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Optimizing and processing image...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: DIRECT URL */}
          {logoInputType === 'url' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Direct Image Web URL:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newLogoUrl}
                    onChange={(e) => {
                      setNewLogoUrl(e.target.value);
                      setPreviewLogo(e.target.value);
                    }}
                    placeholder="https://example.com/images/woodynat-brand-logo.png"
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setPreviewLogo(newLogoUrl)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Test URL</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Paste any public HTTPS image link from Cloudinary, Imgur, Firebase, AWS, or your media server.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: PRESETS */}
          {logoInputType === 'presets' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600 font-medium">
                Choose one of the official system brand presets:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {officialPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPreviewLogo(preset.url);
                      setNewLogoUrl(preset.url);
                      setSelectedFileName(preset.name);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      previewLogo === preset.url
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="h-16 bg-white rounded-xl border border-slate-200 p-2 flex items-center justify-center">
                      <img
                        src={preset.url || '/assets/images/woodynat_official_logo.jpg'}
                        alt={preset.name}
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/assets/images/woodynat_official_logo.jpg';
                        }}
                      />
                    </div>
                    <div>
                      <h5 className="font-extrabold text-xs text-slate-900">{preset.name}</h5>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{preset.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* LIVE MULTI-ENVIRONMENT PREVIEWS */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-blue-600" />
                Live Multi-Environment Preview
              </span>
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {previewLogo ? 'Custom Logo Loaded' : 'Default Official Logo'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Preview 1: Header / Light Mode Navbar */}
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Globe className="w-3 h-3 text-blue-500" /> Light Navbar Appearance
                  </span>
                  <span className="text-slate-400">Header</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-center min-h-[90px]">
                  {previewLogo ? (
                    <img
                      src={previewLogo}
                      alt="Logo Preview Light"
                      className="max-h-16 w-auto object-contain"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/assets/images/woodynat_official_logo.jpg';
                      }}
                    />
                  ) : (
                    <Logo variant="full" size="md" />
                  )}
                </div>
              </div>

              {/* Preview 2: Dark Footer Appearance */}
              <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-4 shadow-sm space-y-2 text-white">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3 text-amber-400" /> Dark Footer Appearance
                  </span>
                  <span className="text-slate-500">Footer</span>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-center min-h-[90px]">
                  <div className="bg-white p-1.5 rounded-xl">
                    {previewLogo ? (
                      <img
                        src={previewLogo}
                        alt="Logo Preview Dark"
                        className="max-h-14 w-auto object-contain"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/assets/images/woodynat_official_logo.jpg';
                        }}
                      />
                    ) : (
                      <Logo variant="white" size="sm" />
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-50 p-4 sm:p-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            {wpSettings.siteLogo && (
              <button
                type="button"
                onClick={handleResetToDefault}
                className="text-xs font-bold text-slate-600 hover:text-red-600 flex items-center gap-1.5 transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-red-50"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Reset to Official Default Logo</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial bg-white hover:bg-slate-100 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs border border-slate-300 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSaveAndActivateLogo}
              className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Activate New Logo Live</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
