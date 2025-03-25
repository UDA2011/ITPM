import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Factoryworkers() {
  const [employees, setEmployees] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  const fetchEmployeeData = () => {
    const storedEmployees = JSON.parse(localStorage.getItem("employees")) || [];
    setEmployees(storedEmployees);
  };

  return (
    <div className="col-span-12 lg:col-span-10 flex justify-center">
      <div className="flex flex-col gap-5 w-11/12">
        <div className="overflow-x-auto rounded-lg border bg-white border-gray-200">
          <div className="flex justify-between pt-5 pb-3 px-3">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 text-xs rounded" onClick={() => navigate("/register")}>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {employees.map((employee, index) => (
                <tr key={index}>
                  <td className="whitespace-nowrap px-4 py-2 text-gray-900">{`${employee.firstName} ${employee.lastName}`}</td>
                  <td className="whitespace-nowrap px-4 py-2 text-gray-700">{employee.jobPosition}</td>
                  <td className="whitespace-nowrap px-4 py-2 text-gray-700">{employee.phoneNumber}</td>
                  <td className="whitespace-nowrap px-4 py-2 text-gray-700">{employee.jobStartDate}</td>
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
