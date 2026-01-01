import React, { useState } from "react";
import { getCookie } from "./utils";
import { motion } from "framer-motion";
import axios from "axios"
import "./TransactionsLogin.css";

function TransactionsSignup({ animation, onClose, onOpen, onSuccess }) {
    const [formData, setFormData] = useState({ 
        "username": "", 
        "password": "",
        "confirmPassword": "", 
    });
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            await axios.post("/api/signup/", formData, { 
                withCredentials: true,
                headers: { "X-CSRFToken": getCookie("csrftoken") }, 
            });
            setFormData({ "username": "", "password": "", "confirmPassword": "" });
            onSuccess();
            onClose();
        } catch (err) {
            setError("Signup failed — username may already exist");
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
                <h2>Sign up</h2>
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
                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />

                    {error && <p className="error">{error}</p>}
                    
                    <button type="submit">Create Account</button>
                </form>

                <p>
                    Already have an account?{" "}
                    <span
                        className="switch-link"
                        onClick={() => {
                            onClose();
                            onOpen();
                        }}   
                    >
                        Log in
                    </span>
                </p>
            </motion.div>
        </div>
    )
}

export default TransactionsSignup;