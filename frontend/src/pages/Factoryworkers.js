import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Factoryworkers() {
  const [workers, setWorkers] = useState([]);
  const [filteredWorkers, setFilteredWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    nic: "",
    age: "",
    jobStartDate: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/users");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch workers");
      }

      const workerUsers = data.filter((user) => user.jobPosition === "Factory Worker");
      console.log("Fetched workers:", workerUsers);
      setWorkers(workerUsers);
      setFilteredWorkers(workerUsers);
    } catch (err) {
      console.error("Error fetching workers:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === "") {
      setFilteredWorkers(workers);
    } else {
      const filtered = workers.filter(
        (worker) =>
          `${worker.firstName || ""} ${worker.lastName || ""}`
            .toLowerCase()
            .includes(query.toLowerCase()) ||
          (worker.email || "").toLowerCase().includes(query.toLowerCase()) ||
          (worker.nic || "").toLowerCase().includes(query.toLowerCase())
      );
      setFilteredWorkers(filtered);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:4000/api/users/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete worker");
      }

      fetchWorkers();
    } catch (err) {
      console.error("Error deleting worker:", err);
      setError(err.message);
    }
  };

  const handleEdit = (worker) => {
    setEditingId(worker._id);
    setEditFormData({
      firstName: worker.firstName || "",
      lastName: worker.lastName || "",
      email: worker.email || "",
      phoneNumber: worker.phoneNumber || "",
      nic: worker.nic || "",
      age: worker.age || "",
      jobStartDate: worker.jobStartDate ? worker.jobStartDate.split("T")[0] : "",
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/users/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) {
        throw new Error("Failed to update worker");
      }

      fetchWorkers();
      setEditingId(null);
    } catch (err) {
      console.error("Error updating worker:", err);
      setError(err.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const generateReport = () => {
    try {
      if (!filteredWorkers || filteredWorkers.length === 0) {
        console.warn("No workers available to generate a report.");
        alert("No workers available to generate a report.");
        return;
      }

      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Factory Workers Report", 14, 20);

      const headers = [["First Name", "Last Name", "Email", "Phone", "NIC", "Age", "Start Date"]];
      const data = filteredWorkers.map((worker) => {
        let formattedDate = "N/A";
        try {
          formattedDate = worker.jobStartDate
            ? new Date(worker.jobStartDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "N/A";
        } catch (e) {
          console.warn(`Invalid jobStartDate for worker:`, worker.jobStartDate);
        }
        return [
          worker.firstName || "N/A",
          worker.lastName || "N/A",
          worker.email || "N/A",
          worker.phoneNumber || "N/A",
          worker.nic || "N/A",
          worker.age || "N/A",
          formattedDate,
        ];
      });

      autoTable(doc, {
        head: headers,
        body: data,
        startY: 30,
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 3, textColor: [0, 0, 0] },
        headStyles: { fillColor: [0, 102, 204], textColor: [255, 255, 255] },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 25 },
          2: { cellWidth: 40 },
          3: { cellWidth: 30 },
          4: { cellWidth: 30 },
          5: { cellWidth: 15 },
          6: { cellWidth: 25 },
        },
      });

      doc.save("factory_workers_report.pdf");
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Failed to generate PDF: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
          <span className="text-lg font-medium text-gray-700">Loading workers...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg shadow-md">
          <p className="text-lg font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Factory Workers</h1>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search by name, email, or NIC..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <div className="flex space-x-4 w-full sm:w-auto">
            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            >
              Add New Worker
            </Link>
            <button
              onClick={generateReport}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            >
              Generate PDF Report
            </button>
          </div>
        </div>

        {filteredWorkers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-md">
            <p className="text-lg text-gray-500">
              {searchQuery ? "No workers match your search" : "No workers found"}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    {[
                      "Employee",
                      "Email",
                      "Phone",
                      "NIC",
                      "Age",
                      "Start Date",
                      "Actions",
                    ].map((header) => (
                      <th
                        key={header}
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredWorkers.map((worker) => (
                    <tr
                      key={worker._id}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      {editingId === worker._id ? (
                        <td className="px-6 py-4">
                          <div className="flex flex-col space-y-3">
                            <input
                              type="text"
                              name="firstName"
                              value={editFormData.firstName}
                              onChange={handleEditFormChange}
                              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                              placeholder="First Name"
                            />
                            <input
                              type="text"
                              name="lastName"
                              value={editFormData.lastName}
                              onChange={handleEditFormChange}
                              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                              placeholder="Last Name"
                            />
                          </div>
                        </td>
                      ) : (
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {worker.imageUrl ? (
                              <img
                                src={worker.imageUrl}
                                alt={`${worker.firstName || "Unknown"} ${
                                  worker.lastName || "Worker"
                                }`}
                                className="flex-shrink-0 h-12 w-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-500 text-lg font-medium">
                                  {worker.firstName?.charAt(0) || ""}
                                  {worker.lastName?.charAt(0) || ""}
                                </span>
                              </div>
                            )}
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {worker.firstName || "N/A"} {worker.lastName || "N/A"}
                              </div>
                            </div>
                          </div>
                        </td>
                      )}
                      {editingId === worker._id ? (
                        <>
                          <td className="px-6 py-4">
                            <input
                              type="email"
                              name="email"
                              value={editFormData.email}
                              onChange={handleEditFormChange}
                              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 w-full"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              name="phoneNumber"
                              value={editFormData.phoneNumber}
                              onChange={handleEditFormChange}
                              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 w-full"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              name="nic"
                              value={editFormData.nic}
                              onChange={handleEditFormChange}
                              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 w-full"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              name="age"
                              value={editFormData.age}
                              onChange={handleEditFormChange}
                              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 w-full"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="date"
                              name="jobStartDate"
                              value={editFormData.jobStartDate}
                              onChange={handleEditFormChange}
                              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 w-full"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={handleUpdate}
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-700 break-all">
                              {worker.email || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-700 break-all">
                              {worker.phoneNumber || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-700 break-all">
                              {worker.nic || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-700">{worker.age || "N/A"}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-700">
                              {worker.jobStartDate
                                ? new Date(worker.jobStartDate).toLocaleDateString()
                                : "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-3">
                              <button
                                onClick={() => handleEdit(worker)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(worker._id)}
                                className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors duration-200"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Factoryworkers;