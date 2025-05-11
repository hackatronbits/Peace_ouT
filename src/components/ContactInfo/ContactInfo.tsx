import React from "react";
import { Modal, Button } from "antd";
import {
  FileProtectOutlined,
  BugTwoTone,
  BulbTwoTone,
  StarTwoTone,
  SafetyCertificateTwoTone,
} from "@ant-design/icons";
import Link from "next/link";

interface ContactInfoProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContactInfo: React.FC<ContactInfoProps> = ({ isOpen, onClose }) => {
  const menuItems = [
    {
      icon: <BulbTwoTone twoToneColor="#36c121" />,
      title: "What's New",
      link: "/info/whatsnew",
      description: "Check out our latest features and updates",
    },
    {
      icon: <BugTwoTone twoToneColor="#eb2f96" />,
      title: "Report a Bug",
      link: "/info/bugReport",
      description: "Help us improve by reporting issues",
    },
    {
      icon: <StarTwoTone twoToneColor="#eecd1e" />,
      title: "Suggest Features",
      link: "/info/ideas",
      description: "Share your ideas for new features",
    },
    {
      icon: <FileProtectOutlined />,
      title: "Terms & Conditions",
      link: "/legal/tnc",
      description: "Read our terms of service",
    },
    {
      icon: <SafetyCertificateTwoTone twoToneColor="#7144e1" />,
      title: "Privacy Policy",
      link: "/legal/privacy",
      description: "Learn about our privacy practices",
    },
  ];

  return (
    <Modal
      title="Contact & Information"
      open={isOpen}
      onCancel={onClose}
      closeIcon={null}
      footer={[
        <Button key="close" onClick={onClose} style={{ marginTop: "12px" }}>
          Close
        </Button>,
      ]}
      width={600}
      className="contact-info-modal"
    >
      <div className="contact-info-grid">
        {menuItems.map((item, index) => (
          <Link
            href={item.link}
            target="__blank"
            key={index}
            className="contact-info-tile"
          >
            <div className="contact-info-tile-content">
              <div className="contact-info-icon">{item.icon}</div>
              <div className="contact-info-text">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Modal>
  );
};

export default ContactInfo;
