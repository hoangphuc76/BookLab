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
import { ArrowRightIcon } from 'lucide-react';


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
        flow: 'auth-code', // Specify authorization code flow
        // scope: 'https://www.googleapis.com/auth/calendar.events',
        onSuccess: (tokenResponse) => {
            // tokenResponse contains the authorization code in tokenResponse.code
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
        <div class={`w-full h-screen
             relative`} style={{
                backgroundImage: `url(${GhibliImage})`,
                backgroundPosition: 'center',
            }}>

            <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />

            {/* Login card */}
            <motion.div
                className="absolute bg-white/10 backdrop-blur-md top-[35%] left-[38%]   z-10 p-10 rounded-2xl shadow-2xl border border-white/20 text-white max-w-sm w-full"
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