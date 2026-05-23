import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME ?? "cohn_reznick";

if (!uri) {
  throw new Error("MONGODB_URI environment variable is not set");
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const client = new MongoClient(uri);
const clientPromise: Promise<MongoClient> =
  process.env.NODE_ENV === "development"
    ? (globalThis._mongoClientPromise ??= client.connect())
    : client.connect();

export default clientPromise;
export { dbName };
