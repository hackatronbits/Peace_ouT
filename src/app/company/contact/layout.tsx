"use client";
import React, { useState } from "react";
import { App, Button, Form, Input, Select } from "antd";
import { motion } from "framer-motion";
import {
  MailOutlined,
  PhoneOutlined,
  GlobalOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  GithubOutlined,
  SendOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import Header from "../../../components/Navigation/Header/Header";
import Footer from "../../../components/Navigation/Footer/Footer";
import "./contact.css";

const { Option } = Select;
const { TextArea } = Input;

const ContactPageLayout = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const { message } = App.useApp();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // Simulate form submission
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitted(true);
      form.resetFields();
      message.success("Message sent successfully! We'll get back to you soon.");
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      message.error("Failed to send message. Please try again.");
    }
    setLoading(false);
  };

  const contactOptions = [
    {
      icon: <MailOutlined />,
      title: "Email Support",
      description: "Get help with technical issues",
      contact: "support@promptcue.com",
      response: "~24 hours",
    },
    {
      icon: <PhoneOutlined />,
      title: "Sales Inquiries",
      description: "Talk to our sales team",
      contact: "sales@promptcue.com",
      response: "~48 hours",
    },
    {
      icon: <GlobalOutlined />,
      title: "Press & Media",
      description: "Media inquiries and press kit",
      contact: "press@promptcue.com",
      response: "2-3 days",
    },
  ];

  return (
    <div className="contact-page">
      <Header />

      <main className="contact-main">
        {/* Enhanced Hero Section */}
        <motion.section
          className="contact-hero"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="hero-content">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Get in Touch
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              We&apos;re here to help with any questions about our products,
              services, or pricing
            </motion.p>
          </div>
          <div className="hero-background">
            <div className="gradient-sphere"></div>
            <div className="gradient-sphere secondary"></div>
          </div>
        </motion.section>

        {/* Enhanced Contact Options */}
        <section className="contact-options">
          {contactOptions.map((option, index) => (
            <motion.div
              key={index}
              className={`option-card ${activeCard === index ? "active" : ""}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{
                y: -5,
                boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
              }}
              onHoverStart={() => setActiveCard(index)}
              onHoverEnd={() => setActiveCard(null)}
            >
              <div className="option-icon">{option.icon}</div>
              <h3>{option.title}</h3>
              <p>{option.description}</p>
              <p className="contact-detail">{option.contact}</p>
              <p className="response-time">Response time: {option.response}</p>
            </motion.div>
          ))}
        </section>

        {/* Enhanced Contact Form Section */}
        <section className="contact-form-section">
          <div className="form-container">
            <motion.div
              className="form-header"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2>Send us a Message</h2>
              <p>
                Fill out the form below and we&apos;ll get back to you as soon
                as possible.
              </p>
            </motion.div>

            <Form
              form={form}
              name="contact"
              onFinish={onFinish}
              layout="vertical"
              className="contact-form"
            >
              <motion.div
                className="form-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="form-row">
                  <Form.Item
                    name="firstName"
                    label="First Name"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your first name",
                      },
                    ]}
                  >
                    <Input placeholder="John" />
                  </Form.Item>

                  <Form.Item
                    name="lastName"
                    label="Last Name"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your last name",
                      },
                    ]}
                  >
                    <Input placeholder="Doe" />
                  </Form.Item>
                </div>

                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: "Please enter your email" },
                    { type: "email", message: "Please enter a valid email" },
                  ]}
                >
                  <Input placeholder="john@example.com" />
                </Form.Item>

                <Form.Item
                  name="subject"
                  label="Subject"
                  rules={[
                    { required: true, message: "Please select a subject" },
                  ]}
                >
                  <Select placeholder="Select a subject">
                    <Option value="support">Technical Support</Option>
                    <Option value="sales">Sales Inquiry</Option>
                    <Option value="billing">Billing Question</Option>
                    <Option value="feedback">Product Feedback</Option>
                    <Option value="other">Other</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="message"
                  label="Message"
                  rules={[
                    { required: true, message: "Please enter your message" },
                  ]}
                >
                  <TextArea rows={6} placeholder="How can we help you?" />
                </Form.Item>

                <Form.Item>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      icon={
                        submitted ? <CheckCircleOutlined /> : <SendOutlined />
                      }
                    >
                      {submitted ? "Sent!" : "Send Message"}
                    </Button>
                  </motion.div>
                </Form.Item>
              </motion.div>
            </Form>
          </div>

          <motion.div
            className="contact-info"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="info-section">
              <h3>Office Hours</h3>
              <p>Monday - Friday</p>
              <p>9:00 AM - 6:00 PM EST</p>
            </div>

            <div className="info-section">
              <h3>Follow Us</h3>
              <div className="social-links">
                <motion.a
                  href="https://twitter.com/promptcue"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -3, scale: 1.1 }}
                >
                  <TwitterOutlined />
                </motion.a>
                <motion.a
                  href="https://linkedin.com/company/promptcue"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -3, scale: 1.1 }}
                >
                  <LinkedinOutlined />
                </motion.a>
                <motion.a
                  href="https://github.com/promptcue"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -3, scale: 1.1 }}
                >
                  <GithubOutlined />
                </motion.a>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPageLayout;
