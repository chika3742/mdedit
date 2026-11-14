import { createMarkdownEditor } from "../src/index.js"
import type { ButtonState } from "../src/index.js"

(() => {
  const buttons = Array.from(
    document.querySelectorAll<HTMLButtonElement>("#toolbar button[data-cmd]"),
  )

  // Map buttons with a data-cmd to their state key -> button element.
  const byKey = new Map<keyof ButtonState, HTMLButtonElement>()
  for (const button of buttons) {
    byKey.set(button.dataset.cmd as keyof ButtonState, button)
  }

  // Reflect state in the button appearance (active = highlight, disabled = disabled).
  const render = (state: ButtonState) => {
    for (const [key, button] of byKey) {
      button.classList.toggle("active", state[key] === "active")
      button.disabled = state[key] === "disabled"
    }
  }

  const editor = createMarkdownEditor(document.querySelector("#md-root")!, {
    autofocus: true,
    initialValue: `# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

## Inline formatting

**Bold**, *italic*, ~~strikethrough~~, \`inline code\` and ***bold italic***.
Nested: **bold with *italic* inside**, ~~strike with **bold**~~.
Link: [CodeMirror](https://codemirror.net) / autolink: <https://example.com>
<span style="color: red;">Colored text</span> and <span style="font-size: 20px;">large text</span>.
Formatting inside code is ignored: \`**not bold**\`

日本語の文章でダブルクリックによる単語選択を試せます。吾輩は猫である。名前はまだ無い。

## Lists

- Bullet item
- Item with **bold**
  - Nested item
    - Deeper item
* Asterisk bullet

1. First
2. Second
   1. Nested ordered
3. Third

## Blockquote

> Quoted text
> with **bold** and \`code\`
>
> > Nested quote

## Horizontal rule

---

## Code blocks

\`\`\`ts
const greet = (name: string): string => {
  // Comment
  return \`Hello, \${name}!\`
}
console.log(greet("world"), 42, true)
\`\`\`

\`\`\`
Plain fenced code without a language
\`\`\`

## Image

![placeholder](https://placehold.co/120x60)

## Try it

- Enter: continues lists / quotes
- Shift+Enter: open a new line below from anywhere in the line
- Type \` to auto-pair inline code (Backspace removes an empty pair), \`\`\` for a code block
- Mod+B / Mod+I / Mod+Shift+X / Mod+K / Mod+1..6
- Paste or drop an image file to upload
`,
    onChanged: value => console.log("changed:", value),
    onStateChange: render,
    // Dummy upload: wait a moment, then return an object URL.
    uploadImage: async (file) => {
      await new Promise(resolve => setTimeout(resolve, 3000))
      return URL.createObjectURL(file)
    },
    onUploadError: (file, error) => console.error("upload failed:", file.name, error),
  })

  // Image button -> file picker -> upload via the explicit API.
  const imageInput = document.querySelector<HTMLInputElement>("#image-input")!
  document.querySelector<HTMLButtonElement>("#image-button")!
    .addEventListener("mousedown", (event) => {
      event.preventDefault()
      imageInput.click()
    })
  imageInput.addEventListener("change", () => {
    for (const file of Array.from(imageInput.files ?? [])) editor.uploadImage(file)
    imageInput.value = ""
  })

  // Only buttons backed by a toggle/insert method run on click (link is state-display only).
  const commands = {
    bold: () => editor.toggleBold(),
    italic: () => editor.toggleItalic(),
    strikethrough: () => editor.toggleStrikethrough(),
    code: () => editor.toggleCode(),
    link: () => editor.toggleLink(),
    fontColor: () => editor.insertFontColor(),
    fontSize: () => editor.insertFontSize(),
    horizontalRule: () => editor.toggleHorizontalRule(),
    blockquote: () => editor.toggleBlockquote(),
    bulletList: () => editor.toggleBulletList(),
    orderedList: () => editor.toggleOrderedList(),
    heading2: () => editor.toggleHeading(2),
    heading3: () => editor.toggleHeading(3),
    heading4: () => editor.toggleHeading(4),
  } as const

  for (const [key, button] of byKey) {
    const run = commands[key as keyof typeof commands]
    if (!run) continue
    // preventDefault on mousedown so the command runs while keeping the editor selection.
    button.addEventListener("mousedown", (event) => {
      event.preventDefault()
      run()
    })
  }

  // Initial render (onStateChange does not fire immediately on subscribe).
  render(editor.getButtonState())
})()
