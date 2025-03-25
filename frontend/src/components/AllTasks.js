import React, { useEffect, useState } from "react";
import axios from "axios";

const AllTasks = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    axios.get("/api/tasks").then((response) => setTasks(response.data));
  }, []);

  return (
    <div>
      <h1>All Tasks</h1>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Assigned To</th>
            <th>Due Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task._id}>
              <td>{task.title}</td>
              <td>{task.description}</td>
              <td>{task.assignedTo}</td>
              <td>{new Date(task.dueDate).toLocaleDateString()}</td>
              <td>{task.status}</td>
              <td>
                <button>Edit</button>
                <button>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AllTasks;