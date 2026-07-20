import { SyncShopeeProductsUseCase } from '@application/usecases/shopee/SyncShopeeProductsUseCase';
import { Registry } from '@kermel/di/Registry';

export async function runShopeeSyncJob(input?: ShopeeSyncJob.Input) {
  const useCase = Registry.getInstance().resolve(SyncShopeeProductsUseCase);

  const result = await useCase.execute(input);

  // eslint-disable-next-line no-console
  console.log(
    `[Shopee Sync Job] received=${result.summary.itemsReceivedFromApi} created=${result.summary.itemsCreatedInDb} updated=${result.summary.itemsUpdatedInDb} saved=${result.foundProducts.length}`,
  );

  return result;
}

export namespace ShopeeSyncJob {
  export type Input = SyncShopeeProductsUseCase.Input;
}
