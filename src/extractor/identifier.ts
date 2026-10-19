/**
 * Identifier token splitter (step-04 §6 task; reused by load 04b and search 05).
 *
 * A pure function that splits an identifier into lowercase search tokens across
 * camelCase, PascalCase, acronym, `snake_case`/`kebab-case`, `@scoped/name`, and
 * digit boundaries. No parser library, no I/O, no state. Order is stable and
 * duplicates are removed.
 */

// Matches one sub-token: a leading acronym before a Capitalized word, a
// lower/Capitalized word, an all-caps run, or a digit run.
const SUBTOKEN = /[A-Z]+(?=[A-Z][a-z])|[A-Z]?[a-z]+|[A-Z]+|[0-9]+/g;

/**
 * Split `identifier` into ordered, unique, lowercase tokens.
 *
 * Examples:
 *  - `createWidget` → `['create', 'widget']`
 *  - `WidgetOptions` → `['widget', 'options']`
 *  - `snake_case_name` → `['snake', 'case', 'name']`
 *  - `@codegraph/http-client` → `['codegraph', 'http', 'client']`
 *  - `getHTTPResponseCode2` → `['get', 'http', 'response', 'code', '2']`
 *  - `answer42` → `['answer', '42']`
 */
export function splitIdentifier(identifier: string): string[] {
  const parts = identifier.split(/[^A-Za-z0-9]+/);
  const tokens: string[] = [];
  const seen = new Set<string>();

  for (const part of parts) {
    if (part.length === 0) {
      continue;
    }
    const subtokens = part.match(SUBTOKEN) ?? [];
    for (const sub of subtokens) {
      const token = sub.toLowerCase();
      if (!seen.has(token)) {
        seen.add(token);
        tokens.push(token);
      }
    }
  }

  return tokens;
}
