import type { Command } from "@codemirror/view"
import { EditorSelection } from "@codemirror/state"
import { intersectsCode } from "../utils/intersectsCode.js"

// Wrap the selection in a `<span style="color: ...">` template, leaving the
// selection over the color placeholder so it can be typed over immediately.
export const insertFontColor: Command = (view) => {
  const { state } = view
  const open = "<span style=\"color: "
  const placeholder = "red"
  const changes = state.changeByRange((range) => {
    if (intersectsCode(state, range)) {
      return { changes: [], range }
    }
    const text = state.doc.sliceString(range.from, range.to) || "Text"
    const insert = open + placeholder + ";\">" + text + "</span>"
    const placeholderStart = range.from + open.length
    return {
      changes: { from: range.from, to: range.to, insert },
      range: EditorSelection.range(placeholderStart, placeholderStart + placeholder.length),
    }
  })
  view.dispatch(state.update(changes, { scrollIntoView: true }))
  return true
}
