import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TasksTable from '../components/TasksTable';

const OverdueTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                setLoading(true);

                const response = await axios.get('http://localhost:4000/api/task');
                const allTasks = response.data?.tasks || response.data?.data || [];

                const overdueTasks = allTasks.filter(task =>
                    task.dueDate && new Date(task.dueDate) < new Date() && !task.isCompleted
                );

                setTasks(overdueTasks);
            } catch (err) {
                console.error('Error fetching overdue tasks:', err);
                setError('Failed to load overdue tasks');
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, []);

    return (
        <div className='p-4'>
            {/* Centered Title */}
            <div className='flex justify-center my-8'>
                <h1 className='text-4xl font-extrabold text-center font-serif'>Overdue Tasks</h1>
            </div>

            {/* Table or Error */}
            <div className='mt-8'>
                {loading && <p className='text-center'>Loading...</p>}
                {error && <p className='text-center text-red-500'>{error}</p>}
                {!loading && !error && <TasksTable tasks={tasks} />}
            </div>
        </div>
    );
};

export default OverdueTasks;
