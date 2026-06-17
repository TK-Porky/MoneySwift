const axios = require('axios');

class MtnMomoClient {
  constructor(config) {
    this.baseUrl = config.baseUrl;
    this.subscriptionKey = config.subscriptionKey;
    this.apiUser = config.apiUser;
    this.apiKey = config.apiKey;
    this.environment = config.environment || 'sandbox';
  }

  async getAccessToken() {
    const auth = Buffer.from(`${this.apiUser}:${this.apiKey}`).toString('base64');
    const response = await axios.post(
      `${this.baseUrl}/token/`,
      {},
      {
        headers: {
          'Ocp-Apim-Subscription-Key': this.subscriptionKey,
          'Authorization': `Basic ${auth}`
        }
      }
    );
    return response.data.access_token;
  }

  async requestToPay({ amount, currency, externalId, payerMessage, payeeNote, phoneNumber }) {
    const token = await this.getAccessToken();
    const referenceId = require('crypto').randomUUID();
    
    await axios.post(
      `${this.baseUrl}/collection/v1_0/requesttopay`,
      {
        amount,
        currency,
        externalId,
        payer: {
          partyIdType: 'MSISDN',
          partyId: phoneNumber
        },
        payerMessage,
        payeeNote
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Reference-Id': referenceId,
          'X-Target-Environment': this.environment,
          'Ocp-Apim-Subscription-Key': this.subscriptionKey,
          'Content-Type': 'application/json'
        }
      }
    );

    return referenceId;
  }

  async transfer({ amount, currency, externalId, payerMessage, payeeNote, phoneNumber }) {
    const token = await this.getAccessToken();
    const referenceId = require('crypto').randomUUID();

    await axios.post(
      `${this.baseUrl}/disbursement/v1_0/transfer`,
      {
        amount,
        currency,
        externalId,
        payee: {
          partyIdType: 'MSISDN',
          partyId: phoneNumber
        },
        payerMessage,
        payeeNote
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Reference-Id': referenceId,
          'X-Target-Environment': this.environment,
          'Ocp-Apim-Subscription-Key': this.subscriptionKey,
          'Content-Type': 'application/json'
        }
      }
    );

    return referenceId;
  }

  async checkStatus(referenceId, type = 'collection') {
    const token = await this.getAccessToken();
    const endpoint = type === 'collection' 
      ? `collection/v1_0/requesttopay/${referenceId}`
      : `disbursement/v1_0/transfer/${referenceId}`;

    const response = await axios.get(
      `${this.baseUrl}/${endpoint}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Target-Environment': this.environment,
          'Ocp-Apim-Subscription-Key': this.subscriptionKey
        }
      }
    );

    return response.data;
  }
}

module.exports = MtnMomoClient;
