import express from "express";

import { configureMongoDB } from "./src/database/db.js";
import { configureRoutes } from "./src/routes/routes.js";
import { configureMiddleware } from "./src/config/config.js";
import DefaultAdmin from "./src/default.js";

const app = express();

configureMongoDB();
configureMiddleware(app);
configureRoutes(app);

const port = process.env.REACT_PORT || 5005;
app.listen(port, () => {
  console.log(`---> 🚀 App Is Up And Running On Port ${port}!`);
});

//DefaultAdmin()