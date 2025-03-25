import React, { useState } from "react";
import axios from "axios";

const CreateTask = () => {
  const [task, setTask] = useState({
    title: "",
    description: "",
    assignedTo: "",
    dueDate: "",
    status: "pending",
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!task.title) newErrors.title = "Title is required";
    if (!task.description) newErrors.description = "Description is required";
    if (!task.assignedTo) newErrors.assignedTo = "Assigned To is required";
    if (!task.dueDate) newErrors.dueDate = "Due Date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        await axios.post("/api/tasks", task);
        alert("Task created");
      } catch (error) {
        alert("Error creating task");
      }
    }
  };

  return (
    <div>
      <h1>Create Task</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            placeholder="Title"
            value={task.title}
            onChange={(e) => setTask({ ...task, title: e.target.value })}
          />
          {errors.title && <span style={{ color: "red" }}>{errors.title}</span>}
        </div>
        <div>
          <textarea
            placeholder="Description"
            value={task.description}
            onChange={(e) => setTask({ ...task, description: e.target.value })}
          />
          {errors.description && <span style={{ color: "red" }}>{errors.description}</span>}
        </div>
        <div>
          <input
            type="text"
            placeholder="Assigned To"
            value={task.assignedTo}
            onChange={(e) => setTask({ ...task, assignedTo: e.target.value })}
          />
          {errors.assignedTo && <span style={{ color: "red" }}>{errors.assignedTo}</span>}
        </div>
        <div>
          <input
            type="date"
            value={task.dueDate}
            onChange={(e) => setTask({ ...task, dueDate: e.target.value })}
          />
          {errors.dueDate && <span style={{ color: "red" }}>{errors.dueDate}</span>}
        </div>
        <button type="submit">Create</button>
      </form>
    </div>
  );
};

export default CreateTask;