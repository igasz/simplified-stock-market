import express, { Request, Response } from "express";
import { redis } from "./redisClient";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;


// GET /wallets/{wallet_id}
app.get("/wallets/:wallet_id", async (req: Request, res: Response) => {
  try {
    const wallet_id = String(req.params.wallet_id);
    const rawStocks = await redis.hgetall(`wallet:${wallet_id}`); // { "AAPL": "10", "GOOG": "5" }

    const stocks = Object.entries(rawStocks).map(([name, quantity]) => ({ // [{name: "AAPL", quantity: 10}]
        name,
        quantity: parseInt(quantity, 10),
    }));

    res.status(200).json({ id: wallet_id, stocks });

  } catch (err) {
    res.status(500).send("internal server error");
  }
});

// GET /wallets/{wallet_id}/stocks/{stock_name}
app.get("/wallets/:wallet_id/stocks/:stock_name", async (req: Request, res: Response) => {
  try {
    const wallet_id = String(req.params.wallet_id);
    const stock_name = String(req.params.stock_name);
    const quantity = await redis.hget(`wallet:${wallet_id}`, stock_name); //single string value, or null
    
    res.status(200).json(quantity ? parseInt(quantity, 10) : 0); // we want just a number
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// GET /stocks
app.get("/stocks", async (req: Request, res: Response) => {
  try {
    const rawStocks = await redis.hgetall("bank:stocks");

    const stocks = Object.entries(rawStocks).map(([name, quantity]) => ({
        name,
        quantity: parseInt(quantity, 10),
    }));

    res.status(200).json({ stocks });
  } catch (err) {
    res.status(500).send("internal server error");
  }
});

// POST /stocks
app.post("/stocks", async (req: Request, res: Response): Promise<any> => {
    try {
        const { stocks } = req.body;

        if (!stocks || !Array.isArray(stocks)) {
            return res.status(400).send("invalid body format");
        }

        const pipeline = redis.pipeline(); // let us send multiple commands at once

        pipeline.del("bank:stocks") // clear the old state

        for (const stock of stocks) { // add all new stocks
            pipeline.hset("bank:stocks", stock.name, stock.quantity);
        }

        await pipeline.exec();
        res.status(200).send();
    } catch (err) {
        res.status(500).send("internal server error");
    }
});

// GET /log
app.get("/log", async (req: Request, res: Response) => {
    try {
        const rawLogs = await redis.lrange("audit:log", 0, -1); // gets items from a list
        
        const log = rawLogs.map(entry => JSON.parse(entry)); // parse logs back into objects

        res.status(200).json({ log });

    } catch (err) {
    res.status(500).send("internal server error");
    }
});

// POST /wallets/{wallet_id}/stocks/{stock_name}
app.post("/wallets/:wallet_id/stocks/:stock_name", async (req: Request, res: Response): Promise<any> => {
  const wallet_id = String(req.params.wallet_id);
  const stock_name = String(req.params.stock_name);
  const { type } = req.body;

  if (type !== "buy" && type !== "sell") {
    return res.status(400).send("Invalid type. Should be 'buy' or 'sell'");
  }

  const bankKey = "bank:stocks";
  const walletKey = `wallet:${wallet_id}`;
  const logKey = "audit:log";
  const logEntry = JSON.stringify({ type, wallet_id, stock_name });

  try {
    const exists = await redis.hexists(bankKey, stock_name);
    if (!exists) {
      return res.status(404).send();
    }

    // buy
    if (type === "buy") {
      const newBankQty = await redis.hincrby(bankKey, stock_name, -1);
      
      if (newBankQty < 0) {
        // the bank was empty, put the stock back and fail
        await redis.hincrby(bankKey, stock_name, 1);
        return res.status(400).send();
      }
      
      // success
      await redis.hincrby(walletKey, stock_name, 1);
      await redis.rpush(logKey, logEntry);
      return res.status(200).send();
    }

    // sell
    if (type === "sell") {
      const newWalletQty = await redis.hincrby(walletKey, stock_name, -1);
      
      if (newWalletQty < 0) {
        // the wallet was empty, put the stock back and fail.
        await redis.hincrby(walletKey, stock_name, 1);
        return res.status(400).send();
      }
      
      // success
      await redis.hincrby(bankKey, stock_name, 1);
      await redis.rpush(logKey, logEntry);
      return res.status(200).send();
    }

  } catch (err) {
    console.error("trade failed: ", err);
    res.status(500).send("internal server error");
  }
});

// POST /chaos - Kills the instance
app.post("/chaos", (req: Request, res: Response) => {
  console.error("Chaos endpoint hit! Terminating process...");
  process.exit(1); 
});


// start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});