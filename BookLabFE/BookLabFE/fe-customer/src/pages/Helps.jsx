import React, { useState } from 'react';
import { 
  FaQuestionCircle, 
  FaInfoCircle, 
  FaPhoneAlt, 
  FaEnvelope, 
  FaUsers, 
  FaCalendarAlt, 
  FaBook, 
  FaUserCheck, 
  FaUserCog,
  FaChevronRight,
  FaLaptop,
  FaRegLightbulb,
  FaTimes,
  FaBars
} from 'react-icons/fa';
import { Image, Tabs } from "antd";
import importGroup from '../assets/help/importGroup.jpg';
import viewAllRoom from '../assets/help/viewAllRoom.jpg';
import addStudentGroup from '../assets/help/addStudentGroup.jpg';
import addStudentToSubBooking from '../assets/help/addStudentToSubBooking.jpg';
import booking from '../assets/help/booking.jpg';
import oneDayBooking from '../assets/help/oneDayBooking.jpg';
import mySchedule from '../assets/help/mySchedule.jpg';
import myScheduleChange from '../assets/help/myScheduleChange.jpg';

function Helps() {
  const [activeTab, setActiveTab] = useState("usage");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tabItems = [
    { 
      id: "usage", 
      title: "Hướng dẫn sử dụng", 
      icon: <FaBook className="mr-2" /> 
    },
    { 
      id: "system", 
      title: "Thông tin hệ thống", 
      icon: <FaLaptop className="mr-2" /> 
    },
    { 
      id: "contact", 
      title: "Liên hệ hỗ trợ", 
      icon: <FaPhoneAlt className="mr-2" /> 
    },
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-indigo-50/50">
      {/* Mobile menu toggle */}
      <div className="lg:hidden p-4 bg-white border-b border-indigo-100 sticky top-0 z-10 flex justify-between items-center">
        <h1 className="text-xl font-bold text-indigo-800 flex items-center">
          <FaQuestionCircle className="mr-2 text-indigo-600" />
          Hướng dẫn
        </h1>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-all"
        >
          {sidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Sidebar Navigation */}
        <div className={`
          lg:w-72 bg-white lg:min-h-screen lg:border-r border-indigo-100
          ${sidebarOpen ? 'block' : 'hidden'} lg:block fixed lg:static top-16 left-0 right-0 bottom-0 z-10
        `}>
          <div className="p-6">
            <h1 className="text-2xl font-bold text-indigo-800 mb-6 hidden lg:flex items-center">
              <FaQuestionCircle className="mr-3 text-indigo-600" />
              Hướng dẫn
            </h1>

            <nav className="space-y-2">
              {tabItems.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full flex items-center p-3 rounded-xl transition-all ${
                    activeTab === tab.id 
                      ? 'bg-indigo-100 text-indigo-700 font-medium' 
                      : 'hover:bg-indigo-50 text-slate-600'
                  }`}
                >
                  {tab.icon}
                  {tab.title}
                  {activeTab === tab.id && (
                    <FaChevronRight className="ml-auto text-indigo-500" />
                  )}
                </button>
              ))}
            </nav>

            <div className="mt-10 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <div className="flex items-center text-indigo-700 mb-2">
                <FaRegLightbulb className="mr-2" />
                <h3 className="font-semibold">Mẹo</h3>
              </div>
              <p className="text-sm text-indigo-700">
                Hãy xem video hướng dẫn trên YouTube để hiểu rõ hơn các chức năng của hệ thống.
              </p>
              <a 
                href="#" 
                className="mt-2 text-xs font-medium bg-indigo-600 text-white py-2 px-3 rounded-lg block text-center hover:bg-indigo-700 transition-all"
              >
                Xem video hướng dẫn
              </a>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 pb-20">
          {/* Usage Guide Content */}
          {activeTab === "usage" && (
            <div className="space-y-8 max-w-5xl mx-auto">
              <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
                <div className="p-6 border-b border-indigo-100">
                  <h2 className="text-2xl font-bold text-indigo-800 flex items-center">
                    <FaQuestionCircle className="mr-3 text-indigo-600" />
                    Hướng dẫn sử dụng
                  </h2>
                </div>

                <div className="divide-y divide-indigo-100">
                  {/* Section 1: Xem phòng lựa phòng */}
                  <div className="p-6 hover:bg-indigo-50/30 transition-all">
                    <h3 className="text-xl font-semibold text-indigo-800 mb-4 flex items-center">
                      <span className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 mr-3">1</span>
                      Chức năng xem phòng lựa phòng
                    </h3>
                    <div className="pl-11 space-y-4 text-slate-600">
                      <p>
                        Mỗi khi truy cập vào hệ thống, hệ thống sẽ tự động nhận diện bạn thuộc campus nào và bạn chỉ có thể xem những tòa nhà thuộc campus đó.
                      </p>
                      <p>
                        Khi đã bấm vào từng tòa nhà thì giao diện sẽ hiển thị ra các phòng cùng với thanh tìm kiếm.
                      </p>
                      
                      <div className="rounded-xl overflow-hidden border border-indigo-100">
                        <Image 
                          src={viewAllRoom}
                          alt='Ảnh tìm kiếm phòng'
                          preview={{mask: <div className="flex items-center justify-center text-white">Xem lớn</div>}}
                          className="w-full object-cover"
                        /> 
                        <div className="p-3 bg-indigo-50/50 text-sm text-indigo-700 italic">
                          Hình ảnh: Giao diện tìm kiếm phòng
                        </div>
                      </div>
                      
                      <p>
                        Trong từng khung hình sẽ có những bức ảnh của phòng cùng với một số thông tin cơ bản loại phòng, tên phòng, số lượng học sinh,...
                      </p>

                      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg my-4">
                        <div className="flex">
                          <FaInfoCircle className="text-amber-500 mr-3 mt-1 flex-shrink-0" />
                          <p className="text-amber-700">
                            <strong>Mẹo:</strong> Sử dụng bộ lọc để tìm phòng phù hợp với nhu cầu của bạn, như số chỗ ngồi hoặc thiết bị có sẵn.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Quản lý nhóm */}
                  <div className="p-6 hover:bg-indigo-50/30 transition-all">
                    <h3 className="text-xl font-semibold text-indigo-800 mb-4 flex items-center">
                      <span className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 mr-3">2</span>
                      <FaUsers className="mr-2 text-indigo-600" />
                      Chức năng quản lý nhóm
                    </h3>

                    <div className="pl-11 space-y-4 text-slate-600">
                      <p>
                        Ngay trên ảnh đại diện của bạn, khi bạn nhấn vào thì sẽ xổ ra một số thông tin và bạn nhấn vào <span className="font-medium text-indigo-700">"Manage Groups"</span> để quản lý nhóm.
                      </p>
                      
                      <p>
                        Tại đây bạn có thể xem các nhóm hiện có của mình và thêm nhóm mới vào.
                      </p>

                      <p>
                        Có chức năng thêm nhóm bằng một file excel.
                      </p>
                      
                      <div className="rounded-xl overflow-hidden border border-indigo-100 my-4">
                        <Image 
                          src={importGroup}
                          alt='Ảnh import'
                          preview={{mask: <div className="flex items-center justify-center text-white">Xem lớn</div>}}
                          className="w-full object-cover"
                        /> 
                        <div className="p-3 bg-indigo-50/50 text-sm text-indigo-700 italic">
                          Hình ảnh: Import nhóm từ file Excel
                        </div>
                      </div>
                      
                      <p>
                        Có thể nhấn vào từng nhóm để có thể quản lý thành viên trong nhóm.
                      </p>

                      <p>
                        Tại đây có thể xem được các lịch đặt sắp tới ở lịch bên phải
                      </p>

                      <p>
                        Tại đây có thể xóa thành viên trong nhóm trong trường hợp không có lịch đặt nào liên quan tới học sinh đó.
                      </p>

                      <p>
                        Khi thêm thành viên mới vào rồi, có thể chọn những lịch đặt để thêm thành viên mới vào lịch đặt trước đó (trong trường hợp quản lý chưa duyệt)
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
                        <div className="rounded-xl overflow-hidden border border-indigo-100">
                          <Image 
                            src={addStudentGroup}
                            alt='Ảnh thêm học sinh vào nhóm'
                            preview={{mask: <div className="flex items-center justify-center text-white">Xem lớn</div>}}
                            className="w-full object-cover"
                          /> 
                          <div className="p-3 bg-indigo-50/50 text-sm text-indigo-700 italic">
                            Hình ảnh: Thêm học sinh vào nhóm
                          </div>
                        </div>
                        
                        <div className="rounded-xl overflow-hidden border border-indigo-100">
                          <Image 
                            src={addStudentToSubBooking}
                            alt='Ảnh thêm học sinh vào lịch đặt'
                            preview={{mask: <div className="flex items-center justify-center text-white">Xem lớn</div>}}
                            className="w-full object-cover"
                          /> 
                          <div className="p-3 bg-indigo-50/50 text-sm text-indigo-700 italic">
                            Hình ảnh: Thêm học sinh vào lịch đặt
                          </div>
                        </div>
                      </div>

                      <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg">
                        <div className="flex">
                          <FaInfoCircle className="text-emerald-500 mr-3 mt-1 flex-shrink-0" />
                          <p className="text-emerald-700">
                            <strong>Lưu ý quan trọng:</strong> Khi nhập file Excel, đảm bảo file của bạn đúng định dạng với các cột: Họ tên, Email, và ID học sinh.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Xem phòng và đặt phòng */}
                  <div className="p-6 hover:bg-indigo-50/30 transition-all">
                    <h3 className="text-xl font-semibold text-indigo-800 mb-4 flex items-center">
                      <span className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 mr-3">3</span>
                      <FaCalendarAlt className="mr-2 text-indigo-600" />
                      Xem phòng và đặt phòng
                    </h3>
                    
                    <div className="pl-11 space-y-4 text-slate-600">
                      <p>
                        Khi đã nhấn vào một phòng bất kỳ từ trang xem phòng thì sẽ chuyển đến trang phòng đó.
                      </p>
                      
                      <p>
                        Bạn có thể xem mọi thông tin ở đây, các hình ảnh phòng, quản lý phòng, các thông tin vật dụng thiết bị và cả những đánh giá.
                      </p>
                      
                      <p>
                        Ở giữa trang sẽ là một lịch để bạn xem những lịch của đồng nghiệp, phòng đào tạo và những lịch mình đặt phòng ở dạng chưa duyệt và duyệt rồi.
                      </p>
                      
                      <p>
                        Trên khung lịch, bạn có thể lựa chọn tháng, tuần cũng như loại slot mà mình muốn đặt.
                      </p>
                      
                      <p>
                        Khi đã chọn xong rồi thì mình có thể kéo trên khung lịch để đặt.
                      </p>
                      
                      <div className="rounded-xl overflow-hidden border border-indigo-100 my-4">
                        <Image 
                          src={booking}
                          alt='Đặt lịch'
                          preview={{mask: <div className="flex items-center justify-center text-white">Xem lớn</div>}}
                          className="w-full object-cover"
                        /> 
                        <div className="p-3 bg-indigo-50/50 text-sm text-indigo-700 italic">
                          Hình ảnh: Đặt lịch trên giao diện lịch
                        </div>
                      </div>
                      
                      <p>
                        Bạn cũng có thể nhấn vào ngày cụ thể trên lịch thì sẽ hiển thị ra một sơ đồ chi tiết cụ thể hơn và bạn cũng có thể kéo để đặt tương tự.
                      </p>
                      
                      <div className="rounded-xl overflow-hidden border border-indigo-100 my-4">
                        <Image 
                          src={oneDayBooking}
                          alt='Đặt lịch từ sơ đồ'
                          preview={{mask: <div className="flex items-center justify-center text-white">Xem lớn</div>}}
                          className="w-full object-cover"
                        /> 
                        <div className="p-3 bg-indigo-50/50 text-sm text-indigo-700 italic">
                          Hình ảnh: Đặt lịch từ sơ đồ theo ngày
                        </div>
                      </div>
                      
                      <p>
                        Bạn có thể đặt một lúc nhiều lịch khác nhau với nhiều nhóm khác nhau.
                      </p>
                      
                      <p>
                        Khi nào bạn được quản lý duyệt thì sẽ có một thông báo gửi tới mail cũng như có lịch đồng bộ trên google calendar của bạn.
                      </p>

                      <div className="rounded-xl bg-indigo-50/70 p-4 border border-indigo-100">
                        <h4 className="font-medium text-indigo-700 mb-2 flex items-center">
                          <FaInfoCircle className="mr-2" />
                          Trạng thái lịch đặt
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          <div className="p-2 bg-indigo-100 border border-indigo-200 rounded-lg text-center">
                            <span className="text-xs font-medium text-indigo-700">Chờ duyệt</span>
                          </div>
                          <div className="p-2 bg-emerald-100 border border-emerald-200 rounded-lg text-center">
                            <span className="text-xs font-medium text-emerald-700">Đã duyệt</span>
                          </div>
                          <div className="p-2 bg-rose-100 border border-rose-200 rounded-lg text-center">
                            <span className="text-xs font-medium text-rose-700">Đã từ chối</span>
                          </div>
                          <div className="p-2 bg-amber-100 border border-amber-200 rounded-lg text-center">
                            <span className="text-xs font-medium text-amber-700">Đang diễn ra</span>
                          </div>
                          <div className="p-2 bg-slate-100 border border-slate-200 rounded-lg text-center">
                            <span className="text-xs font-medium text-slate-700">Đã hoàn thành</span>
                          </div>
                          <div className="p-2 bg-slate-100 border border-slate-200 rounded-lg text-center">
                            <span className="text-xs font-medium text-slate-700">Đã hủy</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Xem lịch của mình */}
                  <div className="p-6 hover:bg-indigo-50/30 transition-all">
                    <h3 className="text-xl font-semibold text-indigo-800 mb-4 flex items-center">
                      <span className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 mr-3">4</span>
                      <FaCalendarAlt className="mr-2 text-indigo-600" />
                      Xem lịch của mình
                    </h3>
                    
                    <div className="pl-11 space-y-4 text-slate-600">
                      <p>
                        Ngay trên ảnh đại diện của bạn, khi bạn nhấn vào thì sẽ xổ ra một số thông tin và bạn click vào <span className="font-medium text-indigo-700">"My schedule"</span> để xem lịch của mình.
                      </p>
                      
                      <p>
                        Ngoài ra với những lịch nào chưa được duyệt, khi bạn nhấn vào bạn có thể chỉnh sửa thành viên tham gia cũng như là hủy.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
                        <div className="rounded-xl overflow-hidden border border-indigo-100">
                          <Image 
                            src={mySchedule}
                            alt='Lịch của mình'
                            preview={{mask: <div className="flex items-center justify-center text-white">Xem lớn</div>}}
                            className="w-full object-cover"
                          /> 
                          <div className="p-3 bg-indigo-50/50 text-sm text-indigo-700 italic">
                            Hình ảnh: Xem lịch của mình
                          </div>
                        </div>
                        
                        <div className="rounded-xl overflow-hidden border border-indigo-100">
                          <Image 
                            src={myScheduleChange}
                            alt='Thay đổi lịch'
                            preview={{mask: <div className="flex items-center justify-center text-white">Xem lớn</div>}}
                            className="w-full object-cover"
                          /> 
                          <div className="p-3 bg-indigo-50/50 text-sm text-indigo-700 italic">
                            Hình ảnh: Thay đổi học sinh đã đặt
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 5: Điểm danh */}
                  <div className="p-6 hover:bg-indigo-50/30 transition-all">
                    <h3 className="text-xl font-semibold text-indigo-800 mb-4 flex items-center">
                      <span className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 mr-3">5</span>
                      <FaUserCheck className="mr-2 text-indigo-600" />
                      Chức năng điểm danh
                    </h3>
                    
                    <div className="pl-11 space-y-4 text-slate-600">
                      <p>
                        Ngay tại lịch của mình và với những lịch đã tới được chấp nhận cũng như đã đến giờ bắt đầu bạn có thể thực hiện chức năng điểm danh.
                      </p>
                      
                      <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg">
                        <div className="flex">
                          <FaInfoCircle className="text-emerald-500 mr-3 mt-1 flex-shrink-0" />
                          <div className="text-emerald-700">
                            <p className="font-semibold">Lưu ý về điểm danh:</p>
                            <ul className="list-disc list-inside mt-1">
                              <li>Chỉ điểm danh trong 15 phút đầu của buổi học</li>
                              <li>Cần đảm bảo điểm danh đúng người tham dự</li>
                              <li>Thống kê điểm danh sẽ được lưu lại để đánh giá sau này</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 6: Thông tin tài khoản */}
                  <div className="p-6 hover:bg-indigo-50/30 transition-all">
                    <h3 className="text-xl font-semibold text-indigo-800 mb-4 flex items-center">
                      <span className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 mr-3">6</span>
                      <FaUserCog className="mr-2 text-indigo-600" />
                      Xem thông tin tài khoản
                    </h3>
                    
                    <div className="pl-11 space-y-4 text-slate-600">
                      <p>
                        Ngay trên ảnh đại diện của bạn, khi bạn nhấn vào thì sẽ xổ ra một số thông tin và bạn click vào <span className="font-medium text-indigo-700">"My account"</span> để xem tài khoản của mình.
                      </p>
                      
                      <p>
                        Bạn có thể cập nhật thông tin như tên, ảnh đại diện, số điện thoại,...
                      </p>
                      
                      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                        <h4 className="font-medium text-indigo-700 mb-2">Thông tin có thể cập nhật:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="p-2 bg-white rounded-lg border border-indigo-100">
                            <span className="text-sm text-indigo-700">Thông tin cá nhân</span>
                          </div>
                          <div className="p-2 bg-white rounded-lg border border-indigo-100">
                            <span className="text-sm text-indigo-700">Ảnh đại diện</span>
                          </div>
                          <div className="p-2 bg-white rounded-lg border border-indigo-100">
                            <span className="text-sm text-indigo-700">Số điện thoại liên hệ</span>
                          </div>
                          <div className="p-2 bg-white rounded-lg border border-indigo-100">
                            <span className="text-sm text-indigo-700">Mật khẩu đăng nhập</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* System Info Content */}
          {activeTab === "system" && (
            <div className="max-w-5xl mx-auto">
              <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
                <div className="p-6 border-b border-indigo-100">
                  <h2 className="text-2xl font-bold text-indigo-800 flex items-center">
                    <FaInfoCircle className="mr-3 text-indigo-600" />
                    Thông tin hệ thống
                  </h2>
                </div>

                <div className="p-6">
                  <div className="bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white p-6 rounded-xl mb-6">
                    <h3 className="text-xl font-bold mb-3">BookLab - Hệ thống quản lý đặt phòng</h3>
                    <p className="text-indigo-100 mb-4">
                      Hệ thống quản lý đặt phòng được phát triển bởi <strong>Nhóm Faise</strong>, nhằm hỗ trợ quản lý và đặt phòng một cách hiệu quả.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                        <h4 className="text-lg font-semibold text-white mb-2">Thông tin phiên bản</h4>
                        <ul className="space-y-1">
                          <li className="flex items-start">
                            <span className="bg-white/20 h-5 w-5 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">•</span>
                            <div>
                              <span className="text-indigo-100">Phiên bản:</span>
                              <span className="text-white font-medium ml-1">1.0.0</span>
                            </div>
                          </li>
                          <li className="flex items-start">
                            <span className="bg-white/20 h-5 w-5 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">•</span>
                            <div>
                              <span className="text-indigo-100">Ngày phát hành:</span>
                              <span className="text-white font-medium ml-1">20/03/2025</span>
                            </div>
                          </li>
                          <li className="flex items-start">
                            <span className="bg-white/20 h-5 w-5 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5">•</span>
                            <div>
                              <span className="text-indigo-100">Cập nhật gần đây:</span>
                              <span className="text-white font-medium ml-1">05/04/2025</span>
                            </div>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                        <h4 className="text-lg font-semibold text-white mb-2">Phát triển bởi</h4>
                        <div className="flex items-center">
                          <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center text-white">
                            <FaUsers className="h-6 w-6" />
                          </div>
                          <div className="ml-3">
                            <div className="text-white font-semibold">Nhóm Faise</div>
                            <div className="text-indigo-100 text-sm">BookLab Project</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-indigo-800 mb-4">Mục đích hệ thống</h3>
                      <p className="text-slate-600 mb-2">
                        Hệ thống BookLab được xây dựng nhằm giúp cho việc quản lý và sử dụng phòng học, phòng làm việc trở nên hiệu quả hơn.
                      </p>
                      
                      <ul className="list-disc list-inside text-slate-600 pl-4 space-y-2">
                        <li>Tối ưu hóa việc sử dụng phòng và tài nguyên</li>
                        <li>Giúp người dùng dễ dàng tìm kiếm và đặt phòng phù hợp</li>
                        <li>Giảm thiểu xung đột lịch và tăng tính minh bạch</li>
                        <li>Hỗ trợ quản lý theo dõi và phân tích việc sử dụng phòng</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-indigo-800 mb-4">Tính năng chính</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                          <h4 className="text-indigo-700 font-semibold mb-2 flex items-center">
                            <FaCalendarAlt className="mr-2" /> Đặt và quản lý lịch
                          </h4>
                          <ul className="text-slate-600 space-y-1">
                            <li className="flex items-start">
                              <span className="text-indigo-400 mr-2">•</span>
                              <span>Đặt phòng với giao diện lịch trực quan</span>
                            </li>
                            <li className="flex items-start">
                              <span className="text-indigo-400 mr-2">•</span>
                              <span>Xem lịch đặt phòng và lịch cá nhân</span>
                            </li>
                            <li className="flex items-start">
                              <span className="text-indigo-400 mr-2">•</span>
                              <span>Hủy và chỉnh sửa lịch đặt phòng</span>
                            </li>
                          </ul>
                        </div>
                        
                        <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                          <h4 className="text-indigo-700 font-semibold mb-2 flex items-center">
                            <FaUsers className="mr-2" /> Quản lý nhóm
                          </h4>
                          <ul className="text-slate-600 space-y-1">
                            <li className="flex items-start">
                              <span className="text-indigo-400 mr-2">•</span>
                              <span>Tạo và quản lý nhiều nhóm</span>
                            </li>
                            <li className="flex items-start">
                              <span className="text-indigo-400 mr-2">•</span>
                              <span>Thêm và xóa thành viên nhóm</span>
                            </li>
                            <li className="flex items-start">
                              <span className="text-indigo-400 mr-2">•</span>
                              <span>Import dữ liệu nhóm từ Excel</span>
                            </li>
                          </ul>
                        </div>
                        
                        <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                          <h4 className="text-indigo-700 font-semibold mb-2 flex items-center">
                            <FaUserCheck className="mr-2" /> Điểm danh
                          </h4>
                          <ul className="text-slate-600 space-y-1">
                            <li className="flex items-start">
                              <span className="text-indigo-400 mr-2">•</span>
                              <span>Điểm danh người tham gia</span>
                            </li>
                            <li className="flex items-start">
                              <span className="text-indigo-400 mr-2">•</span>
                              <span>Theo dõi tỷ lệ tham gia</span>
                            </li>
                            <li className="flex items-start">
                              <span className="text-indigo-400 mr-2">•</span>
                              <span>Thống kê lịch sử tham gia</span>
                            </li>
                          </ul>
                        </div>
                        
                        <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                          <h4 className="text-indigo-700 font-semibold mb-2 flex items-center">
                            <FaLaptop className="mr-2" /> Tích hợp
                          </h4>
                          <ul className="text-slate-600 space-y-1">
                            <li className="flex items-start">
                              <span className="text-indigo-400 mr-2">•</span>
                              <span>Đồng bộ với Google Calendar</span>
                            </li>
                            <li className="flex items-start">
                              <span className="text-indigo-400 mr-2">•</span>
                              <span>Thông báo qua email</span>
                            </li>
                            <li className="flex items-start">
                              <span className="text-indigo-400 mr-2">•</span>
                              <span>Xuất báo cáo thống kê</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                      <div className="flex">
                        <FaInfoCircle className="text-amber-500 mr-3 mt-1 flex-shrink-0" />
                        <p className="text-amber-700">
                          <strong>Hỗ trợ người dùng:</strong> Hệ thống hỗ trợ cả người dùng thông thường và quản trị viên. Quản trị viên có thể xem báo cáo, phê duyệt đặt phòng, và quản lý tài khoản người dùng.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contact Support Content */}
          {activeTab === "contact" && (
            <div className="max-w-5xl mx-auto">
              <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
                <div className="p-6 border-b border-indigo-100">
                  <h2 className="text-2xl font-bold text-indigo-800 flex items-center">
                    <FaPhoneAlt className="mr-3 text-indigo-600" />
                    Liên hệ hỗ trợ
                  </h2>
                </div>

                <div className="p-6">
                  <div className="text-slate-600 mb-6">
                    <p>
                      Nếu bạn gặp bất kỳ vấn đề nào khi sử dụng hệ thống BookLab, vui lòng liên hệ với chúng tôi qua các kênh sau:
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
                      <h3 className="text-xl font-semibold text-indigo-800 mb-4">Thông tin liên hệ</h3>
                      
                      <ul className="space-y-4">
                        <li className="flex items-start">
                          <div className="bg-white p-3 rounded-lg shadow-sm mr-4">
                            <FaPhoneAlt className="text-indigo-600 h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-700">Điện thoại hỗ trợ</h4>
                            <p className="text-indigo-700 font-semibold mt-1">0702326806</p>
                            <p className="text-slate-500 text-sm mt-1">Thời gian: 08:00 - 17:30 (T2-T6)</p>
                          </div>
                        </li>
                        
                        <li className="flex items-start">
                          <div className="bg-white p-3 rounded-lg shadow-sm mr-4">
                            <FaEnvelope className="text-indigo-600 h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-700">Email hỗ trợ</h4>
                            <a 
                              href="mailto:haindde180824@fpt.edu.vn" 
                              className="text-indigo-700 font-semibold mt-1 hover:underline block"
                            >
                              haindde180824@fpt.edu.vn
                            </a>
                            <p className="text-slate-500 text-sm mt-1">Phản hồi trong vòng 24 giờ làm việc</p>
                          </div>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
                      <h3 className="text-xl font-semibold text-indigo-800 mb-4">Giờ làm việc</h3>
                      
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <table className="w-full text-slate-700">
                          <tbody>
                            <tr className="border-b border-indigo-100">
                              <td className="py-2 font-medium">Thứ 2 - Thứ 6:</td>
                              <td className="py-2 text-right">08:00 - 17:30</td>
                            </tr>
                            <tr className="border-b border-indigo-100">
                              <td className="py-2 font-medium">Thứ 7:</td>
                              <td className="py-2 text-right">08:00 - 12:00</td>
                            </tr>
                            <tr>
                              <td className="py-2 font-medium">Chủ nhật:</td>
                              <td className="py-2 text-right text-rose-500">Không hỗ trợ</td>
                            </tr>
                          </tbody>
                        </table>
                        
                        <div className="mt-4 pt-4 border-t border-indigo-100">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700">Ưu tiên hỗ trợ:</span>
                            <span className="bg-indigo-100 text-indigo-700 text-xs font-medium px-2 py-1 rounded-full">
                              Email
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 bg-white rounded-lg p-4 shadow-sm">
                        <h4 className="font-medium text-indigo-700 mb-2 flex items-center">
                          <FaInfoCircle className="mr-2" />
                          Quy trình hỗ trợ
                        </h4>
                        <ol className="list-decimal list-inside text-slate-600 space-y-1 pl-1">
                          <li>Gửi yêu cầu hỗ trợ qua email hoặc điện thoại</li>
                          <li>Nhận mã theo dõi cho yêu cầu của bạn</li>
                          <li>Đội ngũ kỹ thuật sẽ tiếp nhận và phản hồi</li>
                          <li>Nhận hướng dẫn và giải pháp cho vấn đề</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-indigo-600 text-white rounded-xl p-6 shadow-md">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                      <div className="md:w-3/4 mb-4 md:mb-0">
                        <h3 className="text-xl font-bold mb-2">Bạn cần hỗ trợ ngay?</h3>
                        <p className="text-indigo-100">
                          Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn giải quyết mọi vấn đề với hệ thống BookLab.
                        </p>
                      </div>
                      <a 
                        href="mailto:support@xai.com" 
                        className="bg-white text-indigo-700 hover:bg-indigo-50 font-semibold py-3 px-6 rounded-lg transition-colors duration-300 flex items-center justify-center"
                      >
                        <FaEnvelope className="mr-2" />
                        Gửi yêu cầu ngay
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Helps;