import { describe, expect, it } from "vitest"
import { insertFontColor } from "../../src/commands/insertFontColor.js"
import { cursorView, rangeView } from "../helpers.js"

describe("insertFontColor", () => {
  it("wraps a non-empty selection and selects the color placeholder", () => {
    const view = rangeView("text", 0, 4)
    insertFontColor(view)
    expect(view.state.doc.toString()).toBe("<span style=\"color: red;\">text</span>")
    const { from, to } = view.state.selection.main
    expect(view.state.doc.sliceString(from, to)).toBe("red")
  })

  it("inserts a 'Text' placeholder on an empty selection", () => {
    const view = cursorView("|")
    insertFontColor(view)
    expect(view.state.doc.toString()).toBe("<span style=\"color: red;\">Text</span>")
    const { from, to } = view.state.selection.main
    expect(view.state.doc.sliceString(from, to)).toBe("red")
  })

  it("does nothing inside a code block", () => {
    const doc = "```\ncode\n```"
    const view = cursorView("```\nco|de\n```")
    insertFontColor(view)
    expect(view.state.doc.toString()).toBe(doc)
  })
})
