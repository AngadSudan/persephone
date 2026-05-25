import GraphClient from "@codex/graph-db";

const url = process.env.NEO4J_URL || "bolt://neo4j:password@localhost:7687";

const neo4jClient = new GraphClient(
  url,
  process.env.NEO4J_USERNAME!,
  process.env.NEO4J_PASSWORD!,
);

export default neo4jClient;
