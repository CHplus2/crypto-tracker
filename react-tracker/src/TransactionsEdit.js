import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { getCookie } from "./utils";

function TransactionsEdit({ setTransactions }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        type: "",
        crypto_amount: "",
        crypto_symbol: "",
        usd_value_at_entry: "",
        gas_fee_usd: "",
        category: "",
        wallet: "",
        date: ""
    });

    useEffect(() => {
        const fetchTransaction = async () => {
            document.title = "Edit K-Drama";

            try {
                const res = await axios.get(`/api/transactions/${id}/`, {
                        withCredentials: true
                    }
                );
                setFormData(res.data);
            } catch (err) {
                console.error(err);
            }
        }
        fetchTransaction();
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const dataToSend = {
            ...formData,
            crypto_amount: Number(formData.crypto_amount),
            usd_value_at_entry: Number(formData.usd_value_at_entry),
            gas_fee_usd: Number(formData.gas_fee_usd),
        }

        try {
            const res = await axios.put(`/api/transactions/${id}/`, dataToSend, {
                withCredentials: true,
                headers: { "X-CSRFToken": getCookie("csrftoken") },
            });

            setTransactions(prev => prev.map((d) => d.id === formData.id ? res.data : d));
            navigate("/");
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="form-page">
            <h2>Edit Transaction</h2>
            <form onSubmit={handleSubmit}>
                <select 
                    name="type" 
                    id="genre-select" 
                    value={formData.type} 
                    onChange={handleChange}
                    required
                >
                    <option value="">Select Type</option>
                    <option value="Buy">Buy</option>
                    <option value="Sell">Sell</option>
                    <option  value="Transfer In">Transfer-in</option>
                    <option value="Transfer Out">Transfer-out</option>
                    <option value="Reward">Reward</option>
                </select>
                <select 
                    name="crypto_symbol" 
                    id="genre-select" 
                    value={formData.crypto_symbol} 
                    onChange={handleChange}
                    required
                >   
                    <option value="">Select Coin</option>
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                    <option  value="SOL">SOL</option>
                    <option value="USDT">USDT</option>
                </select>
                <input
                    type="number" 
                    step="any"
                    name="crypto_amount"
                    placeholder="Crypto Amount"
                    value={formData.crypto_amount}
                    onChange={handleChange}
                    required
                />
                <input
                    type="number" 
                    step="any"
                    name="usd_value_at_entry"
                    placeholder="USD Value at Entry"
                    value={formData.usd_value_at_entry}
                    onChange={handleChange}
                />
                <input
                    type="number" 
                    step="any"
                    name="gas_fee_usd"
                    placeholder="Gas Fee"
                    value={formData.gas_fee_usd}
                    onChange={handleChange}
                    required
                />
                <select 
                    name="category" 
                    id="genre-select" 
                    value={formData.category} 
                    onChange={handleChange} 
                    required
                >
                    <option value="">Select Category</option>
                    <option value="Investment">Investment</option>
                    <option value="Transfer">Transfer</option>
                    <option value="NFT">NFT</option>
                    <option value="Staking Reward">Staking Reward</option>
                    <option value="Airdrop">Airdrop</option>
                    <option value="Gift">Gift</option>
                </select>
                <input
                    type="text" 
                    name="wallet"
                    placeholder="Wallet"
                    value={formData.wallet}
                    onChange={handleChange}
                />
                <input
                    type="date" 
                    name="date"
                    placeholder="Transaction date"
                    value={formData.date}
                    onChange={handleChange}
                />
                <button type="submit">Save Changes</button>
                <Link to="/" className="back-link">Back</Link>
            </form>
        </div>
    );
}

export default TransactionsEdit;