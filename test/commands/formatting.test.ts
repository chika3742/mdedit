import { describe, expect, it } from "vitest"
import { toggleBold, toggleCode, toggleItalic, toggleStrikethrough } from "../../src/commands/formatting.js"
import { cursorView, rangeView, render } from "../helpers.js"

describe("toggleBold / toggleItalic / toggleStrikethrough", () => {
  it("inserts markers and places the caret inside on an empty selection", () => {
    const view = cursorView("|")
    toggleBold(view)
    expect(render(view)).toBe("**|**")
  })

  it("italic inserts a single pair of markers", () => {
    const view = cursorView("|")
    toggleItalic(view)
    expect(render(view)).toBe("*|*")
  })

  it("wraps a non-empty selection", () => {
    const view = rangeView("bold", 0, 4)
    toggleBold(view)
    expect(render(view)).toBe("[**bold**]")
  })

  it("strikethrough wraps a non-empty selection", () => {
    const view = rangeView("del", 0, 3)
    toggleStrikethrough(view)
    expect(render(view)).toBe("[~~del~~]")
  })

  it("removes existing markers around the selection", () => {
    // Select the inner "bold" of "**bold**".
    const view = rangeView("**bold**", 2, 6)
    toggleBold(view)
    expect(render(view)).toBe("[bold]")
  })

  it("removes empty markers around the caret (**|**)", () => {
    const view = cursorView("**|**")
    toggleBold(view)
    expect(render(view)).toBe("|")
  })

  it("grows a bare caret to the surrounding node and strips its markers", () => {
    // No explicit range: the caret alone must detect the StrongEmphasis node.
    const view = cursorView("**bo|ld**")
    toggleBold(view)
    expect(render(view)).toBe("[bold]")
  })

  it("does nothing when the selection intersects a code block (requirement 7)", () => {
    const doc = "```\ncode\n```"
    const view = cursorView("```\nco|de\n```")
    toggleBold(view)
    expect(view.state.doc.toString()).toBe(doc)
  })
})

describe("createToggleCommand multiline behaviour", () => {
  // bold/italic/strike are NOT multiline: a single pair wraps the whole selection.
  it("bold wraps the whole multi-line selection with one pair of markers", () => {
    const doc = "foo\nbar"
    const view = rangeView(doc, 0, doc.length)
    toggleBold(view)
    expect(view.state.doc.toString()).toBe("**foo\nbar**")
  })

  // InlineCode IS multiline: each non-empty paragraph line is wrapped on its own.
  it("code wraps each line of a multi-line selection independently", () => {
    const doc = "foo\nbar"
    const view = rangeView(doc, 0, doc.length)
    toggleCode(view)
    expect(view.state.doc.toString()).toBe("`foo`\n`bar`")
  })

  it("leaves an already-wrapped multi-line selection untouched (intersects inline code)", () => {
    // The selection intersects InlineCode nodes, so intersectsCode short-circuits to a no-op
    // before the multi-line unwrap branch can run.
    const doc = "`foo`\n`bar`"
    const view = rangeView(doc, 0, doc.length)
    toggleCode(view)
    expect(view.state.doc.toString()).toBe(doc)
  })

  it("code leaves blank lines untouched in a multi-line selection", () => {
    const doc = "foo\n\nbar"
    const view = rangeView(doc, 0, doc.length)
    toggleCode(view)
    expect(view.state.doc.toString()).toBe("`foo`\n\n`bar`")
  })
})

describe("toggleCode", () => {
  it("inserts a fenced block on an empty line with the caret after the opening fence", () => {
    const view = cursorView("|")
    toggleCode(view)
    expect(render(view)).toBe("```|\n\n```")
  })

  it("uses inline code when the caret is on a non-empty line", () => {
    const view = cursorView("foo|")
    toggleCode(view)
    expect(render(view)).toBe("foo`|`")
  })

  it("wraps a non-empty selection with inline code", () => {
    const view = rangeView("foo", 0, 3)
    toggleCode(view)
    expect(render(view)).toBe("[`foo`]")
  })

  it("inserts a fenced block on a blank line that is not the first line", () => {
    const view = cursorView("foo\n|")
    toggleCode(view)
    expect(render(view)).toBe("foo\n```|\n\n```")
  })
})
