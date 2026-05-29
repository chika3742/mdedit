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
    doc: "# Hello\n\nStart editing...",
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
