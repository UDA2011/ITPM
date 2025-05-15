import React, { useContext, useEffect, useState } from "react";
import Chart from "react-apexcharts";
import AuthContext from "../AuthContext";
import axios from 'axios';

function Dashboard() {
  const [categoryChartData, setCategoryChartData] = useState({
    options: {
      labels: [],
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 200
          },
          legend: {
            position: 'bottom'
          }
        }
      }],
      title: {
        text: "End Products by Category",
        align: 'center'
      }
    },
    series: []
  });

  const [productChartData, setProductChartData] = useState({
    options: {
      labels: [],
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 200
          },
          legend: {
            position: 'bottom'
          }
        }
      }],
      title: {
        text: "End Products by Quantity",
        align: 'center'
      },
      dataLabels: {
        enabled: true,
        formatter: function (val, { seriesIndex, w }) {
          return w.config.series[seriesIndex];
        }
      }
    },
    series: []
  });

  const [tasks, setTasks] = useState([]);
  const [taskStats, setTaskStats] = useState({
    incomplete: 0,
    overdue: 0,
    urgent: 0,
    upcoming: 0
  });

  const authContext = useContext(AuthContext);

  useEffect(() => {
    fetchEndProductsData();
    fetchTasksData();
  }, []);

  // Fetch tasks data
  const fetchTasksData = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/task');
      const tasksData = response.data?.tasks || response.data?.data || [];
      setTasks(tasksData);
      
      // Calculate task statistics
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
        }).length
      };
      
      setTaskStats(stats);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  // Fetch end products data for the pie charts
  const fetchEndProductsData = () => {
    fetch(`http://localhost:4000/api/endproducts`)
      .then((response) => response.json())
      .then(data => {
        prepareEndProductChartsData(data);
      })
      .catch(err => console.log(err));
  };

  // Prepare data for both pie charts
  const prepareEndProductChartsData = (endProducts) => {
    // Prepare data for category pie chart
    const categoryMap = {};
    const productMap = {};
    
    endProducts.forEach(product => {
      // For category chart
      if (categoryMap[product.category]) {
        categoryMap[product.category] += product.quantity;
      } else {
        categoryMap[product.category] = product.quantity;
      }
      
      // For product chart (top 10 products by quantity)
      productMap[product.name] = product.quantity;
    });
    
    // Sort products by quantity (descending) and take top 10
    const sortedProducts = Object.entries(productMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    const productNames = sortedProducts.map(item => item[0]);
    const productQuantities = sortedProducts.map(item => item[1]);
    
    const categories = Object.keys(categoryMap);
    const categoryQuantities = Object.values(categoryMap);
    
    setCategoryChartData({
      options: {
        ...categoryChartData.options,
        labels: categories,
        colors: [
          '#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0',
          '#546E7A', '#26a69a', '#D10CE8', '#FF9F43', '#00D9E9'
        ].slice(0, categories.length)
      },
      series: categoryQuantities
    });
    
    setProductChartData({
      options: {
        ...productChartData.options,
        labels: productNames,
        colors: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
          '#FF9F40', '#8AC24A', '#FF5722', '#607D8B', '#9C27B0'
        ].slice(0, productNames.length)
      },
      series: productQuantities
    });
  };

  return (
    <>
      <div className="grid grid-cols-1 col-span-12 lg:col-span-10 gap-6 md:grid-cols-4 lg:grid-cols-4 p-4">
        {/* Task Statistics Cards */}
        <article className="flex flex-col gap-4 rounded-lg border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="inline-flex gap-2 self-end rounded bg-purple-100 p-1 text-purple-600">
            <span className="text-xs font-medium">This Week</span>
          </div>
          <div>
            <strong className="block text-sm font-medium text-gray-500">
              Incomplete Tasks
            </strong>
            <p>
              <span className="text-2xl font-medium text-gray-900">
                {taskStats.incomplete}
              </span>
            </p>
          </div>
        </article>
        
        <article className="flex flex-col gap-4 rounded-lg border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="inline-flex gap-2 self-end rounded bg-red-100 p-1 text-red-600">
            <span className="text-xs font-medium">This Week</span>
          </div>
          <div>
            <strong className="block text-sm font-medium text-gray-500">
              Overdue Tasks
            </strong>
            <p>
              <span className="text-2xl font-medium text-gray-900">
                {taskStats.overdue}
              </span>
            </p>
          </div>
        </article>
        
        <article className="flex flex-col gap-4 rounded-lg border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="inline-flex gap-2 self-end rounded bg-yellow-100 p-1 text-yellow-600">
            <span className="text-xs font-medium">This Week</span>
          </div>
          <div>
            <strong className="block text-sm font-medium text-gray-500">
              Urgent Tasks
            </strong>
            <p>
              <span className="text-2xl font-medium text-gray-900">
                {taskStats.urgent}
              </span>
            </p>
          </div>
        </article>
        
        <article className="flex flex-col gap-4 rounded-lg border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="inline-flex gap-2 self-end rounded bg-blue-100 p-1 text-blue-600">
            <span className="text-xs font-medium">This Week</span>
          </div>
          <div>
            <strong className="block text-sm font-medium text-gray-500">
              Upcoming Tasks
            </strong>
            <p>
              <span className="text-2xl font-medium text-gray-900">
                {taskStats.upcoming}
              </span>
            </p>
          </div>
        </article>
        
        {/* Chart Section */}
        <div className="flex flex-col md:flex-row justify-around bg-white rounded-lg py-8 col-span-full gap-8">
          <div className="flex-1">
            <Chart
              options={categoryChartData.options}
              series={categoryChartData.series}
              type="pie"
              width="100%"
              height="400"
            />
          </div>
          
          <div className="flex-1">
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
    </>
  );
}

export default Dashboard;