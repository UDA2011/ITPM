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
//Simport Addproduct from "./pages/AddProduct";
import Sales from "./pages/Sales";
import PurchaseDetails from "./pages/PurchaseDetails";
import Employee from "./pages/Employee";
import Managers from "./pages/Managers";
import Factoryworkers from "./pages/Factoryworkers";
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
            <Route path="/purchase-details" element={<PurchaseDetails />} />
            <Route path="/sales" element={<Sales />} />
            
            <Route path="/Employee" element={<Employee />} />
            <Route path="/Employee/Managers" element={<Managers />} />
            <Route path="/Employee/Factoryworkers" element={<Factoryworkers />} />
          </Route>
          <Route path="*" element={<NoPageFound />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
};

export default App;

//<Route path="/Addproduct" element={<Addproduct />} />