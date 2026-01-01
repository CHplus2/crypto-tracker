import React from "react";
import { motion } from "framer-motion";
import "./TransactionsDelete.css";

function TransactionsDelete({ animation, onClose, onConfirm, dramaTitle }) {

    return (
        <div className="modal-overlay" onClick={onClose}>
            <motion.div
                className="modal-content"
                {...animation}
                transition= {{ ...animation.transition, duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
            >
                <h3>Delete Transaction?</h3>
                <p>Are you sure you want to delete{" "}
                    <strong>{dramaTitle}</strong>? <br />
                    This action can't be undone.
                </p>

                <div className="modal-buttons">
                    <button className="modal-btn cancel" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="modal-btn confirm" onClick={onConfirm}>
                        Delete
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

export default TransactionsDelete;