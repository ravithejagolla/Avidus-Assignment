import Task from '../models/Task.js';
import ActivityLog from '../models/ActivityLog.js';

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, error: 'Please add a task title' });
    }

    const task = await Task.create({
      title,
      description,
      user: req.user.id
    });

    // Log Activity: TASK_CREATE
    await ActivityLog.create({
      user: req.user.id,
      action: 'TASK_CREATE',
      details: `${req.user.name} created task "${title}"`
    });

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all tasks (Admin views all, User views own only)
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res) => {
  try {
    let tasks;

    if (req.user.role === 'Admin') {
      // Admin views all tasks, populate user info
      tasks = await Task.find().populate('user', 'name email role status');
    } else {
      // Normal user views own tasks only
      tasks = await Task.find({ user: req.user.id }).populate('user', 'name email');
    }

    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update a task (User can update own task, Admin can update any task)
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    // Make sure user is task owner or Admin
    if (task.user.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        error: 'User is not authorized to update this task'
      });
    }

    const oldStatus = task.status;

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Log Activity: TASK_UPDATE
    let detailMsg = `${req.user.name} updated task "${task.title}"`;
    if (req.body.status && req.body.status !== oldStatus) {
      detailMsg = `${req.user.name} updated task "${task.title}" status from "${oldStatus}" to "${task.status}"`;
    }

    await ActivityLog.create({
      user: req.user.id,
      action: 'TASK_UPDATE',
      details: detailMsg
    });

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete a task (User can delete own task, Admin can delete any task)
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    // Make sure user is task owner or Admin
    if (task.user.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        error: 'User is not authorized to delete this task'
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    // Log Activity: TASK_DELETE
    const who = req.user.role === 'Admin' && task.user.toString() !== req.user.id 
      ? `Admin (${req.user.name})` 
      : req.user.name;

    await ActivityLog.create({
      user: req.user.id,
      action: 'TASK_DELETE',
      details: `${who} deleted task "${task.title}"`
    });

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
