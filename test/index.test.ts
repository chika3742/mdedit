import { afterEach, describe, expect, it, vi } from "vitest"
import { createMarkdownEditor } from "../src/index.js"
import type { MarkdownEditor } from "../src/index.js"

// Resolves on the next macrotask so that CodeMirror's update listeners flush.
function flush() {
  return new Promise<void>(resolve => setTimeout(resolve, 0))
}

// Track created editors/parents so each test cleans up after itself.
const mounted: { editor: MarkdownEditor, parent: HTMLElement }[] = []

// CodeMirror needs the view attached to the document (e.g. for focus handling on destroy).
function mount(options?: Parameters<typeof createMarkdownEditor>[1]) {
  const parent = document.createElement("div")
  document.body.appendChild(parent)
  const editor = createMarkdownEditor(parent, options)
  mounted.push({ editor, parent })
  return { editor, parent }
}

afterEach(() => {
  for (const { editor, parent } of mounted.splice(0)) {
    editor.destroy()
    parent.remove()
  }
})

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

  it("populates the editor with initialValue", () => {
    const { parent } = mount({ initialValue: "# Hello" })

    expect(parent.querySelector(".cm-content")?.textContent).toContain("# Hello")
  })

  it("starts empty when initialValue is omitted", () => {
    const { parent } = mount()

    expect(parent.querySelector(".cm-content")?.textContent).toBe("")
  })

  it("calls onChanged with the current value when the document changes", async () => {
    const onChanged = vi.fn()
    const { editor } = mount({ initialValue: "ab", onChanged })

    // initialValue should not trigger onChanged.
    await flush()
    expect(onChanged).not.toHaveBeenCalled()

    // Trigger an edit via a public command and verify the callback receives the updated text.
    editor.toggleBold()
    await flush()

    expect(onChanged).toHaveBeenCalled()
    expect(onChanged).toHaveBeenLastCalledWith(expect.stringContaining("ab"))
  })
})
