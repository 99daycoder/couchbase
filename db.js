//RUN THIS FILE: node -r dotenv/config db.js
const { error } = require("console");
var couchbase = require("couchbase");

async function main() {
  const clusterConnStr = "cb.mnlj-xaty8aqod.cloud.couchbase.com";
  // "couchbases://cb.mnlj-xaty8aqod.cloud.couchbase.com?ssl=no_verify";
  const username = process.env.username;
  const password = process.env.password;
  const bucketName = "travel-sample";
  let cluster;
  try {
    cluster = await couchbase.connect(clusterConnStr, {
      username: username,
      password: password,
      timeouts: {
        kvTimeout: 10000, // milliseconds
      },
    });
  } catch (error) {
    console.log(error);
  }

  const query = `SELECT route.airlineid FROM `;
  try {
    let result = await cluster.query(query);
    console.log("Result:", result);
    return result;
  } catch (error) {
    console.error("Query failed: ", error);
  }

  const bucket = cluster.bucket(bucketName);

  // Get a reference to the default collection, required only for older Couchbase server versions
  const defaultCollection = bucket.defaultCollection();

  const collection = bucket.scope("tenant_agent_00").collection("users");

  const user = {
    type: "user",
    name: "Michael",
    email: "michael123@test.com",
    interests: ["Swimming", "Rowing"],
  };

  // Create and store a document
  await collection.upsert("michael123", user);

  // Load the Document and print it
  // Prints Content and Metadata of the stored Document
  let getResult = await collection.get("michael123");
  //console.log("Get Result: ", getResult);

  // Perform a N1QL Query
  const queryResult = await bucket
    .scope("tenant_agent_00")
    .query("SELECT name FROM `users` WHERE $1 in interests", {
      parameters: ["Swimming"],
    });
  //console.log("Query Results:");
  queryResult.rows.forEach((row) => {
    //console.log(row);
  });
}

// Run the main function
main()
  .catch((err) => {
    console.log("ERR:", err);
    process.exit(1);
  })
  .then(process.exit);
