import type { Command, EditorView } from "@codemirror/view"
import { EditorSelection } from "@codemirror/state"
import { createToggleCommand } from "./createToggleCommand.js"
import { boldSpec, inlineCodeSpec, italicSpec, strikethroughSpec } from "../utils/markers.js"

export const toggleBold = createToggleCommand(boldSpec)
export const toggleItalic = createToggleCommand(italicSpec)
export const toggleStrikethrough = createToggleCommand(strikethroughSpec)
export const toggleCode: Command = (view: EditorView) => {
  const { state } = view
  if (!state.selection.main.empty || state.doc.lineAt(state.selection.main.head).length !== 0) {
    return createToggleCommand(inlineCodeSpec)(view)
  }
  const change = state.changeByRange((range) => {
    return {
      changes: {
        from: range.head,
        insert: "```\n\n```",
      },
      range: EditorSelection.range(range.head + 3, range.head + 3),
    }
  })
  view.dispatch(change, { scrollIntoView: true })
  return true
}
