/**
 * Determines whether a keyboard event should be ignored by shortcut handlers.
 *
 * Ignores repeated keydown strokes, keys pressed during text composition, and
 * keydown strokes with Ctrl, Alt, Meta, or Shift held.
 *
 * @param event - Keyboard event to check.
 * @returns `true` when the event should be ignored.
 */
export function shouldIgnoreKeyDown(event: KeyboardEvent): boolean {
  return event.repeat ||
    event.isComposing ||
    event.ctrlKey ||
    event.altKey ||
    event.metaKey ||
    event.shiftKey;
}
