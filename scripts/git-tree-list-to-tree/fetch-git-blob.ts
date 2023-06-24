import { HEADERS } from "./common.js";

export async function fetchGitBlob(
  owner: string,
  repo: string,
  fileSha: string,
) {
  const endpoint = "repos/:owner/:repo/git/blobs/:file_sha"
    .replace(":owner", owner)
    .replace(":repo", repo)
    .replace(":file_sha", fileSha);

  // a dumb cache infront of https://api.github.com
  // only allows authorization and accept headers
  // and caches responses for 31536000 seconds (1 year)
  const BASE_URL = "https://d1bprgkg3gf58k.cloudfront.net";
  const url = new URL(endpoint, BASE_URL);
  const res = await fetch(url.toString(), {
    headers: {
      ...HEADERS,
      // for raw text content response
      accept: "application/vnd.github.raw",
    },
  });

  console.log(res.headers.get("x-cache"));
  console.log(res.headers.get("X-RateLimit-Limit"));
  console.log(res.headers.get("X-RateLimit-Remaining"));

  const text = await res.text();
  return text;
}
