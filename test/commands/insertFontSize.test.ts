import { describe, expect, it } from "vitest"
import { insertFontSize } from "../../src/commands/insertFontSize.js"
import { cursorView, rangeView } from "../helpers.js"

describe("insertFontSize", () => {
  it("wraps a non-empty selection and selects the size placeholder", () => {
    const view = rangeView("text", 0, 4)
    insertFontSize(view)
    expect(view.state.doc.toString()).toBe("<span style=\"font-size: 16px;\">text</span>")
    const { from, to } = view.state.selection.main
    expect(view.state.doc.sliceString(from, to)).toBe("16px")
  })

  it("inserts a 'Text' placeholder on an empty selection", () => {
    const view = cursorView("|")
    insertFontSize(view)
    expect(view.state.doc.toString()).toBe("<span style=\"font-size: 16px;\">Text</span>")
    const { from, to } = view.state.selection.main
    expect(view.state.doc.sliceString(from, to)).toBe("16px")
  })

  it("does nothing inside a code block", () => {
    const doc = "```\ncode\n```"
    const view = cursorView("```\nco|de\n```")
    insertFontSize(view)
    expect(view.state.doc.toString()).toBe(doc)
  })
})
