import { jsPDF } from 'jspdf';
import { Product, CataloguePrintConfig, WordPressSettings, CustomerInquiry } from '../types';

/**
 * Generates and downloads a branded PDF catalogue using jsPDF.
 */
export const generateCataloguePdf = (
  products: Product[],
  config: CataloguePrintConfig,
  wpSettings: WordPressSettings,
  customer?: { name?: string; phone?: string; email?: string; companyName?: string }
): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let y = margin;

  const addNewPageIfNeeded = (requiredHeight: number) => {
    if (y + requiredHeight > pageHeight - margin - 15) {
      // Add Footer before new page
      doc.setFontSize(8);
      doc.setTextColor(130, 140, 150);
      doc.text(
        `Woodynat Designers Limited | Tel: ${wpSettings.whatsappNumber} | Paybill: ${wpSettings.paybillNumber} (Acc: ${wpSettings.paybillAccount})`,
        margin,
        pageHeight - 8
      );
      doc.text(`Page ${doc.getNumberOfPages()}`, pageWidth - margin - 15, pageHeight - 8);

      doc.addPage();
      y = margin;
      drawHeaderBanner(false);
    }
  };

  const drawHeaderBanner = (isFirstPage: boolean) => {
    // Header background bar
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(margin, y, pageWidth - (margin * 2), isFirstPage ? 32 : 16, 'F');

    // Accent line
    doc.setFillColor(246, 139, 30); // primary orange
    doc.rect(margin, y + (isFirstPage ? 32 : 16), pageWidth - (margin * 2), 1.5, 'F');

    // Title text
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(isFirstPage ? 14 : 10);
    doc.text(wpSettings.siteTitle || 'WOODYNAT DESIGNERS LIMITED', margin + 6, y + (isFirstPage ? 10 : 7));

    if (isFirstPage) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(220, 230, 240);
      doc.text(config.title || 'Official Print Catalogue & Custom Quotation', margin + 6, y + 17);

      doc.setFontSize(8);
      doc.setTextColor(180, 195, 210);
      doc.text(
        `Address: ${wpSettings.companyAddress}, ${wpSettings.companyCity} | WhatsApp: ${wpSettings.whatsappNumber}`,
        margin + 6,
        y + 24
      );
      doc.text(
        `M-Pesa Paybill: ${wpSettings.paybillNumber} | Acc: ${wpSettings.paybillAccount} | Email: ${wpSettings.companyEmail}`,
        margin + 6,
        y + 29
      );
      y += 38;
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(200, 210, 220);
      doc.text(`Catalogue Rate Card: ${config.title}`, margin + 6, y + 12);
      y += 22;
    }
  };

  // 1. Draw Cover / Header on First Page
  drawHeaderBanner(true);

  // 2. Client / Inquiry Reference Block if present
  if (customer?.name || config.clientName || config.subtitle) {
    addNewPageIfNeeded(24);
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.roundedRect(margin, y, pageWidth - (margin * 2), 20, 2, 2, 'FD');

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    const clientTitle = customer?.name 
      ? `PROPOSAL / CATALOGUE PREPARED FOR: ${customer.name.toUpperCase()}${customer.companyName ? ` (${customer.companyName})` : ''}`
      : config.clientName 
        ? `PREPARED FOR: ${config.clientName.toUpperCase()}`
        : 'CUSTOM CLIENT QUOTATION & CATALOGUE';
    doc.text(clientTitle, margin + 4, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    const contactInfo = [
      customer?.phone ? `Phone: ${customer.phone}` : '',
      customer?.email ? `Email: ${customer.email}` : '',
      `Date Generated: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`,
      config.discountPercentage > 0 ? `Special Discount: ${config.discountPercentage}% OFF applied` : ''
    ].filter(Boolean).join(' | ');

    doc.text(contactInfo || config.subtitle || 'All prices in Kenya Shillings (KSh). Production turnaround 24h-48h.', margin + 4, y + 12);
    
    if (config.customNotes) {
      doc.setFont('helvetica', 'italic');
      doc.text(`Note: ${config.customNotes}`, margin + 4, y + 17);
    }

    y += 25;
  }

  // 3. Render Products based on layoutStyle
  if (config.layoutStyle === 'table') {
    // TABLE VIEW
    addNewPageIfNeeded(16);

    // Table Header
    doc.setFillColor(30, 41, 59); // slate-800
    doc.rect(margin, y, pageWidth - (margin * 2), 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);

    doc.text('#', margin + 3, y + 5.5);
    doc.text('PRODUCT / SERVICE', margin + 12, y + 5.5);
    doc.text('CATEGORY', margin + 95, y + 5.5);
    if (config.showPrices) {
      doc.text('RATE / PRICE', margin + 140, y + 5.5);
    }
    doc.text('LEAD TIME', margin + 165, y + 5.5);

    y += 8;

    products.forEach((prod, index) => {
      addNewPageIfNeeded(9);
      const isEven = index % 2 === 0;
      doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
      doc.rect(margin, y, pageWidth - (margin * 2), 8.5, 'F');
      doc.setDrawColor(241, 245, 249);
      doc.line(margin, y + 8.5, pageWidth - margin, y + 8.5);

      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text(`${index + 1}`, margin + 3, y + 5.5);

      // Product Name (truncated if too long)
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      const prodName = prod.name.length > 48 ? prod.name.substring(0, 45) + '...' : prod.name;
      doc.text(prodName, margin + 12, y + 5.5);

      // Category
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(prod.category, margin + 95, y + 5.5);

      // Price with discount
      if (config.showPrices) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        let priceStr = '';
        if (prod.isQuoteOnly || prod.price === 0) {
          priceStr = 'Quote via WhatsApp';
        } else if (config.discountPercentage > 0) {
          const discounted = Math.round(prod.price * (1 - config.discountPercentage / 100));
          priceStr = `KSh ${discounted.toLocaleString()}`;
        } else {
          priceStr = `KSh ${prod.price.toLocaleString()}`;
        }
        doc.text(priceStr, margin + 140, y + 5.5);
      }

      // Lead time
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(16, 185, 129); // emerald
      doc.text(prod.expressDeliveryAvailable ? '24h Express' : '2-3 Days', margin + 165, y + 5.5);

      y += 8.5;
    });

  } else {
    // CARDS / DETAILED SPEC VIEW
    products.forEach((prod, index) => {
      const cardHeight = config.showFeatures && prod.features?.length ? 26 : 18;
      addNewPageIfNeeded(cardHeight);

      // Card container
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, y, pageWidth - (margin * 2), cardHeight - 2, 2, 2, 'FD');

      // Left category stripe
      doc.setFillColor(37, 99, 235); // blue-600
      doc.rect(margin, y, 3, cardHeight - 2, 'F');

      // Product Title
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(`${index + 1}. ${prod.name}`, margin + 6, y + 6);

      // Category badge text
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`[${prod.category}]`, margin + 6, y + 10.5);

      // Price Tag
      if (config.showPrices) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(246, 139, 30); // orange
        let priceTag = '';
        if (prod.isQuoteOnly || prod.price === 0) {
          priceTag = 'Ask for Quote';
        } else if (config.discountPercentage > 0) {
          const discounted = Math.round(prod.price * (1 - config.discountPercentage / 100));
          priceTag = `KSh ${discounted.toLocaleString()} (was KSh ${prod.price.toLocaleString()})`;
        } else {
          priceTag = prod.priceDisplay || `KSh ${prod.price.toLocaleString()}`;
        }
        doc.text(priceTag, pageWidth - margin - 5, y + 6, { align: 'right' });
      }

      // Features or description
      if (config.showFeatures && prod.features?.length) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(51, 65, 85);
        const featText = prod.features.slice(0, 3).map(f => `• ${f}`).join('   ');
        doc.text(featText, margin + 6, y + 16);
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(71, 85, 105);
        const descText = prod.description.length > 110 ? prod.description.substring(0, 107) + '...' : prod.description;
        doc.text(descText, margin + 6, y + 14);
      }

      y += cardHeight;
    });
  }

  // 4. Payment Terms & Order Instructions Block
  if (config.showPaybillInfo || config.showTerms) {
    addNewPageIfNeeded(32);
    doc.setFillColor(241, 245, 249); // slate-100
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.roundedRect(margin, y + 2, pageWidth - (margin * 2), 26, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('HOW TO CONFIRM & PAY YOUR PRINT ORDER:', margin + 5, y + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text(`1. M-Pesa Paybill: Go to Lipa na M-Pesa > Paybill > Enter Business Number: ${wpSettings.paybillNumber || '247247'}`, margin + 5, y + 13);
    doc.text(`2. Account Number: Enter ${wpSettings.paybillAccount || '0797939199'} (or your Job/Inquiry Reference)`, margin + 5, y + 18);
    doc.text(`3. WhatsApp Confirmation: Send M-Pesa confirmation code & artwork files to ${wpSettings.whatsappNumber} for immediate production proof.`, margin + 5, y + 23);

    y += 30;
  }

  // Final Page Footer
  doc.setFontSize(8);
  doc.setTextColor(130, 140, 150);
  doc.text(
    `Woodynat Designers Limited | Tel: ${wpSettings.whatsappNumber} | Paybill: ${wpSettings.paybillNumber} (Acc: ${wpSettings.paybillAccount})`,
    margin,
    pageHeight - 8
  );
  doc.text(`Page ${doc.getNumberOfPages()} of ${doc.getNumberOfPages()}`, pageWidth - margin - 20, pageHeight - 8);

  // Save the PDF
  const sanitizedClient = (customer?.name || config.clientName || 'Catalog')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .substring(0, 20);
  const fileName = `Woodynat_Catalogue_${sanitizedClient}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
};

/**
 * Formats a clean, high-impact WhatsApp message containing selected catalogue products and pricing.
 */
export const formatCatalogueWhatsAppMessage = (
  products: Product[],
  config: CataloguePrintConfig,
  wpSettings: WordPressSettings,
  customer?: { name?: string; phone?: string; companyName?: string }
): string => {
  const greeting = customer?.name ? `Hello *${customer.name}*!` : `Hello!`;
  const discountNote = config.discountPercentage > 0 ? `\n🎁 *Special Discount:* ${config.discountPercentage}% OFF your order!` : '';

  const itemsList = products.map((p, idx) => {
    let priceText = '';
    if (p.isQuoteOnly || p.price === 0) {
      priceText = '_Quote upon exact size/qty_';
    } else if (config.discountPercentage > 0) {
      const discounted = Math.round(p.price * (1 - config.discountPercentage / 100));
      priceText = `*KSh ${discounted.toLocaleString()}* ~(${p.price.toLocaleString()})~`;
    } else {
      priceText = `*KSh ${p.price.toLocaleString()}*`;
    }

    const featureSnippet = p.features && p.features.length > 0 ? ` (${p.features[0]})` : '';
    return `${idx + 1}. *${p.name}* [${p.category}]\n   💰 Rate: ${priceText}${featureSnippet}`;
  }).join('\n\n');

  return `${greeting}

Thank you for your inquiry with *${wpSettings.siteTitle || 'Woodynat Designers Limited'}*!

Here is the customized price catalogue & rate quotation prepared for you:
${discountNote}

${itemsList}

━━━━━━━━━━━━━━━━━━━━
💳 *HOW TO ORDER VIA M-PESA:*
• Paybill: *${wpSettings.paybillNumber || '247247'}*
• Account: *${wpSettings.paybillAccount || '0797939199'}*
• Physical Workshop: *${wpSettings.companyAddress}, ${wpSettings.companyCity}*

Reply to this message with your quantities or send your logo/artwork files to proceed with production! 🎨✨`;
};

/**
 * Formats a structured email subject and body for the selected catalogue.
 */
export const formatCatalogueEmailBody = (
  products: Product[],
  config: CataloguePrintConfig,
  wpSettings: WordPressSettings,
  customer?: { name?: string; email?: string }
): { subject: string; body: string } => {
  const clientName = customer?.name || 'Valued Client';
  const subject = `Official Price Catalogue & Quotation - ${wpSettings.siteTitle || 'Woodynat Designers Limited'}`;

  const productsTable = products.map((p, idx) => {
    let priceStr = '';
    if (p.isQuoteOnly || p.price === 0) {
      priceStr = 'Quote upon request';
    } else if (config.discountPercentage > 0) {
      const discounted = Math.round(p.price * (1 - config.discountPercentage / 100));
      priceStr = `KSh ${discounted.toLocaleString()} (${config.discountPercentage}% Discount)`;
    } else {
      priceStr = `KSh ${p.price.toLocaleString()}`;
    }

    return `${idx + 1}. ${p.name} (${p.category}) - ${priceStr}`;
  }).join('\n');

  const body = `Dear ${clientName},

Thank you for contacting ${wpSettings.siteTitle || 'Woodynat Designers Limited'}.

Please find below our price catalogue and rate card for the requested items:

${productsTable}

PAYMENT & ORDER DETAILS:
- M-Pesa Paybill: ${wpSettings.paybillNumber || '247247'}
- Account Number: ${wpSettings.paybillAccount || '0797939199'}
- Workshop Address: ${wpSettings.companyAddress}, ${wpSettings.companyCity}
- Direct WhatsApp / Hotline: ${wpSettings.whatsappNumber}

Please reply with your required quantities and design specifications to initiate instant artwork proofing.

Best regards,
Sales & Production Team
${wpSettings.siteTitle || 'Woodynat Designers Limited'}
Email: ${wpSettings.companyEmail}
Phone: ${wpSettings.whatsappNumber}`;

  return { subject, body };
};

/**
 * Opens a dedicated high-resolution printable HTML document in a new window/tab for A4 printing.
 */
export const openPrintableCatalogueWindow = (
  products: Product[],
  config: CataloguePrintConfig,
  wpSettings: WordPressSettings,
  customer?: { name?: string; phone?: string; companyName?: string }
): void => {
  const printWindow = window.open('', '_blank', 'width=900,height=1100');
  if (!printWindow) {
    alert('Please allow popups to open the printable catalogue view.');
    return;
  }

  const itemsHtml = products.map((p, idx) => {
    let priceHtml = '';
    if (p.isQuoteOnly || p.price === 0) {
      priceHtml = `<span style="color: #2563eb; font-weight: bold;">Ask for Quote</span>`;
    } else if (config.discountPercentage > 0) {
      const discounted = Math.round(p.price * (1 - config.discountPercentage / 100));
      priceHtml = `
        <div style="text-align: right;">
          <span style="font-size: 16px; font-weight: 800; color: #ea580c;">KSh ${discounted.toLocaleString()}</span>
          <span style="font-size: 11px; text-decoration: line-through; color: #94a3b8; display: block;">KSh ${p.price.toLocaleString()}</span>
        </div>
      `;
    } else {
      priceHtml = `<span style="font-size: 16px; font-weight: 800; color: #0f172a;">${p.priceDisplay || `KSh ${p.price.toLocaleString()}`}</span>`;
    }

    const featuresHtml = config.showFeatures && p.features && p.features.length > 0
      ? `<div style="margin-top: 6px; font-size: 11px; color: #475569;">
          ${p.features.map(f => `<span style="display: inline-block; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; margin-right: 4px; margin-bottom: 2px;">✓ ${f}</span>`).join('')}
        </div>`
      : '';

    return `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; padding: 12px 16px; border-bottom: 1px solid #e2e8f0; page-break-inside: avoid;">
        <div style="flex: 1; padding-right: 16px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <span style="font-size: 11px; font-weight: bold; background: #2563eb; color: white; padding: 2px 6px; border-radius: 4px;">#${idx + 1}</span>
            <span style="font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase;">${p.category}</span>
          </div>
          <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 800; color: #0f172a;">${p.name}</h4>
          <p style="margin: 0; font-size: 11px; color: #64748b; line-height: 1.4;">${p.description}</p>
          ${featuresHtml}
        </div>
        <div style="min-width: 130px; text-align: right;">
          ${config.showPrices ? priceHtml : ''}
          <div style="font-size: 10px; font-weight: bold; color: #16a34a; margin-top: 4px;">
            ${p.expressDeliveryAvailable ? '⚡ 24h Express Ready' : '📦 2-3 Days Lead Time'}
          </div>
        </div>
      </div>
    `;
  }).join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${config.title} - ${wpSettings.siteTitle}</title>
        <meta charset="utf-8" />
        <style>
          @page { size: A4; margin: 12mm; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            margin: 0;
            padding: 20px;
            background: #fff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .header {
            background: #0f172a;
            color: #fff;
            padding: 20px 24px;
            border-radius: 12px;
            margin-bottom: 20px;
          }
          .client-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 12px;
          }
          .paybill-box {
            background: #f1f5f9;
            border-left: 4px solid #f68b1e;
            padding: 12px 16px;
            margin-top: 24px;
            border-radius: 4px;
            font-size: 12px;
            page-break-inside: avoid;
          }
          @media print {
            .no-print { display: none !important; }
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; background: #eff6ff; padding: 12px 16px; border-radius: 8px; border: 1px solid #bfdbfe;">
          <span style="font-size: 13px; font-weight: bold; color: #1e40af;">📄 Print Preview Ready (A4 Format)</span>
          <button onclick="window.print()" style="background: #2563eb; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; font-size: 12px; cursor: pointer;">
            🖨️ Click to Print or Save as PDF
          </button>
        </div>

        <div class="header">
          <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #f68b1e; margin-bottom: 4px;">
            Official Printing & Branding Rate Card
          </div>
          <h1 style="margin: 0 0 6px 0; font-size: 20px; font-weight: 900;">${wpSettings.siteTitle}</h1>
          <p style="margin: 0; font-size: 12px; color: #94a3b8;">${config.title} • ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <div style="margin-top: 10px; font-size: 11px; color: #cbd5e1;">
            📍 ${wpSettings.companyAddress}, ${wpSettings.companyCity} | 📞 WhatsApp: ${wpSettings.whatsappNumber} | ✉️ ${wpSettings.companyEmail}
          </div>
        </div>

        ${customer?.name || config.clientName ? `
          <div class="client-box">
            <strong>Prepared For:</strong> ${customer?.name || config.clientName} ${customer?.companyName ? `(${customer.companyName})` : ''} 
            ${customer?.phone ? ` | <strong>Phone:</strong> ${customer.phone}` : ''}
            ${config.discountPercentage > 0 ? ` | <span style="color: #ea580c; font-weight: bold;">Special ${config.discountPercentage}% Discount Applied</span>` : ''}
          </div>
        ` : ''}

        <div style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          ${itemsHtml}
        </div>

        <div class="paybill-box">
          <h4 style="margin: 0 0 6px 0; font-size: 13px; font-weight: bold; color: #0f172a;">💳 M-PESA PAYMENT & PRODUCTION INSTRUCTIONS:</h4>
          <div>1. Lipa na M-Pesa > Paybill: <strong>${wpSettings.paybillNumber || '247247'}</strong></div>
          <div>2. Account Number: <strong>${wpSettings.paybillAccount || '0797939199'}</strong></div>
          <div>3. Send payment code & artwork to WhatsApp: <strong>${wpSettings.whatsappNumber}</strong></div>
        </div>

        <div style="margin-top: 24px; text-align: center; font-size: 10px; color: #94a3b8;">
          Thank you for choosing ${wpSettings.siteTitle}. Quality printing and on-time delivery guaranteed.
        </div>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
};
