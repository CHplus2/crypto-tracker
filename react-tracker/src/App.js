import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { getCookie } from "./utils";
import axios from "axios";
import Logo from "./Logo";
import Transactions from "./Transactions";
import TransactionsAdd from "./TransactionsAdd";
import TransactionsEdit from "./TransactionsEdit";
import TransactionsLogin from "./TransactionsLogin";
import TransactionsSignup from "./TransactionsSignup";
import TransactionsDelete from "./TransactionsDelete";
import TransactionsPnL from "./TransactionsPnL";
import "./App.css";


function AnimatedRoutes({ 
  transactions, setTransactions, isAuthenticated, 
  setShowLogin, handleDelete, PnLs
}) {

  const navigate = useNavigate();
  const location = useLocation();

  const handleEdit = (id) => {
  if (!isAuthenticated) {
    setShowLogin(true);
    return;
  }
  navigate(`/edit/${id}`);
  }

  const page_motion = {
    initial: { opacity: 0, scale: 0.98, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.98, y: -10 },
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route 
          path="/" 
          element={
            <motion.div
              {...page_motion}
            >
              <Transactions 
                transactions={transactions}
                handleDelete={handleDelete}
                handleEdit={handleEdit}
                PnLs={PnLs}
              />
            </motion.div>
          } 
        />
        <Route 
          path="/add" 
          element={
            <motion.div
              {...page_motion}
            >
              <TransactionsAdd 
                setTransactions={setTransactions}
              />
            </motion.div>
          } 
        />
        <Route 
          path="/edit/:id/" 
          element={
            <motion.div
              {...page_motion}
            >
              <TransactionsEdit 
                setTransactions={setTransactions}
              />
            </motion.div>
          }
        />
        <Route 
          path="/login" 
          element={
            <motion.div
              {...page_motion}
            >
              <TransactionsLogin />
            </motion.div>
          } 
        />
        <Route 
          path="/profit" 
          element={
            <motion.div
              {...page_motion}
            >
              <TransactionsPnL
                PnLs={PnLs}
              />
            </motion.div>
          } 
        />
        <Route 
          path="/profit" 
          element={
            <Logo />
          } 
        />
      </Routes>
    </AnimatePresence>
  )
}

function App() {

  const [transactions, setTransactions] = useState([]);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);

  const [realizedPnL, setRealizedPnL] = useState(0.00);
  const [unrealizedPnL, setUnrealizedPnL] = useState(0.00);
  const [realizedCost, setRealizedCost] = useState(0.00);
  const [unrealizedCost, setUnrealizedCost] = useState(0.00);
  const realizedPct = realizedCost > 0 ? (realizedPnL / realizedCost) * 100 : 0;
  const unRealizedPct = unrealizedCost > 0 ? (unrealizedPnL / unrealizedCost) * 100 : 0;

  const PnLs = {
    "realizedPnL": realizedPnL,
    "unrealizedPnL": unrealizedPnL,
    "realizedCost": realizedCost,
    "unrealizedCost": unrealizedCost,
    "realizedPct": realizedPct,
    "unrealizedPct": unRealizedPct
  }

  useEffect(() => {
    axios
      .get("/api/transactions/", { withCredentials: true })
      .then(res => setTransactions(res.data))
      .catch(err => console.error(err));

    const checkAuth = async () => {
      try {
        const res = await axios.get("/api/check-auth/", { withCredentials: true })
        if (res.data.authenticated) {
          setIsAuthenticated(true);
        }
      } catch (err) {
        setIsAuthenticated(false);
      }
    };

    const loadPnLs = async () => {
      try {
          const res = await fetch("/api/all_pnl/")
          if (!res.ok) throw new Error("Failed to fetch app PnLs")

          const PnLs = await res.json();
          setRealizedPnL(Number(PnLs.realized));
          setUnrealizedPnL(Number(PnLs.unrealized));
          setRealizedCost(Number(PnLs.realized_cost));
          setUnrealizedCost(Number(PnLs.unrealized_cost));
      } catch (err) {
          console.error(err);
      }
    };

    checkAuth();
    loadPnLs();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post("/api/logout/", {}, {
        withCredentials: true,
        headers: { "X-CSRFToken": getCookie("csrftoken") },
      });
      setIsAuthenticated(false);
    } catch (err) {
      console.error(err);
    }
  }

  const deleteDrama = async (id) => {
    try {
        await axios.delete(`/api/transactions/${id}/`, {
            withCredentials: true,
            headers: { "X-CSRFToken": getCookie("csrftoken") }
        });
        setTransactions(prev => prev.filter((d) => d.id !== id));
    } catch (err) {
        console.error(err);
    }
  };

  const confirmDelete = () => {
    if (transactionToDelete) {
      setTimeout(() => {
        deleteDrama(transactionToDelete.id);
        setDeleteModalOpen(false);
        setTransactionToDelete(null); 
      }, 300);
    }
  };

  const handleDelete = (transaction) => {
    if (!isAuthenticated) {
      setShowLogin(true);
      return;
    }
    setTransactionToDelete(transaction);
    setDeleteModalOpen(true);
    };

  const modalMotion = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { ease: [0.4, 0, 0.2, 1] }
  }

  return (
    <div className="App">
      <Router>
        <header className="app-header">
          <Logo />
          <nav className="main-nav">
            <Link to="/">Home</Link>
            <Link to="/add">Add Transaction</Link>
            
            {!isAuthenticated ? (
              <button className="login-btn" onClick={() => setShowLogin(true)}>
                Log in
              </button>
            ) : (
              <div className="user-dropdown">
                <button 
                  className="user-icon"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <User size={28} color="white" />
                </button>
                {dropdownOpen && (
                  <div className="dropdown-content">
                    <button className="logout-btn" onClick={handleLogout}>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </nav>
        </header>
        
        <AnimatedRoutes
          transactions={transactions}
          setTransactions={setTransactions}
          isAuthenticated={isAuthenticated}
          setShowLogin={setShowLogin}
          handleDelete={handleDelete}
          PnLs={PnLs}
        />

        <AnimatePresence>
          {showLogin && (
            <TransactionsLogin 
                animation={modalMotion}
                onClose={() => setShowLogin(false)}
                onOpen={() => setShowSignup(true)}
                onSuccess={() => {
                  setIsAuthenticated(true);                   
                }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showSignup && (
            <TransactionsSignup 
              animation={modalMotion}
              onClose={() => setShowSignup(false)}
              onOpen={() => setShowLogin(true)}
              onSuccess={() => {
                setIsAuthenticated(true);                   
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {deleteModalOpen && (
            <TransactionsDelete 
              animation={modalMotion}
              isOpen={deleteModalOpen}
              onClose={() => setDeleteModalOpen(false)}
              onConfirm={confirmDelete}
              dramaTitle={`${transactionToDelete?.crypto_amount} ${transactionToDelete?.crypto_symbol}`}
            />
          )}
        </AnimatePresence>
      </Router>
    </div>
  );
}

export default App;