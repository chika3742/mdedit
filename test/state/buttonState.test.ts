import { describe, expect, it } from "vitest"
import { EditorState } from "@codemirror/state"
import { markdown, markdownLanguage } from "@codemirror/lang-markdown"
import { languages } from "@codemirror/language-data"
import { ensureSyntaxTree } from "@codemirror/language"
import { getButtonState } from "../../src/index.js"

// Build a state from a doc string where "|" marks the caret position.
function stateAt(docWithCursor: string) {
  const cursor = docWithCursor.indexOf("|")
  const doc = docWithCursor.replace("|", "")
  const state = EditorState.create({
    doc,
    selection: { anchor: cursor },
    extensions: [markdown({ base: markdownLanguage, codeLanguages: languages })],
  })
  // Force the syntax tree to be parsed synchronously.
  ensureSyntaxTree(state, doc.length)
  return getButtonState(state)
}

describe("getButtonState", () => {
  it("bold is active inside a strong-emphasis node", () => {
    expect(stateAt("**bo|ld**").bold).toBe("active")
  })

  it("italic is active inside an emphasis node", () => {
    expect(stateAt("*it|alic*").italic).toBe("active")
  })

  it("strikethrough is active inside a strikethrough node", () => {
    expect(stateAt("~~de|l~~").strikethrough).toBe("active")
  })

  it("code is active inside inline code", () => {
    expect(stateAt("`co|de`").code).toBe("active")
  })

  it("all buttons are inactive on plain text", () => {
    const s = stateAt("pla|in text")
    expect(s).toEqual({
      bold: "inactive",
      italic: "inactive",
      strikethrough: "inactive",
      code: "inactive",
      link: "inactive",
      horizontalRule: "inactive",
      blockquote: "inactive",
      bulletList: "inactive",
      orderedList: "inactive",
      heading2: "inactive",
      heading3: "inactive",
      heading4: "inactive",
    })
  })

  it("inside a code block, bold/italic/strike/link are disabled and code is active", () => {
    const s = stateAt("```\nco|de\n```")
    expect(s.bold).toBe("disabled")
    expect(s.italic).toBe("disabled")
    expect(s.strikethrough).toBe("disabled")
    expect(s.link).toBe("disabled")
    expect(s.code).toBe("active")
  })

  it("link is active inside a link node", () => {
    expect(stateAt("[te|xt](url)").link).toBe("active")
  })

  it("blockquote is active inside a blockquote", () => {
    expect(stateAt("> qu|ote").blockquote).toBe("active")
  })

  it("bulletList is active inside a bullet list", () => {
    expect(stateAt("- it|em").bulletList).toBe("active")
  })

  it("orderedList is active inside an ordered list", () => {
    expect(stateAt("1. it|em").orderedList).toBe("active")
  })

  it("horizontalRule is active when the caret is on a rule", () => {
    expect(stateAt("-|--").horizontalRule).toBe("active")
  })

  it("an ordered item directly below a bullet list reports ordered, not bullet", () => {
    const s = stateAt("- a\n1. b|")
    expect(s.orderedList).toBe("active")
    expect(s.bulletList).toBe("inactive")
  })

  it("an empty ordered item below a bullet list reports ordered, not bullet", () => {
    // "1. " with no content is parsed as a loose continuation of the BulletList.
    const s = stateAt("- a\n1. |")
    expect(s.orderedList).toBe("active")
    expect(s.bulletList).toBe("inactive")
  })

  it("empty bold markers **|** make bold active and suppress italic", () => {
    const s = stateAt("**|**")
    expect(s.bold).toBe("active")
    expect(s.italic).toBe("inactive")
  })

  it("empty italic markers *|* make italic active", () => {
    const s = stateAt("*|*")
    expect(s.italic).toBe("active")
    expect(s.bold).toBe("inactive")
  })

  it("empty strikethrough markers a~~|~~a make strikethrough active", () => {
    // A standalone ~~~~ line parses as a tilde code fence, so use inline context.
    expect(stateAt("a~~|~~a").strikethrough).toBe("active")
  })

  it("empty inline-code markers `|` make code active", () => {
    expect(stateAt("`|`").code).toBe("active")
  })

  it("heading reports the active level and leaves the others inactive", () => {
    const s = stateAt("## hea|ding")
    expect(s.heading2).toBe("active")
    expect(s.heading3).toBe("inactive")
    expect(s.heading4).toBe("inactive")
  })

  it("a level-3 heading reports heading3", () => {
    expect(stateAt("### hea|ding").heading3).toBe("active")
  })

  it("a level-1 heading surfaces no heading2-4 state", () => {
    const s = stateAt("# hea|ding")
    expect(s.heading2).toBe("inactive")
    expect(s.heading3).toBe("inactive")
    expect(s.heading4).toBe("inactive")
  })

  it("inside a code block, heading2-4 are disabled", () => {
    const s = stateAt("```\nco|de\n```")
    expect(s.heading2).toBe("disabled")
    expect(s.heading3).toBe("disabled")
    expect(s.heading4).toBe("disabled")
  })
})
