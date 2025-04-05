import React from 'react'

const FooterResponsive = () => {
    return (
        <>
            <div class="FooterNav block md:!hidden p-2  fixed top-auto bottom-0 inset-x-0 z-30 bg-white  border-neutral-300 transition-transform duration-300 ease-in-out">
                <div class="w-full max-w-lg flex justify-around mx-auto text-sm text-center ">
                    <a class="flex flex-col items-center justify-between text-neutral-500  text-neutral-900 dark:text-neutral-100" href="/"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon" class="w-6 h-6 text-red-600">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z">
                        </path>
                    </svg>
                        <span class="text-[11px] leading-none mt-1 text-red-600">Explore</span>
                    </a>
                    <a class="flex flex-col items-center justify-between text-neutral-500  " href="/account-savelists">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon" class="w-6 h-6 ">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z">
                            </path>
                        </svg>
                        <span class="text-[11px] leading-none mt-1 ">Wishlists</span>
                    </a>
                    <a class="flex flex-col items-center justify-between text-neutral-500  " href="/account">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon" class="w-6 h-6 ">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z">
                            </path>
                        </svg>
                        <span class="text-[11px] leading-none mt-1 ">Log in</span>
                    </a>
                    <div class="flex flex-col items-center justify-between text-neutral-500  ">
                        <button class="flex items-center justify-center focus:outline-none ">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" data-slot="icon" class="w-6 h-6">
                                <path fill-rule="evenodd" d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm8.25 5.25a.75.75 0 0 1 .75-.75h8.25a.75.75 0 0 1 0 1.5H12a.75.75 0 0 1-.75-.75Z" clip-rule="evenodd">
                                </path>
                            </svg>
                        </button>
                        <span class="text-[11px] leading-none mt-1">Menu</span>
                    </div>
                </div>
            </div>
        </>
    )
}

export default FooterResponsive