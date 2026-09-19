import * as XLSX from 'xlsx';
import { 
  ZohoQuotation as WoodyQuotation, 
  ZohoQuoteItem as WoodyQuoteItem, 
  ZohoSettings as WoodyQuoteSettings, 
  ZohoQuoteStatus as WoodyQuoteStatus,
  WoodyExcelCatalogItem,
  WoodyExcelClientItem,
  WoodyExcelDataset
} from '../types';

export interface ParsedExcelQuoteResult {
  quotes: WoodyQuotation[];
  totalRows: number;
  totalItems: number;
  detectedSheets: string[];
  itemsCatalog: WoodyExcelCatalogItem[];
  clientsCatalog: WoodyExcelClientItem[];
  warnings: string[];
  errors: string[];
}

/**
 * Extracts unique product catalog items and unique clients from parsed quotations
 */
export const extractCatalogAndClientsFromQuotes = (quotes: WoodyQuotation[]): {
  itemsCatalog: WoodyExcelCatalogItem[];
  clientsCatalog: WoodyExcelClientItem[];
} => {
  const itemsMap = new Map<string, WoodyExcelCatalogItem>();
  const clientsMap = new Map<string, WoodyExcelClientItem>();

  quotes.forEach((q) => {
    // Collect client
    const clientKey = `${(q.customerName || '').trim().toLowerCase()}_${(q.customerPhone || '').trim()}`;
    if (clientKey && !clientsMap.has(clientKey) && q.customerName && q.customerName.trim()) {
      clientsMap.set(clientKey, {
        name: q.customerName.trim(),
        phone: q.customerPhone.trim(),
        email: q.customerEmail?.trim() || undefined,
        companyName: q.companyName?.trim() || undefined,
        billingAddress: q.billingAddress?.trim() || undefined,
        deliveryLocation: q.deliveryLocation?.trim() || undefined,
        deliveryType: q.deliveryType || undefined,
      });
    }

    // Collect items
    (q.items || []).forEach((item) => {
      const itemKey = `${(item.name || '').trim().toLowerCase()}_${(item.category || '').trim().toLowerCase()}`;
      if (itemKey && !itemsMap.has(itemKey) && item.name && item.name.trim()) {
        itemsMap.set(itemKey, {
          id: `excel-cat-${itemsMap.size + 1}`,
          name: item.name.trim(),
          category: item.category?.trim() || 'Branding & Commercial Printing',
          description: item.description?.trim() || '',
          unitPrice: item.unitPrice || 0,
          unit: item.unit || 'pcs',
          selectedSize: item.selectedSize || undefined,
          selectedFinish: item.selectedFinish || undefined,
          artworkNotes: item.artworkNotes || undefined,
        });
      }
    });
  });

  return {
    itemsCatalog: Array.from(itemsMap.values()),
    clientsCatalog: Array.from(clientsMap.values()),
  };
};

/**
 * Normalizes a header string for case-insensitive and flexible key matching
 */
const cleanHeaderKey = (header: string): string => {
  return String(header || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
};

/**
 * Helper to convert Excel date (serial number, Date object, or string) to YYYY-MM-DD
 */
const formatExcelDate = (val: any): string => {
  if (!val) {
    return new Date().toISOString().split('T')[0];
  }
  if (val instanceof Date && !isNaN(val.getTime())) {
    return val.toISOString().split('T')[0];
  }
  if (typeof val === 'number') {
    // Excel serial number conversion (1900 date system)
    const utcDays = Math.floor(val - 25569);
    const utcValue = utcDays * 86400;
    const dateInfo = new Date(utcValue * 1000);
    if (!isNaN(dateInfo.getTime())) {
      return dateInfo.toISOString().split('T')[0];
    }
  }
  const str = String(val).trim();
  // Check if already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }
  // Check DD/MM/YYYY
  const ddmmyyyy = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (ddmmyyyy) {
    const day = ddmmyyyy[1].padStart(2, '0');
    const month = ddmmyyyy[2].padStart(2, '0');
    const year = ddmmyyyy[3];
    return `${year}-${month}-${day}`;
  }
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }
  return new Date().toISOString().split('T')[0];
};

/**
 * Normalizes Kenyan and international phone numbers
 */
const normalizePhone = (val: any): string => {
  if (!val) return '0797939199';
  let str = String(val).replace(/[^0-9+]/g, '').trim();
  if (str.startsWith('254') && str.length === 12) {
    str = '0' + str.substring(3);
  } else if (str.startsWith('+254') && str.length === 13) {
    str = '0' + str.substring(4);
  } else if (/^[17]\d{8}$/.test(str)) {
    str = '0' + str;
  }
  return str || '0797939199';
};

/**
 * Parses an uploaded Excel or CSV file buffer into WoodyQuotation objects
 */
export const parseWoodyQuoteExcel = (
  fileData: ArrayBuffer | Uint8Array,
  defaultSettings?: WoodyQuoteSettings
): ParsedExcelQuoteResult => {
  const result: ParsedExcelQuoteResult = {
    quotes: [],
    totalRows: 0,
    totalItems: 0,
    detectedSheets: [],
    itemsCatalog: [],
    clientsCatalog: [],
    warnings: [],
    errors: [],
  };

  try {
    const workbook = XLSX.read(fileData, { type: 'array', cellDates: true });
    result.detectedSheets = workbook.SheetNames || [];

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      result.errors.push('The uploaded Excel workbook contains no readable sheets.');
      return result;
    }

    const defaultPrefix = defaultSettings?.defaultQuotePrefix || 'WNAT-2026';
    const nowIso = new Date().toISOString();
    const today = nowIso.split('T')[0];

    // Check if multi-sheet structure exists: 'Quotations' and 'Items'
    const quoteSheetName = workbook.SheetNames.find((s) => /quote|quotation/i.test(s));
    const itemsSheetName = workbook.SheetNames.find((s) => /item|lineitem|product/i.test(s));

    const isMultiSheet = Boolean(quoteSheetName && itemsSheetName && quoteSheetName !== itemsSheetName);

    if (isMultiSheet && quoteSheetName && itemsSheetName) {
      // 1. Parse Multi-Sheet Structure
      const quotesWs = workbook.Sheets[quoteSheetName];
      const itemsWs = workbook.Sheets[itemsSheetName];

      const rawQuotes = XLSX.utils.sheet_to_json<Record<string, any>>(quotesWs, { defval: '' });
      const rawItems = XLSX.utils.sheet_to_json<Record<string, any>>(itemsWs, { defval: '' });

      result.totalRows = rawQuotes.length + rawItems.length;

      // Map raw items by Quote Number
      const itemsByQuoteNumber = new Map<string, WoodyQuoteItem[]>();

      rawItems.forEach((row, idx) => {
        const rowMap = new Map<string, any>();
        Object.keys(row).forEach((k) => rowMap.set(cleanHeaderKey(k), row[k]));

        const quoteRef = String(
          rowMap.get('quotenumber') ||
          rowMap.get('quote#') ||
          rowMap.get('quoteno') ||
          rowMap.get('quoteid') ||
          rowMap.get('reference') ||
          ''
        ).trim();

        if (!quoteRef) return;

        const itemName = String(
          rowMap.get('itemname') ||
          rowMap.get('name') ||
          rowMap.get('product') ||
          rowMap.get('productname') ||
          rowMap.get('item') ||
          rowMap.get('description') ||
          `Custom Item ${idx + 1}`
        ).trim();

        const itemDesc = String(
          rowMap.get('itemdescription') ||
          rowMap.get('description') ||
          rowMap.get('details') ||
          rowMap.get('notes') ||
          'Commercial grade branding & finishing'
        ).trim();

        const qty = Math.max(1, parseFloat(rowMap.get('quantity') || rowMap.get('qty') || '1') || 1);
        const unitPrice = Math.max(0, parseFloat(rowMap.get('unitprice') || rowMap.get('price') || rowMap.get('rate') || '0') || 0);
        const discountPercent = Math.min(100, Math.max(0, parseFloat(rowMap.get('discountpercent') || rowMap.get('discount') || '0') || 0));
        const unit = String(rowMap.get('unit') || rowMap.get('uom') || 'pcs').trim() || 'pcs';
        const selectedSize = String(rowMap.get('selectedsize') || rowMap.get('size') || '').trim() || undefined;
        const selectedFinish = String(rowMap.get('selectedfinish') || rowMap.get('finish') || '').trim() || undefined;
        const artworkNotes = String(rowMap.get('artworknotes') || rowMap.get('artwork') || '').trim() || undefined;

        const category = String(rowMap.get('category') || rowMap.get('productcategory') || 'Branding & Commercial Printing').trim() || 'Branding & Commercial Printing';
        const total = qty * unitPrice * (1 - discountPercent / 100);

        const item: WoodyQuoteItem = {
          id: `item-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
          name: itemName,
          category,
          description: itemDesc,
          quantity: qty,
          unit,
          unitPrice,
          discountPercent,
          total,
          selectedSize,
          selectedFinish,
          artworkNotes,
        };

        const existing = itemsByQuoteNumber.get(quoteRef) || [];
        existing.push(item);
        itemsByQuoteNumber.set(quoteRef, existing);
        result.totalItems++;
      });

      // Build Quotations
      rawQuotes.forEach((row, idx) => {
        const rowMap = new Map<string, any>();
        Object.keys(row).forEach((k) => rowMap.set(cleanHeaderKey(k), row[k]));

        const rawQuoteNum = String(
          rowMap.get('quotenumber') ||
          rowMap.get('quote#') ||
          rowMap.get('quoteno') ||
          rowMap.get('quoteid') ||
          ''
        ).trim();

        const quoteNumber = rawQuoteNum || `${defaultPrefix}-${String(idx + 1).padStart(4, '0')}`;
        const customerName = String(
          rowMap.get('customername') ||
          rowMap.get('clientname') ||
          rowMap.get('customer') ||
          rowMap.get('name') ||
          'Customer / Business Lead'
        ).trim();

        const customerPhone = normalizePhone(
          rowMap.get('customerphone') || rowMap.get('phone') || rowMap.get('tel') || rowMap.get('mobile')
        );

        const customerEmail = String(
          rowMap.get('customeremail') || rowMap.get('email') || 'woodynatdesigners12@gmail.com'
        ).trim();

        const companyName = String(rowMap.get('companyname') || rowMap.get('company') || '').trim() || undefined;
        const billingAddress = String(rowMap.get('billingaddress') || rowMap.get('address') || 'Nairobi, Kenya').trim();
        const deliveryLocation = String(rowMap.get('deliverylocation') || rowMap.get('location') || 'Temple Road Gatkim complex building fourth floor wing B Room 4B1').trim();

        let deliveryType: WoodyQuotation['deliveryType'] = 'CBD Workshop Pickup';
        const rawDelType = String(rowMap.get('deliverytype') || rowMap.get('delivery') || '').toLowerCase();
        if (rawDelType.includes('home') || rawDelType.includes('express') || rawDelType.includes('door')) {
          deliveryType = 'Express Home Delivery';
        } else if (rawDelType.includes('station') || rawDelType.includes('pickup station')) {
          deliveryType = 'Pickup Station';
        }

        const quoteDate = formatExcelDate(rowMap.get('quotedate') || rowMap.get('date'));
        const expiryDate = formatExcelDate(rowMap.get('expirydate') || rowMap.get('validuntil'));
        const validityDays = parseInt(rowMap.get('validitydays') || '14', 10) || 14;

        let paymentTerms: WoodyQuotation['paymentTerms'] = defaultSettings?.defaultPaymentTerms || '50% Deposit, 50% on Delivery';
        const rawTerms = String(rowMap.get('paymentterms') || rowMap.get('terms') || '').toLowerCase();
        if (rawTerms.includes('receipt') || rawTerms.includes('immediate')) paymentTerms = 'Due on Receipt';
        else if (rawTerms.includes('15')) paymentTerms = 'Net 15';
        else if (rawTerms.includes('30')) paymentTerms = 'Net 30';
        else if (rawTerms.includes('cash')) paymentTerms = 'Cash on Delivery';

        const deliveryTimeline = String(
          rowMap.get('deliverytimeline') || rowMap.get('timeline') || defaultSettings?.defaultDeliveryTimeline || '24-48 Hours Express Delivery'
        ).trim();

        const currency: WoodyQuotation['currency'] = String(rowMap.get('currency') || '').toUpperCase() === 'USD' ? 'USD' : 'KSh';
        const shippingCost = Math.max(0, parseFloat(rowMap.get('shippingcost') || rowMap.get('shipping') || '0') || 0);
        const notes = String(rowMap.get('notes') || defaultSettings?.defaultNotes || 'Official Woody-Quote quotation from Woodynat Designers Limited.').trim();
        const termsAndConditions = String(rowMap.get('termsandconditions') || defaultSettings?.defaultTerms || '1. Validity: 14 days from quote date.\n2. Payment: 50% deposit before production, 50% upon delivery sign-off.').trim();

        let status: WoodyQuoteStatus = 'Draft';
        const rawStatus = String(rowMap.get('status') || '').toLowerCase();
        if (rawStatus.includes('app')) status = 'Approved';
        else if (rawStatus.includes('inv')) status = 'Invoiced';
        else if (rawStatus.includes('sent')) status = 'Sent';
        else if (rawStatus.includes('dec')) status = 'Declined';
        else if (rawStatus.includes('order') || rawStatus.includes('conv')) status = 'Converted to Order';

        const preparedBy = String(rowMap.get('preparedby') || 'Woodynat Commercial Desk').trim();

        // Get items for this quote
        let items = itemsByQuoteNumber.get(quoteNumber) || itemsByQuoteNumber.get(rawQuoteNum) || [];
        if (items.length === 0) {
          // Fallback single item
          items = [{
            id: `item-${Date.now()}-${idx}`,
            name: 'Branding & Commercial Production Order',
            category: 'Branding & Commercial Printing',
            description: 'Custom print production & finishing as per specifications',
            quantity: 1,
            unit: 'lot',
            unitPrice: Math.max(0, parseFloat(rowMap.get('subtotal') || rowMap.get('total') || '1500') || 1500),
            discountPercent: 0,
            total: Math.max(0, parseFloat(rowMap.get('subtotal') || rowMap.get('total') || '1500') || 1500),
          }];
          result.totalItems++;
          result.warnings.push(`Quote #${quoteNumber} had no separate line items in the Items sheet; created a default line item.`);
        }

        const subtotal = items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
        const discountTotal = items.reduce((sum, it) => sum + (it.quantity * it.unitPrice * (it.discountPercent / 100)), 0);
        const grandTotal = Math.max(0, subtotal - discountTotal + shippingCost);

        result.quotes.push({
          id: `woody-excel-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
          quoteNumber,
          customerName,
          customerPhone,
          customerEmail,
          companyName,
          billingAddress,
          deliveryLocation,
          deliveryType,
          quoteDate,
          expiryDate,
          validityDays,
          paymentTerms,
          deliveryTimeline,
          currency,
          items,
          subtotal,
          discountTotal,
          taxRate: 0,
          taxTotal: 0,
          shippingCost,
          grandTotal,
          isTaxInclusive: false,
          notes,
          termsAndConditions,
          paybillNumber: '247247',
          paybillAccount: '0797939199',
          status,
          createdAt: nowIso,
          updatedAt: nowIso,
          preparedBy,
        });
      });

    } else {
      // 2. Parse Single-Sheet Combined Format (Flat or Grouped by Quote Number)
      const firstSheetName = workbook.SheetNames[0];
      const ws = workbook.Sheets[firstSheetName];
      const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: '' });

      result.totalRows = rawRows.length;
      if (rawRows.length === 0) {
        result.errors.push(`Sheet "${firstSheetName}" is empty or has no data rows.`);
        return result;
      }

      // Group rows by Quote Number
      const quoteGroups: Array<{
        metadata: Record<string, any>;
        itemRows: Record<string, any>[];
      }> = [];

      let currentGroup: { metadata: Record<string, any>; itemRows: Record<string, any>[] } | null = null;
      let lastKnownQuoteNumber = '';

      rawRows.forEach((row, rowIdx) => {
        const rowMap = new Map<string, any>();
        Object.keys(row).forEach((k) => rowMap.set(cleanHeaderKey(k), row[k]));

        const rawQuoteNum = String(
          rowMap.get('quotenumber') ||
          rowMap.get('quote#') ||
          rowMap.get('quoteno') ||
          rowMap.get('quoteid') ||
          ''
        ).trim();

        const hasCustomerInfo = Boolean(
          rowMap.get('customername') || rowMap.get('clientname') || rowMap.get('customer') || rowMap.get('customerphone') || rowMap.get('phone')
        );

        // If this row has a new quote number, or has new customer info and no quote number, start a new quote group
        if (rawQuoteNum && rawQuoteNum !== lastKnownQuoteNumber) {
          currentGroup = { metadata: Object.fromEntries(rowMap), itemRows: [Object.fromEntries(rowMap)] };
          quoteGroups.push(currentGroup);
          lastKnownQuoteNumber = rawQuoteNum;
        } else if (!rawQuoteNum && hasCustomerInfo) {
          // New quote without explicit number
          const generatedNum = `${defaultPrefix}-${String(quoteGroups.length + 1).padStart(4, '0')}`;
          rowMap.set('quotenumber', generatedNum);
          currentGroup = { metadata: Object.fromEntries(rowMap), itemRows: [Object.fromEntries(rowMap)] };
          quoteGroups.push(currentGroup);
          lastKnownQuoteNumber = generatedNum;
        } else if (currentGroup) {
          // Continues the existing quote (additional line item)
          currentGroup.itemRows.push(Object.fromEntries(rowMap));
        } else {
          // First row without quote number
          const generatedNum = `${defaultPrefix}-${String(quoteGroups.length + 1).padStart(4, '0')}`;
          rowMap.set('quotenumber', generatedNum);
          currentGroup = { metadata: Object.fromEntries(rowMap), itemRows: [Object.fromEntries(rowMap)] };
          quoteGroups.push(currentGroup);
          lastKnownQuoteNumber = generatedNum;
        }
      });

      // Process each quote group into a WoodyQuotation
      quoteGroups.forEach((group, qIdx) => {
        const meta = group.metadata;
        const quoteNumber = String(meta.quotenumber || meta['quote#'] || `${defaultPrefix}-${String(qIdx + 1).padStart(4, '0')}`).trim();

        const customerName = String(
          meta.customername || meta.clientname || meta.customer || meta.name || 'Customer / Business Lead'
        ).trim();

        const customerPhone = normalizePhone(
          meta.customerphone || meta.phone || meta.tel || meta.mobile
        );

        const customerEmail = String(
          meta.customeremail || meta.email || 'woodynatdesigners12@gmail.com'
        ).trim();

        const companyName = String(meta.companyname || meta.company || '').trim() || undefined;
        const billingAddress = String(meta.billingaddress || meta.address || 'Nairobi, Kenya').trim();
        const deliveryLocation = String(meta.deliverylocation || meta.location || 'Temple Road Gatkim complex building fourth floor wing B Room 4B1').trim();

        let deliveryType: WoodyQuotation['deliveryType'] = 'CBD Workshop Pickup';
        const rawDelType = String(meta.deliverytype || meta.delivery || '').toLowerCase();
        if (rawDelType.includes('home') || rawDelType.includes('express') || rawDelType.includes('door')) {
          deliveryType = 'Express Home Delivery';
        } else if (rawDelType.includes('station') || rawDelType.includes('pickup station')) {
          deliveryType = 'Pickup Station';
        }

        const quoteDate = formatExcelDate(meta.quotedate || meta.date);
        const expiryDate = formatExcelDate(meta.expirydate || meta.validuntil);
        const validityDays = parseInt(meta.validitydays || '14', 10) || 14;

        let paymentTerms: WoodyQuotation['paymentTerms'] = defaultSettings?.defaultPaymentTerms || '50% Deposit, 50% on Delivery';
        const rawTerms = String(meta.paymentterms || meta.terms || '').toLowerCase();
        if (rawTerms.includes('receipt') || rawTerms.includes('immediate')) paymentTerms = 'Due on Receipt';
        else if (rawTerms.includes('15')) paymentTerms = 'Net 15';
        else if (rawTerms.includes('30')) paymentTerms = 'Net 30';
        else if (rawTerms.includes('cash')) paymentTerms = 'Cash on Delivery';

        const deliveryTimeline = String(
          meta.deliverytimeline || meta.timeline || defaultSettings?.defaultDeliveryTimeline || '24-48 Hours Express Delivery'
        ).trim();

        const currency: WoodyQuotation['currency'] = String(meta.currency || '').toUpperCase() === 'USD' ? 'USD' : 'KSh';
        const shippingCost = Math.max(0, parseFloat(meta.shippingcost || meta.shipping || '0') || 0);
        const notes = String(meta.notes || defaultSettings?.defaultNotes || 'Official Woody-Quote quotation from Woodynat Designers Limited.').trim();
        const termsAndConditions = String(meta.termsandconditions || defaultSettings?.defaultTerms || '1. Validity: 14 days from quote date.\n2. Payment: 50% deposit before production, 50% upon delivery sign-off.').trim();

        let status: WoodyQuoteStatus = 'Draft';
        const rawStatus = String(meta.status || '').toLowerCase();
        if (rawStatus.includes('app')) status = 'Approved';
        else if (rawStatus.includes('inv')) status = 'Invoiced';
        else if (rawStatus.includes('sent')) status = 'Sent';
        else if (rawStatus.includes('dec')) status = 'Declined';
        else if (rawStatus.includes('order') || rawStatus.includes('conv')) status = 'Converted to Order';

        const preparedBy = String(meta.preparedby || 'Woodynat Commercial Desk').trim();

        // Process line items in this quote group
        const items: WoodyQuoteItem[] = [];
        group.itemRows.forEach((itemRow, itemIdx) => {
          const itemName = String(
            itemRow.itemname ||
            itemRow.product ||
            itemRow.productname ||
            itemRow.item ||
            itemRow.service ||
            (itemRow.name && itemRow.name !== customerName ? itemRow.name : '') ||
            (group.itemRows.length === 1 ? 'Branding & Commercial Production Order' : `Item ${itemIdx + 1}`)
          ).trim();

          const itemDesc = String(
            itemRow.itemdescription ||
            itemRow.description ||
            itemRow.details ||
            itemRow.specs ||
            'Custom high-quality commercial finishing'
          ).trim();

          const qty = Math.max(1, parseFloat(itemRow.quantity || itemRow.qty || '1') || 1);
          const unitPrice = Math.max(
            0,
            parseFloat(itemRow.unitprice || itemRow.price || itemRow.rate || itemRow.cost || '0') || 0
          );
          const discountPercent = Math.min(100, Math.max(0, parseFloat(itemRow.discountpercent || itemRow.discount || '0') || 0));
          const unit = String(itemRow.unit || itemRow.uom || 'pcs').trim() || 'pcs';
          const selectedSize = String(itemRow.selectedsize || itemRow.size || '').trim() || undefined;
          const selectedFinish = String(itemRow.selectedfinish || itemRow.finish || '').trim() || undefined;
          const artworkNotes = String(itemRow.artworknotes || itemRow.artwork || '').trim() || undefined;

          // If the row is totally blank for item fields and unit price is 0, check if metadata total exists
          let resolvedUnitPrice = unitPrice;
          if (resolvedUnitPrice === 0 && group.itemRows.length === 1) {
            const rawSubtotal = parseFloat(meta.subtotal || meta.total || meta.grandtotal || '0') || 0;
            if (rawSubtotal > 0) {
              resolvedUnitPrice = rawSubtotal / qty;
            }
          }

          const category = String(itemRow.category || itemRow.productcategory || 'Branding & Commercial Printing').trim() || 'Branding & Commercial Printing';
          const total = qty * resolvedUnitPrice * (1 - discountPercent / 100);

          items.push({
            id: `item-${Date.now()}-${qIdx}-${itemIdx}-${Math.random().toString(36).substring(2, 6)}`,
            name: itemName,
            category,
            description: itemDesc,
            quantity: qty,
            unit,
            unitPrice: resolvedUnitPrice,
            discountPercent,
            total,
            selectedSize,
            selectedFinish,
            artworkNotes,
          });

          result.totalItems++;
        });

        const subtotal = items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
        const discountTotal = items.reduce((sum, it) => sum + (it.quantity * it.unitPrice * (it.discountPercent / 100)), 0);
        const grandTotal = Math.max(0, subtotal - discountTotal + shippingCost);

        result.quotes.push({
          id: `woody-excel-${Date.now()}-${qIdx}-${Math.random().toString(36).substring(2, 6)}`,
          quoteNumber,
          customerName,
          customerPhone,
          customerEmail,
          companyName,
          billingAddress,
          deliveryLocation,
          deliveryType,
          quoteDate,
          expiryDate,
          validityDays,
          paymentTerms,
          deliveryTimeline,
          currency,
          items,
          subtotal,
          discountTotal,
          taxRate: 0,
          taxTotal: 0,
          shippingCost,
          grandTotal,
          isTaxInclusive: false,
          notes,
          termsAndConditions,
          paybillNumber: '247247',
          paybillAccount: '0797939199',
          status,
          createdAt: nowIso,
          updatedAt: nowIso,
          preparedBy,
        });
      });
    }

    if (result.quotes.length === 0) {
      result.errors.push('No valid quotation rows could be parsed from the Excel file. Please ensure column headers match the template.');
    }

    const { itemsCatalog, clientsCatalog } = extractCatalogAndClientsFromQuotes(result.quotes);
    result.itemsCatalog = itemsCatalog;
    result.clientsCatalog = clientsCatalog;

  } catch (err: any) {
    result.errors.push(`Excel parsing failed: ${err?.message || 'Unsupported or corrupted spreadsheet file.'}`);
  }

  return result;
};

/**
 * Generates and downloads a clean, beautifully formatted sample Excel template
 * with sample quotes and line items that admins can fill in and re-upload.
 */
export const downloadWoodyQuoteExcelTemplate = (defaultSettings?: WoodyQuoteSettings) => {
  const wb = XLSX.utils.book_new();
  const defaultPrefix = defaultSettings?.defaultQuotePrefix || 'WNAT-2026';

  // SHEET 1: Quotations & Items (Combined Flat Sheet format - easiest to use)
  const templateRows = [
    {
      'Quote Number': `${defaultPrefix}-0001`,
      'Customer Name': 'Sarah Mwangi',
      'Customer Phone': '0797939199',
      'Customer Email': 'sarah.mwangi@safarioutdoors.co.ke',
      'Company Name': 'Safari Outdoors Kenya',
      'Item Name': 'Reflective Safety High-Vis Vests',
      'Item Description': 'Neon green with double horizontal silver reflector tape & chest embroidery',
      'Quantity': 50,
      'Unit': 'pcs',
      'Unit Price (KSh)': 850,
      'Discount %': 5,
      'Item Size': 'XL / L Mixed',
      'Item Finish': 'Embroidered Logo',
      'Delivery Location': 'Upper Hill, Nairobi',
      'Delivery Type': 'Express Home Delivery',
      'Shipping Cost (KSh)': 350,
      'Payment Terms': '50% Deposit, 50% on Delivery',
      'Delivery Timeline': '24-48 Hours Express Delivery',
      'Quote Date': '2026-09-20',
      'Expiry Date': '2026-10-04',
      'Status': 'Draft',
      'Prepared By': 'Woodynat Commercial Desk',
      'Notes': 'Vector artwork proof approved via WhatsApp. Ready for batch production.'
    },
    {
      'Quote Number': `${defaultPrefix}-0001`,
      'Customer Name': 'Sarah Mwangi',
      'Customer Phone': '0797939199',
      'Customer Email': 'sarah.mwangi@safarioutdoors.co.ke',
      'Company Name': 'Safari Outdoors Kenya',
      'Item Name': 'Branded Corporate Polo Shirts',
      'Item Description': 'Heavyweight 220gsm pique cotton polo with left chest embroidery',
      'Quantity': 30,
      'Unit': 'pcs',
      'Unit Price (KSh)': 1250,
      'Discount %': 0,
      'Item Size': 'Medium',
      'Item Finish': 'Navy Blue Pique Cotton',
      'Delivery Location': 'Upper Hill, Nairobi',
      'Delivery Type': 'Express Home Delivery',
      'Shipping Cost (KSh)': 0,
      'Payment Terms': '50% Deposit, 50% on Delivery',
      'Delivery Timeline': '24-48 Hours Express Delivery',
      'Quote Date': '2026-09-20',
      'Expiry Date': '2026-10-04',
      'Status': 'Draft',
      'Prepared By': 'Woodynat Commercial Desk',
      'Notes': 'Additional line item for same quotation #.'
    },
    {
      'Quote Number': `${defaultPrefix}-0002`,
      'Customer Name': 'David Kiprono',
      'Customer Phone': '0712345678',
      'Customer Email': 'david@apexlogistics.com',
      'Company Name': 'Apex Logistics Ltd',
      'Item Name': 'Retractable Pull-Up Banner (Broad Base)',
      'Item Description': 'High-resolution vibrant canvas banner with aluminium luxury broad base stand & carry bag',
      'Quantity': 2,
      'Unit': 'sets',
      'Unit Price (KSh)': 4500,
      'Discount %': 10,
      'Item Size': '85cm x 200cm',
      'Item Finish': 'Matte Lamination Anti-Glare',
      'Delivery Location': 'Temple Road Gatkim complex building fourth floor wing B Room 4B1',
      'Delivery Type': 'CBD Workshop Pickup',
      'Shipping Cost (KSh)': 0,
      'Payment Terms': '50% Deposit, 50% on Delivery',
      'Delivery Timeline': 'Same Day Express (4-6 Hours)',
      'Quote Date': '2026-09-20',
      'Expiry Date': '2026-10-04',
      'Status': 'Approved',
      'Prepared By': 'Woodynat Commercial Desk',
      'Notes': 'High priority client exhibition banner.'
    },
    {
      'Quote Number': `${defaultPrefix}-0003`,
      'Customer Name': 'Grace Wanjiru',
      'Customer Phone': '0722998877',
      'Customer Email': 'grace@starlawkenya.com',
      'Company Name': 'Star Law Advocates',
      'Item Name': 'Premium Matte Business Cards',
      'Item Description': '350gsm art card double-sided print with velvety soft-touch matte lamination and spot UV',
      'Quantity': 4,
      'Unit': 'boxes (100pcs/box)',
      'Unit Price (KSh)': 1500,
      'Discount %': 0,
      'Item Size': '90mm x 55mm standard',
      'Item Finish': 'Spot UV + Soft-touch Matte',
      'Delivery Location': 'Westlands, Nairobi',
      'Delivery Type': 'Pickup Station',
      'Shipping Cost (KSh)': 200,
      'Payment Terms': 'Due on Receipt',
      'Delivery Timeline': '24 Hours Express',
      'Quote Date': '2026-09-20',
      'Expiry Date': '2026-10-04',
      'Status': 'Invoiced',
      'Prepared By': 'Woodynat Commercial Desk',
      'Notes': 'Law firm partner executive business cards.'
    }
  ];

  const ws = XLSX.utils.json_to_sheet(templateRows);

  // Column widths
  ws['!cols'] = [
    { wch: 18 }, // Quote Number
    { wch: 20 }, // Customer Name
    { wch: 16 }, // Customer Phone
    { wch: 28 }, // Customer Email
    { wch: 22 }, // Company Name
    { wch: 32 }, // Item Name
    { wch: 45 }, // Item Description
    { wch: 10 }, // Quantity
    { wch: 14 }, // Unit
    { wch: 16 }, // Unit Price
    { wch: 12 }, // Discount %
    { wch: 18 }, // Item Size
    { wch: 22 }, // Item Finish
    { wch: 30 }, // Delivery Location
    { wch: 22 }, // Delivery Type
    { wch: 18 }, // Shipping Cost
    { wch: 28 }, // Payment Terms
    { wch: 26 }, // Delivery Timeline
    { wch: 14 }, // Quote Date
    { wch: 14 }, // Expiry Date
    { wch: 14 }, // Status
    { wch: 24 }, // Prepared By
    { wch: 40 }, // Notes
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Woody_Quotes_Data');

  // SHEET 2: Guide & Instructions
  const guideRows = [
    { 'Column Header': 'Quote Number', 'Required': 'Yes', 'Description': 'Unique quote ID (e.g. WNAT-2026-0001). Multiple rows with the same Quote Number will be grouped as multiple line items for that single quote!' },
    { 'Column Header': 'Customer Name', 'Required': 'Yes', 'Description': 'Full name of the client or organization contact person.' },
    { 'Column Header': 'Customer Phone', 'Required': 'Recommended', 'Description': 'Phone / WhatsApp contact number (e.g. 0797939199 or +254797939199).' },
    { 'Column Header': 'Customer Email', 'Required': 'Optional', 'Description': 'Client email for automatic PDF quote dispatch and email notifications.' },
    { 'Column Header': 'Company Name', 'Required': 'Optional', 'Description': 'Corporate entity or business name to appear on quotation / invoice header.' },
    { 'Column Header': 'Item Name', 'Required': 'Yes', 'Description': 'Name of the printed product or signage service (e.g. Reflective Vests, Pull-up Banners, Polo Shirts).' },
    { 'Column Header': 'Item Description', 'Required': 'Optional', 'Description': 'Detailed specifications, materials, gsm weight, or artwork notes.' },
    { 'Column Header': 'Quantity', 'Required': 'Yes', 'Description': 'Number of items (e.g. 50, 100, 500).' },
    { 'Column Header': 'Unit', 'Required': 'Optional', 'Description': 'Measurement unit (e.g. pcs, sets, rolls, boxes, books). Default is pcs.' },
    { 'Column Header': 'Unit Price (KSh)', 'Required': 'Yes', 'Description': 'Price per unit in Kenyan Shillings (e.g. 850, 1250).' },
    { 'Column Header': 'Discount %', 'Required': 'Optional', 'Description': 'Percentage discount from 0 to 100 (e.g. 5 for 5% off).' },
    { 'Column Header': 'Item Size', 'Required': 'Optional', 'Description': 'Dimensions or clothing size (e.g. A4, A3, XL, 85cm x 200cm).' },
    { 'Column Header': 'Item Finish', 'Required': 'Optional', 'Description': 'Finishing details (e.g. Matte Lamination, UV Varnish, Gold Foil, Embroidery).' },
    { 'Column Header': 'Delivery Type', 'Required': 'Optional', 'Description': '"CBD Workshop Pickup", "Express Home Delivery", or "Pickup Station".' },
    { 'Column Header': 'Shipping Cost (KSh)', 'Required': 'Optional', 'Description': 'Logistics or courier transport fee in KSh. Default is 0.' },
    { 'Column Header': 'Status', 'Required': 'Optional', 'Description': '"Draft", "Sent", "Approved", "Invoiced", "Declined", or "Converted to Order". Default is Draft.' },
  ];

  const guideWs = XLSX.utils.json_to_sheet(guideRows);
  guideWs['!cols'] = [
    { wch: 22 },
    { wch: 14 },
    { wch: 80 }
  ];
  XLSX.utils.book_append_sheet(wb, guideWs, 'Instructions & Field Guide');

  const fileName = `Woody_Quote_Excel_Import_Template_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

/**
 * Exports existing Woody Quotations to an Excel workbook with Overview & Detailed Items sheets
 */
export const exportWoodyQuotesToExcel = (quotes: WoodyQuotation[]) => {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Quotations Master Summary
  const overviewRows = quotes.map((q) => ({
    'Quote Number': q.quoteNumber,
    'Status': q.status,
    'Quote Date': q.quoteDate,
    'Expiry Date': q.expiryDate,
    'Customer Name': q.customerName,
    'Customer Phone': q.customerPhone,
    'Customer Email': q.customerEmail,
    'Company Name': q.companyName || '',
    'Line Items Count': q.items.length,
    'Subtotal (KSh)': q.subtotal,
    'Discounts Total (KSh)': q.discountTotal,
    'Shipping Fee (KSh)': q.shippingCost,
    'Grand Total (KSh)': q.grandTotal,
    'Currency': q.currency,
    'Payment Terms': q.paymentTerms,
    'Delivery Type': q.deliveryType,
    'Delivery Location': q.deliveryLocation,
    'Delivery Timeline': q.deliveryTimeline,
    'Billing Address': q.billingAddress || '',
    'Prepared By': q.preparedBy,
    'Notes': q.notes,
    'Terms & Conditions': q.termsAndConditions,
  }));

  const overviewWs = XLSX.utils.json_to_sheet(overviewRows);
  overviewWs['!cols'] = [
    { wch: 18 }, // Quote Number
    { wch: 14 }, // Status
    { wch: 12 }, // Quote Date
    { wch: 12 }, // Expiry Date
    { wch: 22 }, // Customer Name
    { wch: 16 }, // Customer Phone
    { wch: 26 }, // Customer Email
    { wch: 24 }, // Company Name
    { wch: 15 }, // Items Count
    { wch: 15 }, // Subtotal
    { wch: 18 }, // Discounts
    { wch: 16 }, // Shipping
    { wch: 18 }, // Grand Total
    { wch: 10 }, // Currency
    { wch: 26 }, // Payment Terms
    { wch: 22 }, // Delivery Type
    { wch: 30 }, // Delivery Location
    { wch: 24 }, // Delivery Timeline
    { wch: 24 }, // Billing Address
    { wch: 22 }, // Prepared By
    { wch: 35 }, // Notes
    { wch: 35 }, // Terms
  ];
  XLSX.utils.book_append_sheet(wb, overviewWs, 'Quotations Master');

  // Sheet 2: Detailed Line Items
  const itemsRows: any[] = [];
  quotes.forEach((q) => {
    q.items.forEach((it, idx) => {
      itemsRows.push({
        'Quote Number': q.quoteNumber,
        'Customer Name': q.customerName,
        'Item Index': idx + 1,
        'Item Name': it.name,
        'Description': it.description,
        'Quantity': it.quantity,
        'Unit': it.unit,
        'Unit Price (KSh)': it.unitPrice,
        'Discount %': it.discountPercent,
        'Total (KSh)': it.total,
        'Selected Size': it.selectedSize || '',
        'Selected Finish': it.selectedFinish || '',
        'Artwork Notes': it.artworkNotes || '',
        'Quote Status': q.status,
      });
    });
  });

  const itemsWs = XLSX.utils.json_to_sheet(itemsRows);
  itemsWs['!cols'] = [
    { wch: 18 }, // Quote Number
    { wch: 20 }, // Customer Name
    { wch: 10 }, // Item Index
    { wch: 30 }, // Item Name
    { wch: 45 }, // Description
    { wch: 10 }, // Quantity
    { wch: 12 }, // Unit
    { wch: 15 }, // Unit Price
    { wch: 12 }, // Discount %
    { wch: 15 }, // Total
    { wch: 18 }, // Selected Size
    { wch: 22 }, // Selected Finish
    { wch: 25 }, // Artwork Notes
    { wch: 14 }, // Quote Status
  ];
  XLSX.utils.book_append_sheet(wb, itemsWs, 'Line Items Breakdown');

  const fileName = `Woody_Quotations_Database_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
};
