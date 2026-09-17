/** First line of the card name; overflow goes to a second line. */
export var NAME_LINE_MAX = 20

/**
 * Split a card name onto two lines when it exceeds 20 characters.
 * Prefers a space at or before 20 (first / last name); otherwise breaks at 20.
 */
export function wrapCardName(value) {
  var name = String(value || '').trim()
  if (!name) return ''
  if (name.length <= NAME_LINE_MAX) return name
  var breakAt = name.lastIndexOf(' ', NAME_LINE_MAX)
  if (breakAt < 1) breakAt = NAME_LINE_MAX
  return name.slice(0, breakAt).replace(/\s+$/, '') + '\n' + name.slice(breakAt).replace(/^\s+/, '')
}
