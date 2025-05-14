import React from "react";
import { Link, useLocation } from "react-router-dom";

function SideMenu() {
  const localStorageData = JSON.parse(localStorage.getItem("user")) || {};
  const location = useLocation(); // To track the active route

  return (
    <div className="h-full flex-col justify-between bg-gradient-to-b from-blue-50 to-white shadow-lg hidden lg:flex w-64">
      <div className="px-4 py-6">
        <nav aria-label="Main Nav" className="mt-6 flex flex-col space-y-2">
          {/* Dashboard Link */}
          <Link
            to="/"
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-gray-700 transition-all duration-300 ${
              location.pathname === "/"
                ? "bg-blue-100 text-blue-600 font-semibold"
                : "hover:bg-blue-100 hover:text-blue-600"
            }`}
          >
            <img
              alt="dashboard-icon"
              src={require("../assets/dashboard-icon.png")}
              className="h-10 w-10 transform group-hover:scale-110 transition-transform"
            />
            <span className="text-sm font-medium">Dashboard</span>
          </Link>

          {/* Inventory Dropdown */}
          <details className="group [&_summary::-webkit-details-marker]:hidden">
            <summary
              className={`flex cursor-pointer items-center justify-between rounded-lg px-4 py-3 text-gray-600 transition-all duration-300 ${
                location.pathname.includes("/inventory") || location.pathname.includes("/EndProducts")
                  ? "bg-blue-100 text-blue-600 font-semibold"
                  : "hover:bg-blue-100 hover:text-blue-600"
              }`}
            >
              <div className="flex items-center gap-3">
                <img
                  alt="inventory-icon"
                  src={require("../assets/inventory-icon.png")}
                  className="h-10 w-10 transform group-hover:scale-110 transition-transform"
                />
                <span className="text-sm font-medium">Inventory</span>
              </div>
              <svg
                className="h-5 w-5 text-gray-500 group-open:rotate-90 transition-transform"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </summary>
            <div className="ml-8 mt-2 space-y-1 animate-slide-down">
              <Link
                to="/inventory"
                className={`block rounded-lg px-4 py-2 text-sm text-gray-600 transition-all duration-300 ${
                  location.pathname === "/inventory"
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                Raw Materials
              </Link>
              <Link
                to="/EndProducts"
                className={`block rounded-lg px-4 py-2 text-sm text-gray-600 transition-all duration-300 ${
                  location.pathname === "/EndProducts"
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                End Products
              </Link>
            </div>
          </details>

          {/* Supplier Link */}
          <Link
            to="/supplies"
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-gray-700 transition-all duration-300 ${
              location.pathname === "/supplies"
                ? "bg-blue-100 text-blue-600 font-semibold"
                : "hover:bg-blue-100 hover:text-blue-600"
            }`}
          >
            <img
              alt="supplier-icon"
              src={require("../assets/icons8-supplies-48.png")}
              className="h-10 w-10 transform group-hover:scale-110 transition-transform"
            />
            <span className="text-sm font-medium">Supplier</span>
          </Link>

          {/* Employee Dropdown */}
          <details className="group [&_summary::-webkit-details-marker]:hidden">
            <summary
              className={`flex cursor-pointer items-center justify-between rounded-lg px-4 py-3 text-gray-600 transition-all duration-300 ${
                location.pathname.includes("/Employee")
                  ? "bg-blue-100 text-blue-600 font-semibold"
                  : "hover:bg-blue-100 hover:text-blue-600"
              }`}
            >
              <div className="flex items-center gap-3">
                <img
                  alt="employee-icon"
                  src={require("../assets/icons8-employee-48.png")}
                  className="h-10 w-10 transform group-hover:scale-110 transition-transform"
                />
                <span className="text-sm font-medium">Employee</span>
              </div>
              <svg
                className="h-5 w-5 text-gray-500 group-open:rotate-90 transition-transform"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </summary>
            <div className="ml-8 mt-2 space-y-1 animate-slide-down">
              <Link
                to="/Employee/Managers"
                className={`block rounded-lg px-4 py-2 text-sm text-gray-600 transition-all duration-300 ${
                  location.pathname === "/Employee/Managers"
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                Managers
              </Link>
              <Link
                to="/Employee/Factoryworkers"
                className={`block rounded-lg px-4 py-2 text-sm text-gray-600 transition-all duration-300 ${
                  location.pathname === "/Employee/Factoryworkers"
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                Factory Workers
              </Link>
            </div>
          </details>

          {/* Task Link */}
          <Link
            to="/taskhome"
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-gray-700 transition-all duration-300 ${
              location.pathname === "/taskhome"
                ? "bg-blue-100 text-blue-600 font-semibold"
                : "hover:bg-blue-100 hover:text-blue-600"
            }`}
          >
            <img
              alt="task-icon"
              src={require("../assets/task-icon.png")}
              className="h-10 w-10 transform group-hover:scale-110 transition-transform"
            />
            <span className="text-sm font-medium">Task</span>
          </Link>
        </nav>
      </div>

      {/* User Profile Section */}
      {localStorageData && localStorageData.imageUrl && (
        <div className="sticky inset-x-0 bottom-0 border-t border-gray-200 bg-white">
          <div className="flex items-center gap-3 p-4 hover:bg-blue-50 transition-all duration-300 rounded-lg mx-4 mb-4 shadow-sm">
            <img
              alt="Profile"
              src={localStorageData.imageUrl}
              className="h-12 w-12 rounded-full object-cover border-2 border-blue-200"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">
                {localStorageData.firstName} {localStorageData.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">{localStorageData.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SideMenu;