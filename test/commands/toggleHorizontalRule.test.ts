import { describe, expect, it } from "vitest"
import { toggleHorizontalRule } from "../../src/commands/toggleHorizontalRule.js"
import { cursorView, render } from "../helpers.js"

describe("toggleHorizontalRule", () => {
  it("inserts a rule on an empty line and moves the caret past it", () => {
    const view = cursorView("|")
    toggleHorizontalRule(view)
    expect(render(view)).toBe("---\n|")
  })

  it("prepends a newline when the current line is not empty", () => {
    const view = cursorView("foo|")
    toggleHorizontalRule(view)
    expect(render(view)).toBe("foo\n---\n|")
  })

  it("removes the rule when the caret is on an existing one", () => {
    const view = cursorView("-|--")
    toggleHorizontalRule(view)
    expect(view.state.doc.toString()).toBe("")
  })

  it("does nothing inside a code block", () => {
    const doc = "```\ncode\n```"
    const view = cursorView("```\nco|de\n```")
    toggleHorizontalRule(view)
    expect(view.state.doc.toString()).toBe(doc)
  })
})
