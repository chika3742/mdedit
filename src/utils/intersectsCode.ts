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
        found = true
        return false
      }
      return !found
    },
  })
  return found
}
