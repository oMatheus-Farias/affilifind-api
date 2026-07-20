import { SendPromotionsToChannelsUseCase } from '@application/usecases/shopee/SendPromotionsToChannelsUseCase';
import { PromotionRepository } from '@infra/database/prisma/repositories/PromotionRepository';
import { TelegramGateway } from '@infra/gateways/TelegramGateway';
import { Injectable } from '@kermel/decorators/Injectable';

import {
  buildTelegramPromotionCaption,
  buildTelegramPromotionReplyMarkup,
} from './formatTelegramPromotionMessage';

@Injectable()
export class DispatchPromotionsToTelegramUseCase {
  constructor(
    private readonly sendPromotionsToChannelsUseCase: SendPromotionsToChannelsUseCase,
    private readonly telegramGateway: TelegramGateway,
    private readonly promotionRepository: PromotionRepository,
  ) {}

  async execute(): Promise<DispatchPromotionsToTelegramUseCase.Output> {
    const batch = await this.sendPromotionsToChannelsUseCase.execute();
    const eligibleProducts = batch.products.filter((product) => {
      if (!product.affiliateUrl) {
        return false;
      }

      if (product.originalProductUrl && product.affiliateUrl === product.originalProductUrl) {
        return false;
      }

      return true;
    });

    if (eligibleProducts.length === 0) {
      return {
        sentCount: 0,
        message:
          batch.products.length === 0
            ? batch.message
            : 'Nenhuma promoção elegível com link de afiliado foi encontrada para envio.',
        products: [],
        telegramMessageId: null,
      };
    }

    const sentMessageIds: number[] = [];
    const sentProducts: typeof eligibleProducts = [];

    for (const [, product] of eligibleProducts.entries()) {
      try {
        const result = await this.telegramGateway.sendChannelPhoto({
          photo: product.imageUrl,
          caption: buildTelegramPromotionCaption(product),
          replyMarkup: buildTelegramPromotionReplyMarkup(product.affiliateUrl),
        });

        if (!result.ok) {
          // eslint-disable-next-line no-console
          console.error(`[Telegram] Failed to send promotion "${product.title}".`);
          continue;
        }

        sentProducts.push(product);

        if (result.messageId !== null) {
          sentMessageIds.push(result.messageId);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`[Telegram] Error while sending promotion "${product.title}":`, error);
      }
    }

    if (sentProducts.length > 0) {
      await this.promotionRepository.markAsSent({
        ids: sentProducts.map((product) => product.id),
      });
    }

    return {
      sentCount: sentProducts.length,
      message:
        sentProducts.length === eligibleProducts.length
          ? 'Achadinhos enviados com sucesso para o Telegram.'
          : `${sentProducts.length} achadinhos enviados com sucesso para o Telegram. ${eligibleProducts.length - sentProducts.length} falharam.`,
      products: sentProducts,
      telegramMessageId: sentMessageIds[0] ?? null,
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
