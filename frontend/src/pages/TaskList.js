import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import TaskForm from '../components/TaskForm';
//import './TaskList.css';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get('/api/tasks');
        setTasks(res.data);
      } catch (err) {
        console.error('Error fetching tasks:', err);
      }
    };

    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/tasks/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };

    fetchTasks();
    fetchStats();
  }, []);

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'overdue') return new Date(task.dueDate) < new Date() && task.status !== 'completed';
    if (filter === 'today') {
      const today = new Date();
      return (
        task.dueDate &&
        new Date(task.dueDate).setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0)
      );
    }
    if (filter === 'no-deadline') return !task.dueDate;
    return task.status === filter;
  });

  const handleCreate = () => {
    setCurrentTask(null);
    setShowModal(true);
  };

  const handleEdit = (task) => {
    setCurrentTask(task);
    setShowModal(true);
  };

  const handleDelete = (taskId) => {
    confirmAlert({
      title: 'Confirm to delete',
      message: 'Are you sure you want to delete this task?',
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            try {
              await axios.delete(`/api/tasks/${taskId}`);
              setTasks(tasks.filter(task => task._id !== taskId));
            } catch (err) {
              console.error('Error deleting task:', err);
            }
          }
        },
        {
          label: 'No',
          onClick: () => {}
        }
      ]
    });
  };

  const handleSubmit = async (taskData) => {
    try {
      if (currentTask) {
        // Update existing task
        const res = await axios.put(`/api/tasks/${currentTask._id}`, taskData);
        setTasks(tasks.map(task => task._id === currentTask._id ? res.data : task));
      } else {
        // Create new task
        const res = await axios.post('/api/tasks', taskData);
        setTasks([res.data, ...tasks]);
      }
      setShowModal(false);
    } catch (err) {
      console.error('Error saving task:', err);
    }
  };

  //if (!stats) return <div>Loading...</div>;

  return (
    <div className="p-6 md:ml-64">
  {/* Header */}
  <div className="flex justify-between items-center mb-6">
    <button className="bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 transition duration-300 ease-in-out" onClick={handleCreate}>
      Create Task
    </button>
  </div>

  {/* Stats */}
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-6">
    {Object.entries(stats).map(([key, value]) => (
      <div key={key} className="bg-white p-5 rounded-lg shadow-lg text-center">
        <h3 className="text-gray-600 text-sm font-medium">{key.replace(/([A-Z])/g, ' $1').trim()}</h3>
        <p className="text-2xl font-semibold text-gray-800">{value}</p>
      </div>
    ))}
  </div>

  {/* Filters */}
  <div className="flex flex-wrap gap-4 mb-6">
    {["all", "overdue", "today", "no-deadline"].map((type) => (
      <button
        key={type}
        className={`px-5 py-3 rounded-md border text-sm font-medium ${filter === type ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300'} hover:bg-blue-600 hover:text-white transition duration-300`}
        onClick={() => setFilter(type)}
      >
        {type.charAt(0).toUpperCase() + type.slice(1)} ({stats[type]})
      </button>
    ))}
  </div>

  {/* Task Table */}
  <div className="overflow-x-auto">
    <table className="w-full border-collapse table-auto rounded-lg bg-white shadow-md">
      <thead className="bg-gray-200 text-gray-700">
        <tr>
          <th className="p-4 text-sm font-semibold text-left">#</th>
          <th className="p-4 text-sm font-semibold text-left">Title</th>
          <th className="p-4 text-sm font-semibold text-left">Description</th>
          <th className="p-4 text-sm font-semibold text-left">Assigned To</th>
          <th className="p-4 text-sm font-semibold text-left">Due Date</th>
          <th className="p-4 text-sm font-semibold text-left">Status</th>
          {filter === "all" && <th className="p-4 text-sm font-semibold text-left">Action</th>}
        </tr>
      </thead>
      <tbody>
        {filteredTasks.map((task, index) => (
          <tr key={task._id} className="border-t hover:bg-gray-100">
            <td className="p-4 text-sm">{index + 1}</td>
            <td className="p-4 text-sm">{task.title}</td>
            <td className="p-4 text-sm">{task.description}</td>
            <td className="p-4 text-sm">{task.assignedTo?.name || task.assignedTo}</td>
            <td className="p-4 text-sm">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No Deadline"}</td>
            <td className="p-4">
              <span className={`px-4 py-2 rounded-full text-xs font-semibold ${task.status === 'pending' ? 'bg-yellow-200 text-yellow-700' : task.status === 'inProgress' ? 'bg-blue-200 text-blue-700' : 'bg-green-200 text-green-700'}`}>
                {task.status}
              </span>
            </td>
            {filter === "all" && (
              <td className="p-4 flex gap-3">
                <button className="bg-yellow-400 text-black px-4 py-2 rounded-md hover:bg-yellow-500 transition duration-300" onClick={() => handleEdit(task)}>Edit</button>
                <button className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-300" onClick={() => handleDelete(task._id)}>Delete</button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* Modal */}
  {showModal && (
    <TaskForm task={currentTask} onClose={() => setShowModal(false)} onSubmit={handleSubmit} />
  )}
</div>
  );
};

export default TaskList;