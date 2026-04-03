import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [priority, setPriority] = useState('Low');

  useEffect(() => {
    const savedUserId = localStorage.getItem('userId');
    if (savedUserId) {
      setIsLoggedIn(true);
      fetchTasks(savedUserId);
    }
  }, []);

  const fetchTasks = async (uid) => {
    try {
      const res = await axios.get(`http://localhost:5000/tasks/${uid}`);
      setTasks(res.data);
    } catch (err) { console.log("Fetch error"); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('userId', res.data.userId);
        setIsLoggedIn(true);
        fetchTasks(res.data.userId);
      }
    } catch (err) { alert("Login failed"); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/register', { email, password });
      if (res.data.success) { alert("Success! Please Login."); setIsRegistering(false); }
    } catch (err) { alert("Signup failed"); }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('userId');
    try {
      await axios.post('http://localhost:5000/add-task', { userId, title: taskTitle, priority });
      setTaskTitle('');
      fetchTasks(userId);
    } catch (err) { alert("Error adding task"); }
  };

  const handleToggleTask = async (taskId) => {
    try {
      await axios.put(`http://localhost:5000/toggle-task/${taskId}`);
      fetchTasks(localStorage.getItem('userId'));
    } catch (err) { alert("Error updating task"); }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`http://localhost:5000/delete-task/${taskId}`);
      fetchTasks(localStorage.getItem('userId'));
    } catch (err) { alert("Error deleting task"); }
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    setIsLoggedIn(false);
    setTasks([]);
  };

  const renderList = (prio) => (
    <div style={columnStyle}>
      <h3 style={{ color: prio === 'High' ? 'red' : prio === 'Medium' ? 'orange' : 'green' }}>{prio} Priority</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {tasks.filter(t => t.priority === prio).map(task => (
          <li key={task._id} style={itemStyle}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input 
                type="checkbox" 
                checked={task.completed} 
                onChange={() => handleToggleTask(task._id)} 
                style={{ marginRight: '10px' }}
              />
              <span style={{ 
                textDecoration: task.completed ? 'line-through' : 'none',
                color: task.completed ? '#888' : '#000'
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
    <div style={{ padding: '20px', fontFamily: 'Arial', textAlign: 'center' }}>
      {!isLoggedIn ? (
        <div style={formBoxStyle}>
          <h1>{isRegistering ? "Sign Up" : "Login"}</h1>
          <form onSubmit={isRegistering ? handleRegister : handleLogin}>
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} required />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} required />
            <button type="submit" style={mainBtnStyle}>{isRegistering ? "Register" : "Login"}</button>
          </form>
          <p onClick={() => setIsRegistering(!isRegistering)} style={{ cursor: 'pointer', color: 'blue' }}>
            {isRegistering ? "Have an account? Login" : "New? Sign up here"}
          </p>
        </div>
      ) : (
        <div>
          <h2>Remote Task Manager <button onClick={handleLogout} style={{ fontSize: '12px' }}>Logout</button></h2>
          <div style={{ marginBottom: '20px' }}>
            <input placeholder="New Task" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} style={{ padding: '8px' }} />
            <select value={priority} onChange={e => setPriority(e.target.value)} style={{ padding: '8px', margin: '0 5px' }}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            <button onClick={handleAddTask} style={{ padding: '8px' }}>Add</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            {renderList('High')}
            {renderList('Medium')}
            {renderList('Low')}
          </div>
        </div>
      )}
    </div>
  );
}

// Styling Objects
const columnStyle = { width: '30%', border: '1px solid #ccc', borderRadius: '8px', padding: '10px', minHeight: '300px', backgroundColor: '#fff' };
const itemStyle = { display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #eee', alignItems: 'center' };
const deleteBtnStyle = { background: '#ff4d4d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '5px 8px' };
const inputStyle = { display: 'block', margin: '10px auto', padding: '10px', width: '200px', borderRadius: '5px', border: '1px solid #ddd' };
const formBoxStyle = { border: '1px solid #ccc', padding: '30px', display: 'inline-block', borderRadius: '15px', backgroundColor: '#f9f9f9' };
const mainBtnStyle = { padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '5px', width: '100%' };

export default App;