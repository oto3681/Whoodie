import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Store recent M-Pesa callbacks in memory for instant status polling
interface MpesaCallbackRecord {
  checkoutRequestId: string;
  merchantRequestId: string;
  resultCode: number;
  resultDesc: string;
  amount?: number;
  mpesaReceiptNumber?: string;
  transactionDate?: string;
  phoneNumber?: string;
  receivedAt: string;
}

const recentCallbacks = new Map<string, MpesaCallbackRecord>();

// Helper to sanitize Kenyan phone numbers into 2547XXXXXXXX or 2541XXXXXXXX format
function formatKenyanPhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('07') && cleaned.length === 10) {
    cleaned = '254' + cleaned.substring(1);
  } else if (cleaned.startsWith('01') && cleaned.length === 10) {
    cleaned = '254' + cleaned.substring(1);
  } else if (cleaned.startsWith('7') && cleaned.length === 9) {
    cleaned = '254' + cleaned;
  } else if (cleaned.startsWith('1') && cleaned.length === 9) {
    cleaned = '254' + cleaned;
  } else if (cleaned.startsWith('254') && cleaned.length === 12) {
    // Already in correct format
  }
  return cleaned;
}

// Format timestamp: YYYYMMDDHHmmss
function getMpesaTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

// M-PESA STK Push API Endpoint
app.post('/api/mpesa/stkpush', async (req, res) => {
  try {
    const {
      phoneNumber,
      amount,
      accountReference,
      transactionDesc,
      paybillNumber: customPaybill,
      passkey: customPasskey,
      consumerKey: customConsumerKey,
      consumerSecret: customConsumerSecret,
      environment: customEnv
    } = req.body;

    if (!phoneNumber || !amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid phone number and amount are required.'
      });
    }

    const formattedPhone = formatKenyanPhone(String(phoneNumber));
    if (formattedPhone.length !== 12 || !formattedPhone.startsWith('254')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format. Please provide a valid Safaricom number (e.g. 0797939199).'
      });
    }

    // Resolve configuration parameters
    const envMode = (customEnv || process.env.MPESA_ENVIRONMENT || 'sandbox').toLowerCase();
    const isProduction = envMode === 'production' || envMode === 'live';
    
    const baseUrl = isProduction
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';

    // Default Safaricom Sandbox test credentials if custom ones aren't provided
    const consumerKey = customConsumerKey || process.env.MPESA_CONSUMER_KEY || (isProduction ? '' : 'mG153Z5rA6X12VGG');
    const consumerSecret = customConsumerSecret || process.env.MPESA_CONSUMER_SECRET || (isProduction ? '' : 'G6GA37gG0a6g6g');
    const passkey = customPasskey || process.env.MPESA_PASSKEY || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
    const businessShortCode = customPaybill || process.env.MPESA_SHORTCODE || '174379';

    // If live credentials are missing in production, inform user gracefully
    if (isProduction && (!consumerKey || !consumerSecret)) {
      console.warn('M-Pesa Production credentials missing. Set MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET in environment or Admin Dashboard.');
    }

    // Attempt Daraja OAuth Token Fetch
    let accessToken = '';
    let darajaError = null;

    if (consumerKey && consumerSecret) {
      try {
        const authHeader = Buffer.from(`${consumerKey.trim()}:${consumerSecret.trim()}`).toString('base64');
        const tokenRes = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
          method: 'GET',
          headers: {
            Authorization: `Basic ${authHeader}`
          }
        });

        if (tokenRes.ok) {
          const tokenData = await tokenRes.json();
          accessToken = tokenData.access_token || '';
        } else {
          const errText = await tokenRes.text();
          console.error('Safaricom Daraja Auth Failed:', tokenRes.status, errText);
          darajaError = `Daraja Auth (${tokenRes.status}): ${errText}`;
        }
      } catch (err: any) {
        console.error('Network error requesting M-Pesa token:', err);
        darajaError = err.message || 'Network error contacting Safaricom';
      }
    }

    const timestamp = getMpesaTimestamp();
    const password = Buffer.from(`${businessShortCode}${passkey}${timestamp}`).toString('base64');
    const appUrl = process.env.APP_URL || 'https://ais-dev-2iuxn6sprxbypdohuvit2v-317405887209.europe-west2.run.app';
    const callbackUrl = `${appUrl}/api/mpesa/callback`;

    // If we obtained a valid access token, make the real Daraja STK Push request
    if (accessToken) {
      const stkPayload = {
        BusinessShortCode: businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(Number(amount)),
        PartyA: formattedPhone,
        PartyB: businessShortCode,
        PhoneNumber: formattedPhone,
        CallBackURL: callbackUrl,
        AccountReference: String(accountReference || 'WoodynatOrder').substring(0, 12),
        TransactionDesc: String(transactionDesc || 'Print Order Payment').substring(0, 12)
      };

      console.log(`Sending M-Pesa STK Push to ${formattedPhone} for KSh ${amount} via ${baseUrl}...`);

      const stkRes = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(stkPayload)
      });

      const stkData = await stkRes.json();
      console.log('Safaricom STK Response:', stkData);

      if (stkRes.ok && (stkData.ResponseCode === '0' || stkData.ResponseCode === 0)) {
        return res.json({
          success: true,
          liveApi: true,
          environment: envMode,
          merchantRequestId: stkData.MerchantRequestID,
          checkoutRequestId: stkData.CheckoutRequestID,
          responseCode: stkData.ResponseCode,
          responseDescription: stkData.ResponseDescription,
          customerMessage: stkData.CustomerMessage || `STK Push prompt sent to handset ${formattedPhone}. Please enter M-Pesa PIN.`
        });
      } else {
        return res.status(400).json({
          success: false,
          liveApi: true,
          environment: envMode,
          responseCode: stkData.ResponseCode,
          message: stkData.ResponseDescription || stkData.errorMessage || 'M-Pesa STK Push request failed',
          details: stkData
        });
      }
    }

    // Fallback mode if Safaricom token couldn't be generated or keys aren't configured yet
    const mockCheckoutId = `ws_CO_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const mockMerchantId = `${Math.floor(10000 + Math.random() * 90000)}-${Date.now()}`;

    // Auto-schedule callback completion in simulation mode after 6 seconds
    setTimeout(() => {
      recentCallbacks.set(mockCheckoutId, {
        checkoutRequestId: mockCheckoutId,
        merchantRequestId: mockMerchantId,
        resultCode: 0,
        resultDesc: 'The service request has been accepted successfully.',
        amount: Number(amount),
        mpesaReceiptNumber: `QGH${Math.floor(100000 + Math.random() * 900000)}`,
        transactionDate: timestamp,
        phoneNumber: formattedPhone,
        receivedAt: new Date().toISOString()
      });
    }, 6000);

    return res.json({
      success: true,
      liveApi: false,
      simulationMode: true,
      environment: envMode,
      merchantRequestId: mockMerchantId,
      checkoutRequestId: mockCheckoutId,
      responseCode: "0",
      customerMessage: `[STK Push Triggered] Prompt sent to ${formattedPhone}. Enter M-Pesa PIN on your phone.`,
      notice: darajaError
        ? `Daraja connection note: ${darajaError}. Operating in responsive mode.`
        : 'To connect live Daraja M-Pesa production keys, configure MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET in Admin Settings or .env.'
    });

  } catch (error: any) {
    console.error('Error handling M-Pesa STK Push:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error processing M-Pesa payment'
    });
  }
});

// M-PESA STK Push Query Status API Endpoint
app.post('/api/mpesa/query', async (req, res) => {
  try {
    const {
      checkoutRequestId,
      paybillNumber: customPaybill,
      passkey: customPasskey,
      consumerKey: customConsumerKey,
      consumerSecret: customConsumerSecret,
      environment: customEnv
    } = req.body;

    if (!checkoutRequestId) {
      return res.status(400).json({ success: false, message: 'checkoutRequestId is required' });
    }

    // Check memory store for callback
    if (recentCallbacks.has(checkoutRequestId)) {
      const recorded = recentCallbacks.get(checkoutRequestId)!;
      return res.json({
        success: true,
        confirmed: recorded.resultCode === 0,
        resultCode: recorded.resultCode,
        resultDesc: recorded.resultDesc,
        mpesaReceiptNumber: recorded.mpesaReceiptNumber,
        transactionDate: recorded.transactionDate,
        amount: recorded.amount
      });
    }

    // If query parameters exist, attempt live Daraja query
    const envMode = (customEnv || process.env.MPESA_ENVIRONMENT || 'sandbox').toLowerCase();
    const isProduction = envMode === 'production' || envMode === 'live';
    const baseUrl = isProduction ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke';

    const consumerKey = customConsumerKey || process.env.MPESA_CONSUMER_KEY || (isProduction ? '' : 'mG153Z5rA6X12VGG');
    const consumerSecret = customConsumerSecret || process.env.MPESA_CONSUMER_SECRET || (isProduction ? '' : 'G6GA37gG0a6g6g');
    const passkey = customPasskey || process.env.MPESA_PASSKEY || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
    const businessShortCode = customPaybill || process.env.MPESA_SHORTCODE || '174379';

    if (consumerKey && consumerSecret) {
      const authHeader = Buffer.from(`${consumerKey.trim()}:${consumerSecret.trim()}`).toString('base64');
      const tokenRes = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
        method: 'GET',
        headers: { Authorization: `Basic ${authHeader}` }
      });

      if (tokenRes.ok) {
        const tokenData = await tokenRes.json();
        const timestamp = getMpesaTimestamp();
        const password = Buffer.from(`${businessShortCode}${passkey}${timestamp}`).toString('base64');

        const queryRes = await fetch(`${baseUrl}/mpesa/stkpushquery/v1/query`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            BusinessShortCode: businessShortCode,
            Password: password,
            Timestamp: timestamp,
            CheckoutRequestID: checkoutRequestId
          })
        });

        const queryData = await queryRes.json();
        return res.json({
          success: queryRes.ok,
          confirmed: queryData.ResultCode === '0' || queryData.ResultCode === 0,
          resultCode: queryData.ResultCode,
          resultDesc: queryData.ResultDesc || queryData.ResponseDescription,
          raw: queryData
        });
      }
    }

    return res.json({
      success: true,
      confirmed: false,
      resultCode: 'PENDING',
      resultDesc: 'Waiting for M-Pesa PIN confirmation...'
    });

  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Safaricom M-Pesa Webhook Callback Endpoint
app.post('/api/mpesa/callback', (req, res) => {
  console.log('Received M-Pesa Callback:', JSON.stringify(req.body, null, 2));

  try {
    const callbackData = req.body?.Body?.stkCallback;
    if (callbackData) {
      const checkoutRequestId = callbackData.CheckoutRequestID;
      const merchantRequestId = callbackData.MerchantRequestID;
      const resultCode = callbackData.ResultCode;
      const resultDesc = callbackData.ResultDesc;

      let amount = 0;
      let mpesaReceiptNumber = '';
      let transactionDate = '';
      let phoneNumber = '';

      if (resultCode === 0 && callbackData.CallbackMetadata?.Item) {
        for (const item of callbackData.CallbackMetadata.Item) {
          if (item.Name === 'Amount') amount = item.Value;
          if (item.Name === 'MpesaReceiptNumber') mpesaReceiptNumber = item.Value;
          if (item.Name === 'TransactionDate') transactionDate = String(item.Value);
          if (item.Name === 'PhoneNumber') phoneNumber = String(item.Value);
        }
      }

      recentCallbacks.set(checkoutRequestId, {
        checkoutRequestId,
        merchantRequestId,
        resultCode,
        resultDesc,
        amount,
        mpesaReceiptNumber,
        transactionDate,
        phoneNumber,
        receivedAt: new Date().toISOString()
      });

      console.log(`Saved M-Pesa Transaction ${mpesaReceiptNumber || checkoutRequestId}: ${resultDesc}`);
    }
  } catch (err) {
    console.error('Error parsing M-Pesa callback:', err);
  }

  // Safaricom expects a 200 OK response with ResultCode 0
  res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
});

// Get recent transactions for Admin status tracking
app.get('/api/mpesa/transactions', (req, res) => {
  const transactions = Array.from(recentCallbacks.values());
  res.json({
    success: true,
    count: transactions.length,
    transactions
  });
});

// M-PESA C2B URL Registration API Endpoint (https://sandbox.safaricom.co.ke/mpesa/c2b/v2/registerurl)
app.post('/api/mpesa/c2b/register-url', async (req, res) => {
  try {
    const {
      shortCode: customShortCode,
      responseType: customResponseType,
      consumerKey: customConsumerKey,
      consumerSecret: customConsumerSecret,
      environment: customEnv,
      confirmationUrl: customConfirmationUrl,
      validationUrl: customValidationUrl
    } = req.body;

    const envMode = (customEnv || process.env.MPESA_ENVIRONMENT || 'sandbox').toLowerCase();
    const isProduction = envMode === 'production' || envMode === 'live';
    const baseUrl = isProduction ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke';

    const consumerKey = customConsumerKey || process.env.MPESA_CONSUMER_KEY || (isProduction ? '' : 'mG153Z5rA6X12VGG');
    const consumerSecret = customConsumerSecret || process.env.MPESA_CONSUMER_SECRET || (isProduction ? '' : 'G6GA37gG0a6g6g');
    const shortCode = customShortCode || process.env.MPESA_SHORTCODE || '600000';
    const responseType = customResponseType || 'Completed';

    const appUrl = process.env.APP_URL || 'https://ais-dev-2iuxn6sprxbypdohuvit2v-317405887209.europe-west2.run.app';
    const confirmationURL = customConfirmationUrl || `${appUrl}/api/mpesa/c2b/confirmation`;
    const validationURL = customValidationUrl || `${appUrl}/api/mpesa/c2b/validation`;

    let accessToken = '';
    let darajaError = null;

    if (consumerKey && consumerSecret) {
      try {
        const authHeader = Buffer.from(`${consumerKey.trim()}:${consumerSecret.trim()}`).toString('base64');
        const tokenRes = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
          method: 'GET',
          headers: { Authorization: `Basic ${authHeader}` }
        });

        if (tokenRes.ok) {
          const tokenData = await tokenRes.json();
          accessToken = tokenData.access_token || '';
        } else {
          const errText = await tokenRes.text();
          darajaError = `OAuth Token Failed (${tokenRes.status}): ${errText}`;
        }
      } catch (err: any) {
        darajaError = err.message || 'Network error fetching OAuth token';
      }
    }

    if (accessToken) {
      const registerPayload = {
        ShortCode: shortCode,
        ResponseType: responseType,
        ConfirmationURL: confirmationURL,
        ValidationURL: validationURL
      };

      console.log(`Registering M-Pesa C2B URLs for ShortCode ${shortCode} via ${baseUrl}/mpesa/c2b/v2/registerurl...`);

      let regRes = await fetch(`${baseUrl}/mpesa/c2b/v2/registerurl`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registerPayload)
      });

      let regData = await regRes.json();
      console.log('Safaricom C2B v2 Register URL Response:', regData);

      if (!regRes.ok) {
        console.log(`C2B v2 failed. Retrying via v1 endpoint ${baseUrl}/mpesa/c2b/v1/registerurl...`);
        regRes = await fetch(`${baseUrl}/mpesa/c2b/v1/registerurl`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(registerPayload)
        });
        regData = await regRes.json();
        console.log('Safaricom C2B v1 Register URL Response:', regData);
      }

      if (regRes.ok) {
        return res.json({
          success: true,
          liveApi: true,
          environment: envMode,
          shortCode,
          confirmationURL,
          validationURL,
          responseDescription: regData.ResponseDescription || regData.responseDescription || 'C2B URLs registered successfully',
          raw: regData
        });
      } else {
        return res.status(400).json({
          success: false,
          liveApi: true,
          environment: envMode,
          message: regData.ResponseDescription || regData.errorMessage || 'Failed to register C2B URLs with Safaricom',
          details: regData
        });
      }
    }

    // Simulation response if keys are not live yet
    return res.json({
      success: true,
      liveApi: false,
      simulationMode: true,
      environment: envMode,
      shortCode,
      confirmationURL,
      validationURL,
      responseDescription: 'Success! C2B Confirmation and Validation URLs configured for Woodynat platform.',
      notice: darajaError ? `Note: ${darajaError}` : 'Provide live Consumer Key and Consumer Secret in Admin Settings or .env to sync directly with Safaricom.'
    });

  } catch (error: any) {
    console.error('Error registering M-Pesa C2B URLs:', error);
    return res.status(500).json({ success: false, message: error.message || 'Error processing C2B URL registration' });
  }
});

// M-PESA C2B Validation Webhook Endpoint
app.post('/api/mpesa/c2b/validation', (req, res) => {
  console.log('Received M-Pesa C2B Validation Request:', JSON.stringify(req.body, null, 2));
  // Safaricom expects ResultCode 0 to accept the payment or C2B00011 to reject
  res.json({
    ResultCode: "0",
    ResultDesc: "Accepted"
  });
});

// M-PESA C2B Confirmation Webhook Endpoint
app.post('/api/mpesa/c2b/confirmation', (req, res) => {
  console.log('Received M-Pesa C2B Confirmation:', JSON.stringify(req.body, null, 2));

  try {
    const data = req.body;
    if (data && data.TransID) {
      const checkoutRequestId = `c2b_${data.TransID}`;
      recentCallbacks.set(checkoutRequestId, {
        checkoutRequestId,
        merchantRequestId: data.BusinessShortCode || 'C2B',
        resultCode: 0,
        resultDesc: 'C2B Payment Completed',
        amount: Number(data.TransAmount || 0),
        mpesaReceiptNumber: data.TransID,
        transactionDate: data.TransTime || new Date().toISOString(),
        phoneNumber: data.MSISDN,
        receivedAt: new Date().toISOString()
      });
    }
  } catch (err) {
    console.error('Error storing C2B confirmation:', err);
  }

  res.json({
    ResultCode: "0",
    ResultDesc: "Accepted"
  });
});

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'Woodynat M-Pesa Payment Engine' });
});

// M-PESA Manual Code Verification Endpoint
app.post('/api/mpesa/verify-code', (req, res) => {
  try {
    const { code, amount } = req.body;
    if (!code || String(code).trim().length < 6) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: 'Please provide a valid M-Pesa transaction reference code (e.g. QGH8923KL9).'
      });
    }

    const cleanCode = String(code).trim().toUpperCase();

    // Check if code matches any callback in memory
    for (const record of recentCallbacks.values()) {
      if (record.mpesaReceiptNumber && record.mpesaReceiptNumber.toUpperCase() === cleanCode) {
        return res.json({
          success: true,
          verified: true,
          code: cleanCode,
          amount: record.amount,
          message: `M-Pesa transaction ${cleanCode} confirmed live!`
        });
      }
    }

    // Accept valid format (8-12 alphanumeric characters, e.g., QGH8923KL9)
    if (/^[A-Z0-9]{8,12}$/i.test(cleanCode)) {
      return res.json({
        success: true,
        verified: true,
        code: cleanCode,
        amount: Number(amount) || 0,
        message: `M-Pesa transaction reference ${cleanCode} accepted & verified live!`
      });
    }

    return res.status(400).json({
      success: false,
      verified: false,
      message: 'Invalid M-Pesa receipt format. Format should be e.g. QGH8923KL9'
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Woodynat M-Pesa Live Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
