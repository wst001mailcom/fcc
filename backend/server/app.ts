import * as dotenv from "dotenv";
import express from "express";
import * as path from "path";

// Put dotenv in use before importing controllers
dotenv.config();

// Import controllers
import itemsController from "./items/items.controller";
import usersController from "./users/users.controller";
import vpnipController from "./vpnip/vpnip.controller";
import fccController from "./fcc/fcc.controller";

// Create the express application
const app = express();

// Assign controllers to routes
app.use("/api/items", itemsController);
app.use("/api/users", usersController);
app.use("/getip", vpnipController);
app.use("/putip", vpnipController);
app.use("/api/fcc", fccController);

// Declare the path to frontend's static assets
app.use(express.static(path.resolve("..", "frontend", "build")));

// Intercept requests to return the frontend's static entry point
app.get("*", (_, response) => {
  response.sendFile(path.resolve("..", "frontend", "build", "index.html"));
});

export default app;
