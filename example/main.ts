import { createMarkdownEditor } from "../src/index.js"
import type { ButtonState } from "../src/index.js"

(() => {
  const buttons = Array.from(
    document.querySelectorAll<HTMLButtonElement>("#toolbar button"),
  )

  // data-cmd を持つボタンを、状態キー -> ボタン要素 に対応付ける
  const byKey = new Map<keyof ButtonState, HTMLButtonElement>()
  for (const button of buttons) {
    byKey.set(button.dataset.cmd as keyof ButtonState, button)
  }

  // 状態をボタンの見た目へ反映（active=ハイライト, disabled=無効化）
  const render = (state: ButtonState) => {
    for (const [key, button] of byKey) {
      button.classList.toggle("active", state[key] === "active")
      button.disabled = state[key] === "disabled"
    }
  }

  const editor = createMarkdownEditor(document.querySelector("#md-root")!, {
    autofocus: true,
    onStateChange: render,
  })

  // toggle メソッドを持つボタンだけクリックで実行（link は状態表示のみ）
  const commands = {
    bold: () => editor.toggleBold(),
    italic: () => editor.toggleItalic(),
    strikethrough: () => editor.toggleStrikethrough(),
    code: () => editor.toggleCode(),
  } as const

  for (const [key, button] of byKey) {
    const run = commands[key as keyof typeof commands]
    if (!run) continue
    // mousedown で preventDefault し、エディタの選択を保ったままコマンドを実行
    button.addEventListener("mousedown", (event) => {
      event.preventDefault()
      run()
    })
  }

  // 初期表示（onStateChange は購読時に即時発火しないため）
  render(editor.getButtonState())
})()
