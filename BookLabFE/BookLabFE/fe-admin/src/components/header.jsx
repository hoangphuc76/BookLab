import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { logout } from '../features/Auth/AuthSlice';
import { Button } from 'antd';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { Image } from 'antd';
import logoFpt from '../assets/LogoFpt.svg';
import { fetchProfile, clearProfile } from '../features/Auth/profileSlice';
import apiClient from '../services/ApiClient'; // Giả sử apiClient đã được cấu hình với withCredentials: true

const Header = (props) => {

    const {  username, gmail } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const userIcon = username ? username.charAt(0).toUpperCase() : '';
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(fetchProfile());
    }, [dispatch]);

    const handleLogout = () => {
        try {
            apiClient.post('/Authenticate/logout');
            dispatch(clearProfile());
            navigate('/');
        } catch (error) {
            console.error('Failed to logout:', error);
        }
        // Thêm logic đăng xuất khác nếu cần (gọi API logout, xóa cookie, v.v.)
    };


    return (
        <div className="flex justify-between items-center bg-white p-4 border-b border-gray-200">
            <h2 className="text- font-bold cursor-pointer" onClick={() => navigate('/admin')}>
                <Image
                    width={140}
                    src={logoFpt}
                    alt="Logo"
                    preview={false} // Tắt chế độ preview
                />
            </h2>
            <div className="flex justify-end gap-4">
                <div className="user-icon-box position-relative">
                    <Button
                        className="d-flex align-items-center justify-content-center"
                        type=""
                        icon={<UserOutlined />}
                        ghost="true"
                        danger="true"
                        style={{
                            border: '1.5px solid #000'
                        }}
                    >
                        {gmail}
                    </Button>
                </div>
                <div className="logout-box">
                    <Button
                        className="btn btn-dark d-flex align-items-center justify-content-center"
                        type=""
                        icon={<LogoutOutlined />}
                        danger="true"
                        style={{ backgroundColor: '#000' }}
                        onClick={handleLogout}
                    >
                        Log out
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default Header
