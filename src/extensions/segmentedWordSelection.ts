import { EditorView } from "@codemirror/view"
import { EditorSelection, type EditorState, type SelectionRange } from "@codemirror/state"

const segmenter = new Intl.Segmenter(undefined, { granularity: "word" })

const wordRangeAt = (state: EditorState, pos: number, assoc: 1 | -1): SelectionRange => {
  const line = state.doc.lineAt(pos)
  if (line.length === 0) {
    return EditorSelection.cursor(pos)
  }

  const index = Math.max(0, Math.min(pos - line.from - (assoc < 0 ? 1 : 0), line.length - 1))

  const segments = segmenter.segment(line.text)
  const scan = (firstSegment: Intl.SegmentData, orientation: "forward" | "backward") => {
    let extending = 0
    while (true) {
      const segment = segments.containing(index + extending)
      if (!segment || !segment.segment.match(/^[\p{P}\p{Zs}]+$/u) || segment.segment !== firstSegment.segment) {
        return Math.max(0, Math.abs(extending) - 1)
      }
      if (orientation === "forward") extending += 1
      else extending -= 1
    }
  }
  const segment = segments.containing(index)
  if (!segment) {
    throw Error("No segment containing the text found")
  }
  const backExtending = scan(segment, "backward")
  const forwardExtending = scan(segment, "forward")
  console.log({ forwardExtending, backExtending })
  const from = line.from + segment.index
  return EditorSelection.range(from - backExtending, from + segment.segment.length + forwardExtending)
}

export const segmentedWordSelection = EditorView.mouseSelectionStyle.of((view, event) => {
  if (event.button !== 0 || event.detail !== 2) {
    return null
  }

  const posAndSideAt = (e: MouseEvent) => view.posAndSideAtCoords({ x: e.clientX, y: e.clientY }, false)
  const start = posAndSideAt(event)
  let startPos = start.pos
  let startSelection = view.state.selection

  return {
    get(curEvent, extend, multiple) {
      const cursor = posAndSideAt(curEvent)
      let range = wordRangeAt(view.state, cursor.pos, cursor.assoc)

      if (cursor.pos !== startPos && !extend) {
        const startRange = wordRangeAt(view.state, startPos, start.assoc)
        const from = Math.min(startRange.from, range.from)
        const to = Math.max(startRange.to, range.to)
        range = from < range.from ? EditorSelection.range(from, to) : EditorSelection.range(to, from)
      }

      if (extend) {
        return startSelection.replaceRange(startSelection.main.extend(range.from, range.to))
      }
      if (multiple) {
        return startSelection.addRange(range)
      }
      return EditorSelection.create([range])
    },
    update(update) {
      if (update.docChanged) {
        startPos = update.changes.mapPos(startPos)
        startSelection = startSelection.map(update.changes)
      }
    },
  }
})
