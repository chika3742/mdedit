import { describe, expect, it } from "vitest"
import { toggleBulletList } from "../../src/commands/toggleBulletList.js"
import { cursorView, rangeView, render } from "../helpers.js"

describe("toggleBulletList", () => {
  it("adds a '- ' prefix to a plain line", () => {
    const view = cursorView("it|em")
    toggleBulletList(view)
    expect(view.state.doc.toString()).toBe("- item")
  })

  it("removes the bullet prefix when already a bullet list", () => {
    const view = cursorView("- it|em")
    toggleBulletList(view)
    expect(view.state.doc.toString()).toBe("item")
  })

  it("applies to every line of a multi-line selection", () => {
    const doc = "foo\nbar"
    const view = rangeView(doc, 0, doc.length)
    toggleBulletList(view)
    expect(view.state.doc.toString()).toBe("- foo\n- bar")
  })

  it("inserts a prefix on a single empty line and keeps the caret after it", () => {
    const view = cursorView("|")
    toggleBulletList(view)
    expect(render(view)).toBe("- |")
  })

  it("places the caret after the prefix when inserted at line start", () => {
    const view = cursorView("|item")
    toggleBulletList(view)
    expect(render(view)).toBe("- |item")
  })

  it("skips blank lines in a multi-line selection", () => {
    const doc = "foo\n\nbar"
    const view = rangeView(doc, 0, doc.length)
    toggleBulletList(view)
    expect(view.state.doc.toString()).toBe("- foo\n\n- bar")
  })

  it("unifies a mixed selection to bullets when any line is not a bullet", () => {
    const doc = "- aaaa\n- bbb\n1. cc"
    const view = rangeView(doc, 0, doc.length)
    toggleBulletList(view)
    expect(view.state.doc.toString()).toBe("- aaaa\n- bbb\n- cc")
  })

  it("removes all prefixes only when every line is already a bullet", () => {
    const doc = "- aaaa\n- bbb\n- cc"
    const view = rangeView(doc, 0, doc.length)
    toggleBulletList(view)
    expect(view.state.doc.toString()).toBe("aaaa\nbbb\ncc")
  })

  it("replaces an ordered-list prefix with a bullet", () => {
    const view = cursorView("1. it|em")
    toggleBulletList(view)
    expect(view.state.doc.toString()).toBe("- item")
  })

  it("does nothing inside a code block", () => {
    const doc = "```\ncode\n```"
    const view = cursorView("```\nco|de\n```")
    toggleBulletList(view)
    expect(view.state.doc.toString()).toBe(doc)
  })
})
