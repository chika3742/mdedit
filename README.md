# mdedit

> [!WARNING]
> 
> This package is not intended for use outside of my project.

An embeddable Markdown editor library built on [CodeMirror 6](https://codemirror.net/).
It provides formatting commands — bold, italic, strikethrough, code, and link — along with a way to read their state (active / inactive / disabled).

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
})

// Run formatting commands
editor.toggleBold()
editor.toggleItalic()
editor.toggleStrikethrough()
editor.toggleCode()
editor.insertLink()

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

`MarkdownEditor` methods:

- `toggleBold()` / `toggleItalic()` / `toggleStrikethrough()` / `toggleCode()` — toggle the format of the current selection
- `insertLink()` — insert a link
- `getButtonState()` — return the current toolbar state (`ButtonState`)
- `destroy()` — dispose the editor

Each button state is one of `"inactive" | "active" | "disabled"`.

## Keyboard shortcuts

| Action | Shortcut |
| --- | --- |
| Bold | `Mod-b` |
| Italic | `Mod-i` |
| Strikethrough | `Mod-Shift-x` |
| Code | `` ` `` |
| Insert link | `Mod-k` |

## Development

```sh
pnpm dev         # Start the example on a local dev server
pnpm test        # Run tests with vitest
pnpm typecheck   # Type-check
pnpm lint        # ESLint
```
