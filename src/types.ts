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
   * Inserts link for the current selection.
   */
  insertLink: () => void
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
}
