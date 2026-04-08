const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
// Allowing all origins for easy testing
app.use(cors());

// MongoDB Connection 
// Use the variable name MONGODB_URI to match your updated Railway settings
const dbURI = process.env.MONGODB_URI || "mongodb+srv://sruthibalabhadruni_db_user:India2026@cluster0.etbh95f.mongodb.net/RemoteTaskManager?retryWrites=true&w=majority";

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

// --- Root Route (Crucial for Railway/Health Checks) ---
// This ensures that clicking your Railway link shows a message instead of a "Site can't be reached" error.
app.get('/', (req, res) => {
    res.send("✅ Backend Server is Running and Active!");
});

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

app.put('/toggle-task/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        task.completed = !task.completed;
        await task.save();
        res.json({ success: true, completed: task.completed });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/delete-task/:id', async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Task deleted" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Port Configuration ---
const PORT = process.env.PORT || 8080; // Defaulting to 8080 to match your Railway logs

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;