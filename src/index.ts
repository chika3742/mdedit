import { isEqual } from "es-toolkit"
import { createEditor } from "./createEditor.js"
import { toggleBold, toggleCode, toggleItalic, toggleStrikethrough } from "./commands/formatting.js"
import { getButtonState } from "./state/buttonState.js"
import type { ButtonState, MarkdownEditor, MarkdownEditorOptions } from "./types.js"
import { toggleLink } from "./commands/toggleLink.js"
import { insertFontColor } from "./commands/insertFontColor.js"
import { insertFontSize } from "./commands/insertFontSize.js"
import { toggleHorizontalRule } from "./commands/toggleHorizontalRule.js"
import { toggleBlockquote } from "./commands/toggleBlockquote.js"
import { toggleBulletList } from "./commands/toggleBulletList.js"
import { toggleOrderedList } from "./commands/toggleOrderedList.js"
import { toggleHeading } from "./commands/toggleHeading.js"
import { uploadImageFiles } from "./extensions/imageUpload.js"

export type { ButtonState, ButtonStateValue, MarkdownEditor, MarkdownEditorOptions } from "./types.js"
export { getButtonState } from "./state/buttonState.js"

export const createMarkdownEditor = (element: HTMLElement, options?: MarkdownEditorOptions): MarkdownEditor => {
  const onStateChange = options?.onStateChange
  let prev: ButtonState | null = null
  const notify = () => {
    if (!onStateChange) return
    const next = getButtonState(view.state)
    if (prev && isEqual(prev, next)) return
    prev = next
    onStateChange(next)
  }

  const view = createEditor({
    parent: element,
    doc: options?.initialValue,
    uploadImage: options?.uploadImage,
    onUploadError: options?.onUploadError,
    onChange: options?.onChanged,
    onCursorUpdate: onStateChange ? notify : undefined,
  })

  if (options?.autofocus) {
    view.focus()
  }

  return {
    destroy: () => view.destroy(),
    toggleBold: () => toggleBold(view),
    toggleItalic: () => toggleItalic(view),
    toggleStrikethrough: () => toggleStrikethrough(view),
    toggleCode: () => toggleCode(view),
    toggleLink: () => toggleLink(view),
    insertFontColor: () => insertFontColor(view),
    insertFontSize: () => insertFontSize(view),
    toggleHorizontalRule: () => toggleHorizontalRule(view),
    toggleBlockquote: () => toggleBlockquote(view),
    toggleBulletList: () => toggleBulletList(view),
    toggleOrderedList: () => toggleOrderedList(view),
    toggleHeading: level => toggleHeading(level)(view),
    uploadImage: (file) => {
      const uploadImage = options?.uploadImage
      if (!uploadImage) return
      uploadImageFiles(view, [file], view.state.selection.main.head, {
        uploadImage,
        onUploadError: options?.onUploadError,
      })
    },
    getButtonState: () => getButtonState(view.state),
  }
}

export * from "./types.js"
