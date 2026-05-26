import { createMarkdownEditor } from "../src/index.js";

(() => {
  createMarkdownEditor(document.querySelector("#md-root")!, { autofocus: true })
})()
