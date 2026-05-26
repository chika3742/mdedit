import type { Command, EditorView } from "@codemirror/view"
import { EditorSelection } from "@codemirror/state"

export const autocompleteCodeblock: Command = (view: EditorView) => {
  const { state } = view
  const sel = state.selection.main
  if (!sel.empty) return false

  const cursorPos = sel.anchor
  const before = state.doc.sliceString(Math.max(0, cursorPos - 4), cursorPos)

  const singleRegex = /[^`]?`$/
  const blockRegex = /[^`]?``$/

  if (blockRegex.exec(before)) {
    // open code block
    view.dispatch({
      changes: state.changes({
        from: cursorPos,
        insert: "`\n\n```",
      }),
      selection: EditorSelection.cursor(cursorPos + 1),
      scrollIntoView: true,
    })
    return true
  }
  if (singleRegex.exec(before)) {
    // already in inline code -> move cursor to next
    view.dispatch({
      selection: EditorSelection.cursor(cursorPos + 1),
      scrollIntoView: true,
    })
    return true
  }

  // open inline code
  view.dispatch({
    changes: state.changes({
      from: cursorPos,
      insert: "``",
    }),
    selection: EditorSelection.cursor(cursorPos + 1),
    scrollIntoView: true,
  })
  return true
}

export const autoRemoveCode: Command = (view: EditorView) => {
  const { state } = view
  const sel = state.selection.main
  if (!sel.empty) return false

  const cursorPos = sel.anchor
  const before = state.doc.sliceString(Math.max(0, cursorPos - 2), cursorPos)
  const after = state.doc.sliceString(cursorPos, Math.min(cursorPos + 2, state.doc.length))

  if (before.match(/^[^`]?`$/) && after.match(/^`[^`]?$/)) {
    view.dispatch({
      changes: state.changes({
        from: cursorPos,
        to: cursorPos + 1,
        insert: "",
      }),
      scrollIntoView: true,
    })
  }
  return false
}
