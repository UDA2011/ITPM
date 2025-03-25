import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';

const TDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const handleDelete = async (taskId) => {
    try {
      await axios.delete(`/api/tasks/${taskId}`);
      setTasks(tasks.filter(task => task._id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data } = await axios.get('/api/tasks');
        setTasks(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'due-today') {
      const today = new Date().toISOString().split('T')[0];
      return task.dueDate?.split('T')[0] === today;
    }
    if (filter === 'overdue') {
      return new Date(task.dueDate) < new Date() && task.status !== 'completed';
    }
    if (filter === 'no-deadline') {
      return !task.dueDate;
    }
    return true;
  });

  if (loading) {
    return <div className="text-center py-8">Loading tasks...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Task Pro</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-1/4">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Create Task</h2>
            <Link
              to="/tasks/create"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg inline-block hover:bg-blue-700 transition"
            >
              + New Task
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Filter Tasks</h2>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setFilter('all')}
                  className={`w-full text-left px-2 py-1 rounded ${filter === 'all' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                >
                  All Tasks
                </button>
              </li>
              <li>
                <button
                  onClick={() => setFilter('due-today')}
                  className={`w-full text-left px-2 py-1 rounded ${filter === 'due-today' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                >
                  Due Today
                </button>
              </li>
              <li>
                <button
                  onClick={() => setFilter('overdue')}
                  className={`w-full text-left px-2 py-1 rounded ${filter === 'overdue' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                >
                  Overdue
                </button>
              </li>
              <li>
                <button
                  onClick={() => setFilter('no-deadline')}
                  className={`w-full text-left px-2 py-1 rounded ${filter === 'no-deadline' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                >
                  No Deadline
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:w-3/4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">
                {filter === 'due-today' ? 'Due Today' : 
                 filter === 'overdue' ? 'Overdue' : 
                 filter === 'no-deadline' ? 'No Deadline' : 'All Tasks'}
                <span className="text-gray-500 ml-2">({filteredTasks.length})</span>
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTasks.map((task, index) => (
                    <tr key={task._id}>
                      <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{task.title}</td>
                      <td className="px-6 py-4">{task.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{task.assignedTo?.name || task.assignedTo}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {task.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : 'No deadline'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          task.status === 'completed' ? 'bg-green-100 text-green-800' :
                          task.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          to={`/tasks/edit/${task._id}`}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(task._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TDashboard;