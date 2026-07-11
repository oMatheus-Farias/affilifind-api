import { uuidv7 } from 'uuidv7';

export class Promotion {
  readonly platform: string;
  readonly externalId: string;
  readonly title: string;
  readonly currentPrice: number;
  readonly imageUrl: string;
  readonly affiliateUrl: string;
  readonly salesCount: number;
  readonly rating: number;
  readonly id?: string | null;
  readonly description?: string | null;
  readonly category?: string | null;
  readonly originalPrice?: number | null;
  readonly maxPrice?: number | null;
  readonly discountPercentage?: number | null;
  readonly originalProductUrl?: string | null;
  readonly commissionAmount?: number | null;
  readonly shopName?: string | null;
  readonly createdAt?: Date | null;
  readonly updatedAt?: Date | null;

  constructor(attributes: Promotion.Attributes) {
    this.platform = attributes.platform;
    this.externalId = attributes.externalId;
    this.title = attributes.title;
    this.currentPrice = attributes.currentPrice;
    this.imageUrl = attributes.imageUrl;
    this.affiliateUrl = attributes.affiliateUrl;
    this.salesCount = attributes.salesCount;
    this.rating = attributes.rating;
    this.id = attributes.id || uuidv7();
    this.description = attributes.description || null;
    this.category = attributes.category || null;
    this.originalPrice = attributes.originalPrice || null;
    this.maxPrice = attributes.maxPrice || null;
    this.discountPercentage = attributes.discountPercentage || null;
    this.originalProductUrl = attributes.originalProductUrl || null;
    this.commissionAmount = attributes.commissionAmount || null;
    this.shopName = attributes.shopName || null;
    this.createdAt = attributes.createdAt || new Date();
    this.updatedAt = attributes.updatedAt || new Date();
  }
}

export namespace Promotion {
  export type Attributes = {
    platform: string;
    externalId: string;
    title: string;
    currentPrice: number;
    imageUrl: string;
    affiliateUrl: string;
    salesCount: number;
    rating: number;
    id?: string | null;
    description?: string | null;
    category?: string | null;
    originalPrice?: number | null;
    maxPrice?: number | null;
    discountPercentage?: number | null;
    originalProductUrl?: string | null;
    commissionAmount?: number | null;
    shopName?: string | null;
    createdAt?: Date | null;
    updatedAt?: Date | null;
  };
}
