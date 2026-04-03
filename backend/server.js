const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
const dbURI = "mongodb+srv://sruthibalabhadruni_db_user:India2026@cluster0.etbh95f.mongodb.net/RemoteTaskManager?retryWrites=true&w=majority";

mongoose.connect(dbURI)
    .then(() => console.log("✅ Connected to MongoDB successfully!"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err.message));

// Models
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', UserSchema);

const TaskSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    description: String,
    priority: { type: String, default: 'Low' },
    completed: { type: Boolean, default: false }
});
const Task = mongoose.model('Task', TaskSchema);

// --- Auth Routes ---
app.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ success: false, message: "User already exists!" });
        
        const newUser = new User({ email, password });
        await newUser.save();
        res.status(201).json({ success: true, message: "User registered successfully!" });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || user.password !== password) return res.status(400).json({ success: false, message: "Invalid credentials" });
        
        res.status(200).json({ success: true, userId: user._id });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// --- Task Routes ---
app.post('/add-task', async (req, res) => {
    try {
        const { userId, title, priority } = req.body;
        const newTask = new Task({ userId, title, priority });
        await newTask.save();
        res.status(201).json({ success: true, message: "Task added!" });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.get('/tasks/:userId', async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.params.userId });
        res.json(tasks);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update: Toggle Complete Route
app.put('/toggle-task/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        task.completed = !task.completed;
        await task.save();
        res.json({ success: true, completed: task.completed });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Delete Route
app.delete('/delete-task/:id', async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Task deleted" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));