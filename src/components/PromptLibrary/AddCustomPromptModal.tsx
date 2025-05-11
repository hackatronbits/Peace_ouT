import React, { useEffect } from "react";
import { Modal, Form, Input, Button, App } from "antd";
import { AddCustomPromptModalProps, Prompt } from "./types";
import "./PromptLibrary.css";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";

const { TextArea } = Input;

const AddCustomPromptModal: React.FC<AddCustomPromptModalProps> = ({
  visible,
  onClose,
  onAdd,
  promptToEdit,
}) => {
  const [form] = Form.useForm();
  const { message } = App.useApp();

  useEffect(() => {
    if (visible && promptToEdit) {
      form.setFieldsValue(promptToEdit);
    } else if (visible) {
      form.resetFields();
    }
  }, [visible, promptToEdit, form]);

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (
        promptToEdit?.title === values.title &&
        promptToEdit?.description === values.description &&
        promptToEdit?.content === values.content
      ) {
        onClose();
        message.info(`No updates made to ${promptToEdit?.title}`);
        return;
      }
      const prompt: Prompt = {
        id: promptToEdit?.id || "",
        title: values.title,
        description: values.description,
        content: values.content,
        source: promptToEdit?.source != "ACP" ? "You" : promptToEdit?.source,
        createdAt: promptToEdit?.createdAt || new Date().toISOString(),
        isBuiltIn: false,
      };
      console.log(prompt);
      onAdd(prompt);
      form.resetFields();
      onClose();
    });
  };

  return (
    <Modal
      title={
        promptToEdit ? (
          <>
            <EditOutlined /> Edit Prompt
          </>
        ) : (
          <>
            <PlusOutlined /> Add Custom Prompt
          </>
        )
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          {promptToEdit ? "Save Changes" : "Add Prompt"}
        </Button>,
      ]}
      className="prompt-modal"
    >
      <p style={{ padding: "15px 0px" }}>
        {promptToEdit
          ? "Modify your prompt to better suit your needs! Adjust the details below and save your changes for a more refined experience."
          : "Create your own custom prompt to get the best responses tailored to your needs! Fill in the details below and save your prompt for quick access anytime."}
      </p>
      <Form form={form} layout="vertical" className="prompt-form">
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: "Please enter a title" }]}
        >
          <Input placeholder="Enter prompt title" className="ant-input" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: "Please enter a description" }]}
        >
          <Input placeholder="Enter prompt description" className="ant-input" />
        </Form.Item>

        <Form.Item
          name="content"
          label="Prompt"
          rules={[{ required: true, message: "Please enter prompt content" }]}
        >
          <TextArea
            placeholder="Enter your prompt"
            rows={4}
            autoSize={{ minRows: 4, maxRows: 8 }}
            className="ant-input"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddCustomPromptModal;
