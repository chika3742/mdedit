import type { KeyBinding } from "@codemirror/view"
import { toggleBold, toggleItalic, toggleStrikethrough } from "../commands/formatting.js"
import { autocompleteCodeblock, autoRemoveCode } from "../commands/autocompleteCodeblock.js"
import { toggleLink } from "../commands/toggleLink.js"
import { toggleHeading } from "../commands/toggleHeading.js"
import { startNewLine } from "../commands/startNewLine.js"

export const editorKeymap: KeyBinding[] = [
  { key: "Mod-b", run: toggleBold, preventDefault: true },
  { key: "Mod-i", run: toggleItalic, preventDefault: true },
  { key: "Mod-Shift-x", run: toggleStrikethrough, preventDefault: true },
  { key: "`", run: autocompleteCodeblock, preventDefault: true },
  { key: "Backspace", run: autoRemoveCode },
  { key: "Shift-Enter", run: startNewLine },
  { key: "Mod-k", run: toggleLink, preventDefault: true },
  { key: "Mod-1", run: toggleHeading(1), preventDefault: true },
  { key: "Mod-2", run: toggleHeading(2), preventDefault: true },
  { key: "Mod-3", run: toggleHeading(3), preventDefault: true },
  { key: "Mod-4", run: toggleHeading(4), preventDefault: true },
  { key: "Mod-5", run: toggleHeading(5), preventDefault: true },
  { key: "Mod-6", run: toggleHeading(6), preventDefault: true },
]
