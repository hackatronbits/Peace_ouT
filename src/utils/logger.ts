interface LogEntry {
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
  sessionId: string;
}

class Logger {
  private static readonly MAX_LOGS = 1000;
  private static readonly STORAGE_KEY = "PC_promptCueLogs";

  /**
   * Log an event to local storage
   * @param eventType Type of event (e.g., 'chat', 'model', 'api', 'ui')
   * @param eventName Specific event name (e.g., 'message_sent', 'model_changed')
   * @param severity Level of severity ('info', 'warn', 'error')
   * @param details Additional details about the event
   */
  static logEvent(
    eventType: string,
    eventName: string,
    severity: "info" | "warn" | "error",
    details: Partial<LogEntry["details"]> = {},
  ) {
    try {
      const logs = this.getLogs();
      const newLog: LogEntry = {
        timestamp: new Date().toISOString(),
        eventType,
        eventName,
        severity,
        details,
        sessionId: this.getSessionId(),
      };

      logs.push(newLog);

      // Remove oldest logs if exceeding max limit
      while (logs.length > this.MAX_LOGS) {
        logs.shift();
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs));
    } catch (error) {
      console.error("Failed to log event:", error);
    }
  }

  /**
   * Get all logs from storage
   */
  static getLogs(): LogEntry[] {
    try {
      const logsStr = localStorage.getItem(this.STORAGE_KEY);
      return logsStr ? JSON.parse(logsStr) : [];
    } catch (error) {
      console.error("Failed to get logs:", error);
      return [];
    }
  }

  /**
   * Clear all logs from storage
   */
  static clearLogs() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear logs:", error);
    }
  }

  /**
   * Export logs as JSON string
   */
  static exportLogs(): string {
    return JSON.stringify(this.getLogs(), null, 2);
  }

  /**
   * Get or create session ID
   */
  private static getSessionId(): string {
    let sessionId = sessionStorage.getItem("prompt_cue_session_id");
    if (!sessionId) {
      sessionId = `session_${Date.now()}`;
      sessionStorage.setItem("prompt_cue_session_id", sessionId);
    }
    return sessionId;
  }

  /**
   * Remove logs older than specified days
   */
  static clearOldLogs(days: number = 7) {
    try {
      const logs = this.getLogs();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const filteredLogs = logs.filter(
        (log) => new Date(log.timestamp) > cutoffDate,
      );

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredLogs));
    } catch (error) {
      console.error("Failed to clear old logs:", error);
    }
  }
}

// Helper functions for common events
export const logInfo = (
  eventType: string,
  eventName: string,
  details: Partial<LogEntry["details"]> = {},
) => {
  Logger.logEvent(eventType, eventName, "info", details);
};

export const logWarning = (
  eventType: string,
  eventName: string,
  details: Partial<LogEntry["details"]> = {},
) => {
  Logger.logEvent(eventType, eventName, "warn", details);
};

export const logError = (
  eventType: string,
  eventName: string,
  error: Error,
  details: Partial<LogEntry["details"]> = {},
) => {
  Logger.logEvent(eventType, eventName, "error", {
    ...details,
    errorMessage: error.message,
    stackTrace: error.stack,
  });
};

export default Logger;
