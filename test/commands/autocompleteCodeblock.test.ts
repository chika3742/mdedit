import { describe, expect, it } from "vitest"
import { autoRemoveCode, autocompleteCodeblock } from "../../src/commands/autocompleteCodeblock.js"
import { cursorView, rangeView, render } from "../helpers.js"

describe("autocompleteCodeblock", () => {
  it("returns false and does nothing for a non-empty selection", () => {
    const view = rangeView("foo", 0, 3)
    expect(autocompleteCodeblock(view)).toBe(false)
    expect(view.state.doc.toString()).toBe("foo")
  })

  it("opens a fenced code block after two backticks", () => {
    const view = cursorView("``|")
    expect(autocompleteCodeblock(view)).toBe(true)
    expect(render(view)).toBe("```|\n\n```")
  })

  it("opens a fenced block after two backticks mid-document", () => {
    const view = cursorView("x``|")
    autocompleteCodeblock(view)
    expect(render(view)).toBe("x```|\n\n```")
  })

  it("only advances the caret when already after a single backtick", () => {
    const view = cursorView("`|`")
    expect(autocompleteCodeblock(view)).toBe(true)
    expect(render(view)).toBe("``|")
  })

  it("inserts a pair of backticks on plain text", () => {
    const view = cursorView("foo|")
    autocompleteCodeblock(view)
    expect(render(view)).toBe("foo`|`")
  })

  it("expands a fenced block after three backticks", () => {
    // The blockRegex /[^`]?``$/ still matches the trailing two backticks here.
    const view = cursorView("```|")
    autocompleteCodeblock(view)
    expect(render(view)).toBe("````|\n\n```")
  })
})

describe("autoRemoveCode", () => {
  it("removes the closing backtick when the caret is between a pair", () => {
    const view = cursorView("`|`")
    // Always returns false so the default delete still runs.
    expect(autoRemoveCode(view)).toBe(false)
    expect(render(view)).toBe("`|")
  })

  it("does nothing when not between a backtick pair", () => {
    const view = cursorView("foo|")
    expect(autoRemoveCode(view)).toBe(false)
    expect(render(view)).toBe("foo|")
  })
})
