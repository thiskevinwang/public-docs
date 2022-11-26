import * as fs from "fs";
import * as path from "path";

import { program } from "commander";
import matter from "gray-matter";
import walk from "klaw-sync";

import L from "@lib/logger";

// node --loader ts-node/esm scripts/frontmatter.ts --dir=posts --strategy=local

program.option("--first", "foobar").option("-s, --separator <char>");

program.parse();

function main() {
  L.event("checking frontmatter");
  const dir = program.args[0] || path.join(process.cwd(), "wiki");

  L.info("directory:", dir);

  const files = walk(dir, {
    filter: (file) => !!file.path.match(/\.mdx?$/),
    traverseAll: true,
  });

  files.forEach((file) => {
    const filepath = file.path;
    const source = fs.readFileSync(filepath, "utf8");
    const { data, content } = matter(source);
    L.event("parsed file", filepath);

    if (Object.keys(data).length === 0) {
      L.warn(" - no frontmatter");
      // insert frontmatter
      const contents = matter.stringify(content, {});
      fs.writeFileSync(filepath, contents);
    }
  });

  L.ready("ok");
}

main();
