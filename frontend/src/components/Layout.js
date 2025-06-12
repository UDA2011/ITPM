import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import SideMenu from "./SideMenu";

function Layout() {
  return (
    <>
      <div className="md:h-16">
        <Header />
      </div>
      <div className="grid grid-cols-12 min-h-[calc(100vh-4rem)] bg-gray-100 items-stretch">
        <div className="col-span-2 h-screen sticky top-0 hidden lg:flex bg-white">
          <SideMenu />
        </div>
        <div className="col-span-10 bg-white min-h-full flex flex-col">
          <Outlet />
        </div>
      </div>
    </>
  );
}

export default Layout;