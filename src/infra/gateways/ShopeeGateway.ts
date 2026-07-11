import { env } from '@shared/config/env.js';
import axios from 'axios';
import crypto from 'crypto';

export class ShopeeGateway {
  private readonly apiUrl: string;
  private readonly appId: string;
  private readonly secret: string;

  constructor() {
    this.apiUrl = env.SHOPEE_API_URL;
    this.appId = env.SHOPEE_APP_ID;
    this.secret = env.SHOPEE_SECRET;
  }

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

  public async searchPromotions({
    keyword,
    page = 1,
    limit = 20,
    sortType = 5,
    listType = 1,
  }: {
    keyword: string;
    page?: number;
    limit?: number;
    sortType?: number;
    listType?: number;
  }): Promise<ShopeeGateway.ShopeeProductPromotionOutput[]> {
    const timestamp = Math.floor(Date.now() / 1000);

    const graphqlQuery = {
      query: `query Fetch($keyword: String, $listType: Int, $sortType: Int, $page: Int, $limit: Int) {
        productOfferV2(keyword: $keyword, listType: $listType, sortType: $sortType, page: $page, limit: $limit) {
          nodes {
            itemId
            productName
            productLink
            offerLink
            imageUrl
            priceMin
            priceMax
            priceDiscountRate
            sales
            ratingStar
            commissionRate
            commission
            shopName
          }
          pageInfo {
            page
            limit
            hasNextPage
          }
        }
      }`,
      variables: {
        keyword,
        listType,
        sortType,
        page,
        limit,
      },
    };

    const payloadString = JSON.stringify(graphqlQuery);
    const signature = this.generateHeaderSignature({
      timestamp,
      payload: payloadString,
      appId: this.appId,
      secret: this.secret,
    });

    try {
      const response = await axios.post(this.apiUrl, payloadString, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `SHA256 Credential=${this.appId}, Timestamp=${timestamp}, Signature=${signature}`,
          'User-Agent': 'AffiliFind-App/1.0.0',
        },
      });

      const responseData = response.data;

      if (responseData.errors) {
        throw new Error(`GraphQL Errors from Shopee: ${JSON.stringify(responseData.errors)}`);
      }

      const items = responseData.data?.productOfferV2?.nodes || [];

      return items.map((item: any) => {
        const finalAffiliateUrl = item.offerLink || item.productLink || '';

        return {
          externalId: String(item.itemId),
          title: item.productName,
          currentPrice: Number(item.priceMin || 0),
          maxPrice: Number(item.priceMax || 0),
          discountPercentage: item.priceDiscountRate ? Number(item.priceDiscountRate) : null,
          imageUrl: item.imageUrl || '',
          affiliateUrl: finalAffiliateUrl,
          originalProductUrl: item.productLink || '',
          salesCount: item.sales ? Number(item.sales) : 0,
          rating: item.ratingStar ? Number(item.ratingStar) : 5,
          commissionAmount: item.commission ? Number(item.commission) : 0,
          shopName: item.shopName || '',
          platform: 'shopee',
        };
      });
    } catch (error: any) {
      const errorMessage = error.response
        ? `Status ${error.response.status}: ${JSON.stringify(error.response.data)}`
        : error.message;

      throw new Error(`Error during ShopeeGateway call: ${errorMessage}`, { cause: error });
    }
  }
}

export namespace ShopeeGateway {
  export type ShopeeProductPromotionOutput = {
    externalId: string;
    title: string;
    currentPrice: number;
    maxPrice: number;
    discountPercentage: number | null;
    imageUrl: string;
    affiliateUrl: string;
    originalProductUrl: string;
    salesCount: number;
    rating: number;
    commissionAmount: number;
    shopName: string;
    platform: string;
  };
}
