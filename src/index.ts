import { isEqual } from "es-toolkit"
import { createEditor } from "./createEditor.js"
import { toggleBold, toggleCode, toggleItalic, toggleStrikethrough } from "./commands/formatting.js"
import { getButtonState } from "./state/buttonState.js"
import type { ButtonState, MarkdownEditor, MarkdownEditorOptions } from "./types.js"
import { insertLink } from "./commands/insertLink.js"

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
    onCursorUpdate: onStateChange ? notify : undefined,
  })

  if (options?.autofocus) {
    view.focus()
  }

  return {
    destroy: view.destroy,
    toggleBold: () => toggleBold(view),
    toggleItalic: () => toggleItalic(view),
    toggleStrikethrough: () => toggleStrikethrough(view),
    toggleCode: () => toggleCode(view),
    insertLink: () => insertLink(view),
    getButtonState: () => getButtonState(view.state),
  }
}

export * from "./types.js"
