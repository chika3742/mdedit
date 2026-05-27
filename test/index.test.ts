import { describe, expect, it } from "vitest"
import { createMarkdownEditor } from "../src/index.js"

describe("createMarkdownEditor", () => {
  it("destroy() tears down the view without losing its `this` binding", () => {
    const parent = document.createElement("div")
    document.body.appendChild(parent)
    const editor = createMarkdownEditor(parent)
    // The editor mounts its DOM inside the parent.
    expect(parent.childElementCount).toBe(1)

    // Called as `editor.destroy()`, so `this` is the editor, not the view:
    // the method must still operate on the underlying view.
    expect(() => editor.destroy()).not.toThrow()
    expect(parent.childElementCount).toBe(0)

    parent.remove()
  })
})
