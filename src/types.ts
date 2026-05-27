export interface MarkdownEditorOptions {
  autofocus?: boolean
  /**
   * Called when the button state changes (caret move or edit).
   */
  onStateChange?: (state: ButtonState) => void
  /**
   * Uploads an image file and resolves to its URL. Enabling this lets the editor
   * accept pasted/dropped images and exposes the `uploadImage` method.
   */
  uploadImage?: (file: File) => Promise<string>
  /**
   * Called when an image upload rejects.
   */
  onUploadError?: (file: File, error: unknown) => void
}

export interface MarkdownEditor {
  /**
   * Disposes the Markdown editor view.
   */
  destroy: () => void
  /**
   * Toggles bold format for the current selection.
   */
  toggleBold: () => void
  /**
   * Toggles italic format for the current selection.
   */
  toggleItalic: () => void
  /**
   * Toggles strikethrough format for the current selection.
   */
  toggleStrikethrough: () => void
  /**
   * Toggles inline code / code block for the current selection.
   */
  toggleCode: () => void
  /**
   * Toggles a link for the current selection: inserts a link template when
   * outside a link, or unwraps to the link text when inside one.
   */
  toggleLink: () => void
  /**
   * Wraps the current selection in a `<span style="color: ...">` template,
   * placing the caret over the color placeholder.
   */
  insertFontColor: () => void
  /**
   * Wraps the current selection in a `<span style="font-size: ...">` template,
   * placing the caret over the size placeholder.
   */
  insertFontSize: () => void
  /**
   * Toggles a horizontal rule (`---`): inserts one at the cursor, or removes the
   * rule when the cursor is on existing.
   */
  toggleHorizontalRule: () => void
  /**
   * Toggles blockquote (`> `) on each selected line.
   */
  toggleBlockquote: () => void
  /**
   * Toggles a bullet list (`- `) on each selected line.
   */
  toggleBulletList: () => void
  /**
   * Toggles an ordered list (`1. `) on each selected line, renumbering across
   * a multi-line selection.
   */
  toggleOrderedList: () => void
  /**
   * Uploads an image at the current cursor, inserting a placeholder until the
   * upload resolves. No-op when `uploadImage` is not configured.
   */
  uploadImage: (file: File) => void
  /**
   * Returns the current toolbar button state.
   */
  getButtonState: () => ButtonState
}

export type ButtonStateValue = "inactive" | "disabled" | "active"

export interface ButtonState {
  bold: ButtonStateValue
  italic: ButtonStateValue
  strikethrough: ButtonStateValue
  code: ButtonStateValue
  link: ButtonStateValue
  horizontalRule: ButtonStateValue
  blockquote: ButtonStateValue
  bulletList: ButtonStateValue
  orderedList: ButtonStateValue
}
