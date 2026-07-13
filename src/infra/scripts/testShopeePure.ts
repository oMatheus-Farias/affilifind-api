import { env } from '@shared/config/env.js';
import axios from 'axios';
import crypto from 'crypto';

// Ajustado para bater com as chaves corretas do seu env config
const appId = env.SHOPEE_APP_ID;
const secret = env.SHOPEE_SECRET;
const apiUrl = env.SHOPEE_API_URL;

async function runTest() {
  const timestamp = Math.floor(Date.now() / 1000);

  const graphqlQuery = {
    query:
      'query Fetch($keyword: String, $limit: Int) { productOfferV2(keyword: $keyword, limit: $limit) { nodes { itemId productName price imageUrl productLink } } }',
    variables: {
      keyword: 'makeup',
      limit: 5,
    },
  };

  // String pura imutável para a assinatura e para o corpo do Axios
  const payloadString = JSON.stringify(graphqlQuery);
  const factor = `${appId}${timestamp}${payloadString}${secret}`;
  const signature = crypto.createHash('sha256').update(factor).digest('hex');

  console.log('--- EXECUTANDO CONSULTA COM AXIOS V2 ---');

  try {
    // Forçando o Axios a enviar a string bruta sem remontar o JSON
    const response = await axios.post(apiUrl, payloadString, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `SHA256 Credential=${appId}, Timestamp=${timestamp}, Signature=${signature}`,
        'User-Agent': 'AffiliFind-App/1.0.0',
      },
    });

    console.log('--- SERVER RESPONSE ---');
    console.log('HTTP Status:', response.status);
    console.log('Body:', JSON.stringify(response.data, null, 2));
    console.log('-----------------------');
  } catch (error: any) {
    console.error('❌ ERRO OPERACIONAL COM AXIOS:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

runTest();
