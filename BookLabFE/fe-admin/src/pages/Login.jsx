import React from 'react';
import LoginForm from '../features/Auth/components/LoginForm';
import GammaBuilding from '../assets//gamma.jpeg'

const Login = () => {
    return (
        <div className='flex flex-col md:flex-row h-full'>
            <div className='w-full md:w-[45%] px-10 flex flex-col justify-center items-center mt-20 md:mt-0'>
                <div className=''>
                    <LoginForm />
                </div>
            </div>
            <div className='hidden md:block md:w-[55%]'>
                <div className='w-full h-full'>
                    <img src={GammaBuilding} alt="" className='w-full h-full object-cover' />
                </div>
            </div>
        </div>
    );
};

export default Login;