import { NextResponse } from "next/server";
import { logAPIError, logAPIInfo, logAPIWarning } from "../utils/apiLogger";

interface RateLimitConfig {
  windowMs: number;
  limit: number;
  burstLimit?: number; // Maximum burst limit
  burstDuration?: number; // How long burst is allowed (in ms)
  endpoint: string;
}

interface RateLimitInfo {
  count: number;
  resetTime: number;
  burstCount?: number;
  burstStart?: number;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  JORDAN: {
    windowMs: 60 * 1000, // Regular window: 1 minute
    limit: 30, // Regular limit: 30 requests/minute
    burstLimit: 40, // Allow up to 40 requests in burst
    burstDuration: 10000, // Burst window: 10 seconds
    endpoint: "ai/agent/jordan",
  },
  SCOTT: {
    windowMs: 60 * 1000,
    limit: 30,
    burstLimit: 40,
    burstDuration: 10000, // Burst window: 10 seconds
    endpoint: "ai/agent/scott",
  },
  QUERY: {
    windowMs: 60 * 1000,
    limit: 40,
    burstLimit: 50,
    burstDuration: 10000, // Burst window: 10 seconds
    endpoint: "ai/query",
  },
  IMAGE: {
    windowMs: 60 * 1000, // 1 minute window
    limit: 10, // 10 image generations per minute
    burstLimit: 15, // Allow up to 15 requests in burst
    burstDuration: 10000, // 10 second burst window
    endpoint: "ai/image",
  },
} as const;

export const getClientIp = (request: Request): string => {
  // Method 1: From X-Forwarded-For header (most reliable for proxied requests)
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // Get the first IP if there are multiple
    return forwardedFor.split(",")[0].trim();
  }

  // Method 2: From CF-Connecting-IP (if using Cloudflare)
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) {
    return cfIp;
  }

  // Method 3: From X-Real-IP header
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Method 4: From URL (if available)
  const url = new URL(request.url);
  const ipFromUrl = url.hostname;
  if (ipFromUrl && ipFromUrl !== "localhost") {
    return ipFromUrl;
  }

  // Fallback
  return "unknown";
};

// Store for rate limits
const store = new Map<string, RateLimitInfo>();

export const rateLimit = (endpoint: keyof typeof RATE_LIMITS) => {
  return async function rateLimitMiddleware(
    request: Request,
    handler: (request: Request) => Promise<Response>,
  ): Promise<Response> {
    const clientIp = getClientIp(request) || "unknown";
    const config = RATE_LIMITS[endpoint];
    const now = Date.now();
    const key = `${clientIp}:${config.endpoint}`;
    const data = store.get(key);

    logAPIInfo("rate_limit", "check", {
      component: config.endpoint,
      action: "check",
      metadata: {
        clientIp,
        currentCount: data?.count || 0,
        limit: config.limit,
      },
    });

    // If no existing data or window expired
    if (!data || now >= data.resetTime) {
      store.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
        burstCount: 1,
        burstStart: now,
      });

      logAPIInfo("rate_limit", "new_window", {
        component: config.endpoint,
        action: "new_window",
        metadata: {
          clientIp,
          resetTime: new Date(now + config.windowMs).toISOString(),
        },
      });

      return handler(request);
    }

    // Update counts
    data.count++;

    // Check if in burst window
    const isInBurstWindow =
      config.burstDuration &&
      data.burstStart &&
      now - data.burstStart <= config.burstDuration;

    // Reset burst counter if burst window expired
    if (!isInBurstWindow && config.burstDuration) {
      data.burstCount = 1;
      data.burstStart = now;
    } else if (isInBurstWindow) {
      data.burstCount = (data.burstCount || 0) + 1;
    }

    // Check regular and burst limits
    const isOverRegularLimit = data.count > config.limit;
    const isOverBurstLimit =
      config.burstLimit &&
      data.burstCount &&
      data.burstCount > config.burstLimit;

    // Calculate remaining limits
    const regularRemaining = Math.max(0, config.limit - data.count);
    const burstRemaining = config.burstLimit
      ? Math.max(0, config.burstLimit - (data.burstCount || 0))
      : 0;

    // If over limits
    if (isOverRegularLimit && (!config.burstLimit || isOverBurstLimit)) {
      const retryAfter = Math.ceil((data.resetTime - now) / 1000);

      logAPIWarning("rate_limit", "exceeded", {
        component: config.endpoint,
        action: "limit_exceeded",
        status: "429",
        metadata: {
          clientIp,
          regularCount: data.count,
          burstCount: data.burstCount,
          regularLimit: config.limit,
          burstLimit: config.burstLimit,
          retryAfter,
          regularRemaining,
          burstRemaining,
        },
      });

      return new NextResponse(
        JSON.stringify({
          error: "Too Many Requests",
          message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
          limits: {
            regularLimit: config.limit,
            burstLimit: config.burstLimit,
            regularRemaining,
            burstRemaining,
            resetIn: retryAfter,
          },
        }),
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
            "X-RateLimit-Limit": String(config.limit),
            "X-RateLimit-Remaining": String(regularRemaining),
            "X-RateLimit-Reset": String(Math.ceil(data.resetTime / 1000)),
            "X-RateLimit-Burst-Remaining": String(burstRemaining),
          },
        },
      );
    }

    try {
      // Process the request
      const response = await handler(request);

      logAPIInfo("rate_limit", "success", {
        component: config.endpoint,
        action: "process",
        status: "200",
        metadata: {
          clientIp,
          regularCount: data.count,
          regularRemaining,
          burstRemaining,
          resetIn: Math.ceil((data.resetTime - now) / 1000),
        },
      });

      // Add rate limit headers
      const newHeaders = new Headers(response.headers);
      newHeaders.set("X-RateLimit-Limit", String(config.limit));
      newHeaders.set("X-RateLimit-Remaining", String(regularRemaining));
      newHeaders.set(
        "X-RateLimit-Reset",
        String(Math.ceil(data.resetTime / 1000)),
      );
      newHeaders.set("X-RateLimit-Burst-Remaining", String(burstRemaining));

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    } catch (error) {
      logAPIError("rate_limit", "error", error as Error, {
        component: config.endpoint,
        action: "process",
        status: "500",
        metadata: {
          clientIp,
          regularCount: data.count,
          regularRemaining,
        },
      });
      throw error;
    }
  };
};
