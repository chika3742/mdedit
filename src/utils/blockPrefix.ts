import { EditorSelection, type EditorState, type Line } from "@codemirror/state"
import { intersectsCode } from "./intersectsCode.js"

// Leading block-level prefixes recognised when toggling blockquotes / lists.
export const BLOCKQUOTE_RE = /^>\s?/
export const BULLET_RE = /^[-*+]\s+/
export const ORDERED_RE = /^\d+\.\s+/
// Leading ATX heading prefix; the capture group counts the `#` (the level).
export const HEADING_RE = /^(#{1,6})\s+/

// ATX heading level (1-6) at the start of `text`, or 0 when absent.
export function headingLevel(text: string): number {
  const match = HEADING_RE.exec(text)
  return match ? match[1].length : 0
}

// Length of the prefix matched by `re` at the start of `text`, or 0 when absent.
export function prefixLen(text: string, re: RegExp): number {
  const match = re.exec(text)
  return match ? match[0].length : 0
}

// Length of the first matching prefix among `candidates`, or 0 when none match.
// Used to strip a different block prefix before applying the target one.
export function otherPrefixLen(text: string, candidates: RegExp[]): number {
  for (const re of candidates) {
    const len = prefixLen(text, re)
    if (len > 0) return len
  }
  return 0
}

// Distinct line numbers covered by every selection range, in ascending order.
export function selectedLineNumbers(state: EditorState): number[] {
  const lineNumbers = new Set<number>()
  for (const range of state.selection.ranges) {
    const startLine = state.doc.lineAt(range.from).number
    const endLine = state.doc.lineAt(range.to).number
    for (let n = startLine; n <= endLine; n++) lineNumbers.add(n)
  }
  return [...lineNumbers].sort((a, b) => a - b)
}

// Lines a line-prefix toggle should act on: every line touched by the selection,
// excluding code lines and (only for multi-line selections) blank lines so a
// single empty line can still be turned into a list/quote.
export function targetLines(state: EditorState): Line[] {
  const lineNumbers = selectedLineNumbers(state)
  const multiLine = lineNumbers.length > 1
  const lines: Line[] = []
  for (const lineNumber of lineNumbers) {
    const line = state.doc.line(lineNumber)
    if (intersectsCode(state, EditorSelection.range(line.from, line.to))) continue
    if (multiLine && line.length === 0) continue
    lines.push(line)
  }
  return lines
}
