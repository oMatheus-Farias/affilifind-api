import { Injectable } from '@kermel/decorators/Injectable';
import { AppConfig } from '@shared/config/AppConfig';
import axios from 'axios';
import crypto from 'crypto';

@Injectable()
export class ShopeeGateway {
  constructor(private readonly appConfig: AppConfig) {}

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
    sortType = 2,
    listType = 2,
  }: {
    keyword: string;
    page?: number;
    limit?: number;
    sortType?: number;
    listType?: number;
  }): Promise<ShopeeGateway.Output[]> {
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
      appId: this.appConfig.shopee.appId,
      secret: this.appConfig.shopee.secret,
    });

    try {
      const { data } = await axios.post<ShopeeGateway.ShopeeProductPromotionOutput>(
        this.appConfig.shopee.apiUrl,
        payloadString,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `SHA256 Credential=${this.appConfig.shopee.appId}, Timestamp=${timestamp}, Signature=${signature}`,
            'User-Agent': 'AffiliFind-App/1.0.0',
          },
        },
      );

      const items = data?.data?.productOfferV2?.nodes || [];

      return items.map((item) => {
        const finalAffiliateUrl = item.offerLink || item.productLink || '';

        return {
          external_id: String(item.itemId),
          title: item.productName,
          current_price: Number(item.priceMin || 0),
          max_price: Number(item.priceMax || 0),
          discount_percentage: item.priceDiscountRate ? Number(item.priceDiscountRate) : null,
          image_url: item.imageUrl || '',
          affiliate_url: finalAffiliateUrl,
          original_product_url: item.productLink || '',
          sales_count: item.sales ? Number(item.sales) : 0,
          rating: item.ratingStar ? Number(item.ratingStar) : 5,
          commission_amount: item.commission ? Number(item.commission) : 0,
          shop_name: item.shopName || '',
          platform: 'shopee',
        };
      });
    } catch (error) {
      throw new Error('Error during ShopeeGateway', { cause: error });
    }
  }
}

export namespace ShopeeGateway {
  export type Output = {
    external_id: string;
    title: string;
    current_price: number;
    max_price: number;
    discount_percentage: number | null;
    image_url: string;
    affiliate_url: string;
    original_product_url: string;
    sales_count: number;
    rating: number;
    commission_amount: number;
    shop_name: string;
    platform: string;
  };

  export type ShopeeProductPromotionOutput = {
    data: {
      productOfferV2: {
        nodes: {
          itemId: number;
          productName: string;
          productLink: string;
          offerLink: string;
          imageUrl: string;
          priceMin: string;
          priceMax: string;
          priceDiscountRate: number;
          sales: number;
          ratingStar: string;
          commissionRate: string;
          commission: string;
          shopName: string;
        }[];
        pageInfo: {
          page: number;
          limit: number;
          hasNextPage: boolean;
        };
      };
    };
  };
}
