import type { Command } from "@codemirror/view"
import { EditorSelection, type SelectionRange, Transaction } from "@codemirror/state"

/** Toggle an ATX heading of the given level on each selected line. */
export function toggleHeading(level: number): Command {
  return (view) => {
    const { state } = view
    const prefix = "#".repeat(level) + " "
    const lineNums = new Set<number>()
    for (const range of state.selection.ranges) {
      const startLine = state.doc.lineAt(range.from).number
      const endLine = state.doc.lineAt(range.to).number
      for (let n = startLine; n <= endLine; n++) lineNums.add(n)
    }
    const changes = [...lineNums].map((n) => {
      const line = state.doc.line(n)
      const existing = /^(#{1,6})\s+/.exec(line.text)
      if (existing && existing[1].length === level) {
        return { from: line.from, to: line.from + existing[0].length }
      }
      if (existing) {
        return {
          from: line.from,
          to: line.from + existing[0].length,
          insert: prefix,
        }
      }
      return { from: line.from, insert: prefix }
    })

    let newSelection: SelectionRange | undefined = undefined
    const cursorPosition = state.selection.main.head
    if (state.doc.lineAt(cursorPosition).from === cursorPosition) {
      newSelection = EditorSelection.cursor(cursorPosition + level + 1)
    }

    view.dispatch(
      state.update({
        changes,
        selection: newSelection,
        scrollIntoView: true,
        annotations: Transaction.userEvent.of("input.heading"),
      }),
    )
    return true
  }
}
