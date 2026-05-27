import { describe, expect, it, vi } from "vitest"
import { EditorState } from "@codemirror/state"
import { EditorView } from "@codemirror/view"
import { markdown, markdownLanguage } from "@codemirror/lang-markdown"
import { languages } from "@codemirror/language-data"
import { ensureSyntaxTree } from "@codemirror/language"
import { imageUpload, uploadImageFiles } from "../../src/extensions/imageUpload.js"
import type { ImageUploadConfig } from "../../src/extensions/imageUpload.js"

interface Deferred {
  promise: Promise<string>
  resolve: (url: string) => void
  reject: (error: unknown) => void
}

function deferred(): Deferred {
  let resolve!: (url: string) => void
  let reject!: (error: unknown) => void
  const promise = new Promise<string>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

function pngFile(name: string): File {
  return new File(["binary"], name, { type: "image/png" })
}

function createView(config: ImageUploadConfig, doc = "") {
  const state = EditorState.create({
    doc,
    extensions: [
      markdown({ base: markdownLanguage, codeLanguages: languages }),
      imageUpload(config),
    ],
  })
  ensureSyntaxTree(state, doc.length)
  // Attach to the document so `view.dom.isConnected` is true (matches real usage).
  const parent = document.createElement("div")
  document.body.appendChild(parent)
  return new EditorView({ state, parent })
}

// Lets pending .then/.catch microtasks settle.
const flush = () => new Promise<void>(r => setTimeout(r, 0))

describe("uploadImageFiles", () => {
  it("inserts a placeholder then replaces it with the resolved URL", async () => {
    const d = deferred()
    const view = createView({ uploadImage: () => d.promise })

    uploadImageFiles(view, [pngFile("a.png")], 0, { uploadImage: () => d.promise })
    expect(view.state.doc.toString()).toBe("![Uploading a.png…]()\n")

    d.resolve("https://cdn/a.png")
    await flush()
    expect(view.state.doc.toString()).toBe("![a.png](https://cdn/a.png)\n")
  })

  it("replaces at the mapped position when text is edited before resolution", async () => {
    const d = deferred()
    const config: ImageUploadConfig = { uploadImage: () => d.promise }
    const view = createView(config)

    uploadImageFiles(view, [pngFile("a.png")], 0, config)
    // Insert unrelated text before the placeholder, shifting it right.
    view.dispatch({ changes: { from: 0, insert: "X" } })

    d.resolve("https://cdn/a.png")
    await flush()
    expect(view.state.doc.toString()).toBe("X![a.png](https://cdn/a.png)\n")
  })

  it("silently ignores a placeholder the user deleted", async () => {
    const d = deferred()
    const config: ImageUploadConfig = { uploadImage: () => d.promise }
    const view = createView(config)

    uploadImageFiles(view, [pngFile("a.png")], 0, config)
    // Delete the whole placeholder line.
    view.dispatch({ changes: { from: 0, to: view.state.doc.length } })

    d.resolve("https://cdn/a.png")
    await flush()
    expect(view.state.doc.toString()).toBe("")
  })

  it("removes the placeholder and defers to onUploadError on rejection", async () => {
    const d = deferred()
    const onUploadError = vi.fn()
    const config: ImageUploadConfig = { uploadImage: () => d.promise, onUploadError }
    const view = createView(config, "before\nafter")
    const at = view.state.doc.line(2).from // start of "after"

    uploadImageFiles(view, [pngFile("a.png")], at, config)
    const err = new Error("boom")
    d.reject(err)
    await flush()

    // Placeholder and its inserted newline are gone; surrounding text is intact.
    expect(view.state.doc.toString()).toBe("before\nafter")
    expect(onUploadError).toHaveBeenCalledOnce()
    expect(onUploadError.mock.calls[0][0]).toBeInstanceOf(File)
    expect(onUploadError.mock.calls[0][1]).toBe(err)
  })

  it("tracks concurrent uploads independently", async () => {
    const a = deferred()
    const b = deferred()
    const uploads = new Map<string, Deferred>([
      ["a.png", a],
      ["b.png", b],
    ])
    const config: ImageUploadConfig = { uploadImage: file => uploads.get(file.name)!.promise }
    const view = createView(config)

    uploadImageFiles(view, [pngFile("a.png"), pngFile("b.png")], 0, config)
    expect(view.state.doc.toString()).toBe("![Uploading a.png…]()\n![Uploading b.png…]()\n")

    // Resolve out of order.
    b.resolve("https://cdn/b.png")
    await flush()
    a.resolve("https://cdn/a.png")
    await flush()

    expect(view.state.doc.toString()).toBe("![a.png](https://cdn/a.png)\n![b.png](https://cdn/b.png)\n")
  })

  it("does nothing inside a code block", () => {
    const upload = vi.fn(() => Promise.resolve("https://cdn/a.png"))
    const config: ImageUploadConfig = { uploadImage: upload }
    const view = createView(config, "```\ncode\n```")
    const inside = view.state.doc.line(2).from

    uploadImageFiles(view, [pngFile("a.png")], inside, config)
    expect(view.state.doc.toString()).toBe("```\ncode\n```")
    expect(upload).not.toHaveBeenCalled()
  })

  it("ignores non-image files", () => {
    const upload = vi.fn(() => Promise.resolve("url"))
    const config: ImageUploadConfig = { uploadImage: upload }
    const view = createView(config)

    const txt = new File(["x"], "a.txt", { type: "text/plain" })
    uploadImageFiles(view, [txt], 0, config)
    expect(view.state.doc.toString()).toBe("")
    expect(upload).not.toHaveBeenCalled()
  })
})

describe("paste/drop handlers", () => {
  it("uploads an image pasted into the editor", async () => {
    const d = deferred()
    const view = createView({ uploadImage: () => d.promise })

    const data = new DataTransfer()
    data.items.add(pngFile("p.png"))
    const event = new ClipboardEvent("paste", { clipboardData: data, bubbles: true, cancelable: true })
    view.contentDOM.dispatchEvent(event)

    expect(view.state.doc.toString()).toBe("![Uploading p.png…]()\n")
    expect(event.defaultPrevented).toBe(true)
    // Caret sits just past the inserted placeholder (start of the next line).
    expect(view.state.selection.main.head).toBe("![Uploading p.png…]()\n".length)

    d.resolve("https://cdn/p.png")
    await flush()
    expect(view.state.doc.toString()).toBe("![p.png](https://cdn/p.png)\n")
  })

  it("does not intercept a paste without image files", () => {
    const upload = vi.fn(() => Promise.resolve("url"))
    const view = createView({ uploadImage: upload })

    const data = new DataTransfer()
    data.setData("text/plain", "hello")
    const event = new ClipboardEvent("paste", { clipboardData: data, bubbles: true, cancelable: true })
    view.contentDOM.dispatchEvent(event)

    // CodeMirror still handles the text paste itself; our handler must not fire.
    expect(upload).not.toHaveBeenCalled()
    expect(view.state.doc.toString()).not.toContain("Uploading")
  })

  it("uploads an image dropped into the editor", async () => {
    const d = deferred()
    const view = createView({ uploadImage: () => d.promise })

    const data = new DataTransfer()
    data.items.add(pngFile("d.png"))
    const event = new DragEvent("drop", { bubbles: true, cancelable: true })
    // happy-dom's DragEvent does not carry `dataTransfer` from its init dict.
    Object.defineProperty(event, "dataTransfer", { value: data })
    view.contentDOM.dispatchEvent(event)

    expect(view.state.doc.toString()).toBe("![Uploading d.png…]()\n")
    expect(event.defaultPrevented).toBe(true)

    d.resolve("https://cdn/d.png")
    await flush()
    expect(view.state.doc.toString()).toBe("![d.png](https://cdn/d.png)\n")
  })
})
