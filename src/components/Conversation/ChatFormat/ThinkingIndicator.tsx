import MessageAvatar from "./MessageAvatar";

interface ThinkingIndicatorProps {
  agentType: string;
  isRegenerating: boolean;
}

export const ThinkingIndicator = ({
  agentType,
  isRegenerating,
}: ThinkingIndicatorProps) => {
  return (
    <div className="message-wrapper ai thinking-message">
      <div className="message-inner">
        <MessageAvatar sender="ai" />
        <div className="message-thinking">
          <div className="ai-thinking-indicator">
            <div className="pulse-container">
              <div className="pulse-bubble"></div>
              <div className="pulse-bubble"></div>
              <div className="pulse-bubble"></div>
            </div>
            <div className="thinking-status">
              <span className="status-text">
                {isRegenerating === true
                  ? "Regenerating... A fresh response is on the way!"
                  : agentType === "na"
                    ? "Assistant"
                    : agentType === "tech"
                      ? "Jordan"
                      : "Scott"}{" "}
                {agentType != "none" && "is processing your request"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
