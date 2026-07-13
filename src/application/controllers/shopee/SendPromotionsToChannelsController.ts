import { Controller } from '@application/domain/contracts/Controller';
import { SendPromotionsToChannelsUseCase } from '@application/usecases/shopee/SendPromotionsToChannelsUseCase';
import { Injectable } from '@kermel/decorators/Injectable';

@Injectable()
export class SendPromotionsToChannelsController extends Controller<
  'private',
  SendPromotionsToChannelsController.Response
> {
  constructor(private readonly sendPromotionsToChannelsUseCase: SendPromotionsToChannelsUseCase) {
    super();
  }

  protected override async handle(): Promise<
    Controller.Response<SendPromotionsToChannelsController.Response>
  > {
    const { sentCount, message, products } = await this.sendPromotionsToChannelsUseCase.execute();

    return {
      statusCode: 200,
      body: {
        sent_count: sentCount,
        message: message,
        products: products.map((product) => ({
          id: product.id,
          title: product.title,
          current_price: product.currentPrice,
          image_url: product.imageUrl,
          affiliate_url: product.affiliateUrl,
          category: product.category,
        })),
      },
    };
  }
}

export namespace SendPromotionsToChannelsController {
  export type Request = void;

  export type Response = {
    sent_count: number;
    message: string;
    products: Array<{
      id: string;
      title: string;
      current_price: number;
      image_url: string;
      affiliate_url: string;
      category?: string | null | undefined;
    }>;
  };
}
