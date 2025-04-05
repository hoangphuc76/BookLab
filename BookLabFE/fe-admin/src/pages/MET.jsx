import React from "react";
import METSidebar from "../components/METSidebar";
import Header from "../components/header";
import { Outlet } from "react-router-dom";

const MET = () => {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 flex-row">
        <METSidebar />
        <div className="flex-1 p-4 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MET;
