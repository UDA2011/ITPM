import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSnackbar } from 'notistack';

const CreateTask = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [priority, setPriority] = useState('Low');
    const [category, setCategory] = useState('Orders');
    const [tags, setTags] = useState('');
    const [isCompleted, setIsCompleted] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const handleSaveTask = async () => {
        const data = {
            title,
            description,
            dueDate,
            priority,
            category,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            isCompleted
        };

        setLoading(true);

        try {
            const response = await axios.post('http://localhost:4000/api/task', data);
            enqueueSnackbar('Task created successfully!', { variant: 'success' });
            navigate('/taskhome');
        } catch (error) {
            console.error('Task creation error:', error);
            enqueueSnackbar(
                error.response?.data?.message || 'Failed to create task',
                { variant: 'error' }
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-green-200 min-h-screen">
            <h1 className="text-3xl my-4 text-center font-serif">Create Task</h1>
            <div className="bg-white border-2 border-green-700 rounded-xl w-full max-w-xl mx-auto p-6 shadow-md">
                <div className="mb-4">
                    <label className="block text-lg font-semibold text-gray-700">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-green-700 rounded"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-lg font-semibold text-gray-700">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-green-700 rounded h-24"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-lg font-semibold text-gray-700">Due Date</label>
                    <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-green-700 rounded"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-lg font-semibold text-gray-700">Priority</label>
                    <div className="flex gap-4 mt-2">
                        {['Low', 'Medium', 'High', 'Urgent'].map((level) => (
                            <label key={level} className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    value={level}
                                    checked={priority === level}
                                    onChange={(e) => setPriority(e.target.value)}
                                    className="w-5 h-5 accent-green-500"
                                />
                                {level}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-lg font-semibold text-gray-700">Category</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-green-700 rounded"
                    >
                        {['Orders', 'Stocks', 'Livestock Health', 'Products', 'Employees', 'Maintenance', 'Plantation'].map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-lg font-semibold text-gray-700">Tags (comma-separated)</label>
                    <input
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-green-700 rounded"
                    />
                </div>

                <div className="mb-6 flex items-center">
                    <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={(e) => setIsCompleted(e.target.checked)}
                        className="w-5 h-5 accent-green-500 mr-2"
                    />
                    <label className="text-lg font-semibold text-gray-700">Mark as Completed</label>
                </div>

                <button
                    onClick={handleSaveTask}
                    disabled={loading}
                    className="w-full py-3 bg-green-700 text-white font-bold rounded-lg hover:bg-green-800 transition-colors"
                >
                    {loading ? 'Saving...' : 'Save Task'}
                </button>
            </div>
        </div>
    );
};

export default CreateTask;
