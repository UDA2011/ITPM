import React from "react";
import { Link } from "react-router-dom";

function SideMenu() {
  const localStorageData = JSON.parse(localStorage.getItem("user")) || {};

  return (
    <div className="h-full flex-col justify-between bg-white hidden lg:flex">
      <div className="px-4 py-6">
        <nav aria-label="Main Nav" className="mt-6 flex flex-col space-y-1">
          {/* Dashboard Link */}
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg hover:bg-gray-100 px-4 py-2 text-gray-700"
          >
            <img
              alt="dashboard-icon"
              src={require("../assets/dashboard-icon.png")}
            />
            <span className="text-sm font-medium">Dashboard</span>
          </Link>

          {/* Inventory Dropdown */}
          <details className="group [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700">
              <div className="flex items-center gap-2">
                <img
                  alt="inventory-icon"
                  src={require("../assets/inventory-icon.png")}
                />
                <span className="text-sm font-medium">Inventory</span>
              </div>
            </summary>
            <div className="ml-6 mt-2 space-y-2">
              <Link
                to="/inventory"
                className="block rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              >
                Raw Materials
              </Link>
              <Link
                to="/EndProducts"  // Changed to match your exact route from App.js
                className="block rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              >
                End Products
              </Link>
            </div>
          </details>

          {/* Supplier Link */}
          <Link
            to="/supplies"
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            <img
              alt="supplier-icon"
              src={require("../assets/icons8-supplies-48.png")}
            />
            <span className="text-sm font-medium">Supplier</span>
          </Link>

          {/* Employee Dropdown */}
          <details className="group [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700">
              <div className="flex items-center gap-2">
                <img
                  alt="employee-icon"
                  src={require("../assets/icons8-employee-48.png")}
                />
                <span className="text-sm font-medium">Employee</span>
              </div>
            </summary>
            <div className="ml-6 mt-2 space-y-2">
              <Link
                to="/Employee/Managers"
                className="block rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              >
                Managers
              </Link>
              <Link
                to="/Employee/Factoryworkers"
                className="block rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              >
                Factory Workers
              </Link>
            </div>
          </details>

          {/* Task Link */}
          <Link
            to="/task"
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            <img
              alt="task-icon"
              src={require("../assets/task-icon.png")}
              style={{ width: '24px', height: '24px' }}
            />
            <span className="text-sm font-medium">Task</span>
          </Link>
        </nav>
      </div>

      {/* User Profile Section */}
      {localStorageData && localStorageData.imageUrl && (
        <div className="sticky inset-x-0 bottom-0 border-t border-gray-100">
          <div className="flex items-center gap-2 bg-white p-4 hover:bg-gray-50">
            <img
              alt="Profile"
              src={localStorageData.imageUrl}
              className="h-10 w-10 rounded-full object-cover"
            />
            <div>
              <p className="text-xs">
                <strong className="block font-medium">
                  {localStorageData.firstName} {localStorageData.lastName}
                </strong>
                <span>{localStorageData.email}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SideMenu;