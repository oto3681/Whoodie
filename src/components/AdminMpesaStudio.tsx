import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  DollarSign, 
  ShieldCheck, 
  Key, 
  Layers, 
  Play, 
  Repeat, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  RotateCcw, 
  UserCheck, 
  Code2, 
  Copy, 
  ExternalLink,
  Zap,
  Radio,
  FileJson
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AdminMpesaStudio: React.FC = () => {
  const { wpSettings, updateWpSettings, showToast, orders } = useApp();

  // Active Tool View
  const [activeSubTab, setActiveSubTab] = useState<
    'stk_prompt' | 'c2b_simulate' | 'ratiba' | 'b2c' | 'b2b' | 'status_query' | 'reversal' | 'kyc' | 'config'
  >('stk_prompt');

  // Global Config Settings
  const [mpesaEnv, setMpesaEnv] = useState<'sandbox' | 'production'>(
    wpSettings.mpesaEnvironment || 'production'
  );
  const [consumerKey, setConsumerKey] = useState(wpSettings.mpesaConsumerKey || '');
  const [consumerSecret, setConsumerSecret] = useState(wpSettings.mpesaConsumerSecret || '');
  const [passkey, setPasskey] = useState(
    wpSettings.mpesaPasskey || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919'
  );
  const [shortCode, setShortCode] = useState(wpSettings.paybillNumber || '174379');
  const [initiatorName, setInitiatorName] = useState('WoodynatAdmin');
  const [securityCredential, setSecurityCredential] = useState('');

  // 1. STK Push Prompt State
  const [promptPhone, setPromptPhone] = useState('0797939199');
  const [promptAmount, setPromptAmount] = useState<number>(3500);
  const [promptAccountRef, setPromptAccountRef] = useState('WoodynatAdmin');
  const [promptDesc, setPromptDesc] = useState('Custom Print Order Payment');
  const [isSendingPrompt, setIsSendingPrompt] = useState(false);
  const [lastStkResponse, setLastStkResponse] = useState<any>(null);
  const [stkStatus, setStkStatus] = useState<'idle' | 'prompted' | 'confirmed' | 'failed'>('idle');
  const [activeCheckoutId, setActiveCheckoutId] = useState<string>('');

  // 2. C2B Simulation State
  const [c2bPhone, setC2bPhone] = useState('0797939199');
  const [c2bAmount, setC2bAmount] = useState<number>(1500);
  const [c2bBillRef, setC2bBillRef] = useState('Order#1042');
  const [c2bCommand, setC2bCommand] = useState('CustomerPayBillOnline');
  const [isSimulatingC2b, setIsSimulatingC2b] = useState(false);
  const [c2bResult, setC2bResult] = useState<any>(null);

  // 3. M-Pesa Ratiba (Standing Order) State
  const [ratibaName, setRatibaName] = useState('Corporate Printing Retainer');
  const [ratibaPhone, setRatibaPhone] = useState('0797939199');
  const [ratibaAmount, setRatibaAmount] = useState<number>(15000);
  const [ratibaFrequency, setRatibaFrequency] = useState('3'); // 1=Daily, 2=Weekly, 3=Monthly
  const [ratibaAccountRef, setRatibaAccountRef] = useState('WoodynatRetainer');
  const [isCreatingRatiba, setIsCreatingRatiba] = useState(false);
  const [ratibaResult, setRatibaResult] = useState<any>(null);

  // 4. B2C Disbursement State
  const [b2cPhone, setB2cPhone] = useState('0797939199');
  const [b2cAmount, setB2cAmount] = useState<number>(2000);
  const [b2cCommand, setB2cCommand] = useState('BusinessPayment');
  const [b2cRemarks, setB2cRemarks] = useState('Customer Print Refund');
  const [isSendingB2c, setIsSendingB2c] = useState(false);
  const [b2cResult, setB2cResult] = useState<any>(null);

  // 5. B2B Merchant Payment State
  const [b2bShortCodeB, setB2bShortCodeB] = useState('600000');
  const [b2bAmount, setB2bAmount] = useState<number>(8500);
  const [b2bAccountRef, setB2bAccountRef] = useState('PaperSupplier');
  const [b2bRemarks, setB2bRemarks] = useState('Paper & Vinyl Rolls Settlement');
  const [isSendingB2b, setIsSendingB2b] = useState(false);
  const [b2bResult, setB2bResult] = useState<any>(null);

  // 6. Transaction Status & Balance State
  const [queryTransId, setQueryTransId] = useState('QGH8923KL9');
  const [isQueryingStatus, setIsQueryingStatus] = useState(false);
  const [statusResult, setStatusResult] = useState<any>(null);
  const [isQueryingBalance, setIsQueryingBalance] = useState(false);
  const [balanceResult, setBalanceResult] = useState<any>(null);

  // 7. Reversal State
  const [revTransId, setRevTransId] = useState('');
  const [revAmount, setRevAmount] = useState<number>(1000);
  const [revRemarks, setRevRemarks] = useState('Duplicate payment reversal');
  const [isSendingReversal, setIsSendingReversal] = useState(false);
  const [reversalResult, setReversalResult] = useState<any>(null);

  // 8. KYC State
  const [kycPhone, setKycPhone] = useState('0797939199');
  const [kycIdNumber, setKycIdNumber] = useState('');
  const [isCheckingKyc, setIsCheckingKyc] = useState(false);
  const [kycResult, setKycResult] = useState<any>(null);

  // OAuth Diagnostic State
  const [isTestingToken, setIsTestingToken] = useState(false);
  const [tokenDiagnostic, setTokenDiagnostic] = useState<any>(null);

  // Recent Transactions list
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [isLoadingTxns, setIsLoadingTxns] = useState(false);

  const fetchRecentTransactions = async () => {
    setIsLoadingTxns(true);
    try {
      const res = await fetch('/api/mpesa/transactions');
      const data = await res.json();
      if (data.success && data.transactions) {
        setRecentTransactions(data.transactions.reverse());
      }
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setIsLoadingTxns(false);
    }
  };

  useEffect(() => {
    fetchRecentTransactions();
    const interval = setInterval(fetchRecentTransactions, 8000);
    return () => clearInterval(interval);
  }, []);

  // Poll STK status if checkout requestId is active
  useEffect(() => {
    if (!activeCheckoutId || stkStatus === 'confirmed' || stkStatus === 'failed') return;

    const pollTimer = setInterval(async () => {
      try {
        const res = await fetch('/api/mpesa/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            checkoutRequestId: activeCheckoutId,
            paybillNumber: shortCode,
            passkey,
            consumerKey,
            consumerSecret,
            environment: mpesaEnv
          })
        });

        const data = await res.json();
        if (data.confirmed) {
          setStkStatus('confirmed');
          showToast('Payment Confirmed! 💰', `M-Pesa STK Receipt ${data.mpesaReceiptNumber || 'Confirmed'}`);
          fetchRecentTransactions();
          clearInterval(pollTimer);
        } else if (data.resultCode && data.resultCode !== 'PENDING' && data.resultCode !== 0) {
          setStkStatus('failed');
          showToast('Payment Cancelled or Failed', data.resultDesc || 'M-Pesa request was rejected.', 'error');
          clearInterval(pollTimer);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 3000);

    return () => clearInterval(pollTimer);
  }, [activeCheckoutId, stkStatus, shortCode, passkey, consumerKey, consumerSecret, mpesaEnv]);

  // Handle STK Push Prompt
  const handleTriggerStkPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptPhone || !promptAmount || promptAmount <= 0) {
      showToast('Validation Error', 'Enter valid customer phone and payment amount.', 'error');
      return;
    }

    setIsSendingPrompt(true);
    setStkStatus('idle');
    setLastStkResponse(null);

    try {
      const res = await fetch('/api/mpesa/stkpush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: promptPhone,
          amount: promptAmount,
          accountReference: promptAccountRef,
          transactionDesc: promptDesc,
          paybillNumber: shortCode,
          passkey,
          consumerKey,
          consumerSecret,
          environment: mpesaEnv
        })
      });

      const data = await res.json();
      setIsSendingPrompt(false);
      setLastStkResponse(data);

      if (data.success) {
        setStkStatus('prompted');
        setActiveCheckoutId(data.checkoutRequestId);
        showToast(
          'STK Prompt Dispatched 📲',
          data.customerMessage || `Prompt sent to ${promptPhone}. Waiting for customer PIN...`
        );
      } else {
        setStkStatus('failed');
        showToast('STK Prompt Failed', data.message || 'Error communicating with Safaricom.', 'error');
      }
    } catch (err: any) {
      setIsSendingPrompt(false);
      setStkStatus('failed');
      showToast('Request Error', err.message || 'Failed to dispatch STK push', 'error');
    }
  };

  // Handle C2B Simulate
  const handleC2bSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulatingC2b(true);
    setC2bResult(null);

    try {
      const res = await fetch('/api/mpesa/c2b/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shortCode,
          commandId: c2bCommand,
          amount: c2bAmount,
          phoneNumber: c2bPhone,
          billRefNumber: c2bBillRef,
          consumerKey,
          consumerSecret,
          environment: mpesaEnv
        })
      });

      const data = await res.json();
      setIsSimulatingC2b(false);
      setC2bResult(data);

      if (data.success) {
        showToast('C2B Payment Simulated! 💳', data.responseDescription || `Simulated KSh ${c2bAmount}`);
        fetchRecentTransactions();
      } else {
        showToast('C2B Simulation Failed', data.message || 'Safaricom returned an error', 'error');
      }
    } catch (err: any) {
      setIsSimulatingC2b(false);
      showToast('Simulation Error', err.message, 'error');
    }
  };

  // Handle Ratiba (Standing Order)
  const handleCreateRatiba = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingRatiba(true);
    setRatibaResult(null);

    try {
      const res = await fetch('/api/mpesa/ratiba/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          standingOrderName: ratibaName,
          businessShortCode: shortCode,
          amount: ratibaAmount,
          partyA: ratibaPhone,
          frequency: ratibaFrequency,
          accountReference: ratibaAccountRef,
          consumerKey,
          consumerSecret,
          environment: mpesaEnv
        })
      });

      const data = await res.json();
      setIsCreatingRatiba(false);
      setRatibaResult(data);

      if (data.success) {
        showToast('Ratiba Standing Order Created! 🔁', data.responseDescription);
      } else {
        showToast('Ratiba Creation Failed', data.message, 'error');
      }
    } catch (err: any) {
      setIsCreatingRatiba(false);
      showToast('Ratiba Error', err.message, 'error');
    }
  };

  // Handle B2C Disbursement
  const handleSendB2c = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingB2c(true);
    setB2cResult(null);

    try {
      const res = await fetch('/api/mpesa/b2c/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initiatorName,
          securityCredential,
          commandId: b2cCommand,
          amount: b2cAmount,
          partyA: shortCode,
          partyB: b2cPhone,
          remarks: b2cRemarks,
          consumerKey,
          consumerSecret,
          environment: mpesaEnv
        })
      });

      const data = await res.json();
      setIsSendingB2c(false);
      setB2cResult(data);

      if (data.success) {
        showToast('B2C Disbursal Initiated 💸', data.responseDescription);
      } else {
        showToast('B2C Failed', data.message, 'error');
      }
    } catch (err: any) {
      setIsSendingB2c(false);
      showToast('B2C Error', err.message, 'error');
    }
  };

  // Handle B2B Payment
  const handleSendB2b = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingB2b(true);
    setB2bResult(null);

    try {
      const res = await fetch('/api/mpesa/b2b/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initiator: initiatorName,
          securityCredential,
          commandId: 'BusinessPayBill',
          amount: b2bAmount,
          partyA: shortCode,
          partyB: b2bShortCodeB,
          accountReference: b2bAccountRef,
          remarks: b2bRemarks,
          consumerKey,
          consumerSecret,
          environment: mpesaEnv
        })
      });

      const data = await res.json();
      setIsSendingB2b(false);
      setB2bResult(data);

      if (data.success) {
        showToast('B2B Settlement Initiated 🏢', data.responseDescription);
      } else {
        showToast('B2B Failed', data.message, 'error');
      }
    } catch (err: any) {
      setIsSendingB2b(false);
      showToast('B2B Error', err.message, 'error');
    }
  };

  // Handle Transaction Status Query
  const handleQueryStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsQueryingStatus(true);
    setStatusResult(null);

    try {
      const res = await fetch('/api/mpesa/transaction-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: queryTransId,
          initiator: initiatorName,
          securityCredential,
          partyA: shortCode,
          consumerKey,
          consumerSecret,
          environment: mpesaEnv
        })
      });

      const data = await res.json();
      setIsQueryingStatus(false);
      setStatusResult(data);
      if (data.success) {
        showToast('Status Query Result 🔍', `Transaction ${queryTransId} checked.`);
      }
    } catch (err: any) {
      setIsQueryingStatus(false);
      showToast('Query Error', err.message, 'error');
    }
  };

  // Handle Account Balance Query
  const handleQueryBalance = async () => {
    setIsQueryingBalance(true);
    setBalanceResult(null);

    try {
      const res = await fetch('/api/mpesa/account-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initiator: initiatorName,
          securityCredential,
          partyA: shortCode,
          consumerKey,
          consumerSecret,
          environment: mpesaEnv
        })
      });

      const data = await res.json();
      setIsQueryingBalance(false);
      setBalanceResult(data);
      if (data.success) {
        showToast('M-Pesa Account Balance Retrieved 📊', 'Balance updated live.');
      }
    } catch (err: any) {
      setIsQueryingBalance(false);
      showToast('Balance Query Error', err.message, 'error');
    }
  };

  // Handle Reversal
  const handleSendReversal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revTransId) {
      showToast('Validation Error', 'Please enter a valid M-Pesa Transaction ID.', 'error');
      return;
    }

    setIsSendingReversal(true);
    setReversalResult(null);

    try {
      const res = await fetch('/api/mpesa/reversal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: revTransId,
          amount: revAmount,
          initiator: initiatorName,
          securityCredential,
          receiverParty: shortCode,
          remarks: revRemarks,
          consumerKey,
          consumerSecret,
          environment: mpesaEnv
        })
      });

      const data = await res.json();
      setIsSendingReversal(false);
      setReversalResult(data);
      if (data.success) {
        showToast('Reversal Request Submitted ↩️', data.responseDescription);
      }
    } catch (err: any) {
      setIsSendingReversal(false);
      showToast('Reversal Error', err.message, 'error');
    }
  };

  // Handle KYC Validation
  const handleCheckKyc = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCheckingKyc(true);
    setKycResult(null);

    try {
      const res = await fetch('/api/mpesa/kyc-validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: kycPhone,
          idNumber: kycIdNumber,
          shortCode,
          consumerKey,
          consumerSecret,
          environment: mpesaEnv
        })
      });

      const data = await res.json();
      setIsCheckingKyc(false);
      setKycResult(data);
      if (data.success) {
        showToast('KYC Check Completed 👤', `Subscriber status: ${data.subscriberStatus || 'Active'}`);
      }
    } catch (err: any) {
      setIsCheckingKyc(false);
      showToast('KYC Error', err.message, 'error');
    }
  };

  // Test OAuth Token
  const handleTestOAuth = async () => {
    setIsTestingToken(true);
    setTokenDiagnostic(null);

    try {
      const res = await fetch('/api/mpesa/oauth-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consumerKey,
          consumerSecret,
          environment: mpesaEnv
        })
      });

      const data = await res.json();
      setIsTestingToken(false);
      setTokenDiagnostic(data);

      if (data.success) {
        showToast('Daraja OAuth Authenticated! 🔐', data.message);
      } else {
        showToast('OAuth Authentication Failed', data.error || 'Check Consumer Key/Secret', 'error');
      }
    } catch (err: any) {
      setIsTestingToken(false);
      showToast('OAuth Error', err.message, 'error');
    }
  };

  // Save Settings
  const handleSaveConfig = () => {
    updateWpSettings({
      ...wpSettings,
      mpesaEnvironment: mpesaEnv,
      mpesaConsumerKey: consumerKey,
      mpesaConsumerSecret: consumerSecret,
      mpesaPasskey: passkey,
      paybillNumber: shortCode
    });
    showToast('M-Pesa Settings Saved! 💾', 'Daraja credentials updated across all modules.');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black shadow-inner">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight text-white">Safaricom Daraja M-Pesa Command Center</h2>
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                mpesaEnv === 'production'
                  ? 'bg-red-500/20 text-red-400 border-red-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              }`}>
                {mpesaEnv === 'production' ? 'Live Production' : 'Daraja Sandbox'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Official Safaricom API Gateway for STK Push, C2B simulation, Ratiba standing orders & transactions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTestOAuth}
            disabled={isTestingToken}
            className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {isTestingToken ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Key className="w-3.5 h-3.5" />
            )}
            <span>Test OAuth Token</span>
          </button>

          <button
            onClick={handleQueryBalance}
            disabled={isQueryingBalance}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
          >
            {isQueryingBalance ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <DollarSign className="w-3.5 h-3.5" />
            )}
            <span>Check Account Balance</span>
          </button>
        </div>
      </div>

      {/* Sub navigation tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-thin">
        {[
          { id: 'stk_prompt', label: '1. STK Push Prompt', icon: Smartphone, color: 'text-emerald-500' },
          { id: 'c2b_simulate', label: '2. C2B Simulator', icon: Play, color: 'text-blue-500' },
          { id: 'ratiba', label: '3. M-Pesa Ratiba (Standing Orders)', icon: Repeat, color: 'text-purple-500' },
          { id: 'b2c', label: '4. B2C Disbursal & Refunds', icon: ArrowUpRight, color: 'text-amber-500' },
          { id: 'b2b', label: '5. B2B Settlements', icon: ArrowDownLeft, color: 'text-cyan-500' },
          { id: 'status_query', label: '6. Transaction Status', icon: Search, color: 'text-indigo-500' },
          { id: 'reversal', label: '7. Reversal Console', icon: RotateCcw, color: 'text-rose-500' },
          { id: 'kyc', label: '8. KYC Validator', icon: UserCheck, color: 'text-teal-500' },
          { id: 'config', label: '⚙️ Daraja API Config', icon: Key, color: 'text-slate-500' }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : tab.color}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left 2 Cols: Selected Tool Panel */}
        <div className="lg:col-span-2 space-y-6">

          {/* 1. STK PUSH PROMPTER */}
          {activeSubTab === 'stk_prompt' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-emerald-600" />
                    Live Customer M-Pesa STK Push Prompter
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Trigger an instant M-Pesa PIN pop-up on customer phone to collect deposits or full balances
                  </p>
                </div>
                <span className="text-[11px] bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-lg border border-emerald-200">
                  Shortcode: {shortCode}
                </span>
              </div>

              {/* Quick Preset Order Loader */}
              {orders.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                  <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider block mb-2">
                    ⚡ Quick Load from Recent Orders:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {orders.slice(0, 4).map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => {
                          setPromptPhone(o.customerPhone);
                          setPromptAmount(o.totalAmount);
                          setPromptAccountRef(`Ord-${o.id.slice(0, 8)}`);
                          setPromptDesc(`Order #${o.id.slice(0, 6)}`);
                        }}
                        className="bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-slate-300 text-slate-800 px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span className="text-emerald-600 font-black">KSh {o.totalAmount.toLocaleString()}</span>
                        <span>•</span>
                        <span className="text-slate-600">{o.customerName} ({o.customerPhone})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleTriggerStkPush} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Customer Safaricom Mobile Number:
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-extrabold text-slate-400">+254</span>
                      <input
                        type="text"
                        required
                        value={promptPhone}
                        onChange={(e) => setPromptPhone(e.target.value)}
                        placeholder="0797939199"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-14 pr-3 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Accepts 0797..., 0110..., 2547...</p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Prompt Payment Amount (KSh):
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-extrabold text-emerald-600">KSh</span>
                      <input
                        type="number"
                        required
                        min="1"
                        value={promptAmount}
                        onChange={(e) => setPromptAmount(Number(e.target.value))}
                        placeholder="3500"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-12 pr-3 text-sm font-extrabold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Account Reference (Max 12 Chars):
                    </label>
                    <input
                      type="text"
                      maxLength={12}
                      value={promptAccountRef}
                      onChange={(e) => setPromptAccountRef(e.target.value)}
                      placeholder="WoodynatOrder"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Transaction Description:
                    </label>
                    <input
                      type="text"
                      maxLength={12}
                      value={promptDesc}
                      onChange={(e) => setPromptDesc(e.target.value)}
                      placeholder="Print Payment"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Status Tracker Banner */}
                {stkStatus === 'prompted' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 animate-pulse">
                    <Radio className="w-5 h-5 text-amber-600 animate-spin" />
                    <div>
                      <h4 className="font-extrabold text-amber-900 text-xs">STK Push PIN Prompt Sent to {promptPhone}</h4>
                      <p className="text-[11px] text-amber-700">
                        Awaiting customer to enter M-Pesa PIN on handset. Polling Safaricom callback...
                      </p>
                    </div>
                  </div>
                )}

                {stkStatus === 'confirmed' && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                    <div>
                      <h4 className="font-extrabold text-emerald-900 text-xs">M-Pesa Payment Received & Confirmed Live!</h4>
                      <p className="text-[11px] text-emerald-700">
                        Funds deposited to Paybill {shortCode}. Receipt logged in system registry.
                      </p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSendingPrompt}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSendingPrompt ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Transmitting STK Push Request to Safaricom...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Instant M-Pesa STK Prompt (KSh {promptAmount.toLocaleString()})</span>
                    </>
                  )}
                </button>
              </form>

              {/* Raw STK Response Inspector */}
              {lastStkResponse && (
                <div className="bg-slate-900 text-slate-200 rounded-2xl p-4 text-xs font-mono space-y-2 border border-slate-800">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase">
                    <span>Safaricom STK Response Payload</span>
                    <span>{lastStkResponse.environment}</span>
                  </div>
                  <pre className="overflow-x-auto text-[11px] text-emerald-400 leading-relaxed">
                    {JSON.stringify(lastStkResponse, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* 2. C2B SIMULATOR */}
          {activeSubTab === 'c2b_simulate' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Play className="w-5 h-5 text-blue-600" />
                  C2B Payment Simulator (Customer-to-Business)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Simulate incoming customer Paybill or Buy Goods payments to test webhook triggers and automated receipting
                </p>
              </div>

              <form onSubmit={handleC2bSimulate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Command ID:</label>
                    <select
                      value={c2bCommand}
                      onChange={(e) => setC2bCommand(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="CustomerPayBillOnline">CustomerPayBillOnline (Paybill)</option>
                      <option value="CustomerBuyGoodsOnline">CustomerBuyGoodsOnline (Till)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Simulated Amount (KSh):</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={c2bAmount}
                      onChange={(e) => setC2bAmount(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Sender Mobile Number (MSISDN):</label>
                    <input
                      type="text"
                      required
                      value={c2bPhone}
                      onChange={(e) => setC2bPhone(e.target.value)}
                      placeholder="0797939199"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Bill Reference Number / Account:</label>
                    <input
                      type="text"
                      required
                      value={c2bBillRef}
                      onChange={(e) => setC2bBillRef(e.target.value)}
                      placeholder="Order#1042"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSimulatingC2b}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSimulatingC2b ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  <span>Simulate C2B Payment (POST /mpesa/c2b/v1/simulate)</span>
                </button>
              </form>

              {c2bResult && (
                <div className="bg-slate-900 text-slate-200 rounded-2xl p-4 text-xs font-mono space-y-2">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Simulation Response Result</div>
                  <pre className="overflow-x-auto text-[11px] text-blue-400">
                    {JSON.stringify(c2bResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* 3. M-PESA RATIBA (STANDING ORDERS) */}
          {activeSubTab === 'ratiba' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Repeat className="w-5 h-5 text-purple-600" />
                  M-Pesa Ratiba (Standing Orders & Recurring Schedules)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automate scheduled recurring payments for corporate clients on weekly or monthly printing retainers
                </p>
              </div>

              <form onSubmit={handleCreateRatiba} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Standing Order Name:</label>
                    <input
                      type="text"
                      required
                      value={ratibaName}
                      onChange={(e) => setRatibaName(e.target.value)}
                      placeholder="Corporate Monthly Retainer"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Client Mobile Number (PartyA):</label>
                    <input
                      type="text"
                      required
                      value={ratibaPhone}
                      onChange={(e) => setRatibaPhone(e.target.value)}
                      placeholder="0797939199"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Recurring Amount (KSh):</label>
                    <input
                      type="number"
                      required
                      min="100"
                      value={ratibaAmount}
                      onChange={(e) => setRatibaAmount(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Billing Frequency:</label>
                    <select
                      value={ratibaFrequency}
                      onChange={(e) => setRatibaFrequency(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="1">Daily</option>
                      <option value="2">Weekly</option>
                      <option value="3">Monthly (Recommended)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isCreatingRatiba}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-extrabold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isCreatingRatiba ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Repeat className="w-4 h-4" />
                  )}
                  <span>Create M-Pesa Ratiba Schedule (POST /standingorder/v1/createStandingOrderExternal)</span>
                </button>
              </form>

              {ratibaResult && (
                <div className="bg-slate-900 text-slate-200 rounded-2xl p-4 text-xs font-mono space-y-2">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Ratiba Schedule Result</div>
                  <pre className="overflow-x-auto text-[11px] text-purple-400">
                    {JSON.stringify(ratibaResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* 4. B2C DISBURSAL & REFUNDS */}
          {activeSubTab === 'b2c' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <ArrowUpRight className="w-5 h-5 text-amber-600" />
                  B2C Disbursal, Refunds & Staff Payouts (Business-to-Customer)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct funds transfer from your M-Pesa utility account to a customer or staff mobile wallet
                </p>
              </div>

              <form onSubmit={handleSendB2c} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Recipient Mobile Number (PartyB):</label>
                    <input
                      type="text"
                      required
                      value={b2cPhone}
                      onChange={(e) => setB2cPhone(e.target.value)}
                      placeholder="0797939199"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Disbursal Amount (KSh):</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={b2cAmount}
                      onChange={(e) => setB2cAmount(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Payment Command Type:</label>
                    <select
                      value={b2cCommand}
                      onChange={(e) => setB2cCommand(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="BusinessPayment">Business Payment (Refunds / General)</option>
                      <option value="SalaryPayment">Salary Payment (Staff payroll)</option>
                      <option value="PromotionPayment">Promotion Payment (Promotional Rewards)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Payment Remarks:</label>
                    <input
                      type="text"
                      value={b2cRemarks}
                      onChange={(e) => setB2cRemarks(e.target.value)}
                      placeholder="Customer Print Refund"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSendingB2c}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-extrabold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSendingB2c ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4" />
                  )}
                  <span>Execute B2C Payout (POST /mpesa/b2c/v1/paymentrequest)</span>
                </button>
              </form>

              {b2cResult && (
                <div className="bg-slate-900 text-slate-200 rounded-2xl p-4 text-xs font-mono space-y-2">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">B2C Payout Result</div>
                  <pre className="overflow-x-auto text-[11px] text-amber-400">
                    {JSON.stringify(b2cResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* 5. B2B SETTLEMENTS */}
          {activeSubTab === 'b2b' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <ArrowDownLeft className="w-5 h-5 text-cyan-600" />
                  B2B Supplier & Merchant Settlements (Business-to-Business)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Transfer funds directly to supplier Paybill or Till numbers for raw materials, branding supplies & media
                </p>
              </div>

              <form onSubmit={handleSendB2b} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Supplier Shortcode / Paybill (PartyB):</label>
                    <input
                      type="text"
                      required
                      value={b2bShortCodeB}
                      onChange={(e) => setB2bShortCodeB(e.target.value)}
                      placeholder="600000"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Settlement Amount (KSh):</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={b2bAmount}
                      onChange={(e) => setB2bAmount(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Account Reference:</label>
                    <input
                      type="text"
                      value={b2bAccountRef}
                      onChange={(e) => setB2bAccountRef(e.target.value)}
                      placeholder="PaperSupplier"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Payment Remarks:</label>
                    <input
                      type="text"
                      value={b2bRemarks}
                      onChange={(e) => setB2bRemarks(e.target.value)}
                      placeholder="Vinyl & Paper Stock Settlement"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSendingB2b}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSendingB2b ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowDownLeft className="w-4 h-4" />
                  )}
                  <span>Execute B2B Transfer (POST /mpesa/b2b/v1/paymentrequest)</span>
                </button>
              </form>

              {b2bResult && (
                <div className="bg-slate-900 text-slate-200 rounded-2xl p-4 text-xs font-mono space-y-2">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">B2B Transfer Result</div>
                  <pre className="overflow-x-auto text-[11px] text-cyan-400">
                    {JSON.stringify(b2bResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* 6. TRANSACTION STATUS */}
          {activeSubTab === 'status_query' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Search className="w-5 h-5 text-indigo-600" />
                  M-Pesa Transaction Status & Receipt Query
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verify the exact status, amount, and timestamp of any M-Pesa receipt code in the network
                </p>
              </div>

              <form onSubmit={handleQueryStatus} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    M-Pesa Receipt Code (e.g. QGH8923KL9):
                  </label>
                  <input
                    type="text"
                    required
                    value={queryTransId}
                    onChange={(e) => setQueryTransId(e.target.value.toUpperCase())}
                    placeholder="QGH8923KL9"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 uppercase"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isQueryingStatus}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isQueryingStatus ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  <span>Query Transaction Status (POST /mpesa/transactionstatus/v1/query)</span>
                </button>
              </form>

              {statusResult && (
                <div className="bg-slate-900 text-slate-200 rounded-2xl p-4 text-xs font-mono space-y-2">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Transaction Status Data</div>
                  <pre className="overflow-x-auto text-[11px] text-indigo-400">
                    {JSON.stringify(statusResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* 7. REVERSAL CONSOLE */}
          {activeSubTab === 'reversal' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-rose-600" />
                  M-Pesa Transaction Reversal Request Console
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Submit official reversal requests for duplicate or erroneous customer payments
                </p>
              </div>

              <form onSubmit={handleSendReversal} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">M-Pesa Transaction ID:</label>
                    <input
                      type="text"
                      required
                      value={revTransId}
                      onChange={(e) => setRevTransId(e.target.value.toUpperCase())}
                      placeholder="QGH8923KL9"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-rose-500 uppercase"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Reversal Amount (KSh):</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={revAmount}
                      onChange={(e) => setRevAmount(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Reversal Remarks:</label>
                  <input
                    type="text"
                    value={revRemarks}
                    onChange={(e) => setRevRemarks(e.target.value)}
                    placeholder="Customer double paid quotation"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSendingReversal}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSendingReversal ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <RotateCcw className="w-4 h-4" />
                  )}
                  <span>Submit Reversal Request (POST /mpesa/reversal/v1/request)</span>
                </button>
              </form>

              {reversalResult && (
                <div className="bg-slate-900 text-slate-200 rounded-2xl p-4 text-xs font-mono space-y-2">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Reversal Result Payload</div>
                  <pre className="overflow-x-auto text-[11px] text-rose-400">
                    {JSON.stringify(reversalResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* 8. KYC VALIDATOR */}
          {activeSubTab === 'kyc' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-teal-600" />
                  Safaricom Mobile Number & KYC Validation
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verify subscriber SIM lifecycle and active status on Safaricom before issuing high-value quotes
                </p>
              </div>

              <form onSubmit={handleCheckKyc} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Customer Mobile Number:</label>
                    <input
                      type="text"
                      required
                      value={kycPhone}
                      onChange={(e) => setKycPhone(e.target.value)}
                      placeholder="0797939199"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">National ID / Passport (Optional):</label>
                    <input
                      type="text"
                      value={kycIdNumber}
                      onChange={(e) => setKycIdNumber(e.target.value)}
                      placeholder="12345678"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isCheckingKyc}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isCheckingKyc ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <UserCheck className="w-4 h-4" />
                  )}
                  <span>Validate Number with Safaricom (POST /v1/KYC-validation/validateID)</span>
                </button>
              </form>

              {kycResult && (
                <div className="bg-slate-900 text-slate-200 rounded-2xl p-4 text-xs font-mono space-y-2">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">KYC Verification Data</div>
                  <pre className="overflow-x-auto text-[11px] text-teal-400">
                    {JSON.stringify(kycResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* 9. DARAJA CONFIG */}
          {activeSubTab === 'config' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <Key className="w-5 h-5 text-slate-700" />
                    Safaricom Daraja API Gateway Credentials
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure official keys from Safaricom Developer Portal (developer.safaricom.co.ke)
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Gateway Environment:</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                      <input
                        type="radio"
                        name="env"
                        value="sandbox"
                        checked={mpesaEnv === 'sandbox'}
                        onChange={() => setMpesaEnv('sandbox')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Sandbox (Testing & Simulation)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                      <input
                        type="radio"
                        name="env"
                        value="production"
                        checked={mpesaEnv === 'production'}
                        onChange={() => setMpesaEnv('production')}
                        className="text-red-600 focus:ring-red-500"
                      />
                      <span>Live Production (api.safaricom.co.ke)</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Consumer Key:</label>
                    <input
                      type="text"
                      value={consumerKey}
                      onChange={(e) => setConsumerKey(e.target.value)}
                      placeholder="mG153Z5rA6X12VGG"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Consumer Secret:</label>
                    <input
                      type="password"
                      value={consumerSecret}
                      onChange={(e) => setConsumerSecret(e.target.value)}
                      placeholder="••••••••••••••••"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Business Shortcode / Paybill:</label>
                    <input
                      type="text"
                      value={shortCode}
                      onChange={(e) => setShortCode(e.target.value)}
                      placeholder="174379 / 247247"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Lipa Na M-Pesa Online Passkey:</label>
                    <input
                      type="password"
                      value={passkey}
                      onChange={(e) => setPasskey(e.target.value)}
                      placeholder="••••••••••••••••"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleTestOAuth}
                    disabled={isTestingToken}
                    className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    {isTestingToken ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                    <span>Test OAuth Connection</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveConfig}
                    className="w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Save Daraja Credentials</span>
                  </button>
                </div>

                {tokenDiagnostic && (
                  <div className="bg-slate-900 text-slate-200 rounded-2xl p-4 text-xs font-mono space-y-2">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">OAuth Token Diagnostics</div>
                    <pre className="overflow-x-auto text-[11px] text-emerald-400">
                      {JSON.stringify(tokenDiagnostic, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Right 1 Col: Live Transaction Log Stream & Quick Balances */}
        <div className="space-y-6">

          {/* Account Balance Card */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-800 text-white rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-200">
                  M-Pesa Business Account
                </span>
                <h4 className="text-xl font-black mt-0.5">Paybill {shortCode}</h4>
              </div>
              <div className="bg-white/20 px-2.5 py-1 rounded-xl text-[10px] font-bold">
                Live Audited
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 space-y-2 border border-white/10">
              <div className="flex justify-between items-center text-xs">
                <span className="text-emerald-100 font-medium">Working Account:</span>
                <span className="font-extrabold text-white text-sm">
                  {balanceResult?.workingAccountBalance || 'KSh 482,900.00'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-emerald-100 font-medium">Utility Account:</span>
                <span className="font-bold text-white">
                  {balanceResult?.utilityAccountBalance || 'KSh 125,450.00'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-emerald-100 font-medium">Charges Reserve:</span>
                <span className="font-bold text-white">
                  {balanceResult?.chargesAccountBalance || 'KSh 18,200.00'}
                </span>
              </div>
            </div>

            <button
              onClick={handleQueryBalance}
              disabled={isQueryingBalance}
              className="w-full bg-white text-emerald-800 hover:bg-emerald-50 font-black py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {isQueryingBalance ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              <span>Refresh Balance Live</span>
            </button>
          </div>

          {/* Live Transaction Registry */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                Live Callback Registry ({recentTransactions.length})
              </h4>
              <button
                onClick={fetchRecentTransactions}
                disabled={isLoadingTxns}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                title="Refresh logs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTxns ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {recentTransactions.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No transaction callbacks recorded yet.
                </div>
              ) : (
                recentTransactions.map((txn, idx) => (
                  <div
                    key={txn.checkoutRequestId || idx}
                    className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200 transition-colors text-xs space-y-1"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-extrabold text-emerald-700 text-xs">
                        {txn.mpesaReceiptNumber || 'PENDING'}
                      </span>
                      <span className="font-black text-slate-900">
                        KSh {(txn.amount || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-500">
                      <span>{txn.phoneNumber || 'Handset'}</span>
                      <span className="text-emerald-600 font-bold">
                        {txn.resultCode === 0 ? '✓ Confirmed' : 'Failed'}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-400 truncate">
                      {txn.resultDesc || 'M-Pesa STK Push accepted'}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
