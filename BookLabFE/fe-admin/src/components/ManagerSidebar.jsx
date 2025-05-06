import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { menuItems, groupedItems } from '../data/ManagerSidebar';
import { AiFillCaretDown } from "react-icons/ai";
import { IoSchoolOutline } from "react-icons/io5";

const ManagerSidebar = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine active item based on current location
  useEffect(() => {
    // Check if current path matches any menu item
    menuItems.forEach(item => {
      if (item.group) {
        const groupItems = groupedItems[item.group];
        if (groupItems && groupItems.some(subItem => location.pathname === subItem.path)) {
          setOpenDropdown(item.group);
        }
      }
    });
  }, [location.pathname]);

  // Check if a path is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Check if a group contains the active path
  const isGroupActive = (groupName) => {
    const group = groupedItems[groupName];
    if (!group) return false;
    return group.some(item => location.pathname === item.path);
  };

  return (
    <div className="w-64 h-screen bg-white border-r border-slate-200 shadow-sm flex flex-col sticky top-0 overflow-y-auto">
      {/* Logo section */}
      <div className="px-6 py-6">
        <div className="flex items-center">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-lg p-2 shadow-md">
            <IoSchoolOutline className="h-6 w-6 text-white" />
          </div>
          <h1 className="ml-3 text-xl font-bold bg-gradient-to-r from-indigo-700 to-indigo-500 bg-clip-text text-transparent">
            BookLab Manager
          </h1>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-200 my-1"></div>

      {/* Menu Items */}
      <div className="flex-1 px-3 py-4 space-y-0.5">
        {menuItems.map((item, index) => (
          <div key={index} className="relative">
            {item.group ? (
              <>
                <div
                  className={`flex items-center gap-3 w-full h-11 px-4 rounded-xl 
                  ${isGroupActive(item.group) ? 
                    'bg-indigo-50 text-indigo-700' : 
                    'text-slate-700 hover:bg-slate-100'} 
                  transition-all duration-200 cursor-pointer group mb-1`}
                  onClick={() => setOpenDropdown(openDropdown === item.group ? null : item.group)}
                >
                  <span className={`text-lg ${isGroupActive(item.group) ? 'text-indigo-600' : 'text-slate-600 group-hover:text-slate-800'}`}>
                    <item.icon />
                  </span>
                  <span className={`flex-1 text-sm font-medium ${isGroupActive(item.group) ? 'text-indigo-700' : 'text-slate-700 group-hover:text-slate-800'}`}>
                    {item.name}
                  </span>
                  <span
                    className={`text-sm transition-transform duration-300 ${
                      openDropdown === item.group ? "rotate-180" : ""
                    } ${isGroupActive(item.group) ? 'text-indigo-500' : 'text-slate-500 group-hover:text-slate-700'}`}
                  >
                    <AiFillCaretDown />
                  </span>
                </div>
                
                {/* Collapsible submenu with animation */}
                <div 
                  className={`pl-4 space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${
                    openDropdown === item.group ? "max-h-60 opacity-100 mb-1" : "max-h-0 opacity-0"
                  }`}
                >
                  {groupedItems[item.group]?.map((subItem, subIndex) => (
                    <Link
                      key={subIndex}
                      to={subItem.path}
                      className={`flex items-center gap-2 w-full h-9 px-4 rounded-lg text-sm transition-all duration-200
                        ${isActive(subItem.path) ? 
                          'bg-indigo-100 text-indigo-700 font-medium' : 
                          'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                    >
                      <span className={`text-base ${isActive(subItem.path) ? 'text-indigo-600' : 'text-slate-500'}`}>
                        <subItem.icon />
                      </span>
                      <span>{subItem.name}</span>
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <Link
                to={item.path}
                className={`flex items-center gap-3 w-full h-11 px-4 rounded-xl mb-1 transition-all duration-200
                  ${isActive(item.path) ? 
                    'bg-indigo-50 text-indigo-700 font-medium shadow-sm' : 
                    'text-slate-700 hover:bg-slate-100 hover:text-slate-900'}`}
              >
                <span className={`text-lg ${isActive(item.path) ? 'text-indigo-600' : 'text-slate-600'}`}>
                  <item.icon />
                </span>
                <span className="text-sm font-medium">{item.name}</span>
                
                {/* Indicator dot for active item */}
                {isActive(item.path) && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                )}
              </Link>
            )}
          </div>
        ))}
      </div>
      
      {/* Footer */}
      <div className="border-t border-slate-200 p-4">
        <div className="bg-slate-50 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">BookLab v1.0</span>
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
              Manager
            </span>
          </div>
          <div className="text-xs text-slate-500">© {new Date().getFullYear()} BookLab Projects</div>
        </div>
      </div>
    </div>
  );
};

export default ManagerSidebar;