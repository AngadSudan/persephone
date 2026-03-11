import client from "../utils/neo4j";

async function checkExistingNode(username: string) {
  const res = await client.getUserNode(username);
  console.log(res);
}

function main() {
  checkExistingNode("angad");
}
main();
