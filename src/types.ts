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
  toggleBold: () => void
  toggleItalic: () => void
  toggleStrikethrough: () => void
  toggleCode: () => void
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
