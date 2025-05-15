import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthContext from "./AuthContext";
import ProtectedWrapper from "./ProtectedWrapper";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import EndProducts from "./pages/EndProducts";
import NoPageFound from "./pages/NoPageFound";
import Supplies from "./pages/supplies"; 
import Employee from "./pages/Employee";
import Managers from "./pages/Managers";
import Factoryworkers from "./pages/Factoryworkers";
import TDashboard from "./pages/TDashboard";
import TNavbar from "./components/TNavbar";
import TaskForm from './components/TaskForm';
import TaskList from './pages/TaskList';
import "./index.css";


import TasksHome from './pages/TasksHome';
import ShowTask from './pages/ShowTask';
import CreateTask from './pages/CreateTask';
import EditTask from './pages/EditTask';
import DeleteTask from './pages/DeleteTask';
import IncompleteTasks from './pages/IncompleteTasks';
import OverdueTasks from './pages/OverdueTasks';
import UrgentTasks from './pages/UrgentTasks';

const App = () => {
  const [user, setUser] = useState("");
  const [loader, setLoader] = useState(true);

  // Safely parse localStorage user data
  let myLoginUser = null;
  const storedUser = localStorage.getItem("user");
  if (storedUser && storedUser !== "undefined") {
    try {
      myLoginUser = JSON.parse(storedUser);
    } catch (error) {
      console.error("Failed to parse user from localStorage:", error);
      localStorage.removeItem("user"); // Clear invalid data
    }
  }

  useEffect(() => {
    if (myLoginUser) {
      setUser(myLoginUser._id);
    } else {
      setUser("");
    }
    setLoader(false);
  }, []);

  const signin = (newUser, callback) => {
    setUser(newUser);
    callback();
  };

  const signout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  let value = { user, signin, signout };

  if (loader)
    return (
      <div className="flex justify-center items-center h-screen">
        <h1>LOADING...</h1>
      </div>
    );

  return (
    <AuthContext.Provider value={value}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedWrapper>
                <Layout />
              </ProtectedWrapper>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/Employee" element={<Employee />} />
            <Route path="/EndProducts" element={<EndProducts />} />
            <Route path="/Employee" element={<Employee />} />
            <Route path="/TDashboard" element={<TDashboard />} />
            <Route path="/TNavbar" element={<TNavbar />} />
            <Route path="/Supplies" element={<Supplies />} />
            <Route path="task" element={<TaskList />} />
            <Route path="task/create" element={<TaskForm />} />
            <Route path="task/edit/:id" element={<TaskForm />} />
            <Route path="/Employee/Managers" element={<Managers />} />
            <Route path="/Employee/Factoryworkers" element={<Factoryworkers />} />
            <Route path='/taskhome' element={<TasksHome />} />
            <Route path='/tasks/details/:id' element={<ShowTask />} />
            <Route path='/tasks/create' element={<CreateTask />} />
            <Route path='/tasks/edit/:id' element={<EditTask />} />
            <Route path='/tasks/delete/:id' element={<DeleteTask />} />
            <Route path='/tasks/IncompleteTasks' element={<IncompleteTasks />} />
            <Route path='/tasks/OverdueTasks' element={<OverdueTasks />} />
            <Route path='/tasks/UrgentTasks' element={<UrgentTasks />} />
          </Route>
          <Route path="*" element={<NoPageFound />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
};

export default App;