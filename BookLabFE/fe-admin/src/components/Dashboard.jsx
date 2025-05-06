import React, { useEffect, useState } from "react";
import { Pie, Bar, Line } from "react-chartjs-2";
import apiClient from "../services/ApiClient";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { HiOutlineCalendar, HiTrendingUp, HiUsers, HiOutlineDocumentReport } from "react-icons/hi";
import { BsBuilding, BsBarChartLine } from "react-icons/bs";
import { RiDashboardLine } from "react-icons/ri";

// Đăng ký các components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

const Dashboard = () => {
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

  // State cho semester selection
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedSemester, setSelectedSemester] = useState("custom");
  const [showCustomDate, setShowCustomDate] = useState(true);
  const [availabilityDate, setAvailabilityDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [typeSlot, setTypeSlot] = useState("Oldslot");

  // Các states khác giữ nguyên
  const [summary, setSummary] = useState(null);
  const [reasonData, setReasonData] = useState(null);
  const [roomUsageData, setRoomUsageData] = useState(null);
  const [bookingTrendData, setBookingTrendData] = useState(null);
  const [bookingsByDayData, setBookingsByDayData] = useState(null);
  const [roomTypeUsageData, setRoomTypeUsageData] = useState(null);
  const [availableRooms, setAvailableRooms] = useState(null);
  const [topReasonsData, setTopReasonsData] = useState(null);
  const [occupancyRate, setOccupancyRate] = useState(null);
  const [heatmapData, setHeatmapData] = useState(null);
  const [bookingsByTeacherData, setBookingsByTeacherData] = useState(null);
  const [averageLeadTime, setAverageLeadTime] = useState(null);
  const [bookingsByTimeSlotData, setBookingsByTimeSlotData] = useState(null);
  const [bookingsByCategoryRoomData, setBookingsByCategoryRoomData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [upcomingBookings, setUpcomingBookings] = useState([]); 

  // Tạo danh sách các năm cho dropdown (5 năm trước và 5 năm sau năm hiện tại)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  // Định nghĩa các học kỳ
  const getSemestersByYear = (year) => [
    { id: "SP", name: "Spring", startDate: `${year}-01-01`, endDate: `${year}-04-30` },
    { id: "SU", name: "Summer", startDate: `${year}-05-01`, endDate: `${year}-08-31` },
    { id: "FA", name: "Fall", startDate: `${year}-09-01`, endDate: `${year}-12-31` },
    { id: "custom", name: "Tùy chỉnh", startDate: "", endDate: "" },
  ];

  const semesters = getSemestersByYear(selectedYear);

  // Hàm xử lý khi chọn năm
  const handleYearChange = (e) => {
    const year = parseInt(e.target.value);
    setSelectedYear(year);
    
    // Nếu đang chọn một học kỳ cụ thể (không phải tùy chỉnh), cập nhật lại ngày theo năm mới
    if (selectedSemester !== "custom") {
      const newSemesters = getSemestersByYear(year);
      const selectedSem = newSemesters.find(sem => sem.id === selectedSemester);
      if (selectedSem) {
        setStartDate(selectedSem.startDate);
        setEndDate(selectedSem.endDate);
        fetchDataWithNewDates(selectedSem.startDate, selectedSem.endDate);
      }
    }
  };

  // Hàm xử lý khi chọn semester
  const handleSemesterChange = (e) => {
    const semesterId = e.target.value;
    setSelectedSemester(semesterId);

    if (semesterId === "custom") {
      setShowCustomDate(true);
    } else {
      setShowCustomDate(false);
      const selectedSem = semesters.find((sem) => sem.id === semesterId);
      if (selectedSem) {
        setStartDate(selectedSem.startDate);
        setEndDate(selectedSem.endDate);
        // Gọi fetchData ngay khi chọn semester
        fetchDataWithNewDates(selectedSem.startDate, selectedSem.endDate);
      }
    }
  };

  // Hàm fetchData sửa lại để tận dụng tham số
  const fetchDataWithNewDates = async (start, end) => {
    setIsLoading(true);
    const params = { startDate: start, endDate: end };
    const todayParams = { date: end };

    try {
      // API calls vẫn giữ nguyên
      const [
        summaryRes,
        reasonsRes,
        roomUsageRes,
        trendRes,
        dayRes,
        typeRes,
        availableRes,
        topReasonsRes,
        occupancyRes,
        heatmapRes,
        teacherRes,
        leadTimeRes,
        timeSlotRes,
        categoryRes,
      ] = await Promise.all([
        apiClient.get("/summary", { params }),
        apiClient.get("/reasons", { params }),
        apiClient.get("/room-usage", { params }),
        apiClient.get("/booking-trend", { params }),
        apiClient.get("/bookings-by-day", { params }),
        apiClient.get("/room-type-usage", { params }),
        apiClient.get("/available-rooms", { params: todayParams }),
        apiClient.get("/top-reasons", { params }),
        apiClient.get("/occupancy-rate", { params: todayParams }),
        apiClient.get("/booking-heatmap", { params }),
        apiClient.get("/bookings-by-teacher", { params }),
        apiClient.get("/average-lead-time", { params }),
        apiClient.get("/bookings-by-time-slot", { params }),
        apiClient.get("/bookings-by-category-room", { params }),
      ]);

      // Xử lý data vẫn giữ nguyên
      setSummary(summaryRes.data);
      
      // Reasons (Pie)
      setReasonData({
        labels: reasonsRes.data.map((item) => item.reason),
        datasets: [
          {
            label: "Lý do",
            data: reasonsRes.data.map((item) => item.count),
            backgroundColor: [
              "rgba(255, 99, 132, 0.8)",
              "rgba(54, 162, 235, 0.8)",
              "rgba(255, 206, 86, 0.8)",
              "rgba(75, 192, 192, 0.8)",
              "rgba(153, 102, 255, 0.8)",
            ],
            borderWidth: 1,
          },
        ],
      });

      // Room Usage (Bar)
      setRoomUsageData({
        labels: roomUsageRes.data.map((item) => {
          // Giới hạn độ dài của nhãn và thêm '...' nếu quá dài
          const roomLabel = `${item.roomName} (${item.roomNumber})`;
          return roomLabel.length > 15 ? roomLabel.substring(0, 15) + '...' : roomLabel;
        }),
        datasets: [
          {
            label: "Số lần sử dụng",
            data: roomUsageRes.data.map((item) => item.usageCount),
            backgroundColor: "rgba(54, 162, 235, 0.8)",
            borderWidth: 1,
          },
        ],
      });

      // Booking Trend (Line)
      setBookingTrendData({
        labels: trendRes.data.map((item) => new Date(item.date).toLocaleDateString()),
        datasets: [
          {
            label: "Số lượt đặt",
            data: trendRes.data.map((item) => item.count),
            borderColor: "rgba(76, 175, 80, 1)",
            backgroundColor: "rgba(76, 175, 80, 0.1)",
            fill: true,
            tension: 0.4,
          },
        ],
      });

      // Bookings by Day (Bar)
      setBookingsByDayData({
        labels: dayRes.data.map((item) => item.dayOfWeek),
        datasets: [
          {
            label: "Số lượt đặt",
            data: dayRes.data.map((item) => item.count),
            backgroundColor: "rgba(255, 152, 0, 0.8)",
            borderWidth: 1,
          },
        ],
      });

      // Room Type Usage (Pie)
      setRoomTypeUsageData({
        labels: typeRes.data.map((item) => item.roomType),
        datasets: [
          {
            label: "Tỷ lệ",
            data: typeRes.data.map((item) => item.count),
            backgroundColor: [
              "rgba(255, 99, 132, 0.8)",
              "rgba(54, 162, 235, 0.8)",
              "rgba(255, 206, 86, 0.8)",
            ],
            borderWidth: 1,
          },
        ],
      });

      // Available Rooms
      setAvailableRooms(availableRes.data.availableRooms);

      // Top Reasons (Pie)
      setTopReasonsData({
        labels: topReasonsRes.data.map((item) => `${item.reason} (${item.percentage?.toFixed(2) || 0}%)`),
        datasets: [
          {
            label: "Tỷ lệ",
            data: topReasonsRes.data.map((item) => item.percentage || 0),
            backgroundColor: [
              "rgba(255, 99, 132, 0.8)",
              "rgba(54, 162, 235, 0.8)",
              "rgba(255, 206, 86, 0.8)",
              "rgba(75, 192, 192, 0.8)",
              "rgba(153, 102, 255, 0.8)",
            ],
            borderWidth: 1,
          },
        ],
      });

      // Occupancy Rate
      setOccupancyRate(occupancyRes.data.occupancyRate);

      // Heatmap
      setHeatmapData({
        labels: heatmapRes.data.map((item) => `${item.hour}:00`),
        datasets: [
          {
            label: "Số lượt đặt phòng theo giờ",
            data: heatmapRes.data.map((item) => item.count),
            backgroundColor: "rgba(63, 81, 181, 0.8)",
            borderWidth: 1,
          },
        ],
      });

      // Bookings by Teacher (Bar)
      setBookingsByTeacherData({
        labels: teacherRes.data.map((item) => item.teacherName),
        datasets: [
          {
            label: "Số lượt đặt",
            data: teacherRes.data.map((item) => item.count),
            backgroundColor: "rgba(156, 39, 176, 0.8)",
            borderWidth: 1,
          },
        ],
      });

      // Average Lead Time
      setAverageLeadTime(leadTimeRes.data.leadTime);

      // Bookings by Time Slot (Bar)
      setBookingsByTimeSlotData({
        labels: timeSlotRes.data.map((item) => item.timeSlot),
        datasets: [
          {
            label: "Số lượt đặt",
            data: timeSlotRes.data.map((item) => item.count),
            backgroundColor: "rgba(33, 150, 243, 0.8)",
            borderWidth: 1,
          },
        ],
      });

      // Bookings by Category Room (Pie)
      setBookingsByCategoryRoomData({
        labels: categoryRes.data.map((item) => item.categoryName),
        datasets: [
          {
            label: "Tỷ lệ",
            data: categoryRes.data.map((item) => item.count),
            backgroundColor: [
              "rgba(255, 99, 132, 0.8)",
              "rgba(54, 162, 235, 0.8)",
              "rgba(255, 206, 86, 0.8)",
              "rgba(75, 192, 192, 0.8)",
            ],
            borderWidth: 1,
          },
        ],
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Giữ lại fetchData ban đầu để gọi từ button "Lọc"
  const fetchData = () => {
    fetchDataWithNewDates(startDate, endDate);
  };

  useEffect(() => {
    fetchData();
    fetchUpcomingBookings();
  }, []);

  // Thêm state mới cho việc chọn ngày xuất lịch sử riêng
  const [exportStartDate, setExportStartDate] = useState(startDate);
  const [exportEndDate, setExportEndDate] = useState(endDate);
  const [useCustomExportDates, setUseCustomExportDates] = useState(false);

  // Cập nhật exportBookingHistory để sử dụng ngày tùy chỉnh nếu được chọn
  const exportBookingHistory = async () => {
    try {
      setIsExporting(true);
      // Sử dụng ngày tùy chỉnh nếu được chọn, ngược lại thì dùng ngày từ bộ lọc chính
      const exportParams = useCustomExportDates 
        ? { startDate: exportStartDate, endDate: exportEndDate }
        : { startDate, endDate };
        
      const response = await apiClient.get(
        "/export-booking-history",
        {
          params: exportParams,
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      
    // Đổi tên file thành "Xuat danh sach book phong DD.MM-DD.MM"
    const startDateObj = new Date(exportParams.startDate);
    const endDateObj = new Date(exportParams.endDate);
    
    // Format: DD.MM-DD.MM
    const formatDate = (date) => {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      return `${day}.${month}`;
    };
    
    const formattedStartDate = formatDate(startDateObj);
    const formattedEndDate = formatDate(endDateObj);
    
    link.setAttribute(
      "download",
      `Xuat danh sach book phong ${formattedStartDate}-${formattedEndDate}.csv`
    );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error exporting booking history:", error);
    } finally {
      setIsExporting(false);
    }
  };

  // Cập nhật chartOptions với font mới
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: false,
      },
      legend: { 
        position: "top",
        align: "end",
        labels: {
          font: {
            family: "'Public Sans', sans-serif",
            size: 12,
            weight: '500'
          },
          usePointStyle: true,
          boxWidth: 8,
          boxHeight: 8,
          padding: 16
        }
      },
      tooltip: {
        bodyFont: {
          family: "'Public Sans', sans-serif",
          size: 12
        },
        titleFont: {
          family: "'Public Sans', sans-serif",
          size: 13,
          weight: '600'
        },
        boxPadding: 8,
        usePointStyle: true,
        backgroundColor: 'rgba(33, 33, 33, 0.9)',
        titleColor: 'white',
        bodyColor: 'rgba(255, 255, 255, 0.8)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1
      }
    },
    layout: {
      padding: {
        top: 10
      }
    }
  };

  // Thêm hàm exportRoomAvailability sử dụng apiClient
  const exportRoomAvailability = async () => {
    try {
      setIsExporting(true);
      const response = await apiClient.get(
        "/export-room-availability",
        {
          params: { date: availabilityDate, typeSlot },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const formattedDate = new Date(availabilityDate).toISOString().split('T')[0];
    link.setAttribute(
      "download",
      `Tình trạng phòng trống trong ngày ${formattedDate}.csv`
    );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error exporting room availability:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const fetchUpcomingBookings = async () => {
    try {
      const response = await apiClient.get(
        "/upcoming-bookings",
        { params: { limit: 7 } }
      );
      setUpcomingBookings(response.data);
    } catch (error) {
      console.error("Error fetching upcoming bookings:", error);
    }
  };
console.log("Upcoming Bookings:", upcomingBookings);
  const [showAllBookings, setShowAllBookings] = useState(false);
  return (
    <div className="min-h-screen bg-slate-50 ">
      {/* Header - Hiện đại hóa */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 p-2 rounded-lg shadow-md">
                <RiDashboardLine className="h-7 w-7 text-white" />
              </div>
              <h1 className="ml-3 text-2xl font-bold text-slate-800 ">Dashboard</h1>
            </div>
            <div>
              <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">{new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filter Panel - Hiện đại hóa */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8 transition-all hover:shadow-md">
          <h2 className="text-xl font-bold text-slate-800 mb-5 flex items-center ">
            <div className="p-2 bg-indigo-100 rounded-lg mr-3">
              <HiOutlineCalendar className="h-5 w-5 text-indigo-600" />
            </div>
            Time Range
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Year selection */}
            <div>
              <label htmlFor="year" className="block text-sm font-semibold text-slate-700 mb-2">
                Academic Year
              </label>
              <div className="relative">
                <select
                  id="year"
                  value={selectedYear}
                  onChange={handleYearChange}
                  className="w-full rounded-xl border border-slate-300 shadow-sm text-slate-700 py-3 pl-4 pr-10 bg-white hover:border-indigo-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none text-base transition-all duration-200"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* Semester selection */}
            <div>
              <label htmlFor="semester" className="block text-sm font-semibold text-slate-700 mb-2">
                Semester
              </label>
              <div className="relative">
                <select
                  id="semester"
                  value={selectedSemester}
                  onChange={handleSemesterChange}
                  className="w-full rounded-xl border border-slate-300 shadow-sm text-slate-700 py-3 pl-4 pr-10 bg-white hover:border-indigo-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none text-base transition-all duration-200"
                >
                  {semesters.map((sem) => (
                    <option key={sem.id} value={sem.id}>
                      {sem.name} {sem.id !== "custom"
                        ? `(${new Date(sem.startDate).toLocaleDateString()} - ${new Date(sem.endDate).toLocaleDateString()})`
                        : ""}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* Hide this section if not using custom dates */}
            {showCustomDate && (
              <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
                <div>
                  <label htmlFor="start-date" className="block text-sm font-semibold text-slate-700 mb-2">
                    From Date
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                      <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <input
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 pl-12 pr-4 py-3 shadow-sm text-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-base"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="end-date" className="block text-sm font-semibold text-slate-700 mb-2">
                    To Date
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                      <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <input
                      id="end-date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 pl-12 pr-4 py-3 shadow-sm text-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-base"
                    />
                  </div>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={fetchData}
                    disabled={isLoading}
                    className="w-full h-[50px] bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold py-3 px-5 rounded-xl transition duration-200 ease-in-out flex items-center justify-center shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                  >
                    {isLoading ? (
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : null}
                    {isLoading ? "Processing..." : "Apply Filters"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary Cards - Hiện đại hóa */}
        <h2 className="text-xl font-bold text-slate-800 mb-5 flex items-center ">
          <div className="p-2 bg-indigo-100 rounded-lg mr-3">
            <HiOutlineDocumentReport className="h-5 w-5 text-indigo-600" />
          </div>
          Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-slate-500">Total Bookings</p>
                <p className="text-2xl font-bold text-slate-800 mt-2">{summary?.totalBookings || 0}</p>
              </div>
              <div className="p-2.5 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-xl">
                <HiTrendingUp className="h-6 w-6 text-indigo-500" />
              </div>
            </div>
            <div className="mt-3">
              <div className="h-1 w-full bg-slate-100 rounded-full mt-2">
                <div className="h-1 bg-indigo-500 rounded-full" style={{ width: '100%' }}></div>
              </div>
              <p className="text-xs font-medium text-slate-500 mt-2">Total number of room bookings</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-slate-500">Approved</p>
                <p className="text-2xl font-bold text-emerald-600 mt-2">{summary?.approvedBookings || 0}</p>
              </div>
              <div className="p-2.5 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="mt-3">
              <div className="h-1 w-full bg-slate-100 rounded-full mt-2">
                <div className="h-1 bg-emerald-500 rounded-full" style={{ width: `${summary?.approvedBookings ? (summary.approvedBookings / summary.totalBookings) * 100 : 0}%` }}></div>
              </div>
              <p className="text-xs font-medium text-slate-500 mt-2">Approved bookings</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-slate-500">Cancelled</p>
                <p className="text-2xl font-bold text-rose-600 mt-2">{summary?.cancelledBookings || 0}</p>
              </div>
              <div className="p-2.5 bg-gradient-to-br from-rose-100 to-rose-50 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <div className="mt-3">
              <div className="h-1 w-full bg-slate-100 rounded-full mt-2">
                <div className="h-1 bg-rose-500 rounded-full" style={{ width: `${summary?.cancelledBookings ? (summary.cancelledBookings / summary.totalBookings) * 100 : 0}%` }}></div>
              </div>
              <p className="text-xs font-medium text-slate-500 mt-2">Cancelled bookings</p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-slate-500">Total Teachers</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">{summary?.uniqueTeachers || 0}</p>
              </div>
              <div className="p-2.5 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl">
                <HiUsers className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <div className="mt-3">
              <div className="h-1 w-full bg-slate-100 rounded-full mt-2">
                <div className="h-1 bg-blue-500 rounded-full" style={{ width: '80%' }}></div>
              </div>
              <p className="text-xs font-medium text-slate-500 mt-2">Number of teachers who booked rooms</p>
            </div>
          </div>

          {/* Card 5 */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-slate-500">Available Rooms Today</p>
                <p className="text-2xl font-bold text-purple-600 mt-2">{availableRooms || 0}</p>
              </div>
              <div className="p-2.5 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl">
                <BsBuilding className="h-6 w-6 text-purple-500" />
              </div>
            </div>
            <div className="mt-3">
              <div className="h-1 w-full bg-slate-100 rounded-full mt-2">
                <div className="h-1 bg-purple-500 rounded-full" style={{ width: '60%' }}></div>
              </div>
              <p className="text-xs font-medium text-slate-500 mt-2">Number of available rooms</p>
            </div>
          </div>
        </div>

        {/* Charts - Hiện đại hóa và sử dụng grid 7:3 */}
        <h2 className="text-xl font-bold text-slate-800 mb-5 mt-10 flex items-center ">
          <div className="p-2 bg-indigo-100 rounded-lg mr-3">
            <BsBarChartLine className="h-5 w-5 text-indigo-600" />
          </div>
          Detailed Analytics
        </h2>
        
        {/* Grid 7:3 layout */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 mb-8">
          {/* Main Column - 7/10 */}
          <div className="lg:col-span-7 space-y-6">
            {/* Booking Trend - Full width in main column */}
            {bookingTrendData && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all duration-300">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Booking Trends Over Time</h3>
                <div className="h-80">
                  <Line data={bookingTrendData} options={{
                    ...chartOptions,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          precision: 0  // Loại bỏ số thập phân
                        },
                        grid: {
                          color: 'rgba(0, 0, 0, 0.05)'
                        }
                      },
                      x: {
                        grid: {
                          display: false
                        }
                      }
                    }
                  }} />
                </div>
              </div>
            )}

            {/* Bookings by Day - Full width in main column */}
            {bookingsByDayData && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all duration-300">
                <h3 className="text-lg font-bold text-slate-800 mb-4 ">Bookings by Weekday</h3>
                <div className="h-80">
                  <Bar data={bookingsByDayData} options={{
                    ...chartOptions,
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(0, 0, 0, 0.05)',
                        }
                      },
                      x: {
                        grid: {
                          display: false
                        }
                      }
                    }
                  }} />
                </div>
              </div>
            )}
            
            {/* Heatmap (Bar chart) - Full width in main column */}
            {heatmapData && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all duration-300">
                <h3 className="text-lg font-bold text-slate-800 mb-4 ">Peak Hours for Room Usage</h3>
                <div className="h-80">
                  <Bar
                    data={heatmapData}
                    options={{
                      ...chartOptions,
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Number of Bookings',
                            font: {
                              family: "'Public Sans', sans-serif",
                              size: 12,
                              weight: '500'
                            }
                          },
                          ticks: {
                            font: {
                              family: "'Public Sans', sans-serif",
                            }
                          },
                          grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                          }
                        },
                        x: {
                          title: {
                            display: true,
                            text: 'Hours of Day',
                            font: {
                              family: "'Public Sans', sans-serif",
                              size: 12,
                              weight: '500'
                            }
                          },
                          ticks: {
                            font: {
                              family: "'Public Sans', sans-serif",
                            }
                          },
                          grid: {
                            display: false
                          }
                        }
                      },
                    }}
                  />
                </div>
              </div>
            )}

            {/* Bookings by Teacher - Full width in main column */}
            {bookingsByTeacherData && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all duration-300">
                <h3 className="text-lg font-bold text-slate-800 mb-4 ">Bookings by Teacher</h3>
                <div className="h-80">
                  <Bar data={bookingsByTeacherData} options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      legend: {
                        display: false,
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(0, 0, 0, 0.05)',
                        }
                      },
                      x: {
                        grid: {
                          display: false
                        }
                      }
                    }
                  }} />
                </div>
              </div>
            )}
          </div>
          
          {/* Side Column - 3/10 */}
          <div className="lg:col-span-3 space-y-6">
            {/* Top Reasons - Smaller, in side column */}
            {topReasonsData && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all duration-300">
                <h3 className="text-lg font-bold text-slate-800 mb-4 ">Top 5 Popular Reasons</h3>
                <div className="h-80">
                  <Pie data={topReasonsData} options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      legend: {
                        position: 'bottom',
                        align: 'center',
                      }
                    }
                  }} />
                </div>
              </div>
            )}

            {/* Bookings by Category - Smaller, in side column */}
            {bookingsByCategoryRoomData && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all duration-300">
                <h3 className="text-lg font-bold text-slate-800 mb-4 ">Distribution by Room Category</h3>
                <div className="h-80">
                  <Pie data={bookingsByCategoryRoomData} options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      legend: {
                        position: 'bottom',
                        align: 'center',
                      }
                    }
                  }} />
                </div>
              </div>
            )}
            
            {/* Upcoming Bookings - Thu gọn để hiển thị ở side column */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all duration-300">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Upcoming Bookings</h3>
              <div className="h-80 overflow-y-auto">
                {upcomingBookings.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingBookings
                      .slice(0, showAllBookings ? upcomingBookings.length : 5)
                      .map((booking, index) => {
                        const [day, month, year] = booking.date.split('/'); // Giả sử date là "dd/MM/yyyy"
                        const bookingStart = new Date(`${year}-${month}-${day}T${booking.startTime}`);
                        const bookingEnd = new Date(`${year}-${month}-${day}T${booking.endTime}`);
                        const now = new Date();

                        // Kiểm tra trạng thái
                        const isInProgress = now >= bookingStart && now <= bookingEnd;
                        const status = isInProgress ? 'In Progress' : 'Coming';
                        return (
                                      <div key={index} className={`p-3 rounded-lg ${index % 2 === 0 ? 'bg-slate-50' : 'bg-white border border-slate-100'}`}>
                                        <div className="flex items-center mb-2">
                                          <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-medium text-sm">
                                            {booking.booker.charAt(0).toUpperCase()}
                                          </div>
                                          <div className="ml-2 flex-1">
                                            <p className="text-sm font-medium text-slate-800 truncate">{booking.booker}</p>
                                            <p className="text-xs text-slate-500">Room {booking.roomNo}</p>
                                          </div>
                                          <span
                                className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  status === 'In Progress'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {status}
                              </span>
                          </div>
                          <div className="flex items-center text-xs text-slate-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {booking.date} • {booking.startTime.slice(0, 5) + '-' + booking.endTime.slice(0, 5) || 'All day'}
                          </div>
                          <div className="mt-1 text-xs text-slate-700 line-clamp-1">
                            {booking.note}
                          </div>
                        </div>
                      )
})}
                    {upcomingBookings.length > 5 && !showAllBookings && (
                      <button 
                        onClick={() => setShowAllBookings(true)}
                        className="w-full text-center pt-2 pb-1 text-xs text-indigo-600 font-medium hover:text-indigo-800 transition-colors hover:bg-indigo-50 rounded-lg"
                      >
                        +{upcomingBookings.length - 5} more bookings
                      </button>
                    )}
                    {showAllBookings && upcomingBookings.length > 5 && (
                      <button 
                        onClick={() => setShowAllBookings(false)}
                        className="w-full text-center pt-2 pb-1 text-xs text-indigo-600 font-medium hover:text-indigo-800 transition-colors hover:bg-indigo-50 rounded-lg flex items-center justify-center"
                      >
                        <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                        Show less
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="mt-3 text-sm font-medium text-slate-700">No upcoming bookings</h3>
                    <p className="mt-1 text-xs text-slate-500">There are no bookings scheduled soon.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Export Data Section - Hiện đại hóa */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-slate-800 mb-5 flex items-center ">
            <div className="p-2 bg-indigo-100 rounded-lg mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            Export Data
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Export Room Availability */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 hover:shadow-lg transition-all duration-300">
              <h3 className="text-lg font-bold text-slate-800 mb-5 ">Export Room Availability</h3>
              <div className="space-y-5">
                <div>
                  <label htmlFor="availability-date" className="block text-sm font-semibold text-slate-700 mb-2">
                    Date
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                      <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <input
                      id="availability-date"
                      type="date"
                      value={availabilityDate}
                      onChange={(e) => setAvailabilityDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 pl-12 pr-4 py-3 shadow-sm text-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-base"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="slot-type" className="block text-sm font-semibold text-slate-700 mb-2">
                    Time Slot Type
                  </label>
                  <div className="relative">
                    <select
                      id="slot-type"
                      value={typeSlot}
                      onChange={(e) => setTypeSlot(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 shadow-sm text-slate-700 py-3 pl-4 pr-10 bg-white hover:border-emerald-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 appearance-none text-base transition-all duration-200"
                    >
                      <option value="Oldslot">Old time slots (6 slots/day)</option>
                      <option value="Newslot">New time slots (4 slots/day)</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={exportRoomAvailability}
                  disabled={isExporting}
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-3 px-5 rounded-xl transition-all duration-300 flex items-center justify-center shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                >
                  {isExporting ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  )}
                  {isExporting ? "Exporting..." : "Export Room Availability"}
                </button>
              </div>
            </div>
            
            {/* Export Booking History */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 hover:shadow-lg transition-all duration-300">
              <h3 className="text-lg font-bold text-slate-800 mb-5 ">Export Booking History</h3>
              <div className="space-y-5">
                
                <div className="flex items-center space-x-2">
                <input
                    id="use-custom-dates"
                    type="checkbox"
                    checked={useCustomExportDates}
                    onChange={(e) => setUseCustomExportDates(e.target.checked)}
                    className="h-5 w-5 rounded-md border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 ease-in-out cursor-pointer hover:border-blue-500"
                  />
                  <label
                    htmlFor="use-custom-dates"
                    className="text-sm font-medium text-slate-700 select-none cursor-pointer hover:text-blue-600 transition-colors duration-200"
                  >
                    Customize export date range
                  </label>
                </div>
                
                {useCustomExportDates ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="export-start-date" className="block text-sm font-semibold text-slate-700 mb-2">
                        From Date
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                          <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                          </svg>
                        </div>
                        <input
                          id="export-start-date"
                          type="date"
                          value={exportStartDate}
                          onChange={(e) => setExportStartDate(e.target.value)}
                          className="w-full rounded-xl border border-slate-300 pl-12 pr-4 py-3 shadow-sm text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-base"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="export-end-date" className="block text-sm font-semibold text-slate-700 mb-2">
                        To Date
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                          <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                          </svg>
                        </div>
                        <input
                          id="export-end-date"
                          type="date"
                          value={exportEndDate}
                          onChange={(e) => setExportEndDate(e.target.value)}
                          className="w-full rounded-xl border border-slate-300 pl-12 pr-4 py-3 shadow-sm text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-base"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <p className="text-sm font-medium text-slate-700">
                      Export booking history for the selected time range from <span className="text-blue-600 font-semibold">{new Date(startDate).toLocaleDateString()}</span> to <span className="text-blue-600 font-semibold">{new Date(endDate).toLocaleDateString()}</span>.
                    </p>
                  </div>
                )}
                
                <button
                  onClick={exportBookingHistory}
                  disabled={isExporting}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 px-5 rounded-xl transition-all duration-300 flex items-center justify-center shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                >
                  {isExporting ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  )}
                  {isExporting ? "Exporting..." : "Export Booking History"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;