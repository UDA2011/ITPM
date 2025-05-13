import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Factoryworkers() {
  const [workers, setWorkers] = useState([]);
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
    jobStartDate: ""
  });
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

      // Filter users with jobPosition "Factory Worker"
      const workerUsers = data.filter(user => user.jobPosition === "Factory Worker");
      setWorkers(workerUsers);
    } catch (err) {
      console.error("Error fetching workers:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:4000/api/users/${id}`, {
        method: "DELETE"
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete worker");
      }
      
      // Refresh the worker list after deletion
      fetchWorkers();
    } catch (err) {
      console.error("Error deleting worker:", err);
      setError(err.message);
    }
  };

  const handleEdit = (worker) => {
    setEditingId(worker._id);
    setEditFormData({
      firstName: worker.firstName,
      lastName: worker.lastName,
      email: worker.email,
      phoneNumber: worker.phoneNumber,
      nic: worker.nic,
      age: worker.age,
      jobStartDate: worker.jobStartDate.split('T')[0] // Format date for input
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
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

      // Refresh the worker list after update
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
        <Link 
          to="/register" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md whitespace-nowrap"
        >
          Add New Worker
        </Link>
      </div>

      {workers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No workers found</p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full w-full table-auto divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                  Employee
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                  Email
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                  Phone
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                  NIC
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                  Age
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                  Start Date
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {workers.map((worker) => (
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
                              alt={`${worker.firstName} ${worker.lastName}`}
                              className="flex-shrink-0 h-12 w-12 rounded-full"
                            />
                          ) : (
                            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 text-base font-medium">
                                {worker.firstName.charAt(0)}{worker.lastName.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 break-words">
                              {worker.firstName} {worker.lastName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 break-words">{worker.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 break-words">{worker.phoneNumber}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 break-words">{worker.nic}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{worker.age}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {new Date(worker.jobStartDate).toLocaleDateString()}
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