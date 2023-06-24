import * as path from "node:path";

import * as lyra from "@lyrasearch/lyra";
import * as persistence from "@lyrasearch/plugin-data-persistence";
// import rehypeParse from "rehype-parse";
// import rehypeRetext from "rehype-retext";
// import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
// import remarkRehype from "remark-rehype";
import remarkRetext from "remark-retext";
import remarkStringify from "remark-stringify";
import { Parser } from "retext-english";
import retextStringify from "retext-stringify";
import { read, write } from "to-vfile";
import { unified } from "unified";
import { findDownAll } from "vfile-find-down";
import { matter } from "vfile-matter";
import * as z from "zod";

import L from "../lib/logger.js";
import { getObject } from "./git-tree-list-to-tree/get-object.js";
import { main as getTree } from "./git-tree-list-to-tree/main.js";

const LyraItemSchema = z.object({
  id: z.string(),
  contents: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string().nullable(),
  hierarchy: z.object({
    lvl0: z.string().nullable(),
    lvl1: z.string().nullable(),
    lvl2: z.string().nullable(),
    lvl3: z.string().nullable(),
    lvl4: z.string().nullable(),
    lvl5: z.string().nullable(),
    lvl6: z.string().nullable(),
  }),
  type: z.union([
    z.literal("lvl0"),
    z.literal("lvl1"),
    z.literal("lvl2"),
    z.literal("lvl3"),
    z.literal("lvl4"),
    z.literal("lvl5"),
    z.literal("lvl6"),
  ]),
});
type LyraItemSchema = z.infer<typeof LyraItemSchema>;

/**
 * node --loader ts-node/esm scripts/index-documents.ts
 *
 * Note: this file uses a several ESM-only packages.
 * As a result the file extension is `.mts`
 */
async function main() {
  L.info("indexing documents");
  const cwd = process.cwd();
  const dir = path.join(cwd, "wiki");

  const tree = await getTree();

  // gather all mdx files
  const files = await findDownAll(".mdx", dir);
  L.info("found", files.length, "files");

  let dataset: LyraItemSchema[] = [];
  for (const file of files) {
    /**
     * ex. `/wiki
     * - should not contain "index"
     * - should not contain trailing slash
     */
    const id = file.path
      .replace(cwd, "")
      .replace("index.mdx", "")
      .replace(".mdx", "")
      .replace(/\/$/, "");

    const preFile = await read(file.path);
    matter(preFile, { strip: true });
    const frontmatter = preFile.data.matter as {
      title: string;
      nav_title: string;
      description: string;
    };

    const vfile = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkStringify)
      .use(remarkRetext, Parser)
      .use(retextStringify)
      .process(String(preFile));

    const parentId = path.dirname(id);

    L.info("id", id, "parentId", parentId);
    // id        /wiki/terraform/github
    // parentId: /wiki/terraform

    // get category from parent
    let category = getObject(tree, "path", parentId.replace(/^\//, ""))?.title;
    L.info("category", category);

    // this schema helps to decouple changes like frontmatter schema from
    // the search index schema, which the application depends on
    dataset.push({
      id,
      contents: String(vfile),
      name: String(frontmatter.title),
      description: String(frontmatter.description),
      // Grab this from one level up
      category: String(category!),
      hierarchy: {
        lvl0: null,
        lvl1: null,
        lvl2: null,
        lvl3: null,
        lvl4: null,
        lvl5: null,
        lvl6: null,
      },
      type: "lvl0",
    });
  }

  // LYRA SEARCH
  const lyraInstance = lyra.create({
    schema: {
      name: "string",
      contents: "string",
      description: "string",
    },
  });

  await lyra.insertBatch(lyraInstance, dataset, {
    batchSize: 100,
    language: "english",
  });

  const outputFilename = persistence.persistToFile(
    lyraInstance,
    "json",
    "lyra.json",
  );

  L.info("indexed", files.length, "documents");

  // read file and copy to website
  let jsonBlob = await read(outputFilename);
  jsonBlob.path = path.join(
    cwd,
    "../thekevinwang.com",
    "packages/application/src/lib/lyra.json",
  );
  jsonBlob = await write(jsonBlob, {});

  L.ready("copied", outputFilename, "to", jsonBlob.path);
}

main();
