/**
 * A configurable widget.
 *
 * The class body below must never appear in extracted signature text.
 */
export class Widget {
  private value = 0;

  build(): number {
    const SECRET_BODY_MARKER = this.value + 1;
    return SECRET_BODY_MARKER;
  }
}

/** Options accepted when creating a widget. */
export interface WidgetOptions {
  size: number;
  label?: string;
}

/** The supported widget kinds. */
export type WidgetKind = 'small' | 'large';

/** The fixed set of widget kinds, frozen as literals. */
export const WIDGET_KINDS = ['small', 'large'] as const;

/**
 * Asynchronously create a widget from options.
 *
 * @typeParam T - a caller-chosen tag type.
 */
export async function createWidget<T>(options: WidgetOptions): Promise<Widget> {
  const SECRET_FUNCTION_BODY = options.size;
  void SECRET_FUNCTION_BODY;
  return new Widget();
}

/** A registry of widgets. */
export interface Registry {
  readonly count: number;
}

function makeRegistry(): Registry {
  return { count: 0 };
}

/** The default registry; intentionally has no written type annotation. */
export const widgetRegistry = makeRegistry();
