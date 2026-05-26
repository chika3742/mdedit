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

// 範囲がコードブロックと交差するか
export function intersectsCode(state: EditorState, sel: SelectionRange): boolean {
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
