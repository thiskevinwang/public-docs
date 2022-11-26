import * as fs from "fs";
import * as path from "path";

import flat from "flat";
import * as yaml from "js-yaml";

import L from "@lib/logger";

/**
 * node --loader ts-node/esm scripts/get-paths.ts
 */
function main() {
  L.event("getting paths");
  const cwd = process.cwd();
  const pathToYaml = path.join(cwd, "wiki/sidebar.yml");
  const yamlStr = fs.readFileSync(pathToYaml, "utf8");
  L.info({ pathToYaml });

  // convert yaml string to json object
  const json = yaml.load(yamlStr);
  // flatten the json object
  const res = flat(json);
  // collect paths — only keep the 'href's that start with '/wiki/'
  const paths = Object.values(res as Record<string, string>).filter(
    (x: string) => x.startsWith?.("/wiki/"),
  );

  L.info(paths);
  L.ready("ok");
  return paths;
}

main();
