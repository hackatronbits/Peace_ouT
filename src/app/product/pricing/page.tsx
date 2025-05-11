"use client";
import React, { useState } from "react";
import { Button, Switch, Tooltip, Badge } from "antd";
import {
  CheckOutlined,
  InfoCircleOutlined,
  ArrowRightOutlined,
  ThunderboltOutlined,
  RocketOutlined,
  CrownOutlined,
  StarOutlined,
} from "@ant-design/icons";
import Header from "../../../components/Navigation/Header/Header";
import Footer from "../../../components/Navigation/Footer/Footer";
import "./pricing.css";

const PricingPage = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  const calculatePrice = (monthly: number) => {
    const annual = monthly * 12 * 0.8; // 20% discount
    return isAnnual ? Math.round(annual / 12) : monthly;
  };

  const plans = [
    {
      name: "Starter",
      icon: <ThunderboltOutlined />,
      price: calculatePrice(29),
      description: "Perfect for individuals and small projects",
      features: [
        "10,000 API calls/month",
        "10 AI Agents",
        "Basic analytics",
        "Community support",
        "API access",
        "Standard rate limits",
      ],
      popular: false,
      buttonText: "Start Free Trial",
      type: "default",
    },
    {
      name: "Pro",
      icon: <RocketOutlined />,
      price: calculatePrice(99),
      description: "Ideal for growing teams and businesses",
      features: [
        "100,000 API calls/month",
        "Unlimited AI Agents",
        "Advanced analytics",
        "Priority support",
        "Enhanced API access",
        "Higher rate limits",
        "Custom models",
        "Team collaboration",
        "Audit logs",
      ],
      popular: true,
      buttonText: "Get Started",
      type: "primary",
    },
    {
      name: "Enterprise",
      icon: <CrownOutlined />,
      price: "Custom",
      description: "For large organizations with custom needs",
      features: [
        "Unlimited API calls",
        "Custom AI models",
        "Advanced security",
        "24/7 dedicated support",
        "Dedicated account manager",
        "Custom contracts",
        "SOC 2 compliance",
        "SLA guarantee",
        "On-premise deployment",
      ],
      popular: false,
      buttonText: "Contact Sales",
      type: "default",
    },
  ];

  const additionalFeatures = [
    {
      icon: <StarOutlined />,
      title: "Free Trial",
      description: "Try all Pro features free for 14 days",
    },
    {
      icon: <CheckOutlined />,
      title: "No Credit Card Required",
      description: "Start your trial without any commitment",
    },
    {
      icon: <InfoCircleOutlined />,
      title: "Cancel Anytime",
      description: "No long-term contracts, cancel when you want",
    },
  ];

  return (
    <div className="pricing-page">
      <Header />

      <main className="pricing-main">
        <section className="pricing-hero">
          <h1>Choose Your Perfect Plan</h1>
          <p>Start building with PromptCue today. Scale as you grow.</p>

          <div className="billing-toggle">
            <span className={!isAnnual ? "active" : ""}>Monthly</span>
            <Switch
              checked={isAnnual}
              onChange={setIsAnnual}
              className="billing-switch"
            />
            <span className={isAnnual ? "active" : ""}>Annual</span>
            <Badge className="save-badge" count="Save 20%" />
          </div>
        </section>

        <section className="pricing-cards">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`pricing-card ${plan.popular ? "popular" : ""}`}
            >
              {plan.popular && <div className="popular-tag">Most Popular</div>}
              <div className="card-header">
                <div className="plan-icon">{plan.icon}</div>
                <h2>{plan.name}</h2>
                <p className="plan-description">{plan.description}</p>
              </div>

              <div className="price-section">
                <div className="price">
                  {plan.price === "Custom" ? (
                    <span className="custom-price">Custom</span>
                  ) : (
                    <>
                      <span className="currency">$</span>
                      <span className="amount">{plan.price}</span>
                      <span className="period">
                        /{isAnnual ? "mo, billed annually" : "month"}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="features-list">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="feature-item">
                    <CheckOutlined className="feature-icon" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                type={plan.type as "default" | "primary"}
                size="large"
                block
                className="plan-button"
              >
                {plan.buttonText}
                <ArrowRightOutlined />
              </Button>
            </div>
          ))}
        </section>

        <section className="additional-features">
          {additionalFeatures.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </section>

        <section className="pricing-faq">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3>What&apos;s included in the free trial?</h3>
              <p>
                You get full access to all Pro features for 14 days, including
                unlimited AI agents, advanced analytics, and priority support.
              </p>
            </div>
            <div className="faq-item">
              <h3>Can I change plans later?</h3>
              <p>
                Yes, you can upgrade, downgrade, or cancel your plan at any
                time. Changes take effect at the start of the next billing
                cycle.
              </p>
            </div>
            <div className="faq-item">
              <h3>What payment methods do you accept?</h3>
              <p>
                We accept all major credit cards, PayPal, and wire transfers for
                Enterprise plans.
              </p>
            </div>
            <div className="faq-item">
              <h3>Do you offer refunds?</h3>
              <p>
                Yes, we offer a 30-day money-back guarantee if you&apos;re not
                satisfied with our service.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PricingPage;
