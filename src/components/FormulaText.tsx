import React from 'react'

function isSubscriptDigit(prev: string, next: string): boolean {
  // a digit that follows a letter or ')' and is not part of a larger number is a subscript
  return /[A-Za-z\)]/.test(prev) && /\d/.test(next)
}

export function FormulaText({ text }: { text: string }) {
  // handle ^...</sup>
  const parts: React.ReactNode[] = []
  let i = 0
  let key = 0
  while (i < text.length) {
    const ch = text[i]
    if (ch === '^') {
      let j = i + 1
      let sup = ''
      while (j < text.length && /[A-Za-z0-9+\-\u2070-\u209F]/.test(text[j])) sup += text[j++]
      parts.push(<sup key={key++}>{sup}</sup>)
      i = j
    } else if (/\d/.test(ch) && i > 0 && isSubscriptDigit(text[i - 1], ch) && !/\d/.test(text[i - 1])) {
      let j = i
      let sub = ''
      while (j < text.length && /\d/.test(text[j])) sub += text[j++]
      parts.push(<sub key={key++}>{sub}</sub>)
      i = j
    } else {
      parts.push(<React.Fragment key={key++}>{ch}</React.Fragment>)
      i++
    }
  }
  return <span className="formula">{parts}</span>
}
