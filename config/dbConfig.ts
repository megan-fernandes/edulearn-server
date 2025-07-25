// import { MongoClient, ServerApiVersion } from "mongodb";
// import dotenv from "dotenv";
// dotenv.config();

// const uri = process.env.MONGO_DB_URL as string;

// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   },
// });

// export async function mongoConnect() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();
//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log(
//       "Pinged your deployment. You successfully connected to MongoDB!"
//     );
//   } finally {
//     // Ensures that the client will close when you finish/error
//     await client.close();
//   }
// }
// export { client };

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGO_DB_URL as string;

export async function mongoConnect() {
  try {
    // Connect to MongoDB using Mongoose
    await mongoose.connect(uri);
    console.log("Successfully connected to MongoDB using Mongoose!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error; // Rethrow the error to handle it in the calling function
  }
}

export default mongoose; // Export mongoose for use in other parts of the application
