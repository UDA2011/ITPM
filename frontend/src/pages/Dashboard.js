import React, { useContext, useEffect, useState } from "react";
import Chart from "react-apexcharts";
import AuthContext from "../AuthContext";
import axios from 'axios';
import { FiAlertTriangle, FiCalendar, FiCheckCircle, FiClock, FiPieChart } from "react-icons/fi";

function Dashboard() {
  const [categoryChartData, setCategoryChartData] = useState({
    options: {
      labels: [],
      chart: {
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
        },
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: { width: 200 },
          legend: { position: 'bottom' },
        },
      }],
      title: {
        text: "Products by Category",
        align: 'center',
        style: {
          fontSize: '18px',
          fontWeight: '700',
          fontFamily: 'Inter, sans-serif',
          color: '#1f2937',
        },
      },
      legend: {
        position: 'bottom',
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif',
      },
      tooltip: {
        y: {
          formatter: (value) => `${value} units`,
        },
        style: {
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif',
        },
      },
      plotOptions: {
        pie: {
          donut: {
            size: '65%',
          },
        },
      },
    },
    series: [],
  });

  const [productChartData, setProductChartData] = useState({
    options: {
      labels: [],
      chart: {
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
        },
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: { width: 200 },
          legend: { position: 'bottom' },
        },
      }],
      title: {
        text: "Top Products by Quantity",
        align: 'center',
        style: {
          fontSize: '18px',
          fontWeight: '700',
          fontFamily: 'Inter, sans-serif',
          color: '#1f2937',
        },
      },
      legend: {
        position: 'bottom',
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif',
      },
      dataLabels: {
        enabled: true,
        formatter: (val, { seriesIndex, w }) => `${w.config.series[seriesIndex]} units`,
        style: {
          fontSize: '12px',
          fontWeight: '600',
          fontFamily: 'Inter, sans-serif',
        },
      },
      tooltip: {
        y: {
          formatter: (value) => `${value} units`,
        },
        style: {
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif',
        },
      },
    },
    series: [],
  });

  const [tasks, setTasks] = useState([]);
  const [taskStats, setTaskStats] = useState({
    incomplete: 0,
    overdue: 0,
    urgent: 0,
    upcoming: 0,
  });
  const [loading, setLoading] = useState(true);
  const authContext = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchEndProductsData(), fetchTasksData()]);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const fetchTasksData = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/task');
      const tasksData = response.data?.tasks || response.data?.data || [];
      setTasks(tasksData);
      
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      const stats = {
        incomplete: tasksData.filter(task => !task.isCompleted).length,
        overdue: tasksData.filter(task => 
          task.dueDate && new Date(task.dueDate) < today && !task.isCompleted
        ).length,
        urgent: tasksData.filter(task => 
          task.priority === 'Urgent' && !task.isCompleted
        ).length,
        upcoming: tasksData.filter(task => {
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          return dueDate >= today && dueDate <= nextWeek && !task.isCompleted;
        }).length,
      };
      
      setTaskStats(stats);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const fetchEndProductsData = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/endproducts');
      prepareEndProductChartsData(response.data);
    } catch (err) {
      console.error('Error fetching end products:', err);
    }
  };

  const prepareEndProductChartsData = (endProducts) => {
    const categoryMap = {};
    const productMap = {};
    
    endProducts.forEach(product => {
      if (categoryMap[product.category]) {
        categoryMap[product.category] += product.quantity;
      } else {
        categoryMap[product.category] = product.quantity;
      }
      
      productMap[product.name] = product.quantity;
    });
    
    const sortedProducts = Object.entries(productMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    const productNames = sortedProducts.map(item => item[0]);
    const productQuantities = sortedProducts.map(item => item[1]);
    
    const categories = Object.keys(categoryMap);
    const categoryQuantities = Object.values(categoryMap);
    
    setCategoryChartData(prev => ({
      options: {
        ...prev.options,
        labels: categories,
        colors: generatePastelColors(categories.length),
      },
      series: categoryQuantities,
    }));
    
    setProductChartData(prev => ({
      options: {
        ...prev.options,
        labels: productNames,
        colors: generateVibrantColors(productNames.length),
      },
      series: productQuantities,
    }));
  };

  const generatePastelColors = (count) => {
    const colors = [];
    for (let i = 0; i < count; i++) {
      const hue = Math.floor(i * (360 / count));
      colors.push(`hsl(${hue}, 80%, 75%)`);
    }
    return colors;
  };

  const generateVibrantColors = (count) => {
    const colors = [];
    for (let i = 0; i < count; i++) {
      const hue = Math.floor(i * (360 / count));
      colors.push(`hsl(${hue}, 65%, 55%)`);
    }
    return colors;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <FiPieChart className="h-8 w-8 text-indigo-500 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-8 lg:p-10">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 animate-fadeIn">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="mt-2 text-gray-600 text-lg">Welcome back! Here's your business at a glance.</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard
            title="Incomplete Tasks"
            value={taskStats.incomplete}
            icon={<FiClock className="w-7 h-7" />}
            color="bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-600"
            trend="This Week"
          />
          <StatCard
            title="Overdue Tasks"
            value={taskStats.overdue}
            icon={<FiAlertTriangle className="w-7 h-7" />}
            color="bg-gradient-to-br from-rose-100 to-rose-200 text-rose-600"
            trend="This Week"
          />
          <StatCard
            title="Urgent Tasks"
            value={taskStats.urgent}
            icon={<FiAlertTriangle className="w-7 h-7" />}
            color="bg-gradient-to-br from-amber-100 to-amber-200 text-amber-600"
            trend="This Week"
          />
          <StatCard
            title="Upcoming Tasks"
            value={taskStats.upcoming}
            icon={<FiCalendar className="w-7 h-7" />}
            color="bg-gradient-to-br from-teal-100 to-teal-200 text-teal-600"
            trend="This Week"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-10 animate-fadeIn">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <FiPieChart className="mr-2 h-6 w-6 text-indigo-500" /> Product Analytics
            </h2>
            <div className="flex space-x-3">
              <button className="px-4 py-2 text-sm bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors">
                This Month
              </button>
              <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                All Time
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
              <Chart
                options={categoryChartData.options}
                series={categoryChartData.series}
                type="donut"
                width="100%"
                height="400"
              />
            </div>
            <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
              <Chart
                options={productChartData.options}
                series={productChartData.series}
                type="pie"
                width="100%"
                height="400"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 animate-fadeIn">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <FiCheckCircle className="mr-2 h-6 w-6 text-indigo-500" /> Recent Tasks
            </h2>
            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
              View All
            </button>
          </div>

          {tasks.slice(0, 5).map(task => (
            <TaskItem key={task._id} task={task} />
          ))}
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ title, value, icon, color, trend }) => (
  <div className={`relative bg-white rounded-2xl shadow-lg p-6 card-hover overflow-hidden ${color}`}>
    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50" />
    <div className="relative flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="mt-2 text-4xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`inline-flex items-center justify-center rounded-xl w-14 h-14 ${color}`}>
        {icon}
      </div>
    </div>
    <div className="mt-4">
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/50 text-gray-800`}>
        {trend}
      </span>
    </div>
  </div>
);

const TaskItem = ({ task }) => {
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate && dueDate < new Date() && !task.isCompleted;

  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors rounded-lg px-3">
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={task.isCompleted}
          readOnly
          className="h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 transition-transform duration-200 ease-in-out"
        />
        <div className="ml-4">
          <p className={`text-sm font-medium ${task.isCompleted ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
            {task.title}
          </p>
          {dueDate && (
            <p className={`text-xs ${isOverdue ? 'text-rose-500' : 'text-gray-500'}`}>
              Due: {dueDate.toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
      <span
        className={`px-3 py-1 text-xs font-medium rounded-full ${
          task.priority === 'Urgent'
            ? 'bg-rose-100 text-rose-800'
            : task.priority === 'High'
            ? 'bg-amber-100 text-amber-800'
            : 'bg-teal-100 text-teal-800'
        }`}
      >
        {task.priority || 'Normal'}
      </span>
    </div>
  );
};

export default Dashboard;