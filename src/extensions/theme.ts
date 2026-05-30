import { HighlightStyle } from "@codemirror/language"
import { EditorView } from "@codemirror/view"
import { tags as t } from "@lezer/highlight"

export const markdownHighlightStyle = () => {
  return HighlightStyle.define([
    { tag: t.heading1, fontSize: "1.8em", fontWeight: "700", lineHeight: "1.3" },
    { tag: t.heading2, fontSize: "1.5em", fontWeight: "700", lineHeight: "1.3" },
    { tag: t.heading3, fontSize: "1.3em", fontWeight: "700" },
    { tag: t.heading4, fontSize: "1.15em", fontWeight: "700" },
    { tag: [t.heading5, t.heading6], fontSize: "1.05em", fontWeight: "700" },
    { tag: t.list, color: "#dcdcdc" },
    { tag: [t.monospace], class: "cm-inline-code", color: "#ed8780" },
    { tag: t.strong, fontWeight: "700" },
    { tag: t.emphasis, fontStyle: "italic" },
    { tag: t.strikethrough, textDecoration: "line-through" },
    { tag: t.link, color: "#2563eb", textDecoration: "underline" },
    { tag: t.url, color: "#2563eb" },
    { tag: t.quote, color: "#5f6368", fontStyle: "italic" },
    { tag: [t.meta, t.processingInstruction], color: "#9aa0a6" },
    { tag: [t.keyword, t.bool, t.special(t.typeName)], color: "#ec9659" },
    { tag: [t.string], color: "#4bea3f" },
    { tag: [t.variableName], color: "#dd88f8" },
    { tag: [t.number], color: "#81bcf6" },
  ], {
    themeType: "dark",
  })
}

export const editorTheme = EditorView.theme({
  "&": {
    background: "#343434",
    margin: "16px",
    color: "#dcdcdc",
    fontSize: "20px",
    height: "100%",
  },
  ".cm-content": {
    fontFamily: `"Noto Sans JP", sans-serif !important`,
  },
  ".cm-codeblock-line": {
    background: "#424242",
  },
  ".monospace-font": {
    fontFamily: `"JetBrains Mono", SFMono-Regular, Menlo, monospace`,
  },
}, { dark: true })
