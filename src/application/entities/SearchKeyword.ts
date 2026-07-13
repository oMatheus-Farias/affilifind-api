import { uuidv7 } from 'uuidv7';

export class SearchKeyword {
  readonly keyword: string;
  readonly category: string;
  readonly id?: string | null;
  readonly isActive?: boolean;
  readonly lastUsedAt?: Date | null;
  readonly createdAt?: Date | null;
  readonly updatedAt?: Date | null;

  constructor(attributes: SearchKeyword.Attributes) {
    this.keyword = attributes.keyword;
    this.category = attributes.category;
    this.id = attributes.id ?? uuidv7();
    this.isActive = attributes.isActive ?? true;
    this.lastUsedAt = attributes.lastUsedAt ?? null;
    this.createdAt = attributes.createdAt ?? new Date();
    this.updatedAt = attributes.updatedAt ?? new Date();
  }
}

export namespace SearchKeyword {
  export type Attributes = {
    keyword: string;
    category: string;
    id?: string | null;
    isActive?: boolean;
    lastUsedAt?: Date | null;
    createdAt?: Date | null;
    updatedAt?: Date | null;
  };
}
