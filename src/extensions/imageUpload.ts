import { EditorView } from "@codemirror/view"
import { EditorSelection, StateEffect, StateField } from "@codemirror/state"
import type { Extension } from "@codemirror/state"
import { intersectsCode } from "../utils/intersectsCode.js"

export interface ImageUploadConfig {
  /**
   * Uploads an image file and resolves to its URL.
   */
  uploadImage: (file: File) => Promise<string>
  /**
   * Called when an upload rejects.
   */
  onUploadError?: (file: File, error: unknown) => void
}

interface Placeholder {
  from: number
  to: number
  /** Snapshot of the placeholder text, used to verify before replacing. */
  text: string
}

type PlaceholderMap = Map<number, Placeholder>

const addPlaceholder = StateEffect.define<{ id: number, from: number, to: number, text: string }>()
const removePlaceholder = StateEffect.define<{ id: number }>()

const placeholderField = StateField.define<PlaceholderMap>({
  create: () => new Map(),
  update(value, tr) {
    let map = value
    if (tr.docChanged) {
      // Remap every tracked placeholder through the document changes.
      // Inner bias (from +1, to -1) avoids extending the range when the user
      // types right at a boundary.
      map = new Map()
      for (const [id, p] of value) {
        map.set(id, {
          ...p,
          from: tr.changes.mapPos(p.from, 1),
          to: tr.changes.mapPos(p.to, -1),
        })
      }
    }
    for (const e of tr.effects) {
      if (e.is(addPlaceholder)) {
        if (map === value) map = new Map(value)
        map.set(e.value.id, { from: e.value.from, to: e.value.to, text: e.value.text })
      }
      else if (e.is(removePlaceholder)) {
        if (map === value) map = new Map(value)
        map.delete(e.value.id)
      }
    }
    return map
  },
})

let nextId = 0

/**
 * Replaces the placeholder identified by {@link id} with {@link replacement},
 * or removes it when {@link replacement} is `null`. Stops tracking it either way.
 */
function finalize(view: EditorView, id: number, replacement: string | null): void {
  // Discard results that resolve after the view was destroyed/detached.
  if (!view.dom.isConnected) return
  const p = view.state.field(placeholderField, false)?.get(id)
  if (!p) return
  // The user may have edited or deleted the placeholder while uploading.
  if (view.state.doc.sliceString(p.from, p.to) !== p.text) {
    view.dispatch({ effects: removePlaceholder.of({ id }) })
    return
  }
  if (replacement === null) {
    // On failure, drop the placeholder entirely, including the newline we
    // inserted with it, so no stray markdown is left behind.
    const to = view.state.doc.sliceString(p.to, p.to + 1) === "\n" ? p.to + 1 : p.to
    view.dispatch({ changes: { from: p.from, to }, effects: removePlaceholder.of({ id }) })
    return
  }
  view.dispatch({
    changes: { from: p.from, to: p.to, insert: replacement },
    effects: removePlaceholder.of({ id }),
    scrollIntoView: true,
  })
}

/**
 * Inserts a placeholder for each image file and uploads it asynchronously,
 * replacing the placeholder with the image markdown once the URL resolves.
 */
export function uploadImageFiles(
  view: EditorView,
  files: ArrayLike<File>,
  pos: number,
  config: ImageUploadConfig,
): void {
  const images = Array.from(files).filter(f => f.type.startsWith("image/"))
  if (images.length === 0) return

  let at = pos
  if (intersectsCode(view.state, EditorSelection.cursor(at))) return

  for (const file of images) {
    const id = nextId++
    const text = `![Uploading ${file.name}…]()`
    view.dispatch({
      changes: { from: at, insert: text + "\n" },
      effects: addPlaceholder.of({ id, from: at, to: at + text.length, text }),
      // Move the caret just past the inserted placeholder (start of the next line).
      selection: EditorSelection.cursor(at + text.length + 1),
      scrollIntoView: true,
    })
    at += text.length + 1

    Promise.resolve(config.uploadImage(file))
      .then(url => finalize(view, id, `![${file.name}](${url})`))
      .catch((error) => {
        // Leave the failure handling to the caller; just remove the placeholder.
        finalize(view, id, null)
        config.onUploadError?.(file, error)
      })
  }
}

function imageFilesFromDataTransfer(data: DataTransfer | null): File[] {
  if (!data) return []
  return Array.from(data.files).filter(f => f.type.startsWith("image/"))
}

/**
 * Editor extension that uploads pasted and dropped image files, showing a
 * placeholder until the upload resolves.
 */
export function imageUpload(config: ImageUploadConfig): Extension {
  return [
    placeholderField,
    EditorView.domEventHandlers({
      paste(event, view) {
        const items = event.clipboardData?.items
        const files = items
          ? Array.from(items)
              .filter(i => i.kind === "file" && i.type.startsWith("image/"))
              .map(i => i.getAsFile())
              .filter((f): f is File => f !== null)
          : []
        if (files.length === 0) return false
        event.preventDefault()
        uploadImageFiles(view, files, view.state.selection.main.head, config)
        return true
      },
      drop(event, view) {
        const files = imageFilesFromDataTransfer(event.dataTransfer)
        if (files.length === 0) return false
        event.preventDefault()
        const pos = view.posAtCoords({ x: event.clientX, y: event.clientY }) ?? view.state.selection.main.head
        uploadImageFiles(view, files, pos, config)
        return true
      },
    }),
  ]
}
