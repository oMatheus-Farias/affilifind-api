import { SendPromotionsToChannelsUseCase } from '@application/usecases/shopee/SendPromotionsToChannelsUseCase';
import { PromotionRepository } from '@infra/database/prisma/repositories/PromotionRepository';
import { TelegramGateway } from '@infra/gateways/TelegramGateway';
import { Injectable } from '@kermel/decorators/Injectable';

import { formatTelegramPromotionMessage } from './formatTelegramPromotionMessage';

@Injectable()
export class DispatchPromotionsToTelegramUseCase {
  constructor(
    private readonly sendPromotionsToChannelsUseCase: SendPromotionsToChannelsUseCase,
    private readonly telegramGateway: TelegramGateway,
    private readonly promotionRepository: PromotionRepository,
  ) {}

  async execute(): Promise<DispatchPromotionsToTelegramUseCase.Output> {
    const batch = await this.sendPromotionsToChannelsUseCase.execute();

    if (batch.products.length === 0) {
      return {
        sentCount: 0,
        message: batch.message,
        products: [],
        telegramMessageId: null,
      };
    }

    const telegramMessage = formatTelegramPromotionMessage(batch.products);
    const result = await this.telegramGateway.sendChannelMessage({ text: telegramMessage });

    if (!result.ok) {
      throw new Error('Telegram gateway rejected the message.');
    }

    await this.promotionRepository.markAsSent({
      ids: batch.promotionIds,
    });

    return {
      sentCount: batch.products.length,
      message: 'Achadinhos enviados com sucesso para o Telegram.',
      products: batch.products,
      telegramMessageId: result.messageId ?? null,
    };
  }
}

export namespace DispatchPromotionsToTelegramUseCase {
  export type Output = {
    sentCount: number;
    message: string;
    products: SendPromotionsToChannelsUseCase.Output['products'];
    telegramMessageId: number | null;
  };
}
