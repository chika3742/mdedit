import type { Command, EditorView } from "@codemirror/view"
import { EditorSelection } from "@codemirror/state"
import { createToggleCommand } from "./createToggleCommand.js"

// export const toggleBold = toggleWrap("StrongEmphasis", "EmphasisMark", "**")
export const toggleBold = createToggleCommand({
  template: "**",
  nodeName: "StrongEmphasis",
  matcher: /\*\*|__/g,
})

export const toggleItalic = createToggleCommand({
  template: "*",
  nodeName: "Emphasis",
  matcher: /[*_]/g,
})
export const toggleStrikethrough = createToggleCommand({
  template: "~~",
  nodeName: "Strikethrough",
  matcher: /~~/g,
})
export const toggleCode: Command = (view: EditorView) => {
  const { state } = view
  if (!state.selection.main.empty || state.doc.lineAt(state.selection.main.head).length !== 0) {
    return createToggleCommand({
      template: "`",
      nodeName: "InlineCode",
      matcher: /`/g,
    })(view)
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
