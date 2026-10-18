/**
 * KagoPay Integration for LocEasy
 * Supports Yas Togo and Moov Togo mobile money payments
 */

const KAGOPAY_BASE_URL = process.env.KAGOPAY_MODE === 'production'
  ? 'https://api.kagoservices.com'
  : 'https://sandbox.kagoservices.com';

const KAGOPAY_API_KEY = process.env.KAGOPAY_API_KEY;

export interface KagoPayPaymentRequest {
  phone: string;
  amount: number;
  description: string;
  reference?: string;
}

export interface KagoPayPaymentResponse {
  status: 'pending' | 'success' | 'failed';
  reference: string;
  operator: 'yas' | 'moov';
  message?: string;
}

/**
 * Initiate a mobile money payment via KagoPay
 */
export async function initiateKagoPayPayment(
  data: KagoPayPaymentRequest
): Promise<KagoPayPaymentResponse> {
  try {
    const response = await fetch(`${KAGOPAY_BASE_URL}/api/v1/initiate.php`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KAGOPAY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: data.phone,
        amount: data.amount,
        description: data.description,
        reference: data.reference,
      }),
    });

    if (!response.ok) {
      throw new Error(`KagoPay API error: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('KagoPay payment initiation error:', error);
    throw error;
  }
}

/**
 * Check payment status
 */
export async function checkKagoPayStatus(
  reference: string
): Promise<KagoPayPaymentResponse> {
  try {
    const response = await fetch(`${KAGOPAY_BASE_URL}/api/v1/status.php`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KAGOPAY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reference }),
    });

    if (!response.ok) {
      throw new Error(`KagoPay API error: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('KagoPay status check error:', error);
    throw error;
  }
}

/**
 * Format phone number for Togo (add 228 prefix if missing)
 */
export function formatTogoPhone(phone: string): string {
  // Keep digits only so local and international formats normalize consistently.
  const cleaned = phone.replace(/\D/g, '');

  // If starts with 0, replace with 228
  if (cleaned.startsWith('0')) {
    return '228' + cleaned.substring(1);
  }

  // If already has 228 prefix, return as is
  if (cleaned.startsWith('228')) {
    return cleaned;
  }

  // If 8 digits, add 228 prefix
  if (cleaned.length === 8) {
    return '228' + cleaned;
  }

  return cleaned;
}
