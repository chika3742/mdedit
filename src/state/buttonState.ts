import type { EditorState, SelectionRange } from "@codemirror/state"
import { syntaxTree } from "@codemirror/language"
import { intersectsCode } from "../utils/intersectsCode.js"
import { boldSpec, hasSurroundingMarkers, inlineCodeSpec, italicSpec, strikethroughSpec } from "../utils/markers.js"
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

function value(active: boolean, disabled: boolean): ButtonStateValue {
  if (disabled) return "disabled"
  return active ? "active" : "inactive"
}

export function getButtonState(state: EditorState): ButtonState {
  const sel = state.selection.main
  const doc = state.doc
  const code = intersectsCode(state, sel)

  // active = ノード内、または空マーカー(**|**等)で囲まれている
  const bold = isWithinNode(state, sel, new Set([boldSpec.nodeName]))
    || hasSurroundingMarkers(doc, sel, boldSpec)
  // **|** は italic の * にも一致するため、太字で囲まれている場合は italic を抑制
  const italic = isWithinNode(state, sel, new Set([italicSpec.nodeName]))
    || (hasSurroundingMarkers(doc, sel, italicSpec) && !hasSurroundingMarkers(doc, sel, boldSpec))
  const strikethrough = isWithinNode(state, sel, new Set([strikethroughSpec.nodeName]))
    || hasSurroundingMarkers(doc, sel, strikethroughSpec)
  const codeActive = isWithinNode(state, sel, CODE_ACTIVE_NODE_NAMES)
    || hasSurroundingMarkers(doc, sel, inlineCodeSpec)

  return {
    bold: value(bold, code),
    italic: value(italic, code),
    strikethrough: value(strikethrough, code),
    code: value(codeActive, false),
    link: value(false, code),
  }
}
