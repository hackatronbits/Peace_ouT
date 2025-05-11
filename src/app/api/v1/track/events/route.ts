import { NextRequest, NextResponse } from "next/server";
import {
  featureUsageLogger,
  FeatureUsageError,
} from "../../../../../utils/featureUsageLogger";
import { getClientIp } from "../../../../../config/rateLimit";

interface EventRequest {
  featureName: string;
  eventType: string;
  eventMetadata?: Record<string, any>;
  userIdentifier?: string;
}

function validateEventRequest(data: any): EventRequest {
  if (!data || typeof data !== "object") {
    throw new FeatureUsageError("Invalid request data");
  }

  if (!data.featureName || typeof data.featureName !== "string") {
    throw new FeatureUsageError(
      "Feature name is required and must be a string",
    );
  }

  if (!data.eventType || typeof data.eventType !== "string") {
    throw new FeatureUsageError("Event type is required and must be a string");
  }

  if (data.eventMetadata && typeof data.eventMetadata !== "object") {
    throw new FeatureUsageError("Event metadata must be an object");
  }

  if (data.userIdentifier && typeof data.userIdentifier !== "string") {
    throw new FeatureUsageError("User identifier must be a string");
  }

  return {
    featureName: data.featureName,
    eventType: data.eventType,
    eventMetadata: data.eventMetadata,
    userIdentifier: data.userIdentifier,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request body
    const validatedData = validateEventRequest(body);
    validatedData.userIdentifier = getClientIp(req) || "unknown";

    // Log the feature usage with server-side flag
    await featureUsageLogger(validatedData, { isServer: true });

    return NextResponse.json(
      { message: "Event logged successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error logging event:", error);

    if (error instanceof FeatureUsageError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
