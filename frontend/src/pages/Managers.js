import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import AuthContext from "../AuthContext";

function Managers() {
  const [employees, setAllEmployeeData] = useState([]);
  const [updatePage, setUpdatePage] = useState(true);
  const authContext = useContext(AuthContext);
  const navigate = useNavigate(); // Initialize navigate function

  useEffect(() => {
    fetchEmployeeData();
  }, [updatePage]);

  // Fetching Data of All Employees
  const fetchEmployeeData = () => {
    fetch(`http://localhost:4000/api/employee/get/${authContext.user}`)
      .then((response) => response.json())
      .then((data) => {
        setAllEmployeeData(data);
      })
      .catch((err) => console.log(err));
  };

  // Handle Page Update
  const handlePageUpdate = () => {
    setUpdatePage(!updatePage);
  };

  return (
    <div className="col-span-12 lg:col-span-10 flex justify-center">
      <div className="flex flex-col gap-5 w-11/12">
        {/* Table */}
        <div className="overflow-x-auto rounded-lg border bg-white border-gray-200">
          <div className="flex justify-between pt-5 pb-3 px-3">
            <div className="flex gap-4">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 text-xs rounded"
                onClick={() => navigate("/register")} // Navigate to Register page
              >
                Add Employee
              </button>
            </div>
          </div>
          <table className="min-w-full divide-y-2 divide-gray-200 text-sm">
            <thead>
              <tr>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Employee Name
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Position
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Contact Number
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Joining Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {employees.map((employee) => {
                return (
                  <tr key={employee._id}>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-900">
                      {employee.name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      {employee.position}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      {employee.contactNumber}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      {new Date(employee.joiningDate).toLocaleDateString() ===
                      new Date().toLocaleDateString()
                        ? "Today"
                        : employee.joiningDate}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Managers;
