import type { Command } from "@codemirror/view"
import { Transaction, type ChangeSpec } from "@codemirror/state"
import { BLOCKQUOTE_RE, BULLET_RE, ORDERED_RE, otherPrefixLen, prefixLen, targetLines } from "../utils/blockPrefix.js"

// Toggle a `- ` bullet prefix across the selection as a whole: if every relevant
// line is already a bullet item, remove the prefix from all; otherwise convert
// all lines to bullets (replacing any other block prefix).
export const toggleBulletList: Command = (view) => {
  const { state } = view
  const lines = targetLines(state)
  if (lines.length === 0) return false
  const allBullets = lines.every(line => prefixLen(line.text, BULLET_RE) > 0)
  const changes: ChangeSpec[] = []
  for (const line of lines) {
    const existing = prefixLen(line.text, BULLET_RE)
    if (allBullets) {
      changes.push({ from: line.from, to: line.from + existing })
    }
    else if (existing === 0) {
      const replace = otherPrefixLen(line.text, [BLOCKQUOTE_RE, ORDERED_RE])
      changes.push({ from: line.from, to: line.from + replace, insert: "- " })
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
