import { useState, useEffect } from 'react'
import './App.css'

const USER_ID = "user123";

function App() {
  const [wallet, setWallet] = useState<any[]>([]);
  const [market, setMarket] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [selectedStock, setSelectedStock] = useState("");

  const fetchData = async () => {
    try {
      // wallet
      const walletRes = await fetch(`/api/wallets/${USER_ID}`);
      const walletData = await walletRes.json();
      setWallet(walletData.stocks || []);

      // market
      const marketRes = await fetch(`/api/stocks`);
      const marketData = await marketRes.json();
      setMarket(marketData.stocks || []);

      // logs
      const logRes = await fetch('/api/log');
      const logData = await logRes.json();
      setLogs(logData.log || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // trading
  const handleTrade = async (type: "buy" | "sell") => {
    if (!selectedStock) return alert("Please select a stock!");

    try {
      const res = await fetch(`/api/wallets/${USER_ID}/stocks/${selectedStock}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });

      if (!res.ok) {
        alert(`Trade failed! The bank or your wallet might be empty.`);
      }
      
      fetchData(); // Refresh the dashboard after trade
    } catch (error) {
      alert("Server error or chaos endpoint hit!");
    }
  };

  // adding stocks to market (bank)
  const seedMarket = async () => {
    try {
      const payload = {
        stocks: [
          { name: "TSLA", quantity: 1000 },
          { name: "AAPL", quantity: 500 },
          { name: "NVDA", quantity: 300 }
        ]
      };
      
      const res = await fetch('/api/stocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        alert("Error: Server rejected the request. Is the backend running?");
        return;
      }

      fetchData(); // Refresh the dashboard
      alert("Market seeded successfully!");
      
    } catch (error) {
      alert("Critical error: No connection to the server. Make sure your backend (port 8080) is running!");
    }
  };

  // chaos
  const triggerChaos = async () => {
    await fetch('/api/chaos', { method: 'POST' });
    alert("One backend server just died!\n\nDon't worry. You can still buy and sell stocks normally.");
  };

  return (
    <div className="container">
      <header>
        <h1>Stock Market</h1>
        <div className="header-actions">
          <button className="seed-btn" onClick={seedMarket}>Seed Market</button>
          <button className="chaos-btn" onClick={triggerChaos}>Trigger Chaos</button>
        </div>
      </header>

      <div className="grid">
        {/* Bank Panel */}
        <div className="panel">
          <h2>Bank Inventory</h2>
          <ul>
            {market.length === 0 ? <li>No stocks in bank. Seed it via API!</li> : null}
            {market.map(s => (
              <li key={s.name}><strong>{s.name}</strong>: {s.quantity} available</li>
            ))}
          </ul>
        </div>

        {/* Wallet Panel */}
        <div className="panel">
          <h2>My Wallet ({USER_ID})</h2>
          <ul>
            {wallet.length === 0 ? <li>Your wallet is empty.</li> : null}
            {wallet.map(s => (
              <li key={s.name}><strong>{s.name}</strong>: {s.quantity} owned</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Trading Desk */}
      <div className="panel trade-desk">
        <h2>Trading Desk</h2>
        <div className="trade-controls">
          <select value={selectedStock} onChange={(e) => setSelectedStock(e.target.value)}>
            <option value="">-- Select a Stock --</option>
            {market.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
          </select>
          <button className="buy-btn" onClick={() => handleTrade("buy")}>Buy</button>
          <button className="sell-btn" onClick={() => handleTrade("sell")}>Sell</button>
        </div>
      </div>

      {/* Audit Log */}
      <div className="panel logs">
        <h2>Live Audit Log</h2>
        <ul>
          {logs.length === 0 ? <li>No transactions yet.</li> : null}
          {logs.map((log, i) => (
            <li key={i}>
              <span className={log.type === 'buy' ? 'text-green' : 'text-red'}>
                {log.type.toUpperCase()}
              </span>: {log.wallet_id} traded <strong>{log.stock_name}</strong>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App
