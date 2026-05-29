import type { EditorState, SelectionRange } from "@codemirror/state"
import { overlaps, someNode } from "./syntaxTree.js"

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
  const range = sel ?? state.selection.main
  return someNode(state, range, node => CODE_NODE_NAMES.has(node.name) && overlaps(node, range))
}
