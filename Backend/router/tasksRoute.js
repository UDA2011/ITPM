const express = require("express");
const Task = require('../models/taskModel');
const mongoose = require('mongoose');

const router = express.Router();

// Middleware to validate ObjectId
const validateObjectId = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "Invalid ID format" });
    }
    next();
};

// Create task
// Create task - Updated version
router.post("/", async (req, res) => {
    try {
        console.log("Received task creation request:", req.body); // Debug log

        const { title, description, dueDate, priority, category, tags, isCompleted } = req.body;

        // Validate required fields
        if (!title || !description || !dueDate || !priority) {
            return res.status(400).json({ 
                success: false,
                message: "Missing required fields",
                required: ["title", "description", "dueDate", "priority"]
            });
        }

        // Create task with proper date handling
        const task = await Task.create({
            title: title.trim(),
            description: description.trim(),
            dueDate: new Date(dueDate), // Ensure proper Date object
            priority,
            category: category || 'Orders',
            tags: Array.isArray(tags) ? tags : (tags ? tags.split(',') : []),
            isCompleted: isCompleted || false
        });

        console.log("Task created successfully:", task); // Debug log

        res.status(201).json({
            success: true,
            message: "Task created successfully",
            data: task
        });
    } catch (error) {
        console.error("Task creation error:", error);
        res.status(500).json({ 
            success: false,
            message: error.message,
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Get all tasks with pagination
router.get("/", async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const tasks = await Task.find({})
            
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ dueDate: 1 });

        const count = await Task.countDocuments();
        
        res.status(200).json({
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            tasks
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// Get single task
router.get("/:id", validateObjectId, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id); // <-- You were missing this line

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.status(200).json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});


// Update task
router.put("/:id", validateObjectId, async (req, res) => {
    try {
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!updatedTask) {
            return res.status(404).json({ message: "Task not found" });
        }
        res.status(200).json(updatedTask);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// Delete task
router.delete("/:id", validateObjectId, async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// Get incomplete tasks
router.get("/incomplete", async (req, res) => {
    try {
        const tasks = await Task.find({ isCompleted: false })
            .sort({ priority: -1, dueDate: 1 });
        res.status(200).json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// Get overdue tasks
router.get("/overdue", async (req, res) => {
    try {
        const tasks = await Task.find({ 
            dueDate: { $lt: new Date() }, 
            isCompleted: false 
        }).sort({ priority: -1 });
        res.status(200).json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// Get urgent tasks
router.get("/urgent", async (req, res) => {
    try {
        const tasks = await Task.find({ 
            priority: 'Urgent', 
            isCompleted: false 
        }).sort({ dueDate: 1 });
        res.status(200).json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;