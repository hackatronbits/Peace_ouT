"use client";

import React, { useState } from "react";
import { Form, Input, Button, Select, Upload, Typography, App } from "antd";
import {
  UploadOutlined,
  BugOutlined,
  MailOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import "../info-pages.css";
import Header from "../../../components/Navigation/Header/Header";
import Footer from "../../../components/Navigation/Footer/Footer";

const { TextArea } = Input;
const { Option } = Select;
const { Paragraph } = Typography;

const bugTypes = [
  { value: "functional", label: "Functional Issue" },
  { value: "ui", label: "UI/Design Issue" },
  { value: "performance", label: "Performance Issue" },
  { value: "security", label: "Security Concern" },
  { value: "other", label: "Other" },
];

const priorities = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

const ReportBugLayout = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // Here you would typically send the bug report to your backend
      message.success("Bug report submitted successfully!");
      form.resetFields();
    } catch (error) {
      message.error("Failed to submit bug report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        <div className="info-page-container">
          <div className="info-content">
            <div className="page-header">
              <div className="page-icon">
                <BugOutlined />
              </div>
              <div>
                <h1 className="page-title">Report a Bug</h1>
                <p className="page-subtitle">
                  Help us improve by reporting any issues you encounter
                </p>
              </div>
            </div>

            <div className="info-card">
              <Paragraph className="text-lg">
                We take all bug reports seriously and appreciate your help in
                making PromptCue better. Please provide as much detail as
                possible to help us understand and resolve the issue quickly.
              </Paragraph>
            </div>

            <div className="info-card">
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                className="space-y-6"
              >
                <Form.Item
                  name="type"
                  label="Type of Issue"
                  rules={[
                    {
                      required: true,
                      message: "Please select the type of issue",
                    },
                  ]}
                >
                  <Select placeholder="Select the type of issue">
                    {bugTypes.map((type) => (
                      <Option key={type.value} value={type.value}>
                        {type.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="priority"
                  label="Priority Level"
                  rules={[
                    {
                      required: true,
                      message: "Please select the priority level",
                    },
                  ]}
                >
                  <Select placeholder="Select priority level">
                    {priorities.map((priority) => (
                      <Option key={priority.value} value={priority.value}>
                        {priority.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="title"
                  label="Bug Title"
                  rules={[
                    {
                      required: true,
                      message: "Please provide a brief title for the bug",
                    },
                  ]}
                >
                  <Input placeholder="Brief description of the issue" />
                </Form.Item>

                <Form.Item
                  name="description"
                  label="Detailed Description"
                  rules={[
                    {
                      required: true,
                      message: "Please describe the bug in detail",
                    },
                  ]}
                >
                  <TextArea
                    rows={6}
                    placeholder="Please describe what happened, what you expected to happen, and steps to reproduce the issue"
                  />
                </Form.Item>

                <Form.Item
                  name="environment"
                  label="Environment"
                  rules={[
                    {
                      required: true,
                      message: "Please provide environment details",
                    },
                  ]}
                >
                  <TextArea
                    rows={3}
                    placeholder="Browser version, operating system, etc."
                  />
                </Form.Item>

                <Form.Item name="attachments" label="Attachments">
                  <Upload>
                    <Button icon={<UploadOutlined />}>
                      Upload Screenshots or Files
                    </Button>
                  </Upload>
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    className="w-full"
                  >
                    Submit Bug Report
                  </Button>
                </Form.Item>
              </Form>
            </div>

            <div className="contact-section">
              <h3 className="text-2xl font-bold mb-6">Need Immediate Help?</h3>
              <div className="contact-grid">
                <div className="contact-item">
                  <div className="contact-icon">
                    <MailOutlined />
                  </div>
                  <div>
                    <div className="opacity-80">Email us at</div>
                    <div className="contact-text">support@promptcue.com</div>
                  </div>
                </div>
                <div className="contact-item">
                  <div className="contact-icon">
                    <HomeOutlined />
                  </div>
                  <div>
                    <div className="opacity-80">Visit our Help Center</div>
                    <div className="contact-text">help.promptcue.com</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ReportBugLayout;
