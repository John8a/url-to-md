import { z } from 'zod';

export const urlSchema = z.object({
  url: z
    .string()
    .min(1, 'URL is required')
    .url('Please enter a valid URL')
    .refine(
      (url) => {
        try {
          const parsed = new URL(url);
          return ['http:', 'https:'].includes(parsed.protocol);
        } catch {
          return false;
        }
      },
      'URL must use HTTP or HTTPS protocol'
    ),
});

export const conversionRequestSchema = z.object({
  url: urlSchema.shape.url,
  options: z.object({
    includeMetadata: z.boolean().default(true),
    headingStyle: z.enum(['atx', 'setext']).default('atx'),
    bulletListMarker: z.enum(['-', '*', '+']).default('-'),
    codeBlockStyle: z.enum(['indented', 'fenced']).default('fenced'),
  }).optional(),
});

export type UrlInput = z.infer<typeof urlSchema>;
export type ConversionRequest = z.infer<typeof conversionRequestSchema>;