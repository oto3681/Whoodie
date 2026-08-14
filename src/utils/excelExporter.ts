import * as XLSX from 'xlsx';
import { Order, Product } from '../types';

/**
 * Export full system database, transactions, payments, financial analysis, and product analytics to an Excel file (.xlsx).
 * All records remain safely in the system while being exported.
 */
export const exportAllSystemDataToExcel = (
  orders: Order[],
  products: Product[],
  wpSettings: any
) => {
  const wb = XLSX.utils.book_new();
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

  // 1. TRANSACTIONS & PAYMENTS SHEET
  const transactionRows = orders.map((ord) => {
    const itemNames = ord.items.map((i) => `${i.product.name} (x${i.quantity})`).join('; ');
    const totalQty = ord.items.reduce((sum, i) => sum + i.quantity, 0);

    return {
      'Order Reference ID': ord.id,
      'Transaction Date & Time': ord.createdAt,
      'Customer Name': ord.customerName,
      'Customer Phone': ord.customerPhone,
      'Customer Email': ord.customerEmail || 'N/A',
      'Payment Gateway': ord.paymentMethod || 'M-Pesa',
      'M-Pesa Receipt Ref': ord.paymentReference || 'VERIFIED-MPESA',
      'Payment Status': ord.paymentStatus || 'Paid',
      'Subtotal (KSh)': ord.subtotal,
      'Shipping Fee (KSh)': ord.shippingFee,
      'Total Amount Paid (KSh)': ord.totalAmount,
      'Delivery Option': ord.deliveryType,
      'Delivery Address': `${ord.deliveryAddress}, ${ord.deliveryCity}`,
      'Production Status': ord.orderStatus,
      'Total Items Quantity': totalQty,
      'Purchased Products Summary': itemNames,
    };
  });

  const transactionsWs = XLSX.utils.json_to_sheet(transactionRows);
  // Auto-fit column widths
  transactionsWs['!cols'] = [
    { wch: 18 }, // Order Ref ID
    { wch: 22 }, // Date
    { wch: 22 }, // Customer Name
    { wch: 16 }, // Customer Phone
    { wch: 25 }, // Customer Email
    { wch: 16 }, // Payment Gateway
    { wch: 20 }, // M-Pesa Ref
    { wch: 15 }, // Payment Status
    { wch: 15 }, // Subtotal
    { wch: 15 }, // Shipping Fee
    { wch: 22 }, // Total Amount
    { wch: 22 }, // Delivery Option
    { wch: 30 }, // Delivery Address
    { wch: 22 }, // Production Status
    { wch: 18 }, // Total Items Qty
    { wch: 45 }, // Products Summary
  ];
  XLSX.utils.book_append_sheet(wb, transactionsWs, 'Transactions & Payments');

  // 2. FINANCIAL & SYSTEM ANALYTICS SHEET
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const paidOrders = orders.filter((o) => (o.paymentStatus || 'Paid') === 'Paid');
  const totalPaidRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const activeOrdersCount = orders.filter((o) => o.orderStatus !== 'Delivered').length;
  const deliveredOrdersCount = orders.filter((o) => o.orderStatus === 'Delivered').length;
  const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

  // Revenue by Category
  const categoryRevenueMap: Record<string, { totalAmount: number; count: number }> = {};
  orders.forEach((ord) => {
    ord.items.forEach((it) => {
      const cat = it.product.category || 'General Print';
      if (!categoryRevenueMap[cat]) {
        categoryRevenueMap[cat] = { totalAmount: 0, count: 0 };
      }
      categoryRevenueMap[cat].totalAmount += it.calculatedPrice || (it.product.price * it.quantity);
      categoryRevenueMap[cat].count += it.quantity;
    });
  });

  const categoryBreakdownRows = Object.entries(categoryRevenueMap).map(([catName, stat]) => ({
    'Print Category': catName,
    'Units Sold': stat.count,
    'Total Revenue (KSh)': stat.totalAmount,
    'Category Revenue Share (%)': totalRevenue > 0 ? `${((stat.totalAmount / totalRevenue) * 100).toFixed(1)}%` : '0%',
  }));

  const analyticsSummaryRows = [
    { 'Key Financial & Performance Indicator': 'System Export Timestamp', Value: timestamp },
    { 'Key Financial & Performance Indicator': 'Total Cumulative Gross Sales Revenue (KSh)', Value: `KSh ${totalRevenue.toLocaleString()}` },
    { 'Key Financial & Performance Indicator': 'Verified & Confirmed Payments (KSh)', Value: `KSh ${totalPaidRevenue.toLocaleString()}` },
    { 'Key Financial & Performance Indicator': 'Total Orders Recorded', Value: orders.length },
    { 'Key Financial & Performance Indicator': 'Average Order Value (AOV)', Value: `KSh ${avgOrderValue.toLocaleString()}` },
    { 'Key Financial & Performance Indicator': 'Active Print Jobs in Queue', Value: activeOrdersCount },
    { 'Key Financial & Performance Indicator': 'Completed & Delivered Orders', Value: deliveredOrdersCount },
    { 'Key Financial & Performance Indicator': 'Total Products in Live Catalog', Value: products.length },
    { 'Key Financial & Performance Indicator': 'M-Pesa Express Paybill Number', Value: wpSettings.paybillNumber || '247247' },
    { 'Key Financial & Performance Indicator': 'M-Pesa Account Reference', Value: wpSettings.paybillAccount || '0797939199' },
  ];

  const analyticsWs = XLSX.utils.json_to_sheet(analyticsSummaryRows);
  analyticsWs['!cols'] = [{ wch: 45 }, { wch: 35 }];
  XLSX.utils.book_append_sheet(wb, analyticsWs, 'Financial Summary');

  const categoryWs = XLSX.utils.json_to_sheet(categoryBreakdownRows);
  categoryWs['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 22 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(wb, categoryWs, 'Sales by Category');

  // 3. PRODUCT CATALOG PERFORMANCE SHEET
  const productPerformanceRows = products.map((prod) => {
    // Calculate total sold for this product across orders
    let totalSold = 0;
    let totalProductRevenue = 0;

    orders.forEach((ord) => {
      ord.items.forEach((it) => {
        if (it.product.id === prod.id || it.product.name === prod.name) {
          totalSold += it.quantity;
          totalProductRevenue += it.calculatedPrice || (prod.price * it.quantity);
        }
      });
    });

    return {
      'Product ID': prod.id,
      'Product Name': prod.name,
      'Category': prod.category,
      'Unit Price (KSh)': prod.price,
      'Quote Based Only': prod.isQuoteOnly ? 'Yes' : 'No',
      'Stock Inventory Count': prod.stockCount,
      'Rating': prod.rating,
      'Total Customer Reviews': prod.reviewCount,
      'Flash Sale Active': prod.isFlashDeal ? 'Yes' : 'No',
      'Express 24h Delivery': prod.expressDeliveryAvailable ? 'Yes' : 'No',
      'Units Sold': totalSold,
      'Gross Revenue Generated (KSh)': totalProductRevenue,
    };
  });

  const productsWs = XLSX.utils.json_to_sheet(productPerformanceRows);
  productsWs['!cols'] = [
    { wch: 20 }, // Product ID
    { wch: 35 }, // Name
    { wch: 22 }, // Category
    { wch: 16 }, // Unit Price
    { wch: 18 }, // Quote Only
    { wch: 20 }, // Stock
    { wch: 10 }, // Rating
    { wch: 22 }, // Reviews
    { wch: 18 }, // Flash
    { wch: 20 }, // Express
    { wch: 14 }, // Units Sold
    { wch: 25 }, // Revenue
  ];
  XLSX.utils.book_append_sheet(wb, productsWs, 'Product Inventory & Sales');

  // 4. SYSTEM & PAYBILL AUDIT SETTINGS SHEET
  const systemAuditRows = [
    { Configuration: 'Company Name', Setting: wpSettings.siteTitle || 'Woodynat Designers Limited' },
    { Configuration: 'Tagline / Slogan', Setting: wpSettings.tagline || 'Your Reliable Partner in Design and Branding' },
    { Configuration: 'Official M-Pesa Paybill', Setting: wpSettings.paybillNumber || '247247' },
    { Configuration: 'M-Pesa Account Ref', Setting: wpSettings.paybillAccount || '0797939199' },
    { Configuration: 'M-Pesa API Environment', Setting: wpSettings.mpesaEnvironment || 'production' },
    { Configuration: 'WhatsApp Business Number', Setting: wpSettings.whatsappNumber || '254797939199' },
    { Configuration: 'Support Phone Line', Setting: wpSettings.supportPhone || '+254 797 939 199' },
    { Configuration: 'Official Business Email', Setting: wpSettings.companyEmail || 'info@woodynat.co.ke' },
    { Configuration: 'Physical Address', Setting: wpSettings.companyAddress || 'Temple Road Gatkim Complex Building fourth floor Wing B Room 4B1' },
    { Configuration: 'City & Location', Setting: wpSettings.companyCity || 'Nairobi' },
    { Configuration: 'Export Generated At', Setting: timestamp },
    { Configuration: 'System Version', Setting: 'Woodynat M-Pesa ERP v3.8.2 Live' },
  ];

  const auditWs = XLSX.utils.json_to_sheet(systemAuditRows);
  auditWs['!cols'] = [{ wch: 30 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(wb, auditWs, 'System Audit & Settings');

  // Save Excel file
  const fileName = `Woodynat_System_Transactions_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

/**
 * Export specifically the Transactions and M-Pesa Payment log to Excel
 */
export const exportTransactionsToExcel = (orders: Order[]) => {
  const wb = XLSX.utils.book_new();

  const transactionRows = orders.map((ord) => {
    const itemNames = ord.items.map((i) => `${i.product.name} (x${i.quantity})`).join('; ');
    const totalQty = ord.items.reduce((sum, i) => sum + i.quantity, 0);

    return {
      'Order Reference ID': ord.id,
      'Transaction Date & Time': ord.createdAt,
      'Customer Name': ord.customerName,
      'Customer Phone': ord.customerPhone,
      'Customer Email': ord.customerEmail || 'N/A',
      'Payment Gateway': ord.paymentMethod || 'M-Pesa',
      'M-Pesa Receipt Code': ord.paymentReference || 'VERIFIED-MPESA',
      'Payment Status': ord.paymentStatus || 'Paid',
      'Subtotal (KSh)': ord.subtotal,
      'Shipping Fee (KSh)': ord.shippingFee,
      'Total Paid (KSh)': ord.totalAmount,
      'Delivery Option': ord.deliveryType,
      'Delivery Location': `${ord.deliveryAddress}, ${ord.deliveryCity}`,
      'Production Status': ord.orderStatus,
      'Items Summary': itemNames,
      'Total Items Count': totalQty,
    };
  });

  const ws = XLSX.utils.json_to_sheet(transactionRows);
  ws['!cols'] = [
    { wch: 18 }, { wch: 22 }, { wch: 22 }, { wch: 16 }, { wch: 25 },
    { wch: 16 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
    { wch: 18 }, { wch: 22 }, { wch: 30 }, { wch: 22 }, { wch: 45 }, { wch: 16 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'M-Pesa Transactions');
  XLSX.writeFile(wb, `Woodynat_M-Pesa_Transactions_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

/**
 * Export specifically the Financial & Revenue Analytics to Excel
 */
export const exportAnalyticsToExcel = (orders: Order[], products: Product[]) => {
  const wb = XLSX.utils.book_new();
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Financial Breakdown by Category
  const catMap: Record<string, { totalAmount: number; count: number }> = {};
  orders.forEach((ord) => {
    ord.items.forEach((it) => {
      const cat = it.product.category || 'General Print';
      if (!catMap[cat]) catMap[cat] = { totalAmount: 0, count: 0 };
      catMap[cat].totalAmount += it.calculatedPrice || (it.product.price * it.quantity);
      catMap[cat].count += it.quantity;
    });
  });

  const categoryRows = Object.entries(catMap).map(([cat, stat]) => ({
    'Category Name': cat,
    'Units Sold': stat.count,
    'Revenue Generated (KSh)': stat.totalAmount,
    'Percentage Share': totalRevenue > 0 ? `${((stat.totalAmount / totalRevenue) * 100).toFixed(1)}%` : '0%',
  }));

  const catWs = XLSX.utils.json_to_sheet(categoryRows);
  catWs['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 25 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, catWs, 'Category Analytics');

  XLSX.writeFile(wb, `Woodynat_Financial_Analytics_${new Date().toISOString().slice(0, 10)}.xlsx`);
};
