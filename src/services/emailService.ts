import { Order, OrderStatus, EmailDispatchLog } from '../types';

export const ADMIN_OFFICIAL_GMAIL = 'woodynatdesigners12@gmail.com';
export const ADMIN_DISPLAY_NAME = 'Woodynat Designers Limited';

export interface SendEmailResponse {
  success: boolean;
  sender?: string;
  recipient?: string;
  orderId?: string;
  subject?: string;
  messageId?: string;
  status?: 'sent' | 'simulated' | 'failed';
  timestamp?: string;
  message?: string;
  error?: string;
}

/**
 * Dispatch an official order confirmation receipt to the customer's Gmail
 * from woodynatdesigners12@gmail.com
 */
export async function sendOrderConfirmationToGmail(
  order: Order,
  customRecipient?: string,
  customNote?: string
): Promise<SendEmailResponse> {
  const recipient = (customRecipient || order.userEmail || order.customerEmail || '').trim();

  if (!recipient || !recipient.includes('@')) {
    console.warn('[EmailService] Cannot send confirmation: No valid recipient email provided.');
    return {
      success: false,
      error: 'No valid recipient email address found for this order.'
    };
  }

  try {
    const response = await fetch('/api/email/order-confirmation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order,
        recipientEmail: recipient,
        customNote
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Server responded with status ${response.status}`);
    }

    return {
      success: true,
      sender: data.sender || ADMIN_OFFICIAL_GMAIL,
      recipient: data.recipient || recipient,
      orderId: data.orderId || order.id,
      subject: data.subject,
      messageId: data.messageId,
      status: data.status || 'sent',
      timestamp: data.timestamp || new Date().toISOString(),
      message: data.message || `Confirmation email dispatched to ${recipient} from ${ADMIN_OFFICIAL_GMAIL}`
    };
  } catch (error: any) {
    console.error('[EmailService] Failed to send order confirmation email:', error);
    return {
      success: false,
      sender: ADMIN_OFFICIAL_GMAIL,
      recipient,
      orderId: order.id,
      error: error.message || 'Network error while dispatching email'
    };
  }
}

/**
 * Dispatch an order status update email to the customer's Gmail
 * from woodynatdesigners12@gmail.com
 */
export async function sendOrderStatusUpdateToGmail(
  order: Order,
  newStatus: OrderStatus,
  customRecipient?: string,
  customNote?: string
): Promise<SendEmailResponse> {
  const recipient = (customRecipient || order.userEmail || order.customerEmail || '').trim();

  if (!recipient || !recipient.includes('@')) {
    return {
      success: false,
      error: 'No valid recipient email address for status update.'
    };
  }

  try {
    const response = await fetch('/api/email/order-status-update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order,
        newStatus,
        recipientEmail: recipient,
        customNote
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Status update failed: ${response.status}`);
    }

    return {
      success: true,
      sender: data.sender || ADMIN_OFFICIAL_GMAIL,
      recipient: data.recipient || recipient,
      orderId: order.id,
      messageId: data.messageId,
      status: data.status || 'sent',
      timestamp: data.timestamp || new Date().toISOString()
    };
  } catch (error: any) {
    console.error('[EmailService] Failed to send status update email:', error);
    return {
      success: false,
      error: error.message || 'Failed to dispatch status update email'
    };
  }
}

/**
 * Send a test email from woodynatdesigners12@gmail.com to any target address
 */
export async function sendTestGmailNotification(
  targetEmail: string,
  subject?: string,
  message?: string
): Promise<SendEmailResponse> {
  try {
    const response = await fetch('/api/email/send-test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipientEmail: targetEmail,
        subject,
        message
      }),
    });

    const data = await response.json();
    return {
      success: response.ok,
      sender: ADMIN_OFFICIAL_GMAIL,
      recipient: targetEmail,
      messageId: data.messageId,
      status: data.status,
      error: data.error
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Fetch server-side email dispatch logs for admin verification
 */
export async function fetchServerEmailLogs(): Promise<EmailDispatchLog[]> {
  try {
    const response = await fetch('/api/email/logs');
    if (!response.ok) return [];
    const data = await response.json();
    return data.logs || [];
  } catch (err) {
    console.warn('[EmailService] Could not fetch server email logs:', err);
    return [];
  }
}
