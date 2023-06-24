//must be v7
import * as fs from "fs";
import * as path from "path";

import * as lyra from "@lyrasearch/lyra";
import * as persistence from "@lyrasearch/plugin-data-persistence";
import * as dotenv from "dotenv";
import matter from "gray-matter";
import * as yaml from "js-yaml";
import walk from "klaw-sync";
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
import { unified } from "unified";

// TODO: figure out importing local `.ts` from `.mts`
// import L from "../lib/logger";

dotenv.config();

type Datum = {
  id: string;
  contents: string;
  name: string;
  description: string;
  category: string | null;
  hierarchy: {
    lvl0: string | null;
    lvl1: string | null;
    lvl2: string | null;
    lvl3: string | null;
    lvl4: string | null;
    lvl5: string | null;
    lvl6: string | null;
  };
  type: keyof Datum["hierarchy"];
};

/**
 * node --loader ts-node/esm scripts/index-documents.ts
 *
 * Note: this file uses a several ESM-only packages.
 * As a result the file extension is `.mts`
 */
async function main() {
  console.log("indexing documents");
  const cwd = process.cwd();
  const dir = path.join(cwd, "wiki");

  // gather all mdx files
  const files = walk(dir, {
    filter: (file) => !!file.path.match(/\.mdx?$/),
    traverseAll: true,
  });
  console.log(files.length, "files");

  let dataset: Datum[] = [];
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

    const body = fs.readFileSync(file.path);
    const { content, data } = matter(body);

    const vfile = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkStringify)
      .use(remarkRetext, Parser)
      .use(retextStringify)
      .process(content);

    const parentId = id
      .split("/")
      .reduce((acc, curr, i, arr) => {
        if (i === arr.length - 1) {
          return acc;
        }
        return acc.concat(curr);
      }, [] as string[])
      .join("/");

    dataset.push({
      id,
      contents: String(vfile),
      name: data.name,
      description: data.description || "",
      // Grab this from one level up
      // TODO: reimplement after deleting nav data
      category: null,
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
  persistence.persistToFile(lyraInstance, "json", "lyra.json");

  console.log("ok");
}

main();

type Node = {
  name: string;
  href: string;
  posts?: Node[];
  singleFile?: boolean;
};
/**
 * This is a helper to look up a NavData node's `name`, given an `href` value
 */
const getNavDataNameForHref = (
  navDataList: Node[],
  href: string,
): Node | null => {
  let nodeList = [...navDataList];
  let found: Node | null = null;

  while (!found) {
    for (const node of nodeList) {
      // if exact match, return the node
      if (href === node.href) {
        found = node;
        break;
      }
      // key is a child of node (i.e. key contains the node's href  )
      if (href.includes(node.href)) {
        if (node.posts) {
          nodeList = node.posts;
          break;
        }
      }
    }
  }

  return found;
};
