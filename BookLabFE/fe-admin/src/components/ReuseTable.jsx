// components/ReusableTable.js
import React, { useState, useEffect } from 'react';
import PopupConfirm from './PopupConfirm';
import defaultAvatar from '../assets/Default_img.jpg';

const ReusableTable = ({ data, columns, onEdit, onDelete, managerData, categoryRoomData, buildingData, roleData, campusData,isAccountModel }) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedRole, setSelectedRole] = useState('All'); // 'All' để hiển thị tất cả
  const formatStatus = (value) => {
    const isActive = value === true || value === 'true' || value === 'Active' || value === 1;
    const style = isActive
      ? 'bg-green-100 text-green-800'
      : value === false || value === 'false' || value === 'Inactive' || value === 0
      ? 'bg-red-100 text-red-800'
      : 'bg-gray-100 text-gray-800';
    const displayText = isActive ? 'Hiện đang hoạt động' : 'Hiện đang không hoạt động';
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
        {displayText}
      </span>
    );
  };

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

  // Tính toán tổng số trang
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  // Lấy danh sách item hiển thị trên trang hiện tại
  const paginatedData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // Reset trang về 1 khi thay đổi dữ liệu
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, rowsPerPage]);

console.log(data);
  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      onDelete(itemToDelete);
      setIsConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="overflow-x-auto p-4">
      {/* Thanh tìm kiếm */}
      <div className="flex justify-between items-center mb-4">
      
        <input
          type="text"
          placeholder="Tìm kiếm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded p-2 w-1/3"
        />
        <div className="relative">
        
          <div className="flex">
        {isAccountModel && (
          <select
            id="roleDropdown"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="block w-48 px-4 py-2 mx-4 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="All">All Roles</option>
            {roleData.map((role) => (
              <option key={role.id} value={role.name}>
                {role.name}
              </option>
            ))}
          </select>
        )}
          <select
          value={rowsPerPage}
          onChange={(e) => setRowsPerPage(Number(e.target.value))}
          className="border border-gray-300 rounded p-2"
        >
          <option value="10">10 hàng</option>
          <option value="15">15 hàng</option>
          <option value="20">20 hàng</option>
        </select>
        </div>
        </div>
        {/* Chọn số lượng dòng trên mỗi trang */}
        
      </div>
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            {columns
              .filter(col => !isGuidOrId(col.key) && col.key !== 'campusId' && col.key !== 'roleId')
              .map(col => (
                <th
                  key={col.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b"
                >
                  {col.label}
                </th>
              ))}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
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
                    ): (
                      item[col.key] || 'N/A'
                    )}
                  </td>
                ))}
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => onEdit(item)}
                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                >
                  Edit
                </button>
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
      {/* Phân trang */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-gray-600">
          Trang {currentPage} / {totalPages} | Tổng {filteredData.length} hàng
        </span>
        <div>
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 mr-2 rounded ${currentPage === 1 ? 'bg-gray-300' : 'bg-blue-500 text-white'}`}
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded ${currentPage === totalPages ? 'bg-gray-300' : 'bg-blue-500 text-white'}`}
          >
            Next
          </button>
        </div>
      </div>
      <PopupConfirm
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        message="Are you sure you want to delete?"
      />
    </div>
  );
};

export default ReusableTable;