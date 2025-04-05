import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../data/useApi';
import { CiUser } from "react-icons/ci";
import { FaHome } from "react-icons/fa";
import { HiBuildingOffice } from "react-icons/hi2";
import { FaUserGroup } from "react-icons/fa6";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, startOfQuarter, endOfQuarter } from 'date-fns';
import _ from 'lodash';
import { useSelector } from 'react-redux';

function Dashboard() {
  const { data: initialData } = useApi('/initial-data');
  const [timeRange, setTimeRange] = useState('week');
  const [reportPeriod, setReportPeriod] = useState('month');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const navigate = useNavigate();
  const roleId = useSelector((state) => state.auth.roleId);
  // Khởi tạo state với giá trị mặc định
  const [roomUsage, setRoomUsage] = useState({ usedRooms: 0, unusedRooms: 0, usageByDay: [] });
  const [bookingHistory, setBookingHistory] = useState({ bookings: [], total: 0 });
  const [roomUsageReport, setRoomUsageReport] = useState([]);
  const [bookingByUser, setBookingByUser] = useState([]);
  const [systemPerformance, setSystemPerformance] = useState({ activeUsers: 0, successfulBookings: 0, failedBookings: 0 });

  useEffect(() => {
    if (initialData) {
      calculateDashboardData();
    }
  }, [initialData, timeRange, reportPeriod, currentPage]);
  const handleStatsClick = (path, statName) => {
    if (roleId === 4) {
      // Manager role (4) can only click Total Rooms
      if (statName === 'Total Rooms') {
        navigate(path);
      }
    } else {
      // Other roles can click any stat
      navigate(path);
    }
  };
  const getDateRangeLabel = (date, rangeType) => {
    switch (rangeType) {
      case 'week':
        return format(date, 'dd/MM/yyyy');
      case 'month':
        return format(date, 'MM/yyyy');
      case 'year':
        return format(date, 'yyyy');
      default:
        return format(date, 'dd/MM/yyyy');
    }
  };
  const calculateDashboardData = () => {
    // Kiểm tra nếu initialData không tồn tại hoặc không có dữ liệu
    if (!initialData || !initialData.accounts || !initialData.rooms || !initialData.subBookings) {
      return;
    }

    const { accounts, rooms, subBookings } = initialData;

    // 1. Tỷ lệ phòng được sử dụng (Room Usage)
    const now = new Date();
    let startDate, endDate;

    switch (timeRange.toLowerCase()) {
      case 'month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'year':
        startDate = startOfYear(now);
        endDate = endOfYear(now);
        break;
      case 'week':
      default:
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        endDate = endOfWeek(now, { weekStartsOn: 1 });
        break;
    }

    const totalRooms = rooms.length || 0;
    const filteredSubBookings = subBookings.filter(sb => {
      if (!sb.booking || !sb.date) return false;
      const bookingDate = new Date(sb.date);
      return bookingDate >= startDate && bookingDate <= endDate;
    }) || [];

    const usedRoomIds = [...new Set(filteredSubBookings.map(sb => sb.booking?.roomId).filter(id => id))];
    const usedRooms = usedRoomIds.length;
    const unusedRooms = totalRooms - usedRooms;

    const usageByDay = {};

    if (timeRange.toLowerCase() === 'week') {
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateKey = format(currentDate, 'dd/MM/yyyy');
        usageByDay[dateKey] = 0;
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    filteredSubBookings.forEach(sb => {
      if (!sb.date) return;
      const date = new Date(sb.date);
      let groupKey;
      
      switch (timeRange.toLowerCase()) {
        case 'month':
          groupKey = format(date, 'MM/yyyy');
          break;
        case 'year':
          groupKey = format(date, 'yyyy');
          break;
        case 'week':
        default:
          groupKey = format(date, 'dd/MM/yyyy');
          break;
      }
      
      usageByDay[groupKey] = (usageByDay[groupKey] || 0) + 1;
    });

    const usageByDayArray = Object.keys(usageByDay)
  .sort((a, b) => {
    const parseDate = (str) => {
      const parts = str.split('/');
      switch (timeRange.toLowerCase()) {
        case 'month':
          return new Date(parts[1], parts[0] - 1);
        case 'year':
          return new Date(parts[0], 0);
        case 'week':
        default:
          return new Date(parts[2], parts[1] - 1, parts[0]);
      }
    };
    return parseDate(a) - parseDate(b);
  })
  .map(date => ({
    date,
    count: usageByDay[date]
  }));

    setRoomUsage({
      usedRooms,
      unusedRooms,
      usageByDay: usageByDayArray
    });

    // 2. Lịch sử đặt phòng (Booking History)
    const sortedSubBookings = subBookings
      .filter(sb => sb.booking && sb.booking.createdAt)
      .sort((a, b) => new Date(b.booking.createdAt) - new Date(a.booking.createdAt));

    // Hàm chuyển đổi status từ số sang mô tả
    const getStatusDescription = (status) => {
      switch (status) {
        case 0:
          return 'Đang chờ duyệt';
        case 5:
          return 'Đặt thành công';
        case 7:
          return 'Hủy lịch đặt';
        default:
          return 'N/A';
      }
    };
    // Hàm định dạng thời gian (bỏ giây, giữ giờ và phút, định dạng 24h)
    const formatTime = (time) => {
      if (!time) return 'N/A';
      const [hours, minutes] = time.split(':');
      return `${hours}:${minutes}`;
    };
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      return format(new Date(dateString), 'dd/MM/yyyy');
    };
    console.log(sortedSubBookings);
    const paginatedBookings = sortedSubBookings
      .slice((currentPage - 1) * pageSize, currentPage * pageSize)
      .map(sb => ({
        id: sb.id,
        roomName: sb.booking?.room?.name || 'N/A',
        userName: sb.booking?.lecturer?.accountDetail?.fullName || 'N/A',
        date: formatDate(sb.date), // Add this line
        startTime: formatTime(sb.startTime) || 'N/A',
        endTime: formatTime(sb.endTime) || 'N/A',
        status: getStatusDescription(sb.booking?.state) || 'N/A',
        createdAt: sb.booking?.createdAt || 'N/A'
      }));

    setBookingHistory({
      bookings: paginatedBookings,
      total: sortedSubBookings.length
    });

    // 3. Báo cáo sử dụng phòng (Room Usage Report)
    switch (reportPeriod.toLowerCase()) {
      case 'quarter':
        startDate = startOfQuarter(now);
        endDate = endOfQuarter(now);
        break;
      case 'year':
        startDate = startOfYear(now);
        endDate = endOfYear(now);
        break;
      case 'month':
      default:
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
    }

    const filteredSubBookingsForReport = subBookings.filter(sb => {
      if (!sb.booking || !sb.booking.createdAt) return false;
      const bookingDate = new Date(sb.booking.createdAt);
      return bookingDate >= startDate && bookingDate <= endDate;
    }) || [];

    const roomUsageByRoom = filteredSubBookingsForReport.reduce((acc, sb) => {
      if (!sb.booking || !sb.booking.roomId || !sb.booking.room) return acc;
      const roomId = sb.booking.roomId;
      const roomName = sb.booking.room.name;
      if (!acc[roomId]) {
        acc[roomId] = { roomId, roomName, usageCount: 0 };
      }
      acc[roomId].usageCount += 1;
      return acc;
    }, {});

    const roomUsageReportArray = Object.values(roomUsageByRoom);
    setRoomUsageReport(roomUsageReportArray);

    // 4. Số lần đặt phòng theo người dùng (Booking by User)
    const bookingByUserData = _.chain(subBookings)
  .filter(sb => sb.booking && sb.booking.lectureId && sb.booking.lecturer && sb.booking.lecturer.accountDetail)
  .groupBy(sb => sb.booking.lectureId)
  .map((group, userId) => ({
    userId,
    userName: group[0].booking.lecturer.accountDetail.fullName,
    bookingCount: group.length
  }))
  .orderBy('bookingCount', 'desc')
  .take(10)
  .value();

    const bookingByUserArray = Object.values(bookingByUserData)
      .sort((a, b) => b.bookingCount - a.bookingCount)
      .slice(0, 10);

    setBookingByUser(bookingByUserArray);

    // 5. Hiệu suất hệ thống (System Performance)
    const activeUsers = accounts.filter(a => a.status === true).length || 0;
    const successfulBookings = subBookings.filter(sb => sb.booking?.state == 5).length || 0;
    const failedBookings = subBookings.filter(sb => sb.booking?.state == 7).length || 0;

    setSystemPerformance({
      activeUsers,
      successfulBookings,
      failedBookings
    });
  };

  const stats = [
    {
      name: 'Total Accounts',
      value: initialData?.accounts?.length || 0,
      icon: FaUserGroup,
      color: `${roleId === 4 ? 'bg-gray-400' : 'bg-blue-500'}`, // Gray out if manager
      path: '/admin/Account'
    },
    {
      name: 'Total Buildings',
      value: initialData?.buildings?.length || 0,
      icon: HiBuildingOffice,
      color: `${roleId === 4 ? 'bg-gray-400' : 'bg-green-500'}`,
      path: '/admin/Building'
    },
    {
      name: 'Total Rooms',
      value: initialData?.rooms?.length || 0,
      icon: FaHome,
      color: 'bg-purple-500', // Always active
      path: '/admin/Room'
    },
    {
      name: 'Total Roles',
      value: initialData?.roles?.length || 0,
      icon: CiUser,
      color: `${roleId === 4 ? 'bg-gray-400' : 'bg-yellow-500'}`,
      path: '/admin/Role'
    },
  ];

  const donutData = [
    { name: 'Used Rooms', value: roomUsage.usedRooms },
    { name: 'Unused Rooms', value: roomUsage.unusedRooms },
  ];

  const COLORS = ['#0088FE', '#FFBB28'];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Dashboard</h1>

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`p-6 rounded-lg shadow-lg ${stat.color} text-white 
              ${roleId === 4 && stat.name !== 'Total Rooms' 
                ? 'cursor-not-allowed opacity-60' 
                : 'cursor-pointer transform hover:scale-105 transition-transform duration-200'
              }`}
            onClick={() => handleStatsClick(stat.path, stat.name)}
          >
            <div className="flex items-center gap-4">
              <stat.icon className="text-3xl" />
              <div>
                <h3 className="text-lg font-semibold">{stat.name}</h3>
                <p className="text-2xl">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tỷ lệ phòng được sử dụng */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Room Usage by Day ({timeRange})</h2>
            <select
  value={timeRange}
  onChange={(e) => setTimeRange(e.target.value)}
  className="border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
>
  <option value="week">Daily View</option>
  <option value="month">Monthly View</option>
  <option value="year">Yearly View</option>
</select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
          <BarChart data={roomUsage.usageByDay}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis 
    dataKey="date"
    tickFormatter={(value) => {
      switch (timeRange.toLowerCase()) {
        case 'month':
          return value;
        case 'year':
          return value;
        case 'week':
        default:
          try {
            const [day, month, year] = value.split('/');
            // Use the actual year from the date string instead of hardcoding
            return format(new Date(year, month - 1, day), 'EEE dd/MM');
          } catch (error) {
            console.error('Date parsing error:', error);
            return value; // Fallback to original value if parsing fails
          }
      }
    }}
  />
  <YAxis 
    allowDecimals={false}
    label={{ value: 'Number of Bookings', angle: -90, position: 'insideLeft' }} 
  />
  <Tooltip 
    labelFormatter={(label) => {
      switch (timeRange.toLowerCase()) {
        case 'month':
          return `Month: ${label}`;
        case 'year':
          return `Year: ${label}`;
        case 'week':
        default:
          return `Date: ${label}`;
      }
    }}
  />
  <Legend />
  <Bar dataKey="count" fill="#8884d8" name="Bookings" />
</BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Room Usage Ratio</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label
              >
                {donutData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Lịch sử đặt phòng */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Booking History</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookingHistory.bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.roomName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.userName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.startTime}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.endTime}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      booking.status === 'Đặt thành công' ? 'bg-green-100 text-green-800' :
                      booking.status === 'Hủy lịch đặt' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-between">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span>Page {currentPage} of {Math.ceil(bookingHistory.total / pageSize) || 1}</span>
          <button
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={currentPage === Math.ceil(bookingHistory.total / pageSize)}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Báo cáo & Thống kê */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Room Usage Report</h2>
            <select
              value={reportPeriod}
              onChange={(e) => setReportPeriod(e.target.value)}
              className="border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="month">Month</option>
              <option value="quarter">Quarter</option>
              <option value="year">Year</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={roomUsageReport}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="roomName" />
              <YAxis allowDecimals={false}/>// Không cho phép hiển thị số thập phân
              <Tooltip />
              <Legend />
              <Bar dataKey="usageCount" fill="#82ca9d" name="Usage Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Bookings by User (Top 10)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bookingByUser}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="userName" />
              <YAxis allowDecimals={false} />// Không cho phép hiển thị số thập phân
              <Tooltip />
              <Legend />
              <Bar dataKey="bookingCount" fill="#ff7300" name="Booking Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">System Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-100 rounded-lg">
            <h3 className="text-lg font-medium text-blue-800">Active Users</h3>
            <p className="text-2xl font-bold text-blue-600">{systemPerformance.activeUsers || 0}</p>
          </div>
          <div className="p-4 bg-green-100 rounded-lg">
            <h3 className="text-lg font-medium text-green-800">Successful Bookings</h3>
            <p className="text-2xl font-bold text-green-600">{systemPerformance.successfulBookings || 0}</p>
          </div>
          <div className="p-4 bg-red-100 rounded-lg">
            <h3 className="text-lg font-medium text-red-800">Failed Bookings</h3>
            <p className="text-2xl font-bold text-red-600">{systemPerformance.failedBookings || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;