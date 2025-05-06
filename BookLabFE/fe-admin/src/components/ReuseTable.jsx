// components/ReusableTable.js
import React, { useState, useEffect, useRef } from 'react';
import PopupConfirm from './PopupConfirm';
import defaultAvatar from '../assets/Default_img.jpg';
import { HiSearch, HiChevronLeft, HiChevronRight, HiPencilAlt, HiTrash } from 'react-icons/hi';
import { BsFilter } from 'react-icons/bs';

const ReusableTable = ({ data, columns, onEdit, onDelete, managerData, categoryRoomData, buildingData, roleData, campusData, isAccountModel }) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedRole, setSelectedRole] = useState('All');
  const [userRoleId, setUserRoleId] = useState(null); // Giả định roleId là 1 (Admin)
  const [openDropdownId, setOpenDropdownId] = useState(null);


  const formatStatus = (value) => {
    // Determine style and text based on status value
    let style, displayText, dotColor;
    
    switch (value) {
      case 1:
      case true:
      case 'true':
      case 'Active':
        style = 'bg-emerald-100 text-emerald-800';
        displayText = 'Available';
        dotColor = 'bg-emerald-600';
        break;
      
      case 7:
        style = 'bg-amber-100 text-amber-800';
        displayText = 'Maintaining';
        dotColor = 'bg-amber-600';
        break;
      
      case 8:
        style = 'bg-rose-100 text-rose-800';
        displayText = 'Locked';
        dotColor = 'bg-rose-600';
        break;
      
      default:
        style = 'bg-rose-100 text-rose-800';
        displayText = 'Unavailable';
        dotColor = 'bg-rose-600';
        break;
    
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${style}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${dotColor} mr-1.5`}></span>
        {displayText}
      </span>
    );
  };

  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const isGuidOrId = (key) => {
    return key.toLowerCase() === 'id' || key.toLowerCase() === 'guid' || key.includes('Id');
  };

  const getManagerName = (managerId) => {
    if (!managerData || !managerId) return 'N/A';
    const manager = managerData.find(m => m.id === managerId);
    return manager ? manager.name : 'N/A';
  };

  const getCategoryRoomName = (categoryRoomId) => {
    if (!categoryRoomData || !categoryRoomId) return 'N/A';
    const category = categoryRoomData.find(c => c.id === categoryRoomId);
    return category ? category.name : 'N/A';
  };

  const getBuildingName = (buildingId) => {
    if (!buildingData || !buildingId) return 'N/A';
    const building = buildingData.find(b => b.id === buildingId);
    return building ? building.name : 'N/A';
  };

  const getCampusName = (campusId) => {
    if (!campusData || !campusId) return 'N/A';
    const campus = campusData.find(c => c.id === campusId);
    return campus ? campus.name : 'N/A';
  };

  const getRoleName = (roleId) => {
    if (!roleData || !roleId) return 'N/A';
    const role = roleData.find(r => r.id === roleId);
    return role ? role.name : 'N/A';
  };

  // Lọc dữ liệu theo từ khóa tìm kiếm
  const filteredData = data.filter(item =>
    (selectedRole === 'All' || getRoleName(item.roleId) === selectedRole) &&
    columns.some(col =>
      (item[col.key] || '').toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  useEffect(() => {
    setCurrentPage(1);
    const userRole = JSON.parse(localStorage.getItem('roleId'));
    setUserRoleId(userRole);
  }, [searchTerm, rowsPerPage]);

  // Tính toán tổng số trang
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  // Lấy danh sách item hiển thị trên trang hiện tại
  const paginatedData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // Reset trang về 1 khi thay đổi dữ liệu
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, rowsPerPage]);

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      onDelete(itemToDelete);
      setIsConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all duration-300">
      {/* Thanh tìm kiếm và bộ lọc */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="relative w-full md:w-2/5">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <HiSearch className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-slate-700 placeholder-slate-400"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {isAccountModel && (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <BsFilter className="h-5 w-5 text-slate-400" />
              </div>
              <select
                id="roleDropdown"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="pl-10 pr-8 py-2.5 border border-slate-300 rounded-xl bg-white focus:ring-indigo-500 focus:border-indigo-500 text-slate-700 shadow-sm appearance-none"
              >
                <option value="All">Tất cả vai trò</option>
                {roleData.map((role) => (
                  <option key={role.id} value={role.name}>
                    {role.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          )}
          <div className="relative">
            <select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              className="pl-4 pr-8 py-2.5 border border-slate-300 rounded-xl bg-white focus:ring-indigo-500 focus:border-indigo-500 text-slate-700 shadow-sm appearance-none"
            >
              <option value="10">10 rows</option>
              <option value="15">15 rows</option>
              <option value="20">20 rows</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Bảng dữ liệu */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {columns
                .filter(col => !isGuidOrId(col.key) && col.key !== 'campusId' && col.key !== 'roleId')
                .map(col => (
                  <th
                    key={col.key}
                    className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                  >
                    {col.label}
                  </th>
                ))}
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {paginatedData.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                {columns
                  .filter(col => !isGuidOrId(col.key) && col.key !== 'campusId' && col.key !== 'roleId')
                  .map(col => (
                    <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {col.label === 'Status' ? (
                        formatStatus(item[col.key])
                      ) : col.key.toLowerCase().includes('avatar') ? (
                        item.avatar ? (
                          <img
                            src={item.avatar}
                            alt="Avatar"
                            className="h-10 w-10 object-cover rounded"
                            onError={(e) => (e.target.src = defaultAvatar)}
                          />
                        ) : (
                          <img
                            src={item.accountDetail?.avatar || defaultAvatar}
                            alt="Avatar"
                            className="h-10 w-10 object-cover rounded"
                            onError={(e) => (e.target.src = defaultAvatar)}
                          />
                        )
                      ) : col.key === 'campus' ? (
                        getCampusName(item.campusId)
                      ) : col.key === 'role' ? (
                        getRoleName(item.roleId)
                      ) : col.key === 'fullName' ? (
                        item.accountDetail?.fullName || 'N/A'
                      ) : col.key === 'manager' ? (
                        getManagerName(item.managerId)
                      ) : col.key === 'categoryRoom' ? (
                        getCategoryRoomName(item.categoryRoomId)
                      ) : col.key === 'building' ? (
                        getBuildingName(item.buildingId)
                      ) : (
                        item[col.key] || 'N/A'
                      )}
                    </td>
                  ))}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {userRoleId === 2 ? (
                    <div className="relative" ref={dropdownRef} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setOpenDropdownId(item.id === openDropdownId ? null : item.id);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 mr-4 flex items-center"
                      >
                        Edit
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      {openDropdownId === item.id && (
                        <div className="absolute left-0 mt-1 w-36 bg-white rounded-md shadow-lg z-10 border border-gray-200"
                        >
                          <div className="py-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent event bubbling
                                onEdit({ ...item, editMode: 'room' });
                                setOpenDropdownId(null);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Edit Room
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent event bubbling
                                onEdit({ ...item, editMode: 'status' });
                                setOpenDropdownId(null);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Edit Status
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => onEdit(item)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setItemToDelete(item.id);
                      setIsConfirmOpen(true);
                    }}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
        <span className="text-sm text-slate-600 font-medium">
          Displayed {Math.min(filteredData.length, (currentPage - 1) * rowsPerPage + 1)} - {Math.min(currentPage * rowsPerPage, filteredData.length)} on {filteredData.length} results
        </span>
        <div className="flex items-center">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg mr-1 ${currentPage === 1
                ? 'text-slate-400 cursor-not-allowed'
                : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-600'
              }`}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg mr-2 ${currentPage === 1
                ? 'text-slate-400 cursor-not-allowed'
                : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-600'
              }`}
          >
            <HiChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex items-center justify-center">
            {[...Array(Math.min(5, totalPages))].map((_, idx) => {
              // Tính toán các trang hiển thị khi có nhiều trang
              let pageNum;
              if (totalPages <= 5) {
                pageNum = idx + 1;
              } else if (currentPage <= 3) {
                pageNum = idx + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + idx;
              } else {
                pageNum = currentPage - 2 + idx;
              }

              return pageNum > 0 && pageNum <= totalPages ? (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-9 h-9 mx-1 flex items-center justify-center rounded-lg ${currentPage === pageNum
                      ? 'bg-indigo-100 text-indigo-700 font-medium'
                      : 'hover:bg-slate-100 text-slate-700'
                    }`}
                >
                  {pageNum}
                </button>
              ) : null;
            })}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg ml-2 ${currentPage === totalPages
                ? 'text-slate-400 cursor-not-allowed'
                : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-600'
              }`}
          >
            <HiChevronRight className="h-5 w-5" />
          </button>

          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg ml-1 ${currentPage === totalPages
                ? 'text-slate-400 cursor-not-allowed'
                : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-600'
              }`}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Confirm Dialog */}
      <PopupConfirm
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        message="Bạn có chắc chắn muốn xóa mục này?"
      />
    </div>
  );
};

export default ReusableTable;