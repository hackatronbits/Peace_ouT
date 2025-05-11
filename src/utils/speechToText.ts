import { logError, logInfo, logWarning } from "./logger";
import { featureUsageLogger } from "./featureUsageLogger";

interface SpeechRecognitionErrorEvent extends Event {
  error:
    | "not-allowed"
    | "language-not-supported"
    | "no-speech"
    | "network"
    | "audio-capture"
    | "aborted";
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechToTextOptions {
  onTranscript: (text: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

interface SpeechToTextControls {
  startListening: () => void;
  stopListening: () => void;
  isListening: boolean;
}

declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

let recognitionInstance: any = null;
let isListening = false;
let manualStop = false;
let currentTranscript = ""; // Add this to store current transcript

function getBrowserInfo() {
  const userAgent = navigator.userAgent;
  const isEdge =
    userAgent.indexOf("Edge") > -1 || userAgent.indexOf("Edg") > -1;
  const isChrome = userAgent.indexOf("Chrome") > -1 && !isEdge;
  const isSafari = userAgent.indexOf("Safari") > -1 && !isChrome;
  const isWindows = navigator.platform.indexOf("Win") > -1;

  return { isEdge, isChrome, isSafari, isWindows };
}

export function initSpeechToText({
  onTranscript,
  onStart,
  onEnd,
  onError,
}: SpeechToTextOptions): SpeechToTextControls {
  const { isEdge, isChrome, isSafari, isWindows } = getBrowserInfo();

  logInfo("speech_to_text", "init", {
    component: "speech_to_text",
    action: "initialize",
    status: "started",
    metadata: {
      browserType: isEdge
        ? "Edge"
        : isChrome
          ? "Chrome"
          : isSafari
            ? "Safari"
            : "Other",
      platform: isWindows ? "Windows" : "Other",
    },
  });

  // Check browser support and provide specific messages
  if (
    !("webkitSpeechRecognition" in window) &&
    !("SpeechRecognition" in window)
  ) {
    const errorMsg = "Speech recognition is not supported in this browser";

    logError("speech_to_text", "browser_support_check", new Error(errorMsg), {
      component: "speech_to_text",
      action: "browser_check",
      status: "failed",
    });

    return {
      startListening: () => {},
      stopListening: () => {},
      isListening: false,
    };
  }

  // Show warning for Edge users
  if (isEdge) {
    logWarning("speech_to_text", "edge_browser_warning", {
      component: "speech_to_text",
      action: "browser_check",
      status: "warning",
      metadata: {
        message: "Limited support in Microsoft Edge",
      },
    });
  }

  const SpeechRecognition =
    window.webkitSpeechRecognition || window.SpeechRecognition;
  recognitionInstance = new SpeechRecognition();

  // Optimized browser-specific configurations
  recognitionInstance.continuous = !isEdge;
  recognitionInstance.interimResults = !isEdge;
  recognitionInstance.maxAlternatives = 1;
  recognitionInstance.lang = "en-US";

  let retryCount = 0;
  const MAX_RETRIES = 2;
  const RETRY_DELAY = 1000;

  recognitionInstance.onstart = async function () {
    isListening = true;
    onStart?.();

    logInfo("speech_to_text", "start_listening", {
      component: "speech_to_text",
      action: "start_listening",
      status: "success",
      metadata: {
        browserType: isEdge
          ? "Edge"
          : isChrome
            ? "Chrome"
            : isSafari
              ? "Safari"
              : "Other",
        language: recognitionInstance.lang,
        continuous: recognitionInstance.continuous,
        interimResults: recognitionInstance.interimResults,
      },
    });

    await featureUsageLogger({
      featureName: "speech_to_text",
      eventType: "recognition_started",
      eventMetadata: {
        timestamp: new Date().toISOString(),
      },
    });
  };

  recognitionInstance.onerror = async function (
    event: SpeechRecognitionErrorEvent,
  ) {
    logError("speech_to_text", "recognition_error", new Error(event.error), {
      component: "speech_to_text",
      action: "recognition",
      status: "error",
      metadata: {
        errorType: event.error,
        retryAttempt: retryCount,
        maxRetries: MAX_RETRIES,
      },
    });

    let errorMessage = "Error occurred while listening";
    let shouldRetry = false;

    switch (event.error) {
      case "not-allowed":
        errorMessage = "Microphone permission denied";
        break;
      case "language-not-supported":
        if (isEdge && retryCount < MAX_RETRIES) {
          shouldRetry = true;
          retryCount++;
          errorMessage = `Retrying speech recognition (attempt ${retryCount}/${MAX_RETRIES})...`;
        } else if (isEdge) {
          errorMessage =
            "Speech recognition is not available in your version of Edge. Please try:" +
            "\n1. Using Chrome or Safari" +
            "\n2. Updating Edge to the latest version" +
            "\n3. Checking your microphone settings";
        } else {
          errorMessage = "Speech recognition language not supported";
        }
        break;
      case "no-speech":
        errorMessage = "No speech detected";
        break;
      case "network":
        errorMessage = "Network error occurred";
        shouldRetry = retryCount < MAX_RETRIES;
        break;
      case "audio-capture":
        errorMessage = "No microphone detected";
        break;
      case "aborted":
        errorMessage = "Speech recognition aborted";
        break;
    }

    if (shouldRetry) {
      setTimeout(() => {
        try {
          recognitionInstance.start();

          logInfo("speech_to_text", "retry_start", {
            component: "speech_to_text",
            action: "retry_start",
            status: "success",
            metadata: {
              retryAttempt: retryCount,
              maxRetries: MAX_RETRIES,
            },
          });
        } catch (e) {
          onError?.("Failed to restart speech recognition");
          isListening = false;
        }
      }, RETRY_DELAY);
    } else {
      onError?.(errorMessage);
      isListening = false;
    }
  };

  recognitionInstance.onresult = function (event: SpeechRecognitionEvent) {
    if (event.results.length > 0) {
      const result = event.results[event.results.length - 1];
      if (result.isFinal) {
        const transcript = result[0].transcript;
        if (transcript.trim()) {
          currentTranscript = transcript.trim();
          logInfo("speech_to_text", "transcription_received", {
            component: "speech_to_text",
            action: "transcription",
            status: "success",
            metadata: {
              confidence: result[0].confidence,
              length: transcript.trim().length,
            },
          });

          if (!manualStop) {
            onTranscript(currentTranscript);
          }

          if (isEdge) {
            recognitionInstance.stop();
          }
        }
      }
    }
  };

  recognitionInstance.onend = function () {
    if (isListening && !isEdge && !manualStop) {
      try {
        recognitionInstance.start();
        logInfo("speech_to_text", "auto_restart", {
          component: "speech_to_text",
          action: "auto_restart",
          status: "success",
        });
      } catch (e) {
        logError("speech_to_text", "auto_restart_failed", e as Error, {
          component: "speech_to_text",
          action: "auto_restart",
          status: "failed",
        });
        isListening = false;
        onEnd?.();
      }
    } else {
      if (manualStop && currentTranscript) {
        onTranscript(currentTranscript);
      }

      isListening = false;
      currentTranscript = "";
      onEnd?.();

      logInfo("speech_to_text", "recognition_ended", {
        component: "speech_to_text",
        action: "recognition",
        status: "ended",
        metadata: {
          wasListening: isListening,
          manualStop,
          hadTranscript: !!currentTranscript,
        },
      });

      manualStop = false;
    }
  };

  return {
    startListening: () => {
      if (!recognitionInstance) {
        return;
      }

      try {
        if (!isListening) {
          manualStop = false;
          currentTranscript = "";
          retryCount = 0;

          // Start recognition before showing UI feedback
          recognitionInstance.start();

          logInfo("speech_to_text", "manual_start", {
            component: "speech_to_text",
            action: "manual_start",
            status: "success",
          });
        }
      } catch (error) {
        logError("speech_to_text", "start_failed", error as Error, {
          component: "speech_to_text",
          action: "manual_start",
          status: "failed",
        });
      }
    },
    stopListening: () => {
      if (recognitionInstance && isListening) {
        manualStop = true;
        recognitionInstance.stop();

        logInfo("speech_to_text", "manual_stop", {
          component: "speech_to_text",
          action: "manual_stop",
          status: "success",
          metadata: {
            manualStop: true,
            hasTranscript: !!currentTranscript,
          },
        });
      }
    },
    isListening,
  };
}
