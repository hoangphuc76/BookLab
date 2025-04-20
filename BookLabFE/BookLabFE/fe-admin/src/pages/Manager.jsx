import React from "react";
import ManagerSidebar from "../components/ManagerSidebar";
import Header from "../components/header";
import { Outlet } from "react-router-dom";

const Manager = () => {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 flex-row">
        <ManagerSidebar />
        <div className="flex-1 p-4 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Manager;
