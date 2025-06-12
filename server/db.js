const mclient = require("mongodb").MongoClient;

const client = new mclient(
  `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER}/?retryWrites=true&w=majority&&appName=Cluster0`,
  { useNewUrlParser: true }
);

let collections = {};

async function connectDB() {
  await client.connect();
  const lchessdbObj = client.db("lchessdb");
  collections.userCollection = lchessdbObj.collection("usercollection");
  collections.batchCollection = lchessdbObj.collection("batchcollection");
  collections.coachCollection = lchessdbObj.collection("coachcollection");
  collections.studentCollection = lchessdbObj.collection("studentcollection");
  collections.notificationCollection = lchessdbObj.collection("notificationcollection");
  return collections;
}

module.exports = { connectDB, collections };