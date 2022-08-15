import * as fs from "fs";
import * as path from "path";
import * as assert from "assert";

import * as yaml from "js-yaml";
import flat from "flat";

/**
 * npx ts-node scripts/get-paths.ts
 */
function main() {
  const cwd = process.cwd();
  const pathToYaml = path.join(cwd, "wiki/sidebar.yml");
  const yamlStr = fs.readFileSync(pathToYaml, "utf8");

  // convert yaml string to json object
  const json = yaml.load(yamlStr);
  // flatten the json object
  const res = flat(json);
  // collect paths — only keep the 'href's that start with '/wiki/'
  const paths = Object.values(res as Record<string, string>).filter(
    (x: string) => x.startsWith?.("/wiki/")
  );
  return paths;
}

console.log(main());
