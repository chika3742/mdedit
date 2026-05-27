import type { EditorState, SelectionRange } from "@codemirror/state"
import { intersectsCode } from "../utils/intersectsCode.js"
import { contains, someNode } from "../utils/syntaxTree.js"
import { boldSpec, hasSurroundingMarkers, inlineCodeSpec, italicSpec, strikethroughSpec } from "../utils/markers.js"
import { BLOCKQUOTE_RE, BULLET_RE, ORDERED_RE } from "../utils/blockPrefix.js"
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

  const link = isWithinNode(state, sel, new Set(["Link"]))
  const horizontalRule = isWithinNode(state, sel, new Set(["HorizontalRule"]))
  // Detect blockquote / lists from the caret line's leading prefix rather than
  // the syntax tree: an empty ordered item (`1. `) right below a bullet list is
  // parsed as a loose continuation of that BulletList, so node containment would
  // misreport it as a bullet. The line prefix matches the toggle commands.
  const lineText = doc.lineAt(sel.head).text
  const blockquote = BLOCKQUOTE_RE.test(lineText)
  const bulletList = BULLET_RE.test(lineText)
  const orderedList = ORDERED_RE.test(lineText)

  return {
    bold: value(bold, code),
    italic: value(italic, code),
    strikethrough: value(strikethrough, code),
    code: value(codeActive, false),
    link: value(link, code),
    horizontalRule: value(horizontalRule, code),
    blockquote: value(blockquote, code),
    bulletList: value(bulletList, code),
    orderedList: value(orderedList, code),
  }
}
