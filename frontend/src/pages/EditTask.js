import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useSnackbar } from 'notistack';

const EditTask = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Low');
  const [category, setCategory] = useState('Stock counting'); // fixed default here
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
        setCategory(task.category || 'Stock counting'); // fallback to valid default
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

    // Optional: limit tags count here if needed
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
    <div className="p-4 bg-green-200 min-h-screen w-[800px]">
      <h1 className="text-3xl my-4 text-center font-serif">Edit Task</h1>

      {loading ? (
        <p className="text-center text-lg font-semibold">Loading...</p>
      ) : (
        <div className="bg-white flex flex-col border-2 border-green-700 rounded-xl w-full max-w-2xl p-6 mx-auto">
          {/* Title */}
          <div className="my-4">
            <label className="text-xl font-semibold text-gray-700">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-2 border-green-700 px-4 py-2 w-full rounded-md"
            />
            {formErrors.title && <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>}
          </div>

          {/* Description */}
          <div className="my-4">
            <label className="text-xl font-semibold text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-2 border-green-700 px-4 py-2 w-full rounded-md h-28 resize-none"
            />
            {formErrors.description && <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>}
          </div>

          {/* Due Date */}
          <div className="my-4">
            <label className="text-xl font-semibold text-gray-700">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="border-2 border-green-700 px-4 py-2 w-full rounded-md"
            />
            {formErrors.dueDate && <p className="text-red-500 text-sm mt-1">{formErrors.dueDate}</p>}
          </div>

          {/* Priority */}
          <div className="my-4">
            <label className="text-xl font-semibold text-gray-700">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="border-2 border-green-700 px-4 py-2 w-full rounded-md"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
            {formErrors.priority && <p className="text-red-500 text-sm mt-1">{formErrors.priority}</p>}
          </div>

          {/* Category */}
          <div className="my-4">
            <label className="text-xl font-semibold text-gray-700">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border-2 border-green-700 px-4 py-2 w-full rounded-md"
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
          <div className="my-4">
            <label className="text-xl font-semibold text-gray-700">Tags (comma separated)</label>
            <input
              type="text"
              value={tags.join(', ')}
              onChange={(e) => setTags(e.target.value.split(',').map(t => t.trim()).filter(t => t))}
              className="border-2 border-green-700 px-4 py-2 w-full rounded-md"
              placeholder="tag1, tag2, tag3"
            />
            {formErrors.tags && <p className="text-red-500 text-sm mt-1">{formErrors.tags}</p>}
          </div>

          {/* Completed checkbox */}
          <div className="my-4 flex items-center space-x-3">
            <input
              type="checkbox"
              checked={isCompleted}
              onChange={(e) => setIsCompleted(e.target.checked)}
              id="completed-checkbox"
              className="w-5 h-5"
            />
            <label htmlFor="completed-checkbox" className="text-lg font-medium text-gray-700 select-none">
              Mark as Completed
            </label>
          </div>

          {/* Save button */}
          <div className="my-6 flex justify-center">
            <button
              type="button"
              className="p-3 bg-green-700 text-white font-bold rounded-lg w-full max-w-xs hover:bg-sky-400 transition-all"
              onClick={handleEditTask}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditTask;
