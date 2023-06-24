import * as z from "zod";

import { HEADERS } from "./common.js";

const blob = z.object({
  path: z.string(), // full filename+pathname with no trailing slash, relative to the root of the tree
  mode: z.string(),
  type: z.literal("blob"),
  sha: z.string(),
  size: z.string(),
  url: z.string(),
});

const tree = z.object({
  path: z.string(), // full filename+pathname with no trailing slash, relative to the root of the tree
  mode: z.string(),
  type: z.literal("tree"),
  sha: z.string(),
  url: z.string(),
});

const response = z.object({
  sha: z.string(),
  url: z.string(),
  tree: z.array(blob.or(tree)),
  truncated: z.boolean(),
});
type Response = z.infer<typeof response>;

/**
 * https://docs.github.com/en/rest/git/trees?apiVersion=2022-11-28#get-a-tree
 * @param owner
 * @param repo
 * @param treeSha
 */
export async function fetchGitTree(
  owner: string,
  repo: string,
  treeSha: string,
) {
  const endpoint = "repos/:owner/:repo/git/trees/:tree_sha"
    .replace(":owner", owner)
    .replace(":repo", repo)
    .replace(":tree_sha", treeSha);
  const url = new URL(endpoint, "https://api.github.com");
  url.searchParams.set("recursive", "0");

  const res = await fetch(url.toString(), {
    headers: HEADERS,
  });
  const json = (await res.json()) as Response;
  return json;
}
