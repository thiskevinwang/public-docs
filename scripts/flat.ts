import * as fs from "fs";
import * as path from "path";
import * as assert from "assert";
import chalk from "chalk"; // v4

import flat from "flat";
import matter from "gray-matter";

import walk from "klaw-sync";

const error = (...val: any[]) => {
  console.log(chalk.red("error".padEnd(5, " ")), "-", ...val);
};
const info = (...val: any[]) => {
  console.log(chalk.cyan("info".padEnd(5, " ")), "-", ...val);
};
const warn = (...val: any[]) => {
  console.log(chalk.yellow("warn".padEnd(5, " ")), "-", ...val);
};
const ready = (...val: any[]) => {
  console.log(chalk.green("ready".padEnd(5, " ")), "-", ...val);
};
const wait = (...val: any[]) => {
  console.log(chalk.cyan("wait".padEnd(5, " ")), "-", ...val);
};
const event = (...val: any[]) => {
  console.log(chalk.magenta("event".padEnd(5, " ")), "-", ...val);
};

function getPathsFromYml() {
  const cwd = process.cwd();

  const pathToYaml = path.join(cwd, "wiki/sidebar.yml");
  const yamlStr = fs.readFileSync(pathToYaml, "utf8");

  const json = matter(yamlStr).data;
  const res = flat(json);

  // only keep the 'href's
  const paths = Object.values(res as Record<string, string>).filter(
    (x: string) => x.startsWith?.("/wiki/")
  );

  return paths;
}

function getPathsFromMdx() {
  const cwd = process.cwd();
  const dir = path.join(cwd, "wiki");

  const files = walk(dir, {
    filter: (file) => !!file.path.match(/\.mdx?$/),
    traverseAll: true,
  });

  const paths = files.map((file) =>
    file.path.replace(cwd, "").replace(/\.mdx$/i, "")
  );

  return paths;
}

/**
 * npx chokidar-cli . -c "npx ts-node scripts/flat.ts"
 */
async function main() {
  event("gathering paths in /wiki/sidebar.yml");
  const a = getPathsFromYml().sort();
  event("gathering paths from wiki/");
  const b = getPathsFromMdx().sort();

  assert.equal(a.length, b.length, `lengths must be equal` + `\n`);

  for (let i = 0; i < a.length; i++) {
    assert.equal(
      a[i],
      b[i],
      `Uneven paths:` +
        `\n` +
        `- YML: ${a[i]}` +
        `\n` +
        `- MDX: ${b[i]}` +
        `\n\n` +
        `- If the YML is correct, a new MDX file may need to be created with the same path` +
        `\n` +
        `- If the YML is incorrect, the associate _node_ may need to be removed`
    );
  }

  //   info(a);
  ready("YML and MDX paths match");
}

main().catch((err) => {
  error(err.message);
});
