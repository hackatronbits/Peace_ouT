import React from "react";
import { Button, Tooltip } from "antd";
import { AudioOutlined, AudioMutedOutlined } from "@ant-design/icons";
import "./MicrophoneButton.css";

interface MicrophoneButtonProps {
  isListening: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const MicrophoneButton: React.FC<MicrophoneButtonProps> = ({
  isListening,
  onClick,
  disabled,
}) => {
  return (
    <Tooltip title={isListening ? "Stop listening" : "Send audio message"}>
      <Button
        type="text"
        onClick={onClick}
        className={`microphone-button ${isListening ? "listening" : ""}`}
        disabled={disabled}
      >
        <div className="mic-container">
          {!isListening && <AudioOutlined className="mic-icon" />}
          {isListening && (
            <div className="waveform">
              <div className="wave-group">
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
              </div>
            </div>
          )}
        </div>
      </Button>
    </Tooltip>
  );
};

export default MicrophoneButton;
