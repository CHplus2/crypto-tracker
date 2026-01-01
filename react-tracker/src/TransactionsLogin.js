import React, { useState } from "react";
import { getCookie } from "./utils";
import { motion } from "framer-motion";
import axios from "axios"
import "./TransactionsLogin.css";

function TransactionsLogin({ animation, onClose, onOpen, onSuccess }) {
    const [formData, setFormData] = useState({ "username": "", "password": "" });
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("/api/login/", formData, { 
                withCredentials: true,
                headers: { "X-CSRFToken": getCookie("csrftoken") }, 
            });
            setFormData({ "username": "", "password": "" });
            onSuccess();
            onClose();
        } catch (err) {
            setError("Invalid username or password");
        }
    }   

    return (
        <div className="modal-overlay">
            <motion.div
                className="modal-content"
                {...animation}
                transition= {{ ...animation.transition, duration: 0.25 }}
                onClick={(e) => e.stopPropagation()}
            >
                <button className="close-btn" onClick={onClose}>✖</button>
                <h2>Login</h2>
                <form onSubmit={handleSubmit} className="login-form">
                <input 
                        type="text" 
                        name="username" 
                        placeholder="Username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                    <input 
                        type="password" 
                        name="password" 
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    {error && <p className="error">{error}</p>}
                    <button type="submit">Login</button>
                </form>
                <p>
                    Don't have an account?{" "}
                    <span
                        className="switch-link"
                        onClick={() => {
                            onClose();
                            onOpen();
                        }}   
                    >
                        Create one
                    </span>
                </p>
            </motion.div>
        </div>
    )
}

export default TransactionsLogin;