import { Injectable } from '@kermel/decorators/Injectable';

import { env } from './env';

@Injectable()
export class AppConfig {
  readonly database: AppConfig.Database;

  readonly shopee: AppConfig.Shopee;

  constructor() {
    this.database = {
      postgres: {
        baseUrl: env.DATABASE_URL,
      },
    };

    this.shopee = {
      apiUrl: env.SHOPEE_API_URL,
      appId: env.SHOPEE_APP_ID,
      secret: env.SHOPEE_SECRET,
    };
  }
}

export namespace AppConfig {
  export type Database = {
    postgres: {
      baseUrl: string;
    };
  };

  export type Shopee = {
    apiUrl: string;
    appId: string;
    secret: string;
  };
}
