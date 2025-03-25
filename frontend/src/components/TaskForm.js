import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
//import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';
import './TaskForm.css';
const TaskForm = ({ task, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [users, setUsers] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('/api/users');
        setUsers(res.data);
        if (res.data.length > 0) setAssignedTo(res.data[0]._id);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };

    fetchUsers();

    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setAssignedTo(task.assignedTo._id || task.assignedTo);
      setDueDate(task.dueDate ? new Date(task.dueDate) : null);
    }
  }, [task]);

  const validateForm = () => {
    let formErrors = {};
    if (!title.trim()) formErrors.title = 'Title is required';
    if (!description.trim()) formErrors.description = 'Description is required';
    if (!assignedTo) formErrors.assignedTo = 'Please select an assignee';
    if (!dueDate) formErrors.dueDate = 'Due date is required';

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0; // returns true if no errors
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        title,
        description,
        assignedTo,
        dueDate
      });
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{task ? 'Edit Task' : 'Create Task'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`input-field ${errors.title ? 'error' : ''}`}
            />
            {errors.title && <p className="error-text">{errors.title}</p>}
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`input-field ${errors.description ? 'error' : ''}`}
            />
            {errors.description && <p className="error-text">{errors.description}</p>}
          </div>
          <div className="form-group">
            <label>Assigned To</label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className={`input-field ${errors.assignedTo ? 'error' : ''}`}
            >
              <option value="">Select Assignee</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>
            {errors.assignedTo && <p className="error-text">{errors.assignedTo}</p>}
          </div>
          <div className="form-group">
            <label>Due Date</label>
            <DatePicker
              selected={dueDate}
              onChange={(date) => setDueDate(date)}
              dateFormat="MM/dd/yyyy"
              placeholderText="mm/dd/yyyy"
              isClearable
              className={`input-field ${errors.dueDate ? 'error' : ''}`}
            />
            {errors.dueDate && <p className="error-text">{errors.dueDate}</p>}
          </div>
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              {task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;