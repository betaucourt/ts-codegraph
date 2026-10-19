import { describe, expect, it } from 'vitest';

import { compileStrict } from '../../src/render/engine.js';

/**
 * Engine spike (step-06 kill gate). Verdict recorded in step-06a-report.md: pass.
 */
describe('template engine spike — Handlebars strict mode', () => {
  const sampleData = {
    pkg: { name: 'widget' },
    items: [{ label: 'a' }, { label: 'b' }],
  };

  it('renders byte-identical output across two renders', () => {
    const template = compileStrict(
      '# {{pkg.name}}\n{{#each items}}- {{this.label}}\n{{/each}}',
      { noEscape: true },
    );
    const first = template(sampleData);
    const second = template(sampleData);
    expect(second).toBe(first);
    expect(first).toBe('# widget\n- a\n- b\n');
  });

  it('throws on a missing value output (top-level) in strict mode', () => {
    expect(() => compileStrict('{{missingField}}')({})).toThrow(/not defined/);
  });

  it('throws on a missing nested value output in strict mode', () => {
    expect(() => compileStrict('{{pkg.absent}}')({ pkg: { name: 'x' } })).toThrow();
  });

  it('throws on a missing field everywhere — value output AND block helpers (no silent empty)', () => {
    // Output positions throw.
    expect(() => compileStrict('{{missing}}')({})).toThrow();
    expect(() => compileStrict('{{o.x}}')({ o: {} })).toThrow();
    // Access through an undefined parent throws.
    expect(() => compileStrict('{{#if missingParent.flag}}x{{/if}}')({})).toThrow();
    // Hardened block helpers: a missing field throws in block position too, so a
    // typo'd section/list cannot silently render empty.
    expect(() => compileStrict('{{#if missing}}x{{/if}}')({})).toThrow(/missing field/);
    expect(() => compileStrict('{{#each missing}}-{{/each}}')({})).toThrow(/missing field/);
    expect(() => compileStrict('{{#each p.bad}}-{{/each}}')({ p: { name: 'x' } })).toThrow(/missing field/);
    expect(() => compileStrict('{{#unless missing}}u{{/unless}}')({})).toThrow(/missing field/);
    expect(() => compileStrict('{{#with missing}}w{{/with}}')({})).toThrow(/missing field/);
  });

  it('renders present-but-empty/falsy values normally (only missing fields throw)', () => {
    // A present boolean flag (the DTO section pattern) drives the else branch.
    expect(compileStrict('{{#if s.present}}Y{{else}}N{{/if}}')({ s: { present: false } })).toBe('N');
    // A present but empty array renders its inverse — not a throw.
    expect(compileStrict('{{#each items}}-{{else}}none{{/each}}')({ items: [] })).toBe('none');
    // A present array iterates with block params intact.
    expect(compileStrict('{{#each items}}{{@index}}:{{this}} {{/each}}', { noEscape: true })({ items: ['a', 'b'] })).toBe(
      '0:a 1:b ',
    );
    // A present object with #with resolves its context.
    expect(compileStrict('{{#with o}}{{name}}{{/with}}')({ o: { name: 'ok' } })).toBe('ok');
  });

  it('passes helpers only data arguments (no options-object leak)', () => {
    let received: unknown;
    const template = compileStrict('{{capture pkg.name}}', {
      helpers: {
        capture: (value) => {
          received = value;
          return '';
        },
      },
    });
    template(sampleData);
    expect(received).toBe('widget');
  });

  it('rejects a helper that does not return a string', () => {
    const template = compileStrict('{{bad}}', {
      helpers: { bad: () => 123 as unknown as string },
    });
    expect(() => template({})).toThrow(/must return a string/);
  });

  it('blocks prototype property access (no eval / no proto escalation)', () => {
    expect(() => compileStrict('{{value.constructor}}', { noEscape: true })({ value: 'x' })).toThrow();
  });

  it('is a pure function: two isolated compilations of the same source agree and share no state', () => {
    const source = '{{shout pkg.name}}';
    const helpers = { shout: (v: unknown) => String(v).toUpperCase() };
    const a = compileStrict(source, { helpers })(sampleData);
    const b = compileStrict(source, { helpers })(sampleData);
    expect(a).toBe('WIDGET');
    expect(b).toBe(a);
  });

  it('leaves Markdown metacharacters intact with noEscape and preserves whitespace exactly', () => {
    const template = compileStrict('| {{pkg.name}} | {{items.0.label}} |\n', { noEscape: true });
    expect(template(sampleData)).toBe('| widget | a |\n');
  });
});
