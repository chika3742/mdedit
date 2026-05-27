import { describe, expect, it } from "vitest"
import { toggleBlockquote } from "../../src/commands/toggleBlockquote.js"
import { cursorView, rangeView, render } from "../helpers.js"

describe("toggleBlockquote", () => {
  it("adds a '> ' prefix to a plain line", () => {
    const view = cursorView("qu|ote")
    toggleBlockquote(view)
    expect(view.state.doc.toString()).toBe("> quote")
  })

  it("removes the '> ' prefix when already a blockquote", () => {
    const view = cursorView("> qu|ote")
    toggleBlockquote(view)
    expect(view.state.doc.toString()).toBe("quote")
  })

  it("applies to every line of a multi-line selection", () => {
    const doc = "foo\nbar"
    const view = rangeView(doc, 0, doc.length)
    toggleBlockquote(view)
    expect(view.state.doc.toString()).toBe("> foo\n> bar")
  })

  it("inserts a prefix on a single empty line and keeps the caret after it", () => {
    const view = cursorView("|")
    toggleBlockquote(view)
    expect(render(view)).toBe("> |")
  })

  it("skips blank lines in a multi-line selection", () => {
    const doc = "foo\n\nbar"
    const view = rangeView(doc, 0, doc.length)
    toggleBlockquote(view)
    expect(view.state.doc.toString()).toBe("> foo\n\n> bar")
  })

  it("unifies a mixed selection to blockquotes when any line is not a quote", () => {
    const doc = "> aaaa\n> bbb\n- cc"
    const view = rangeView(doc, 0, doc.length)
    toggleBlockquote(view)
    expect(view.state.doc.toString()).toBe("> aaaa\n> bbb\n> cc")
  })

  it("removes all prefixes only when every line is already a quote", () => {
    const doc = "> aaaa\n> bbb\n> cc"
    const view = rangeView(doc, 0, doc.length)
    toggleBlockquote(view)
    expect(view.state.doc.toString()).toBe("aaaa\nbbb\ncc")
  })

  it("replaces a bullet-list prefix with a blockquote", () => {
    const view = cursorView("- it|em")
    toggleBlockquote(view)
    expect(view.state.doc.toString()).toBe("> item")
  })

  it("does nothing inside a code block", () => {
    const doc = "```\ncode\n```"
    const view = cursorView("```\nco|de\n```")
    toggleBlockquote(view)
    expect(view.state.doc.toString()).toBe(doc)
  })
})
