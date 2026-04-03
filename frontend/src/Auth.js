import React, { useState } from 'react';
import axios from 'axios';

function Auth({ setToken }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isLogin ? 'http://localhost:5000/api/login' : 'http://localhost:5000/api/signup';
    try {
      const res = await axios.post(url, { email, password });
      if (isLogin) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
      } else {
        alert("Signup successful! Please login.");
        setIsLogin(true);
      }
    } catch (err) {
      alert(err.response?.data?.error || "Authentication failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-panel auth-card">
        <h2>{isLogin ? "Welcome Back" : "Create Account"}</h2>
        <form onSubmit={handleSubmit}>
          <input 
            type="email" 
            placeholder="Email Address" 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <button type="submit" className="add-btn">
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>
        <p className="toggle-text" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "New here? Create an account" : "Already have an account? Login"}
        </p>
      </div>
    </div>
  );
}

export default Auth;