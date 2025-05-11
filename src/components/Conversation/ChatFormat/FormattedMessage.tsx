import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import "highlight.js/styles/github-dark.css";

interface FormattedMessageProps {
  content: string;
}

interface CodeProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

const FormattedMessage: React.FC<FormattedMessageProps> = ({ content }) => {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        remarkPlugins={[remarkGfm]}
        components={{
          code: ({
            node,
            inline,
            className,
            children,
            ...props
          }: CodeProps) => {
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
          a: ({ node, ...props }) => (
            <a
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
              {...props}
            />
          ),
          ul: ({ ...props }) => <ul className="markdown-list" {...props} />,
          ol: ({ ...props }) => <ol className="markdown-list" {...props} />,
          li: ({ ...props }) => (
            <li className="markdown-list-item" {...props} />
          ),
          p: ({ ...props }) => <p {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default FormattedMessage;
