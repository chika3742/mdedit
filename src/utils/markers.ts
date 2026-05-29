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

// Detect a marker at the start/end of the range (for a cursor, peek just outside the range too).
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

// Whether the cursor (or the selection's start/end) is wrapped in markers.
// Detects states the syntax tree does not turn into a node, such as an empty **|**.
export function hasSurroundingMarkers(doc: Text, sel: SelectionRange, spec: MarkerSpec): boolean {
  return matchLen(doc, sel, spec, "start") >= 0 && matchLen(doc, sel, spec, "end") >= 0
}
