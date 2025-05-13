import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import { Link } from 'react-router-dom';

// Icons
import { AiOutlineTable, AiOutlineAppstore } from 'react-icons/ai';
import { MdOutlineAddBox } from 'react-icons/md';

// Components
import TasksTable from '../components/TasksTable';
import TasksCard from '../components/TasksCard';
import SearchBar from '../components/SearchBar';

const TasksHome = () => {
    // ----------------- State -----------------
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showType, setShowType] = useState('table');
    const [searchQuery, setSearchQuery] = useState('');

    // ----------------- Fetch Tasks -----------------
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                setLoading(true);
                console.log("Fetching tasks..."); // Debug log
                const response = await axios.get('http://localhost:4000/api/task');
                console.log("Tasks response:", response.data); // Debug log
                setTasks(response.data?.tasks || response.data?.data || []);
            } catch (err) {
                console.error('Error fetching tasks:', err.response?.data || err.message);
                setError(err.response?.data?.message || 'Failed to load tasks');
            } finally {
                setLoading(false);
            }
        };
    
        fetchTasks();
    }, []);

    // ----------------- Task Filters & Stats -----------------
    const filteredTasks = tasks.filter((task) =>
        task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const incompleteTasks = tasks.filter(task => !task.isCompleted).length;
    const overdueTasks = tasks.filter(task =>
        task.dueDate && new Date(task.dueDate) < new Date() && !task.isCompleted
    ).length;
    const completedTasks = tasks.filter(task => task.isCompleted).length;
    const urgentTasks = tasks.filter(task => task.priority === 'Urgent' && !task.isCompleted).length;

    const upcomingTasks = tasks.filter(task => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        return dueDate >= today && dueDate <= nextWeek && !task.isCompleted;
    });

    const tasksByCategory = tasks.reduce((acc, task) => {
        if (!task.category) return acc;
        acc[task.category] = (acc[task.category] || 0) + 1;
        return acc;
    }, {});

    // ----------------- Report Generator -----------------
    const generateReport = () => {
        if (tasks.length === 0) {
            alert('No tasks available to generate report');
            return;
        }

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // Header
        doc.setFontSize(12);
        doc.text(new Date().toLocaleDateString(), pageWidth - 40, 10);

        doc.setDrawColor(0);
        doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

        doc.setFontSize(22);
        doc.setFont(undefined, 'bold');
        const title = "Task Report";
        const titleWidth = doc.getTextWidth(title);
        doc.text(title, (pageWidth - titleWidth) / 2, 30);
        doc.line((pageWidth - titleWidth) / 2, 32, (pageWidth + titleWidth) / 2, 32);

        // Overview Section
        doc.setFontSize(16).text("Task Overview", pageWidth / 2, 50, { align: "center" });
        doc.line(25, 52, pageWidth - 25, 52);
        doc.setFontSize(12);
        const overviewData = [
            ['Total Tasks', tasks.length],
            ['Completed Tasks', completedTasks],
            ['Incomplete Tasks', incompleteTasks],
            ['Overdue Tasks', overdueTasks],
            ['Upcoming Tasks (7 days)', upcomingTasks.length]
        ];
        overviewData.forEach(([label, value], index) => {
            doc.text(label, 30, 65 + index * 10);
            doc.text(`${value}`, 130, 65 + index * 10);
        });
        doc.rect(25, 60, pageWidth - 50, 60); // table box

        // Progress Bar Section
        const progress = (completedTasks / tasks.length) * 100;
        doc.setFontSize(16).text("Progress Bar", pageWidth / 2, 130, { align: "center" });
        doc.line(25, 132, pageWidth - 25, 132);
        doc.setDrawColor(0).rect(20, 140, pageWidth - 40, 10);
        doc.setFillColor(0, 128, 0).rect(20, 140, (progress / 100) * (pageWidth - 40), 10, 'F');
        doc.text(`Task Completion: ${progress.toFixed(2)}%`, 20, 160);

        // Tasks by Category Section
        doc.setFontSize(16).text("Tasks by Category", pageWidth / 2, 180, { align: "center" });
        doc.line(25, 182, pageWidth - 25, 182);
        doc.setFontSize(12);
        let y = 195;
        Object.entries(tasksByCategory).forEach(([cat, count]) => {
            doc.text(cat, 30, y);
            doc.text(`${count} tasks`, 130, y);
            y += 10;
        });
        doc.rect(25, 190, pageWidth - 50, y - 190);

        doc.text(`Page 1 of 1`, pageWidth - 40, pageHeight - 10);
        doc.save('task_report.pdf');
    };

    // ----------------- UI Rendering -----------------
    if (loading) return <div className='h-screen flex justify-center items-center text-xl'>Loading tasks...</div>;
    if (error) return <div className='h-screen flex justify-center items-center text-xl text-red-500'>{error}</div>;

    return (
        <div className='bg-white p-4'>
            {/* Page Title */}
            <h1 className='text-4xl font-extrabold text-center font-serif mb-6'>Tasks Dashboard</h1>

            {/* Task Summary Links */}
            <div className='flex justify-between mb-6'>
                <Link to='/tasks/IncompleteTasks' className='flex-1 mx-2 text-center bg-purple-300 hover:bg-purple-400 p-3 rounded-lg shadow'>
                    Incomplete Tasks: {incompleteTasks}
                </Link>
                <Link to='/tasks/OverdueTasks' className='flex-1 mx-2 text-center bg-red-200 hover:bg-red-300 p-3 rounded-lg shadow'>
                    Overdue Tasks: {overdueTasks}
                </Link>
                <Link to='/tasks/UrgentTasks' className='flex-1 mx-2 text-center bg-yellow-200 hover:bg-yellow-300 p-3 rounded-lg shadow'>
                    Urgent Tasks: {urgentTasks}
                </Link>
            </div>

            {/* Search & Action Buttons */}
            <div className='flex justify-between items-center mb-6'>
                <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                <div className='flex gap-4'>
                    <Link to='/tasks/create' className='flex items-center bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-lg'>
                        <MdOutlineAddBox className='mr-2' /> Create Task
                    </Link>
                    <button onClick={generateReport} className='bg-green-700 hover:bg-green-500 text-white px-4 py-2 rounded-lg'>
                        Generate Report
                    </button>
                </div>
            </div>

            {/* View Toggle Buttons */}
            <div className='flex justify-center mb-4'>
                <button
                    onClick={() => setShowType('table')}
                    className={`px-4 py-2 border rounded-l ${showType === 'table' ? 'bg-green-500' : 'bg-gray-200'}`}
                >
                    <AiOutlineTable className='inline mr-2' />
                    Table View
                </button>
                <button
                    onClick={() => setShowType('card')}
                    className={`px-4 py-2 border rounded-r ${showType === 'card' ? 'bg-blue-400' : 'bg-gray-200'}`}
                >
                    <AiOutlineAppstore className='inline mr-2' />
                    Card View
                </button>
            </div>

            {/* Task View */}
            {filteredTasks.length > 0 ? (
                showType === 'table' ? (
                    <TasksTable tasks={filteredTasks} />
                ) : (
                    <TasksCard tasks={filteredTasks} />
                )
            ) : (
                <div className='text-center text-gray-500 text-lg py-10'>
                    {searchQuery ? 'No tasks match your search criteria' : 'No tasks available'}
                </div>
            )}
        </div>
    );
};

export default TasksHome;
