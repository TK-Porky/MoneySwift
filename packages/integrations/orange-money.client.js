const axios = require('axios');

class OrangeMoneyClient {
  constructor(config) {
    this.baseUrl = config.baseUrl;
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.merchantKey = config.merchantKey;
  }

  async getAccessToken() {
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    const response = await axios.post(
      `${this.baseUrl}/oauth/v3/token`,
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    return response.data.access_token;
  }

  async requestToPay({ amount, currency, orderId, phoneNumber }) {
    const token = await this.getAccessToken();
    
    const response = await axios.post(
      `${this.baseUrl}/orange-money-webpay/dev/v1/webpayment`,
      {
        merchant_key: this.merchantKey,
        currency: currency || 'XAF',
        order_id: orderId,
        amount: amount,
        return_url: 'https://moneyswift.com/callback/orange/return',
        cancel_url: 'https://moneyswift.com/callback/orange/cancel',
        notif_url: 'https://moneyswift.com/callback/orange/notif',
        lang: 'fr',
        reference: 'MoneySwift Payment'
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data; // Usually contains pay_token and payment_url
  }

  async checkStatus(payToken) {
    const token = await this.getAccessToken();

    const response = await axios.get(
      `${this.baseUrl}/orange-money-webpay/dev/v1/transactionstatus/${payToken}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return response.data;
  }
}

module.exports = OrangeMoneyClient;
