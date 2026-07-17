import { Injectable } from '@kermel/decorators/Injectable';

import { env } from './env';

@Injectable()
export class AppConfig {
  readonly database: AppConfig.Database;

  readonly shopee: AppConfig.Shopee;

  readonly telegram: AppConfig.Telegram;

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

    this.telegram = {
      apiUrl: env.TELEGRAM_API_URL,
      botToken: env.TELEGRAM_BOT_TOKEN,
      channelChatId: env.TELEGRAM_CHANNEL_CHAT_ID,
      promotionsCron: env.TELEGRAM_PROMOTIONS_CRON,
      promotionsTimezone: env.TELEGRAM_PROMOTIONS_TIMEZONE,
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

  export type Telegram = {
    apiUrl: string;
    botToken: string;
    channelChatId: string;
    promotionsCron: string;
    promotionsTimezone: string;
  };
}
