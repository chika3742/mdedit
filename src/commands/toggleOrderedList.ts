import type { Command } from "@codemirror/view"
import { Transaction, type ChangeSpec } from "@codemirror/state"
import { BLOCKQUOTE_RE, BULLET_RE, ORDERED_RE, otherPrefixLen, prefixLen, targetLines } from "../utils/blockPrefix.js"

// Toggle an ordered-list prefix across the selection as a whole: if every
// relevant line is already numbered, remove the prefix from all; otherwise
// number all lines `1. 2. 3. ...` (replacing any other block prefix).
export const toggleOrderedList: Command = (view) => {
  const { state } = view
  const lines = targetLines(state)
  if (lines.length === 0) return false
  const allNumbered = lines.every(line => prefixLen(line.text, ORDERED_RE) > 0)
  const changes: ChangeSpec[] = []
  let counter = 1
  for (const line of lines) {
    const existing = prefixLen(line.text, ORDERED_RE)
    if (allNumbered) {
      changes.push({ from: line.from, to: line.from + existing })
    }
    else {
      // Renumber every line, stripping whichever block prefix it currently has.
      const replace = existing || otherPrefixLen(line.text, [BLOCKQUOTE_RE, BULLET_RE])
      changes.push({ from: line.from, to: line.from + replace, insert: `${counter}. ` })
      counter++
    }
  }
  if (changes.length === 0) return false
  const changeSet = state.changes(changes)
  view.dispatch(
    state.update({
      changes: changeSet,
      // assoc 1 keeps the caret after an inserted prefix at the line start.
      selection: state.selection.map(changeSet, 1),
      scrollIntoView: true,
      annotations: Transaction.userEvent.of("input.list"),
    }),
  )
  return true
}
