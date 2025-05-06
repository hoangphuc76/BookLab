import React from 'react'

const SearchPageResponsive = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] min-h-screen w-full overflow-y-auto bg-white">
      <div className="relative flex h-full flex-1 flex-col justify-between">
        {/* Close button */}
        <div className="absolute start-4 top-4">
          <button onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-black dark:text-white">
              <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex w-full justify-center gap-x-6 pt-12 text-sm font-semibold text-neutral-500 sm:gap-x-8 sm:text-base">
          <div className="relative select-none">
            <div className="text-black">Stay</div>
            <span className="absolute inset-x-0 top-full border-b-2 border-black"></span>
          </div>
          <div className="relative select-none">
            <div>Experiences</div>
          </div>
          <div className="relative select-none">
            <div>Cars</div>
          </div>
          <div className="relative select-none">
            <div>Flights</div>
          </div>
        </div>

        {/* Search Form */}
        <div className="flex flex-1 overflow-hidden px-1.5 pt-3 sm:px-4">
          <div className="hiddenScrollbar flex-1 overflow-y-auto py-4">
            <div className="animate-[myblur_0.4s_ease-in-out] transition-opacity">
              <div className="w-full space-y-3">
                {/* Where */}
                <div className="w-full rounded-xl bg-white shadow-sm dark:bg-neutral-800">
                  <div className="p-5">
                    <span className="block text-xl font-semibold sm:text-2xl">Where to?</span>
                    <div className="relative mt-5">
                      <input
                        className="block w-full truncate rounded-xl border border-neutral-800 bg-transparent px-4 py-3 pe-12 text-base font-medium leading-none placeholder-neutral-500 focus:border-primary-300 focus:ring focus:ring-primary-200"
                        placeholder="Search destinations"
                      />
                      <span className="absolute end-2.5 top-1/2 -translate-y-1/2">
                        <svg className="h-5 w-5 text-neutral-700" viewBox="0 0 24 24" fill="none">
                          <path d="M17.5 17.5L22 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M20 11C20 6.02944 15.9706 2 11 2C6.02944 2 2 6.02944 2 11C2 15.9706 6.02944 20 11 20C15.9706 20 20 15.9706 20 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>

                {/* When */}
                <div className="w-full rounded-xl bg-white shadow-sm dark:bg-neutral-800">
                  <button className="flex w-full justify-between p-4 text-sm font-medium">
                    <span className="text-neutral-400">When</span>
                    <span>Select dates</span>
                  </button>
                </div>

                {/* Who */}
                <div className="w-full rounded-xl bg-white shadow-sm dark:bg-neutral-800">
                  <button className="flex w-full justify-between p-4 text-sm font-medium">
                    <span className="text-neutral-400">Who</span>
                    <span>Add guests</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between border-t border-neutral-200 bg-white px-4 py-3">
          <button type="button" className="flex-shrink-0 text-sm font-medium underline">
            Clear all
          </button>
          <button type="submit" className="flex flex-shrink-0 cursor-pointer items-center justify-center rounded-lg bg-primary-600 px-4 py-2.5 text-sm text-neutral-50">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
              <path d="M17.5 17.5L22 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20 11C20 6.02944 15.9706 2 11 2C6.02944 2 2 6.02944 2 11C2 15.9706 6.02944 20 11 20C15.9706 20 20 15.9706 20 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
            <span className="ms-2">Search</span>
          </button>
        </div>

      </div>
    </div>
  )
}

export default SearchPageResponsive