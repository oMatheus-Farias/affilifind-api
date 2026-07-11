import { Controller } from '@application/domain/contracts/Controller';
import { SyncShopeeProductsUseCase } from '@application/usecases/shopee/SyncShopeeProductsUseCase';
import { Injectable } from '@kermel/decorators/Injectable';

import { syncShopeeProductsSchema } from './schemas/syncShopeeProductsSchema';

@Injectable()
export class SyncShopeeProductsController extends Controller<
  'private',
  SyncShopeeProductsController.Response
> {
  constructor(private readonly syncShopeeProductsUseCase: SyncShopeeProductsUseCase) {
    super();
  }

  protected override async handle({
    queryParams,
  }: Controller.Request<'private'>): Promise<
    Controller.Response<SyncShopeeProductsController.Response>
  > {
    const { keyword } = queryParams as SyncShopeeProductsController.Request;

    const { keyword: keywordParsed } = syncShopeeProductsSchema.parse({ keyword });

    const { foundProducts, summary } = await this.syncShopeeProductsUseCase.execute({
      keyword: keywordParsed,
    });

    return {
      statusCode: 200,
      body: {
        found_products: foundProducts,
        summary: {
          items_received_from_api: summary.itemsReceivedFromApi,
          items_created_in_db: summary.itemsCreatedInDb,
          items_updated_in_db: summary.itemsUpdatedInDb,
        },
      },
    };
  }
}

export namespace SyncShopeeProductsController {
  export type Request = {
    keyword?: string | null;
  };

  export type Response = {
    found_products: any[];
    summary: {
      items_received_from_api: number;
      items_created_in_db: number;
      items_updated_in_db: number;
    };
  };
}
