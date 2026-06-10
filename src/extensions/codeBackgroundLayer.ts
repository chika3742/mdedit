import { Direction, type EditorView, layer, RectangleMarker } from "@codemirror/view"
import { EditorSelection } from "@codemirror/state"
import { syntaxTree } from "@codemirror/language"

const markerClassName = "cm-code-background"

interface CodeRange {
  from: number
  to: number
}

export interface VisibleCodeRanges {
  fencedCodeBlocks: CodeRange[]
  inlineCode: CodeRange[]
}

// Collects the ranges of fenced code blocks and inline code within the
// visible ranges of the view. Exported so tests can assert the collected
// ranges directly, since jsdom cannot produce real pixel geometry.
export function collectVisibleCodeRanges(view: EditorView): VisibleCodeRanges {
  const fencedCodeBlocks: CodeRange[] = []
  const inlineCode: CodeRange[] = []
  // A node spanning multiple visible ranges is entered once per range,
  // so remember node starts to avoid duplicate entries.
  const seenNodeStarts = new Set<number>()

  for (const visibleRange of view.visibleRanges) {
    syntaxTree(view.state).iterate({
      from: visibleRange.from,
      to: visibleRange.to,
      enter(node) {
        if (node.name !== "FencedCode" && node.name !== "InlineCode") return
        if (!seenNodeStarts.has(node.from)) {
          seenNodeStarts.add(node.from)
          const target = node.name === "FencedCode" ? fencedCodeBlocks : inlineCode
          target.push({ from: node.from, to: node.to })
        }
        return false
      },
    })
  }

  return { fencedCodeBlocks, inlineCode }
}

// Layer markers are positioned in client pixels relative to the scroller's
// document-space origin. This mirrors the internal `getBase` helper that
// drawSelection uses for its selection markers.
function markerCoordinateBase(view: EditorView) {
  const scrollerRect = view.scrollDOM.getBoundingClientRect()
  const left = view.textDirection === Direction.LTR
    ? scrollerRect.left
    : scrollerRect.right - view.scrollDOM.clientWidth * view.scaleX
  return {
    left: left - view.scrollDOM.scrollLeft * view.scaleX,
    top: scrollerRect.top - view.scrollDOM.scrollTop * view.scaleY,
  }
}

function buildCodeBackgroundMarkers(view: EditorView): readonly RectangleMarker[] {
  const { fencedCodeBlocks, inlineCode } = collectVisibleCodeRanges(view)
  const markers: RectangleMarker[] = []
  const base = markerCoordinateBase(view)
  const contentRect = view.contentDOM.getBoundingClientRect()
  // Client-space offset of the document top from the marker coordinate base.
  const documentTopOffset = view.documentTop - base.top

  for (const block of fencedCodeBlocks) {
    const firstLineBlock = view.lineBlockAt(block.from)
    const lastLineBlock = view.lineBlockAt(block.to)
    // lineBlockAt returns unscaled document-space coordinates, while markers
    // expect client pixels, hence the scale factor.
    markers.push(new RectangleMarker(
      markerClassName,
      contentRect.left - base.left,
      documentTopOffset + firstLineBlock.top * view.scaleY,
      contentRect.width,
      (lastLineBlock.bottom - firstLineBlock.top) * view.scaleY,
    ))
  }

  for (const range of inlineCode) {
    // forRange handles coordinate conversion, line wrapping, and bidi text.
    markers.push(...RectangleMarker.forRange(view, markerClassName, EditorSelection.range(range.from, range.to)))
  }

  return markers
}

// Paints code block and inline code backgrounds in a layer behind the
// selection layer produced by drawSelection(), so selection highlights stay
// visible over code. Below-content layers get z-index -1 minus their facet
// position, so this extension must be registered with lower precedence than
// drawSelection() (see createEditor.ts).
export const codeBackgroundLayer = layer({
  above: false,
  class: "cm-code-background-layer",
  markers: buildCodeBackgroundMarkers,
  update(update) {
    // Markdown parses incrementally, so also redraw when the syntax tree
    // changes without a document change. Geometry changes are handled by the
    // layer machinery itself.
    return update.docChanged || update.viewportChanged
      || syntaxTree(update.startState) !== syntaxTree(update.state)
  },
})
