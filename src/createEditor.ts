import { dropCursor, EditorView, highlightSpecialChars, keymap } from "@codemirror/view"
import { bracketMatching, indentOnInput, syntaxHighlighting } from "@codemirror/language"
import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete"
import { markdown, markdownLanguage } from "@codemirror/lang-markdown"
import { languages } from "@codemirror/language-data"
import { EditorState, Prec } from "@codemirror/state"
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands"
import { classifyCodeblock } from "./extensions/classifyCodeblock.js"
import { editorTheme, markdownHighlightStyle } from "./extensions/theme.js"
import { editorKeymap, saveKeyBinding } from "./extensions/keymap.js"
import { imageUpload } from "./extensions/imageUpload.js"

export interface EditorConfig {
  parent: HTMLElement
  doc?: string
  uploadImage?: (file: File) => Promise<string>
  onUploadError?: (file: File, error: unknown) => void
  onChange?: (value: string) => void
  onCursorUpdate?: () => void
  onSave?: () => void
}

export function createEditor(config: EditorConfig): EditorView {
  const extensions = [
    classifyCodeblock,
    history(),
    dropCursor(),
    indentOnInput(),
    bracketMatching(),
    closeBrackets(),
    keymap.of(closeBracketsKeymap),
    highlightSpecialChars(),
    EditorView.lineWrapping,
    markdown({ base: markdownLanguage, codeLanguages: languages }),
    syntaxHighlighting(markdownHighlightStyle()),
    Prec.high(keymap.of(editorKeymap)),
    keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
    Prec.high(editorTheme),
    ...config.onSave ? [keymap.of([saveKeyBinding(config.onSave)])] : [],
  ]

  if (config.uploadImage) {
    extensions.push(imageUpload({ uploadImage: config.uploadImage, onUploadError: config.onUploadError }))
  }

  if (config.onChange) {
    const onChange = config.onChange
    extensions.push(
      EditorView.updateListener.of((update) => {
        if (update.docChanged) onChange(update.state.doc.toString())
      }),
    )
  }

  if (config.onCursorUpdate) {
    const onCursorUpdate = config.onCursorUpdate
    extensions.push(
      EditorView.updateListener.of((update) => {
        if (update.docChanged || update.selectionSet) onCursorUpdate()
      }),
    )
  }

  const state = EditorState.create({ doc: config.doc ?? "", extensions })
  return new EditorView({ state, parent: config.parent })
}
