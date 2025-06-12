import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

// Define priority and category colors
const priorityButtonColors = {
  Low: 'bg-green-100 text-green-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  High: 'bg-orange-100 text-orange-800',
  Urgent: 'bg-red-100 text-red-800',
};

const categoryColors = {
  Orders: 'bg-blue-100 text-blue-800',
  Stocks: 'bg-purple-100 text-purple-800',
  'Livestock Health': 'bg-teal-100 text-teal-800',
  Products: 'bg-yellow-100 text-yellow-800',
  Employees: 'bg-pink-100 text-pink-800',
  Maintenance: 'bg-gray-100 text-gray-800',
  Plantation: 'bg-green-100 text-green-800',
};

const ShowTask = () => {
  const [task, setTask] = useState({});
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    const fetchTaskAndEmployee = async () => {
      setLoading(true);
      try {
        // Fetch the task
        const taskResponse = await axios.get(`http://localhost:4000/api/task/${id}`);
        setTask(taskResponse.data);

        // Fetch all employees, and find the one assigned to this task
        const employeeResponse = await axios.get('http://localhost:5000/employees');
        if (Array.isArray(employeeResponse.data.employees)) {
          const assignedEmployee = employeeResponse.data.employees.find(emp => emp._id === taskResponse.data.assignedEmployee);
          setEmployee(assignedEmployee || null);
        } else {
          console.error('Unexpected response format:', employeeResponse.data);
        }
      } catch (error) {
        console.error("Fetch error:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTaskAndEmployee();
  }, [id]);

  const priorityClass = priorityButtonColors[task.priority] || 'bg-gray-100 text-gray-800';
  const categoryClass = categoryColors[task.category] || 'bg-gray-100 text-gray-800';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-green-300 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 transform transition-all duration-300 hover:shadow-2xl">
        <h1 className="text-3xl font-bold text-center text-green-800 mb-6 font-sans">Task Details</h1>

        {loading ? (
          <p className="text-center text-lg font-medium text-gray-600">Loading...</p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 items-center gap-x-2">
              <span className="text-sm font-medium text-gray-700">Task No:</span>
              <span className="text-base text-gray-900">{task.taskNo || 'N/A'}</span>
            </div>

            <div className="grid grid-cols-2 items-center gap-x-2">
              <span className="text-sm font-medium text-gray-700">Title:</span>
              <span className="text-base text-gray-900">{task.title || 'N/A'}</span>
            </div>

            <div className="grid grid-cols-2 items-start gap-x-2">
              <span className="text-sm font-medium text-gray-700 pt-1">Description:</span>
              <span className="text-base text-gray-900 break-words">{task.description || 'N/A'}</span>
            </div>

            <div className="grid grid-cols-2 items-center gap-x-2">
              <span className="text-sm font-medium text-gray-700">Due Date:</span>
              <span className="text-base text-gray-900">
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
              </span>
            </div>

            <div className="grid grid-cols-2 items-center gap-x-2">
              <span className="text-sm font-medium text-gray-700">Category:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryClass}`}>
                {task.category || 'N/A'}
              </span>
            </div>

            <div className="grid grid-cols-2 items-center gap-x-2">
              <span className="text-sm font-medium text-gray-700">Tags:</span>
              <span className="text-base text-gray-900">
                {Array.isArray(task.tags) && task.tags.length > 0 ? task.tags.join(', ') : 'No tags'}
              </span>
            </div>

            <div className="grid grid-cols-2 items-center gap-x-2">
              <span className="text-sm font-medium text-gray-700">Priority:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityClass}`}>
                {task.priority || 'N/A'}
              </span>
            </div>

            <div className="grid grid-cols-2 items-center gap-x-2">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <span className="text-base text-gray-900">
                {task.isCompleted ? 'Completed' : 'Incomplete'}
              </span>
            </div>

            <div className="grid grid-cols-2 items-center gap-x-2">
              <span className="text-sm font-medium text-gray-700">Created At:</span>
              <span className="text-base text-gray-900">
                {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>

            {employee && (
              <div className="grid grid-cols-2 items-center gap-x-2">
                <span className="text-sm font-medium text-gray-700">Assigned Employee:</span>
                <span className="text-base text-gray-900">
                  {employee.name || 'N/A'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowTask;