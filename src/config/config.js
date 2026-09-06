import cors from "cors";
import express from "express";
import bodyParser from "body-parser";

export const configureMiddleware = (app) => {
  // The frontend reads ETag to make conditional catalogue requests.
  app.use(cors({ exposedHeaders: ["ETag"] }));
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use(bodyParser.json({ extended: true, limit: "10mb" }));
  app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
};
