import React from 'react';
import gamma from '../../../assets/gamma.jpeg';
import { Dropdown, Menu, Button } from 'antd';

const Intro = () => {
    return (
        <>
            <div className='container pb-24 pt-10 lg:pb-28 lg:pt-16'>
                <div className='relative flex flex-col'>
                    <div className='flex flex-col lg:flex-row lg:items-center'>
                        <div className='flex flex-shrink-0 flex-col items-start space-y-6 pb-14 lg:me-10 lg:w-1/2 lg:space-y-10 lg:pb-64 xl:me-0 xl:pb-80 xl:pe-14'>
                            <h2 className="text-4xl font-medium leading-[110%] md:text-5xl xl:text-7xl">Gamma, Fuda</h2>
                            <div className="flex items-center text-base text-neutral-500 dark:text-neutral-400 md:text-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon" className="h-5 w-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"></path>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"></path>
                                </svg>
                                <span className="ms-2.5">Japan</span>
                                <span className="mx-5"></span>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon" className="h-5 w-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"></path>
                                </svg>
                                <span className="ms-2.5">112 properties</span>
                            </div>
                        </div>
                        <div className='flex-grow'>
                            <img className='w-[400px] rounded-xl' src={gamma} alt="FPT" />
                        </div>
                    </div>
                    <div className="hidden w-full lg:flow-root ">
                        <div className="z-10 w-full lg:-mt-40 xl:-mt-56 ">
                            <div className="nc-HeroSearchForm w-full max-w-6xl py-5 lg:py-0">
                                <form className="relative mt-8 flex w-full rounded-full bg-white shadow-2xl">
                                    <div className="StayDatesRangeInput relative z-10 flex flex-1" data-headlessui-state="">
                                        <button className="relative z-10 flex flex-1 nc-hero-field-padding items-center gap-x-3 focus:outline-none" type="button" aria-expanded="false" data-headlessui-state="" id="headlessui-popover-button-:rk:">
                                            <div className="text-neutral-300 dark:text-neutral-400">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon" className="h-5 w-5 lg:h-7 lg:w-7">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"></path>
                                                </svg>
                                            </div>
                                            <div className="flex-grow text-start">
                                                <div className='flex gap-2'>
                                                    <span className="block font-semibold xl:text-lg">Slot 1</span>
                                                    <span className="block font-semibold xl:text-lg">-</span>
                                                    <span className="block font-semibold xl:text-lg">Slot 2</span>
                                                </div>
                                                <span className="mt-1 block text-sm font-light leading-none text-neutral-400">Check In - Check Out</span>
                                            </div>
                                        </button>
                                    </div>
                                    <div className="h-8 self-center border-r border-slate-200 dark:border-slate-700"></div>
                                    <div className="StayDatesRangeInput relative z-10 flex flex-1" data-headlessui-state="">
                                        <button className="relative z-10 flex flex-1 nc-hero-field-padding items-center gap-x-3 focus:outline-none" type="button" aria-expanded="false" data-headlessui-state="" id="headlessui-popover-button-:rk:">
                                            <div className="text-neutral-300 dark:text-neutral-400">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon" className="h-5 w-5 lg:h-7 lg:w-7">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"></path>
                                                </svg>
                                            </div>
                                            <div className="flex-grow text-start">
                                                <span className="block font-semibold xl:text-lg">Feb 06 - Feb 23</span>
                                                <span className="mt-1 block text-sm font-light leading-none text-neutral-400">Check In - Check Out</span>
                                            </div>
                                        </button>
                                    </div>
                                    <div className="h-8 self-center border-r border-slate-200 dark:border-slate-700"></div>
                                    <div className="relative flex flex-1" data-headlessui-state="">
                                        <div className="z-10 flex flex-1 items-center focus:outline-none">
                                            <button className="relative z-10 flex flex-1 items-center text-start nc-hero-field-padding gap-x-3 focus:outline-none" type="button" aria-expanded="false" data-headlessui-state="" id="headlessui-popover-button-:ro:">
                                                <div className="text-neutral-300 dark:text-neutral-400">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon" className="h-5 w-5 lg:h-7 lg:w-7">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"></path>
                                                    </svg>
                                                </div>
                                                <div className="flex-grow">
                                                    <span className="block font-semibold xl:text-lg">4 Student</span>
                                                    <span className="mt-1 block text-sm font-light leading-none text-neutral-400">Student</span>
                                                </div>
                                            </button>
                                            <div className="pe-2 xl:pe-4">
                                                <a type="button" className="flex h-14 w-full items-center justify-center rounded-full bg-[#4338CA] text-neutral-50 hover:bg-primary-700 focus:outline-none md:h-16 md:w-16" href="/listing-stay-map">
                                                    <span className="me-3 md:hidden">Search</span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="currentColor" fill="none" className="h-6 w-6">
                                                        <path d="M17.5 17.5L22 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                                        <path d="M20 11C20 6.02944 15.9706 2 11 2C6.02944 2 2 6.02944 2 11C2 15.9706 6.02944 20 11 20C15.9706 20 20 15.9706 20 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"></path>
                                                    </svg>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Intro;