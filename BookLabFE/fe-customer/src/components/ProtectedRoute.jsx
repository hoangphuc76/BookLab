import React from 'react';
import { Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearProfile } from '../features/Auth/profileSlice';
import { store } from '../store/store';
import { swtoast } from '../utils/swal';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const dispatch = useDispatch();
  const roleIdString = localStorage.getItem('roleId');
  const roleId = roleIdString ? parseInt(roleIdString, 10) : null;

  // Kiểm tra xem người dùng đã đăng nhập chưa
  if (roleId === null) {
    return <Navigate to="/" replace />;
  }

  // Kiểm tra xem role của người dùng có nằm trong danh sách được phép không
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(roleId)) {
    // Redirect dựa theo role
    store.dispatch(clearProfile());
    swtoast.error({ text: 'You do not have permission to access this page' });
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;