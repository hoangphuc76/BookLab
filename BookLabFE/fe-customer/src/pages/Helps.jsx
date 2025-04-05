import React from 'react';
import { FaQuestionCircle, FaInfoCircle, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';

function Helps() {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Tiêu đề trang */}
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Hỗ trợ & Hướng dẫn</h1>

      {/* Phần 1: Hướng dẫn sử dụng */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <FaQuestionCircle className="mr-2 text-blue-500" />
          Hướng dẫn sử dụng
        </h2>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-medium mb-2">1. Đăng nhập vào hệ thống</h3>
          <p className="text-gray-600 mb-4">
            - Truy cập trang đăng nhập tại <a href="/login" className="text-blue-500 hover:underline">đây</a>.<br />
            - Nhập email và mật khẩu của bạn, sau đó nhấn "Đăng nhập".<br />
            - Nếu chưa có tài khoản, liên hệ quản trị viên để được cấp tài khoản.
          </p>

          <h3 className="text-lg font-medium mb-2">2. Đặt phòng</h3>
          <p className="text-gray-600 mb-4">
            - Từ menu chính, chọn mục "Đặt phòng".<br />
            - Chọn phòng, ngày, và khung giờ bạn muốn đặt.<br />
            - Nhấn "Xác nhận đặt phòng" và chờ phê duyệt từ quản trị viên.<br />
            - Bạn sẽ nhận được thông báo qua email khi đặt phòng thành công.
          </p>

          <h3 className="text-lg font-medium mb-2">3. Xem lịch sử đặt phòng</h3>
          <p className="text-gray-600 mb-4">
            - Truy cập mục "Lịch sử đặt phòng" từ menu chính.<br />
            - Xem danh sách các lần đặt phòng của bạn, bao gồm trạng thái (Đang chờ duyệt, Đặt thành công, Hủy lịch đặt).<br />
            - Bạn có thể hủy đặt phòng nếu trạng thái là "Đang chờ duyệt".
          </p>

          <h3 className="text-lg font-medium mb-2">4. Quản lý tài khoản</h3>
          <p className="text-gray-600">
            - Vào mục "Tài khoản" để xem thông tin cá nhân.<br />
            - Bạn có thể cập nhật thông tin như email, số điện thoại hoặc đổi mật khẩu.<br />
            - Nếu gặp vấn đề, liên hệ quản trị viên để được hỗ trợ.
          </p>
        </div>
      </div>

      {/* Phần 2: Thông tin hệ thống */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <FaInfoCircle className="mr-2 text-green-500" />
          Thông tin hệ thống
        </h2>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p className="text-gray-600 mb-4">
            Hệ thống quản lý đặt phòng được phát triển bởi <strong>Nhóm xAI</strong>, nhằm hỗ trợ quản lý và đặt phòng một cách hiệu quả.
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-4">
            <li><strong>Phiên bản:</strong> 1.0.0</li>
            <li><strong>Ngày phát hành:</strong> 20/03/2025</li>
            <li><strong>Mục đích:</strong> Quản lý đặt phòng cho các tòa nhà và phòng họp trong hệ thống.</li>
            <li><strong>Tính năng chính:</strong> Đặt phòng, xem lịch sử đặt phòng, quản lý tài khoản, báo cáo sử dụng phòng.</li>
          </ul>
          <p className="text-gray-600">
            Hệ thống hỗ trợ cả người dùng thông thường và quản trị viên. Quản trị viên có thể xem báo cáo, phê duyệt đặt phòng, và quản lý tài khoản người dùng.
          </p>
        </div>
      </div>

      {/* Phần 3: Liên hệ hỗ trợ */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <FaPhoneAlt className="mr-2 text-red-500" />
          Liên hệ hỗ trợ
        </h2>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p className="text-gray-600 mb-4">
            Nếu bạn gặp bất kỳ vấn đề nào khi sử dụng hệ thống, vui lòng liên hệ với chúng tôi qua các kênh sau:
          </p>
          <ul className="list-none text-gray-600">
            <li className="flex items-center mb-2">
              <FaPhoneAlt className="mr-2 text-gray-500" />
              <span><strong>Số điện thoại:</strong> 0123 456 789</span>
            </li>
            <li className="flex items-center">
              <FaEnvelope className="mr-2 text-gray-500" />
              <span><strong>Email:</strong> <a href="mailto:support@xai.com" className="text-blue-500 hover:underline">support@xai.com</a></span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Helps;