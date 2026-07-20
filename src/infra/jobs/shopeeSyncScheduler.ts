import { env } from '@shared/config/env';
import cron, { type ScheduledTask } from 'node-cron';

import { runShopeeSyncJob } from './shopeeSyncJob';

export function startShopeeSyncScheduler(): ShopeeSyncScheduler {
  const task: ScheduledTask = cron.schedule(
    env.SHOPEE_SYNC_CRON,
    async () => {
      // eslint-disable-next-line no-console
      console.log('[Shopee Sync Scheduler] Running scheduled sync job...');

      try {
        await runShopeeSyncJob();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[Shopee Sync Scheduler] job failed:', error);
      }
    },
    {
      name: 'shopee-sync',
      timezone: env.SHOPEE_SYNC_TIMEZONE,
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

export type ShopeeSyncScheduler = {
  task: ScheduledTask;
  start(): void;
  stop(): void;
  runNow(): Promise<unknown>;
};
