"use client";

import React, { useState } from "react";
import { Form, Input, Button, Rate, Tag, Typography, App } from "antd";
import {
  BulbOutlined,
  SendOutlined,
  StarOutlined,
  MailOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import "../info-pages.css";
import Header from "../../../components/Navigation/Header/Header";
import Footer from "../../../components/Navigation/Footer/Footer";

const { TextArea } = Input;
const { Title, Paragraph, Text } = Typography;

const categories = [
  { key: "ui", label: "UI/UX", color: "magenta" },
  { key: "performance", label: "Performance", color: "green" },
  { key: "feature", label: "New Feature", color: "blue" },
  { key: "integration", label: "Integration", color: "cyan" },
  { key: "accessibility", label: "Accessibility", color: "purple" },
  { key: "security", label: "Security", color: "red" },
  { key: "documentation", label: "Documentation", color: "orange" },
  { key: "other", label: "Other", color: "default" },
];

const IdeasPageLayout = () => {
  const [form] = Form.useForm();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  const handleCategoryClick = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const onFinish = async (values: any) => {
    if (selectedCategories.length === 0) {
      message.warning("Please select at least one category");
      return;
    }

    setLoading(true);
    try {
      // Here you would send the idea to your backend
      console.log("Submitted idea:", {
        ...values,
        categories: selectedCategories,
      });
      message.success("Thank you for your idea! We'll review it soon.");
      form.resetFields();
      setSelectedCategories([]);
    } catch (error) {
      message.error("Failed to submit idea. Please try again.");
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
                <BulbOutlined />
              </div>
              <div>
                <h1 className="page-title">Share Your Ideas</h1>
                <p className="page-subtitle">
                  Help shape the future of PromptCue
                </p>
              </div>
            </div>

            <div className="info-card">
              <Paragraph className="text-lg">
                We value your input! Share your ideas for new features,
                improvements, or any suggestions that could make PromptCue
                better. Your feedback helps us prioritize our development
                roadmap.
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
                  name="title"
                  label="Idea Title"
                  rules={[
                    {
                      required: true,
                      message: "Please provide a title for your idea",
                    },
                  ]}
                >
                  <Input
                    placeholder="Give your idea a clear, concise title"
                    prefix={<StarOutlined className="text-gray-400" />}
                  />
                </Form.Item>

                <Form.Item
                  label="Categories"
                  required
                  help="Select all that apply"
                >
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Tag
                        key={category.key}
                        color={category.color}
                        className="cursor-pointer text-sm py-1 px-3"
                        onClick={() => handleCategoryClick(category.key)}
                        style={{
                          opacity: selectedCategories.includes(category.key)
                            ? 1
                            : 0.6,
                          transform: selectedCategories.includes(category.key)
                            ? "scale(1.05)"
                            : "scale(1)",
                          transition: "all 0.2s",
                        }}
                      >
                        {category.label}
                      </Tag>
                    ))}
                  </div>
                </Form.Item>

                <Form.Item
                  name="description"
                  label="Detailed Description"
                  rules={[
                    {
                      required: true,
                      message: "Please describe your idea in detail",
                    },
                  ]}
                >
                  <TextArea
                    rows={6}
                    placeholder="Describe your idea in detail. What problem does it solve? How would it work? Who would benefit from it?"
                  />
                </Form.Item>

                <Form.Item
                  name="impact"
                  label="Expected Impact"
                  rules={[
                    {
                      required: true,
                      message: "Please rate the expected impact",
                    },
                  ]}
                >
                  <div className="flex items-center gap-4">
                    <Rate />
                    <Text type="secondary">
                      Rate the potential impact of your idea
                    </Text>
                  </div>
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SendOutlined />}
                    loading={loading}
                    className="w-full"
                  >
                    Submit Idea
                  </Button>
                </Form.Item>
              </Form>
            </div>

            <div className="contact-section">
              <h3 className="text-2xl font-bold mb-6">
                Other Ways to Contribute
              </h3>
              <div className="contact-grid">
                <div className="contact-item">
                  <div className="contact-icon">
                    <MailOutlined />
                  </div>
                  <div>
                    <div className="opacity-80">Email us at</div>
                    <div className="contact-text">ideas@promptcue.com</div>
                  </div>
                </div>
                <div className="contact-item">
                  <div className="contact-icon">
                    <HomeOutlined />
                  </div>
                  <div>
                    <div className="opacity-80">Join our Community</div>
                    <div className="contact-text">community.promptcue.com</div>
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

export default IdeasPageLayout;
