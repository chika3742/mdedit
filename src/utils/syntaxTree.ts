import type { EditorState, SelectionRange } from "@codemirror/state"
import { syntaxTree } from "@codemirror/language"
import type { SyntaxNodeRef } from "@lezer/common"

// Strict overlap: the ranges share interior space, so a mere boundary touch
// (e.g. a cursor just outside inline code) does not count.
export function overlaps(node: { from: number, to: number }, sel: SelectionRange): boolean {
  return node.from < sel.to && sel.from < node.to
}

// Containment: the node fully encloses the selection (boundaries inclusive).
export function contains(node: { from: number, to: number }, sel: SelectionRange): boolean {
  return node.from <= sel.from && node.to >= sel.to
}

// True if any node within the selection range satisfies `predicate`.
export function someNode(
  state: EditorState,
  sel: SelectionRange,
  predicate: (node: SyntaxNodeRef) => boolean,
): boolean {
  let found = false
  syntaxTree(state).iterate({
    from: sel.from, to: sel.to,
    enter: (node) => {
      if (predicate(node)) {
        found = true
        return false
      }
      return !found
    },
  })
  return found
}

// The smallest node within the selection range satisfying `predicate`, or null.
export function smallestNode(
  state: EditorState,
  sel: SelectionRange,
  predicate: (node: SyntaxNodeRef) => boolean,
): { from: number, to: number } | null {
  let result: { from: number, to: number } | null = null
  syntaxTree(state).iterate({
    from: sel.from, to: sel.to,
    enter: (node) => {
      if (predicate(node) && (!result || node.to - node.from < result.to - result.from)) {
        result = { from: node.from, to: node.to }
      }
    },
  })
  return result
}
