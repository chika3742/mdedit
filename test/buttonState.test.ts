import { describe, expect, it } from "vitest"
import { EditorState } from "@codemirror/state"
import { markdown, markdownLanguage } from "@codemirror/lang-markdown"
import { languages } from "@codemirror/language-data"
import { ensureSyntaxTree } from "@codemirror/language"
import { getButtonState } from "../src/state/buttonState.js"

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

  it("all buttons are inactive on plain text (link is always inactive)", () => {
    const s = stateAt("pla|in text")
    expect(s).toEqual({
      bold: "inactive",
      italic: "inactive",
      strikethrough: "inactive",
      code: "inactive",
      link: "inactive",
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

  it("link never becomes active even inside a link node", () => {
    expect(stateAt("[te|xt](url)").link).toBe("inactive")
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
})
