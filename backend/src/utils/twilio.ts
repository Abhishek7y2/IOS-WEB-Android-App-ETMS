import twilio from 'twilio';

let twilioClient: twilio.Twilio | null = null;

try {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (accountSid && authToken) {
    twilioClient = twilio(accountSid, authToken);
  } else {
    console.warn('⚠️ Twilio SID or Auth Token missing. SMS features will be disabled.');
  }
} catch (error) {
  console.error('Error initializing Twilio client:', error);
}

/**
 * Sends an OTP via SMS using Twilio
 * @param countryCode The country code (e.g., '+91' or '91')
 * @param mobileNumber The mobile number (e.g., '9876543210')
 * @param otp The one-time password to send
 * @param purpose The purpose of the OTP (e.g., 'Verification', 'Reset', 'Login')
 */
export async function sendSmsOtp(countryCode: string, mobileNumber: string, otp: string, purpose: string = 'Verification'): Promise<void> {
  if (!twilioClient) {
    console.warn('⚠️ Twilio is not configured. Skipping SMS.');
    return;
  }

  const fromPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
  if (!fromPhoneNumber) {
    console.warn('⚠️ TWILIO_PHONE_NUMBER is not set in environment variables. Skipping SMS.');
    return;
  }

  // Ensure country code has a '+'
  let formattedCountryCode = countryCode.trim();
  if (formattedCountryCode && !formattedCountryCode.startsWith('+')) {
    formattedCountryCode = `+${formattedCountryCode}`;
  }

  // If no country code is provided, fallback to standard or assume it's included in mobileNumber
  const to = formattedCountryCode ? `${formattedCountryCode}${mobileNumber.trim()}` : mobileNumber.trim();

  try {
    const message = await twilioClient.messages.create({
      body: `Your Employee Task Manager ${purpose} code is: ${otp}. Do not share this code with anyone.`,
      from: fromPhoneNumber,
      to,
    });
    console.log(`\n📱 [SMS] Sent ${purpose} OTP to ${to}. Message SID: ${message.sid}\n`);
  } catch (error) {
    console.error(`\n❌ [SMS] Failed to send ${purpose} OTP to ${to}:`, error);
  }
}
