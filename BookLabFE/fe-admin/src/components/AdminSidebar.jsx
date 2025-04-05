import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { menuItems, groupedItems } from "../data/AdminSidebar";
import { AiFillCaretDown } from "react-icons/ai";
const AdminSidebar = () => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const navigate = useNavigate();

  return (
    <div className="w-64 h-screen bg-gradient-to-b from-gray-100 to-gray-200 text-gray-800 flex flex-col border-r border-gray-300 shadow-lg sticky top-0">
      <div className="flex-1 p-4 space-y-2">
        {menuItems.map((item, index) => (
          <div key={index} className="relative">
            {item.group ? (
              <>
                <div
                  className="flex items-center gap-3 w-full h-12 px-4 rounded-lg hover:bg-gray-300 transition-colors duration-200 cursor-pointer"
                  onClick={() =>
                    setOpenDropdown(openDropdown === item.group ? null : item.group)
                  }
                >
                  <span className="text-xl"><item.icon/></span>
                  <span className="flex-1 text-sm font-medium truncate">{item.name}</span>
                  <span
                    className={`text-sm transition-transform duration-200 ${
                      openDropdown === item.group ? "rotate-180" : ""
                    }`}
                  >
                    <AiFillCaretDown />
                  </span>
                </div>
                {openDropdown === item.group && (
                  <div className="pl-6 mt-1 space-y-1">
                    {groupedItems[item.group].map((subItem, subIndex) => (
                      <Link
                        key={subIndex}
                        to={subItem.path}
                        className="flex items-center gap-2 w-full h-10 px-4 rounded-lg hover:bg-gray-200 text-sm transition-colors duration-200"
                      >
                        <span className="text-lg"><subItem.icon/></span>
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                to={item.path}
                className="flex items-center gap-3 w-full h-12 px-4 rounded-lg hover:bg-gray-300 transition-colors duration-200"
              >
                <span className="text-xl"><item.icon/></span>
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminSidebar;