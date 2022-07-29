import * as fs from "fs";
import * as path from "path";
import walk from "klaw-sync";
import matter from "gray-matter";
import { program } from "commander";

// npx ts-node scripts/frontmatter.ts --dir=posts --strategy=local

program.option("--first", "foobar").option("-s, --separator <char>");

program.parse();

function main() {
  const dir = program.args[0] || process.cwd();
  console.log("dir:", dir);

  const files = walk(dir, {
    filter: (file) => !!file.path.match(/\.mdx?$/),
    traverseAll: true,
  });

  files.forEach((file) => {
    const filepath = file.path;
    const source = fs.readFileSync(filepath, "utf8");
    const { data, content } = matter(source);
    console.log(filepath);
    console.log(data);
    if (Object.keys(data).length === 0) {
      console.log("no data");
      // insert frontmatter
      const contents = matter.stringify(content, {});
      fs.writeFileSync(filepath, contents);
    }
  });
}

main();
