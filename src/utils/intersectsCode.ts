import type { EditorState, SelectionRange } from "@codemirror/state"
import { syntaxTree } from "@codemirror/language"

export const CODE_NODE_NAMES = new Set([
  "InlineCode",
  "FencedCode",
  "CodeBlock",
  "CodeText",
  "CodeInfo",
  "HTMLBlock",
])

/**
 * Returns `true` if the selection intersects code blocks or inline codes.
 *
 * @param state {@link EditorState}
 * @param sel Selection range. If not provided, reads the main selection from {@link state}.
 */
export function intersectsCode(state: EditorState, sel?: SelectionRange): boolean {
  sel ??= state.selection.main

  let found = false
  syntaxTree(state).iterate({
    from: sel.from, to: sel.to,
    enter: (node) => {
      if (CODE_NODE_NAMES.has(node.name)) {
        // Require a genuine overlap rather than a mere boundary touch. For an
        // empty selection (cursor) this means the position must be strictly
        // inside the node, so a cursor sitting just outside inline code does
        // not count as intersecting.
        if (node.from < sel.to && sel.from < node.to) {
          found = true
          return false
        }
      }
      return !found
    },
  })
  return found
}
