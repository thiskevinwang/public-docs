import * as z from "zod";

/**
 * The YAML Frontmatter schema of all MDX documents
 */
export const FrontmatterSchema = z.object({
  title: z.string(),
  nav_title: z.string(),
  description: z.string(),
});

export type FrontmatterSchema = z.infer<typeof FrontmatterSchema>;
