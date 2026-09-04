import { jsPDF } from 'jspdf';
import { ZohoQuotation as WoodyQuotation, ZohoSettings as WoodyQuoteSettings } from '../types';

/**
 * Formats Kenyan Shillings amount to words representation
 */
export const formatKenyanShillingsToWords = (amount: number): string => {
  return `Kenya Shillings ${Math.round(amount).toLocaleString()} Only`;
};

/**
 * Loads an image (dataUrl or HTTP/static path) and prepares it for jsPDF.
 * Calculates natural dimensions to preserve proper aspect ratio.
 */
export const loadImageAsset = (
  url: string
): Promise<{ dataUrl: string; width: number; height: number } | null> => {
  return new Promise((resolve) => {
    if (!url) {
      resolve(null);
      return;
    }
    // If it's already a Data URL, calculate dimensions using an Image element
    if (typeof window === 'undefined') {
      resolve({ dataUrl: url, width: 400, height: 300 });
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const w = img.naturalWidth || img.width || 400;
        const h = img.naturalHeight || img.height || 300;
        if (url.startsWith('data:image/')) {
          resolve({ dataUrl: url, width: w, height: h });
          return;
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ dataUrl: url, width: w, height: h });
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve({ dataUrl: canvas.toDataURL('image/png'), width: w, height: h });
      } catch (err) {
        console.warn('Canvas conversion failed, falling back to url:', err);
        resolve({ dataUrl: url, width: 400, height: 300 });
      }
    };
    img.onerror = () => {
      console.warn('Failed to load image for PDF:', url);
      resolve(null);
    };
    img.src = url;
  });
};

/**
 * Generates and downloads a high-resolution, vector-accurate, branded
 * Woody-Quote commercial quotation or invoice PDF with letterhead & watermark photo support.
 */
export const downloadWoodyQuotePdf = async (
  quote: WoodyQuotation,
  settings?: Partial<WoodyQuoteSettings>
): Promise<void> => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Blue Theme Color Palette
  const NAVY_PRIMARY = [15, 34, 64];      // #0F2240 Deep Navy
  const BLUE_ACCENT = [37, 99, 235];      // #2563EB Royal Blue
  const SLATE_DARK = [30, 41, 59];        // #1E293B Slate 800
  const SLATE_MUTED = [100, 116, 139];    // #64748B Slate 500
  const BG_LIGHT_BLUE = [240, 246, 255];  // #F0F6FF Soft Blue Tint
  const BORDER_LIGHT = [226, 232, 240];   // #E2E8F0 Slate 200

  // Resolve branding options
  const showLetterhead = quote.showLetterhead ?? settings?.defaultShowLetterhead ?? false;
  const letterheadUrl = quote.letterheadUrl || settings?.defaultLetterheadUrl || '';

  const showWatermark = quote.showWatermark ?? settings?.defaultShowWatermark ?? true;
  const watermarkUrl = quote.watermarkUrl || settings?.defaultWatermarkUrl || '/logo.png';
  const watermarkOpacity = quote.watermarkOpacity ?? settings?.defaultWatermarkOpacity ?? 0.12;
  const watermarkSize = quote.watermarkSize || settings?.defaultWatermarkSize || 'medium';
  const watermarkAngle = quote.watermarkAngle || settings?.defaultWatermarkAngle || 'tilted';
  const watermarkText = quote.watermarkText || settings?.defaultWatermarkText || 'WOODYNAT DESIGNERS LIMITED';
  const isInvoice = quote.documentType === 'invoice' || quote.status === 'Invoiced';

  // Pre-load letterhead and watermark images asynchronously
  const [loadedLetterhead, loadedWatermark] = await Promise.all([
    showLetterhead && letterheadUrl ? loadImageAsset(letterheadUrl) : Promise.resolve(null),
    showWatermark && watermarkUrl ? loadImageAsset(watermarkUrl) : Promise.resolve(null),
  ]);

  // Helper: Draw Header Banner (Supports custom letterhead photo or default vector banner)
  const drawHeaderBanner = (isFirstPage: boolean) => {
    if (isFirstPage && showLetterhead && loadedLetterhead) {
      try {
        const aspect = loadedLetterhead.height / (loadedLetterhead.width || 1);
        const letterheadHeight = Math.min(Math.max(contentWidth * aspect, 20), 40);
        doc.addImage(loadedLetterhead.dataUrl, 'PNG', margin, y, contentWidth, letterheadHeight, undefined, 'FAST');

        // Decorative Blue Accent underline
        doc.setFillColor(BLUE_ACCENT[0], BLUE_ACCENT[1], BLUE_ACCENT[2]);
        doc.rect(margin, y + letterheadHeight, contentWidth, 1.5, 'F');

        y += letterheadHeight + 4;
        return;
      } catch (err) {
        console.warn('Could not insert letterhead photo into PDF, falling back to vector banner:', err);
      }
    }

    // Default Navy & Royal Blue vector header bar
    doc.setFillColor(NAVY_PRIMARY[0], NAVY_PRIMARY[1], NAVY_PRIMARY[2]);
    doc.rect(margin, y, contentWidth, isFirstPage ? 28 : 14, 'F');

    // Royal Blue accent bottom border
    doc.setFillColor(BLUE_ACCENT[0], BLUE_ACCENT[1], BLUE_ACCENT[2]);
    doc.rect(margin, y + (isFirstPage ? 28 : 14), contentWidth, 1.8, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(isFirstPage ? 13 : 9);
    doc.text('WOODYNAT DESIGNERS LIMITED', margin + 6, y + (isFirstPage ? 9 : 6));

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(isFirstPage ? 8 : 7);
    doc.setTextColor(219, 234, 254); // Light Blue 100
    doc.text(
      'Branding, Commercial Printing & Signage Solutions | Nairobi CBD',
      margin + 6,
      y + (isFirstPage ? 15 : 10)
    );

    if (isFirstPage) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(255, 255, 255);
      doc.text(
        'Tel: +254 797 939 199 | Email: woodynatdesigners12@gmail.com',
        margin + 6,
        y + 22
      );

      // Top Right Document Tag
      doc.setFillColor(BLUE_ACCENT[0], BLUE_ACCENT[1], BLUE_ACCENT[2]);
      doc.roundedRect(pageWidth - margin - 46, y + 5, 40, 16, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text(isInvoice ? 'COMMERCIAL INVOICE' : 'WOODY-QUOTE', pageWidth - margin - 26, y + 11, { align: 'center' });
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      doc.text('Official Document', pageWidth - margin - 26, y + 16, { align: 'center' });
    }

    y += (isFirstPage ? 34 : 18);
  };

  const drawWatermarksAndFooters = () => {
    const totalPages = (doc.internal as any).getNumberOfPages ? (doc.internal as any).getNumberOfPages() : 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);

      // 1. Watermark Photo / Stamp Layer
      if (showWatermark) {
        try {
          if ((doc as any).GState) {
            doc.setGState(new (doc as any).GState({ opacity: watermarkOpacity }));
          }

          if (loadedWatermark) {
            const baseMm = watermarkSize === 'small' ? 70 : watermarkSize === 'large' ? 140 : 105;
            const aspect = loadedWatermark.height / (loadedWatermark.width || 1);
            const wmWidth = baseMm;
            const wmHeight = Math.min(baseMm * aspect, 140);
            const wmX = (pageWidth - wmWidth) / 2;
            const wmY = (pageHeight - wmHeight) / 2;

            doc.addImage(
              loadedWatermark.dataUrl,
              'PNG',
              wmX,
              wmY,
              wmWidth,
              wmHeight,
              undefined,
              'FAST',
              watermarkAngle === 'tilted' ? -25 : 0
            );
          } else if (watermarkText) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(watermarkSize === 'small' ? 24 : watermarkSize === 'large' ? 42 : 32);
            doc.setTextColor(148, 163, 184); // Slate 400
            doc.text(watermarkText, pageWidth / 2, pageHeight / 2, {
              align: 'center',
              angle: watermarkAngle === 'tilted' ? 35 : 0,
            });
          }

          // Restore standard opacity
          if ((doc as any).GState) {
            doc.setGState(new (doc as any).GState({ opacity: 1.0 }));
          }
        } catch (err) {
          console.warn('Error applying watermark to PDF:', err);
          if ((doc as any).GState) {
            doc.setGState(new (doc as any).GState({ opacity: 1.0 }));
          }
        }
      }

      // 2. Footer Layer
      doc.setFillColor(BORDER_LIGHT[0], BORDER_LIGHT[1], BORDER_LIGHT[2]);
      doc.rect(margin, pageHeight - 12, contentWidth, 0.4, 'F');

      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(SLATE_MUTED[0], SLATE_MUTED[1], SLATE_MUTED[2]);
      doc.text(
        'Woodynat Designers Limited • Temple Road Gatkim Complex, 4th Floor Wing B Room 4B1, Nairobi CBD',
        margin,
        pageHeight - 8
      );
      doc.text(
        `${isInvoice ? 'Invoice' : 'Woody-Quote'} Ref: ${quote.quoteNumber} | Page ${i} of ${totalPages}`,
        pageWidth - margin,
        pageHeight - 8,
        { align: 'right' }
      );
    }
  };

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin - 16) {
      doc.addPage();
      y = margin;
      drawHeaderBanner(false);
    }
  };

  // 1. Render First Page Header
  drawHeaderBanner(true);

  // 2. Document Title & Quote Meta Block
  const metaHeight = 22;
  doc.setFillColor(BG_LIGHT_BLUE[0], BG_LIGHT_BLUE[1], BG_LIGHT_BLUE[2]);
  doc.roundedRect(margin, y, contentWidth, metaHeight, 2, 2, 'F');
  doc.setDrawColor(BORDER_LIGHT[0], BORDER_LIGHT[1], BORDER_LIGHT[2]);
  doc.roundedRect(margin, y, contentWidth, metaHeight, 2, 2, 'S');

  // Left: Commercial Quotation or Invoice Title
  doc.setTextColor(NAVY_PRIMARY[0], NAVY_PRIMARY[1], NAVY_PRIMARY[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(isInvoice ? 'OFFICIAL COMMERCIAL INVOICE' : 'OFFICIAL COMMERCIAL QUOTATION', margin + 6, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(SLATE_MUTED[0], SLATE_MUTED[1], SLATE_MUTED[2]);
  doc.text(`Fulfillment: ${quote.deliveryType || 'Express Delivery'} | Location: ${quote.deliveryLocation || 'Nairobi'}`, margin + 6, y + 14);
  doc.text(`Timeline: ${quote.deliveryTimeline || '24-48 Hours Express'} | Terms: ${quote.paymentTerms || '50% Deposit, 50% on Delivery'}`, margin + 6, y + 19);

  // Right: Quote/Invoice Number and Dates
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(BLUE_ACCENT[0], BLUE_ACCENT[1], BLUE_ACCENT[2]);
  doc.text(`REF: ${quote.quoteNumber}`, pageWidth - margin - 6, y + 8, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text(`Date: ${quote.quoteDate}`, pageWidth - margin - 6, y + 13, { align: 'right' });
  doc.text(`Valid Until: ${quote.expiryDate} (${quote.validityDays} days)`, pageWidth - margin - 6, y + 17, { align: 'right' });
  doc.text(`Prepared By: ${quote.preparedBy || 'Woodynat Commercial Desk'}`, pageWidth - margin - 6, y + 21, { align: 'right' });

  y += metaHeight + 4;

  // 3. Customer Information Card
  const custHeight = 22;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(BORDER_LIGHT[0], BORDER_LIGHT[1], BORDER_LIGHT[2]);
  doc.roundedRect(margin, y, contentWidth, custHeight, 2, 2, 'FD');

  // Customer Heading
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(BLUE_ACCENT[0], BLUE_ACCENT[1], BLUE_ACCENT[2]);
  doc.text(isInvoice ? 'INVOICE BILLED TO:' : 'QUOTATION PREPARED FOR:', margin + 6, y + 6);
  doc.text('PAYMENT & PRODUCTION TERMS:', margin + (contentWidth / 2) + 4, y + 6);

  // Customer Info Left
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text(quote.customerName, margin + 6, y + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(SLATE_MUTED[0], SLATE_MUTED[1], SLATE_MUTED[2]);
  if (quote.companyName) {
    doc.text(`Company: ${quote.companyName}`, margin + 6, y + 15);
  }
  doc.text(`Phone: ${quote.customerPhone} | Email: ${quote.customerEmail}`, margin + 6, quote.companyName ? y + 19 : y + 16);

  // Terms & Payment Right
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  const rightColX = margin + (contentWidth / 2) + 4;
  doc.text('• M-Pesa Paybill: 247247  |  Account: 0797939199', rightColX, y + 11);
  doc.text('• Account Name: Woodynat Designers Limited', rightColX, y + 15);
  doc.text(`• Payment Terms: ${quote.paymentTerms}`, rightColX, y + 19);

  y += custHeight + 5;

  // 4. Line Items Table
  checkPageBreak(30);

  // Table Column Widths (Sum = contentWidth = 182mm)
  const colW = {
    num: 8,
    name: 82,
    qty: 24,
    unitPrice: 24,
    discount: 18,
    total: 26,
  };

  // Table Header
  doc.setFillColor(NAVY_PRIMARY[0], NAVY_PRIMARY[1], NAVY_PRIMARY[2]);
  doc.rect(margin, y, contentWidth, 7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);

  let curX = margin;
  doc.text('#', curX + 2, y + 4.8);
  curX += colW.num;
  doc.text('Item Description & Specs', curX + 2, y + 4.8);
  curX += colW.name;
  doc.text('Quantity', curX + colW.qty - 2, y + 4.8, { align: 'right' });
  curX += colW.qty;
  doc.text('Unit Price (KSh)', curX + colW.unitPrice - 2, y + 4.8, { align: 'right' });
  curX += colW.unitPrice;
  doc.text('Discount', curX + colW.discount - 2, y + 4.8, { align: 'right' });
  curX += colW.discount;
  doc.text('Total (KSh)', curX + colW.total - 2, y + 4.8, { align: 'right' });

  y += 7;

  // Table Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);

  quote.items.forEach((item, index) => {
    const descLines = doc.splitTextToSize(item.description || item.name, colW.name - 4);
    const hasExtras = Boolean(item.selectedSize || item.artworkNotes);
    const rowHeight = Math.max(7, descLines.length * 3.5 + (hasExtras ? 4 : 2));

    checkPageBreak(rowHeight);

    // Alternating background
    if (index % 2 === 0) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(BG_LIGHT_BLUE[0], BG_LIGHT_BLUE[1], BG_LIGHT_BLUE[2]);
    }
    doc.rect(margin, y, contentWidth, rowHeight, 'F');
    doc.setDrawColor(BORDER_LIGHT[0], BORDER_LIGHT[1], BORDER_LIGHT[2]);
    doc.line(margin, y + rowHeight, margin + contentWidth, y + rowHeight);

    // #
    let cellX = margin;
    doc.setTextColor(SLATE_MUTED[0], SLATE_MUTED[1], SLATE_MUTED[2]);
    doc.text(String(index + 1), cellX + 2, y + 4.5);

    // Name & Description
    cellX += colW.num;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
    doc.text(item.name, cellX + 2, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(SLATE_MUTED[0], SLATE_MUTED[1], SLATE_MUTED[2]);
    doc.setFontSize(6.8);
    let subY = y + 8;
    if (item.description && item.description !== item.name) {
      const truncated = item.description.length > 80 ? item.description.slice(0, 77) + '...' : item.description;
      doc.text(truncated, cellX + 2, subY);
      subY += 3.5;
    }
    if (item.selectedSize || item.artworkNotes) {
      const extraText = [
        item.selectedSize ? `Specs: ${item.selectedSize}` : null,
        item.artworkNotes ? `Proof: ${item.artworkNotes}` : null,
      ].filter(Boolean).join(' | ');
      doc.setTextColor(BLUE_ACCENT[0], BLUE_ACCENT[1], BLUE_ACCENT[2]);
      doc.text(extraText, cellX + 2, subY);
    }

    doc.setFontSize(7.5);

    // Quantity
    cellX += colW.name;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
    doc.text(`${item.quantity.toLocaleString()} ${item.unit || 'pcs'}`, cellX + colW.qty - 2, y + 4.5, { align: 'right' });

    // Unit Price
    cellX += colW.qty;
    doc.setFont('helvetica', 'normal');
    doc.text(item.unitPrice.toLocaleString(), cellX + colW.unitPrice - 2, y + 4.5, { align: 'right' });

    // Discount
    cellX += colW.unitPrice;
    if (item.discountPercent > 0) {
      doc.setTextColor(217, 119, 6); // Amber 600
      doc.text(`${item.discountPercent}%`, cellX + colW.discount - 2, y + 4.5, { align: 'right' });
    } else {
      doc.setTextColor(SLATE_MUTED[0], SLATE_MUTED[1], SLATE_MUTED[2]);
      doc.text('-', cellX + colW.discount - 2, y + 4.5, { align: 'right' });
    }

    // Total
    cellX += colW.discount;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(NAVY_PRIMARY[0], NAVY_PRIMARY[1], NAVY_PRIMARY[2]);
    doc.text(item.total.toLocaleString(), cellX + colW.total - 2, y + 4.5, { align: 'right' });

    y += rowHeight;
  });

  // 5. Totals & Payment Details Block
  checkPageBreak(45);
  y += 4;

  const totalsBoxWidth = 80;
  const leftBoxWidth = contentWidth - totalsBoxWidth - 6;

  // Left Box: M-Pesa Instructions & Commercial Note
  doc.setFillColor(BG_LIGHT_BLUE[0], BG_LIGHT_BLUE[1], BG_LIGHT_BLUE[2]);
  doc.setDrawColor(BLUE_ACCENT[0], BLUE_ACCENT[1], BLUE_ACCENT[2]);
  doc.roundedRect(margin, y, leftBoxWidth, 36, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(BLUE_ACCENT[0], BLUE_ACCENT[1], BLUE_ACCENT[2]);
  doc.text('OFFICIAL M-PESA PAYMENT DETAILS:', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text(`• Paybill Number:  ${quote.paybillNumber || '247247'}`, margin + 4, y + 12);
  doc.text(`• Account Number:  ${quote.paybillAccount || '0797939199'}`, margin + 4, y + 17);
  doc.text('• Account Name:    Woodynat Designers Limited', margin + 4, y + 22);

  if (quote.notes) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(SLATE_MUTED[0], SLATE_MUTED[1], SLATE_MUTED[2]);
    const noteLines = doc.splitTextToSize(`Notes: ${quote.notes}`, leftBoxWidth - 8);
    doc.text(noteLines.slice(0, 2), margin + 4, y + 28);
  }

  // Right Box: Financial Totals
  const rightBoxX = margin + leftBoxWidth + 6;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(BORDER_LIGHT[0], BORDER_LIGHT[1], BORDER_LIGHT[2]);
  doc.roundedRect(rightBoxX, y, totalsBoxWidth, 36, 2, 2, 'FD');

  let totY = y + 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(SLATE_MUTED[0], SLATE_MUTED[1], SLATE_MUTED[2]);
  doc.text('Subtotal:', rightBoxX + 4, totY);
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text(`KSh ${quote.subtotal.toLocaleString()}`, rightBoxX + totalsBoxWidth - 4, totY, { align: 'right' });

  if (quote.discountTotal > 0) {
    totY += 5;
    doc.setTextColor(217, 119, 6);
    doc.text('Total Discount:', rightBoxX + 4, totY);
    doc.text(`-KSh ${quote.discountTotal.toLocaleString()}`, rightBoxX + totalsBoxWidth - 4, totY, { align: 'right' });
  }

  if (quote.shippingCost > 0) {
    totY += 5;
    doc.setTextColor(SLATE_MUTED[0], SLATE_MUTED[1], SLATE_MUTED[2]);
    doc.text('Logistics / Courier:', rightBoxX + 4, totY);
    doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
    doc.text(`+KSh ${quote.shippingCost.toLocaleString()}`, rightBoxX + totalsBoxWidth - 4, totY, { align: 'right' });
  }

  // Grand Total Highlight
  totY += 6;
  doc.setFillColor(NAVY_PRIMARY[0], NAVY_PRIMARY[1], NAVY_PRIMARY[2]);
  doc.rect(rightBoxX, totY - 4, totalsBoxWidth, 9, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('GRAND TOTAL:', rightBoxX + 4, totY + 2);
  doc.setTextColor(147, 197, 253); // Light Blue 300
  doc.text(`KSh ${quote.grandTotal.toLocaleString()}`, rightBoxX + totalsBoxWidth - 4, totY + 2, { align: 'right' });

  y += 40;

  // Words representation
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(SLATE_MUTED[0], SLATE_MUTED[1], SLATE_MUTED[2]);
  doc.text(
    `Amount in words: ${formatKenyanShillingsToWords(quote.grandTotal)}`,
    margin,
    y
  );

  y += 5;

  // 6. Terms & Signature Block
  checkPageBreak(30);

  if (quote.termsAndConditions) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(NAVY_PRIMARY[0], NAVY_PRIMARY[1], NAVY_PRIMARY[2]);
    doc.text('TERMS & CONDITIONS:', margin, y);
    y += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(SLATE_MUTED[0], SLATE_MUTED[1], SLATE_MUTED[2]);
    const termLines = doc.splitTextToSize(quote.termsAndConditions, contentWidth);
    doc.text(termLines.slice(0, 4), margin, y);
    y += Math.min(termLines.length * 3.2, 14);
  }

  // Sign-off boxes
  checkPageBreak(20);
  y += 3;
  const signBoxW = (contentWidth - 8) / 2;

  // Company Signature
  doc.setDrawColor(BORDER_LIGHT[0], BORDER_LIGHT[1], BORDER_LIGHT[2]);
  doc.line(margin, y + 10, margin + signBoxW, y + 10);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text('Authorized Woodynat Signature & Stamp', margin, y + 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(SLATE_MUTED[0], SLATE_MUTED[1], SLATE_MUTED[2]);
  doc.text('Woodynat Designers Limited Commercial Sales Desk', margin, y + 17);

  // Client Sign-off
  const clientSignX = margin + signBoxW + 8;
  doc.line(clientSignX, y + 10, clientSignX + signBoxW, y + 10);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text('Client Acceptance Sign-off / LPO Reference', clientSignX, y + 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(SLATE_MUTED[0], SLATE_MUTED[1], SLATE_MUTED[2]);
  doc.text(`${quote.customerName} (${quote.companyName || 'Authorized Signatory'})`, clientSignX, y + 17);

  // 7. Render Watermarks and Footers across all pages
  drawWatermarksAndFooters();

  // 8. Trigger Browser Download
  const docPrefix = isInvoice ? 'Invoice' : 'WoodyQuote';
  const safeFilename = `${docPrefix}_${quote.quoteNumber.replace(/[^a-zA-Z0-9-_]/g, '_')}.pdf`;
  doc.save(safeFilename);
};
