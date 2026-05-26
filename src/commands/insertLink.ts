import type { Command } from "@codemirror/view"
import { EditorSelection } from "@codemirror/state"

export const insertLink: Command = (view) => {
  const { state } = view
  const changes = state.changeByRange((range) => {
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
