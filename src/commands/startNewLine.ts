import type { Command, EditorView } from "@codemirror/view"
import { EditorSelection } from "@codemirror/state"

export const startNewLine: Command = (view: EditorView) => {
  const { state } = view
  const cursorPos = state.selection.main.head
  const lineEndPos = state.doc.lineAt(cursorPos).to
  view.dispatch({
    changes: state.changes({
      from: lineEndPos,
      insert: "\n",
    }),
    selection: EditorSelection.cursor(lineEndPos + 1),
    scrollIntoView: true,
  })
  return true
}
