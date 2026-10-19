import { z } from 'zod/v4';

const identifierSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-z][a-z0-9]*(?:[-.:/][a-z0-9]+)*$/);

const relativeTemplatePathSchema = z
  .string()
  .min(1)
  .max(240)
  .refine((value) => !value.startsWith('/'), {
    message: 'template file paths must be relative',
  })
  .refine((value) => !value.startsWith('~'), {
    message: 'template file paths must not use a home shortcut',
  })
  .refine((value) => !value.includes('\\'), {
    message: 'template file paths must use POSIX separators',
  });

export const templateFileSchema = z
  .object({
    templateId: identifierSchema,
    path: relativeTemplatePathSchema,
    outputPattern: relativeTemplatePathSchema,
  })
  .strict();

function rejectDuplicateStrings(
  values: readonly string[],
  ctx: {
    addIssue: (issue: { code: 'custom'; message: string }) => void;
  },
): void {
  const seen = new Set<string>();

  for (const value of values) {
    if (seen.has(value)) {
      ctx.addIssue({
        code: 'custom',
        message: 'duplicate values are not allowed',
      });
      return;
    }

    seen.add(value);
  }
}

export const templatePackManifestSchema = z
  .object({
    packName: identifierSchema,
    packVersion: z.string().min(1).max(80),
    slotIds: z.array(identifierSchema).min(1).superRefine(rejectDuplicateStrings),
    requiredFacts: z.array(identifierSchema).superRefine(rejectDuplicateStrings),
    optionalFacts: z.array(identifierSchema).superRefine(rejectDuplicateStrings),
    templateFiles: z.array(templateFileSchema).min(1),
  })
  .strict();

export type TemplateFile = z.infer<typeof templateFileSchema>;
export type TemplatePackManifest = z.infer<typeof templatePackManifestSchema>;
