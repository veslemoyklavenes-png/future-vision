'use client'
import ReactMarkdown from 'react-markdown'

export default function Markdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => <p className="text-slate-700 text-sm leading-relaxed mb-3 last:mb-0">{children}</p>,
        strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
        em: ({ children }) => <em className="italic text-slate-600">{children}</em>,
        h1: ({ children }) => <h1 className="text-lg font-bold text-slate-800 mb-2 mt-4">{children}</h1>,
        h2: ({ children }) => <h2 className="text-base font-semibold text-slate-800 mb-2 mt-3">{children}</h2>,
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
