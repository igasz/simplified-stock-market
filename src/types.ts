export interface Stock {
    name: string;
    quantity: number;
}

export interface Wallet {
    id: string;
    stocks: Stock[];
}

export interface LogEntry {
    type: "buy" | "sell";
    wallet_id: string;
    stock_name: string;
}

export interface TradeRequest {
    type: "buy" | "sell";
}

export interface BankStateRequest {
    stocks: Stock[];
}