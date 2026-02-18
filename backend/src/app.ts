import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import healthRouter from "./routes/health.route.js"
import webhookRouter from "./routes/webhook.route.js"

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.use("/health", healthRouter);
app.use("/api/webhook", webhookRouter);

export default app;
