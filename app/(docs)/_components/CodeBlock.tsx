'use client'

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import styles from '../docs.module.css'

interface CodeBlockProps {
  className?: string
  children: string
}

export default function CodeBlock({ className, children }: CodeBlockProps) {
  const language = className?.replace('language-', '') || 'text'
  const code = children.trim()

  return (
    <div className={styles.codeBlockWrapper}>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          borderRadius: '8px',
          padding: '16px',
          fontSize: '13px',
          lineHeight: '1.6',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}
