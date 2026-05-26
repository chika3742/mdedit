export interface MarkdownEditorOptions {
  autofocus?: boolean
  /**
   * Called when the button state changes (caret move or edit).
   */
  onStateChange?: (state: ButtonState) => void
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
