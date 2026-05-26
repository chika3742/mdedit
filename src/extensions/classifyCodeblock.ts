import { Decoration, type DecorationSet, EditorView, ViewPlugin, ViewUpdate } from "@codemirror/view"
import { RangeSetBuilder } from "@codemirror/state"
import { syntaxTree } from "@codemirror/language"

export const classifyCodeblock = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet

    constructor(view: EditorView) {
      this.decorations = this.build(view)
    }

    update(update: ViewUpdate) {
      this.decorations = this.build(update.view)
    }

    build(view: EditorView) {
      const builder = new RangeSetBuilder<Decoration>()

      syntaxTree(view.state).iterate({
        enter(node) {
          if (node.name === "FencedCode") {
            const lineFrom = view.state.doc.lineAt(node.from)
            const lineTo = view.state.doc.lineAt(node.to)

            for (let i = lineFrom.number; i <= lineTo.number; i++) {
              const line = view.state.doc.line(i)

              builder.add(
                line.from,
                line.from,
                Decoration.line({
                  class: "cm-codeblock-line monospace-font",
                }),
              )
            }
          }
        },
      })

      return builder.finish()
    }
  }, {
    decorations: v => v.decorations,
  },
)
