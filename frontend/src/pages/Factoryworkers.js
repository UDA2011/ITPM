import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Factoryworkers() {
  const [employees, setEmployees] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    firstName: "",
    lastName: "",
    jobPosition: "",
    phoneNumber: "",
    jobStartDate: ""
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  const fetchEmployeeData = () => {
    const storedEmployees = JSON.parse(localStorage.getItem("employees")) || [];
    setEmployees(storedEmployees);
  };

  const handleDelete = (id) => {
    const updatedEmployees = employees.filter((employee, index) => index !== id);
    setEmployees(updatedEmployees);
    localStorage.setItem("employees", JSON.stringify(updatedEmployees));
  };

  const handleEdit = (employee, index) => {
    setEditingId(index);
    setEditFormData({
      firstName: employee.firstName,
      lastName: employee.lastName,
      jobPosition: employee.jobPosition,
      phoneNumber: employee.phoneNumber,
      jobStartDate: employee.jobStartDate
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  const handleUpdate = () => {
    const updatedEmployees = [...employees];
    updatedEmployees[editingId] = editFormData;
    
    setEmployees(updatedEmployees);
    localStorage.setItem("employees", JSON.stringify(updatedEmployees));
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  return (
    <div className="col-span-12 lg:col-span-10 flex justify-center">
      <div className="flex flex-col gap-5 w-11/12">
        <div className="overflow-x-auto rounded-lg border bg-white border-gray-200">
          <div className="flex justify-between pt-5 pb-3 px-3">
            <button 
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 text-xs rounded" 
              onClick={() => navigate("/register")}
            >
              Add Employee
            </button>
          </div>
          <table className="min-w-full divide-y-2 divide-gray-200 text-sm">
            <thead>
              <tr>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">Employee Name</th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">Position</th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">Contact Number</th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">Joining Date</th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {employees.map((employee, index) => (
                <tr key={index}>
                  {editingId === index ? (
                    <>
                      <td className="whitespace-nowrap px-4 py-2">
                        <input
                          type="text"
                          name="firstName"
                          value={editFormData.firstName}
                          onChange={handleEditFormChange}
                          className="border rounded p-1 w-full"
                        />
                        <input
                          type="text"
                          name="lastName"
                          value={editFormData.lastName}
                          onChange={handleEditFormChange}
                          className="border rounded p-1 w-full mt-1"
                        />
                      </td>
                      <td className="whitespace-nowrap px-4 py-2">
                        <input
                          type="text"
                          name="jobPosition"
                          value={editFormData.jobPosition}
                          onChange={handleEditFormChange}
                          className="border rounded p-1 w-full"
                        />
                      </td>
                      <td className="whitespace-nowrap px-4 py-2">
                        <input
                          type="text"
                          name="phoneNumber"
                          value={editFormData.phoneNumber}
                          onChange={handleEditFormChange}
                          className="border rounded p-1 w-full"
                        />
                      </td>
                      <td className="whitespace-nowrap px-4 py-2">
                        <input
                          type="text"
                          name="jobStartDate"
                          value={editFormData.jobStartDate}
                          onChange={handleEditFormChange}
                          className="border rounded p-1 w-full"
                        />
                      </td>
                      <td className="whitespace-nowrap px-4 py-2">
                        <button
                          onClick={handleUpdate}
                          className="bg-green-500 hover:bg-green-700 text-white font-bold p-1 text-xs rounded mr-1"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="bg-gray-500 hover:bg-gray-700 text-white font-bold p-1 text-xs rounded"
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-900">
                        {`${employee.firstName} ${employee.lastName}`}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                        {employee.jobPosition}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                        {employee.phoneNumber}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                        {employee.jobStartDate}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2">
                        <button
                          onClick={() => handleEdit(employee, index)}
                          className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold p-1 text-xs rounded mr-1"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(index)}
                          className="bg-red-500 hover:bg-red-700 text-white font-bold p-1 text-xs rounded"
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
      </div>
    </div>
  );
}

export default Factoryworkers;