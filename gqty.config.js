/**
 * @type {import("@gqty/cli").GQtyConfig}
 */
const config = {
  react: true,
  scalarTypes: { DateTime: "string" },
  introspection: {
    endpoint: "https://graph.sarafu.cc/v1/graphql",
    headers: {
      "x-hasura-admin-secret": process.env.CIC_GRAPH_ADMIN_SECRET,
    },
  },
  destination: "./src/gqty/index.ts",
  subscriptions: false,
  javascriptOutput: false,
};

module.exports = config;
