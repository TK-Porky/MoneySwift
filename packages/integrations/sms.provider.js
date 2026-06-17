const axios = require('axios');

class SmsProvider {
  constructor(config) {
    this.provider = config.provider || 'console'; // twilio, smscm, console
    this.config = config;
  }

  async send(to, message) {
    switch (this.provider) {
      case 'twilio':
        return this.sendTwilio(to, message);
      case 'smscm':
        return this.sendSmsCm(to, message);
      case 'console':
      default:
        console.log(`[SMS-CONSOLE] To: ${to}, Message: ${message}`);
        return { success: true, provider: 'console' };
    }
  }

  async sendTwilio(to, message) {
    const { accountSid, authToken, from } = this.config;
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    
    const params = new URLSearchParams();
    params.append('To', to);
    params.append('From', from);
    params.append('Body', message);

    const response = await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      params.toString(),
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    return response.data;
  }

  async sendSmsCm(to, message) {
    // Example for a generic SMS API like SMS.cm or similar
    const { apiKey, sender } = this.config;
    const response = await axios.post(
      'https://api.sms.cm/v1/send',
      {
        to,
        message,
        sender
      },
      {
        headers: {
          'X-API-KEY': apiKey
        }
      }
    );
    return response.data;
  }
}

module.exports = SmsProvider;
