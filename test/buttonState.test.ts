import { describe, expect, it } from "vitest"
import { EditorState } from "@codemirror/state"
import { markdown, markdownLanguage } from "@codemirror/lang-markdown"
import { languages } from "@codemirror/language-data"
import { ensureSyntaxTree } from "@codemirror/language"
import { getButtonState } from "../src/state/buttonState.js"

// docとカーソル位置（"|"の位置）からButtonStateを算出する
function stateAt(docWithCursor: string) {
  const cursor = docWithCursor.indexOf("|")
  const doc = docWithCursor.replace("|", "")
  const state = EditorState.create({
    doc,
    selection: { anchor: cursor },
    extensions: [markdown({ base: markdownLanguage, codeLanguages: languages })],
  })
  // 構文木を同期的に確定させる
  ensureSyntaxTree(state, doc.length)
  return getButtonState(state)
}

describe("getButtonState", () => {
  it("太字ノード内ではboldがactive", () => {
    expect(stateAt("**bo|ld**").bold).toBe("active")
  })

  it("イタリックノード内ではitalicがactive", () => {
    expect(stateAt("*it|alic*").italic).toBe("active")
  })

  it("打ち消し線ノード内ではstrikethroughがactive", () => {
    expect(stateAt("~~de|l~~").strikethrough).toBe("active")
  })

  it("インラインコード内ではcodeがactive", () => {
    expect(stateAt("`co|de`").code).toBe("active")
  })

  it("プレーンテキスト上では全てinactive（linkは常にinactive）", () => {
    const s = stateAt("pla|in text")
    expect(s).toEqual({
      bold: "inactive",
      italic: "inactive",
      strikethrough: "inactive",
      code: "inactive",
      link: "inactive",
    })
  })

  it("コードブロック内ではbold/italic/strike/linkがdisabled、codeはactive", () => {
    const s = stateAt("```\nco|de\n```")
    expect(s.bold).toBe("disabled")
    expect(s.italic).toBe("disabled")
    expect(s.strikethrough).toBe("disabled")
    expect(s.link).toBe("disabled")
    expect(s.code).toBe("active")
  })

  it("linkはノード内でもactiveにならない", () => {
    expect(stateAt("[te|xt](url)").link).toBe("inactive")
  })
})
