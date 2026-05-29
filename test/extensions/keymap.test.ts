import { describe, expect, it, vi } from "vitest"
import { saveKeyBinding } from "../../src/extensions/keymap.js"

describe("saveKeyBinding", () => {
  it("binds Mod-s and prevents the browser default", () => {
    const binding = saveKeyBinding(vi.fn())

    expect(binding.key).toBe("Mod-s")
    expect(binding.preventDefault).toBe(true)
  })

  it("invokes onSave and reports the key as handled", () => {
    const onSave = vi.fn()
    const binding = saveKeyBinding(onSave)

    // The view argument is unused by the command, so an empty stub is sufficient.
    const handled = binding.run!({} as never)

    expect(onSave).toHaveBeenCalledTimes(1)
    expect(handled).toBe(true)
  })
})
