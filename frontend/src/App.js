import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthContext from "./AuthContext";
import ProtectedWrapper from "./ProtectedWrapper";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
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

const App = () => {
  const [user, setUser] = useState("");
  const [loader, setLoader] = useState(true);
  let myLoginUser = JSON.parse(localStorage.getItem("user"));

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
            <Route path="/Employee/Managers" element={<Managers />} />
            <Route path="/Employee/Factoryworkers" element={<Factoryworkers />} />
            <Route path="/EndProducts" element={<EndProducts />} />
            <Route path="/ViewProduct/:id" element={<ViewProduct />} />
            <Route path="/Supplies" element={<Supplies />} />
            <Route path="task" element={<TaskList />} />
            <Route path="task/create" element={<TaskForm />} />
            <Route path="task/edit/:id" element={<TaskForm />} />

          </Route>
          <Route path="*" element={<NoPageFound />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
};

export default App;