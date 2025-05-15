import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Explicit import

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
          `${worker.firstName || ""} ${worker.lastName || ""}`.toLowerCase().includes(query.toLowerCase()) ||
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
      console.log("Attempting to generate PDF with workers:", filteredWorkers);
      if (!filteredWorkers || filteredWorkers.length === 0) {
        console.warn("No workers available to generate a report.");
        alert("No workers available to generate a report.");
        return;
      }

      const doc = new jsPDF();
      console.log("jsPDF initialized successfully");

      // Explicitly apply the autoTable plugin
      autoTable(doc, {
        // Empty call to ensure plugin is registered
      });

      if (!doc.autoTable) {
        throw new Error("autoTable plugin is not loaded correctly.");
      }

      doc.setFontSize(18);
      doc.text("Factory Workers Report", 14, 20);

      const headers = [["First Name", "Last Name", "Email", "Phone", "NIC", "Age", "Start Date"]];
      const data = filteredWorkers.map((worker, index) => {
        console.log(`Processing worker ${index + 1}:`, worker);
        return [
          worker.firstName || "",
          worker.lastName || "",
          worker.email || "",
          worker.phoneNumber || "",
          worker.nic || "",
          worker.age || "",
          worker.jobStartDate ? new Date(worker.jobStartDate).toLocaleDateString() : "",
        ];
      });

      console.log("Table data prepared:", data);

      doc.autoTable({
        head: headers,
        body: data,
        startY: 30,
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 2 },
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

      console.log("Table added to PDF, saving...");
      doc.save("factory_workers_report.pdf");
    } catch (err) {
      console.error("Error generating PDF:", err.message, err.stack);
      alert("Failed to generate PDF: " + err.message);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading workers...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Factory Workers</h1>
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search by name, email, or NIC..."
            className="border rounded px-3 py-2 text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Link
            to="/register"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md whitespace-nowrap"
          >
            Add New Worker
          </Link>
          <button
            onClick={generateReport}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md whitespace-nowrap"
          >
            Generate PDF Report
          </button>
        </div>
      </div>

      {filteredWorkers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">{searchQuery ? "No workers match your search" : "No workers found"}</p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full w-full table-auto divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]"
                >
                  Employee
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]"
                >
                  Phone
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]"
                >
                  NIC
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]"
                >
                  Age
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]"
                >
                  Start Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredWorkers.map((worker) => (
                <tr key={worker._id} className="hover:bg-gray-50">
                  {editingId === worker._id ? (
                    <>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-2">
                          <input
                            type="text"
                            name="firstName"
                            value={editFormData.firstName}
                            onChange={handleEditFormChange}
                            className="border rounded px-3 py-2 text-sm w-full"
                            placeholder="First Name"
                          />
                          <input
                            type="text"
                            name="lastName"
                            value={editFormData.lastName}
                            onChange={handleEditFormChange}
                            className="border rounded px-3 py-2 text-sm w-full"
                            placeholder="Last Name"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="email"
                          name="email"
                          value={editFormData.email}
                          onChange={handleEditFormChange}
                          className="border rounded px-3 py-2 text-sm w-full"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          name="phoneNumber"
                          value={editFormData.phoneNumber}
                          onChange={handleEditFormChange}
                          className="border rounded px-3 py-2 text-sm w-full"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          name="nic"
                          value={editFormData.nic}
                          onChange={handleEditFormChange}
                          className="border rounded px-3 py-2 text-sm w-full"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          name="age"
                          value={editFormData.age}
                          onChange={handleEditFormChange}
                          className="border rounded px-3 py-2 text-sm w-full"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="date"
                          name="jobStartDate"
                          value={editFormData.jobStartDate}
                          onChange={handleEditFormChange}
                          className="border rounded px-3 py-2 text-sm w-full"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={handleUpdate}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {worker.imageUrl ? (
                            <img
                              src={worker.imageUrl}
                              alt={`${worker.firstName || "Unknown"} ${worker.lastName || "Worker"}`}
                              className="flex-shrink-0 h-12 w-12 rounded-full"
                            />
                          ) : (
                            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 text-base font-medium">
                                {worker.firstName?.charAt(0) || ""}{worker.lastName?.charAt(0) || ""}
                              </span>
                            </div>
                          )}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 break-words">
                              {worker.firstName || "N/A"} {worker.lastName || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 break-words">{worker.email || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 break-words">{worker.phoneNumber || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 break-words">{worker.nic || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{worker.age || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {worker.jobStartDate ? new Date(worker.jobStartDate).toLocaleDateString() : "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 space-x-2">
                        <button
                          onClick={() => handleEdit(worker)}
                          className="text-yellow-600 hover:text-yellow-900 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(worker._id)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Factoryworkers;