import express, { type Express } from "express";
import cors from "cors";
import path from "node:path";
import pinoHttp from "pino-http";
import session from "express-session";
import { fileURLToPath } from "node:url";
import router from "./routes";
import { logger } from "./lib/logger";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const publicDistDir = path.resolve(currentDir, "../../gig-connect-india/dist/public");
const publicIndexFile = path.join(publicDistDir, "index.html");
const adminDistDir = path.resolve(currentDir, "../../admin-portal/dist");
const adminIndexFile = path.join(adminDistDir, "index.html");

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env["SESSION_SECRET"] ?? "dev-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env["NODE_ENV"] === "production",
      maxAge: 8 * 60 * 60 * 1000, // 8 hours
    },
  })
);

app.use("/api", router);
app.use("/admin", express.static(adminDistDir));
app.use(express.static(publicDistDir));

app.get(/^\/admin(?:\/.*)?$/, (_req, res) => {
  res.sendFile(adminIndexFile);
});

app.get(/^(?!\/api(?:\/|$)).*/, (_req, res) => {
  res.sendFile(publicIndexFile);
});

export default app;
