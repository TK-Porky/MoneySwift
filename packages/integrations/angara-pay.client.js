const axios = require('axios');
const crypto = require('crypto');

class AngaraPayClient {
  constructor(config) {
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
    this.webhookSecret = config.webhookSecret;
  }

  async initiatePayment({ amount, currency, email, reference, callbackUrl }) {
    const response = await axios.post(
      `${this.baseUrl}/v1/payments`,
      {
        amount,
        currency: currency || 'XAF',
        email,
        reference,
        callback_url: callbackUrl
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  }

  async verifyPayment(paymentId) {
    const response = await axios.get(
      `${this.baseUrl}/v1/payments/${paymentId}`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      }
    );
    return response.data;
  }

  verifyWebhookSignature(payload, signature) {
    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(JSON.stringify(payload))
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }
}

module.exports = AngaraPayClient;
