# mdedit

> [!WARNING]
> 
> This package is not intended for use outside of my project.

An embeddable Markdown editor library built on [CodeMirror 6](https://codemirror.net/).
It provides formatting commands — bold, italic, strikethrough, code, link, font color, font size, horizontal rule, blockquote, bullet list, and ordered list — along with image upload and a way to read the toolbar state (active / inactive / disabled).

## Installation

```sh
pnpm add @chika3742/mdedit
```

## Usage

```ts
import { createMarkdownEditor } from "@chika3742/mdedit"
import type { ButtonState } from "@chika3742/mdedit"

const editor = createMarkdownEditor(document.querySelector("#md-root")!, {
  autofocus: true,
  onStateChange: (state: ButtonState) => {
    // Reflect the state onto your toolbar buttons
    console.log(state)
  },
  // Enable image paste/drop and the uploadImage method
  uploadImage: async (file) => {
    const url = await myUploader(file)
    return url
  },
  onUploadError: (file, error) => console.error(file.name, error),
})

// Run formatting commands
editor.toggleBold()
editor.toggleItalic()
editor.toggleStrikethrough()
editor.toggleCode()
editor.toggleLink()
editor.insertFontColor()
editor.insertFontSize()
editor.toggleHorizontalRule()
editor.toggleBlockquote()
editor.toggleBulletList()
editor.toggleOrderedList()
editor.toggleHeading(2) // ATX heading, level 1–6

// Upload an image at the current cursor
editor.uploadImage(file)

// Read the current state
const state = editor.getButtonState()

// Dispose
editor.destroy()
```

See [`example/`](./example) for a complete toolbar integration.

## API

### `createMarkdownEditor(element, options?)`

Creates a Markdown editor in the given element and returns a `MarkdownEditor`.

| Option | Type | Description |
| --- | --- | --- |
| `autofocus` | `boolean` | Focus the editor on creation |
| `onStateChange` | `(state: ButtonState) => void` | Called when the button state changes on caret move or edit |
| `uploadImage` | `(file: File) => Promise<string>` | Uploads an image and resolves to its URL. Enabling this lets the editor accept pasted/dropped images and exposes the `uploadImage` method |
| `onUploadError` | `(file: File, error: unknown) => void` | Called when an image upload rejects |

`MarkdownEditor` methods:

- `toggleBold()` / `toggleItalic()` / `toggleStrikethrough()` / `toggleCode()` — toggle the format of the current selection
- `toggleLink()` — insert a link template when outside a link, or unwrap to the link text when inside one
- `insertFontColor()` — wrap the selection in a `<span style="color: ...">` template, with the caret on the color placeholder
- `insertFontSize()` — wrap the selection in a `<span style="font-size: ...">` template, with the caret on the size placeholder
- `toggleHorizontalRule()` — toggle a horizontal rule (`---`) at the cursor
- `toggleBlockquote()` — toggle blockquote (`> `) on each selected line
- `toggleBulletList()` — toggle a bullet list (`- `) on each selected line
- `toggleOrderedList()` — toggle an ordered list (`1. `) on each selected line, renumbering across a multi-line selection
- `toggleHeading(level)` — toggle an ATX heading of the given level (1–6) on each selected line
- `uploadImage(file)` — upload an image at the current cursor, inserting a placeholder until the upload resolves (no-op when `uploadImage` is not configured)
- `getButtonState()` — return the current toolbar state (`ButtonState`)
- `destroy()` — dispose the editor

`ButtonState` has one entry per toggleable command (`bold`, `italic`, `strikethrough`, `code`, `link`, `horizontalRule`, `blockquote`, `bulletList`, `orderedList`, `heading2`, `heading3`, `heading4`), each one of `"inactive" | "active" | "disabled"`.

## Keyboard shortcuts

| Action | Shortcut |
| --- | --- |
| Bold | `Mod-b` |
| Italic | `Mod-i` |
| Strikethrough | `Mod-Shift-x` |
| Code | `` ` `` |
| Insert link | `Mod-k` |
| Heading 1–6 | `Mod-1` … `Mod-6` |

Images can also be added by pasting or dropping them into the editor when `uploadImage` is configured.

## Development

```sh
pnpm dev         # Start the example on a local dev server
pnpm test        # Run tests with vitest
pnpm typecheck   # Type-check
pnpm lint        # ESLint
pnpm check       # Run lint, typecheck, and test in order
```
