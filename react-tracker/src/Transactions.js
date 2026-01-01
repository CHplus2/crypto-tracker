import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "./Transactions.css";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function Transactions({ 
    transactions, handleDelete, handleEdit, PnLs
}) {

    const [categoryFilter, setCategoryFilter] = useState("");
    const [yearFilter, setYearFilter] = useState("");
    const [sortBy, setSortBy] = useState("newest");

    useEffect(() => {
        document.title = "Transaction Collection";
    }, []);

    const filteredTransactions = useMemo(() => {
        let result = transactions.filter((tx) => 
            (!categoryFilter || tx.category.toLowerCase().includes(categoryFilter.toLowerCase()))
            && tx.date?.startsWith(yearFilter)
        );

        result.sort((a, b) => {
            const ta = new Date(a.created_at || a.date);
            const tb = new Date(b.created_at || b.date);
            return sortBy === "newest" || sortBy === "" ? tb - ta : ta - tb;
        })
    
        result.sort((a, b) => {
            const da = new Date(a.date);
            const db = new Date(b.date);
            return sortBy === "newest" || sortBy === "" ? db - da : da - db;
        })
        
        result = result.reduce((acc, tx) => {
            const dateKey = tx.date ? tx.date : "Unknown";
            if (!acc[dateKey]) acc[dateKey] = [];
            acc[dateKey].push(tx);
            return acc;
        }, {})
        
        return result;
    }, [transactions, categoryFilter, yearFilter, sortBy])

    const formatNumber = (amount, isCrypto="") => {
        if (Number.isNaN(amount)) return "0";

        let value = Number(amount);
 
        if (isCrypto) {
            if (value >= 1) value = value.toFixed(4);
            else if (value >= 0.01) value = value.toFixed(6);
            else value = value.toFixed(8);
        } else {
            value = Number(value.toFixed(2));
        }

        return value.toLocaleString('en-US');
    }

    return (
        <div className="transactions-page">
            <div className="page-title-wrap">
                <h2 className="page-title">Crypto Portfolio Tracker</h2>
                <select 
                    name="category" 
                    id="genre-select" value={categoryFilter} 
                    onChange={e => setCategoryFilter(e.target.value)} 
                    required
                >   
                    <option value="">All Categories</option>
                    <option value="investment">Investment</option>
                    <option value="nft">NFT</option>
                    <option value="staking reward">Staking Reward</option>
                    <option value="airdrop">Airdrop</option>
                </select>
                <select name="year" id="year-select" value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
                    <option value="">All Years</option>
                    <option value="2025">2025</option>
                    <option  value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                    <option value="2021">2021</option>
                    <option value="2020">2020</option>
                </select>
                <select name="sort" id="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                    <option value="">Sort By</option>
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option  value="a-z">A-Z</option>
                    <option value="z-a">Z-A</option>
                </select>
            </div>

            <div className="pnl-summary">
                <div className="pnl-card">
                    <span className="pnl-label">Realized PnL</span>

                    <div className="pnl-main">
                        <span 
                            className={`pnl-value ${PnLs.realizedPnL >= 0 ? "profit" : "loss"}`}
                        >
                            ${formatNumber(PnLs.realizedPnL)}
                        </span>

                        <span 
                            className={`pnl-percent ${PnLs.realizedPct >= 0 ? "profit" : "loss"}`}
                        >
                            {PnLs.realizedPct >= 0 ? "▲" : "▼"}
                            {formatNumber(Math.abs(PnLs.realizedPct))}%
                        </span>
                    </div>
                </div>

                <div className="pnl-card">
                    <span className="pnl-label">Unrealized PnL</span>

                    <div className="pnl-main">
                        <span 
                            className={`pnl-value ${PnLs.unrealizedPnL >= 0 ? "profit" : "loss"}`}
                        >
                            ${formatNumber(PnLs.unrealizedPnL)}
                        </span>
                        <span 
                            className={`pnl-percent ${PnLs.unrealizedPct >= 0 ? "profit" : "loss"}`}
                        >
                            {PnLs.unrealizedPct >= 0 ? "▲" : "▼"}
                            {formatNumber(Math.abs(PnLs.unrealizedPct))}%
                        </span>
                    </div>
                </div>
            </div>

            {Object.keys(filteredTransactions).length === 0 ? (
                <p className="empty-text">No transactions added yet.</p>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1  }}
                >
                    <div className="transaction-rows">
                        <div className="transaction-header">
                            <div className="col-1">Type</div>
                            <div className="col-2">Wallet</div>
                            <div className="col-3">Category</div>
                            <div className="col-4">Amount</div>
                            <div className="col-5">Entry USD</div>
                            <div className="col-6">Gas Fee</div>
                            <div className="col-7">Actions</div>
                        </div>
                        {Object.keys(filteredTransactions).map(date => (
                            <div className="date-group" key={date}>
                                <h3 className="date-header">
                                    {date !== "Unknown"
                                        ? new Date(date).toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'})
                                        : "Unknown Date"}
                                </h3>
                                {filteredTransactions[date]?.map((tx, index) => (
                                    <div className="transaction-row" key={tx.id || index}>

                                        <div className="col-1">
                                            <p>{tx.type ? tx.type : "No Type"}</p>
                                        </div>

                                        <div className="col-2">
                                            <p>{tx.wallet ? `${tx.wallet.slice(0, 6)}…${tx.wallet.slice(-4)}` : "No Wallet"}</p>
                                        </div>

                                        <div className="col-3">
                                            <p>{tx.category ? tx.category : "No Category"}</p>
                                        </div>

                                        <div className="col-4">
                                            <p>{tx.crypto_amount ? `${formatNumber(tx.crypto_amount, "crypto")} ${tx.crypto_symbol}` : "No Crypto Amount"}</p>
                                        </div>

                                        <div className="col-5">
                                            <p>{tx.usd_value_at_entry ? `$${formatNumber(tx.usd_value_at_entry)}` : "No USD Value at Entry"}</p>
                                        </div>

                                        <div className="col-6">
                                            <p>{tx.gas_fee_usd ? `$${formatNumber(tx.gas_fee_usd)}` : "No Gas Fee"}</p>
                                        </div>

                                        <div className="card-actions">
                                            <button className="btn-icon" aria-label="Edit" onClick={() => handleEdit(tx.id)}>
                                                <EditIcon fontSize="small" />
                                            </button>
                                            <button className="btn-icon" aria-label="Delete" onClick={() => handleDelete(tx)}>
                                                <DeleteIcon fontSize="small" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </motion.div>  
            )}    
                <Link to="/add" className="back-link">Add Transaction</Link>
        </div>
    );
}

export default Transactions;