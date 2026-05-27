import { describe, expect, it } from "vitest"
import { toggleOrderedList } from "../../src/commands/toggleOrderedList.js"
import { cursorView, rangeView, render } from "../helpers.js"

describe("toggleOrderedList", () => {
  it("adds a '1. ' prefix to a plain line", () => {
    const view = cursorView("it|em")
    toggleOrderedList(view)
    expect(view.state.doc.toString()).toBe("1. item")
  })

  it("removes the number prefix when already an ordered list", () => {
    const view = cursorView("1. it|em")
    toggleOrderedList(view)
    expect(view.state.doc.toString()).toBe("item")
  })

  it("renumbers across a multi-line selection", () => {
    const doc = "foo\nbar\nbaz"
    const view = rangeView(doc, 0, doc.length)
    toggleOrderedList(view)
    expect(view.state.doc.toString()).toBe("1. foo\n2. bar\n3. baz")
  })

  it("inserts a prefix on a single empty line and keeps the caret after it", () => {
    const view = cursorView("|")
    toggleOrderedList(view)
    expect(render(view)).toBe("1. |")
  })

  it("skips blank lines and does not number them", () => {
    const doc = "foo\n\nbar"
    const view = rangeView(doc, 0, doc.length)
    toggleOrderedList(view)
    expect(view.state.doc.toString()).toBe("1. foo\n\n2. bar")
  })

  it("unifies a mixed selection to numbers when any line is not numbered", () => {
    const doc = "1. aaaa\n2. bbb\n- cc"
    const view = rangeView(doc, 0, doc.length)
    toggleOrderedList(view)
    expect(view.state.doc.toString()).toBe("1. aaaa\n2. bbb\n3. cc")
  })

  it("removes all prefixes only when every line is already numbered", () => {
    const doc = "1. aaaa\n2. bbb\n3. cc"
    const view = rangeView(doc, 0, doc.length)
    toggleOrderedList(view)
    expect(view.state.doc.toString()).toBe("aaaa\nbbb\ncc")
  })

  it("replaces a bullet-list prefix with numbers", () => {
    const view = cursorView("- it|em")
    toggleOrderedList(view)
    expect(view.state.doc.toString()).toBe("1. item")
  })

  it("does nothing inside a code block", () => {
    const doc = "```\ncode\n```"
    const view = cursorView("```\nco|de\n```")
    toggleOrderedList(view)
    expect(view.state.doc.toString()).toBe(doc)
  })
})
