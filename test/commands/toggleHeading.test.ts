import { describe, expect, it } from "vitest"
import { toggleHeading } from "../../src/commands/toggleHeading.js"
import { cursorView, rangeView, render } from "../helpers.js"

describe("toggleHeading", () => {
  it("adds a heading prefix to a plain line", () => {
    const view = cursorView("|title")
    toggleHeading(2)(view)
    expect(view.state.doc.toString()).toBe("## title")
  })

  it("removes the prefix when toggling the same level", () => {
    const view = cursorView("|## title")
    toggleHeading(2)(view)
    expect(view.state.doc.toString()).toBe("title")
  })

  it("keeps the caret within the line when removing the prefix from line start", () => {
    const view = cursorView("|## title")
    toggleHeading(2)(view)
    // The caret advances by the prefix length (level + 1) and lands inside "title".
    expect(render(view)).toBe("tit|le")
  })

  it("replaces the prefix when toggling a different level", () => {
    const view = cursorView("|## title")
    toggleHeading(1)(view)
    expect(view.state.doc.toString()).toBe("# title")
  })

  it("applies to every line of a multi-line selection in one dispatch", () => {
    const doc = "foo\nbar"
    const view = rangeView(doc, 0, doc.length)
    toggleHeading(3)(view)
    expect(view.state.doc.toString()).toBe("### foo\n### bar")
  })

  it("moves the caret past the inserted prefix when it sits at line start", () => {
    const view = cursorView("|title")
    toggleHeading(2)(view)
    // "## " is level(2) + 1 chars long.
    expect(view.state.selection.main.head).toBe(3)
  })
})
