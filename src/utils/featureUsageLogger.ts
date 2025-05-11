import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface FeatureUsageEvent {
  featureName: string;
  eventType: string;
  eventMetadata?: Record<string, any>;
  userIdentifier?: string;
}

export class FeatureUsageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FeatureUsageError";
  }
}

async function logToAPI(event: FeatureUsageEvent): Promise<void> {
  const response = await fetch("/api/v1/track/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new FeatureUsageError(error.error || "Failed to log feature usage");
  }
}

async function logToDB(event: FeatureUsageEvent): Promise<void> {
  await prisma.featureUsage.create({
    data: {
      featureName: event.featureName,
      eventType: event.eventType,
      eventMetadata: event.eventMetadata || {},
      userIdentifier: event.userIdentifier || null,
      occurredAt: new Date(),
    },
  });
}

export async function featureUsageLogger(
  event: FeatureUsageEvent,
  options: { isServer?: boolean } = {},
): Promise<void> {
  try {
    // Input validation
    if (!event.featureName || typeof event.featureName !== "string") {
      throw new FeatureUsageError("featureName must be a non-empty string");
    }
    if (!event.eventType || typeof event.eventType !== "string") {
      throw new FeatureUsageError("eventType must be a non-empty string");
    }

    // If it's a server-side call, log directly to DB
    // Otherwise, use the API endpoint
    if (options.isServer) {
      await logToDB(event);
    } else {
      await logToAPI(event);
    }
  } catch (error) {
    console.error("Failed to log feature usage:", error);
    throw error instanceof FeatureUsageError
      ? error
      : new FeatureUsageError("Failed to log feature usage");
  }
}

// Example usage:
/*
// Client-side usage:
await featureUsageLogger({
  featureName: 'chat',
  eventType: 'chat_archived',
  eventMetadata: {
    chatId: '123',
    messageCount: 50,
    archiveReason: 'user_requested'
  },
  userIdentifier: 'user_123'
});

// Server-side usage:
await featureUsageLogger({
  featureName: 'chat',
  eventType: 'chat_archived',
  eventMetadata: {
    chatId: '123'
  }
}, { isServer: true });
*/
