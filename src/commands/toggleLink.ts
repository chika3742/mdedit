import type { Command } from "@codemirror/view"
import { EditorSelection, type EditorState, type SelectionRange } from "@codemirror/state"
import { syntaxTree } from "@codemirror/language"
import { intersectsCode } from "../utils/intersectsCode.js"

// Returns the smallest Link node range covering `range`, or null.
function linkNodeAt(state: EditorState, range: SelectionRange): { from: number, to: number } | null {
  let result: { from: number, to: number } | null = null
  let smallest = Infinity
  syntaxTree(state).iterate({
    from: range.from, to: range.to,
    enter: (node) => {
      if (node.name === "Link" && node.from <= range.from && node.to >= range.to && node.to - node.from < smallest) {
        result = { from: node.from, to: node.to }
        smallest = node.to - node.from
      }
    },
  })
  return result
}

// Toggle a link: unwrap to the link text when the selection is inside a link,
// otherwise wrap the selection in a `[text](url)` template.
export const toggleLink: Command = (view) => {
  const { state } = view
  const changes = state.changeByRange((range) => {
    if (intersectsCode(state, range)) {
      return { changes: [], range }
    }
    const link = linkNodeAt(state, range)
    if (link) {
      const match = /^\[([^\]]*)\]\([^)]*\)$/.exec(state.doc.sliceString(link.from, link.to))
      if (match) {
        const linkText = match[1]
        return {
          changes: { from: link.from, to: link.to, insert: linkText },
          range: EditorSelection.range(link.from, link.from + linkText.length),
        }
      }
    }
    const text = state.doc.sliceString(range.from, range.to) || "Link Text"
    const insert = `[${text}](url)`
    // Place the selection over the "url" placeholder.
    const urlStart = range.from + text.length + 3
    return {
      changes: { from: range.from, to: range.to, insert },
      range: EditorSelection.range(urlStart, urlStart + 3),
    }
  })
  view.dispatch(state.update(changes, { scrollIntoView: true }))
  return true
}
