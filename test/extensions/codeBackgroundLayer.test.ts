import { afterEach, describe, expect, it } from "vitest"
import { EditorState, Prec } from "@codemirror/state"
import { drawSelection, EditorView } from "@codemirror/view"
import { markdown, markdownLanguage } from "@codemirror/lang-markdown"
import { languages } from "@codemirror/language-data"
import { ensureSyntaxTree } from "@codemirror/language"
import { codeBackgroundLayer, collectVisibleCodeRanges } from "../../src/extensions/codeBackgroundLayer.js"

// Track created views/parents so each test cleans up after itself.
const mounted: { view: EditorView, parent: HTMLElement }[] = []

function createView(doc: string) {
  const state = EditorState.create({
    doc,
    extensions: [
      markdown({ base: markdownLanguage, codeLanguages: languages }),
      // Mirror the registration order in createEditor.ts so layer ordering
      // relative to drawSelection() is covered.
      drawSelection(),
      Prec.lowest(codeBackgroundLayer),
    ],
  })
  ensureSyntaxTree(state, doc.length)
  const parent = document.createElement("div")
  document.body.appendChild(parent)
  const view = new EditorView({ state, parent })
  mounted.push({ view, parent })
  return view
}

// Layer markers are drawn in a measure cycle scheduled via requestAnimationFrame.
function flushMeasure() {
  return new Promise<void>(resolve =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  )
}

function backgroundMarkers(view: EditorView) {
  return view.dom.querySelectorAll(".cm-code-background")
}

afterEach(() => {
  for (const { view, parent } of mounted.splice(0)) {
    view.destroy()
    parent.remove()
  }
})

describe("codeBackgroundLayer", () => {
  it("renders the background layer below the selection layer", () => {
    const view = createView("plain text")

    const backgroundLayer = view.dom.querySelector<HTMLElement>(".cm-code-background-layer")
    const selectionLayer = view.dom.querySelector<HTMLElement>(".cm-selectionLayer")
    expect(backgroundLayer).not.toBeNull()
    expect(selectionLayer).not.toBeNull()
    // Both are below-content layers (negative z-index); the code background
    // must sort behind the selection so highlights stay visible over code.
    expect(Number(backgroundLayer!.style.zIndex)).toBeLessThan(Number(selectionLayer!.style.zIndex))
  })

  it("draws one marker for a fenced code block", async () => {
    const view = createView("before\n```js\nconst a = 1\n```\nafter")

    await flushMeasure()
    expect(backgroundMarkers(view)).toHaveLength(1)
  })

  it("draws one marker per fenced code block", async () => {
    const view = createView("```\nfirst\n```\n\ntext\n\n```\nsecond\n```")

    await flushMeasure()
    expect(backgroundMarkers(view)).toHaveLength(2)
  })

  it("draws no markers for plain text", async () => {
    const view = createView("just some\nplain text")

    await flushMeasure()
    expect(backgroundMarkers(view)).toHaveLength(0)
  })

  it("adds a marker when an edit introduces a fenced code block", async () => {
    const view = createView("text")

    await flushMeasure()
    expect(backgroundMarkers(view)).toHaveLength(0)

    view.dispatch({ changes: { from: view.state.doc.length, insert: "\n```\ncode\n```" } })
    ensureSyntaxTree(view.state, view.state.doc.length)
    await flushMeasure()

    expect(backgroundMarkers(view)).toHaveLength(1)
  })
})

describe("collectVisibleCodeRanges", () => {
  // happy-dom has no real layout, so pixel geometry of inline code markers
  // cannot be asserted; verify the collected ranges instead.
  it("collects fenced code blocks and inline code separately", () => {
    const doc = "intro `inline` outro\n```js\nconst a = 1\n```"
    const view = createView(doc)

    const { fencedCodeBlocks, inlineCode } = collectVisibleCodeRanges(view)

    expect(inlineCode).toEqual([{ from: doc.indexOf("`inline`"), to: doc.indexOf("`inline`") + "`inline`".length }])
    expect(fencedCodeBlocks).toEqual([{ from: doc.indexOf("```js"), to: doc.length }])
  })

  it("returns no ranges for plain text", () => {
    const view = createView("no code here")

    const { fencedCodeBlocks, inlineCode } = collectVisibleCodeRanges(view)

    expect(fencedCodeBlocks).toHaveLength(0)
    expect(inlineCode).toHaveLength(0)
  })
})
