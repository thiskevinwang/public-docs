import * as fs from "fs";
import * as path from "path";

import flat from "flat";
import matter from "gray-matter";

export function getPathsFromYml() {
  const cwd = process.cwd();

  const pathToYaml = path.join(cwd, "wiki/sidebar.yml");
  const yamlStr = fs.readFileSync(pathToYaml, "utf8");

  const json = matter(yamlStr).data;
  const res = flat(json);

  // only keep the 'href's
  const paths = Object.values(res as Record<string, string>).filter(
    (x: string) => x.startsWith?.("/wiki"),
  );

  return paths;
}
