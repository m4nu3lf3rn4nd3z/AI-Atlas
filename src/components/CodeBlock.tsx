import { Check, Copy } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { HighlighterCore } from 'shiki/core'
import { cn } from '@/lib/cn'

/* Shiki is loaded on first use with only the grammars we need and the
   JavaScript regex engine (no WASM), then shared by every code block. */

const LANGS = ['python', 'typescript', 'tsx', 'bash', 'json'] as const
type Lang = (typeof LANGS)[number]

let highlighter: Promise<HighlighterCore> | null = null

function getHighlighter() {
  highlighter ??= (async () => {
    const [{ createHighlighterCore }, { createJavaScriptRegexEngine }] = await Promise.all([
      import('shiki/core'),
      import('shiki/engine/javascript'),
    ])
    return createHighlighterCore({
      themes: [
        import('shiki/themes/github-light-default.mjs'),
        import('shiki/themes/github-dark-default.mjs'),
      ],
      langs: [
        import('shiki/langs/python.mjs'),
        import('shiki/langs/typescript.mjs'),
        import('shiki/langs/tsx.mjs'),
        import('shiki/langs/bash.mjs'),
        import('shiki/langs/json.mjs'),
      ],
      engine: createJavaScriptRegexEngine(),
    })
  })()
  return highlighter
}

const ALIASES: Record<string, Lang> = { py: 'python', ts: 'typescript', js: 'typescript', sh: 'bash', shell: 'bash' }

function normalize(lang: string | undefined): Lang | 'text' {
  if (!lang) return 'text'
  const l = ALIASES[lang] ?? lang
  return (LANGS as readonly string[]).includes(l) ? (l as Lang) : 'text'
}

export function CodeBlock({
  code,
  lang,
  title,
  className,
}: {
  code: string
  lang?: string
  title?: string
  className?: string
}) {
  const [html, setHtml] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const language = normalize(lang)
  const source = code.replace(/\n$/, '')

  useEffect(() => {
    let alive = true
    if (language === 'text') return
    getHighlighter().then((h) => {
      if (!alive) return
      setHtml(
        h.codeToHtml(source, {
          lang: language,
          themes: { light: 'github-light-default', dark: 'github-dark-default' },
          defaultColor: false,
        }),
      )
    })
    return () => {
      alive = false
    }
  }, [source, language])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(source)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard blocked: nothing to do */
    }
  }

  return (
    <div className={cn('group relative overflow-hidden rounded-xl border border-border bg-surface-2/60', className)}>
      <div className="flex h-9 items-center gap-2 border-b border-border px-3">
        <span className="font-mono text-[11px] text-subtle">
          {title ?? (language === 'text' ? '' : language)}
        </span>
        <button
          type="button"
          onClick={copy}
          className="ml-auto flex h-6 cursor-pointer items-center gap-1 rounded-md px-1.5 text-[11px] text-subtle hover:bg-surface-3 hover:text-fg"
          aria-label="Copiar código"
        >
          {copied ? <Check className="size-3.5 text-ok" /> : <Copy className="size-3.5" />}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <div className="overflow-x-auto px-4 py-3">
        {html ? (
          <div dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <pre className="shiki">
            <code>{source}</code>
          </pre>
        )}
      </div>
    </div>
  )
}
