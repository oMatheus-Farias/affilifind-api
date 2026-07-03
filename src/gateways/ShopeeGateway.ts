import axios from 'axios';
import crypto from 'crypto';

export class ShopeeGateway {
  private readonly apiUrl: string;

  constructor() {
    this.apiUrl = 'https://open-api.affiliate.shopee.com.br/v2/api';
  }

  /**
   * Auxiliar privado para gerar a assinatura criptográfica HMAC-SHA256
   * obrigatória em todas as chamadas da API de Afiliados da Shopee.
   */
  private generateHeaderSignature({
    timestamp,
    payload,
    appId,
    secret,
  }: {
    timestamp: number;
    payload: string;
    appId: string;
    secret: string;
  }): string {
    const factor = `${appId}${timestamp}${payload}${secret}`;
    return crypto.createHash('sha256').update(factor).digest('hex');
  }

  /**
   * Varre a API de Afiliados buscando produtos por palavra-chave e aplicando
   * filtros iniciais para identificar oportunidades dos "Achadinhos".
   */
  public async searchPromotions({
    keyword,
    appId,
    secret,
  }: {
    keyword: string;
    appId: string;
    secret: string;
  }): Promise<ShopeeGateway.ShopeeProductPromotionOutput[]> {
    const timestamp = Math.floor(Date.now() / 1000);

    // Query oficial em GraphQL exigida pela Open API de Afiliados da Shopee
    const graphqlQuery = {
      query: `
        query getProductList($keyword: String, $limit: Int) {
          productItems(keyword: $keyword, limit: $limit) {
            nodes {
              itemId
              productName
              price
              priceMin
              priceMax
              image
              productLink
            }
          }
        }
      `,
      variables: {
        keyword: keyword,
        limit: 10, // Puxa 10 itens por execução para o robô avaliar
      },
    };

    const payloadString = JSON.stringify(graphqlQuery);
    const signature = this.generateHeaderSignature({
      timestamp,
      payload: payloadString,
      appId,
      secret,
    });

    try {
      const { data } = await axios.post(this.apiUrl, payloadString, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `SHA256 Credential=${appId}, Timestamp=${timestamp}, Signature=${signature}`,
          'User-Agent': 'AffiliFind-App/1.0.0 (node-axios)',
        },
      });

      // Validação interna do retorno GraphQL da Shopee
      if (data.errors) {
        throw new Error(`Erros retornados pelo GraphQL da Shopee: ${JSON.stringify(data.errors)}`);
      }

      const items = data.data?.productItems?.nodes || [];

      // Mapeia e normaliza os dados vindos da Shopee para bater certinho com o seu Modelo Promotion do Prisma
      return items.map((item: any) => {
        const currentPrice = item.price || item.priceMin || 0;

        return {
          externalId: String(item.itemId),
          title: item.productName,
          currentPrice: Number(currentPrice),
          originalPrice: null,
          discountPercentage: null,
          imageUrl: item.image || '',
          affiliateUrl: item.productLink || '',
          platform: 'shopee',
        };
      });
    } catch (error: any) {
      const errorDetail = error.response?.data
        ? JSON.stringify(error.response.data)
        : error.message;

      throw new Error(`Erro na chamada do ShopeeGateway: ${errorDetail}`, { cause: error });
    }
  }
}

export namespace ShopeeGateway {
  export type ShopeeProductPromotionOutput = {
    externalId: string;
    title: string;
    currentPrice: number;
    originalPrice: number | null;
    discountPercentage: number | null;
    imageUrl: string;
    affiliateUrl: string;
    platform: string;
  };
}
