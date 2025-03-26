import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../AuthContext";

function Managers() {
  const [employees, setAllEmployeeData] = useState([]);
  const [updatePage, setUpdatePage] = useState(true);
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployeeData();
  }, [updatePage]);

  const fetchEmployeeData = () => {
    fetch(`http://localhost:4000/api/employee/get/${authContext.user}`)
      .then((response) => response.json())
      .then((data) => {
        setAllEmployeeData(data);
      })
      .catch((err) => console.log(err));
  };

  const handlePageUpdate = () => {
    setUpdatePage(!updatePage);
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
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Full Name
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  NIC
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Phone Number
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Job Start Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {employees.map((employee) => (
                <tr key={employee._id}>
                  <td className="whitespace-nowrap px-4 py-2 text-gray-900">
                    {`${employee.firstName} ${employee.lastName}`}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                    {employee.nic}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Managers;
