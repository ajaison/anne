import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';

interface FlashcardContentProps {
  content: string;
  /** If true, wraps bare text in a java code block automatically */
  forceJava?: boolean;
}

const CopyableCodeBlock = ({ code, language }: { code: string; language: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span className="code-lang-badge">{language}</span>
        <button className="code-copy-btn" onClick={handleCopy} title="Copy code">
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        style={vscDarkPlus as any}
        language={language}
        PreTag="div"
        showLineNumbers={true}
        lineNumberStyle={{ color: '#4a5568', fontSize: '0.8em', minWidth: '2.5em' }}
        customStyle={{
          margin: 0,
          borderRadius: '0 0 10px 10px',
          fontSize: '0.92rem',
          lineHeight: '1.6',
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

export const FlashcardContent: React.FC<FlashcardContentProps> = ({ content, forceJava }) => {
  // If content doesn't contain a fenced code block but forceJava is set, wrap it
  const processedContent = forceJava && !content.includes('```')
    ? `\`\`\`java\n${content}\n\`\`\``
    : content;

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ node, inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || '');
          const language = match ? match[1] : 'java';
          const codeString = String(children).replace(/\n$/, '');
          const isBlock = !inline || codeString.includes('\n');

          return isBlock ? (
            <CopyableCodeBlock code={codeString} language={language} />
          ) : (
            <code className={`inline-code ${className || ''}`} {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {processedContent}
    </ReactMarkdown>
  );
};

