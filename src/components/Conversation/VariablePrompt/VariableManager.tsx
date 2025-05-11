import React, { useState } from "react";
import { Modal, Input, Button, List, App } from "antd";
import { CodeOutlined, DeleteOutlined } from "@ant-design/icons";
import { useVariables } from "./VariableContext";
import { featureUsageLogger } from "../../../utils/featureUsageLogger";
import "./Variables.css";

interface VariableManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const VariableManager: React.FC<VariableManagerProps> = ({
  isOpen,
  onClose,
}) => {
  const { variables, addVariable, deleteVariable } = useVariables();
  const [newName, setNewName] = useState("");
  const [newValue, setNewValue] = useState("");
  const { message } = App.useApp();

  const handleAdd = async () => {
    try {
      await addVariable(newName.trim(), newValue.trim());
      setNewName("");
      setNewValue("");
      message.success("Variable added successfully");

      await featureUsageLogger({
        featureName: "variable_management",
        eventType: "variable_added",
        eventMetadata: {
          variableName: newName.trim(),
        },
      });
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Failed to add variable",
      );
    }
  };

  const handleDelete = async (name: string) => {
    try {
      await deleteVariable(name);
      message.success("Variable deleted successfully", 1);

      await featureUsageLogger({
        featureName: "variable_management",
        eventType: "variable_deleted",
        eventMetadata: {
          variableName: name,
        },
      });
    } catch (error) {
      message.error("Failed to delete variable", 1);
    }
  };

  return (
    <Modal
      title={
        <>
          <CodeOutlined /> Manage Variables
        </>
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={480}
    >
      <div className="variables-manager">
        <div className="add-variable-section">
          <div className="variable-hint">
            Variables are placeholders that help you quickly insert custom
            values into your prompts. Define them here and use them in your
            chats by typing __$variableName.
          </div>
          <Input
            placeholder="Variable name (e.g., name, email)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="variable-input"
          />
          <Input
            placeholder="Variable value"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className="variable-input"
          />
          <Button
            type="primary"
            onClick={handleAdd}
            disabled={!newName.trim() || !newValue.trim()}
          >
            Add Variable
          </Button>
          <div className="variable-hint">
            You can store up to <strong>20 variables</strong> at a time.
          </div>
        </div>

        <List
          className="variables-list"
          itemLayout="horizontal"
          dataSource={variables}
          renderItem={(variable) => (
            <List.Item
              key={variable.name}
              actions={[
                <Button
                  key="delete"
                  onClick={() => handleDelete(variable.name)}
                  icon={<DeleteOutlined />}
                />,
              ]}
            >
              <div>
                <div className="variable-name">__${variable.name}</div>
                <div className="variable-value">{variable.value}</div>
              </div>
            </List.Item>
          )}
        />
      </div>
    </Modal>
  );
};

export default VariableManager;
