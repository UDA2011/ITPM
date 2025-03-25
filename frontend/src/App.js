import React from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Inventory from "./pages/Inventory";
import NoPageFound from "./pages/NoPageFound";
import AuthContext from "./AuthContext";
import ProtectedWrapper from "./ProtectedWrapper";
import { useEffect, useState } from "react";
import Addproduct from "./pages/Add product";
import Sales from "./pages/Sales";
import PurchaseDetails from "./pages/PurchaseDetails";
import TDashboard from "./pages/TDashboard";
import TNavbar from "./components/TNavbar";
import TaskForm from './components/TaskForm';
import TaskList from './pages/TaskList';

const App = () => {
  const [user, setUser] = useState("");
  const [loader, setLoader] = useState(true);
  let myLoginUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (myLoginUser) {
      setUser(myLoginUser._id);
      setLoader(false);
    } else {
      setUser("");
      setLoader(false);
    }
  }, [myLoginUser]);

  const signin = (newUser, callback) => {
    setUser(newUser);
    callback();
  };

  const signout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  let value = { user, signin, signout };

  if (loader) return <div className="flex justify-center items-center h-screen"><h1>LOADING...</h1></div>;

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
            <Route path="inventory" element={<Inventory />} />
            <Route path="purchase-details" element={<PurchaseDetails />} />
            <Route path="sales" element={<Sales />} />
            <Route path="add-product" element={<Addproduct />} />
            
            {/* Task Management Routes */}
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