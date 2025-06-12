import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useSnackbar } from 'notistack';

const EditTask = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Low');
  const [category, setCategory] = useState('Stock counting');
  const [tags, setTags] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { id } = useParams();

  // Load existing task data
  useEffect(() => {
    setLoading(true);
    axios.get(`http://localhost:4000/api/task/${id}`)
      .then((response) => {
        const task = response.data;
        setTitle(task.title);
        setDescription(task.description);
        const formattedDate = new Date(task.dueDate).toISOString().split('T')[0];
        setDueDate(formattedDate);
        setPriority(task.priority);
        setCategory(task.category || 'Stock counting');
        setTags(task.tags || []);
        setIsCompleted(task.isCompleted);
        setLoading(false);
      })
      .catch(error => {
        console.error("Fetch task error:", error.message);
        enqueueSnackbar('Failed to load task', { variant: 'error' });
        setLoading(false);
      });
  }, [id, enqueueSnackbar]);

  // Form validation
  const validateForm = () => {
    const errors = {};
    if (!title.trim()) errors.title = 'Title is required';
    else if (title.trim().length < 3) errors.title = 'Title must be at least 3 characters';

    if (!description.trim()) errors.description = 'Description is required';
    else if (description.trim().length < 10) errors.description = 'Description must be at least 10 characters';

    if (!dueDate) errors.dueDate = 'Due date is required';
    else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (new Date(dueDate) < today) errors.dueDate = 'Due date cannot be in the past';
    }

    if (!priority) errors.priority = 'Priority is required';

    if (tags.length > 5) errors.tags = 'Cannot have more than 5 tags';

    return errors;
  };

  // Handle Save
  const handleEditTask = () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    const data = {
      title: title.trim(),
      description: description.trim(),
      dueDate,
      priority,
      category,
      tags,
      isCompleted
    };

    setLoading(true);

    axios
      .put(`http://localhost:4000/api/task/${id}`, data)
      .then(() => {
        setLoading(false);
        enqueueSnackbar('Task updated successfully', { variant: 'success' });
        navigate('/taskhome');
      })
      .catch(error => {
        console.error("Update task error:", error.message);
        setLoading(false);
        enqueueSnackbar('Failed to update task', { variant: 'error' });
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-green-300 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 transform transition-all duration-300 hover:shadow-2xl">
        <h1 className="text-3xl font-bold text-center text-green-800 mb-6 font-sans">Edit Task</h1>

        {loading ? (
          <p className="text-center text-lg font-medium text-gray-600">Loading...</p>
        ) : (
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
                placeholder="Enter task title"
              />
              {formErrors.title && <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200 resize-none"
                rows="4"
                placeholder="Enter task description"
              />
              {formErrors.description && <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>}
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
              />
              {formErrors.dueDate && <p className="text-red-500 text-sm mt-1">{formErrors.dueDate}</p>}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
              {formErrors.priority && <p className="text-red-500 text-sm mt-1">{formErrors.priority}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
              >
                <option value="Stock counting">Stock counting</option>
                <option value="Packaging and labeling">Packaging and labeling</option>
                <option value="Sample collection for testing">Sample collection for testing</option>
                <option value="Facility checks">Facility checks</option>
                <option value="Data entry">Data entry</option>
                <option value="Training attendance">Training attendance</option>
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                value={tags.join(', ')}
                onChange={(e) => setTags(e.target.value.split(',').map(t => t.trim()).filter(t => t))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
                placeholder="e.g., urgent, work, personal"
              />
              {formErrors.tags && <p className="text-red-500 text-sm mt-1">{formErrors.tags}</p>}
            </div>

            {/* Completed checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={isCompleted}
                onChange={(e) => setIsCompleted(e.target.checked)}
                id="completed-checkbox"
                className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="completed-checkbox" className="ml-2 text-sm font-medium text-gray-700 select-none">
                Mark as Completed
              </label>
            </div>

            {/* Save button */}
            <button
              type="button"
              onClick={handleEditTask}
              disabled={loading}
              className={`w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Saving...' : 'Save Task'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditTask;