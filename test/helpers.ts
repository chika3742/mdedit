import { EditorSelection, EditorState, type SelectionRange } from "@codemirror/state"
import { EditorView } from "@codemirror/view"
import { markdown, markdownLanguage } from "@codemirror/lang-markdown"
import { languages } from "@codemirror/language-data"
import { ensureSyntaxTree } from "@codemirror/language"

const extensions = [markdown({ base: markdownLanguage, codeLanguages: languages })]

// Build an EditorView from a doc where "|" marks the caret position.
export function cursorView(docWithCursor: string): EditorView {
  const anchor = docWithCursor.indexOf("|")
  if (anchor < 0) throw new Error("cursorView: missing '|' marker")
  const doc = docWithCursor.replace("|", "")
  return makeView(doc, EditorSelection.cursor(anchor))
}

// Build an EditorView with an explicit selection range.
export function rangeView(doc: string, from: number, to: number): EditorView {
  return makeView(doc, EditorSelection.range(from, to))
}

function makeView(doc: string, selection: SelectionRange): EditorView {
  const state = EditorState.create({ doc, selection, extensions })
  // Force a synchronous parse so syntax-tree-based commands behave as in real usage.
  ensureSyntaxTree(state, doc.length)
  return new EditorView({ state })
}

// Render the doc with the main selection annotated: "|" for a caret, "[...]" for a range.
export function render(view: EditorView): string {
  const doc = view.state.doc.toString()
  const { from, to } = view.state.selection.main
  if (from === to) return doc.slice(0, from) + "|" + doc.slice(from)
  return doc.slice(0, from) + "[" + doc.slice(from, to) + "]" + doc.slice(to)
}
