import express, { Request, Response } from "express";
import { redis } from "./redisClient";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;


// GET /wallets/{wallet_id}
app.get("/wallets/:wallet_id", async (req: Request, res: Response) => {
  // TODO: Implement reading from Redis
  res.status(501).send("Not Implemented Yet");
});

// GET /wallets/{wallet_id}/stocks/{stock_name}
app.get("/wallets/:wallet_id/stocks/:stock_name", async (req: Request, res: Response) => {
  // TODO: Implement reading from Redis
  res.status(501).send("Not Implemented Yet");
});

// GET /stocks
app.get("/stocks", async (req: Request, res: Response) => {
  // TODO: Implement reading bank state from Redis
  res.status(501).send("Not Implemented Yet");
});

// POST /stocks
app.post("/stocks", async (req: Request, res: Response) => {
  // TODO: Implement setting bank state in Redis
  res.status(501).send("Not Implemented Yet");
});

// GET /log
app.get("/log", async (req: Request, res: Response) => {
  // TODO: Implement reading audit log from Redis
  res.status(501).send("Not Implemented Yet");
});

// POST /wallets/{wallet_id}/stocks/{stock_name}
app.post("/wallets/:wallet_id/stocks/:stock_name", async (req: Request, res: Response) => {
  // TODO: Implement the complex atomic buy/sell logic!
  res.status(501).send("Not Implemented Yet");
});

// POST /chaos - Kills the instance
app.post("/chaos", (req: Request, res: Response) => {
  console.error("Chaos endpoint hit! Terminating process...");
  // We don't send a response because the process dies immediately
  process.exit(1); 
});


// start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});