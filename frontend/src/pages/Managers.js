import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Explicit import

function Managers() {
  const [managers, setManagers] = useState([]);
  const [filteredManagers, setFilteredManagers] = useState([]);
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
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/users");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch managers");
      }

      const managerUsers = data.filter((user) => user.jobPosition === "Manager");
      console.log("Fetched managers:", managerUsers);
      setManagers(managerUsers);
      setFilteredManagers(managerUsers);
    } catch (err) {
      console.error("Error fetching managers:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === "") {
      setFilteredManagers(managers);
    } else {
      const filtered = managers.filter(
        (manager) =>
          `${manager.firstName || ""} ${manager.lastName || ""}`.toLowerCase().includes(query.toLowerCase()) ||
          (manager.email || "").toLowerCase().includes(query.toLowerCase()) ||
          (manager.nic || "").toLowerCase().includes(query.toLowerCase())
      );
      setFilteredManagers(filtered);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:4000/api/users/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete manager");
      }

      fetchManagers();
    } catch (err) {
      console.error("Error deleting manager:", err);
      setError(err.message);
    }
  };

  const handleEdit = (manager) => {
    setEditingId(manager._id);
    setEditFormData({
      firstName: manager.firstName || "",
      lastName: manager.lastName || "",
      email: manager.email || "",
      phoneNumber: manager.phoneNumber || "",
      nic: manager.nic || "",
      age: manager.age || "",
      jobStartDate: manager.jobStartDate ? manager.jobStartDate.split("T")[0] : "",
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
        throw new Error("Failed to update manager");
      }

      fetchManagers();
      setEditingId(null);
    } catch (err) {
      console.error("Error updating manager:", err);
      setError(err.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const generateReport = () => {
    try {
      console.log("Attempting to generate PDF with managers:", filteredManagers);
      if (!filteredManagers || filteredManagers.length === 0) {
        console.warn("No managers available to generate a report.");
        alert("No managers available to generate a report.");
        return;
      }

      const doc = new jsPDF();
      console.log("jsPDF initialized successfully");

      // Explicitly apply the autoTable plugin
      console.log("Applying autoTable plugin");
      autoTable(doc);

      if (!doc.autoTable) {
        console.warn("autoTable plugin not loaded, falling back to basic PDF");
        doc.setFontSize(18);
        doc.text("Managers Report (Fallback)", 14, 20);
        let yPosition = 30;
        filteredManagers.forEach((manager, index) => {
          doc.text(
            `${index + 1}. ${manager.firstName || "N/A"} ${manager.lastName || "N/A"} - ${
              manager.email || "N/A"
            }`,
            14,
            yPosition
          );
          yPosition += 10;
        });
        doc.save("managers_fallback.pdf");
        alert("Generated fallback PDF due to autoTable issue.");
        return;
      }

      doc.setFontSize(18);
      doc.text("Managers Report", 14, 20);

      const headers = [["First Name", "Last Name", "Email", "Phone", "NIC", "Age", "Start Date"]];
      const data = filteredManagers.map((manager, index) => {
        console.log(`Processing manager ${index + 1}:`, manager);
        // Validate jobStartDate to prevent invalid date errors
        let formattedDate = "";
        try {
          formattedDate = manager.jobStartDate
            ? new Date(manager.jobStartDate).toLocaleDateString()
            : "";
        } catch (e) {
          console.warn(`Invalid jobStartDate for manager ${index + 1}:`, manager.jobStartDate);
          formattedDate = "N/A";
        }
        return [
          manager.firstName || "",
          manager.lastName || "",
          manager.email || "",
          manager.phoneNumber || "",
          manager.nic || "",
          manager.age || "",
          formattedDate,
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
      doc.save("managers_report.pdf");
    } catch (err) {
      console.error("Error generating PDF:", err.message, err.stack);
      alert("Failed to generate PDF: " + err.message);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading managers...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Managers</h1>
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
            Add New Manager
          </Link>
          <button
            onClick={generateReport}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md whitespace-nowrap"
          >
            Generate PDF Report
          </button>
        </div>
      </div>

      {filteredManagers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">{searchQuery ? "No managers match your search" : "No managers found"}</p>
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
              {filteredManagers.map((manager) => (
                <tr key={manager._id} className="hover:bg-gray-50">
                  {editingId === manager._id ? (
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
                          {manager.imageUrl ? (
                            <img
                              src={manager.imageUrl}
                              alt={`${manager.firstName || "Unknown"} ${manager.lastName || "Manager"}`}
                              className="flex-shrink-0 h-12 w-12 rounded-full"
                            />
                          ) : (
                            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 text-base font-medium">
                                {manager.firstName?.charAt(0) || ""}{manager.lastName?.charAt(0) || ""}
                              </span>
                            </div>
                          )}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 break-words">
                              {manager.firstName || "N/A"} {manager.lastName || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 break-words">{manager.email || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 break-words">{manager.phoneNumber || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 break-words">{manager.nic || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{manager.age || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {manager.jobStartDate ? new Date(manager.jobStartDate).toLocaleDateString() : "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 space-x-2">
                        <button
                          onClick={() => handleEdit(manager)}
                          className="text-yellow-600 hover:text-yellow-900 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(manager._id)}
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

export default Managers;