import React, { useState } from 'react';
import { 
  FaQuestionCircle, 
  FaInfoCircle, 
  FaPhoneAlt, 
  FaEnvelope, 
  FaUserShield, 
  FaUserTie, 
  FaUserGraduate, 
  FaChartBar,
  FaBuilding,
  FaUsers,
  FaTags,
  FaDoorOpen,
  FaCalendarAlt,
  FaFileExport,
  FaClock,
  FaRegChartBar
} from 'react-icons/fa';

function Helps() {
  const [activeRole, setActiveRole] = useState('admin'); // 'admin', 'manager', 'met'

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Tiêu đề trang */}
      <h1 className="text-3xl font-bold mb-6 text-slate-800 flex items-center">
        <FaQuestionCircle className="mr-3 text-indigo-600" />
        Hỗ trợ & Hướng dẫn
      </h1>

      {/* Role Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8 transition-all hover:shadow-md">
        <h2 className="text-xl font-bold text-slate-800 mb-5 flex items-center">
          <FaUsers className="mr-3 text-indigo-600" />
          Chọn vai trò của bạn
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div 
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
              activeRole === 'admin' 
                ? 'border-indigo-500 bg-indigo-50' 
                : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
            }`}
            onClick={() => setActiveRole('admin')}
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${activeRole === 'admin' ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                <FaUserShield className={`h-8 w-8 ${activeRole === 'admin' ? 'text-indigo-600' : 'text-slate-600'}`} />
              </div>
              <div className="ml-4">
                <h3 className={`font-bold text-lg ${activeRole === 'admin' ? 'text-indigo-700' : 'text-slate-700'}`}>Admin</h3>
                <p className="text-slate-500 text-sm">Quản trị viên hệ thống</p>
              </div>
            </div>
          </div>
          
          <div 
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
              activeRole === 'manager' 
                ? 'border-indigo-500 bg-indigo-50' 
                : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
            }`}
            onClick={() => setActiveRole('manager')}
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${activeRole === 'manager' ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                <FaUserTie className={`h-8 w-8 ${activeRole === 'manager' ? 'text-indigo-600' : 'text-slate-600'}`} />
              </div>
              <div className="ml-4">
                <h3 className={`font-bold text-lg ${activeRole === 'manager' ? 'text-indigo-700' : 'text-slate-700'}`}>Manager</h3>
                <p className="text-slate-500 text-sm">Quản lý đặt phòng</p>
              </div>
            </div>
          </div>
          
          <div 
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
              activeRole === 'met' 
                ? 'border-indigo-500 bg-indigo-50' 
                : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
            }`}
            onClick={() => setActiveRole('met')}
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${activeRole === 'met' ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                <FaUserGraduate className={`h-8 w-8 ${activeRole === 'met' ? 'text-indigo-600' : 'text-slate-600'}`} />
              </div>
              <div className="ml-4">
                <h3 className={`font-bold text-lg ${activeRole === 'met' ? 'text-indigo-700' : 'text-slate-700'}`}>MET</h3>
                <p className="text-slate-500 text-sm">Quản lý phòng giáo viên</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Role Guide */}
      {activeRole === 'admin' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2 hover:shadow-md transition-all">
              <h2 className="text-xl font-bold text-slate-800 mb-5 flex items-center">
                <FaChartBar className="mr-3 text-indigo-600" />
                Dashboard - Tổng quan hệ thống
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h3 className="text-md font-semibold text-indigo-700 mb-2 flex items-center">
                    <FaRegChartBar className="mr-2" /> Chức năng thống kê
                  </h3>
                  <ul className="list-disc list-inside text-slate-700 space-y-2 pl-4">
                    <li>Xem tổng số lượng đặt phòng trong khoảng thời gian</li>
                    <li>Theo dõi tỷ lệ phòng được phê duyệt, hủy</li>
                    <li>Thống kê số lượng giảng viên đã đặt phòng</li>
                    <li>Biểu đồ xu hướng đặt phòng theo thời gian</li>
                    <li>Phân tích đặt phòng theo ngày trong tuần</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h3 className="text-md font-semibold text-indigo-700 mb-2 flex items-center">
                    <FaCalendarAlt className="mr-2" /> Xem lịch đặt phòng
                  </h3>
                  <ul className="list-disc list-inside text-slate-700 space-y-2 pl-4">
                    <li>Xem danh sách các đặt phòng sắp tới</li>
                    <li>Theo dõi trạng thái đặt phòng (đang diễn ra/sắp tới)</li>
                    <li>Thống kê thời gian cao điểm sử dụng phòng</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h3 className="text-md font-semibold text-indigo-700 mb-2 flex items-center">
                    <FaFileExport className="mr-2" /> Xuất báo cáo
                  </h3>
                  <ul className="list-disc list-inside text-slate-700 space-y-2 pl-4">
                    <li>Xuất thông tin phòng trống theo ngày hoặc khoảng thời gian</li>
                    <li>Xuất lịch sử đặt phòng theo khoảng thời gian</li>
                    <li>Tùy chọn xuất định dạng theo cả ngày đơn và nhiều ngày</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <h2 className="text-xl font-bold text-slate-800 mb-5 flex items-center">
                <FaUsers className="mr-3 text-indigo-600" />
                Quản lý tài khoản
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h3 className="text-md font-semibold text-indigo-700 mb-2">Chức năng quản lý</h3>
                  <ul className="list-disc list-inside text-slate-700 space-y-2 pl-4">
                    <li>Thêm tài khoản mới cho người dùng</li>
                    <li>Chỉnh sửa thông tin tài khoản hiện có</li>
                    <li>Vô hiệu hóa/kích hoạt tài khoản</li>
                    <li>Nhập/xuất dữ liệu từ file Excel</li>
                    <li>Phân quyền tài khoản (Admin, Manager, MET, Lecturer)</li>
                  </ul>
                </div>
                
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-slate-500 text-sm font-medium">Hướng dẫn nhập file Excel</span>
                    <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full">Mẹo</span>
                  </div>
                  <ol className="list-decimal list-inside text-slate-700 space-y-2 pl-2 text-sm">
                    <li>Tải xuống template Excel</li>
                    <li>Điền thông tin tài khoản cần thêm</li>
                    <li>Nhấp "Import Excel" và chọn file đã điền</li>
                    <li>Hệ thống sẽ tự động xử lý và thêm tài khoản</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <h2 className="text-xl font-bold text-slate-800 mb-5 flex items-center">
                <FaBuilding className="mr-3 text-indigo-600" />
                Quản lý tòa nhà
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h3 className="text-md font-semibold text-indigo-700 mb-2">Chức năng quản lý</h3>
                  <ul className="list-disc list-inside text-slate-700 space-y-2 pl-4">
                    <li>Thêm tòa nhà mới vào hệ thống</li>
                    <li>Cập nhật thông tin tòa nhà</li>
                    <li>Thay đổi trạng thái tòa nhà</li>
                    <li>Quản lý hình ảnh tòa nhà</li>
                    <li>Gán tòa nhà cho campus</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h3 className="text-md font-semibold text-indigo-700 mb-2">Tùy chọn nhập liệu hàng loạt</h3>
                  <ul className="list-disc list-inside text-slate-700 space-y-2 pl-4">
                    <li>Nhập dữ liệu từ file Excel</li>
                    <li>Tải template cho thông tin tòa nhà</li>
                  </ul>
                </div>
              </div>
            </div>
        
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <h2 className="text-xl font-bold text-slate-800 mb-5 flex items-center">
                <FaTags className="mr-3 text-indigo-600" />
                Quản lý loại phòng
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h3 className="text-md font-semibold text-indigo-700 mb-2">Chức năng quản lý</h3>
                  <ul className="list-disc list-inside text-slate-700 space-y-2 pl-4">
                    <li>Thêm loại phòng mới (phòng học, phòng lab, phòng họp...)</li>
                    <li>Cập nhật thông tin loại phòng</li>
                    <li>Kích hoạt/vô hiệu hóa loại phòng</li>
                    <li>Xem thống kê số lượng phòng theo từng loại</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 mt-4">
                  <div className="flex items-center text-blue-700 mb-2">
                    <FaInfoCircle className="mr-2" />
                    <h3 className="text-md font-semibold">Lưu ý</h3>
                  </div>
                  <p className="text-blue-700 text-sm">
                    Loại phòng ảnh hưởng trực tiếp đến việc hiển thị trong hệ thống đặt phòng và các báo cáo thống kê. Hãy đảm bảo đặt tên rõ ràng và có ý nghĩa.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <h2 className="text-xl font-bold text-slate-800 mb-5 flex items-center">
                <FaDoorOpen className="mr-3 text-indigo-600" />
                Quản lý phòng
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h3 className="text-md font-semibold text-indigo-700 mb-2">Chức năng quản lý</h3>
                  <ul className="list-disc list-inside text-slate-700 space-y-2 pl-4">
                    <li>Thêm phòng mới vào tòa nhà</li>
                    <li>Cập nhật thông tin phòng (số phòng, sức chứa, hình ảnh)</li>
                    <li>Gán phòng cho loại phòng thích hợp</li>
                    <li>Gán người quản lý phòng</li>
                    <li>Thay đổi trạng thái phòng (Có sẵn, Bảo trì, Đã đặt)</li>
                    <li>Nhập/Xuất danh sách phòng qua Excel</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h3 className="text-md font-semibold text-indigo-700 mb-2">Quản lý trạng thái phòng</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm">
                      Đang hoạt động (1)
                    </div>
                    <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm">
                      Dừng hoạt động (0)
                    </div>
                    <div className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-sm">
                      Bảo trì (2)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <h2 className="text-xl font-bold text-slate-800 mb-5 flex items-center">
                <FaUsers className="mr-3 text-indigo-600" />
                Quản lý vai trò
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h3 className="text-md font-semibold text-indigo-700 mb-2">Chức năng quản lý</h3>
                  <ul className="list-disc list-inside text-slate-700 space-y-2 pl-4">
                    <li>Thêm vai trò mới vào hệ thống</li>
                    <li>Cập nhật tên và thông tin vai trò</li>
                    <li>Kích hoạt hoặc vô hiệu hóa vai trò</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mt-4">
                  <h3 className="text-md font-semibold text-indigo-700 mb-2">Vai trò mặc định</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                    <div className="p-3 border border-slate-200 bg-white rounded-lg">
                      <div className="text-indigo-600 font-medium">Admin</div>
                      <div className="text-slate-500 text-xs mt-1">Quản trị viên hệ thống</div>
                    </div>
                    
                    <div className="p-3 border border-slate-200 bg-white rounded-lg">
                      <div className="text-indigo-600 font-medium">Manager</div>
                      <div className="text-slate-500 text-xs mt-1">Quản lý duyệt phòng</div>
                    </div>
                    
                    <div className="p-3 border border-slate-200 bg-white rounded-lg">
                      <div className="text-indigo-600 font-medium">MET</div>
                      <div className="text-slate-500 text-xs mt-1">Quản lý phòng đào tạo</div>
                    </div>
                    <div className="p-3 border border-slate-200 bg-white rounded-lg">
                      <div className="text-indigo-600 font-medium">Lecturer</div>
                      <div className="text-slate-500 text-xs mt-1">Quản lý phòng giáo viên</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Manager Role Guide */}
      {activeRole === 'manager' && (
        <>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-5 flex items-center">
              <FaChartBar className="mr-3 text-indigo-600" />
              Dashboard - Quản lý đặt phòng
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h3 className="text-md font-semibold text-indigo-700 mb-2 flex items-center">
                    <FaRegChartBar className="mr-2" /> Tổng quan đặt phòng
                  </h3>
                  <ul className="list-disc list-inside text-slate-700 space-y-2 pl-4">
                    <li>Xem tổng số lượng đặt phòng trong khoảng thời gian</li>
                    <li>Theo dõi tỷ lệ phê duyệt và hủy đặt phòng</li>
                    <li>Biểu đồ phân tích xu hướng đặt phòng theo thời gian</li>
                    <li>Phân phối đặt phòng theo ngày trong tuần</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h3 className="text-md font-semibold text-indigo-700 mb-2 flex items-center">
                    <FaCalendarAlt className="mr-2" /> Lịch sắp tới
                  </h3>
                  <ul className="list-disc list-inside text-slate-700 space-y-2 pl-4">
                    <li>Xem danh sách các lần đặt phòng sắp tới</li>
                    <li>Theo dõi trạng thái đặt phòng (đang diễn ra/sắp tới)</li>
                    <li>Kiểm tra chi tiết về người đặt và phòng</li>
                  </ul>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 h-full">
                  <h3 className="text-md font-semibold text-indigo-700 mb-2 flex items-center">
                    <FaFileExport className="mr-2" /> Xuất báo cáo
                  </h3>
                  <ul className="list-disc list-inside text-slate-700 space-y-2 pl-4">
                    <li>Xuất báo cáo phòng trống theo ngày</li>
                    <li>Xuất lịch sử đặt phòng</li>
                    <li>Tùy chọn khoảng thời gian xuất báo cáo</li>
                  </ul>
                  
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-700 border border-blue-100">
                    <strong>Mẹo:</strong> Sử dụng tùy chọn "Thời gian" để lọc dữ liệu theo năm học và học kỳ, giúp báo cáo chính xác hơn.
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <h2 className="text-xl font-bold text-slate-800 mb-5 flex items-center">
                <FaCalendarAlt className="mr-3 text-indigo-600" />
                Quản lý đặt phòng
              </h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h3 className="text-md font-semibold text-indigo-700 mb-2">Phê duyệt đặt phòng</h3>
                  <ul className="list-disc list-inside text-slate-700 space-y-2 pl-4">
                    <li>Xem danh sách yêu cầu đặt phòng chờ phê duyệt</li>
                    <li>Phê duyệt hoặc từ chối yêu cầu</li>
                    <li>Thêm ghi chú khi từ chối để người dùng hiểu lý do</li>
                    <li>Kiểm tra xung đột lịch trước khi phê duyệt</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h3 className="text-md font-semibold text-indigo-700 mb-2">Quản lý lịch đặt phòng</h3>
                  <ul className="list-disc list-inside text-slate-700 space-y-2 pl-4">
                    <li>Xem tất cả lịch đặt phòng trong hệ thống</li>
                    <li>Lọc theo ngày, phòng, người đặt hoặc trạng thái</li>
                    <li>Hủy lịch đặt phòng khi cần thiết</li>
                    <li>Điều chỉnh thời gian hoặc phòng cho lịch đặt</li>
                  </ul>
                </div>
                
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-slate-700 font-medium">Trạng thái đặt phòng</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-lg text-center">
                      <span className="text-xs font-medium text-indigo-700">Chờ duyệt</span>
                    </div>
                    <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-lg text-center">
                      <span className="text-xs font-medium text-emerald-700">Đã duyệt</span>
                    </div>
                    <div className="p-2 bg-rose-50 border border-rose-100 rounded-lg text-center">
                      <span className="text-xs font-medium text-rose-700">Đã từ chối</span>
                    </div>
                    <div className="p-2 bg-amber-50 border border-amber-100 rounded-lg text-center">
                      <span className="text-xs font-medium text-amber-700">Đang diễn ra</span>
                    </div>
                    <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg text-center">
                      <span className="text-xs font-medium text-slate-700">Đã hoàn thành</span>
                    </div>
                    <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg text-center">
                      <span className="text-xs font-medium text-slate-700">Đã hủy</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <h2 className="text-xl font-bold text-slate-800 mb-5 flex items-center">
                <FaDoorOpen className="mr-3 text-indigo-600" />
                Quản lý phòng
              </h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h3 className="text-md font-semibold text-indigo-700 mb-2">Xem thông tin phòng</h3>
                  <ul className="list-disc list-inside text-slate-700 space-y-2 pl-4">
                    <li>Xem danh sách tất cả các phòng</li>
                    <li>Kiểm tra thông tin chi tiết về phòng (sức chứa, trang thiết bị)</li>
                    <li>Xem lịch sử đặt phòng của một phòng cụ thể</li>
                    <li>Kiểm tra tình trạng phòng hiện tại</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h3 className="text-md font-semibold text-indigo-700 mb-2">Cập nhật trạng thái phòng</h3>
                  <ul className="list-disc list-inside text-slate-700 space-y-2 pl-4">
                    <li>Đánh dấu phòng đang bảo trì</li>
                    <li>Cập nhật tình trạng sẵn có của phòng</li>
                    <li>Ghi chú về tình trạng phòng khi cần thiết</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <div className="flex items-center text-indigo-700 mb-2">
                  <FaClock className="mr-2" />
                  <h3 className="text-md font-semibold">Khung giờ đặt phòng</h3>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-2">Khung giờ cũ (6 Slot)</h4>
                    <div className="space-y-1 text-xs">
                      <div className="p-1.5 bg-white rounded border border-slate-200 text-slate-600">Slot 1: 7:00 - 8:30</div>
                      <div className="p-1.5 bg-white rounded border border-slate-200 text-slate-600">Slot 2: 8:45 - 10:15</div>
                      <div className="p-1.5 bg-white rounded border border-slate-200 text-slate-600">Slot 3: 10:30 - 12:00</div>
                      <div className="p-1.5 bg-white rounded border border-slate-200 text-slate-600">Slot 4: 12:30 - 14:00</div>
                      <div className="p-1.5 bg-white rounded border border-slate-200 text-slate-600">Slot 5: 14:15 - 15:45</div>
                      <div className="p-1.5 bg-white rounded border border-slate-200 text-slate-600">Slot 6: 16:00 - 17:30</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-2">Khung giờ mới (4 Slot)</h4>
                    <div className="space-y-1 text-xs">
                      <div className="p-1.5 bg-white rounded border border-slate-200 text-slate-600">Slot 1: 7:00 - 9:15</div>
                      <div className="p-1.5 bg-white rounded border border-slate-200 text-slate-600">Slot 2: 9:30 - 11:45</div>
                      <div className="p-1.5 bg-white rounded border border-slate-200 text-slate-600">Slot 3: 12:30 - 14:45</div>
                      <div className="p-1.5 bg-white rounded border border-slate-200 text-slate-600">Slot 4: 15 - 17:15</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* MET Role Guide */}
      {activeRole === 'met' && (
        <>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-5 flex items-center">
              <FaUserGraduate className="mr-3 text-indigo-600" />
              Vai trò MET - Giới thiệu
            </h2>
            
            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 mb-6">
              <p className="text-indigo-700">
                Vai trò MET (Phòng đào tạo) cho phép bạn quản lý việc đặt phòng và sử dụng phòng cho giảng viên. Bạn có thể xem lịch đặt phòng, tạo yêu cầu đặt phòng mới và theo dõi tình trạng sử dụng phòng.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h3 className="text-md font-semibold text-indigo-700 mb-2 flex items-center">
                    <FaCalendarAlt className="mr-2" /> Đặt phòng
                  </h3>
                  <ul className="list-disc list-inside text-slate-700 space-y-2 pl-4">
                    <li>Tạo yêu cầu đặt phòng mới cho giảng viên</li>
                    <li>Xem danh sách phòng có sẵn theo ngày và giờ</li>
                    <li>Kiểm tra tình trạng phòng trước khi đặt</li>
                    <li>Theo dõi trạng thái yêu cầu đặt phòng</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h3 className="text-md font-semibold text-indigo-700 mb-2 flex items-center">
                    <FaDoorOpen className="mr-2" /> Tìm phòng trống
                  </h3>
                  <ul className="list-disc list-inside text-slate-700 space-y-2 pl-4">
                    <li>Tìm phòng trống theo thời gian cụ thể</li>
                    <li>Lọc theo loại phòng, sức chứa, trang thiết bị</li>
                    <li>Xem thông tin chi tiết về phòng</li>
                    <li>Kiểm tra lịch sử sử dụng của phòng</li>
                  </ul>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h3 className="text-md font-semibold text-indigo-700 mb-2 flex items-center">
                    <FaChartBar className="mr-2" /> Thống kê và báo cáo
                  </h3>
                  <ul className="list-disc list-inside text-slate-700 space-y-2 pl-4">
                    <li>Xem thống kê đặt phòng của phòng giáo viên</li>
                    <li>Theo dõi tần suất sử dụng phòng</li>
                    <li>Xem báo cáo đặt phòng theo giáo viên</li>
                    <li>Phân tích thời gian sử dụng cao điểm</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h3 className="text-md font-semibold text-indigo-700 mb-2 flex items-center">
                    <FaFileExport className="mr-2" /> Xuất báo cáo
                  </h3>
                  <ul className="list-disc list-inside text-slate-700 space-y-2 pl-4">
                    <li>Xuất báo cáo phòng trống theo ngày</li>
                    <li>Xuất lịch sử đặt phòng của phòng giáo viên</li>
                    <li>Tùy chọn xuất theo khoảng thời gian</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-5 flex items-center">
              <FaRegChartBar className="mr-3 text-indigo-600" />
              Quy trình đặt phòng
            </h2>
            
            <div className="p-4">
              <ol className="relative border-l border-indigo-200">
                <li className="mb-8 ml-6">
                  <span className="absolute flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-full -left-4 ring-4 ring-white">
                    <span className="text-indigo-600 font-semibold">1</span>
                  </span>
                  <h3 className="font-semibold text-indigo-700">Tìm phòng trống</h3>
                  <p className="text-slate-600 text-sm mt-1">Truy cập mục "Tìm phòng trống" và chọn ngày, giờ phù hợp với yêu cầu của giảng viên.</p>
                </li>
                <li className="mb-8 ml-6">
                  <span className="absolute flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-full -left-4 ring-4 ring-white">
                    <span className="text-indigo-600 font-semibold">2</span>
                  </span>
                  <h3 className="font-semibold text-indigo-700">Đặt phòng</h3>
                  <p className="text-slate-600 text-sm mt-1">Chọn phòng phù hợp, điền thông tin giảng viên, lý do đặt phòng và các yêu cầu khác nếu có.</p>
                </li>
                <li className="mb-8 ml-6">
                  <span className="absolute flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-full -left-4 ring-4 ring-white">
                    <span className="text-indigo-600 font-semibold">3</span>
                  </span>
                  <h3 className="font-semibold text-indigo-700">Chờ phê duyệt</h3>
                  <p className="text-slate-600 text-sm mt-1">Yêu cầu đặt phòng sẽ được gửi đến Manager để phê duyệt. Bạn có thể theo dõi trạng thái trong mục "Lịch sử đặt phòng".</p>
                </li>
                <li className="mb-8 ml-6">
                  <span className="absolute flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-full -left-4 ring-4 ring-white">
                    <span className="text-indigo-600 font-semibold">4</span>
                  </span>
                  <h3 className="font-semibold text-indigo-700">Nhận thông báo</h3>
                  <p className="text-slate-600 text-sm mt-1">Khi yêu cầu được phê duyệt hoặc từ chối, hệ thống sẽ gửi thông báo cho bạn và giảng viên.</p>
                </li>
                <li className="ml-6">
                  <span className="absolute flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-full -left-4 ring-4 ring-white">
                    <span className="text-indigo-600 font-semibold">5</span>
                  </span>
                  <h3 className="font-semibold text-indigo-700">Sử dụng phòng</h3>
                  <p className="text-slate-600 text-sm mt-1">Giảng viên có thể sử dụng phòng theo thời gian đã đặt. Trạng thái đặt phòng sẽ được cập nhật thành "Đang diễn ra" trong thời gian này.</p>
                </li>
              </ol>
            </div>
          </div>
        </>
      )}

      {/* Phần Liên hệ hỗ trợ */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <FaPhoneAlt className="mr-2 text-indigo-600" />
          Liên hệ hỗ trợ
        </h2>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <p className="text-slate-600 mb-4">
            Nếu bạn gặp bất kỳ vấn đề nào khi sử dụng hệ thống, vui lòng liên hệ với chúng tôi qua các kênh sau:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <ul className="list-none text-slate-700 space-y-4">
                <li className="flex items-center">
                  <FaPhoneAlt className="mr-3 text-indigo-600" />
                  <div>
                    <span className="font-medium">Số điện thoại:</span>
                    <div className="text-indigo-600 font-medium mt-1">0702326806</div>
                  </div>
                </li>
                <li className="flex items-center">
                  <FaEnvelope className="mr-3 text-indigo-600" />
                  <div>
                    <span className="font-medium">Email:</span>
                    <div className="text-indigo-600 mt-1">
                      <a href="mailto:haindde180824@fpt.edu.vn" className="hover:underline">haindde180824@fpt.edu.vn</a>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <h3 className="font-medium text-slate-800 mb-2">Thời gian hỗ trợ</h3>
              <ul className="space-y-2 text-slate-700">
                <li className="flex justify-between">
                  <span>Thứ 2 - Thứ 6:</span>
                  <span className="font-medium">8:00 - 17:30</span>
                </li>
                <li className="flex justify-between">
                  <span>Thứ 7:</span>
                  <span className="font-medium">8:00 - 12:00</span>
                </li>
                <li className="flex justify-between">
                  <span>Chủ nhật:</span>
                  <span className="font-medium">Không hỗ trợ</span>
                </li>
              </ul>
              <div className="mt-4 text-sm text-indigo-600">
                <span className="bg-indigo-100 px-2 py-1 rounded-full">Ưu tiên hỗ trợ qua email</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-center text-blue-700 mb-2">
              <FaInfoCircle className="mr-2" />
              <h3 className="text-md font-semibold">Thông tin phiên bản</h3>
            </div>
            <ul className="list-disc list-inside text-blue-700 space-y-1 pl-2">
              <li><strong>Phiên bản:</strong> 2.0.0</li>
              <li><strong>Ngày phát hành:</strong> 20/03/2025</li>
              <li><strong>Phát triển bởi:</strong> Faise Team - BookLab Projects</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Helps;