function LeftNav({ children }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold text-gray-800">Book-Lab</h1>
        </div>
        <nav className="mt-4">
          <ul>
            <li>
              <a
                href="/:accountId"
                className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-6 h-6 mr-2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 10h18M9 21V3m6 18V3"
                  />
                </svg>
                My Profile
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-6 h-6 mr-2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.75 9.75L15 15m0-5.25L9.75 15m-3.25-3.25V3m0 18v-6"
                  />
                </svg>
                Trang chủ
              </a>
            </li>
            <li>
              <a
                href="/"
                className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-6 h-6 mr-2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.75 9.75L15 15m0-5.25L9.75 15m-3.25-3.25V3m0 18v-6"
                  />
                </svg>
                Lịch Đặt Phòng
              </a>
            </li>
            <li>
              <a
                href="/student-manage"
                className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-6 h-6 mr-2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
                Thêm/Tạo Nhóm
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-6 h-6 mr-2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.75 9.75L15 15m0-5.25L9.75 15m-3.25-3.25V3m0 18v-6"
                  />
                </svg>
                Hướng Dẫn Đặt Phòng
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-6 h-6 mr-2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.75 9.75L15 15m0-5.25L9.75 15m-3.25-3.25V3m0 18v-6"
                  />
                </svg>
                Báo cáo
              </a>
            </li>
          </ul>
        </nav>
      </div>
      {children}
    </div>
  );
}

export default LeftNav;
