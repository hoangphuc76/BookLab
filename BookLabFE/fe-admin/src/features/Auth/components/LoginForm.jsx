import React, { useEffect, useState } from 'react';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { useDispatch, useSelector } from 'react-redux';
import { googleLoginThunk } from '../AuthSlice';
import { Image } from 'antd';
import logoFpt from '../../../assets/LogoFpt.svg';
import { swtoast } from '../../../utils/swal';
import { useNavigate } from 'react-router-dom';
import { store } from '../../../store/store';
import { showLoader, hideLoader } from '../../../utils/loaderSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse } from '@fortawesome/free-solid-svg-icons';

const LoginFormContent = () => {
    const dispatch = useDispatch();
    const { status, error, roleId } = useSelector((state) => state.auth);
    const { isLogOut } = useSelector((state) => state.profile);
    const [logout, setLogout] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        setLogout(isLogOut);
    },[]);
      
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
        <div className="w-[400px] text-center">
            <div>
                <Image
                    width={200}
                    src={logoFpt}
                    alt="Example Image"
                    preview={false} // Tắt chế độ preview
                />
            </div>
            <div className="border-2 h-[180px] px-10 py-2 shadow-md">
                <h1 className="mb-7 text-[14px]">Login With Your Edu Email</h1>
                {/* Custom button styled similar to GoogleLogin */}
                <button
                    onClick={login}
                    className="flex rounded-full h-[40px] items-center justify-center w-full text-lg font-medium text-gray-700 bg-white border border-gray-300 rounded-pill hover:bg-gray-100"
                >
                    <span className="mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512" width="20" height="20">
                            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 
            110.8 504 0 393.2 0 256S110.8 8 248 8
            c66.8 0 123 24.5 166.3 64.9l-67.5 64.9
            C258.5 52.6 94.3 116.6 94.3 256
            c0 86.5 69.1 156.6 153.7 156.6 
            98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1
            c2.3 12.7 3.9 24.9 3.9 41.4z"/>
                        </svg>
                    </span>
                    <div className='text-[15px]'>
                        Continue with Google

                    </div>
                </button>
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