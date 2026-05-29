import { EditorState, EditorSelection, SelectionRange, Text } from "@codemirror/state"
import type { Command } from "@codemirror/view"
import { intersectsCode } from "../utils/intersectsCode.js"
import { smallestNode } from "../utils/syntaxTree.js"
import { matchLen, type MarkerSpec } from "../utils/markers.js"

// If the selection sits inside a node of the given name, return that node's
// smallest matching range; otherwise return the selection unchanged.
function growToNode(state: EditorState, sel: SelectionRange, nodeName: string): SelectionRange {
  const node = smallestNode(state, sel, n => n.name === nodeName)
  return node ? EditorSelection.range(node.from, node.to) : sel
}

// 確定した範囲に対して toggle
function toggleSurround(doc: Text, sel: SelectionRange, spec: MarkerSpec) {
  const startLen = matchLen(doc, sel, spec, "start")
  const endLen = matchLen(doc, sel, spec, "end")

  if (startLen >= 0 && endLen >= 0) {
    if (sel.empty) {
      // **|** → カーソル前後のマーカーを直接削除
      return {
        changes: [{ from: sel.from - startLen, to: sel.to + endLen, insert: "" }],
        range: EditorSelection.cursor(sel.from - startLen),
      }
    }
    // すでにマーカー付き → 外す
    let content = doc.sliceString(sel.from, sel.to)
    content = content.slice(startLen, content.length - endLen)
    return {
      changes: [{ from: sel.from, to: sel.to, insert: content }],
      range: EditorSelection.range(sel.from, sel.to - startLen - endLen),
    }
  }

  // マーカーなし → 付ける
  if (sel.empty) {
    return {
      changes: [{ from: sel.from, insert: spec.template + spec.template }],
      range: EditorSelection.cursor(sel.from + spec.template.length),
    }
  }
  return {
    changes: [
      { from: sel.from, insert: spec.template },
      { from: sel.to, insert: spec.template },
    ],
    range: EditorSelection.range(sel.from, sel.to + spec.template.length * 2),
  }
}

// 複数行（パラグラフ行ごとに処理）
function shouldUseMultiline(state: EditorState, sel: SelectionRange, spec: MarkerSpec): boolean {
  if (sel.empty) return false
  const multilineCapable = new Set(["StrongEmphasis", "Emphasis", "Strikethrough"])
  if (multilineCapable.has(spec.nodeName)) return false
  const startLine = state.doc.lineAt(sel.from)
  const endLine = state.doc.lineAt(sel.to)
  return startLine.number !== endLine.number
}

export function createToggleCommand(spec: MarkerSpec): Command {
  return (view) => {
    const state = view.state
    const changes = state.changeByRange((sel) => {
      // 要件7: コードブロックが含まれていたら何もしない
      if (intersectsCode(state, sel)) {
        return { range: sel }
      }

      // 要件6: 複数行ならパラグラフごと
      if (shouldUseMultiline(state, sel, spec)) {
        const text = state.doc.sliceString(sel.from, sel.to)
        const transformed = text.split("\n").map((line) => {
          if (!line.trim()) return line
          const lineDoc = Text.of([line])
          const r = toggleSurround(lineDoc, EditorSelection.range(0, line.length), spec)
          // changesを当てた結果文字列を返す
          let result = line
          for (const c of r.changes.slice().reverse() as typeof r.changes) {
            result = result.slice(0, c.from) + (c.insert ?? "") + result.slice("to" in c ? c.to : c.from)
          }
          return result
        }).join("\n")
        return {
          changes: [{ from: sel.from, to: sel.to, insert: transformed }],
          range: EditorSelection.range(sel.from, sel.from + transformed.length),
        }
      }

      // 要件3,5: カーソルがノード内ならノード範囲まで広げる
      const grown = growToNode(state, sel, spec.nodeName)
      return toggleSurround(state.doc, grown, spec)
    })
    view.dispatch(changes)
    return true
  }
}
