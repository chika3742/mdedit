import type { Command } from "@codemirror/view"
import { EditorSelection, type EditorState, type Line, type SelectionRange } from "@codemirror/state"
import { syntaxTree } from "@codemirror/language"
import { intersectsCode } from "../utils/intersectsCode.js"

// Returns the line holding a HorizontalRule node that covers `range`, or null.
function horizontalRuleLineAt(state: EditorState, range: SelectionRange): Line | null {
  let found = false
  syntaxTree(state).iterate({
    from: range.from, to: range.to,
    enter: (node) => {
      if (node.name === "HorizontalRule" && node.from <= range.from && node.to >= range.to) {
        found = true
        return false
      }
      return !found
    },
  })
  return found ? state.doc.lineAt(range.head) : null
}

// Toggle a horizontal rule (`---`): remove it when the caret sits on an existing
// rule, otherwise insert one at the cursor (prefixed with a newline when the
// current line already has content).
export const toggleHorizontalRule: Command = (view) => {
  const { state } = view
  const changes = state.changeByRange((range) => {
    if (intersectsCode(state, range)) {
      return { changes: [], range }
    }
    const ruleLine = horizontalRuleLineAt(state, range)
    if (ruleLine) {
      // Remove the rule line together with one adjacent newline.
      let from = ruleLine.from
      let to = ruleLine.to
      if (to < state.doc.length) {
        to += 1
      }
      else if (from > 0) {
        from -= 1
      }
      return { changes: { from, to }, range: EditorSelection.cursor(from) }
    }
    const line = state.doc.lineAt(range.head)
    const lead = line.length === 0 ? "" : "\n"
    const insert = lead + "---\n"
    return {
      changes: { from: range.head, insert },
      range: EditorSelection.cursor(range.head + insert.length),
    }
  })
  view.dispatch(state.update(changes, { scrollIntoView: true }))
  return true
}
