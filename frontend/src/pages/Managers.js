import React, { useState } from "react";

function Managers() {
  const [managers, setManagers] = useState([
    { id: 1, name: "John Doe", position: "HR Manager", email: "john@example.com" },
    { id: 2, name: "Jane Smith", position: "Finance Manager", email: "jane@example.com" },
  ]);

  const [editManager, setEditManager] = useState(null);

  // Delete a manager
  const deleteManager = (id) => {
    setManagers(managers.filter((m) => m.id !== id));
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-700">MANAGERS DETAILS</h1>

      {/* Table Container */}
      <div className="overflow-hidden rounded-lg shadow-md">
        <table className="min-w-full border border-gray-300 bg-white">
          <thead className="bg-gray-200 text-gray-700 text-lg">
            <tr>
              <th className="border px-6 py-4 text-left">Name</th>
              <th className="border px-6 py-4 text-left">Position</th>
              <th className="border px-6 py-4 text-left">Email</th>
              <th className="border px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {managers.map((manager, index) => (
              <tr key={manager.id} className="even:bg-gray-100 hover:bg-gray-200">
                <td className="border px-6 py-4">{manager.name}</td>
                <td className="border px-6 py-4">{manager.position}</td>
                <td className="border px-6 py-4">{manager.email}</td>
                <td className="border px-6 py-4 text-center">
                  <button
                    onClick={() => setEditManager(manager)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md mr-3 hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteManager(manager.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Manager Form */}
      {editManager && (
        <div className="mt-6 bg-gray-50 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-gray-700">Edit Manager</h2>
          <input
            type="text"
            value={editManager.name}
            onChange={(e) => setEditManager({ ...editManager, name: e.target.value })}
            className="border p-3 m-2 w-full rounded"
          />
          <input
            type="text"
            value={editManager.position}
            onChange={(e) => setEditManager({ ...editManager, position: e.target.value })}
            className="border p-3 m-2 w-full rounded"
          />
          <input
            type="email"
            value={editManager.email}
            onChange={(e) => setEditManager({ ...editManager, email: e.target.value })}
            className="border p-3 m-2 w-full rounded"
          />
          <button onClick={() => setEditManager(null)} className="bg-gray-500 text-white px-5 py-3 rounded-lg">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

export default Managers;
