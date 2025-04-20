import React, { useState, useEffect, useMemo } from 'react';
import { 
  Table, Button, Modal, Tag, Space, Input, DatePicker, 
  Select, Badge, Tooltip, Empty, Spin, Skeleton 
} from 'antd';
import ApiClient from '../../services/ApiClient';
import { 
  HiOutlineCalendarDays, 
  HiOutlineClock,
  HiOutlineEye, 
  HiOutlineDocumentArrowDown,
  HiOutlineUserGroup,
  HiMagnifyingGlass,
  HiOutlineArrowPath,
  HiOutlineChartBar,
  HiOutlineAcademicCap,
  HiOutlineBuildingOffice2
} from 'react-icons/hi2';
import dayjs from 'dayjs';

const BookingHistory = () => {
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState({
    bookings: [],
    modal: {
      isOpen: false,
      record: null,
    },
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
      showSizeChanger: true,
      showTotal: (total) => `Total ${total} items`,
    },
  });

  const [filterOptions, setFilterOptions] = useState({
    description: [],
    lectureName: [],
    buildingName: [],
    roomNumber: [],
    typeSlot: [],
    dates: [],
    timeSlots: [],
  });
  
  const [searchText, setSearchText] = useState('');
  const [timeRange, setTimeRange] = useState([null, null]);
  const [selectedFilters, setSelectedFilters] = useState({
    building: [],
    typeSlot: [],
    lecture: []
  });

  const { bookings, modal, pagination } = state;

  // Stats for the dashboard
  const stats = useMemo(() => {
    if (!bookings.length) return {
      total: 0,
      buildings: 0,
      rooms: 0,
      lectures: 0
    };
    
    return {
      total: bookings.length,
      buildings: new Set(bookings.map(b => b.buildingName).filter(Boolean)).size,
      rooms: new Set(bookings.map(b => b.roomNumber).filter(Boolean)).size,
      lectures: new Set(bookings.map(b => b.lectureName).filter(Boolean)).size
    };
  }, [bookings]);
  
  useEffect(() => {
    if (bookings?.length > 0) {
      generateFilterOptions();
    }
  }, [bookings]);

  useEffect(() => {
    fetchBookings(pagination.current, pagination.pageSize);
  }, []);

  const generateFilterOptions = () => {
    const options = {
      description: [...new Set(bookings.map(item => item.description).filter(Boolean))],
      lectureName: [...new Set(bookings.map(item => item.lectureName).filter(Boolean))],
      buildingName: [...new Set(bookings.map(item => item.buildingName).filter(Boolean))],
      roomNumber: [...new Set(bookings.map(item => item.roomNumber).filter(Boolean))],
      typeSlot: [...new Set(bookings.map(item => item.typeSlot).filter(Boolean))],
      dates: [...new Set(bookings.map(item => item.date ? new Date(item.date).toLocaleDateString('en-GB') : null).filter(Boolean))],
      timeSlots: [...new Set(bookings.map(item => {
        if (item.startTime && item.endTime) {
          return `${item.startTime.substring(0, 5)} - ${item.endTime.substring(0, 5)}`;
        }
        return null;
      }).filter(Boolean))],
    };

    // Convert to format required by Ant Design Table
    const formattedOptions = {
      description: options.description.map(text => ({ text, value: text })),
      lectureName: options.lectureName.map(text => ({ text, value: text })),
      buildingName: options.buildingName.map(text => ({ text, value: text })),
      roomNumber: options.roomNumber.map(text => ({ text, value: text })),
      typeSlot: options.typeSlot.map(value => {
        const typeNames = {
          1: 'Old',
          2: 'New',
          3: 'Out Slot',
        };
        return {
          text: typeNames[value] || `Type ${value}`,
          value: value
        };
      }),
      dates: options.dates.map(text => ({ text, value: text })),
      timeSlots: options.timeSlots.map(text => ({ text, value: text })),
    };

    setFilterOptions(formattedOptions);
  };

  const fetchBookings = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await ApiClient.get(`/Booking/GetBookings`, {
        params: {
          pageNumber: page,
          pageSize: pageSize,
        },
      });

      const data = response.data.data || response.data;
      console.log('Booking data:', data);
      setState(prev => ({
        ...prev,
        bookings: data,
        pagination: {
          ...prev.pagination,
          current: page,
          total: response.data.total || data.length,
        },
      }));
    } catch (error) {
      console.error('Error fetching booking history:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (record) => {
    setState(prev => ({
      ...prev,
      modal: { isOpen: true, record },
    }));
  };

  const closeModal = () => {
    setState(prev => ({
      ...prev,
      modal: { isOpen: false, record: null },
    }));
  };

  const handleTableChange = (newPagination, filters, sorter) => {
    fetchBookings(newPagination.current, newPagination.pageSize);
  };

  const getTypeSlotName = (typeSlot) => {
    const typeNames = {
      1: 'Old',
      2: 'New',
      3: 'Out Slot',
    };
    return typeNames[typeSlot] || `Type ${typeSlot}`;
  };
  
  const getTypeSlotColor = (typeSlot) => {
    const colors = {
      1: 'blue',
      2: 'green',
      3: 'purple',
    };
    return colors[typeSlot] || 'default';
  };
  
  const handleSearch = () => {
    // Here you would implement search functionality
    // For now we'll just log the search params
    console.log("Searching with:", {
      searchText,
      timeRange,
      selectedFilters
    });
    
    // This would be replaced with filtered API call
    fetchBookings(1, pagination.pageSize);
  };
  
  const handleRefresh = () => {
    setSearchText('');
    setTimeRange([null, null]);
    setSelectedFilters({
      building: [],
      typeSlot: [],
      lecture: []
    });
    fetchBookings(1, pagination.pageSize);
  };
  
  const filterBookingData = (data) => {
    // This would be handled by the API but for now we'll do client-side filtering
    return data;
  };
  
  const filteredData = filterBookingData(bookings);

  const columns = [
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: '240px',
      render: (text) => (
        <div className="max-w-xs truncate font-medium text-slate-800" title={text || 'N/A'}>
          {text || 'N/A'}
        </div>
      ),
    },
    {
      title: 'Room & Building',
      key: 'location',
      render: (_, record) => (
        <div>
          <div className="font-medium text-slate-800">
            {record.roomNumber || 'N/A'}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center">
            <HiOutlineBuildingOffice2 className="mr-1 text-slate-400" />
            {record.buildingName || 'N/A'}
          </div>
        </div>
      ),
    },
    {
      title: 'Lecture',
      key: 'lecture',
      render: (_, record) => (
        <div>
          <div className="font-medium text-indigo-600">
            {record.lectureName || 'Not specified'}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center">
            <HiOutlineAcademicCap className="mr-1 text-slate-400" />
            {record.lectureEmail || 'N/A'}
          </div>
        </div>
      ),
    },
    {
      title: 'Date & Time',
      key: 'dateTime',
      render: (_, record) => {
        const date = record.date ? new Date(record.date).toLocaleDateString('en-GB') : 'N/A';
        const startTime = record.startTime ? record.startTime.substring(0, 5) : 'N/A';
        const endTime = record.endTime ? record.endTime.substring(0, 5) : 'N/A';
        return (
          <div>
            <div className="font-medium text-slate-800 flex items-center">
              <HiOutlineCalendarDays className="mr-1.5 text-slate-400" />
              {date}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center">
              <HiOutlineClock className="mr-1.5 text-slate-400" />
              {startTime} - {endTime}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Type',
      key: 'typeSlot',
      width: '100px',
      render: (_, record) => {
        const type = getTypeSlotName(record.typeSlot);
        const color = getTypeSlotColor(record.typeSlot);
        
        return (
          <Tag color={color} className="px-2 py-1 text-xs font-medium">
            {type}
          </Tag>
        );
      },
    },
    {
      title: 'Students',
      key: 'students',
      width: '100px',
      render: (_, record) => {
        const studentCount = record.students?.length || 0;
        
        return (
          <div className="flex items-center">
            <HiOutlineUserGroup className="mr-1.5 text-slate-400" />
            <span className="font-medium text-slate-800">{studentCount}</span>
          </div>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '100px',
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Tooltip title="View Details">
            <button
              onClick={() => openModal(record)}
              className="relative flex items-center justify-center w-9 h-9 rounded-md transition-all duration-200"
            >
              <span className="absolute inset-0 bg-indigo-50 rounded-md"></span>
              <span className="absolute inset-0 bg-indigo-500 rounded-md opacity-0 hover:opacity-100 transition-opacity"></span>
              <HiOutlineEye className="text-indigo-600 text-lg relative z-10" />
              <span className="absolute -inset-0.5 rounded-md border-2 border-indigo-500/0 hover:border-indigo-500 transition-colors"></span>
            </button>
          </Tooltip>
          
          {record.studentFileExcel && (
            <Tooltip title="Download Excel">
              <button
                onClick={() => window.open(record.studentFileExcel, '_blank')}
                className="relative flex items-center justify-center w-9 h-9 rounded-md transition-all duration-200"
              >
                <span className="absolute inset-0 bg-emerald-50 rounded-md"></span>
                <span className="absolute inset-0 bg-emerald-500 rounded-md opacity-0 hover:opacity-100 transition-opacity"></span>
                <HiOutlineDocumentArrowDown className="text-emerald-600 text-lg relative z-10" />
                <span className="absolute -inset-0.5 rounded-md border-2 border-emerald-500/0 hover:border-emerald-500 transition-colors"></span>
              </button>
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center">
              <HiOutlineChartBar className="mr-3 h-6 w-6 text-indigo-600" />
              Booking History
            </h1>
            <p className="text-slate-500 mt-1">
              View and analyze past room bookings
            </p>
          </div>
          
          <Button
            type="primary"
            onClick={handleRefresh}
            icon={<HiOutlineArrowPath className="mr-2 -ml-1" />}
            className="h-10 px-4 bg-indigo-600 hover:bg-indigo-700 border-none shadow-sm rounded-lg"
          >
            Refresh Data
          </Button>
        </div>
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-100 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-indigo-500">Total Bookings</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.total}</h3>
              </div>
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <HiOutlineCalendarDays className="text-indigo-500 w-5 h-5" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-100 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-emerald-600">Buildings</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.buildings}</h3>
              </div>
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <HiOutlineBuildingOffice2 className="text-emerald-500 w-5 h-5" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4 border border-violet-100 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-violet-500">Rooms</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.rooms}</h3>
              </div>
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-violet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10Z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-amber-600">Lecturers</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.lectures}</h3>
              </div>
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <HiOutlineAcademicCap className="text-amber-500 w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filters Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Search & Filter</h2>
          <Button 
            onClick={handleRefresh}
            size="small"
            className="text-slate-600 border-slate-300 hover:text-slate-800"
          >
            Clear All
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <Input
              placeholder="Search by description, room, lecturer..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<HiMagnifyingGlass className="text-slate-400" />}
              className="w-full h-10"
            />
          </div>
          
          <div>
            <DatePicker.RangePicker
              className="w-full h-10"
              value={timeRange}
              onChange={(dates) => setTimeRange(dates)}
              format="DD/MM/YYYY"
              placeholder={['Start Date', 'End Date']}
            />
          </div>
          
          <div>
            <Select
              mode="multiple"
              placeholder="Filter by building"
              value={selectedFilters.building}
              onChange={(values) => setSelectedFilters({...selectedFilters, building: values})}
              options={filterOptions.buildingName}
              className="w-full h-10"
              maxTagCount="responsive"
            />
          </div>
          
          <div>
            <Button
              type="primary"
              onClick={handleSearch}
              className="w-full h-10 bg-indigo-600 hover:bg-indigo-700"
              icon={<HiMagnifyingGlass className="mr-2 -ml-1" />}
            >
              Search
            </Button>
          </div>
        </div>
      </div>
      
      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Booking Records</h2>
          <div className="text-sm text-slate-500">
            {pagination.total} total records
          </div>
        </div>
        
        {loading ? (
          <div className="p-8 flex flex-col items-center">
            <Spin size="large" />
            <p className="mt-4 text-slate-500">Loading booking history...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No booking history found"
            className="py-16"
          />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredData}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              className: "p-5"
            }}
            onChange={handleTableChange}
            rowKey="id"
            className="booking-history-table"
            rowClassName="hover:bg-slate-50 transition-colors cursor-pointer"
            onRow={(record) => ({
              onClick: () => openModal(record),
            })}
          />
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        open={modal.isOpen}
        onCancel={closeModal}
        footer={null}
        width={800}
        className="booking-detail-modal"
        title={null}
        centered
        destroyOnClose
      >
        {modal.record ? (
          <div>
            {/* Custom Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center">
                <div className="bg-indigo-100 rounded-full p-2 mr-3">
                  <HiOutlineCalendarDays className="text-indigo-600 h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Booking Details</h3>
              </div>
              
              <div className="flex items-center space-x-3">
                <Tag 
                  color={getTypeSlotColor(modal.record.typeSlot)}
                  className="text-sm px-3 py-1 m-0 flex items-center"
                >
                  <span className="mr-1 inline-block w-2 h-2 rounded-full bg-current"></span>
                  {getTypeSlotName(modal.record.typeSlot)}
                </Tag>
                
                <button 
                  onClick={closeModal}
                  className="p-1.5 rounded-md hover:bg-slate-200 transition-colors text-slate-500 hover:text-slate-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-5">
              {/* Description Section */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <div className="bg-white rounded-lg p-2 shadow-sm mr-3">
                    <HiOutlineDocumentArrowDown className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-600 text-sm">Description</p>
                    <p className="font-medium text-slate-800 mt-1">{modal.record.description || 'No description provided'}</p>
                  </div>
                </div>
              </div>
              
              {/* Main Content with Two Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Left Column */}
                <div className="space-y-6">
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <h4 className="flex items-center text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                      <HiOutlineBuildingOffice2 className="mr-2 h-4 w-4 text-slate-400" />
                      Room Details
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <span className="w-24 text-slate-500">Room</span>
                        <span className="font-medium text-slate-800">{modal.record.roomNumber || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-24 text-slate-500">Building</span>
                        <span className="font-medium text-slate-800">{modal.record.buildingName || 'Not specified'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <h4 className="flex items-center text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                      <HiOutlineClock className="mr-2 h-4 w-4 text-slate-400" />
                      Date & Time
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <span className="w-24 text-slate-500">Date</span>
                        <span className="font-medium text-slate-800">
                          {modal.record.date 
                            ? dayjs(modal.record.date).format('DD MMM YYYY')
                            : 'Not specified'
                          }
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-24 text-slate-500">Time Range</span>
                        <span className="font-medium text-slate-800">
                          {modal.record.startTime ? modal.record.startTime.substring(0, 5) : 'N/A'} -{' '}
                          {modal.record.endTime ? modal.record.endTime.substring(0, 5) : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <h4 className="flex items-center text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Status
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <span className="w-24 text-slate-500">Status</span>
                        <Badge 
                          status={modal.record.status === 10 ? 'success' : 'error'} 
                          text={
                            <span className="font-medium">
                              {modal.record.status === 10 ? 'Completed' : 'Cancelled'}
                            </span>
                          } 
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Right Column */}
                <div className="space-y-6">
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <h4 className="flex items-center text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                      <HiOutlineAcademicCap className="mr-2 h-4 w-4 text-slate-400" />
                      Lecturer Information
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <span className="w-24 text-slate-500">Name</span>
                        <span className="font-medium text-indigo-600">{modal.record.lectureName || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-24 text-slate-500">Email</span>
                        <span className="font-medium text-slate-800">
                          {modal.record.lectureEmail || 'Not specified'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <h4 className="flex items-center text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                      <HiOutlineUserGroup className="mr-2 h-4 w-4 text-slate-400" />
                      Students
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <span className="w-24 text-slate-500">Count</span>
                        <span className="font-medium text-slate-800">
                          {modal.record.students?.length || 0} students
                        </span>
                      </div>
                      {modal.record.studentFileExcel && (
                        <div className="flex items-center">
                          <span className="w-24 text-slate-500">File</span>
                          <Button 
                            type="primary"
                            icon={<HiOutlineDocumentArrowDown className="mr-2 -ml-1" />}
                            onClick={() => window.open(modal.record.studentFileExcel, '_blank')}
                            className="bg-emerald-600 hover:bg-emerald-700"
                            size="small"
                          >
                            Download Excel
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {modal.record.reason && (
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <h4 className="flex items-center text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Additional Info
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <span className="block text-slate-500 mb-1">Notes/Reason</span>
                          <div className="font-medium text-slate-800 bg-white p-3 rounded border border-slate-200 max-h-32 overflow-y-auto">
                            {modal.record.reason}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Footer Actions */}
              <div className="flex justify-end mt-8 pt-4 border-t border-slate-200">
                <Button type="primary" onClick={closeModal} className="bg-indigo-600 hover:bg-indigo-700 h-10 px-5 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Close
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8">
            <Skeleton active paragraph={{ rows: 10 }} />
          </div>
        )}
      </Modal>
      
      <style jsx global>{`
        .booking-history-table .ant-table-thead > tr > th {
          background-color: #f8fafc !important;
          color: #475569 !important;
          font-weight: 600;
          padding-top: 12px;
          padding-bottom: 12px;
        }
        
        .booking-history-table .ant-table-tbody > tr > td {
          padding-top: 12px;
          padding-bottom: 12px;
        }
        
        .booking-history-table .ant-pagination-item-active {
          border-color: #4f46e5 !important;
        }
        
        .booking-history-table .ant-pagination-item-active a {
          color: #4f46e5 !important;
        }
        
        .ant-select-selection-item {
          color: #4f46e5 !important;
        }
        
        .booking-detail-modal .ant-modal-content {
          padding: 0;
          overflow: hidden;
          border-radius: 0.75rem;
        }
        
        .booking-detail-modal .ant-modal-close {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default BookingHistory;