import { env } from '@shared/config/env';
import cron, { type ScheduledTask } from 'node-cron';

import { runTelegramPromotionsJob } from './telegramPromotionsJob';

export function startTelegramPromotionsScheduler(): TelegramPromotionsScheduler {
  const task: ScheduledTask = cron.schedule(
    env.TELEGRAM_PROMOTIONS_CRON,
    async () => {
      // eslint-disable-next-line no-console
      console.log('[Telegram Scheduler] Running scheduled promotions job...');

      try {
        await runTelegramPromotionsJob();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[Telegram Scheduler] job failed:', error);
      }
    },
    {
      name: 'telegram-promotions',
      timezone: env.TELEGRAM_PROMOTIONS_TIMEZONE,
      noOverlap: true,
      unref: true,
    },
  );

  task.start();

  return {
    task,
    stop() {
      task.stop();
    },
    start() {
      task.start();
    },
    runNow() {
      return task.execute();
    },
  };
}

export type TelegramPromotionsScheduler = {
  task: ScheduledTask;
  start(): void;
  stop(): void;
  runNow(): Promise<unknown>;
};
