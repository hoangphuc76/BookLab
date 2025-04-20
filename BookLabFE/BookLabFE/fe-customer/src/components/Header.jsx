import React, { useState, useRef, useEffect } from "react";
import { IoIosNotificationsOutline } from "react-icons/io";
import { IoPersonOutline } from "react-icons/io5";
import { LuClipboardList } from "react-icons/lu";
import { FaRegHeart } from "react-icons/fa";
import { IoIosHelpCircleOutline } from "react-icons/io";
import { HiOutlineLogout } from "react-icons/hi";
import { FiPlusCircle } from "react-icons/fi";
import { Image } from "antd";
import fptLogo from "../assets/LogoFpt.svg";
import { useNavigate } from "react-router-dom";
import { fetchProfile, clearProfile } from "../features/Auth/profileSlice";
import { useDispatch, useSelector } from "react-redux";
import apiClient from "../services/ApiClient";

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { userId, username, avatar } = useSelector((state) => state.profile);
  const dropdownRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  const handleLogout = () => {
    try {
      apiClient.post("/Authenticate/logout");
      dispatch(clearProfile());
      navigate("/");
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  return (
    <header className="sticky top-0 left-0 right-0 z-40 w-full bg-white/90 backdrop-blur-lg shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer"
            onClick={() => navigate("/home")}
          >
            <Image
              width={120}
              src={fptLogo}
              alt="FPT Logo"
              preview={false}
            />
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-600 hover:text-indigo-600 rounded-full hover:bg-indigo-50 transition-all duration-200">
              <IoIosNotificationsOutline className="text-2xl" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-600 rounded-full"></span>
            </button>

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-3 p-1.5 rounded-full hover:bg-gray-100 transition-all duration-200"
              >
                <img
                  src={avatar || "https://api.dicebear.com/7.x/initials/svg?seed=FPT"}
                  alt="User Avatar"
                  className="w-8 h-8 rounded-full ring-2 ring-indigo-100 object-cover"
                />
                <span className="hidden md:block font-medium text-gray-700">{username || "User"}</span>
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg ring-1 ring-gray-200 transition-all duration-200 overflow-hidden">
                  <div className="p-4 flex items-center space-x-3 border-b border-gray-100">
                    <img
                      src={avatar || "https://api.dicebear.com/7.x/initials/svg?seed=FPT"}
                      alt="User Avatar"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="text-left">
                      <div className="font-semibold text-gray-800">{username || "User"}</div>
                      <div className="text-xs text-gray-500">Student</div>
                    </div>
                  </div>

                  <ul className="py-1">
                    <li>
                      <a
                        onClick={() => navigate(`/user/${userId}`)}
                        className="flex items-center px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      >
                        <IoPersonOutline className="text-lg text-gray-500 mr-3" />
                        <span className="text-gray-700 font-medium">My Account</span>
                      </a>
                    </li>
                    <li>
                      <a
                        onClick={() => navigate("/schedule")}
                        className="flex items-center px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      >
                        <LuClipboardList className="text-lg text-gray-500 mr-3" />
                        <span className="text-gray-700 font-medium">My Schedule</span>
                      </a>
                    </li>
                    <li>
                      <a
                        href="/student-manage"
                        className="flex items-center px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      >
                        <FiPlusCircle className="text-lg text-gray-500 mr-3" />
                        <span className="text-gray-700 font-medium">Manage Groups</span>
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="flex items-center px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      >
                        <FaRegHeart className="text-lg text-gray-500 mr-3" />
                        <span className="text-gray-700 font-medium">Wishlist</span>
                      </a>
                    </li>
                    <li className="border-t border-gray-100 mt-1"></li>
                    <li>
                      <a
                        href="/helps"
                        className="flex items-center px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      >
                        <IoIosHelpCircleOutline className="text-lg text-gray-500 mr-3" />
                        <span className="text-gray-700 font-medium">Help</span>
                      </a>
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2.5 hover:bg-red-50 text-left transition-colors"
                      >
                        <HiOutlineLogout className="text-lg text-red-500 mr-3" />
                        <span className="text-red-600 font-medium">Logout</span>
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
