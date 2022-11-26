import { Client } from "@elastic/elasticsearch";

// ELASTIC SEARCH
const client = new Client({
  node: process.env.ELASTIC_NODE,
  auth: {
    username: process.env.ELASTIC_USERNAME!,
    password: process.env.ELASTIC_PASSWORD!,
  },
});
const INDEX_NAME = "wiki";

/**
 * DELETE & CREATE OUR INDEX
 */
await client.indices.delete({ index: INDEX_NAME });
await client.indices.create({ index: INDEX_NAME });

// const { body } = await client.indices.get({ index: 'my-index-000001' });

const body = [].flatMap((doc) => [{ index: { _index: INDEX_NAME } }, doc]);

await client.bulk({ refresh: true, body });
// await client.indices.refresh({ index: INDEX_NAME });
