import { createRequire } from 'node:module';

/**
 * Minimal structural view of the isolated Handlebars environment. `handlebars` is
 * a CommonJS `export =` module; it is loaded with `createRequire` so the value is
 * resolved reliably under NodeNext ESM without `esModuleInterop`.
 */
interface HandlebarsEnvironment {
  readonly helpers: Record<string, (this: unknown, ...args: unknown[]) => unknown>;
  registerHelper(name: string, fn: (this: unknown, ...args: unknown[]) => unknown): void;
  compile(
    source: string,
    options?: { readonly strict?: boolean; readonly noEscape?: boolean },
  ): (data: unknown) => string;
}
interface HandlebarsModule {
  create(): HandlebarsEnvironment;
}

const require = createRequire(import.meta.url);
const Handlebars = require('handlebars') as HandlebarsModule;

/**
 * Strict, deterministic template engine wrapper (step-06 spike).
 *
 * The engine spike (recorded in step-06a-report.md) verdict is **pass**: with
 * Handlebars in strict mode over a validated DTO, the same data renders
 * byte-identically twice, a missing field throws (never a silent empty), helpers
 * receive only data arguments and must return a string (no closure state, no
 * options-object leakage), and prototype access is blocked (Handlebars ≥ 4.6
 * default). No runtime-eval / `compat` / prototype-access options are ever enabled.
 *
 * Handlebars strict mode alone throws only for a missing **value output**; the
 * built-in block helpers (`if`/`unless`/`each`/`with`) render empty for a missing
 * field. To make "a missing field always throws" hold in block positions too, this
 * wrapper hardens those four helpers so a `undefined` primary argument (a missing
 * field) throws, while delegating to the built-in for every present value — so
 * `present: false`, empty arrays, and falsy values still behave normally.
 *
 * Each compile uses an isolated `Handlebars.create()` environment so no global
 * helper/partial state can leak between templates.
 */

/** Built-in block helpers hardened to throw on a missing (`undefined`) argument. */
const HARDENED_BLOCK_HELPERS = ['if', 'unless', 'each', 'with'] as const;

/** A pure helper: receives data arguments only and returns a string. */
export type PureHelper = (...args: readonly unknown[]) => string;

export interface CompileStrictOptions {
  /** Pure helpers registered on the isolated environment for this template. */
  readonly helpers?: Readonly<Record<string, PureHelper>>;
  /** Disable HTML escaping (Markdown output). Default: false. */
  readonly noEscape?: boolean;
}

/** A compiled template: pure function from data to a string. */
export type StrictTemplate = (data: unknown) => string;

/**
 * Compile a template in strict mode. Accessing a field absent from the data
 * throws at render time; helpers are wrapped so they receive only data arguments
 * (the trailing Handlebars options object is stripped) and must return a string.
 */
export function compileStrict(source: string, options: CompileStrictOptions = {}): StrictTemplate {
  const env = Handlebars.create();

  // Harden the built-in block helpers: a missing field (`undefined` value) throws
  // in block position too, so `{{#each section.itemz}}` / `{{#if missing}}` cannot
  // silently render empty. Present-but-empty/falsy values delegate to the built-in.
  for (const name of HARDENED_BLOCK_HELPERS) {
    const builtin = env.helpers[name];
    if (builtin === undefined) {
      continue;
    }
    env.registerHelper(name, function hardenedBlock(this: unknown, ...args: unknown[]): unknown {
      // Block helpers are called as (value, options); a missing field is `undefined`.
      if (args.length >= 2 && args[0] === undefined) {
        throw new Error(`strict template: "${name}" block over a missing field`);
      }
      return builtin.apply(this, args);
    });
  }

  for (const [name, helper] of Object.entries(options.helpers ?? {})) {
    env.registerHelper(name, function strictHelper(this: unknown, ...args: unknown[]): string {
      // Drop the trailing Handlebars options object: helpers see only data.
      const dataArgs = args.slice(0, Math.max(0, args.length - 1));
      const result = helper(...dataArgs);
      if (typeof result !== 'string') {
        throw new TypeError(`helper "${name}" must return a string`);
      }
      return result;
    });
  }

  const template = env.compile(source, {
    strict: true,
    noEscape: options.noEscape ?? false,
  });

  return (data: unknown): string => template(data);
}
