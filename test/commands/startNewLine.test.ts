import { describe, expect, it } from "vitest"
import { startNewLine } from "../../src/commands/startNewLine.js"
import { cursorView, render } from "../helpers.js"

describe("startNewLine", () => {
  it("inserts a newline at the end of the current line and moves the caret there", () => {
    const view = cursorView("fo|o")
    startNewLine(view)
    // The line is not split at the caret; the break is added at the line end.
    expect(render(view)).toBe("foo\n|")
  })

  it("inserts after the current line when other lines follow", () => {
    const view = cursorView("fo|o\nbar")
    startNewLine(view)
    expect(render(view)).toBe("foo\n|\nbar")
  })
})
