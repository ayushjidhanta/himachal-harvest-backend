import express from "express";

import { configureMongoDB } from "./src/database/db.js";
import { configureRoutes } from "./src/routes/routes.js";
import { configureMiddleware } from "./src/config/config.js";
import DefaultAdmin from "./src/default.js";

const startServer = async () => {
  await configureMongoDB();

  const app = express();
  configureMiddleware(app);
  configureRoutes(app);

  const port = process.env.PORT || process.env.REACT_PORT || 5005;
  app.listen(port, () => {
    console.log(`---> 🚀 App Is Up And Running On Port ${port}!`);
  });
};

startServer().catch((error) => {
  console.error(`Failed to start server: ${error.message}`);
  process.exit(1);
});

//DefaultAdmin()
