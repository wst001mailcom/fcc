import mongoose from "mongoose";
import populateDatabase from "../scripts/populateDatabase";
import app from "./app";

const url = process.env.MONGODB_URI || "mongodb://localhost:27017/fcc_database";
const port = process.env.PORT || 8081;

(async () => {
  // Connect to the database
  await mongoose.connect(url, { useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true });
  // Populate database with sample data if it's empty
  await populateDatabase();
  // Start express App
  app.listen(port);
  console.log(`App listening on port ${port}...`);
})();
