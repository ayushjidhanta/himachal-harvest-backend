import cors from "cors";
import express from "express";
import bodyParser from "body-parser";

export const configureMiddleware = (app) => {
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(bodyParser.json({ extended: true }));
  app.use(bodyParser.urlencoded({ extended: true }));
};
