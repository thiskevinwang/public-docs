import * as path from "node:path";

import { FrontmatterSchema } from "@/lib/schema.js";
import { VFile } from "vfile";
import { matter } from "vfile-matter";

import type { NextDocsTree } from "./common.js";
import { fetchGitBlob } from "./fetch-git-blob.js";
import { fetchGitTree } from "./fetch-git-tree.js";
import { getObject } from "./get-object.js";

// https://github.com/vercel/next.js/blob/canary/docs/05-community/01-contribution-guide.mdx#file-structure

// npx ts-node --esm ./scripts/unflat-git-tree.ts

async function listTotree(
  gitTreeJson: Awaited<ReturnType<typeof fetchGitTree>>,
) {
  const list = gitTreeJson.tree
    // include entries that in the 'wiki' directory
    .filter((e) => /^wiki\//.test(e.path))
    // .filter((e) => !/\.ya?ml$/.test(e.path))
    // only include mdx files
    // we technically don't need `tree` objects because the tree shape can be inferred from the files' path
    .filter((e) => /\.mdx?$/.test(e.path))
    // only include path
    .map(({ path, type, sha }) => {
      return { path, type, sha };
    });

  // build a map of paths to sha for eventually look up via `fetchGitBlob`
  const map = {} as Record<string, string>;
  list.forEach(({ path, sha }) => {
    map[path] = sha;
  });

  const categories: string[] = list
    .map((e) => e.path)
    .filter((path) => path.endsWith("index.mdx"))
    // sort by increasing depth
    .sort((a, b) => {
      const aDepth = a.split("/").length;
      const bDepth = b.split("/").length;
      return aDepth - bDepth;
    });

  const pages: string[] = list
    .map((e) => e.path)
    .filter((path) => !path.endsWith("index.mdx"));

  const tree: NextDocsTree[] = [];

  // index.mdx files
  for (const category of categories) {
    // given 'wiki/github/actions/index.mdx'
    // return 'wiki/github/actions'
    const dirname = path.dirname(category);

    /**
     * @warning this is a blocking call and also results in
     * 1 + N fetches to GitHub
     */
    const gitBlob = await fetchGitBlob(
      "thiskevinwang",
      "public-docs",
      map[category],
    );

    const file = new VFile({ path: category, value: gitBlob });
    matter(file, { strip: true });
    const frontmatter = file.data.matter as FrontmatterSchema;

    // console.log(category);
    dirname.split("/").forEach((part, i, arr) => {
      // 0 wiki
      // 1 wiki/github
      // 2 wiki/github/releases
      const itemPath = arr.slice(0, i + 1).join("/");
      const entry = getObject(tree, "path", itemPath);

      // try push fresh item
      if (i === 0) {
        if (!entry) {
          tree.push({
            children: [],
            description: frontmatter.description,
            path: itemPath,
            title: frontmatter.nav_title,
          });
        }
      } else {
        // try push fresh item into nested children
        if (!entry) {
          const parentPath = arr.slice(0, i).join("/");
          const parent = getObject(tree, "path", parentPath);
          if (parent) {
            parent.children.push({
              children: [],
              description: frontmatter.description,
              path: itemPath,
              title: frontmatter.nav_title,
            });
          }
        }
      }
    });
  }
  // console.log(JSON.stringify(tree, null, 2));

  for (const page of pages) {
    /**
     * @warning this is a blocking call and also results in
     * 1 + N fetches to GitHub
     */
    const gitBlob = await fetchGitBlob(
      "thiskevinwang",
      "public-docs",
      map[page],
    );
    const file = new VFile({ path: page, value: gitBlob });
    matter(file, { strip: true });
    const frontmatter = file.data.matter as FrontmatterSchema;

    const urlpath = page.replace(/\.mdx?$/, "");

    const dirname = path.dirname(page);
    const entry = getObject(tree, "path", dirname);
    if (entry) {
      entry.children.push({
        children: [],
        description: frontmatter.description,
        path: urlpath,
        title: frontmatter.nav_title,
      });
    }
  }
  // console.log(JSON.stringify(tree, null, 2));
  return tree;
}

export async function main() {
  console.log("hello");
  const treeJson = await fetchGitTree("thiskevinwang", "public-docs", "main");
  console.log("ok");

  const tree = await listTotree(treeJson);
  console.log(tree);

  return tree;
}
