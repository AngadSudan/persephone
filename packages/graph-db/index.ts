import neo4j from "neo4j";

class GraphClient {
  url: string | null;
  isConnected: boolean;
  client: neo4j.GraphDatabase | null;
  constructor(url: string) {
    this.url = url;
    this.isConnected = false;
    this.client = new neo4j.GraphDatabase(this.url);
  }
  async connect() {
    if (!this.url) throw new Error("graphdb Url Not Found");
    let cypherQuery = "";
    this.client?.cypher(
      {
        query: cypherQuery,
        params: {},
      },
      function (err, result) {
        if (err) throw err;
        console.log(result);
      },
    );
  }
}
export default GraphClient;
