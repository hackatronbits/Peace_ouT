"use client";
import React, { useEffect, useState, useRef } from "react";
import { Button, Tag } from "antd";
import {
  RocketOutlined,
  GlobalOutlined,
  TeamOutlined,
  TrophyOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import Header from "../../../components/Navigation/Header/Header";
import Footer from "../../../components/Navigation/Footer/Footer";
import "./careers.css";
import { motion, useScroll } from "framer-motion";

const CareersPageLayout = () => {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");

  const departments = [
    "All",
    "Engineering",
    "Product",
    "Design",
    "Marketing",
    "Sales",
  ];

  const openPositions = [
    {
      id: 1,
      title: "Senior Full Stack Engineer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      experience: "5+ years",
    },
    {
      id: 2,
      title: "Product Designer",
      department: "Design",
      location: "Remote",
      type: "Full-time",
      experience: "3+ years",
    },
    {
      id: 3,
      title: "AI/ML Engineer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      experience: "4+ years",
    },
  ];

  const [animatedStats, setAnimatedStats] = useState({
    remote: 0,
    countries: 0,
    growth: 0,
  });

  const statsRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: statsRef,
    offset: ["start end", "end start"],
  });

  useEffect(() => {
    const animateStats = () => {
      const duration = 2000;
      const steps = 60;
      let currentStep = 0;

      const interval = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;

        setAnimatedStats({
          remote: Math.round(progress * 100),
          countries: Math.round(progress * 20),
          growth: Math.round(progress * 100),
        });

        if (currentStep >= steps) clearInterval(interval);
      }, duration / steps);

      return () => clearInterval(interval);
    };

    animateStats();
  }, []);

  useEffect(() => {
    document.title = "Careers - PromptCue";
  });

  return (
    <div className="careers-page">
      <Header />

      <main className="careers-main">
        {/* Enhanced Hero Section */}
        <motion.section
          className="careers-hero"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="hero-content">
            <h1>Join Us in Shaping the Future of AI</h1>
            <p>
              At PromptCue, we&apos;re building the next generation of AI tools
              that empower developers and businesses to achieve more.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button type="primary" size="large" href="#positions">
                View Open Positions
              </Button>
            </motion.div>
          </div>
          <div className="hero-stats" ref={statsRef}>
            <motion.div
              className="stat-item"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="stat-number">{animatedStats.remote}%</span>
              <span className="stat-label">Remote-First</span>
            </motion.div>
            <motion.div
              className="stat-item"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <span className="stat-number">{animatedStats.countries}+</span>
              <span className="stat-label">Countries</span>
            </motion.div>
            <motion.div
              className="stat-item"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <span className="stat-number">∞</span>
              <span className="stat-label">Growth Potential</span>
            </motion.div>
          </div>
          <div className="hero-background">
            <div className="gradient-sphere"></div>
            <div className="gradient-sphere secondary"></div>
          </div>
        </motion.section>

        {/* Enhanced Values Section */}
        <section className="values-section">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Our Values
          </motion.h2>
          <div className="values-grid">
            <motion.div
              className="value-card"
              whileHover={{ y: -10, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <RocketOutlined className="value-icon" />
              <h3>Innovation First</h3>
              <p>
                We push boundaries and embrace cutting-edge technologies to
                solve complex problems.
              </p>
            </motion.div>
            <motion.div
              className="value-card"
              whileHover={{ y: -10, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <TeamOutlined className="value-icon" />
              <h3>Collaborative Spirit</h3>
              <p>
                We believe great ideas come from diverse perspectives and
                teamwork.
              </p>
            </motion.div>
            <motion.div
              className="value-card"
              whileHover={{ y: -10, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
            >
              <GlobalOutlined className="value-icon" />
              <h3>Global Impact</h3>
              <p>
                We&apos;re building tools that transform how the world interacts
                with AI.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Enhanced Benefits Section */}
        <section className="benefits-section">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Why PromptCue?
          </motion.h2>
          <div className="benefits-grid">
            <motion.div
              className="benefit-card"
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="benefit-icon">🌍</div>
              <h3>Remote-First Culture</h3>
              <p>
                Work from anywhere in the world. We believe in flexibility and
                trust.
              </p>
            </motion.div>
            <motion.div
              className="benefit-card"
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="benefit-icon">💪</div>
              <h3>Competitive Package</h3>
              <p>
                Attractive salary, equity, and comprehensive benefits package.
              </p>
            </motion.div>
            <motion.div
              className="benefit-card"
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="benefit-icon">📚</div>
              <h3>Learning Budget</h3>
              <p>Annual budget for courses, conferences, and books.</p>
            </motion.div>
            <motion.div
              className="benefit-card"
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="benefit-icon">⚡</div>
              <h3>Latest Tech Stack</h3>
              <p>Work with cutting-edge technologies and AI models.</p>
            </motion.div>
            <motion.div
              className="benefit-card"
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="benefit-icon">🏖️</div>
              <h3>Flexible Time Off</h3>
              <p>Unlimited PTO policy with minimum 20 days encouraged.</p>
            </motion.div>
            <motion.div
              className="benefit-card"
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="benefit-icon">🚀</div>
              <h3>Career Growth</h3>
              <p>Clear growth paths and regular promotion cycles.</p>
            </motion.div>
          </div>
        </section>

        {/* Enhanced Process Section with Interactive Timeline */}
        <section className="process-section">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Our Hiring Process
          </motion.h2>
          <div className="process-steps">
            {[1, 2, 3, 4, 5].map((step, index) => (
              <motion.div
                key={step}
                className="process-step"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <div className="step-number">{step}</div>
                <h3>{getStepTitle(step)}</h3>
                <p>{getStepDescription(step)}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Enhanced Open Positions Section */}
        <section id="positions" className="positions-section">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Open Positions
          </motion.h2>
          <div className="departments-filter">
            {departments.map((dept) => (
              <Button
                key={dept}
                type={
                  selectedDepartment.toLowerCase() === dept.toLowerCase()
                    ? "primary"
                    : "default"
                }
                onClick={() => setSelectedDepartment(dept.toLowerCase())}
              >
                {dept}
              </Button>
            ))}
          </div>
          <div className="positions-grid">
            {openPositions
              .filter(
                (position) =>
                  selectedDepartment === "all" ||
                  position.department.toLowerCase() === selectedDepartment,
              )
              .map((position) => (
                <div key={position.id} className="position-card">
                  <div className="position-header">
                    <h3>{position.title}</h3>
                    <Tag color="blue">{position.department}</Tag>
                  </div>
                  <div className="position-details">
                    <span>
                      <GlobalOutlined /> {position.location}
                    </span>
                    <span>
                      <CalendarOutlined /> {position.type}
                    </span>
                    <span>
                      <TrophyOutlined /> {position.experience}
                    </span>
                  </div>
                  <Button type="primary">Apply Now</Button>
                </div>
              ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

// Helper functions for step titles and descriptions
const getStepTitle = (step: number) => {
  const titles = {
    1: "Application Review",
    2: "Initial Chat",
    3: "Technical Round",
    4: "Team Interview",
    5: "Offer",
  };
  return titles[step as keyof typeof titles];
};

const getStepDescription = (step: number) => {
  const descriptions = {
    1: "We review your application within 48 hours",
    2: "Quick call to get to know each other",
    3: "Role-specific assessment",
    4: "Meet your potential teammates",
    5: "Welcome to PromptCue!",
  };
  return descriptions[step as keyof typeof descriptions];
};

export default CareersPageLayout;
