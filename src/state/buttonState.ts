import type { EditorState, SelectionRange } from "@codemirror/state"
import { intersectsCode } from "../utils/intersectsCode.js"
import { contains, someNode } from "../utils/syntaxTree.js"
import { boldSpec, hasSurroundingMarkers, inlineCodeSpec, italicSpec, strikethroughSpec } from "../utils/markers.js"
import type { ButtonState, ButtonStateValue } from "../types.js"

const CODE_ACTIVE_NODE_NAMES = new Set(["InlineCode", "FencedCode", "CodeBlock"])

// Whether the selection is contained within a node of one of the given names.
function isWithinNode(state: EditorState, sel: SelectionRange, nodeNames: Set<string>): boolean {
  return someNode(state, sel, node => nodeNames.has(node.name) && contains(node, sel))
}

function value(active: boolean, disabled: boolean): ButtonStateValue {
  if (disabled) return "disabled"
  return active ? "active" : "inactive"
}

export function getButtonState(state: EditorState): ButtonState {
  const sel = state.selection.main
  const doc = state.doc
  const code = intersectsCode(state, sel)

  // active = inside the node, or wrapped in empty markers (e.g. **|**).
  const bold = isWithinNode(state, sel, new Set([boldSpec.nodeName]))
    || hasSurroundingMarkers(doc, sel, boldSpec)
  // **|** also matches italic's *, so suppress italic when wrapped in bold.
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
