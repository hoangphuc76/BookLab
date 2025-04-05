import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
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

function Header({ children }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { userId, username, avatar } = useSelector((state) => state.profile);
  const dropdownRef = useRef(null); // Tham chiếu đến dropdown

  console.log("userId", userId);
  // Đóng dropdown khi click ra ngoài
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
    // Thêm logic đăng xuất khác nếu cần (gọi API logout, xóa cookie, v.v.)
  };

  return (
    <>
      <div className="justify-center items-center gap-0 inset-x-0 top-0 flex w-full shadow mb-8 !bg-white/70 !backdrop-blur-[40px] sticky left-0 right-0 z-40">
        <div
          className="items-center justify-between px-6 py-1 z-50 hidden lg:flex md:flex "
          style={{ width: "1250px" }}
        >
          {/* Logo */}
          <div className="flex items-center space-x-6">
            <div
              className="text-2xl font-bold text-blue-600 cursor-pointer"
              onClick={() => navigate("/home")}
            >
              <Image
                width={120}
                src={fptLogo}
                alt="Example Image"
                preview={false} // Tắt chế độ preview
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-6">
            <button className="text-gray-700 hover:text-gray-900">
              <span className="material-icons">
                <IoIosNotificationsOutline
                  style={{
                    fontSize: "30px",
                    cursor: "pointer",
                    marginRight: "10px",
                  }}
                />
              </span>
            </button>

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2"
              >
                <img
                  src={avatar}
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full"
                />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white border rounded-lg shadow-lg">
                  <div className="p-4 flex items-center space-x-4">
                    <img
                      src={avatar}
                      alt="User Avatar"
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="text-left">
                      <div className="font-bold text-gray-800">{username}</div>
                    </div>
                  </div>

                  <ul className="p-2 space-y-2">
                    <div className="border-t-2 border-gray-300 "></div>
                    <li>
                      <a
                        onClick={() => navigate(`/user/${userId}`)}
                        className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
                      >
                        <span className="material-icons">
                          <IoPersonOutline
                            style={{
                              fontSize: "20px",
                              cursor: "pointer",
                              marginRight: "10px",
                            }}
                          />
                        </span>
                        <span>My Account</span>
                      </a>
                    </li>
                    <li>
                      <a
                        onClick={() => navigate("/schedule")}
                        className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
                      >
                        <span className="material-icons">
                          <LuClipboardList
                            style={{
                              fontSize: "20px",
                              cursor: "pointer",
                              marginRight: "10px",
                            }}
                          />
                        </span>
                        <span>My Schedule</span>
                      </a>
                    </li>
                    <li>
                      <a
                        href="/student-manage"
                        className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
                      >
                        <span className="material-icons">
                          <FiPlusCircle
                            style={{
                              fontSize: "20px",
                              cursor: "pointer",
                              marginRight: "10px",
                            }}
                          />
                        </span>
                        <span>Manage Groups</span>
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
                      >
                        <span className="material-icons">
                          <FaRegHeart
                            style={{
                              fontSize: "20px",
                              cursor: "pointer",
                              marginRight: "10px",
                            }}
                          />
                        </span>
                        <span>Wishlist</span>
                      </a>
                    </li>
                    <div className="border-t-2 border-gray-300 "></div>
                    <li>
                      <a
                        href="/helps"
                        className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
                      >
                        <span className="material-icons">
                          <IoIosHelpCircleOutline
                            style={{
                              fontSize: "20px",
                              cursor: "pointer",
                              marginRight: "10px",
                            }}
                          />
                        </span>
                        <span>Helps</span>
                      </a>
                    </li>
                    <li>
                      <div
                        onClick={handleLogout}
                        className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
                      >
                        <span className="material-icons">
                          <HiOutlineLogout
                            style={{
                              fontSize: "20px",
                              cursor: "pointer",
                              marginRight: "10px",
                            }}
                          />
                        </span>
                        <span>Logout</span>
                      </div>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {children}
    </>
  );
}

export default Header;
