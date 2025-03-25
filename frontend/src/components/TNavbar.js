import React from 'react';
import { Link } from 'react-router-dom';

const TNavbar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Inventory Management</h2>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li><Link to="/">Dashboard</Link></li>
          <li><Link to="/tasks">Task</Link></li>
        </ul>
      </nav>
      <div className="sidebar-footer">
        <p>@Manager</p>
      </div>
    </div>
  );
};

export default TNavbar;