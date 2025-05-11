import { formatModelName, getModelConfig } from "../../../config/modelConfig";

export const Disclaimer = () => {
  const selectedModel = localStorage.getItem("PC_selectedModel");
  const modelConfig = getModelConfig(String(selectedModel));

  return (
    <div
      className="disclaimer-text"
      style={{
        fontSize: "13px",
        color: "#666",
        marginTop: "10px",
        textAlign: "center",
      }}
    >
      <span>
        By using{" "}
        {selectedModel === "" || selectedModel === null
          ? "PromptCue"
          : `${formatModelName(selectedModel)} Model`}
        , you agree to{" "}
        {selectedModel === "" || selectedModel === null
          ? "our "
          : String(modelConfig?.provider.toUpperCase()) + "\'s "}
        {modelConfig?.termsOfServiceUrl ? (
          <a
            href={modelConfig.termsOfServiceUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#2563eb" }}
          >
            Terms
          </a>
        ) : (
          <a
            href="/info/tnc"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#2563eb" }}
          >
            Terms
          </a>
        )}{" "}
        and{" "}
        {modelConfig?.privacyPolicyUrl ? (
          <a
            href={modelConfig.privacyPolicyUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#2563eb" }}
          >
            Privacy Policy
          </a>
        ) : (
          <a
            href="/info/privacy"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#2563eb" }}
          >
            Privacy Policy
          </a>
        )}
      </span>
    </div>
  );
};
