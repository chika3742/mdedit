import { describe, expect, it } from "vitest"
import { EditorSelection, EditorState } from "@codemirror/state"
import { EditorView } from "@codemirror/view"
import { markdown, markdownLanguage } from "@codemirror/lang-markdown"
import { languages } from "@codemirror/language-data"
import { toggleLink } from "../../src/commands/toggleLink.js"
import { cursorView, rangeView } from "../helpers.js"

describe("toggleLink", () => {
  it("wraps a non-empty selection and selects the url placeholder", () => {
    const view = rangeView("text", 0, 4)
    toggleLink(view)
    expect(view.state.doc.toString()).toBe("[text](url)")
    // Selection covers the "url" placeholder.
    const { from, to } = view.state.selection.main
    expect(view.state.doc.sliceString(from, to)).toBe("url")
  })

  it("inserts a 'Link Text' placeholder on an empty selection", () => {
    const view = cursorView("|")
    toggleLink(view)
    expect(view.state.doc.toString()).toBe("[Link Text](url)")
    const { from, to } = view.state.selection.main
    expect(view.state.doc.sliceString(from, to)).toBe("url")
  })

  it("does nothing inside a code block", () => {
    const doc = "```\ncode\n```"
    // Caret on the "code" line, inside the fenced block.
    const view = cursorView("```\nco|de\n```")
    toggleLink(view)
    expect(view.state.doc.toString()).toBe(doc)
  })

  it("links each range of a multi-range selection independently", () => {
    // "a b" with "a" and "b" separately selected.
    const state = EditorState.create({
      doc: "a b",
      selection: EditorSelection.create([EditorSelection.range(0, 1), EditorSelection.range(2, 3)]),
      // Multiple ranges collapse to one unless this facet is enabled.
      extensions: [
        markdown({ base: markdownLanguage, codeLanguages: languages }),
        EditorState.allowMultipleSelections.of(true),
      ],
    })
    const view = new EditorView({ state })
    toggleLink(view)
    expect(view.state.doc.toString()).toBe("[a](url) [b](url)")
  })

  // --- toggle (unwrap) behaviour ---

  it("unwraps to the link text when the caret is inside a link", () => {
    const view = cursorView("[fo|o](url)")
    toggleLink(view)
    expect(view.state.doc.toString()).toBe("foo")
  })

  it("unwraps when the link text is selected", () => {
    // Select "foo" inside "[foo](url)".
    const view = rangeView("[foo](url)", 1, 4)
    toggleLink(view)
    expect(view.state.doc.toString()).toBe("foo")
  })

  it("unwraps when the url is selected", () => {
    // Select "url" inside "[foo](url)".
    const view = rangeView("[foo](url)", 6, 9)
    toggleLink(view)
    expect(view.state.doc.toString()).toBe("foo")
  })
})
