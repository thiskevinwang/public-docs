import { config } from "dotenv";

config();

/** https://github.com/settings/tokens */
export const HEADERS = {
  Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
};

export interface NextDocsTree {
  children: NextDocsTree[];
  description: string;
  path: string; // no leading slash;
  title: string;
}
