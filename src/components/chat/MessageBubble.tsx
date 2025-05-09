"use client";

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Copy, Check } from 'lucide-react';

const CodeBlock = ({ inline, className, children }: any) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');

  const handleCopy = () => {
    navigator.clipboard.writeText(children).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    });
  };

  if (!inline && match) {
    return (
      <div className="relative group">
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 z-10 text-sm text-white bg-black bg-opacity-40 rounded p-1 hover:bg-opacity-60 transition"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
        <SyntaxHighlighter language={match[1]} style={oneDark} PreTag="div">
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      </div>
    );
  }

  return <code className={className}>{children}</code>;
};

const TypingBubble = () => (
  <div className="flex items-center space-x-1 px-4 py-2">
    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" />
  </div>
);

export function MessageBubble({
  message,
  isLoading,
  role,
}: {
  message: string;
  isLoading?: boolean;
  role: string;
}) {
  const isUser = role === 'user';
  const alignment = isUser ? 'justify-end' : 'justify-start';
  const bubbleColor = isUser ? 'bg-blue-600' : 'bg-[#1f1f1f]';

  return (
    <div className={`w-full flex ${alignment} px-4 py-2`}>
      <div
        className={`${bubbleColor} text-white p-4 rounded-xl shadow-sm max-w-md whitespace-pre-wrap`}
      >
        {isLoading ? (
          <TypingBubble />
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]} // This plugin enables GFM features, including tables
            rehypePlugins={[rehypeSanitize]} // This sanitizes HTML; defaults allow tables
            components={{ code: CodeBlock }}
          >
            {message}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}
