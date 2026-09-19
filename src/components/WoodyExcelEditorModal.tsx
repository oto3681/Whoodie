import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  X, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  Download, 
  Upload, 
  Sparkles, 
  Package, 
  Building2, 
  FileText, 
  Settings, 
  Save, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Tag,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WoodyExcelCatalogItem, WoodyExcelClientItem } from '../types';
import { exportWoodyDatasetToExcel, downloadWoodyQuoteExcelTemplate } from '../utils/woodyQuoteExcelHandler';

interface WoodyExcelEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditQuote?: (quoteId: string) => void;
  defaultTab?: 'catalog' | 'clients' | 'quotes' | 'settings';
}

export const WoodyExcelEditorModal: React.FC<WoodyExcelEditorModalProps> = ({
  isOpen,
  onClose,
  onEditQuote,
  defaultTab = 'catalog'
}) => {
  const { 
    woodyExcelDataset, 
    updateWoodyExcelCatalogItem, 
    addWoodyExcelCatalogItem, 
    deleteWoodyExcelCatalogItem,
    updateWoodyExcelClient,
    addWoodyExcelClient,
    deleteWoodyExcelClient,
    updateWoodyExcelDatasetMeta,
    loadInitialWoodynatExcelDataset,
    deleteZohoQuotation,
    zohoSettings,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'catalog' | 'clients' | 'quotes' | 'settings'>(defaultTab);

  // Catalog tab states
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [editingCatalogItemId, setEditingCatalogItemId] = useState<string | null>(null);
  const [catalogItemForm, setCatalogItemForm] = useState<WoodyExcelCatalogItem>({
    id: '',
    name: '',
    category: '',
    unitPrice: 0,
    unit: 'pcs',
    description: ''
  });
  const [isAddingCatalogItem, setIsAddingCatalogItem] = useState(false);
  const [newCatalogItem, setNewCatalogItem] = useState<Omit<WoodyExcelCatalogItem, 'id'>>({
    name: '',
    category: 'Commercial Print',
    unitPrice: 500,
    unit: 'pcs',
    description: ''
  });

  // Clients tab states
  const [clientSearch, setClientSearch] = useState('');
  const [editingClientKey, setEditingClientKey] = useState<string | null>(null);
  const [clientForm, setClientForm] = useState<WoodyExcelClientItem>({
    name: '',
    phone: '',
    email: '',
    companyName: '',
    billingAddress: '',
    deliveryLocation: ''
  });
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [newClient, setNewClient] = useState<WoodyExcelClientItem>({
    name: '',
    phone: '',
    email: '',
    companyName: '',
    billingAddress: 'Nairobi, Kenya',
    deliveryLocation: 'CBD Workshop Pickup'
  });

  // Quotes tab states
  const [quoteSearch, setQuoteSearch] = useState('');

  // Settings / Meta states
  const [customFileName, setCustomFileName] = useState(woodyExcelDataset?.fileName || 'Woodynat_Quotations_Master.xlsx');

  if (!isOpen || !woodyExcelDataset) return null;

  // Filtered Catalog Items
  const filteredCatalogItems = woodyExcelDataset.itemsCatalog.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(catalogSearch.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(catalogSearch.toLowerCase()));
    const matchesCategory = selectedCategoryFilter === 'All' || item.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Unique categories in catalog
  const catalogCategories = Array.from(new Set(
    woodyExcelDataset.itemsCatalog.map(i => i.category).filter(Boolean)
  )) as string[];

  // Filtered Clients
  const filteredClients = woodyExcelDataset.clientsCatalog.filter(client => {
    const q = clientSearch.toLowerCase();
    return (
      client.name.toLowerCase().includes(q) ||
      client.phone.includes(q) ||
      (client.email && client.email.toLowerCase().includes(q)) ||
      (client.companyName && client.companyName.toLowerCase().includes(q))
    );
  });

  // Filtered Quotes
  const filteredQuotes = woodyExcelDataset.quotes.filter(q => {
    const s = quoteSearch.toLowerCase();
    return (
      q.quoteNumber.toLowerCase().includes(s) ||
      q.customerName.toLowerCase().includes(s) ||
      q.customerPhone.includes(s) ||
      (q.companyName && q.companyName.toLowerCase().includes(s))
    );
  });

  // Handle Save Edited Catalog Item
  const handleSaveCatalogItem = (itemId: string) => {
    if (!catalogItemForm.name.trim()) {
      showToast('Validation Error', 'Item name cannot be empty.');
      return;
    }
    updateWoodyExcelCatalogItem({
      id: itemId,
      name: catalogItemForm.name.trim(),
      category: catalogItemForm.category?.trim() || 'Custom Item',
      unitPrice: Math.max(0, Number(catalogItemForm.unitPrice) || 0),
      unit: catalogItemForm.unit?.trim() || 'pcs',
      description: catalogItemForm.description?.trim() || ''
    });
    setEditingCatalogItemId(null);
    showToast('Excel Item Updated', `Updated "${catalogItemForm.name}" in uploaded Excel dataset.`);
  };

  // Handle Add New Catalog Item
  const handleAddNewCatalogItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatalogItem.name.trim()) {
      showToast('Validation Error', 'Please enter an item name.');
      return;
    }
    addWoodyExcelCatalogItem({
      name: newCatalogItem.name.trim(),
      category: newCatalogItem.category?.trim() || 'Commercial Print',
      unitPrice: Math.max(0, Number(newCatalogItem.unitPrice) || 0),
      unit: newCatalogItem.unit?.trim() || 'pcs',
      description: newCatalogItem.description?.trim() || ''
    });
    setIsAddingCatalogItem(false);
    setNewCatalogItem({
      name: '',
      category: 'Commercial Print',
      unitPrice: 500,
      unit: 'pcs',
      description: ''
    });
    showToast('Item Added to Excel', `Added new item to Excel catalog.`);
  };

  // Handle Save Edited Client
  const handleSaveClient = (originalKey: string) => {
    if (!clientForm.name.trim() || !clientForm.phone.trim()) {
      showToast('Validation Error', 'Client name and phone number are required.');
      return;
    }
    updateWoodyExcelClient(originalKey, {
      name: clientForm.name.trim(),
      phone: clientForm.phone.trim(),
      email: clientForm.email?.trim() || '',
      companyName: clientForm.companyName?.trim() || '',
      billingAddress: clientForm.billingAddress?.trim() || '',
      deliveryLocation: clientForm.deliveryLocation?.trim() || ''
    });
    setEditingClientKey(null);
    showToast('Excel Client Updated', `Updated "${clientForm.name}" in uploaded Excel dataset.`);
  };

  // Handle Add New Client
  const handleAddNewClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name.trim() || !newClient.phone.trim()) {
      showToast('Validation Error', 'Please provide at least a name and phone number.');
      return;
    }
    addWoodyExcelClient({
      name: newClient.name.trim(),
      phone: newClient.phone.trim(),
      email: newClient.email?.trim() || '',
      companyName: newClient.companyName?.trim() || '',
      billingAddress: newClient.billingAddress?.trim() || 'Nairobi, Kenya',
      deliveryLocation: newClient.deliveryLocation?.trim() || 'CBD Workshop Pickup'
    });
    setIsAddingClient(false);
    setNewClient({
      name: '',
      phone: '',
      email: '',
      companyName: '',
      billingAddress: 'Nairobi, Kenya',
      deliveryLocation: 'CBD Workshop Pickup'
    });
    showToast('Client Added to Excel', `Added new client contact to Excel directory.`);
  };

  // Handle Save File Name / Meta
  const handleSaveMeta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFileName.trim()) return;
    const finalName = customFileName.endsWith('.xlsx') ? customFileName.trim() : `${customFileName.trim()}.xlsx`;
    updateWoodyExcelDatasetMeta({ fileName: finalName });
    showToast('File Name Updated', `Workbook renamed to "${finalName}".`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[94vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* ========================================================================= */}
        {/* Modal Header */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-950 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-inner">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">
                  Woody-Quote In-App Excel Data Editor
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Permanent Cloud Sync</span>
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Active File: <span className="text-emerald-300 font-bold">{woodyExcelDataset.fileName}</span> • {woodyExcelDataset.quotes.length} quotations • {woodyExcelDataset.itemsCatalog.length} catalog items • {woodyExcelDataset.clientsCatalog.length} clients
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                exportWoodyDatasetToExcel(woodyExcelDataset);
                showToast('Excel Downloaded', `Saved current dataset as "${woodyExcelDataset.fileName}".`);
              }}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
              title="Download updated .xlsx workbook to your computer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .xlsx</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* Navigation Tabs Bar */}
        {/* ========================================================================= */}
        <div className="bg-slate-900 px-6 pt-3 flex items-center gap-2 border-b border-slate-800 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'catalog'
                ? 'bg-white text-slate-900 shadow-sm border-t-2 border-emerald-500'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-emerald-600" />
            <span>Items & Pricing Catalog</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
              activeTab === 'catalog' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-800 text-slate-400'
            }`}>
              {woodyExcelDataset.itemsCatalog.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('clients')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'clients'
                ? 'bg-white text-slate-900 shadow-sm border-t-2 border-blue-500'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Clients Directory</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
              activeTab === 'clients' ? 'bg-blue-100 text-blue-800' : 'bg-slate-800 text-slate-400'
            }`}>
              {woodyExcelDataset.clientsCatalog.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('quotes')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'quotes'
                ? 'bg-white text-slate-900 shadow-sm border-t-2 border-purple-500'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-purple-600" />
            <span>Excel Quotations</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
              activeTab === 'quotes' ? 'bg-purple-100 text-purple-800' : 'bg-slate-800 text-slate-400'
            }`}>
              {woodyExcelDataset.quotes.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-white text-slate-900 shadow-sm border-t-2 border-slate-600'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            <span>File Settings & Export</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* Tab Body */}
        {/* ========================================================================= */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
          
          {/* TAB 1: CATALOG & PRICING SHEET */}
          {activeTab === 'catalog' && (
            <div className="space-y-4">
              {/* Controls bar: Search, Categories, Add Button */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="flex flex-1 items-center gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search Excel items by name or category..."
                      value={catalogSearch}
                      onChange={(e) => setCatalogSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>

                  {catalogCategories.length > 0 && (
                    <select
                      value={selectedCategoryFilter}
                      onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                      className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-bold focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="All">All Categories ({woodyExcelDataset.itemsCatalog.length})</option>
                      {catalogCategories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsAddingCatalogItem(!isAddingCatalogItem)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAddingCatalogItem ? 'Cancel New Item' : 'Add Item to Excel'}</span>
                  </button>
                </div>
              </div>

              {/* Add New Item Form Card */}
              {isAddingCatalogItem && (
                <form onSubmit={handleAddNewCatalogItem} className="bg-emerald-50/80 border-2 border-emerald-400 rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-emerald-700" />
                      <span>Add New Commercial Item to Uploaded Excel Catalog</span>
                    </h4>
                    <span className="text-[10px] text-emerald-700 font-bold">
                      Will immediately be available in quote builder
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold uppercase text-slate-700 mb-1">Item Title / Product Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. A2 Promotional Wall Calendar (Gloss Art)"
                        value={newCatalogItem.name}
                        onChange={(e) => setNewCatalogItem({ ...newCatalogItem, name: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-700 mb-1">Category</label>
                      <input
                        type="text"
                        placeholder="e.g. Commercial Print"
                        value={newCatalogItem.category}
                        onChange={(e) => setNewCatalogItem({ ...newCatalogItem, category: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-700 mb-1">Unit Price (KSh) *</label>
                      <input
                        type="number"
                        min={0}
                        required
                        value={newCatalogItem.unitPrice}
                        onChange={(e) => setNewCatalogItem({ ...newCatalogItem, unitPrice: Number(e.target.value) })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-700 mb-1">Pricing Unit</label>
                      <input
                        type="text"
                        placeholder="e.g. pcs, meters, roll, set, box"
                        value={newCatalogItem.unit}
                        onChange={(e) => setNewCatalogItem({ ...newCatalogItem, unit: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold uppercase text-slate-700 mb-1">Description / Specifications</label>
                      <input
                        type="text"
                        placeholder="e.g. 250gsm Silk Art, Full Color, Metallic Wiro Binding"
                        value={newCatalogItem.description}
                        onChange={(e) => setNewCatalogItem({ ...newCatalogItem, description: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-emerald-200">
                    <button
                      type="button"
                      onClick={() => setIsAddingCatalogItem(false)}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save to Excel Catalog</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Items Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 text-[10px] font-extrabold uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">#</th>
                        <th className="py-3 px-4">Item Name & Specifications</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Unit Price</th>
                        <th className="py-3 px-4">Unit</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredCatalogItems.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400">
                            No catalog items match your search.
                          </td>
                        </tr>
                      ) : (
                        filteredCatalogItems.map((item, idx) => {
                          const isEditing = editingCatalogItemId === item.id;
                          return (
                            <tr key={item.id || idx} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                                {idx + 1}
                              </td>

                              <td className="py-3 px-4">
                                {isEditing ? (
                                  <div className="space-y-1.5 max-w-md">
                                    <input
                                      type="text"
                                      value={catalogItemForm.name}
                                      onChange={(e) => setCatalogItemForm({ ...catalogItemForm, name: e.target.value })}
                                      className="w-full bg-white border border-emerald-400 rounded-lg px-2.5 py-1 font-bold text-slate-900 text-xs"
                                    />
                                    <input
                                      type="text"
                                      placeholder="Description..."
                                      value={catalogItemForm.description || ''}
                                      onChange={(e) => setCatalogItemForm({ ...catalogItemForm, description: e.target.value })}
                                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-600 text-[11px]"
                                    />
                                  </div>
                                ) : (
                                  <div>
                                    <div className="font-extrabold text-slate-900">{item.name}</div>
                                    {item.description && (
                                      <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{item.description}</div>
                                    )}
                                  </div>
                                )}
                              </td>

                              <td className="py-3 px-4 whitespace-nowrap">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={catalogItemForm.category || ''}
                                    onChange={(e) => setCatalogItemForm({ ...catalogItemForm, category: e.target.value })}
                                    className="bg-white border border-emerald-400 rounded-lg px-2 py-1 text-xs w-28"
                                  />
                                ) : (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                                    {item.category || 'General'}
                                  </span>
                                )}
                              </td>

                              <td className="py-3 px-4 whitespace-nowrap">
                                {isEditing ? (
                                  <div className="flex items-center gap-1">
                                    <span className="text-slate-400 text-xs">KSh</span>
                                    <input
                                      type="number"
                                      min={0}
                                      value={catalogItemForm.unitPrice}
                                      onChange={(e) => setCatalogItemForm({ ...catalogItemForm, unitPrice: Number(e.target.value) })}
                                      className="bg-white border border-emerald-400 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 w-24"
                                    />
                                  </div>
                                ) : (
                                  <span className="font-black text-slate-900">
                                    KSh {item.unitPrice.toLocaleString()}
                                  </span>
                                )}
                              </td>

                              <td className="py-3 px-4 whitespace-nowrap">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={catalogItemForm.unit || 'pcs'}
                                    onChange={(e) => setCatalogItemForm({ ...catalogItemForm, unit: e.target.value })}
                                    className="bg-white border border-emerald-400 rounded-lg px-2 py-1 text-xs w-16"
                                  />
                                ) : (
                                  <span className="text-slate-600">{item.unit || 'pcs'}</span>
                                )}
                              </td>

                              <td className="py-3 px-4 text-right whitespace-nowrap">
                                {isEditing ? (
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleSaveCatalogItem(item.id)}
                                      className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                                      title="Save Changes"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingCatalogItemId(null)}
                                      className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors cursor-pointer"
                                      title="Cancel"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingCatalogItemId(item.id);
                                        setCatalogItemForm({ ...item });
                                      }}
                                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer"
                                      title="Edit Item in Excel"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (window.confirm(`Delete item "${item.name}" from Excel catalog?`)) {
                                          deleteWoodyExcelCatalogItem(item.id);
                                          showToast('Item Deleted', `Removed "${item.name}" from Excel catalog.`);
                                        }
                                      }}
                                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 transition-colors cursor-pointer"
                                      title="Delete Item"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CLIENTS DIRECTORY SHEET */}
          {activeTab === 'clients' && (
            <div className="space-y-4">
              {/* Controls bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search Excel clients by name, phone, email, or company..."
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsAddingClient(!isAddingClient)}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-black px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAddingClient ? 'Cancel' : 'Add Client to Excel'}</span>
                  </button>
                </div>
              </div>

              {/* Add New Client Form */}
              {isAddingClient && (
                <form onSubmit={handleAddNewClient} className="bg-blue-50/80 border-2 border-blue-400 rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-blue-700" />
                      <span>Add New Client / Corporate Contact to Excel Sheet</span>
                    </h4>
                    <span className="text-[10px] text-blue-700 font-bold">
                      Saved directly into persistent Excel dataset
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-700 mb-1">Customer / Contact Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Grace Wambui"
                        value={newClient.name}
                        onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-700 mb-1">Kenyan Mobile / WhatsApp *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 0722123456"
                        value={newClient.phone}
                        onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-700 mb-1">Company / Organization</label>
                      <input
                        type="text"
                        placeholder="e.g. Apex Horizon Ltd"
                        value={newClient.companyName}
                        onChange={(e) => setNewClient({ ...newClient, companyName: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        placeholder="e.g. grace@apex.co.ke"
                        value={newClient.email}
                        onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-700 mb-1">Delivery / Office Location</label>
                      <input
                        type="text"
                        placeholder="e.g. Upper Hill, Nairobi"
                        value={newClient.deliveryLocation}
                        onChange={(e) => setNewClient({ ...newClient, deliveryLocation: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-700 mb-1">Billing / Postal Address</label>
                      <input
                        type="text"
                        placeholder="e.g. P.O. Box 4567-00100 Nairobi"
                        value={newClient.billingAddress}
                        onChange={(e) => setNewClient({ ...newClient, billingAddress: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-blue-200">
                    <button
                      type="button"
                      onClick={() => setIsAddingClient(false)}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Client to Excel</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Clients Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 text-[10px] font-extrabold uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">#</th>
                        <th className="py-3 px-4">Client Name</th>
                        <th className="py-3 px-4">Mobile / WhatsApp</th>
                        <th className="py-3 px-4">Company</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Location / Address</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredClients.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400">
                            No clients match your search in this Excel spreadsheet.
                          </td>
                        </tr>
                      ) : (
                        filteredClients.map((client, idx) => {
                          const clientKey = `${client.name}_${client.phone}`;
                          const isEditing = editingClientKey === clientKey;
                          return (
                            <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                                {idx + 1}
                              </td>

                              <td className="py-3 px-4 whitespace-nowrap">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={clientForm.name}
                                    onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                                    className="bg-white border border-blue-400 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 w-36"
                                  />
                                ) : (
                                  <span className="font-extrabold text-slate-900">{client.name}</span>
                                )}
                              </td>

                              <td className="py-3 px-4 whitespace-nowrap">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={clientForm.phone}
                                    onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                                    className="bg-white border border-blue-400 rounded-lg px-2 py-1 text-xs font-mono text-slate-900 w-32"
                                  />
                                ) : (
                                  <span className="font-mono text-blue-700 font-semibold">{client.phone}</span>
                                )}
                              </td>

                              <td className="py-3 px-4 whitespace-nowrap">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={clientForm.companyName || ''}
                                    onChange={(e) => setClientForm({ ...clientForm, companyName: e.target.value })}
                                    className="bg-white border border-blue-400 rounded-lg px-2 py-1 text-xs w-32"
                                  />
                                ) : (
                                  <span className="text-slate-700 font-medium">{client.companyName || '—'}</span>
                                )}
                              </td>

                              <td className="py-3 px-4 whitespace-nowrap">
                                {isEditing ? (
                                  <input
                                    type="email"
                                    value={clientForm.email || ''}
                                    onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                                    className="bg-white border border-blue-400 rounded-lg px-2 py-1 text-xs w-36"
                                  />
                                ) : (
                                  <span className="text-slate-500">{client.email || '—'}</span>
                                )}
                              </td>

                              <td className="py-3 px-4">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={clientForm.deliveryLocation || clientForm.billingAddress || ''}
                                    onChange={(e) => setClientForm({ 
                                      ...clientForm, 
                                      deliveryLocation: e.target.value,
                                      billingAddress: e.target.value 
                                    })}
                                    className="bg-white border border-blue-400 rounded-lg px-2 py-1 text-xs w-44"
                                  />
                                ) : (
                                  <span className="text-slate-600 text-[11px]">
                                    {client.deliveryLocation || client.billingAddress || 'Nairobi, Kenya'}
                                  </span>
                                )}
                              </td>

                              <td className="py-3 px-4 text-right whitespace-nowrap">
                                {isEditing ? (
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleSaveClient(clientKey)}
                                      className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
                                      title="Save Client"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingClientKey(null)}
                                      className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors cursor-pointer"
                                      title="Cancel"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingClientKey(clientKey);
                                        setClientForm({ ...client });
                                      }}
                                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 transition-colors cursor-pointer"
                                      title="Edit Client"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (window.confirm(`Delete client "${client.name}" from Excel records?`)) {
                                          deleteWoodyExcelClient(clientKey);
                                          showToast('Client Deleted', `Removed "${client.name}" from Excel directory.`);
                                        }
                                      }}
                                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 transition-colors cursor-pointer"
                                      title="Delete Client"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: QUOTATIONS SHEET */}
          {activeTab === 'quotes' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search quotations in Excel sheet..."
                    value={quoteSearch}
                    onChange={(e) => setQuoteSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                  />
                </div>

                <div className="text-xs font-bold text-slate-500">
                  Showing {filteredQuotes.length} of {woodyExcelDataset.quotes.length} quotations in Excel
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 text-[10px] font-extrabold uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Quote #</th>
                        <th className="py-3 px-4">Customer & Company</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Line Items</th>
                        <th className="py-3 px-4">Grand Total</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredQuotes.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400">
                            No quotes found matching your query.
                          </td>
                        </tr>
                      ) : (
                        filteredQuotes.map((q) => (
                          <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-blue-700">
                              {q.quoteNumber}
                            </td>

                            <td className="py-3 px-4">
                              <div className="font-extrabold text-slate-900">{q.customerName}</div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-2">
                                <span>{q.customerPhone}</span>
                                {q.companyName && <span>• {q.companyName}</span>}
                              </div>
                            </td>

                            <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                              {q.quoteDate}
                            </td>

                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className="font-bold text-slate-700">{q.items.length} items</span>
                            </td>

                            <td className="py-3 px-4 whitespace-nowrap font-black text-slate-900">
                              KSh {q.grandTotal.toLocaleString()}
                            </td>

                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                q.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                                q.status === 'Invoiced' ? 'bg-indigo-100 text-indigo-800' :
                                q.status === 'Sent' ? 'bg-blue-100 text-blue-800' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {q.status}
                              </span>
                            </td>

                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                {onEditQuote && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onClose();
                                      onEditQuote(q.id);
                                    }}
                                    className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                                    title="Open and edit this quote in Woody-Quote Studio"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    <span>Edit Quote</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`Delete quotation ${q.quoteNumber} from this Excel dataset?`)) {
                                      deleteZohoQuotation(q.id);
                                      showToast('Quote Deleted', `Removed ${q.quoteNumber} from Excel dataset.`);
                                    }
                                  }}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 transition-colors cursor-pointer"
                                  title="Delete Quote"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FILE SETTINGS & EXPORT */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              {/* File Info Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Spreadsheet Metadata & File Name</span>
                </h4>

                <form onSubmit={handleSaveMeta} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Excel Workbook File Name:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={customFileName}
                        onChange={(e) => setCustomFileName(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 font-mono"
                      />
                      <button
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Update Name</span>
                      </button>
                    </div>
                  </div>
                </form>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-center">
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Quotations</div>
                    <div className="text-lg font-black text-slate-900 mt-0.5">{woodyExcelDataset.quotes.length}</div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Catalog Items</div>
                    <div className="text-lg font-black text-emerald-600 mt-0.5">{woodyExcelDataset.itemsCatalog.length}</div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Clients Found</div>
                    <div className="text-lg font-black text-blue-600 mt-0.5">{woodyExcelDataset.clientsCatalog.length}</div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Detected Sheets</div>
                    <div className="text-xs font-bold text-slate-700 mt-1 truncate">
                      {woodyExcelDataset.detectedSheets?.join(', ') || 'Sheet1'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cloud Persistence Notice */}
              <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-emerald-950">
                    Permanent Cloud Firestore Storage Enabled
                  </h5>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    This uploaded Excel dataset is safely synced to your Cloud Firestore database (<code className="font-mono text-[10px] bg-emerald-100 px-1 py-0.5 rounded">woodyQuoteData/activeExcelDataset</code>). Any quotes you add, prices you tweak, or clients you create stay permanently available across all browser sessions and devices until you choose to replace it.
                  </p>
                </div>
              </div>

              {/* Download & Export Section */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Download className="w-4 h-4 text-blue-600" />
                  <span>Download & Export Actions</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      exportWoodyDatasetToExcel(woodyExcelDataset);
                      showToast('Excel Exported', `Downloaded "${woodyExcelDataset.fileName}"`);
                    }}
                    className="p-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center gap-3 text-left shadow-md shadow-emerald-600/20 cursor-pointer transition-all hover:scale-[1.02]"
                  >
                    <Download className="w-6 h-6 shrink-0" />
                    <div>
                      <div className="text-xs font-extrabold">Download Updated .xlsx File</div>
                      <div className="text-[10px] text-emerald-100/90 mt-0.5">
                        Export complete workbook with all your edited quotes, prices, & clients
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      downloadWoodyQuoteExcelTemplate(zohoSettings);
                      showToast('Template Saved', 'Official Woody-Quote Excel template downloaded.');
                    }}
                    className="p-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-3 text-left border border-slate-200 cursor-pointer transition-all"
                  >
                    <FileSpreadsheet className="w-6 h-6 text-slate-600 shrink-0" />
                    <div>
                      <div className="text-xs font-extrabold">Download Sample Blank Template</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Clean spreadsheet with Woodynat headers & column guide
                      </div>
                    </div>
                  </button>
                </div>

                {/* Reset / Reload Options */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-500">
                    Want to revert to Woodynat's default catalog items and commercial pricing?
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Reset this Excel dataset back to Woodynat official master catalog template?')) {
                        loadInitialWoodynatExcelDataset();
                        showToast('Template Reset', 'Loaded Woodynat master catalog dataset.');
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                    <span>Reload Master Template</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ========================================================================= */}
        {/* Modal Footer */}
        {/* ========================================================================= */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>All edits are automatically saved to your persistent cloud Excel database.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
            >
              Done & Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
