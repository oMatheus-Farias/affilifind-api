import { DispatchPromotionsToTelegramUseCase } from '@application/usecases/telegram/DispatchPromotionsToTelegramUseCase';
import { prismaClient } from '@infra/clients/prismaClient';
import { Registry } from '@kermel/di/Registry';

export async function runTelegramPromotionsJob() {
  const useCase = Registry.getInstance().resolve(DispatchPromotionsToTelegramUseCase);

  const result = await useCase.execute();

  // eslint-disable-next-line no-console
  console.log(
    `[Telegram Job] sent=${result.sentCount} telegramMessageId=${result.telegramMessageId ?? 'n/a'} message="${result.message}"`,
  );

  return result;
}

export async function shutdownTelegramPromotionsJob() {
  await prismaClient.$disconnect();
}
