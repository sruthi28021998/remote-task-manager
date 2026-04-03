const express = require('express');
const router = express.Router();
const { getTasks, createTask, deleteTask } = require('../controllers/taskController');

router.route('/').get(getTasks).post(createTask);
router.route('/:id').delete(deleteTask);

module.exports = router;