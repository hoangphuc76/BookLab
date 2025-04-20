import React, { useEffect, useState } from 'react';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { useDispatch, useSelector } from 'react-redux';
import { googleLoginThunk } from '../../../features/Auth/AuthSlice';
import { Image } from 'antd';
import logoFpt from '../../../assets/LogoFpt.svg';
import { swtoast } from '../../../utils/swal';
import { useNavigate } from 'react-router-dom';
import { store } from '../../../store/store';
import { showLoader, hideLoader } from '../../../utils/loaderSlice';
import GhibliImage from "../../../assets/GhibliPic.png"
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { ArrowRightIcon, UserCircle, Users } from 'lucide-react';
import ApiClient from '../../../services/ApiClient';
import axios from 'axios';

const LoginFormContent = () => {
    const dispatch = useDispatch();
    const { status, error, roleId } = useSelector((state) => state.auth);
    const { isLogOut } = useSelector((state) => state.profile);
    const [logout, setLogout] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        setLogout(isLogOut);
    }, []);

    const login = useGoogleLogin({
        flow: 'auth-code',
        onSuccess: (tokenResponse) => {
            const code = tokenResponse.code;
            setLogout(false);
            console.log('Authorization code:', code);
            dispatch(googleLoginThunk(code));
            store.dispatch(showLoader());
        },
        onError: () => {
            console.log('Google Login Failed');
        },
    });

    const handleDemoLogin = async (email) => {
        try {
            setLogout(false);
            store.dispatch(showLoader());
            
            // Call the demo-login API with the email parameter
            const response = await ApiClient.post('/Authenticate/demo-login', JSON.stringify(email), {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            // Handle the successful response similar to Google login
            dispatch({ 
                type: 'auth/googleLogin/fulfilled',
                payload: {
                    message: response.data.message,
                    roleId: response.data.roleId,
                    campusId: response.data.campusId,
                    accountId: response.data.accountId,
                    accountName: response.data.accountName
                }
            });
        } catch (error) {
            console.error('Demo Login Failed:', error);
            store.dispatch(hideLoader());
            swtoast.error({ text: 'Demo login failed' });
            dispatch({ type: 'auth/googleLogin/rejected', payload: error.message });
        }
    };

    useEffect(() => {
        if (status === 'succeeded' && !logout && roleId) {
            store.dispatch(hideLoader());
            swtoast.success({ text: 'Login successful' });
            if (roleId == '1') {
                navigate('/admin');
            } else if (roleId == '2') {
                navigate('/manager');
            } else if (roleId == '7') {
                navigate('/MET');
            }
        } else if (status === 'failed') {
            swtoast.error({ text: 'Login failed' });
            store.dispatch(hideLoader());
        }
    }, [status, error, roleId]);

    return (
        <div className="w-full h-screen relative"
            style={{
                backgroundImage: `url(${GhibliImage})`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat'
            }}>

            <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />

            {/* Login card */}
            <motion.div
                className="absolute bg-white/10 backdrop-blur-md top-[35%] left-[38%] z-10 p-10 rounded-2xl shadow-2xl border border-white/20 text-white max-w-sm w-full"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <h1 className="text-3xl font-bold mb-6 text-center drop-shadow-md">
                    Welcome to FPT University
                </h1>
                <p className="text-sm text-center mb-6">
                    Please log in to continue
                </p>
                <div className="flex flex-col gap-3">
                    <button onClick={login}
                        variant="outline"
                        className="w-full bg-[#1F2E45]/75 p-2 cursor-pointer text-black hover:bg-[#1F2E45] rounded-md flex items-center justify-between gap-2"
                    >
                        <div className='flex items-center'>
                            <div className='bg-[#18243A] p-2 mr-2 rounded-md'> <FcGoogle className="text-xl" /> </div>
                            <div className='text-white/50 text-xs'> Login with Google</div>
                        </div>
                        <div className='p-2 bg-[#18243A] p-2 rounded-md'>
                            <ArrowRightIcon className='text-white/50' />
                        </div>
                    </button>
                    
                    {/* Demo Admin Login Button */}
                    <button 
                        onClick={() => handleDemoLogin("Admin@gmail.com")}
                        className="w-full bg-[#1F2E45]/75 p-2 cursor-pointer text-black hover:bg-[#1F2E45] rounded-md flex items-center justify-between gap-2"
                    >
                        <div className='flex items-center'>
                            <div className='bg-[#18243A] p-2 mr-2 rounded-md'> 
                                <UserCircle className="text-xl text-white" />
                            </div>
                            <div className='text-white/50 text-xs'> Demo Admin Login</div>
                        </div>
                        <div className='p-2 bg-[#18243A] p-2 rounded-md'>
                            <ArrowRightIcon className='text-white/50' />
                        </div>
                    </button>
                    
                    {/* Demo Manager Login Button */}
                    <button 
                        onClick={() => handleDemoLogin("Manager@gmail.com")}
                        className="w-full bg-[#1F2E45]/75 p-2 cursor-pointer text-black hover:bg-[#1F2E45] rounded-md flex items-center justify-between gap-2"
                    >
                        <div className='flex items-center'>
                            <div className='bg-[#18243A] p-2 mr-2 rounded-md'> 
                                <Users className="text-xl text-white" />
                            </div>
                            <div className='text-white/50 text-xs'> Demo Manager Login</div>
                        </div>
                        <div className='p-2 bg-[#18243A] p-2 rounded-md'>
                            <ArrowRightIcon className='text-white/50' />
                        </div>
                    </button>
                </div>
            </motion.div>

            {/* Animated Stars */}
            <div className="absolute inset-0  overflow-hidden z-0">
                {[...Array(50)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0],
                            y: [0, -10, 0],
                        }}
                        transition={{
                            duration: Math.random() * 3 + 2,
                            repeat: Infinity,
                            delay: Math.random() * 3,
                        }}
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

const LoginForm = () => {
    return (
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <LoginFormContent />
        </GoogleOAuthProvider>
    );
};

export default LoginForm;