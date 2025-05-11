import cron from "node-cron";
import { forceCleanupAPILogs } from "./apiLogger";

// Run at midnight every day
export const initLogCleanupCron = () => {
  cron.schedule("0 0 * * 0", () => {
    forceCleanupAPILogs();
  });
};
