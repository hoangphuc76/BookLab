import React from "react";
import AdminSidebar from "../components/AdminSidebar";
import Header from "../components/header";
import { Outlet } from "react-router-dom";

const Admin = () => {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 flex-row">
        <AdminSidebar />
        <div className="flex-1 p-4 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Admin;
