/**
 * Validates invariants at runtime. This is used to quickly state an assumption.
 *
 * It is desired that the error propagate and cause React components to unmount in production.
 * If this is not desired, a separate debug_assert function can be created.
 *
 * @param value Throws when falsy
 * @param message The message to display
 */
export function runtime_assert(value, message = "Assertion Error") {
  if (!value) throw Error(message)
}
