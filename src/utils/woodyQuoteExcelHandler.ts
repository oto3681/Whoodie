import * as XLSX from 'xlsx';
import { 
  ZohoQuotation as WoodyQuotation, 
  ZohoQuoteItem as WoodyQuoteItem, 
  ZohoSettings as WoodyQuoteSettings, 
  ZohoQuoteStatus as WoodyQuoteStatus,
  WoodyExcelCatalogItem,
  WoodyExcelClientItem,
  WoodyExcelDataset,
  WoodyItemPriceTier
} from '../types';

export interface ParsedExcelQuoteResult {
  quotes: WoodyQuotation[];
  totalRows: number;
  totalItems: number;
  detectedSheets: string[];
  itemsCatalog: WoodyExcelCatalogItem[];
  clientsCatalog: WoodyExcelClientItem[];
  detectedPriceNames: string[];
  warnings: string[];
  errors: string[];
}

/**
 * Normalizes a header string for case-insensitive and flexible key matching,
 * preserving '@' which is the standard commercial rate symbol in Woodynat price cards.
 */
export const cleanHeaderKey = (header: string): string => {
  const str = String(header || '').trim();
  if (str === '@') return '@';
  return str.toLowerCase().replace(/[^a-z0-9@]/g, '');
};

/**
 * Determines whether a column header from the uploaded Excel/PDF file represents a price.
 * Distinguishes between price columns (e.g. "@", "Wholesale Price", "Retail Price (KSh)", "Unit Price", "Rate", "Corporate Cost")
 * and non-price columns like quantity, subtotal, discount, grand total, tax, phone, etc.
 */
export const isPriceColumnHeader = (header: string): boolean => {
  if (!header || typeof header !== 'string') return false;
  const trimmed = header.trim();
  const lower = trimmed.toLowerCase();
  const clean = cleanHeaderKey(trimmed);

  // Exact or common price symbol matches
  if (trimmed === '@' || clean === '@' || lower === '@' || lower.startsWith('@') || lower.includes(' @ ') || lower.endsWith(' @')) {
    return true;
  }

  // Exclude non-price columns
  const excludedKeywords = [
    'total', 'subtotal', 'grandtotal', 'linetotal', 'nettotal',
    'discount', 'disc', 'tax', 'vat', 'shipping', 'freight',
    'balance', 'paid', 'deposit', 'phone', 'mobile', 'tel',
    'qty', 'quantity', 'count', 'number', 'no', 'num', 'id',
    'date', 'time', 'timeline', 'status', 'prepared', 'note',
    'address', 'location', 'email', 'name', 'client', 'customer',
    'company', 'desc', 'description', 'detail', 'size', 'finish',
    'artwork', 'unit', 'uom'
  ];

  for (const ex of excludedKeywords) {
    if (clean === ex) return false;
  }

  // If header contains total or discount or tax or shipping or phone, exclude
  if (
    clean.includes('total') ||
    clean.includes('subtotal') ||
    clean.includes('discount') ||
    clean.includes('tax') ||
    clean.includes('vat') ||
    clean.includes('shipping') ||
    clean.includes('freight') ||
    clean.includes('phone') ||
    clean.includes('mobile') ||
    clean.includes('qty') ||
    clean.includes('quantity')
  ) {
    return false;
  }

  // Positive matches for price columns
  if (
    clean.includes('price') ||
    clean.includes('unitprice') ||
    clean.includes('rate') ||
    clean.includes('cost') ||
    clean.includes('tariff') ||
    clean.includes('fee') ||
    clean.includes('wholesale') ||
    clean.includes('retail') ||
    clean.includes('selling') ||
    clean.includes('reseller') ||
    clean.includes('distributor') ||
    clean.includes('commercial') ||
    clean.includes('corporate') ||
    lower.includes('ksh') ||
    lower.includes('kes') ||
    lower.includes('shs') ||
    clean === 'rate' ||
    clean === 'price' ||
    clean === 'cost' ||
    clean === '@'
  ) {
    return true;
  }

  return false;
};

/**
 * Extracts the exact verbatim product/particulars name from a row
 */
export const getItemNameFromRow = (
  rowMap: Map<string, any>,
  rawRow?: Record<string, any>,
  fallback: string = ''
): string => {
  const candidates = [
    rowMap.get('particulars'),
    rowMap.get('particular'),
    rowMap.get('itemname'),
    rowMap.get('product'),
    rowMap.get('productname'),
    rowMap.get('item'),
    rowMap.get('items'),
    rowMap.get('service'),
    rowMap.get('itemdescription'),
    rowMap.get('description'),
    rowMap.get('title'),
    rowMap.get('details'),
    rowMap.get('name')
  ];

  for (const c of candidates) {
    if (c !== undefined && c !== null) {
      const str = String(c).trim();
      if (str && !/^\d+$/.test(str) && !isPriceColumnHeader(str)) {
        return str;
      }
    }
  }

  if (rawRow) {
    for (const key of Object.keys(rawRow)) {
      const ck = cleanHeaderKey(key);
      if (['particulars', 'particular', 'itemname', 'product', 'item'].includes(ck)) {
        const val = String(rawRow[key] || '').trim();
        if (val) return val;
      }
    }
  }

  return fallback;
};


export interface DetectedPriceInfo {
  primaryPriceName: string;
  primaryPrice: number;
  tiers: WoodyItemPriceTier[];
}

/**
 * Scans a row object for all columns matching price headers and extracts
 * their exact original names as written in the uploaded Excel file.
 */
export const extractPricesFromRow = (
  row: Record<string, any>,
  fallbackUnitPrice?: number
): DetectedPriceInfo => {
  const tiers: WoodyItemPriceTier[] = [];
  const rawKeys = Object.keys(row || {});

  for (const key of rawKeys) {
    if (isPriceColumnHeader(key)) {
      const rawVal = row[key];
      if (rawVal !== undefined && rawVal !== null && rawVal !== '') {
        const num = typeof rawVal === 'number'
          ? rawVal
          : parseFloat(String(rawVal).replace(/[^0-9.-]/g, ''));
        if (!isNaN(num) && num >= 0) {
          tiers.push({
            name: key.trim(), // The exact name from the uploaded Excel file!
            price: num,
          });
        }
      }
    }
  }

  // If no price headers matched via original key search, fallback to checking clean keys
  if (tiers.length === 0) {
    const rowMap = new Map<string, any>();
    rawKeys.forEach((k) => rowMap.set(cleanHeaderKey(k), row[k]));

    const fallbackVal = parseFloat(
      rowMap.get('unitprice') ||
      rowMap.get('price') ||
      rowMap.get('rate') ||
      rowMap.get('cost') ||
      rowMap.get('unitcost') ||
      String(fallbackUnitPrice ?? '0')
    ) || (fallbackUnitPrice ?? 0);

    // Find original key that gave this value if any
    let matchedOriginalKey = 'Unit Price (KSh)';
    for (const k of rawKeys) {
      const ck = cleanHeaderKey(k);
      if (['unitprice', 'price', 'rate', 'cost', 'unitcost'].includes(ck)) {
        matchedOriginalKey = k.trim();
        break;
      }
    }

    return {
      primaryPriceName: matchedOriginalKey,
      primaryPrice: Math.max(0, fallbackVal),
      tiers: [{ name: matchedOriginalKey, price: Math.max(0, fallbackVal) }],
    };
  }

  return {
    primaryPriceName: tiers[0].name,
    primaryPrice: tiers[0].price,
    tiers,
  };
};

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
          priceName: item.priceName || undefined,
          priceTiers: item.priceTiers || undefined,
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
    detectedPriceNames: [],
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
    const allDetectedPriceNames = new Set<string>();

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

        const itemName = getItemNameFromRow(rowMap, row, `Custom Item ${idx + 1}`);

        const itemDesc = String(
          rowMap.get('itemdescription') ||
          rowMap.get('description') ||
          rowMap.get('details') ||
          rowMap.get('notes') ||
          'Commercial grade branding & finishing'
        ).trim();

        const qty = Math.max(1, parseFloat(rowMap.get('quantity') || rowMap.get('qty') || '1') || 1);
        
        // Detect price column name exactly as in uploaded file (e.g. Wholesale Price, Retail Price, Unit Price (KSh), @)
        const priceInfo = extractPricesFromRow(
          row,
          parseFloat(rowMap.get('unitprice') || rowMap.get('price') || rowMap.get('rate') || '0') || 0
        );
        priceInfo.tiers.forEach((t) => allDetectedPriceNames.add(t.name));

        const unitPrice = priceInfo.primaryPrice;
        const priceName = priceInfo.primaryPriceName;
        const priceTiers = priceInfo.tiers;

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
          priceName,
          priceTiers,
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

        // Also add directly to itemsCatalog so it is instantly available in product pickers
        const existingInCatalog = result.itemsCatalog.find(
          (it) => it.name.toLowerCase() === itemName.toLowerCase()
        );
        if (!existingInCatalog) {
          result.itemsCatalog.push({
            id: `excel-item-${result.itemsCatalog.length + 1}`,
            name: itemName,
            category,
            description: itemDesc,
            unitPrice,
            unit,
            priceName,
            priceTiers,
            selectedSize,
            selectedFinish,
          });
        }
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
        rawMetadata: Record<string, any>;
        itemRows: Record<string, any>[];
        rawItemRows: Record<string, any>[];
      }> = [];

      let currentGroup: { metadata: Record<string, any>; rawMetadata: Record<string, any>; itemRows: Record<string, any>[]; rawItemRows: Record<string, any>[] } | null = null;
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
          currentGroup = { metadata: Object.fromEntries(rowMap), rawMetadata: row, itemRows: [Object.fromEntries(rowMap)], rawItemRows: [row] };
          quoteGroups.push(currentGroup);
          lastKnownQuoteNumber = rawQuoteNum;
        } else if (!rawQuoteNum && hasCustomerInfo) {
          // New quote without explicit number
          const generatedNum = `${defaultPrefix}-${String(quoteGroups.length + 1).padStart(4, '0')}`;
          rowMap.set('quotenumber', generatedNum);
          currentGroup = { metadata: Object.fromEntries(rowMap), rawMetadata: row, itemRows: [Object.fromEntries(rowMap)], rawItemRows: [row] };
          quoteGroups.push(currentGroup);
          lastKnownQuoteNumber = generatedNum;
        } else if (currentGroup) {
          // Continues the existing quote (additional line item)
          currentGroup.itemRows.push(Object.fromEntries(rowMap));
          currentGroup.rawItemRows.push(row);
        } else {
          // First row without quote number
          const generatedNum = `${defaultPrefix}-${String(quoteGroups.length + 1).padStart(4, '0')}`;
          rowMap.set('quotenumber', generatedNum);
          currentGroup = { metadata: Object.fromEntries(rowMap), rawMetadata: row, itemRows: [Object.fromEntries(rowMap)], rawItemRows: [row] };
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
          const rawRow = group.rawItemRows?.[itemIdx] || itemRow;
          const itemRowMap = new Map<string, any>(Object.entries(itemRow));
          const itemName = getItemNameFromRow(
            itemRowMap,
            rawRow,
            group.itemRows.length === 1 ? 'Branding & Commercial Production Order' : `Item ${itemIdx + 1}`
          );

          const itemDesc = String(
            itemRow.itemdescription ||
            itemRow.description ||
            itemRow.details ||
            itemRow.specs ||
            'Custom high-quality commercial finishing'
          ).trim();

          const qty = Math.max(1, parseFloat(itemRow.quantity || itemRow.qty || '1') || 1);
          const priceInfo = extractPricesFromRow(
            rawRow,
            parseFloat(itemRow.unitprice || itemRow.price || itemRow.rate || itemRow.cost || '0') || 0
          );
          priceInfo.tiers.forEach((t) => allDetectedPriceNames.add(t.name));

          const priceName = priceInfo.primaryPriceName;
          const priceTiers = priceInfo.tiers;
          let resolvedUnitPrice = priceInfo.primaryPrice;

          const discountPercent = Math.min(100, Math.max(0, parseFloat(itemRow.discountpercent || itemRow.discount || '0') || 0));
          const unit = String(itemRow.unit || itemRow.uom || 'pcs').trim() || 'pcs';
          const selectedSize = String(itemRow.selectedsize || itemRow.size || '').trim() || undefined;
          const selectedFinish = String(itemRow.selectedfinish || itemRow.finish || '').trim() || undefined;
          const artworkNotes = String(itemRow.artworknotes || itemRow.artwork || '').trim() || undefined;

          // If the row is totally blank for item fields and unit price is 0, check if metadata total exists
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
            priceName,
            priceTiers,
            discountPercent,
            total,
            selectedSize,
            selectedFinish,
            artworkNotes,
          });

          // Also add to itemsCatalog so it is selectable in product selector
          const existingInCatalog = result.itemsCatalog.find(
            (it) => it.name.toLowerCase() === itemName.toLowerCase()
          );
          if (!existingInCatalog) {
            result.itemsCatalog.push({
              id: `excel-item-${result.itemsCatalog.length + 1}`,
              name: itemName,
              category,
              description: itemDesc,
              unitPrice: resolvedUnitPrice,
              unit,
              priceName,
              priceTiers,
              selectedSize,
              selectedFinish,
            });
          }

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

    const { itemsCatalog, clientsCatalog } = extractCatalogAndClientsFromQuotes(result.quotes);
    result.itemsCatalog = itemsCatalog;
    result.clientsCatalog = clientsCatalog;

    // Also scan all sheets for dedicated "Catalog", "Products", "Items", "Price List", or "Clients" sheets
    workbook.SheetNames.forEach((sheetName) => {
      const isCatalogSheet = /item|product|catalog|pricelist|price|service|pricing/i.test(sheetName) && sheetName !== quoteSheetName;
      const isClientSheet = /client|customer|contact|lead/i.test(sheetName) && sheetName !== quoteSheetName;

      if (isCatalogSheet) {
        const catWs = workbook.Sheets[sheetName];
        const catRows = XLSX.utils.sheet_to_json<Record<string, any>>(catWs, { defval: '' });
        catRows.forEach((row, idx) => {
          const rowMap = new Map<string, any>();
          Object.keys(row).forEach((k) => rowMap.set(cleanHeaderKey(k), row[k]));

          const itemName = getItemNameFromRow(rowMap, row, '');
          if (!itemName) return;

          const priceInfo = extractPricesFromRow(
            row,
            parseFloat(rowMap.get('unitprice') || rowMap.get('price') || rowMap.get('rate') || rowMap.get('unitcost') || '0') || 0
          );
          priceInfo.tiers.forEach((t) => allDetectedPriceNames.add(t.name));

          const unitPrice = priceInfo.primaryPrice;
          const priceName = priceInfo.primaryPriceName;
          const priceTiers = priceInfo.tiers;

          const category = String(rowMap.get('category') || rowMap.get('productcategory') || 'Branding & Commercial Printing').trim() || 'Branding & Commercial Printing';
          const unit = String(rowMap.get('unit') || rowMap.get('uom') || 'pcs').trim() || 'pcs';
          const description = String(rowMap.get('itemdescription') || rowMap.get('description') || rowMap.get('details') || '').trim();
          const selectedSize = String(rowMap.get('selectedsize') || rowMap.get('size') || '').trim() || undefined;
          const selectedFinish = String(rowMap.get('selectedfinish') || rowMap.get('finish') || '').trim() || undefined;

          const existing = result.itemsCatalog.find(
            (it) => it.name.toLowerCase() === itemName.toLowerCase()
          );
          if (!existing) {
            result.itemsCatalog.push({
              id: `excel-item-${result.itemsCatalog.length + 1}`,
              name: itemName,
              category,
              description,
              unitPrice,
              unit,
              priceName,
              priceTiers,
              selectedSize,
              selectedFinish,
            });
          } else {
            if (!existing.priceName && priceName) {
              existing.priceName = priceName;
            }
            if ((!existing.priceTiers || existing.priceTiers.length === 0) && priceTiers.length > 0) {
              existing.priceTiers = priceTiers;
            }
          }
        });
      }

      if (isClientSheet) {
        const clientWs = workbook.Sheets[sheetName];
        const clientRows = XLSX.utils.sheet_to_json<Record<string, any>>(clientWs, { defval: '' });
        clientRows.forEach((row) => {
          const rowMap = new Map<string, any>();
          Object.keys(row).forEach((k) => rowMap.set(cleanHeaderKey(k), row[k]));

          const clientName = String(
            rowMap.get('customername') || rowMap.get('clientname') || rowMap.get('name') || rowMap.get('customer') || ''
          ).trim();
          if (!clientName) return;

          const phone = normalizePhone(rowMap.get('customerphone') || rowMap.get('phone') || rowMap.get('tel') || rowMap.get('mobile'));
          const email = String(rowMap.get('customeremail') || rowMap.get('email') || '').trim() || undefined;
          const companyName = String(rowMap.get('companyname') || rowMap.get('company') || '').trim() || undefined;
          const billingAddress = String(rowMap.get('billingaddress') || rowMap.get('address') || '').trim() || undefined;
          const deliveryLocation = String(rowMap.get('deliverylocation') || rowMap.get('location') || '').trim() || undefined;

          const exists = result.clientsCatalog.some(
            (c) => c.name.toLowerCase() === clientName.toLowerCase() && c.phone === phone
          );
          if (!exists) {
            result.clientsCatalog.push({
              name: clientName,
              phone,
              email,
              companyName,
              billingAddress,
              deliveryLocation,
            });
          }
        });
      }
    });

    // If no quotes were found, but items were found in catalog
    if (result.quotes.length === 0) {
      if (result.itemsCatalog.length > 0) {
        result.warnings.push(`Extracted ${result.itemsCatalog.length} catalog items from spreadsheet. You can now use these items directly to make quotations.`);
        // Remove the fatal error so the dataset can still be used to make quotations!
        result.errors = [];
      } else {
        result.errors.push('No valid quotation rows or product catalog items could be parsed from the Excel file. Please ensure column headers match the template.');
      }
    }

    // Set detected price names from all sheets and rows
    result.detectedPriceNames = Array.from(allDetectedPriceNames);

  } catch (err: any) {
    result.errors.push(`Excel parsing failed: ${err?.message || 'Unsupported or corrupted spreadsheet file.'}`);
  }

  return result;
};

/**
 * Parses an uploaded PDF file (e.g. Woodynat Official Rate Card / Price Catalog / Commercial Quotes PDF)
 * Extracts all lines, categories, exact item names, quantities, price headers (e.g. '@'), price tiers,
 * and builds ready-to-use WoodyQuotation quotes and itemsCatalog.
 */
export const parseWoodyQuotePdfFile = async (
  file: File,
  defaultSettings?: WoodyQuoteSettings,
  defaultPrefix: string = 'WNAT-2026'
): Promise<ParsedExcelQuoteResult> => {
  const result: ParsedExcelQuoteResult = {
    quotes: [],
    totalRows: 0,
    totalItems: 0,
    detectedSheets: [],
    itemsCatalog: [],
    clientsCatalog: [],
    detectedPriceNames: [],
    warnings: [],
    errors: [],
  };

  try {
    // 1. Convert file to base64
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);

    // 2. Fetch lines from backend /api/parse-pdf endpoint
    let lines: string[] = [];
    try {
      const resp = await fetch('/api/parse-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Data: base64, fileName: file.name }),
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.lines && Array.isArray(data.lines)) {
          lines = data.lines;
        }
      }
    } catch (apiErr) {
      console.warn('Backend /api/parse-pdf call failed, will try browser fallback:', apiErr);
    }

    // 3. Fallback to client-side pdfjs-dist if backend was unreachable
    if (lines.length === 0) {
      try {
        const mod = await import('pdfjs-dist/legacy/build/pdf.js');
        const pdfjs = (mod as any).default || mod;
        const loadingTask = pdfjs.getDocument({
          data: new Uint8Array(buffer),
          useSystemFonts: true,
          disableFontFace: true,
          isEvalSupported: false,
        });
        const doc = await loadingTask.promise;
        for (let p = 1; p <= doc.numPages; p++) {
          const page = await doc.getPage(p);
          const textContent = await page.getTextContent();
          const items = (textContent.items || []) as Array<{ str: string; transform: number[] }>;
          const lineMap = new Map<number, Array<{ x: number; str: string }>>();
          for (const it of items) {
            if (!it.str || !it.str.trim()) continue;
            const x = it.transform ? it.transform[4] : 0;
            const y = it.transform ? Math.round(it.transform[5] / 4) * 4 : 0;
            if (!lineMap.has(y)) lineMap.set(y, []);
            lineMap.get(y)!.push({ x, str: it.str.trim() });
          }
          const sortedYs = Array.from(lineMap.keys()).sort((a, b) => b - a);
          for (const y of sortedYs) {
            const rowItems = lineMap.get(y)!.sort((a, b) => a.x - b.x);
            const lineStr = rowItems.map((i) => i.str).join(' ');
            if (lineStr.trim()) lines.push(lineStr.trim());
          }
        }
      } catch (browserErr) {
        console.warn('Client-side pdf extraction notice:', browserErr);
      }
    }

    if (lines.length === 0) {
      result.errors.push('Could not extract readable text from this PDF file. Please ensure it contains selectable text.');
      return result;
    }

    result.totalRows = lines.length;

    // 4. Parse document lines into items, categories, and price tiers
    let currentCategory = 'POSTERS/FLYERS/BROCHURES';
    let currentPriceHeader = '@';
    const detectedCategories = new Set<string>();
    const detectedPrices = new Set<string>();

    interface RawExtractedItem {
      qty: number;
      name: string;
      price: number;
      category: string;
      priceName: string;
    }

    const rawItems: RawExtractedItem[] = [];

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      // Category detection
      if (
        /^(POSTERS|FLYERS|BROCHURES|CALENDARS|CALENDAR|BRANDING|SIGNAGE|APPAREL|PROMOTIONAL|STATIONERY|BANNER)/i.test(line) &&
        !/\d+/.test(line.replace(/a[2-6]|10\*20|wire-o-wire/i, ''))
      ) {
        currentCategory = line;
        detectedCategories.add(currentCategory);
        continue;
      }

      // Header row detection
      if (/qty.*particulars/i.test(line) || /qty.*description/i.test(line) || /qty.*item/i.test(line)) {
        const match = line.match(/(price|unit\s*price|rate|@|ksh|cost)/i);
        if (match) {
          currentPriceHeader = match[0].trim();
          detectedPrices.add(currentPriceHeader);
        }
        continue;
      }

      // Match [Qty] [Name] [Price]
      const m = line.match(/^([\d,]+)\s+(.+?)\s+([\d,]+(?:\.\d+)?)$/);
      if (m) {
        const qty = parseFloat(m[1].replace(/,/g, ''));
        const name = m[2].trim();
        const price = parseFloat(m[3].replace(/,/g, ''));
        if (name && !isNaN(price) && price > 0) {
          rawItems.push({
            qty: !isNaN(qty) && qty > 0 ? qty : 1,
            name,
            price,
            category: currentCategory,
            priceName: currentPriceHeader,
          });
          detectedPrices.add(currentPriceHeader);
          continue;
        }
      }

      // Match [Name] [Price]
      const m2 = line.match(/^([A-Za-z0-9\s()*,.-]+?)\s+([\d,]+(?:\.\d+)?)$/);
      if (m2) {
        const name = m2[1].trim();
        const price = parseFloat(m2[2].replace(/,/g, ''));
        if (name.length > 2 && !/^(page|total|date|tel|phone|p\.o)/i.test(name) && !isNaN(price) && price > 0) {
          rawItems.push({
            qty: 1,
            name,
            price,
            category: currentCategory,
            priceName: currentPriceHeader,
          });
          detectedPrices.add(currentPriceHeader);
        }
      }
    }

    if (rawItems.length === 0) {
      result.errors.push('No product or pricing rows were found in the uploaded PDF. Please verify the document format.');
      return result;
    }

    // 5. Group by base product name to establish price tiers, and also add base items to itemsCatalog
    const baseItemsMap = new Map<string, {
      name: string;
      category: string;
      priceName: string;
      tiers: WoodyItemPriceTier[];
      minPrice: number;
    }>();

    for (const it of rawItems) {
      const baseKey = it.name.toLowerCase().trim();
      if (!baseItemsMap.has(baseKey)) {
        baseItemsMap.set(baseKey, {
          name: it.name,
          category: it.category,
          priceName: it.priceName,
          tiers: [],
          minPrice: it.price,
        });
      }
      const entry = baseItemsMap.get(baseKey)!;
      entry.tiers.push({
        name: `${it.qty.toLocaleString()} pcs @ KSh ${it.price.toLocaleString()}`,
        price: it.price,
      });
      if (it.price < entry.minPrice) entry.minPrice = it.price;
    }

    const itemsCatalog: WoodyExcelCatalogItem[] = [];
    let itCount = 1;
    baseItemsMap.forEach((val) => {
      itemsCatalog.push({
        id: `pdf-item-${itCount++}`,
        name: val.name,
        category: val.category,
        description: `Woodynat commercial grade production: ${val.name}`,
        unitPrice: val.minPrice,
        unit: 'pcs',
        priceName: val.priceName,
        priceTiers: val.tiers,
      });
    });

    result.itemsCatalog = itemsCatalog;
    result.totalItems = rawItems.length;
    result.detectedSheets = Array.from(detectedCategories.size > 0 ? detectedCategories : [currentCategory]);
    result.detectedPriceNames = Array.from(detectedPrices.size > 0 ? detectedPrices : ['@']);

    // 6. Build default starter quotes organized by category
    const quotesByCategory = new Map<string, RawExtractedItem[]>();
    for (const it of rawItems) {
      const cat = it.category || 'General Commercial Printing';
      if (!quotesByCategory.has(cat)) quotesByCategory.set(cat, []);
      quotesByCategory.get(cat)!.push(it);
    }

    const nowIso = new Date().toISOString();
    const today = nowIso.split('T')[0];
    const expiry = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
    let qCount = 1;

    quotesByCategory.forEach((catItems, catName) => {
      const qNum = `${defaultPrefix}-${String(qCount).padStart(4, '0')}`;
      const quoteItems: WoodyQuoteItem[] = catItems.slice(0, 10).map((it, idx) => {
        const qty = it.qty;
        const unitPrice = it.price;
        const total = qty * unitPrice;
        return {
          id: `item-${qNum}-${idx + 1}`,
          name: it.name,
          category: it.category,
          description: `Commercial grade ${it.name}`,
          quantity: qty,
          unit: 'pcs',
          unitPrice,
          priceName: it.priceName,
          discountPercent: 0,
          total,
        };
      });

      const subtotal = quoteItems.reduce((acc, cur) => acc + cur.total, 0);
      result.quotes.push({
        id: `woody-pdf-${qCount}`,
        quoteNumber: qNum,
        customerName: `${catName} Commercial Package`,
        customerPhone: '0797939199',
        customerEmail: 'woodynatdesigners12@gmail.com',
        companyName: 'Woodynat Corporate Client',
        billingAddress: 'Nairobi, Kenya',
        deliveryLocation: 'Temple Road Gatkim complex building fourth floor wing B Room 4B1',
        deliveryType: 'CBD Workshop Pickup',
        quoteDate: today,
        expiryDate: expiry,
        validityDays: 14,
        paymentTerms: defaultSettings?.defaultPaymentTerms || '50% Deposit, 50% on Delivery',
        deliveryTimeline: defaultSettings?.defaultDeliveryTimeline || '24-48 Hours Express Delivery',
        currency: 'KSh',
        items: quoteItems,
        subtotal,
        discountTotal: 0,
        taxRate: 0,
        taxTotal: 0,
        shippingCost: 0,
        grandTotal: subtotal,
        isTaxInclusive: false,
        notes: `Official Commercial Rate Card items extracted directly from ${file.name}.`,
        termsAndConditions: defaultSettings?.defaultTerms || '1. Validity: 14 days from quote date.\n2. Payment: 50% deposit before production, 50% upon delivery sign-off.',
        paybillNumber: defaultSettings?.defaultPaybillNumber || '247247',
        paybillAccount: defaultSettings?.defaultPaybillAccount || '0797939199',
        status: 'Draft',
        createdAt: nowIso,
        updatedAt: nowIso,
        preparedBy: 'Woodynat Commercial Desk',
      });
      qCount++;
    });

  } catch (err: any) {
    result.errors.push(`PDF parsing failed: ${err?.message || 'Unsupported or encrypted PDF document.'}`);
  }

  return result;
};

/**
 * Universal file parser for Woody-Quote (supports Excel .xlsx, .xls, .csv and PDF .pdf)
 */
export const parseWoodyQuoteFile = async (
  file: File,
  defaultSettings?: WoodyQuoteSettings,
  defaultPrefix: string = 'WNAT-2026'
): Promise<ParsedExcelQuoteResult> => {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') {
    return parseWoodyQuotePdfFile(file, defaultSettings, defaultPrefix);
  } else {
    const buffer = await file.arrayBuffer();
    return parseWoodyQuoteExcel(buffer, defaultSettings);
  }
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

/**
 * Generates an authentic, preloaded Woodynat Master Pricing Excel Dataset
 * containing official Woodynat branding & print products, prices, clients, and quotations.
 */
export const getInitialWoodynatExcelDataset = (): WoodyExcelDataset => {
  const nowIso = new Date().toISOString();
  const today = nowIso.split('T')[0];
  const expiry = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];

  const itemsCatalog: WoodyExcelCatalogItem[] = [
    {
      id: 'item-cat-1',
      name: 'Reflective Safety High-Vis Vests',
      category: 'Branding & Commercial Printing',
      description: 'Neon green/orange high-visibility vest with double horizontal silver reflector tape & chest embroidery',
      unitPrice: 850,
      unit: 'pcs',
      selectedSize: 'XL / L Mixed',
      selectedFinish: 'Embroidered Logo'
    },
    {
      id: 'item-cat-2',
      name: 'Corporate Reflective Bomber Jackets',
      category: 'Branding & Commercial Printing',
      description: 'Heavyweight padded waterproof jacket with dual Scotchlite reflector stripes, storm collar & custom embroidery',
      unitPrice: 3800,
      unit: 'pcs',
      selectedSize: 'Large',
      selectedFinish: 'Double Reflector Tape + Embroidered Crest'
    },
    {
      id: 'item-cat-3',
      name: 'Retractable Luxury Pull-Up Banner (Broad Base)',
      category: 'Branding & Commercial Printing',
      description: 'High-resolution vibrant canvas banner with aluminium luxury broad base stand & padded carry bag',
      unitPrice: 4500,
      unit: 'sets',
      selectedSize: '85cm x 200cm',
      selectedFinish: 'Matte Anti-Glare Lamination'
    },
    {
      id: 'item-cat-4',
      name: 'Outdoor Teardrop Advertising Flag',
      category: 'Branding & Commercial Printing',
      description: 'Durable polyester warp-knit flag with reinforced fibreglass pole & heavy square steel base',
      unitPrice: 6500,
      unit: 'sets',
      selectedSize: '3.2 Metres',
      selectedFinish: 'Sublimation Double-Sided Print'
    },
    {
      id: 'item-cat-5',
      name: 'Custom Printed Heavyweight Hoodies 320gsm',
      category: 'Custom Apparel',
      description: 'Super soft fleece lined hoodie with pouch pocket and high density DTF chest & back print',
      unitPrice: 2400,
      unit: 'pcs',
      selectedSize: 'Medium / Large',
      selectedFinish: 'DTF Multi-Color Full Front + Back'
    },
    {
      id: 'item-cat-6',
      name: 'Heavy Pique Cotton Branded Polo Shirts',
      category: 'Custom Apparel',
      description: '220gsm 100% pique cotton polo with contrast ribbed collar and embroidered corporate logo',
      unitPrice: 1250,
      unit: 'pcs',
      selectedSize: 'Mixed S / M / L / XL',
      selectedFinish: 'Precision Chest Embroidery'
    },
    {
      id: 'item-cat-7',
      name: 'Executive Business Cards (Spot UV + Soft Touch)',
      category: 'Branding & Commercial Printing',
      description: '450gsm ultra heavy silk card with velvet soft-touch lamination & raised glossy Spot UV highlights',
      unitPrice: 1500,
      unit: 'boxes (100pcs)',
      selectedSize: '85mm x 55mm',
      selectedFinish: 'Velvet Soft Touch + Raised Spot UV'
    },
    {
      id: 'item-cat-8',
      name: 'SUV / 4x4 Branded Spare Wheel Cover',
      category: 'Vehicle Branding',
      description: 'Heavy duty weather-resistant UV marine vinyl with elasticized hem & full-color fade-resistant UV print',
      unitPrice: 3200,
      unit: 'pcs',
      selectedSize: 'Standard 15"-17" Tyre',
      selectedFinish: 'Fade-Resistant UV Print + Gloss Lamination'
    },
    {
      id: 'item-cat-9',
      name: 'Acrylic 3D LED Backlit Channel Letter Signage',
      category: 'Signage & Displays',
      description: 'Precision laser cut cast acrylic letters with internal high-output waterproof Samsung LEDs and power supply',
      unitPrice: 18500,
      unit: 'sets',
      selectedSize: '180cm x 60cm Overall',
      selectedFinish: 'Warm White LED Halo Glow'
    },
    {
      id: 'item-cat-10',
      name: 'NCR Carbonless Duplicate Invoice / Receipt Books',
      category: 'Commercial Stationery',
      description: '50 sets per book, numbered sequentially in red, perforated top copy, hard backing board with wrap-around shield',
      unitPrice: 850,
      unit: 'books',
      selectedSize: 'A5 Size',
      selectedFinish: 'Duplicated 2-Part (White/Pink)'
    }
  ];

  const clientsCatalog: WoodyExcelClientItem[] = [
    {
      name: 'Sarah Mwangi',
      phone: '0797939199',
      email: 'sarah.mwangi@safarioutdoors.co.ke',
      companyName: 'Safari Outdoors Kenya',
      billingAddress: 'Upper Hill Road, Nairobi',
      deliveryLocation: 'Safari Centre 2nd Floor, Upper Hill',
      deliveryType: 'Express Home Delivery'
    },
    {
      name: 'David Kiprono',
      phone: '0712345678',
      email: 'david@apexlogistics.com',
      companyName: 'Apex Logistics Ltd',
      billingAddress: 'Mombasa Road, Nairobi',
      deliveryLocation: 'Temple Road Gatkim complex building fourth floor wing B Room 4B1',
      deliveryType: 'CBD Workshop Pickup'
    },
    {
      name: 'Grace Wanjiru',
      phone: '0722998877',
      email: 'grace@starlawkenya.com',
      companyName: 'Star Law Advocates',
      billingAddress: 'Kaunda Street, CBD Nairobi',
      deliveryLocation: 'Star Plaza Suite 501, CBD Nairobi',
      deliveryType: 'Express Home Delivery'
    },
    {
      name: 'Peter Omondi',
      phone: '0733445566',
      email: 'peter@greenleaf.co.ke',
      companyName: 'Green Leaf Agribusiness',
      billingAddress: 'Commercial Street, Industrial Area',
      deliveryLocation: 'Temple Road Gatkim complex building fourth floor wing B Room 4B1',
      deliveryType: 'CBD Workshop Pickup'
    }
  ];

  const quotes: WoodyQuotation[] = [
    {
      id: 'woody-excel-init-001',
      quoteNumber: 'WNAT-2026-0001',
      customerName: 'Sarah Mwangi',
      customerPhone: '0797939199',
      customerEmail: 'sarah.mwangi@safarioutdoors.co.ke',
      companyName: 'Safari Outdoors Kenya',
      billingAddress: 'Upper Hill Road, Nairobi',
      deliveryLocation: 'Safari Centre 2nd Floor, Upper Hill',
      deliveryType: 'Express Home Delivery',
      quoteDate: today,
      expiryDate: expiry,
      validityDays: 14,
      paymentTerms: '50% Deposit, 50% on Delivery',
      deliveryTimeline: '24-48 Hours Express Delivery',
      currency: 'KSh',
      items: [
        {
          id: 'item-init-1',
          name: 'Reflective Safety High-Vis Vests',
          category: 'Branding & Commercial Printing',
          description: 'Neon green with double horizontal silver reflector tape & chest embroidery',
          quantity: 50,
          unit: 'pcs',
          unitPrice: 850,
          discountPercent: 5,
          total: 40375,
          selectedSize: 'XL / L Mixed',
          selectedFinish: 'Embroidered Logo'
        },
        {
          id: 'item-init-2',
          name: 'Heavy Pique Cotton Branded Polo Shirts',
          category: 'Custom Apparel',
          description: '220gsm 100% pique cotton polo with contrast ribbed collar and embroidered corporate logo',
          quantity: 30,
          unit: 'pcs',
          unitPrice: 1250,
          discountPercent: 0,
          total: 37500,
          selectedSize: 'Mixed S / M / L / XL',
          selectedFinish: 'Precision Chest Embroidery'
        }
      ],
      subtotal: 80000,
      discountTotal: 2125,
      taxRate: 0,
      taxTotal: 0,
      shippingCost: 350,
      grandTotal: 78225,
      isTaxInclusive: false,
      notes: 'Vector artwork proof confirmed via WhatsApp. Production commences immediately upon deposit verification.',
      termsAndConditions: '1. Validity: 14 days from quote date.\n2. Payment: 50% deposit before production, 50% upon delivery sign-off.\n3. Goods remain property of Woodynat Designers Limited until paid in full.',
      paybillNumber: '247247',
      paybillAccount: '0797939199',
      status: 'Approved',
      createdAt: nowIso,
      updatedAt: nowIso,
      preparedBy: 'Woodynat Commercial Desk'
    },
    {
      id: 'woody-excel-init-002',
      quoteNumber: 'WNAT-2026-0002',
      customerName: 'David Kiprono',
      customerPhone: '0712345678',
      customerEmail: 'david@apexlogistics.com',
      companyName: 'Apex Logistics Ltd',
      billingAddress: 'Mombasa Road, Nairobi',
      deliveryLocation: 'Temple Road Gatkim complex building fourth floor wing B Room 4B1',
      deliveryType: 'CBD Workshop Pickup',
      quoteDate: today,
      expiryDate: expiry,
      validityDays: 14,
      paymentTerms: '50% Deposit, 50% on Delivery',
      deliveryTimeline: 'Same Day Express (4-6 Hours)',
      currency: 'KSh',
      items: [
        {
          id: 'item-init-3',
          name: 'Retractable Luxury Pull-Up Banner (Broad Base)',
          category: 'Branding & Commercial Printing',
          description: 'High-resolution vibrant canvas banner with aluminium luxury broad base stand & padded carry bag',
          quantity: 2,
          unit: 'sets',
          unitPrice: 4500,
          discountPercent: 10,
          total: 8100,
          selectedSize: '85cm x 200cm',
          selectedFinish: 'Matte Anti-Glare Lamination'
        },
        {
          id: 'item-init-4',
          name: 'SUV / 4x4 Branded Spare Wheel Cover',
          category: 'Vehicle Branding',
          description: 'Heavy duty weather-resistant UV marine vinyl with elasticized hem & full-color fade-resistant UV print',
          quantity: 1,
          unit: 'pcs',
          unitPrice: 3200,
          discountPercent: 0,
          total: 3200,
          selectedSize: 'Standard 15"-17" Tyre',
          selectedFinish: 'Fade-Resistant UV Print + Gloss Lamination'
        }
      ],
      subtotal: 12200,
      discountTotal: 900,
      taxRate: 0,
      taxTotal: 0,
      shippingCost: 0,
      grandTotal: 11300,
      isTaxInclusive: false,
      notes: 'Express turnaround for trade expo display. Workshop collection scheduled for 3:30 PM.',
      termsAndConditions: '1. Validity: 14 days from quote date.\n2. Payment: 50% deposit before production, 50% upon delivery sign-off.',
      paybillNumber: '247247',
      paybillAccount: '0797939199',
      status: 'Sent',
      createdAt: nowIso,
      updatedAt: nowIso,
      preparedBy: 'Woodynat Commercial Desk'
    }
  ];

  return {
    fileName: 'Woodynat_Official_Commercial_Master.xlsx',
    uploadedAt: nowIso,
    quotes,
    itemsCatalog,
    clientsCatalog,
    totalRows: 16,
    detectedSheets: ['Quotations Master', 'Items Catalog & Pricing', 'Clients Directory', 'Line Items Breakdown']
  };
};

/**
 * Exports the entire live Woody-Quote Excel dataset (Quotes, Catalog Items, Clients)
 * into a complete multi-sheet Excel file (.xlsx) so the admin can backup or share anytime.
 */
export const exportWoodyDatasetToExcel = (dataset: WoodyExcelDataset) => {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Quotations Master
  const quoteRows = dataset.quotes.map((q) => ({
    'Quote Number': q.quoteNumber,
    'Status': q.status,
    'Quote Date': q.quoteDate,
    'Expiry Date': q.expiryDate,
    'Customer Name': q.customerName,
    'Customer Phone': q.customerPhone,
    'Customer Email': q.customerEmail,
    'Company Name': q.companyName || '',
    'Delivery Location': q.deliveryLocation,
    'Delivery Type': q.deliveryType,
    'Delivery Timeline': q.deliveryTimeline,
    'Payment Terms': q.paymentTerms,
    'Currency': q.currency,
    'Items Count': q.items.length,
    'Subtotal (KSh)': q.subtotal,
    'Discount Total (KSh)': q.discountTotal,
    'Shipping Cost (KSh)': q.shippingCost,
    'Grand Total (KSh)': q.grandTotal,
    'Prepared By': q.preparedBy,
    'Notes': q.notes,
    'Terms': q.termsAndConditions,
  }));

  const quoteWs = XLSX.utils.json_to_sheet(quoteRows.length > 0 ? quoteRows : [{
    'Quote Number': 'WNAT-2026-0001',
    'Customer Name': 'Sample Customer',
    'Subtotal (KSh)': 0,
    'Grand Total (KSh)': 0
  }]);
  quoteWs['!cols'] = [
    { wch: 18 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
    { wch: 22 }, { wch: 15 }, { wch: 26 }, { wch: 22 },
    { wch: 35 }, { wch: 22 }, { wch: 26 }, { wch: 26 },
    { wch: 10 }, { wch: 12 }, { wch: 15 }, { wch: 18 },
    { wch: 16 }, { wch: 16 }, { wch: 22 }, { wch: 35 }, { wch: 35 }
  ];
  XLSX.utils.book_append_sheet(wb, quoteWs, 'Quotations Master');

  // Sheet 2: Items Catalog & Pricing
  const catalogRows = dataset.itemsCatalog.map((item, idx) => ({
    'Item ID': item.id || `ITEM-${idx + 1}`,
    'Item Name': item.name,
    'Category': item.category,
    'Price Name / Tier': item.priceName || 'Unit Price',
    'Unit Price (KSh)': item.unitPrice,
    'Unit': item.unit,
    'Selected Size': item.selectedSize || '',
    'Selected Finish': item.selectedFinish || '',
    'Description': item.description || '',
    'Artwork Notes': item.artworkNotes || ''
  }));

  const catalogWs = XLSX.utils.json_to_sheet(catalogRows);
  catalogWs['!cols'] = [
    { wch: 16 }, { wch: 35 }, { wch: 28 }, { wch: 20 }, { wch: 16 },
    { wch: 12 }, { wch: 20 }, { wch: 28 }, { wch: 45 }, { wch: 25 }
  ];
  XLSX.utils.book_append_sheet(wb, catalogWs, 'Items Catalog & Pricing');

  // Sheet 3: Clients Directory
  const clientRows = dataset.clientsCatalog.map((c) => ({
    'Client Name': c.name,
    'Phone / WhatsApp': c.phone,
    'Email Address': c.email || '',
    'Company Name': c.companyName || '',
    'Billing Address': c.billingAddress || '',
    'Delivery Location': c.deliveryLocation || '',
    'Delivery Type': c.deliveryType || 'CBD Workshop Pickup'
  }));

  const clientWs = XLSX.utils.json_to_sheet(clientRows);
  clientWs['!cols'] = [
    { wch: 24 }, { wch: 18 }, { wch: 28 }, { wch: 26 },
    { wch: 30 }, { wch: 35 }, { wch: 24 }
  ];
  XLSX.utils.book_append_sheet(wb, clientWs, 'Clients Directory');

  // Sheet 4: All Quote Line Items Breakdown
  const lineItemRows: any[] = [];
  dataset.quotes.forEach((q) => {
    q.items.forEach((it, idx) => {
      lineItemRows.push({
        'Quote Number': q.quoteNumber,
        'Customer Name': q.customerName,
        'Item #': idx + 1,
        'Item Name': it.name,
        'Price Name / Tier': it.priceName || 'Unit Price',
        'Description': it.description,
        'Quantity': it.quantity,
        'Unit': it.unit,
        'Unit Price (KSh)': it.unitPrice,
        'Discount %': it.discountPercent,
        'Total (KSh)': it.total,
        'Selected Size': it.selectedSize || '',
        'Selected Finish': it.selectedFinish || '',
        'Artwork Notes': it.artworkNotes || '',
        'Status': q.status
      });
    });
  });

  if (lineItemRows.length > 0) {
    const lineItemWs = XLSX.utils.json_to_sheet(lineItemRows);
    lineItemWs['!cols'] = [
      { wch: 18 }, { wch: 20 }, { wch: 8 }, { wch: 30 }, { wch: 20 },
      { wch: 45 }, { wch: 10 }, { wch: 12 }, { wch: 15 },
      { wch: 12 }, { wch: 15 }, { wch: 18 }, { wch: 22 },
      { wch: 25 }, { wch: 14 }
    ];
    XLSX.utils.book_append_sheet(wb, lineItemWs, 'Line Items Breakdown');
  }

  const exportName = dataset.fileName ? dataset.fileName.replace(/\.[^/.]+$/, "") + `_Updated_${new Date().toISOString().split('T')[0]}.xlsx` : `Woody_Quote_Excel_Master_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, exportName);
};

