import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  QrCode, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  ExternalLink, 
  RefreshCw, 
  Palette, 
  Layers, 
  Smartphone, 
  LogIn, 
  UserPlus, 
  FileText, 
  CheckCircle2, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  Award,
  Crown,
  Eye,
  Sliders,
  Share2
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AdminQrStudio: React.FC = () => {
  const { wpSettings, showToast } = useApp();

  // QR Configuration State
  const [qrPreset, setQrPreset] = useState<'signup' | 'login' | 'shop' | 'whatsapp' | 'paybill' | 'custom'>('signup');
  const [customUrl, setCustomUrl] = useState('');
  const [qrColor, setQrColor] = useState('#1e40af'); // Classic Royal Blue
  const [qrBgColor, setQrBgColor] = useState('#ffffff');
  const [qrSize, setQrSize] = useState<number>(400);
  const [includeCenterLogo, setIncludeCenterLogo] = useState(true);
  const [posterTemplate, setPosterTemplate] = useState<'a4_poster' | 'counter_tent' | 'delivery_insert'>('a4_poster');
  const [copiedLink, setCopiedLink] = useState(false);

  // Generated QR Data URL
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrSvgString, setQrSvgString] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Derive target URL based on preset
  const getBaseOrigin = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'https://woodynatdesigners.co.ke';
  };

  const getTargetUrl = () => {
    const origin = getBaseOrigin();
    switch (qrPreset) {
      case 'signup':
        return `${origin}/?auth=register&ref=qrcode`;
      case 'login':
        return `${origin}/?auth=login&ref=qrcode`;
      case 'shop':
        return `${origin}/?ref=qrcode_store`;
      case 'whatsapp':
        return `https://wa.me/254${(wpSettings.whatsappNumber || '0797939199').replace(/^0/, '')}?text=Hello%20Woodynat%20Designers%2C%20I%20scanned%20your%20QR%20code%20and%20would%20like%20to%20order%20or%20inquire.`;
      case 'paybill':
        return `${origin}/?ref=mpesa_paybill_${wpSettings.paybillNumber || '247247'}`;
      case 'custom':
        return customUrl.trim() || origin;
      default:
        return `${origin}/?auth=register&ref=qrcode`;
    }
  };

  const currentUrl = getTargetUrl();

  // Generate QR Code with optional embedded logo
  const generateQRCode = async () => {
    setIsGenerating(true);
    try {
      // 1. Generate base QR on hidden canvas
      const canvas = document.createElement('canvas');
      const targetSize = Math.max(qrSize, 600); // High-res canvas
      canvas.width = targetSize;
      canvas.height = targetSize;

      await QRCode.toCanvas(canvas, currentUrl, {
        width: targetSize,
        margin: 2,
        color: {
          dark: qrColor,
          light: qrBgColor
        },
        errorCorrectionLevel: 'H' // High error correction for logo overlay
      });

      const ctx = canvas.getContext('2d');
      if (ctx && includeCenterLogo) {
        // Draw centered logo circle & emblem
        const center = targetSize / 2;
        const radius = targetSize * 0.12;

        // White background circle with shadow
        ctx.save();
        ctx.beginPath();
        ctx.arc(center, center, radius + 8, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = qrColor;
        ctx.stroke();

        // Inner circle
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, 2 * Math.PI);
        ctx.fillStyle = qrColor;
        ctx.fill();

        // Draw "W" or Crown emblem text in center
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.round(radius * 1.1)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('W', center, center + 2);
        ctx.restore();
      }

      const dataUrl = canvas.toDataURL('image/png');
      setQrDataUrl(dataUrl);

      // Also generate raw SVG string
      const svg = await QRCode.toString(currentUrl, {
        type: 'svg',
        margin: 2,
        color: {
          dark: qrColor,
          light: qrBgColor
        },
        errorCorrectionLevel: 'H'
      });
      setQrSvgString(svg);

    } catch (err) {
      console.error('QR generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    generateQRCode();
  }, [currentUrl, qrColor, qrBgColor, qrSize, includeCenterLogo]);

  // Handle Copy Link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    showToast('Link Copied! 📋', 'Direct signup/login URL copied to clipboard.');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Handle Download High-Res PNG
  const handleDownloadPng = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `woodynat-qrcode-${qrPreset}-${Date.now()}.png`;
    link.href = qrDataUrl;
    link.click();
    showToast('High-Res QR Code Downloaded! 📥', 'PNG image ready for graphic design or social posting.');
  };

  // Handle Download SVG
  const handleDownloadSvg = () => {
    if (!qrSvgString) return;
    const blob = new Blob([qrSvgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `woodynat-qrcode-${qrPreset}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Vector SVG Downloaded! 🎨', 'Crisp vector graphic ready for vinyl cut & large format printing.');
  };

  // Handle Print Action - Prints ONLY the QR code in an isolated clean frame
  const handlePrintOnlyQr = (mode: 'pure_qr' | 'qr_card' = 'pure_qr') => {
    if (!qrDataUrl) return;

    // Create or reuse hidden print iframe
    let printIframe = document.getElementById('woodynat-qr-print-iframe') as HTMLIFrameElement;
    if (!printIframe) {
      printIframe = document.createElement('iframe');
      printIframe.id = 'woodynat-qr-print-iframe';
      printIframe.style.position = 'fixed';
      printIframe.style.right = '0';
      printIframe.style.bottom = '0';
      printIframe.style.width = '0';
      printIframe.style.height = '0';
      printIframe.style.border = '0';
      document.body.appendChild(printIframe);
    }

    const iframeDoc = printIframe.contentDocument || printIframe.contentWindow?.document;
    if (!iframeDoc) {
      window.print();
      return;
    }

    const titleText = 
      qrPreset === 'signup' ? 'Scan to Register & Sign Up' :
      qrPreset === 'login' ? 'Scan to Log In' :
      qrPreset === 'shop' ? 'Scan for Full Store Catalogue' :
      qrPreset === 'whatsapp' ? 'Scan to Chat on WhatsApp' :
      qrPreset === 'paybill' ? 'M-Pesa Paybill: 247247' :
      'Scan to Access Portal';

    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title>Woodynat QR Code</title>
          <style>
            @page {
              size: auto;
              margin: 15mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              background: #ffffff;
              color: #0f172a;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 90vh;
              text-align: center;
              padding: 20px;
            }
            .qr-print-wrapper {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              margin: auto;
              text-align: center;
            }
            .qr-brand {
              font-size: 16px;
              font-weight: 800;
              letter-spacing: 1.5px;
              text-transform: uppercase;
              color: #1e40af;
              margin-bottom: 6px;
            }
            .qr-header-title {
              font-size: 22px;
              font-weight: 900;
              color: #0f172a;
              margin-bottom: 20px;
            }
            .qr-code-box {
              display: flex;
              align-items: center;
              justify-content: center;
              background: #ffffff;
              padding: 16px;
              border-radius: 20px;
            }
            .qr-img {
              width: 360px;
              height: 360px;
              object-fit: contain;
              display: block;
            }
            .qr-instructions {
              margin-top: 18px;
              font-size: 14px;
              font-weight: 700;
              color: #334155;
            }
            .qr-url {
              margin-top: 6px;
              font-size: 11px;
              font-family: monospace;
              color: #64748b;
              word-break: break-all;
              max-width: 400px;
            }
          </style>
        </head>
        <body>
          <div class="qr-print-wrapper">
            ${mode === 'qr_card' ? `
              <div class="qr-brand">Woodynat Designers Limited</div>
              <div class="qr-header-title">${titleText}</div>
            ` : ''}
            
            <div class="qr-code-box">
              <img src="${qrDataUrl}" alt="Woodynat QR Code" class="qr-img" />
            </div>

            <div class="qr-instructions">Point your smartphone camera to scan</div>
            <div class="qr-url">${currentUrl}</div>
          </div>
        </body>
      </html>
    `);
    iframeDoc.close();

    showToast('Printing QR Code... 🖨️', 'Opening printer dialog for isolated QR code.');

    setTimeout(() => {
      printIframe.contentWindow?.focus();
      printIframe.contentWindow?.print();
    }, 300);
  };

  return (
    <div className="space-y-8">
      {/* Studio Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-900/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-blue-600 text-white font-black text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-md flex items-center gap-1">
              <QrCode className="w-3 h-3" /> OFFICIAL QR CODE STATION
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-mono px-2 py-0.5 rounded-md border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Clean QR-Only Print Enabled
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Customer Login & Sign Up QR Code Studio
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Generate, customize, and print high-resolution scannable QR codes for walk-in clients at the Gatkim Complex studio, tabletop counter stands, business cards, delivery packages, and roll-up banners.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => handlePrintOnlyQr('pure_qr')}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-5 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-amber-400/20 transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0"
          >
            <Printer className="w-4 h-4" />
            <span>Print QR Code Only</span>
          </button>

          <button
            onClick={handleDownloadPng}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG (HD)</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Preset & Design Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Preset Selector Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" /> 1. QR Code Target Action
              </h3>
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full">
                Active Intent
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setQrPreset('signup')}
                className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                  qrPreset === 'signup'
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-600 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/30'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <UserPlus className="w-4 h-4 text-blue-600" />
                  {qrPreset === 'signup' && <Check className="w-3.5 h-3.5 text-blue-600 font-bold" />}
                </div>
                <div className="text-xs font-black">Register & Sign Up</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Direct account creation portal</div>
              </button>

              <button
                type="button"
                onClick={() => setQrPreset('login')}
                className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                  qrPreset === 'login'
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-600 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/30'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <LogIn className="w-4 h-4 text-indigo-600" />
                  {qrPreset === 'login' && <Check className="w-3.5 h-3.5 text-indigo-600 font-bold" />}
                </div>
                <div className="text-xs font-black">Instant Member Login</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Quick sign-in for existing users</div>
              </button>

              <button
                type="button"
                onClick={() => setQrPreset('shop')}
                className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                  qrPreset === 'shop'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-600 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/30'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  {qrPreset === 'shop' && <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" />}
                </div>
                <div className="text-xs font-black">Store & Price Rates</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Full 300DPI product catalogue</div>
              </button>

              <button
                type="button"
                onClick={() => setQrPreset('whatsapp')}
                className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                  qrPreset === 'whatsapp'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-600 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/30'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  {qrPreset === 'whatsapp' && <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" />}
                </div>
                <div className="text-xs font-black">WhatsApp 24/7 Chat</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">0797939199 Instant Quote</div>
              </button>

              <button
                type="button"
                onClick={() => setQrPreset('paybill')}
                className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                  qrPreset === 'paybill'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-600 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/30'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  {qrPreset === 'paybill' && <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" />}
                </div>
                <div className="text-xs font-black">M-Pesa Paybill 247247</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Official payment instructions</div>
              </button>

              <button
                type="button"
                onClick={() => setQrPreset('custom')}
                className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                  qrPreset === 'custom'
                    ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/30'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <ExternalLink className="w-4 h-4 text-amber-600" />
                  {qrPreset === 'custom' && <Check className="w-3.5 h-3.5 text-amber-600 font-bold" />}
                </div>
                <div className="text-xs font-black">Custom URL Link</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Promo, social or campaign link</div>
              </button>
            </div>

            {/* Custom URL Input Field */}
            {qrPreset === 'custom' && (
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Custom Destination Web Address / URL:
                </label>
                <input
                  type="url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://woodynatdesigners.co.ke/promo"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            )}

            {/* Target URL Preview & Copy */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400">
                <span>Scanned Destination URL:</span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
              <div className="text-xs font-mono text-slate-900 dark:text-white break-all bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                {currentUrl}
              </div>
            </div>
          </div>

          {/* Styling & Customization Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-blue-600" /> 2. Brand Colors & Center Logo
              </h3>
              <span className="text-[11px] font-bold text-slate-500">Customization</span>
            </div>

            {/* Color Presets */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                QR Code Color Palette:
              </label>
              <div className="flex items-center gap-2.5 flex-wrap">
                {[
                  { name: 'Woodynat Royal Blue', hex: '#1e40af' },
                  { name: 'Premium Slate Black', hex: '#0f172a' },
                  { name: 'Safaricom M-Pesa Green', hex: '#047857' },
                  { name: 'Warm Amber Gold', hex: '#d97706' },
                  { name: 'Crimson Accent', hex: '#b91c1c' },
                ].map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setQrColor(c.hex)}
                    title={c.name}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                      qrColor === c.hex ? 'ring-3 ring-blue-500 scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  >
                    {qrColor === c.hex && <Check className="w-4 h-4 text-white font-black" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Logo Center Toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="space-y-0.5">
                <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-amber-500" />
                  <span>Embed Woodynat Brand Emblem in Center</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Adds official 'W' crest overlay with error correction
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCenterLogo}
                  onChange={(e) => setIncludeCenterLogo(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Poster Template Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Select Display & Print Template:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'a4_poster', label: 'A4 Wall Poster', desc: 'Standard showroom poster' },
                  { id: 'counter_tent', label: 'Counter Stand', desc: 'Reception desk tent card' },
                  { id: 'delivery_insert', label: 'Delivery Card', desc: 'Package insert flyer' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setPosterTemplate(t.id as any)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      posterTemplate === t.id
                        ? 'bg-blue-600 text-white border-blue-600 font-black shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold">{t.label}</div>
                    <div className={`text-[9px] ${posterTemplate === t.id ? 'text-blue-100' : 'text-slate-400'}`}>
                      {t.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Poster Preview & Printable Layout (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-600" /> Print-Ready Poster Preview (What Customers See)
            </h3>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              300 DPI Vector Precision
            </span>
          </div>

          {/* Printable Poster Card Container */}
          <div 
            id="woodynat-printable-poster"
            className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-xl space-y-6 relative overflow-hidden transition-all"
            style={{ minHeight: '620px' }}
          >
            {/* Top Brand Accent Stripe */}
            <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-blue-700 via-indigo-600 to-amber-400"></div>

            {/* Poster Header */}
            <div className="text-center space-y-2 pt-2">
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 px-3.5 py-1 rounded-full text-blue-800 text-xs font-black uppercase tracking-wider">
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                <span>Woodynat Designers Limited</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                {qrPreset === 'signup' && 'SCAN TO REGISTER & SHOP ONLINE'}
                {qrPreset === 'login' && 'SCAN TO LOG IN TO YOUR ACCOUNT'}
                {qrPreset === 'shop' && 'SCAN FOR FULL PRICE CATALOGUE'}
                {qrPreset === 'whatsapp' && 'SCAN TO CHAT ON WHATSAPP'}
                {qrPreset === 'paybill' && 'OFFICIAL M-PESA PAYBILL 247247'}
                {qrPreset === 'custom' && 'SCAN FOR OFFICIAL DIGITAL PORTAL'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-md mx-auto">
                Point your smartphone camera at the QR code below to instantly open the Woodynat Designers online system.
              </p>
            </div>

            {/* Centered QR Code Box */}
            <div className="flex flex-col items-center justify-center my-4">
              <div 
                id="woodynat-qr-print-target"
                className="bg-slate-50 p-4 sm:p-6 rounded-3xl border-2 border-dashed border-slate-300 shadow-inner inline-block text-center relative group"
              >
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Woodynat QR Code"
                    className="w-56 h-56 sm:w-64 sm:h-64 object-contain mx-auto rounded-xl shadow-xs"
                  />
                ) : (
                  <div className="w-56 h-56 flex items-center justify-center text-slate-400">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                )}
                <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-extrabold text-slate-700">
                  <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                  <span>Works with any iPhone & Android Camera</span>
                </div>
              </div>
            </div>

            {/* Poster Info Grid: Paybill & Physical Studio Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
              
              {/* M-Pesa Official Credentials */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5 space-y-1">
                <div className="text-[10px] font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Official M-Pesa Paybill</span>
                </div>
                <div className="text-sm font-black text-emerald-950">
                  Paybill: <span className="font-mono text-base text-emerald-700">{wpSettings.paybillNumber || '247247'}</span>
                </div>
                <div className="text-xs font-bold text-emerald-900">
                  Acc No: <span className="font-mono text-emerald-800">{wpSettings.paybillAccount || '0797939199'}</span>
                </div>
                <p className="text-[10px] text-emerald-700 leading-tight">
                  Instant STK Push & Daraja automated transaction verification.
                </p>
              </div>

              {/* Physical Workshop Location */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-3.5 space-y-1">
                <div className="text-[10px] font-black text-blue-800 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>Nairobi CBD Workshop</span>
                </div>
                <div className="text-xs font-black text-slate-900">
                  Temple Road, Gatkim Complex Building
                </div>
                <div className="text-xs font-bold text-blue-700">
                  Fourth Floor, Wing B, Room 4B1
                </div>
                <p className="text-[10px] text-slate-600 leading-tight flex items-center gap-1">
                  <Phone className="w-3 h-3 text-blue-600" /> 0797939199 / 0712345678
                </p>
              </div>
            </div>

            {/* Poster Footer Note */}
            <div className="text-center pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold flex-wrap gap-2">
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-blue-600" /> High Precision 300DPI Commercial Printing
              </span>
              <span>woodynatdesigners12@gmail.com</span>
            </div>
          </div>

          {/* Quick Action Buttons Toolbar */}
          <div className="flex items-center gap-3 justify-end flex-wrap pt-2">
            <a
              href={currentUrl}
              target="_blank"
              rel="noreferrer"
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
              <span>Test Scan Link in New Tab</span>
            </a>

            <button
              onClick={handleDownloadSvg}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Export Vector SVG</span>
            </button>

            <button
              onClick={() => handlePrintOnlyQr('pure_qr')}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
              title="Print strictly the standalone scannable QR code without system UI"
            >
              <Printer className="w-4 h-4" />
              <span>Print QR Code Only</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
