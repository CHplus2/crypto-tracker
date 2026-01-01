import React, { useEffect } from "react";
import "./TransactionsPnL.css";

function TransactionsPnL({ PnLs }) {
  useEffect(() => {
    document.title = "Transaction PnL";
  }, []);

  return (
    <div className="pnl-page">
        <header className="pnl-header">
            <h2 className="pnl-title">Portfolio Profit & Loss</h2>
            <p className="pnl-subtitle">
            Overview of your realized and unrealized performance
            </p>
        </header>

        <div className="pnl-cards">
            <div className="pnl-card-lg">
                <span className="pnl-label">Realized PnL</span>

                <div className="pnl-main">
                    <span 
                        className={`pnl-value ${PnLs.realizedPnL >= 0 ? "profit" : "loss"}`}
                    >
                        ${PnLs.realizedPnL.toFixed(2)}
                    </span>

                    <span 
                        className={`pnl-percent ${PnLs.realizedPct >= 0 ? "profit" : "loss"}`}
                    >
                        {PnLs.realizedPct >= 0 ? "▲" : "▼"}
                        {Math.abs(PnLs.realizedPct).toFixed(2)}%
                    </span>
                </div>

                <span className="pnl-hint">
                    Closed positions and completed trades
                </span>
            </div>

            <div className="pnl-card-lg">
                <span className="pnl-label">Unrealized PnL</span>
                
                <div className="pnl-main">
                    <span 
                        className={`pnl-value ${PnLs.unrealizedPnL >= 0 ? "profit" : "loss"}`}
                    >
                        ${PnLs.unrealizedPnL.toFixed(2)}
                    </span>
                    <span 
                        className={`pnl-percent ${PnLs.unrealizedPct >= 0 ? "profit" : "loss"}`}
                    >
                        {PnLs.unrealizedPct >= 0 ? "▲" : "▼"}
                        {Math.abs(PnLs.unrealizedPct).toFixed(2)}%
                    </span>
                </div>

                <span className="pnl-hint">
                    Open positions based on current market prices
                </span>
            </div>
      </div>
    </div>
  );
}

export default TransactionsPnL;
