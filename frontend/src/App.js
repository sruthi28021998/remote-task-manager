import React, { useState, useEffect } from 'react';
import axios from 'axios';

// --- 1. CONFIGURATION ---
const API_URL = "https://remote-task-manager-jfwk.onrender.com";

const API = axios.create({ 
  baseURL: API_URL 
}); 

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [priority, setPriority] = useState('Low');

  // --- 2. AUTH & TASK LOGIC ---
  useEffect(() => {
    const savedUserId = localStorage.getItem('userId');
    if (savedUserId) {
      setIsLoggedIn(true);
      fetchTasks(savedUserId);
    }
  }, []);

  const fetchTasks = async (uid) => {
    try {
      const res = await API.get(`/tasks/${uid}`);
      setTasks(res.data);
    } catch (err) { 
      console.log("Fetch error:", err); 
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/login', { email, password });
      if (res.data.success || res.data.userId) {
        const uid = res.data.userId || res.data.user._id;
        localStorage.setItem('userId', uid);
        setIsLoggedIn(true);
        fetchTasks(uid);
      }
    } catch (err) { 
      alert("Login failed. Check if your Render backend is live!"); 
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/register', { email, password });
      if (res.data.success) { 
        alert("Success! Please Login."); 
        setIsRegistering(false); 
      }
    } catch (err) { 
      alert("Signup failed"); 
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('userId');
    if (!taskTitle.trim()) return;
    try {
      await API.post('/add-task', { userId, title: taskTitle, priority });
      setTaskTitle('');
      fetchTasks(userId);
    } catch (err) { 
      alert("Error adding task"); 
    }
  };

  const handleToggleTask = async (taskId) => {
    try {
      await API.put(`/toggle-task/${taskId}`);
      fetchTasks(localStorage.getItem('userId'));
    } catch (err) { 
      alert("Error updating task"); 
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await API.delete(`/delete-task/${taskId}`);
      fetchTasks(localStorage.getItem('userId'));
    } catch (err) { 
      alert("Error deleting task"); 
    }
  };

  // --- NEW: CLEAR COMPLETED LOGIC ---
  const handleClearCompleted = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    if (window.confirm("Remove all completed tasks?")) {
      try {
        const res = await API.delete(`/clear-completed/${userId}`);
        if (res.data.success) {
          fetchTasks(userId);
        }
      } catch (err) {
        alert("Error clearing tasks");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    setIsLoggedIn(false);
    setTasks([]);
  };

  // --- 3. RENDERING ---
  const renderList = (prio) => (
    <div style={columnStyle}>
      <h3 style={{ 
        color: prio === 'High' ? '#e74c3c' : prio === 'Medium' ? '#f39c12' : '#27ae60',
        borderBottom: '2px solid #eee',
        paddingBottom: '10px'
      }}>
        {prio} Priority
      </h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {tasks.filter(t => t.priority === prio).map(task => (
          <li key={task._id} style={itemStyle}>
            <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <input 
                type="checkbox" 
                checked={task.completed} 
                onChange={() => handleToggleTask(task._id)} 
                style={{ marginRight: '10px', cursor: 'pointer' }}
              />
              <span style={{ 
                textDecoration: task.completed ? 'line-through' : 'none',
                color: task.completed ? '#bdc3c7' : '#2c3e50',
                fontSize: '16px'
              }}>
                {task.title}
              </span>
            </div>
            <button onClick={() => handleDeleteTask(task._id)} style={deleteBtnStyle}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div style={pageStyle}>
      {!isLoggedIn ? (
        <div style={formBoxStyle}>
          <h1 style={{ color: '#2c3e50' }}>{isRegistering ? "Create Account" : "Welcome Back"}</h1>
          <form onSubmit={isRegistering ? handleRegister : handleLogin}>
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} required />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} required />
            <button type="submit" style={mainBtnStyle}>{isRegistering ? "Register" : "Login"}</button>
          </form>
          <p onClick={() => setIsRegistering(!isRegistering)} style={toggleLinkStyle}>
            {isRegistering ? "Already have an account? Login" : "Don't have an account? Sign up"}
          </p>
        </div>
      ) : (
        <div style={dashboardStyle}>
          <div style={headerStyle}>
            <h2>Remote Task Manager</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleClearCompleted} style={clearBtnStyle}>Clear Completed</button>
              <button onClick={handleLogout} style={logoutBtnStyle}>Logout</button>
            </div>
          </div>
          
          <div style={controlsStyle}>
            <input 
              placeholder="What needs to be done?" 
              value={taskTitle} 
              onChange={e => setTaskTitle(e.target.value)} 
              style={taskInputStyle} 
            />
            <select value={priority} onChange={e => setPriority(e.target.value)} style={selectStyle}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            <button onClick={handleAddTask} style={addBtnStyle}>Add Task</button>
          </div>

          <div style={boardStyle}>
            {renderList('High')}
            {renderList('Medium')}
            {renderList('Low')}
          </div>
        </div>
      )}
    </div>
  );
}

// --- 4. STYLING ---
const pageStyle = { backgroundColor: '#f0f2f5', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'Segoe UI, sans-serif' };
const formBoxStyle = { backgroundColor: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', textAlign: 'center', width: '350px' };
const inputStyle = { display: 'block', margin: '15px auto', padding: '12px', width: '100%', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' };
const mainBtnStyle = { padding: '12px', background: '#3498db', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '6px', width: '100%', fontWeight: 'bold' };
const toggleLinkStyle = { cursor: 'pointer', color: '#3498db', marginTop: '15px', fontSize: '14px' };

const dashboardStyle = { width: '90%', maxWidth: '1000px', backgroundColor: '#fff', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '10px' };
const logoutBtnStyle = { background: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', padding: '8px 15px', cursor: 'pointer' };
const clearBtnStyle = { background: '#e67e22', color: 'white', border: 'none', borderRadius: '4px', padding: '8px 15px', cursor: 'pointer', fontWeight: 'bold' };

const controlsStyle = { marginBottom: '30px', display: 'flex', justifyContent: 'center', gap: '10px' };
const taskInputStyle = { padding: '12px', width: '300px', borderRadius: '6px', border: '1px solid #ddd' };
const selectStyle = { padding: '12px', borderRadius: '6px', border: '1px solid #ddd' };
const addBtnStyle = { padding: '12px 25px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };

const boardStyle = { display: 'flex', justifyContent: 'space-between', gap: '20px' };
const columnStyle = { flex: 1, backgroundColor: '#fdfdfd', border: '1px solid #eee', borderRadius: '10px', padding: '15px', minHeight: '400px' };
const itemStyle = { display: 'flex', justifyContent: 'space-between', padding: '12px', borderBottom: '1px solid #f9f9f9', alignItems: 'center' };
const deleteBtnStyle = { background: 'transparent', color: '#e74c3c', border: '1px solid #e74c3c', borderRadius: '4px', cursor: 'pointer', padding: '4px 8px', fontSize: '12px' };

export default App;