import type { EditorState, SelectionRange } from "@codemirror/state"
import { syntaxTree } from "@codemirror/language"
import { intersectsCode } from "../utils/intersectsCode.js"
import type { ButtonState, ButtonStateValue } from "../types.js"

const CODE_ACTIVE_NODE_NAMES = new Set(["InlineCode", "FencedCode", "CodeBlock"])

// 構文木上、selがいずれかのnodeNameに内包されているか
function isWithinNode(state: EditorState, sel: SelectionRange, nodeNames: Set<string>): boolean {
  let found = false
  syntaxTree(state).iterate({
    from: sel.from, to: sel.to,
    enter: (node) => {
      if (nodeNames.has(node.name) && node.from <= sel.from && node.to >= sel.to) {
        found = true
        return false
      }
      return !found
    },
  })
  return found
}

// コード交差時はdisabled、ノード内ならactive、それ以外はinactive
function toggleValue(state: EditorState, sel: SelectionRange, nodeName: string, code: boolean): ButtonStateValue {
  if (code) return "disabled"
  return isWithinNode(state, sel, new Set([nodeName])) ? "active" : "inactive"
}

export function getButtonState(state: EditorState): ButtonState {
  const sel = state.selection.main
  const code = intersectsCode(state, sel)
  return {
    bold: toggleValue(state, sel, "StrongEmphasis", code),
    italic: toggleValue(state, sel, "Emphasis", code),
    strikethrough: toggleValue(state, sel, "Strikethrough", code),
    code: isWithinNode(state, sel, CODE_ACTIVE_NODE_NAMES) ? "active" : "inactive",
    link: code ? "disabled" : "inactive",
  }
}
