import type { SelectionRange, Text } from "@codemirror/state"

export interface MarkerSpec {
  /**
   * @example "**"
   */
  template: string

  /**
   * @example "StrongEmphasis"
   */
  nodeName: string

  /**
   * @example /\*\*|__/g
   */
  matcher: RegExp
}

export const boldSpec: MarkerSpec = {
  template: "**",
  nodeName: "StrongEmphasis",
  matcher: /\*\*|__/g,
}

export const italicSpec: MarkerSpec = {
  template: "*",
  nodeName: "Emphasis",
  matcher: /[*_]/g,
}

export const strikethroughSpec: MarkerSpec = {
  template: "~~",
  nodeName: "Strikethrough",
  matcher: /~~/g,
}

export const inlineCodeSpec: MarkerSpec = {
  template: "`",
  nodeName: "InlineCode",
  matcher: /`/g,
}

// 範囲の先頭/末尾にマーカーがあるか判定（カーソル時は範囲外も少し見る）
export function matchLen(doc: Text, sel: SelectionRange, spec: MarkerSpec, side: "start" | "end"): number {
  const buf = spec.template.length
  const [from, to] = sel.empty
    ? (side === "start" ? [sel.from - buf, sel.to] : [sel.from, sel.to + buf])
    : [sel.from, sel.to]
  const text = doc.sliceString(from, to)
  spec.matcher.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = spec.matcher.exec(text)) !== null) {
    if (side === "start" && m.index === 0) return m[0].length
    if (side === "end" && m.index + m[0].length === text.length) return m[0].length
  }
  return -1
}

// カーソル前後（または選択の先頭末尾）がマーカーで囲まれているか。
// 空の **|** のように syntaxTree でノード化されない状態を検出する。
export function hasSurroundingMarkers(doc: Text, sel: SelectionRange, spec: MarkerSpec): boolean {
  return matchLen(doc, sel, spec, "start") >= 0 && matchLen(doc, sel, spec, "end") >= 0
}
