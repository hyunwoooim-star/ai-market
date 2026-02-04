'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface Props {
  content: string;
  isUser?: boolean;
}

function CopyButton({ text }: { text: string }) {
  const t = useTranslations('common');
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="absolute top-2 right-2 px-2 py-1 text-[10px] rounded-md bg-white/10 hover:bg-white/20 text-gray-300 transition-all"
    >
      {copied ? t('copied') : t('copy')}
    </button>
  );
}

export default function MarkdownRenderer({ content, isUser }: Props) {
  if (isUser) {
    return <p className="text-sm whitespace-pre-wrap leading-relaxed">{content}</p>;
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => (
          <p className="text-sm leading-relaxed mb-2 last:mb-0">{children}</p>
        ),
        h1: ({ children }) => (
          <h1 className="text-base font-bold mb-2 mt-3 first:mt-0">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-sm font-bold mb-1.5 mt-2.5 first:mt-0">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-sm font-semibold mb-1 mt-2 first:mt-0">{children}</h3>
        ),
        h4: ({ children }) => (
          <h4 className="text-sm font-semibold mb-1 mt-1.5 first:mt-0">{children}</h4>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic">{children}</em>
        ),
        ul: ({ children }) => (
          <ul className="text-sm list-disc list-inside mb-2 space-y-0.5">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="text-sm list-decimal list-inside mb-2 space-y-0.5">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="leading-relaxed">{children}</li>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-3 border-indigo-300 pl-3 my-2 text-sm text-gray-600 italic">
            {children}
          </blockquote>
        ),
        code: ({ className, children }) => {
          const isBlock = className?.includes('language-');
          const lang = className?.replace('language-', '') || '';
          const text = String(children).replace(/\n$/, '');

          if (isBlock) {
            return (
              <div className="relative my-2 rounded-lg overflow-hidden">
                {lang && (
                  <div className="bg-gray-800 text-gray-400 text-[10px] px-3 py-1 font-mono">
                    {lang}
                  </div>
                )}
                <pre className="bg-gray-900 text-gray-100 text-xs p-3 overflow-x-auto font-mono leading-relaxed">
                  <code>{text}</code>
                </pre>
                <CopyButton text={text} />
              </div>
            );
          }

          return (
            <code className="bg-gray-200 dark:bg-gray-700 text-indigo-700 dark:text-indigo-300 text-xs px-1.5 py-0.5 rounded font-mono">
              {children}
            </code>
          );
        },
        pre: ({ children }) => <>{children}</>,
        table: ({ children }) => (
          <div className="overflow-x-auto my-2">
            <table className="text-xs border-collapse w-full dark:text-gray-300">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-gray-100 dark:bg-gray-800">{children}</thead>
        ),
        th: ({ children }) => (
          <th className="border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-left font-semibold text-gray-700 dark:text-gray-200">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border border-gray-200 dark:border-gray-700 px-2 py-1.5 text-gray-600 dark:text-gray-400">
            {children}
          </td>
        ),
        hr: () => <hr className="my-3 border-gray-200 dark:border-gray-700" />,
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2"
          >
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
