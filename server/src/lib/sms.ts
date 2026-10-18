/**
 * SMS delivery. Configure SMS_API_URL + SMS_API_KEY for a real provider.
 * In development, messages are logged if no provider is set.
 */
export async function sendSms(phone: string, message: string): Promise<void> {
  const url = process.env.SMS_API_URL;
  const key = process.env.SMS_API_KEY;

  if (url && key) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to: phone, message }),
    });
    if (!res.ok) {
      throw new Error(`SMS provider error: ${res.status}`);
    }
    return;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('SMS provider not configured');
  }

  console.log(`[dev SMS] to=${phone} ${message}`);
}
