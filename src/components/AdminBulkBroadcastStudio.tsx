import React, { useState, useMemo } from 'react';
import { 
  Send, 
  Mail, 
  MessageSquare, 
  Users, 
  FileText, 
  History, 
  Plus, 
  Download, 
  Upload, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  Smartphone, 
  ExternalLink, 
  Sparkles, 
  Layers, 
  RefreshCw, 
  Search, 
  Filter, 
  Check, 
  X, 
  Info, 
  ArrowRight,
  ShieldCheck,
  Building2,
  Tag,
  Copy
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CustomerContact, BulkCampaign, BulkSmsTemplate, BulkEmailTemplate } from '../types';

export const AdminBulkBroadcastStudio: React.FC = () => {
  const {
    customerContacts,
    smsTemplates,
    emailTemplates,
    bulkCampaigns,
    orders,
    inquiries,
    whatsappThreads,
    wpSettings,
    addCustomerContact,
    updateCustomerContact,
    deleteCustomerContact,
    importCustomerContacts,
    addSmsTemplate,
    deleteSmsTemplate,
    addEmailTemplate,
    deleteEmailTemplate,
    sendBulkSmsCampaign,
    sendBulkEmailCampaign,
    deleteCampaign,
    showToast
  } = useApp();

  // Navigation sub-tabs within Bulk Comms
  const [subTab, setSubTab] = useState<'sms' | 'email' | 'contacts' | 'history'>('sms');

  // ==========================================
  // --- 1. BULK SMS BROADCAST STATE ---
  // ==========================================
  const [smsSenderId, setSmsSenderId] = useState<'WOODYNAT' | 'WOODYNAT_HQ' | 'PROMOTIONS'>('WOODYNAT');
  const [adminSmsEmail, setAdminSmsEmail] = useState<string>(wpSettings.companyEmail || 'woodynatdesigners12@gmail.com');
  const [smsCampaignTitle, setSmsCampaignTitle] = useState('Flash Sale: Custom T-Shirts & Hoodies 15% OFF');
  const [smsAudienceTarget, setSmsAudienceTarget] = useState<BulkCampaign['targetAudience']>('all');
  const [smsCustomSelectedIds, setSmsCustomSelectedIds] = useState<string[]>([]);
  const [smsBody, setSmsBody] = useState(smsTemplates[0]?.body || '');
  const [smsSearchContact, setSmsSearchContact] = useState('');
  const [isSendingSms, setIsSendingSms] = useState(false);
  const [smsSendProgress, setSmsSendProgress] = useState(0);
  const [smsSendModalOpen, setSmsSendModalOpen] = useState(false);
  const [testSmsPhone, setTestSmsPhone] = useState('0797939199');

  // ==========================================
  // --- 2. BULK EMAIL MARKETING STATE ---
  // ==========================================
  const [emailCampaignTitle, setEmailCampaignTitle] = useState('2026 Commercial Printing & Branding Catalogue Release');
  const [emailAudienceTarget, setEmailAudienceTarget] = useState<BulkCampaign['targetAudience']>('all');
  const [emailCustomSelectedIds, setEmailCustomSelectedIds] = useState<string[]>([]);
  const [selectedEmailTemplateId, setSelectedEmailTemplateId] = useState<string>(emailTemplates[0]?.id || 'email-catalog-2026');
  const [emailSubject, setEmailSubject] = useState(emailTemplates[0]?.subject || '');
  const [emailPreheader, setEmailPreheader] = useState(emailTemplates[0]?.preheader || '');
  const [emailPreviewMode, setEmailPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSendProgress, setEmailSendProgress] = useState(0);
  const [emailSendModalOpen, setEmailSendModalOpen] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('woodynatdesigners12@gmail.com');

  // Custom Email Editor state (when editing current template)
  const currentEmailTemplate = useMemo(() => {
    return emailTemplates.find(t => t.id === selectedEmailTemplateId) || emailTemplates[0];
  }, [emailTemplates, selectedEmailTemplateId]);

  // ==========================================
  // --- 3. CONTACT MANAGEMENT STATE ---
  // ==========================================
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [contactFilterTag, setContactFilterTag] = useState<string>('All');
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importTextData, setImportTextData] = useState('');
  const [editingContact, setEditingContact] = useState<CustomerContact | null>(null);

  // New Contact Form state
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactCompany, setNewContactCompany] = useState('');
  const [newContactTag, setNewContactTag] = useState('Corporate Client');

  // Campaign log view modal
  const [selectedCampaignForLogs, setSelectedCampaignForLogs] = useState<BulkCampaign | null>(null);

  // ==========================================
  // --- AUDIENCE FILTERING LOGIC ---
  // ==========================================
  const allAudienceContacts = useMemo(() => {
    return customerContacts;
  }, [customerContacts]);

  // Filter contacts by selected audience target
  const getFilteredRecipients = (target: BulkCampaign['targetAudience'], customIds: string[], channel: 'sms' | 'email') => {
    let list = allAudienceContacts;
    if (target === 'orders') {
      list = list.filter(c => c.source === 'order' || (c.totalOrdersCount && c.totalOrdersCount > 0));
    } else if (target === 'corporate') {
      list = list.filter(c => c.companyName || c.tags.some(t => t.toLowerCase().includes('corporate') || t.toLowerCase().includes('school') || t.toLowerCase().includes('industrial')));
    } else if (target === 'inquiries') {
      list = list.filter(c => c.source === 'inquiry' || c.tags.some(t => t.toLowerCase().includes('inquiry') || t.toLowerCase().includes('lead')));
    } else if (target === 'whatsapp') {
      list = list.filter(c => c.source === 'whatsapp' || c.tags.some(t => t.toLowerCase().includes('whatsapp')));
    } else if (target === 'custom') {
      list = list.filter(c => customIds.includes(c.id));
    }

    if (channel === 'sms') {
      return list.filter(c => Boolean(c.phone && c.phone.trim().length >= 8 && c.subscribedSms !== false));
    } else {
      return list.filter(c => Boolean(c.email && c.email.includes('@') && c.subscribedEmail !== false));
    }
  };

  const currentSmsRecipients = useMemo(() => {
    return getFilteredRecipients(smsAudienceTarget, smsCustomSelectedIds, 'sms');
  }, [smsAudienceTarget, smsCustomSelectedIds, allAudienceContacts]);

  const currentEmailRecipients = useMemo(() => {
    return getFilteredRecipients(emailAudienceTarget, emailCustomSelectedIds, 'email');
  }, [emailAudienceTarget, emailCustomSelectedIds, allAudienceContacts]);

  // Merge tag replacer for preview
  const formatSmsPreview = (rawBody: string, sampleContact?: CustomerContact) => {
    const contact = sampleContact || currentSmsRecipients[0] || {
      id: 'sample',
      name: 'Jane Wambui',
      phone: '0712345678',
      email: 'jane@apexlogistics.co.ke',
      companyName: 'Apex Logistics Kenya',
      tags: [],
      source: 'order',
      subscribedEmail: true,
      subscribedSms: true,
      createdAt: ''
    };

    return rawBody
      .replace(/{{customer_name}}/g, contact.name || 'Valued Customer')
      .replace(/{{company_name}}/g, contact.companyName || 'Your Organization')
      .replace(/{{paybill}}/g, wpSettings.paybillNumber || '247247')
      .replace(/{{account}}/g, wpSettings.paybillAccount || '0797939199')
      .replace(/{{phone}}/g, wpSettings.whatsappNumber || '0797939199')
      .replace(/{{shop_location}}/g, 'Temple Road Gatkim complex building fourth floor wing B Room 4B1')
      .replace(/{{catalogue_url}}/g, 'woodynatdesigners.co.ke/catalogue');
  };

  // SMS character length math
  const smsCharCount = smsBody.length;
  const smsSegmentCount = Math.max(1, Math.ceil(smsCharCount / 160));
  const estimatedSmsCost = (currentSmsRecipients.length * smsSegmentCount * 0.8).toFixed(2);

  // Sync auto-contacts from Orders and WhatsApp
  const handleAutoSyncFromOrders = () => {
    const importedList: Array<Omit<CustomerContact, 'id' | 'createdAt'>> = [];

    // From Orders
    orders.forEach(o => {
      if (o.customerPhone || o.customerEmail) {
        importedList.push({
          name: o.customerName || 'Order Customer',
          phone: o.customerPhone || '',
          email: o.customerEmail || '',
          companyName: '',
          tags: ['Order Customer', o.deliveryCity || 'Nairobi'],
          source: 'order',
          subscribedEmail: true,
          subscribedSms: true,
          totalOrdersCount: 1,
          lastActiveDate: o.createdAt
        });
      }
    });

    // From Inquiries
    inquiries.forEach(inq => {
      if (inq.customerPhone || inq.customerEmail) {
        importedList.push({
          name: inq.customerName || 'Inquiry Lead',
          phone: inq.customerPhone || '',
          email: inq.customerEmail || '',
          companyName: inq.companyName || '',
          tags: ['Inquiry Lead', inq.preferredCategory || 'Custom Print'],
          source: 'inquiry',
          subscribedEmail: true,
          subscribedSms: true,
          totalOrdersCount: 0,
          lastActiveDate: inq.createdAt
        });
      }
    });

    // From WhatsApp
    whatsappThreads.forEach(th => {
      if (th.customerPhone) {
        importedList.push({
          name: th.customerName || 'WhatsApp Contact',
          phone: th.customerPhone || '',
          email: '',
          companyName: th.companyName || '',
          tags: ['WhatsApp Contact', th.topic || 'Inquiry'],
          source: 'whatsapp',
          subscribedEmail: true,
          subscribedSms: true,
          totalOrdersCount: th.status === 'paid' ? 1 : 0,
          lastActiveDate: th.lastMessageTime
        });
      }
    });

    const count = importCustomerContacts(importedList);
    showToast('Audience Synced 🔄', `Synced contact records from orders, inquiries, and WhatsApp leads.`);
  };

  // Helper to insert merge tag at cursor or end
  const handleInsertSmsTag = (tag: string) => {
    setSmsBody(prev => prev + tag);
  };

  // Launch SMS Broadcast Simulation
  const handleExecuteSmsBroadcast = async () => {
    if (!smsBody.trim()) {
      showToast('Missing Body', 'Please enter your SMS message copy.', 'error');
      return;
    }
    if (currentSmsRecipients.length === 0) {
      showToast('No Recipients', 'Selected audience has 0 eligible SMS phone numbers.', 'error');
      return;
    }

    setIsSendingSms(true);
    setSmsSendProgress(10);
    setSmsSendModalOpen(true);

    // Progress animation
    const interval = setInterval(() => {
      setSmsSendProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 20;
      });
    }, 300);

    setTimeout(async () => {
      clearInterval(interval);
      setSmsSendProgress(100);

      const targetLabel = smsAudienceTarget === 'all' 
        ? `All Customers (${currentSmsRecipients.length})` 
        : smsAudienceTarget === 'orders' 
        ? `Past Order Buyers (${currentSmsRecipients.length})`
        : smsAudienceTarget === 'corporate'
        ? `Corporate & B2B Leads (${currentSmsRecipients.length})`
        : smsAudienceTarget === 'whatsapp'
        ? `WhatsApp Contacts (${currentSmsRecipients.length})`
        : `Custom Selection (${currentSmsRecipients.length})`;

      await sendBulkSmsCampaign({
        title: smsCampaignTitle || 'Bulk SMS Broadcast',
        targetAudience: smsAudienceTarget,
        audienceLabel: targetLabel,
        recipients: currentSmsRecipients,
        smsBody,
        senderId: smsSenderId,
        adminEmail: adminSmsEmail || 'woodynatdesigners12@gmail.com'
      });

      setIsSendingSms(false);
      setTimeout(() => {
        setSmsSendModalOpen(false);
        setSubTab('history');
      }, 1200);
    }, 1600);
  };

  // Launch Email Campaign Simulation
  const handleExecuteEmailCampaign = async () => {
    if (!emailSubject.trim()) {
      showToast('Missing Subject', 'Please specify an email subject line.', 'error');
      return;
    }
    if (currentEmailRecipients.length === 0) {
      showToast('No Recipients', 'Selected audience has 0 eligible email addresses.', 'error');
      return;
    }

    setIsSendingEmail(true);
    setEmailSendProgress(10);
    setEmailSendModalOpen(true);

    const interval = setInterval(() => {
      setEmailSendProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 25;
      });
    }, 350);

    setTimeout(async () => {
      clearInterval(interval);
      setEmailSendProgress(100);

      const targetLabel = emailAudienceTarget === 'all' 
        ? `All Email Subscribers (${currentEmailRecipients.length})` 
        : emailAudienceTarget === 'orders' 
        ? `Past Order Buyers (${currentEmailRecipients.length})`
        : emailAudienceTarget === 'corporate'
        ? `Corporate & B2B Clients (${currentEmailRecipients.length})`
        : `Custom Selection (${currentEmailRecipients.length})`;

      await sendBulkEmailCampaign({
        title: emailCampaignTitle || 'Bulk Email Newsletter',
        targetAudience: emailAudienceTarget,
        audienceLabel: targetLabel,
        recipients: currentEmailRecipients,
        subject: emailSubject,
        preheader: emailPreheader,
        template: currentEmailTemplate,
        adminEmail: adminSmsEmail || 'woodynatdesigners12@gmail.com'
      });

      setIsSendingEmail(false);
      setTimeout(() => {
        setEmailSendModalOpen(false);
        setSubTab('history');
      }, 1200);
    }, 1800);
  };

  // Test SMS Trigger
  const handleSendTestSms = () => {
    showToast('Test SMS Sent 📲', `Simulated test SMS dispatched to ${testSmsPhone} via sender ${smsSenderId}.`);
  };

  // Test Email Trigger
  const handleSendTestEmail = () => {
    showToast('Test Email Dispatched ✉️', `Sent responsive HTML email preview to ${testEmailAddress}.`);
  };

  // Export Contacts to CSV
  const handleExportContactsCsv = () => {
    const headers = 'Name,Phone,Email,Company,Source,Tags,Created At\n';
    const rows = customerContacts.map(c => 
      `"${c.name}","${c.phone}","${c.email}","${c.companyName || ''}","${c.source}","${c.tags.join('; ')}","${c.createdAt}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Woodynat_Customer_Contacts_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    showToast('Contacts Exported 📄', 'Downloaded customer contact CSV report.');
  };

  // CSV / Text Raw Importer
  const handleProcessImport = () => {
    if (!importTextData.trim()) {
      showToast('Empty Data', 'Please paste contact entries in Name, Phone, Email format.', 'error');
      return;
    }

    const lines = importTextData.split('\n');
    const parsedContacts: Array<Omit<CustomerContact, 'id' | 'createdAt'>> = [];

    lines.forEach(line => {
      const parts = line.split(/[,;\t]/).map(p => p.trim());
      if (parts.length >= 2) {
        const name = parts[0] || 'Imported Customer';
        const phone = parts[1] || '';
        const email = parts[2] || '';
        const company = parts[3] || '';

        if (phone || email) {
          parsedContacts.push({
            name,
            phone,
            email,
            companyName: company,
            tags: ['CSV Import', 'Campaign Lead'],
            source: 'csv_import',
            subscribedEmail: true,
            subscribedSms: true
          });
        }
      }
    });

    if (parsedContacts.length > 0) {
      importCustomerContacts(parsedContacts);
      setIsImportModalOpen(false);
      setImportTextData('');
    } else {
      showToast('Invalid Format', 'Could not parse contacts. Use format: Name, Phone, Email, Company', 'error');
    }
  };

  // Filtered contacts list in Contacts Directory tab
  const displayedContacts = useMemo(() => {
    return customerContacts.filter(c => {
      const matchSearch = contactSearchQuery === '' || 
        c.name.toLowerCase().includes(contactSearchQuery.toLowerCase()) ||
        c.phone.includes(contactSearchQuery) ||
        c.email.toLowerCase().includes(contactSearchQuery.toLowerCase()) ||
        (c.companyName && c.companyName.toLowerCase().includes(contactSearchQuery.toLowerCase()));

      const matchTag = contactFilterTag === 'All' || 
        c.tags.includes(contactFilterTag) || 
        c.source === contactFilterTag.toLowerCase();

      return matchSearch && matchTag;
    });
  }, [customerContacts, contactSearchQuery, contactFilterTag]);

  return (
    <div className="space-y-6">
      {/* Studio Header & Quick Metrics Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-indigo-900/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              COMMUNICATION & BULK DISPATCH ENGINE
            </div>
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              Bulk SMS & Email Broadcast Studio
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Reach all Woodynat Designers customers in Nairobi & countrywide via official Kenyan Telco SMS (Sender: <span className="font-bold text-amber-400">WOODYNAT</span>) and responsive branded HTML newsletters.
            </p>
          </div>

          {/* Quick Hub Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/5 p-3 rounded-xl border border-white/10 backdrop-blur-sm">
            <div className="text-center px-3 py-1.5">
              <div className="text-xs font-medium text-slate-400">Total Audience</div>
              <div className="text-xl font-black text-white">{customerContacts.length}</div>
            </div>
            <div className="text-center px-3 py-1.5 border-l border-white/10">
              <div className="text-xs font-medium text-slate-400">SMS Reach</div>
              <div className="text-xl font-black text-emerald-400">
                {customerContacts.filter(c => c.phone).length}
              </div>
            </div>
            <div className="text-center px-3 py-1.5 border-l border-white/10">
              <div className="text-xs font-medium text-slate-400">Email Reach</div>
              <div className="text-xl font-black text-indigo-400">
                {customerContacts.filter(c => c.email).length}
              </div>
            </div>
            <div className="text-center px-3 py-1.5 border-l border-white/10">
              <div className="text-xs font-medium text-slate-400">Campaigns Sent</div>
              <div className="text-xl font-black text-amber-400">{bulkCampaigns.length}</div>
            </div>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-white/10 overflow-x-auto pb-1">
          <button
            onClick={() => setSubTab('sms')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              subTab === 'sms'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25'
                : 'bg-white/10 text-white hover:bg-white/15'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Bulk SMS Dispatcher
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-slate-900/30">
              {currentSmsRecipients.length} Ready
            </span>
          </button>

          <button
            onClick={() => setSubTab('email')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              subTab === 'email'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-white/10 text-white hover:bg-white/15'
            }`}
          >
            <Mail className="w-4 h-4" />
            Bulk Email Marketing
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-white/20">
              {currentEmailRecipients.length} Ready
            </span>
          </button>

          <button
            onClick={() => setSubTab('contacts')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              subTab === 'contacts'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-white/10 text-white hover:bg-white/15'
            }`}
          >
            <Users className="w-4 h-4" />
            Customer Directory & Segments
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-white/20">
              {customerContacts.length}
            </span>
          </button>

          <button
            onClick={() => setSubTab('history')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              subTab === 'history'
                ? 'bg-slate-700 text-white shadow-lg shadow-slate-700/30'
                : 'bg-white/10 text-white hover:bg-white/15'
            }`}
          >
            <History className="w-4 h-4" />
            Broadcast History & Delivery Logs
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-white/20">
              {bulkCampaigns.length}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* --- TAB 1: BULK SMS BROADCAST STUDIO --- */}
      {/* ========================================================================= */}
      {subTab === 'sms' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Composer & Audience Selection (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-amber-500" />
                    SMS Broadcast Configuration
                  </h2>
                  <p className="text-xs text-slate-500">Configure sender ID, audience segment, and message body.</p>
                </div>

                {/* Sender ID Selection */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Sender ID:</span>
                  <select
                    value={smsSenderId}
                    onChange={(e) => setSmsSenderId(e.target.value as any)}
                    className="text-xs font-black text-slate-900 bg-amber-50 border border-amber-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="WOODYNAT">WOODYNAT (Official)</option>
                    <option value="WOODYNAT_HQ">WOODYNAT_HQ</option>
                    <option value="PROMOTIONS">PROMOTIONS</option>
                  </select>
                </div>
              </div>

              {/* Campaign Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Internal Campaign Reference Name
                </label>
                <input
                  type="text"
                  value={smsCampaignTitle}
                  onChange={(e) => setSmsCampaignTitle(e.target.value)}
                  placeholder="e.g. August Flash Sale 15% OFF Hoodies"
                  className="w-full text-sm font-medium border border-slate-200 rounded-xl px-3.5 py-2.5 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                />
              </div>

              {/* Admin Dispatch & Carrier Authorization Email */}
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-amber-600" />
                    Admin Email for Sending Bulk SMS & Gateway Authorization:
                  </label>
                  <span className="text-[10px] font-extrabold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-md font-mono">
                    Official Admin
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={adminSmsEmail}
                    onChange={(e) => setAdminSmsEmail(e.target.value)}
                    placeholder="woodynatdesigners12@gmail.com"
                    className="w-full text-xs font-mono font-bold text-slate-800 bg-white border border-amber-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setAdminSmsEmail('woodynatdesigners12@gmail.com');
                      showToast('Admin Email Set 📧', 'Reset to woodynatdesigners12@gmail.com');
                    }}
                    className="px-3 py-2 bg-amber-200/80 hover:bg-amber-300 text-amber-950 text-xs font-bold rounded-lg transition-colors shrink-0 cursor-pointer"
                    title="Set to official admin email"
                  >
                    Reset
                  </button>
                </div>
                <p className="text-[11px] text-amber-800/90 leading-tight">
                  Telco gateway tokens, broadcast dispatch reports, and carrier balance statements are authorized and sent to <span className="font-bold text-slate-900 font-mono">{adminSmsEmail}</span>.
                </p>
              </div>

              {/* Audience Target Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Recipient Audience Segment
                  </label>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {currentSmsRecipients.length} Recipients Selected
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'all', label: 'All Contacts', desc: `${customerContacts.filter(c => c.phone).length} Numbers` },
                    { id: 'orders', label: 'Order Buyers', desc: 'Active Clients' },
                    { id: 'corporate', label: 'Corporate / B2B', desc: 'Firms & Schools' },
                    { id: 'inquiries', label: 'Quote Inquiries', desc: 'Hot Leads' },
                    { id: 'whatsapp', label: 'WhatsApp Leads', desc: 'Chat Contacts' },
                    { id: 'custom', label: 'Custom Picker', desc: `${smsCustomSelectedIds.length} Picked` }
                  ].map((aud) => (
                    <button
                      key={aud.id}
                      type="button"
                      onClick={() => setSmsAudienceTarget(aud.id as any)}
                      className={`p-3 text-left rounded-xl border transition-all ${
                        smsAudienceTarget === aud.id
                          ? 'border-amber-500 bg-amber-50/70 text-slate-900 shadow-sm'
                          : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100/60'
                      }`}
                    >
                      <div className="text-xs font-bold flex items-center justify-between">
                        {aud.label}
                        {smsAudienceTarget === aud.id && <Check className="w-3.5 h-3.5 text-amber-600" />}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{aud.desc}</div>
                    </button>
                  ))}
                </div>

                {/* Custom Selection Panel */}
                {smsAudienceTarget === 'custom' && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700">Select Individual Phone Numbers:</span>
                      <button
                        onClick={() => {
                          if (smsCustomSelectedIds.length === customerContacts.length) {
                            setSmsCustomSelectedIds([]);
                          } else {
                            setSmsCustomSelectedIds(customerContacts.map(c => c.id));
                          }
                        }}
                        className="text-amber-600 font-bold hover:underline"
                      >
                        {smsCustomSelectedIds.length === customerContacts.length ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>

                    <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                      {customerContacts.map((c) => (
                        <label key={c.id} className="flex items-center justify-between p-1.5 hover:bg-white rounded-lg text-xs cursor-pointer">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={smsCustomSelectedIds.includes(c.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSmsCustomSelectedIds([...smsCustomSelectedIds, c.id]);
                                } else {
                                  setSmsCustomSelectedIds(smsCustomSelectedIds.filter(id => id !== c.id));
                                }
                              }}
                              className="rounded text-amber-600 focus:ring-amber-500"
                            />
                            <span className="font-bold text-slate-800">{c.name}</span>
                            <span className="text-slate-500 font-mono">({c.phone})</span>
                          </div>
                          {c.companyName && <span className="text-[10px] text-slate-400 truncate max-w-[120px]">{c.companyName}</span>}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Pre-built SMS Template Pickers */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Load Pre-Built High-Converting SMS Template
                </label>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {smsTemplates.map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => setSmsBody(tpl.body)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-700 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border border-slate-200"
                    >
                      {tpl.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Smart Variable Placeholders */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Click to Insert Dynamic Customer Placeholders
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { tag: '{{customer_name}}', label: 'Customer Name' },
                    { tag: '{{company_name}}', label: 'Company' },
                    { tag: '{{paybill}}', label: 'Paybill (247247)' },
                    { tag: '{{account}}', label: 'Account (0797939199)' },
                    { tag: '{{phone}}', label: 'WhatsApp (0797939199)' },
                    { tag: '{{shop_location}}', label: 'CBD Location' },
                    { tag: '{{catalogue_url}}', label: 'Catalogue Link' }
                  ].map((item) => (
                    <button
                      key={item.tag}
                      type="button"
                      onClick={() => handleInsertSmsTag(item.tag)}
                      className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-md text-xs font-semibold hover:bg-amber-100 transition-colors"
                    >
                      + {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* SMS Message Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    SMS Message Body Copy
                  </label>
                  <div className="text-xs text-slate-500 font-mono">
                    <span className={smsCharCount > 160 ? 'text-amber-600 font-bold' : 'text-slate-700'}>
                      {smsCharCount}
                    </span> / 160 characters • <span className="font-bold text-slate-800">{smsSegmentCount} Part(s)</span>
                  </div>
                </div>

                <textarea
                  rows={5}
                  value={smsBody}
                  onChange={(e) => setSmsBody(e.target.value)}
                  placeholder="Enter your bulk SMS message text here..."
                  className="w-full p-3.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-sans outline-none leading-relaxed"
                />

                <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Kenya Telco Gateway Encoded (Safaricom & Airtel routes active)</span>
                  </div>
                  <div className="font-bold text-slate-700">
                    Est. Cost: <span className="text-emerald-600 font-black">KSh {estimatedSmsCost}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    value={testSmsPhone}
                    onChange={(e) => setTestSmsPhone(e.target.value)}
                    placeholder="0797939199"
                    className="text-xs border border-slate-300 rounded-lg px-2.5 py-2 w-32 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleSendTestSms}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors whitespace-nowrap"
                  >
                    Send Test SMS
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleExecuteSmsBroadcast}
                  disabled={isSendingSms || currentSmsRecipients.length === 0}
                  className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  Broadcast to {currentSmsRecipients.length} Numbers Now
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Smartphone Simulator (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 rounded-3xl p-5 text-white shadow-2xl border border-slate-800">
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Live Mobile Receiver Preview
                  </span>
                </div>
                <span className="text-[11px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono">
                  Sender: {smsSenderId}
                </span>
              </div>

              {/* Smartphone Frame */}
              <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 relative shadow-inner max-w-sm mx-auto">
                {/* Status Bar */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pb-3 border-b border-slate-800">
                  <span>9:41 AM</span>
                  <div className="flex items-center gap-1.5">
                    <span>Safaricom 4G</span>
                    <div className="w-3.5 h-2 border border-slate-400 rounded-sm p-0.5">
                      <div className="w-full h-full bg-emerald-400 rounded-2xs" />
                    </div>
                  </div>
                </div>

                {/* Message Header */}
                <div className="py-3 text-center border-b border-slate-800">
                  <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center mx-auto mb-1">
                    W
                  </div>
                  <div className="text-xs font-black text-white">{smsSenderId}</div>
                  <div className="text-[10px] text-slate-400">Official Business Alphanumeric</div>
                </div>

                {/* Message Bubble Container */}
                <div className="py-6 min-h-[220px] flex flex-col justify-end">
                  <div className="bg-slate-800 text-slate-100 rounded-2xl rounded-tl-sm p-3.5 text-xs shadow-md border border-slate-700 space-y-2">
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {formatSmsPreview(smsBody)}
                    </p>
                    <div className="text-[9px] text-slate-400 text-right">
                      Just now • Received via Safaricom
                    </div>
                  </div>
                </div>

                {/* Direct Action Link in Simulator */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Sample: Jane Wambui (+254...)</span>
                  <a
                    href={`https://wa.me/254797939199?text=${encodeURIComponent(formatSmsPreview(smsBody))}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-400 font-bold hover:underline flex items-center gap-1"
                  >
                    Open in WA <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="mt-4 p-3 bg-slate-800/60 rounded-xl text-xs text-slate-300 space-y-1">
                <div className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" /> High Deliverability Protocol
                </div>
                <p className="text-[11px] text-slate-400">
                  Messages are sent via direct Safaricom & Airtel SMS gateways. Dynamic tags will be replaced individually for each customer on your list.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* --- TAB 2: BULK EMAIL MARKETING STUDIO --- */}
      {/* ========================================================================= */}
      {subTab === 'email' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Email Composer & Templates (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-5">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-indigo-600" />
                  Email Newsletter & Campaign Setup
                </h2>
                <p className="text-xs text-slate-500">Sender: Woodynat Designers &lt;woodynatdesigners12@gmail.com&gt;</p>
              </div>

              {/* Template Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Select Responsive Branded Template
                </label>
                <div className="space-y-2">
                  {emailTemplates.map((tpl) => (
                    <div
                      key={tpl.id}
                      onClick={() => {
                        setSelectedEmailTemplateId(tpl.id);
                        setEmailSubject(tpl.subject);
                        setEmailPreheader(tpl.preheader);
                        setEmailCampaignTitle(tpl.title);
                      }}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedEmailTemplateId === tpl.id
                          ? 'border-indigo-600 bg-indigo-50/70 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                        <span>{tpl.title}</span>
                        {selectedEmailTemplateId === tpl.id && <Check className="w-4 h-4 text-indigo-600" />}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{tpl.subject}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Audience Target */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Recipient Target Group
                  </label>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {currentEmailRecipients.length} Email Inboxes
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'all', label: 'All Subscribers', desc: `${customerContacts.filter(c => c.email).length} Emails` },
                    { id: 'corporate', label: 'Corporate & B2B', desc: 'Schools & Firms' },
                    { id: 'orders', label: 'Past Buyers', desc: 'Verified Clients' },
                    { id: 'custom', label: 'Custom List', desc: `${emailCustomSelectedIds.length} Picked` }
                  ].map((aud) => (
                    <button
                      key={aud.id}
                      type="button"
                      onClick={() => setEmailAudienceTarget(aud.id as any)}
                      className={`p-2.5 text-left rounded-xl border transition-all ${
                        emailAudienceTarget === aud.id
                          ? 'border-indigo-600 bg-indigo-50 text-slate-900 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs flex items-center justify-between">
                        {aud.label}
                        {emailAudienceTarget === aud.id && <Check className="w-3 h-3 text-indigo-600" />}
                      </div>
                      <div className="text-[10px] text-slate-500">{aud.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Line & Preheader */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Subject Line
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Subject line..."
                    className="w-full text-sm font-medium border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Inbox Preheader Snippet
                  </label>
                  <input
                    type="text"
                    value={emailPreheader}
                    onChange={(e) => setEmailPreheader(e.target.value)}
                    placeholder="Short preview text visible in Gmail / Outlook..."
                    className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Dispatch Controls */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={testEmailAddress}
                    onChange={(e) => setTestEmailAddress(e.target.value)}
                    placeholder="admin@email.com"
                    className="text-xs border border-slate-300 rounded-lg px-2.5 py-2 flex-1 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleSendTestEmail}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors whitespace-nowrap"
                  >
                    Send Test
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleExecuteEmailCampaign}
                  disabled={isSendingEmail || currentEmailRecipients.length === 0}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  Dispatch Campaign to {currentEmailRecipients.length} Inboxes
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Rich HTML Email Preview (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-100 rounded-2xl p-4 border border-slate-300 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Preview Layout:</span>
                  <div className="inline-flex rounded-lg bg-white border border-slate-200 p-0.5 text-xs">
                    <button
                      onClick={() => setEmailPreviewMode('desktop')}
                      className={`px-3 py-1 rounded-md font-bold transition-colors ${
                        emailPreviewMode === 'desktop' ? 'bg-indigo-600 text-white' : 'text-slate-600'
                      }`}
                    >
                      Desktop View
                    </button>
                    <button
                      onClick={() => setEmailPreviewMode('mobile')}
                      className={`px-3 py-1 rounded-md font-bold transition-colors ${
                        emailPreviewMode === 'mobile' ? 'bg-indigo-600 text-white' : 'text-slate-600'
                      }`}
                    >
                      Mobile View
                    </button>
                  </div>
                </div>

                <span className="text-xs text-slate-500 font-mono">
                  Sample: {customerContacts[0]?.name || 'Jane Wambui'}
                </span>
              </div>

              {/* Rendered Email Container */}
              <div className={`mx-auto bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden transition-all ${
                emailPreviewMode === 'mobile' ? 'max-w-sm' : 'max-w-2xl'
              }`}>
                {/* Email Client Top Bar */}
                <div className="bg-slate-900 text-slate-300 px-5 py-3 text-xs border-b border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Woodynat Designers Limited</span>
                    <span className="text-[10px] text-slate-400 font-mono">woodynatdesigners12@gmail.com</span>
                  </div>
                  <div className="text-slate-200 font-medium truncate">
                    Subject: {emailSubject.replace(/{{customer_name}}/g, 'Jane Wambui').replace(/{{company_name}}/g, 'Apex Logistics')}
                  </div>
                </div>

                {/* Email Content Body */}
                <div className="p-6 space-y-6">
                  {/* Brand Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-black flex items-center justify-center text-sm shadow">
                        W
                      </div>
                      <div>
                        <div className="text-sm font-black tracking-tight text-slate-900">
                          {wpSettings.siteTitle || 'Woodynat Designers Limited'}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {wpSettings.tagline || 'Custom Printing, Embroidery & Branding Services'}
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-[11px] text-indigo-600 font-bold">
                      WhatsApp: {wpSettings.whatsappNumber || '0797939199'}
                    </div>
                  </div>

                  {/* Hero Section */}
                  {currentEmailTemplate.heroImage && (
                    <div className="rounded-xl overflow-hidden relative shadow-sm border border-slate-100 max-h-56">
                      <img
                        src={currentEmailTemplate.heroImage}
                        alt="Hero Banner"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {currentEmailTemplate.badgeText && (
                        <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-full shadow">
                          {currentEmailTemplate.badgeText}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Headline & Body */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-black text-slate-900 leading-tight">
                      {currentEmailTemplate.headline}
                    </h3>

                    {currentEmailTemplate.bodyParagraphs.map((p, idx) => (
                      <p key={idx} className="text-xs text-slate-600 leading-relaxed">
                        {p.replace(/{{customer_name}}/g, 'Jane Wambui').replace(/{{company_name}}/g, 'Apex Logistics')}
                      </p>
                    ))}
                  </div>

                  {/* Bullet Highlights */}
                  {currentEmailTemplate.bulletPoints && (
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
                      <div className="text-xs font-black text-slate-800 uppercase tracking-wide">
                        Key Features & Production Rates:
                      </div>
                      <div className="space-y-1.5">
                        {currentEmailTemplate.bulletPoints.map((bp, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{bp}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Call to Actions */}
                  <div className="space-y-2 text-center pt-2">
                    <a
                      href={currentEmailTemplate.ctaButtonUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md transition-colors"
                    >
                      {currentEmailTemplate.ctaButtonText} →
                    </a>

                    {currentEmailTemplate.secondaryCtaText && (
                      <div className="text-[11px] text-slate-500 pt-1">
                        Or reach us directly via{' '}
                        <a
                          href={currentEmailTemplate.secondaryCtaUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-emerald-600 hover:underline"
                        >
                          {currentEmailTemplate.secondaryCtaText}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="border-t border-slate-100 pt-4 text-[10px] text-slate-400 space-y-1 text-center">
                    <p>{currentEmailTemplate.footerNote}</p>
                    <p className="text-[9px] text-slate-400">
                      You received this email because you placed an order or requested a catalogue quote from Woodynat Designers Limited.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* --- TAB 3: CUSTOMER DIRECTORY & AUDIENCE SEGMENTS --- */}
      {/* ========================================================================= */}
      {subTab === 'contacts' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                Customer Contact Directory & Audience Lists
              </h2>
              <p className="text-xs text-slate-500">
                Manage all registered clients, past order buyers, corporate inquiries, and imported marketing leads.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleAutoSyncFromOrders}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Sync from Orders & WA
              </button>

              <button
                type="button"
                onClick={handleExportContactsCsv}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>

              <button
                type="button"
                onClick={() => setIsImportModalOpen(true)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                Import Contacts
              </button>

              <button
                type="button"
                onClick={() => setIsAddContactModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md shadow-emerald-600/25 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add Customer
              </button>
            </div>
          </div>

          {/* Search & Tag Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={contactSearchQuery}
                onChange={(e) => setContactSearchQuery(e.target.value)}
                placeholder="Search name, phone, email, or company..."
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
              {['All', 'Corporate Client', 'Order Customer', 'Inquiry Lead', 'WhatsApp Contact', 'School', 'VIP'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setContactFilterTag(tag)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                    contactFilterTag === tag
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Contacts Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-black text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Customer / Organization</th>
                  <th className="py-3 px-4">Phone (SMS)</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Source & Tags</th>
                  <th className="py-3 px-4">Orders</th>
                  <th className="py-3 px-4 text-right">Quick Dispatch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {displayedContacts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No customer contacts found matching your search.
                    </td>
                  </tr>
                ) : (
                  displayedContacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{contact.name}</div>
                        {contact.companyName && (
                          <div className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {contact.companyName}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {contact.phone || <span className="text-slate-300 font-normal italic">No phone</span>}
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        {contact.email || <span className="text-slate-300 italic">No email</span>}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                            {contact.source}
                          </span>
                          {contact.tags.slice(0, 2).map((t, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 font-semibold">
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-800">
                          {contact.totalOrdersCount || 0} Orders
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {contact.phone && (
                            <a
                              href={`https://wa.me/254${contact.phone.replace(/[^0-9]/g, '').slice(-9)}?text=Hello%20${encodeURIComponent(contact.name)}%2C%20greeting%20from%20Woodynat%20Designers`}
                              target="_blank"
                              rel="noreferrer"
                              title="Direct WhatsApp"
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {contact.phone && (
                            <button
                              onClick={() => {
                                setSmsAudienceTarget('custom');
                                setSmsCustomSelectedIds([contact.id]);
                                setSubTab('sms');
                              }}
                              title="Draft Direct SMS"
                              className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors"
                            >
                              <Smartphone className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {contact.email && (
                            <button
                              onClick={() => {
                                setEmailAudienceTarget('custom');
                                setEmailCustomSelectedIds([contact.id]);
                                setSubTab('email');
                              }}
                              title="Draft Direct Email"
                              className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => deleteCustomerContact(contact.id)}
                            title="Delete Contact"
                            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
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
      )}

      {/* ========================================================================= */}
      {/* --- TAB 4: BROADCAST CAMPAIGN HISTORY & DELIVERY LOGS --- */}
      {/* ========================================================================= */}
      {subTab === 'history' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600" />
                Campaign Dispatch Records & Carrier Delivery Logs
              </h2>
              <p className="text-xs text-slate-500">
                Detailed audit trail of all bulk SMS dispatches and email newsletter marketing batches.
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-slate-500">Average Delivery Rate:</span>
              <div className="text-lg font-black text-emerald-600">98.4%</div>
            </div>
          </div>

          <div className="space-y-4">
            {bulkCampaigns.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                No campaigns launched yet. Start with a Bulk SMS or Email broadcast.
              </div>
            ) : (
              bulkCampaigns.map((camp) => (
                <div
                  key={camp.id}
                  className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl text-white font-bold ${
                        camp.channel === 'sms' ? 'bg-amber-500' : 'bg-indigo-600'
                      }`}>
                        {camp.channel === 'sms' ? <Smartphone className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                      </div>

                      <div>
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          {camp.title}
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            camp.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {camp.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Target: <span className="font-semibold text-slate-700">{camp.audienceLabel}</span> • Dispatched: {camp.sentAt}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div className="text-right">
                        <div className="font-bold text-slate-900">
                          {camp.deliveredCount} / {camp.recipientCount} Delivered
                        </div>
                        <div className="text-emerald-600 font-semibold text-[11px]">
                          Est. Engagement: {camp.openRateEstimate || '98%'}
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedCampaignForLogs(camp)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors"
                      >
                        View Logs
                      </button>

                      <button
                        onClick={() => deleteCampaign(camp.id)}
                        className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {camp.smsBody && (
                    <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs text-slate-700 font-mono">
                      "{camp.smsBody}"
                    </div>
                  )}

                  {camp.emailSubject && (
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs text-slate-700">
                      <span className="font-bold text-indigo-600">Subject:</span> {camp.emailSubject}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* --- MODAL: ADD NEW CONTACT --- */}
      {/* ========================================================================= */}
      {isAddContactModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                Add Customer Contact
              </h3>
              <button onClick={() => setIsAddContactModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Customer / Contact Name *</label>
                <input
                  type="text"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder="e.g. John Kamau"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mobile Phone Number (SMS / WhatsApp) *</label>
                <input
                  type="text"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  placeholder="e.g. 0712345678 or +254712345678"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={newContactEmail}
                  onChange={(e) => setNewContactEmail(e.target.value)}
                  placeholder="e.g. john@company.co.ke"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Company / Organization / School</label>
                <input
                  type="text"
                  value={newContactCompany}
                  onChange={(e) => setNewContactCompany(e.target.value)}
                  placeholder="e.g. Apex Logistics Ltd"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Customer Group Tag</label>
                <select
                  value={newContactTag}
                  onChange={(e) => setNewContactTag(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                >
                  <option value="Corporate Client">Corporate Client</option>
                  <option value="School">School / College</option>
                  <option value="Order Customer">Order Customer</option>
                  <option value="Inquiry Lead">Inquiry Lead</option>
                  <option value="VIP">VIP High-Volume Buyer</option>
                  <option value="Memorial Customer">Memorial & Funeral Service</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddContactModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!newContactName.trim() || (!newContactPhone.trim() && !newContactEmail.trim())) {
                    showToast('Missing Info', 'Please provide a name and at least a phone number or email.', 'error');
                    return;
                  }
                  addCustomerContact({
                    name: newContactName,
                    phone: newContactPhone,
                    email: newContactEmail,
                    companyName: newContactCompany,
                    tags: [newContactTag],
                    source: 'manual',
                    subscribedEmail: true,
                    subscribedSms: true
                  });
                  setNewContactName('');
                  setNewContactPhone('');
                  setNewContactEmail('');
                  setNewContactCompany('');
                  setIsAddContactModalOpen(false);
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow-md shadow-emerald-600/25"
              >
                Save Contact
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* --- MODAL: BULK CSV / TEXT IMPORTER --- */}
      {/* ========================================================================= */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-600" />
                Import Bulk Customer Contacts
              </h3>
              <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                Paste your contact list below. Each line should follow the format:
                <br />
                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded mt-1 inline-block">
                  Name, Phone Number, Email, Company (Optional)
                </span>
              </p>

              <textarea
                rows={7}
                value={importTextData}
                onChange={(e) => setImportTextData(e.target.value)}
                placeholder={`Jane Wambui, 0712345678, jane@apex.co.ke, Apex Logistics\nDavid Ochieng, 0722998877, david@school.ac.ke, St Jude\nMary Mwangi, 0733445566, mary@family.org`}
                className="w-full p-3 font-mono text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none leading-relaxed"
              />

              <div className="text-[11px] text-slate-500 bg-indigo-50 p-2.5 rounded-lg border border-indigo-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Duplicates by phone or email are automatically merged and filtered out.</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProcessImport}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs shadow-md shadow-indigo-600/25"
              >
                Parse & Import Contacts
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* --- MODAL: DISPATCH PROGRESS OVERLAY --- */}
      {/* ========================================================================= */}
      {(smsSendModalOpen || emailSendModalOpen) && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 font-black flex items-center justify-center mx-auto animate-bounce">
              <Send className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900">
                {smsSendModalOpen ? 'Broadcasting Bulk SMS...' : 'Dispatching Bulk Email Campaign...'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Connecting to high-throughput carrier gateways for Woodynat Designers Limited.
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                <div
                  className="bg-gradient-to-r from-amber-500 to-indigo-600 h-full transition-all duration-300"
                  style={{ width: `${smsSendModalOpen ? smsSendProgress : emailSendProgress}%` }}
                />
              </div>
              <div className="text-xs font-black text-slate-700">
                {smsSendModalOpen ? smsSendProgress : emailSendProgress}% Completed
              </div>
            </div>

            <div className="text-[11px] text-slate-400 font-mono">
              Sender Verified: WOODYNAT • Paybill 247247 Acc 0797939199
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* --- MODAL: CAMPAIGN LOGS AUDIT TRAIL --- */}
      {/* ========================================================================= */}
      {selectedCampaignForLogs && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-base">Campaign Delivery Audit Log</h3>
                <p className="text-xs text-slate-500">{selectedCampaignForLogs.title}</p>
              </div>
              <button onClick={() => setSelectedCampaignForLogs(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-xs max-h-72 overflow-y-auto">
              {selectedCampaignForLogs.logs && selectedCampaignForLogs.logs.length > 0 ? (
                selectedCampaignForLogs.logs.map((log, i) => (
                  <div key={i} className="leading-relaxed border-b border-slate-800/80 pb-1">
                    &gt; {log}
                  </div>
                ))
              ) : (
                <div>&gt; Broadcast dispatched successfully with 0 errors.</div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
              <span>Recipients: <strong className="text-slate-900">{selectedCampaignForLogs.recipientCount}</strong></span>
              <span>Delivered: <strong className="text-emerald-600">{selectedCampaignForLogs.deliveredCount}</strong></span>
              <button
                onClick={() => setSelectedCampaignForLogs(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs"
              >
                Close Audit Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
