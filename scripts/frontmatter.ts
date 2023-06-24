import * as path from "node:path";

import { read } from "to-vfile";
import { findDownAll } from "vfile-find-down";
import { matter } from "vfile-matter";

import L from "../lib/logger.js";
import { FrontmatterSchema } from "../lib/schema.js";

// node --loader ts-node/esm scripts/frontmatter.ts
async function main() {
  L.event("checking frontmatter");
  const dir = path.join(process.cwd(), "wiki");

  L.info("directory:", dir);

  const files = await findDownAll(".mdx", dir);

  L.info("found", files.length, "files");

  for (const file of files) {
    const filepath = file.path;
    const source = await read(filepath, "utf8");
    matter(source, { strip: true });
    const parseResult = FrontmatterSchema.safeParse(source.data.matter);
    if (!parseResult.success) {
      L.error("failed to parse frontmatter", filepath, parseResult.error);
    } else {
      parseResult.data;
      L.info("parsed file", filepath);
    }
  }

  L.ready("ok");
}

main();
