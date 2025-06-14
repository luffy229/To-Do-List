const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');
const auth = require('../middleware/auth');

// Create a new todo
router.post('/', auth, async (req, res) => {
  try {
    const todo = new Todo({
      ...req.body,
      user: req.user._id
    });
    await todo.save();
    res.status(201).json(todo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all todos for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific todo
router.get('/:id', auth, async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    
    res.json(todo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a todo
router.patch('/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['title', 'description', 'completed', 'dueDate', 'priority'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ message: 'Invalid updates' });
  }

  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    updates.forEach(update => todo[update] = req.body[update]);
    await todo.save();
    res.json(todo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a todo
router.delete('/:id', auth, async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get todos by completion status
router.get('/status/:completed', auth, async (req, res) => {
  try {
    const completed = req.params.completed === 'true';
    const todos = await Todo.find({
      user: req.user._id,
      completed
    }).sort({ createdAt: -1 });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get todos by priority
router.get('/priority/:priority', auth, async (req, res) => {
  try {
    const priority = req.params.priority;
    const todos = await Todo.find({
      user: req.user._id,
      priority
    }).sort({ createdAt: -1 });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 