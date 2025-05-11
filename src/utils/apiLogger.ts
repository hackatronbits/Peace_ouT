import { prisma } from "../lib/prisma";

interface APILogEntry {
  timestamp: string;
  eventType: string;
  eventName: string;
  severity: "info" | "warn" | "error";
  details: {
    component?: string;
    action?: string;
    status?: string;
    duration?: number;
    errorMessage?: string;
    stackTrace?: string;
    metadata?: Record<string, any>;
  };
}

const LOG_RETENTION_DAYS = 30;

export const writeLog = async (logEntry: APILogEntry) => {
  try {
    await prisma.platformStats.create({
      data: {
        timestamp: new Date(logEntry.timestamp),
        eventType: logEntry.eventType,
        eventName: logEntry.eventName,
        severity: logEntry.severity,
        component: logEntry.details.component,
        action: logEntry.details.action,
        status: logEntry.details.status,
        duration: logEntry.details.duration,
        errorMessage: logEntry.details.errorMessage,
        stackTrace: logEntry.details.stackTrace,
        metadata: logEntry.details.metadata || {},
      },
    });
  } catch (error) {
    console.error("Failed to write log to database:", error);
  }
};

export const logAPIInfo = async (
  eventType: string,
  eventName: string,
  details: Partial<APILogEntry["details"]> = {},
) => {
  const logEntry: APILogEntry = {
    timestamp: new Date().toISOString(),
    eventType,
    eventName,
    severity: "info",
    details,
  };
  await writeLog(logEntry);
};

export const logAPIError = async (
  eventType: string,
  eventName: string,
  error: Error,
  details: Partial<APILogEntry["details"]> = {},
) => {
  const logEntry: APILogEntry = {
    timestamp: new Date().toISOString(),
    eventType,
    eventName,
    severity: "error",
    details: {
      ...details,
      errorMessage: error.message,
      stackTrace: error.stack,
    },
  };
  await writeLog(logEntry);
};

export const logAPIWarning = async (
  eventType: string,
  eventName: string,
  details: Partial<APILogEntry["details"]> = {},
) => {
  const logEntry: APILogEntry = {
    timestamp: new Date().toISOString(),
    eventType,
    eventName,
    severity: "warn",
    details,
  };
  await writeLog(logEntry);
};

// This function will be called by the cron job
export const forceCleanupAPILogs = async () => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - LOG_RETENTION_DAYS);

    const result = await prisma.platformStats.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    });

    // Log the cleanup operation to PlatformStats
    await prisma.platformStats.create({
      data: {
        timestamp: new Date(),
        eventType: "SYSTEM",
        eventName: "LOG_CLEANUP",
        severity: "info",
        component: "apiLogger",
        action: "cleanup",
        status: "success",
        metadata: {
          deletedCount: result.count,
          retentionDays: LOG_RETENTION_DAYS,
          cutoffDate: cutoffDate.toISOString(),
        },
      },
    });
  } catch (error) {
    // Log the error to PlatformStats
    await prisma.platformStats.create({
      data: {
        timestamp: new Date(),
        eventType: "SYSTEM",
        eventName: "LOG_CLEANUP",
        severity: "error",
        component: "apiLogger",
        action: "cleanup",
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        stackTrace: error instanceof Error ? error.stack : undefined,
        metadata: {
          retentionDays: LOG_RETENTION_DAYS,
          cutoffDate: new Date().toISOString(),
        },
      },
    });
  }
};
