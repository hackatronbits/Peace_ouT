import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import "highlight.js/styles/github-dark.css";
import { Modal } from "antd";
import Image from "next/image";

interface FormattedMessageProps {
  content: string;
  isImageGeneration?: boolean;
  imageUrl?: string;
}

interface CodeProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

const FormattedMessage: React.FC<FormattedMessageProps> = ({
  content,
  isImageGeneration,
  imageUrl,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Clean up markdown content
  const cleanContent = content
    // Replace multiple newlines with a single newline
    .replace(/\n\s*\n/g, "\n")
    // Remove newlines between headings and tables
    .replace(/^(#{1,6}.*)\n+(\|.*\n)/gm, "$1\n$2")
    // Ensure table rows are properly separated
    .replace(/\|\n+\|/g, "|\n|")
    // Add explicit newline after table end
    .replace(/(\|[^\n]*\|\s*)(\n[^|])/g, "$1\n\n$2");

  const TableComponent: React.FC<{ children: React.ReactNode }> = ({
    children,
    ...props
  }) => {
    const tableRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const checkScroll = () => {
        if (tableRef.current) {
          const isScrollable =
            tableRef.current.scrollWidth > tableRef.current.clientWidth;
          if (isScrollable) {
            tableRef.current.classList.add("is-scrollable");
          } else {
            tableRef.current.classList.remove("is-scrollable");
          }
        }
      };

      // Check on mount and window resize
      checkScroll();
      window.addEventListener("resize", checkScroll);

      return () => window.removeEventListener("resize", checkScroll);
    }, []);

    return (
      <div className="table-container" ref={tableRef}>
        <table className="markdown-table" {...props}>
          {children}
        </table>
      </div>
    );
  };

  const components = {
    code: ({ node, inline, className, children, ...props }: CodeProps) => {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <pre className="code-block">
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      ) : (
        <span className="inline-code-wrapper">
          <code className="inline-code" {...props}>
            {children}
          </code>
        </span>
      );
    },
    table: TableComponent,
    thead: ({ children, ...props }) => <thead {...props}>{children}</thead>,
    tbody: ({ children, ...props }) => <tbody {...props}>{children}</tbody>,
    tr: ({ children, ...props }) => <tr {...props}>{children}</tr>,
    th: ({ children, ...props }) => <th {...props}>{children}</th>,
    td: ({ children, ...props }) => <td {...props}>{children}</td>,
    a: ({ node, ...props }) => (
      <a target="_blank" rel="noopener noreferrer" {...props} />
    ),
    ul: ({ ...props }) => <ul className="markdown-list" {...props} />,
    ol: ({ ...props }) => <ol className="markdown-list" {...props} />,
    li: ({ ...props }) => <li className="markdown-list-item" {...props} />,
    p: ({ children, ...props }) => {
      // Check if this is a table-related paragraph
      const childArray = React.Children.toArray(children);
      const isTableParagraph = childArray.some(
        (child) =>
          typeof child === "object" &&
          child !== null &&
          "type" in child &&
          (child.type === "table" ||
            (typeof child.type === "string" && child.type.includes("table"))),
      );

      // If it's a table paragraph, don't wrap it
      if (isTableParagraph) {
        return <>{children}</>;
      }

      // For non-table paragraphs, wrap normally
      return <p {...props}>{children}</p>;
    },
  };

  if (isImageGeneration && imageUrl) {
    return (
      <div className="message-content">
        <div className="generated-image">
          <Image
            src={imageUrl}
            alt="Generated"
            style={{
              maxWidth: "300px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
            onClick={() => setIsModalOpen(true)}
          />
        </div>
        <div className="image-prompt">
          <ReactMarkdown
            rehypePlugins={[rehypeRaw, rehypeHighlight]}
            remarkPlugins={[remarkGfm]}
            components={components}
          >
            {cleanContent}
          </ReactMarkdown>
        </div>
        <Modal
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
          width={800}
        >
          <Image
            src={imageUrl}
            alt="Generated"
            style={{
              maxWidth: "100%",
              maxHeight: "70vh",
              borderRadius: "8px",
            }}
          />
        </Modal>
      </div>
    );
  }

  return (
    <div className="markdown-content">
      <ReactMarkdown
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {cleanContent}
      </ReactMarkdown>
    </div>
  );
};

export default FormattedMessage;
