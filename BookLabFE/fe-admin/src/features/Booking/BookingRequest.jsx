import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message, Modal, Input, Spin, Badge, Tooltip } from 'antd';
import ApiClient from '../../services/ApiClient';
import NotificationPopup from '../../components/common/NotificationPopup';
import { useNotification } from '../../hooks/useNotification';
import { DownloadOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, FilterOutlined, ReloadOutlined } from '@ant-design/icons';
import { HiOutlineClipboardList, HiOutlineRefresh } from 'react-icons/hi';

const BookingRequests = () => {
  const { notification, showNotification, closeNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [downloadingStates, setDownloadingStates] = useState({});
  const [allData, setAllData] = useState([]); // Store all data for filters
  const [state, setState] = useState({
    orderDetail: [],
    modal: {
      isOpen: false,
      type: null,
      record: null,
      reason: '',
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

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    denied: 0
  });

  const { orderDetail, modal, pagination } = state;

  const generateFilterOptions = (data = allData) => {
    // Existing filter generation code stays the same
    const options = {
      description: [...new Set(data.map(item => item.description).filter(Boolean))],
      lectureName: [...new Set(data.map(item => item.lectureName).filter(Boolean))],
      buildingName: [...new Set(data.map(item => item.buildingName).filter(Boolean))],
      roomNumber: [...new Set(data.map(item => item.roomNumber).filter(Boolean))],
      typeSlot: [...new Set(data.map(item => item.typeSlot).filter(Boolean))],
      dates: [...new Set(data.map(item => item.date ? new Date(item.date).toLocaleDateString('en-GB') : null).filter(Boolean))],
      timeSlots: [...new Set(data.map(item => {
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

  useEffect(() => {
    if (orderDetail?.length > 0) {
      generateFilterOptions();

      // Calculate stats for the summary cards
      setStats({
        total: orderDetail.length,
        pending: orderDetail.filter(item => item.status === 0 || item.status === 9).length,
        accepted: orderDetail.filter(item => item.status === 10).length,
        denied: orderDetail.filter(item => item.status === 11).length
      });
    }
  }, [orderDetail]);

  useEffect(() => {
    fetchBookings(pagination.current, pagination.pageSize);
  }, []);

  const handleExportStudents = async (recordId, students) => {
    // Skip if already downloading
    if (downloadingStates[recordId]) return;

    // Update downloading state for this record
    setDownloadingStates(prev => ({ ...prev, [recordId]: true }));

    try {
      if (!students || students.length === 0) {
        message.warning('No students to export');
        return;
      }

      // Call the API with the students data
      const response = await ApiClient.post('/Booking/ExportStudentsExcel',
        students,
        { responseType: 'blob' }
      );

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      const filename = `students_export_${recordId || new Date().getTime()}.xlsx`;

      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      message.success('Student data exported successfully');
    } catch (error) {
      console.error('Error exporting students data:', error);
      message.error('Failed to export student data');
    } finally {
      // Clear downloading state
      setDownloadingStates(prev => ({ ...prev, [recordId]: false }));
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await ApiClient.get(`/Booking/GetBookings`, {
        params: {
          pageNumber: 1,
          pageSize: 1000, // Fetch all data at once
        },
      });

      console.log("API Response:", response.data);

      // Ensure we're getting the correct data structure
      const bookings = response.data.data || response.data;
      setAllData(bookings); // Store all data

      // Generate filter options from all data
      generateFilterOptions(bookings);

      // Calculate total count
      const totalItems = bookings.length;

      // Initialize with first page of data
      const firstPageData = bookings.slice(0, pagination.pageSize);

      setState(prev => ({
        ...prev,
        orderDetail: firstPageData,
        pagination: {
          ...prev.pagination,
          current: 1,
          total: totalItems,
        },
      }));
    } catch (error) {
      console.error('Error fetching bookings:', error);
      showNotification('error', 'Failed to fetch booking requests', 'Data Loading Error');
    } finally {
      setLoading(false);
    }
  };


  const openModal = (type, record) => {
    setState(prev => ({
      ...prev,
      modal: { ...prev.modal, isOpen: true, type, record },
    }));
  };

  const closeModal = () => {
    setState(prev => ({
      ...prev,
      modal: { isOpen: false, type: null, record: null, reason: '' },
    }));
  };

  const handleConfirm = async () => {
    try {
      if (modal.type === 'deny' && !modal.reason.trim()) {
        return message.warning('Please provide a reason for denial');
      }

      await ApiClient.put(
        `/Booking/ChangeStatus/${modal.record.id}?reason=${modal.type === 'deny' ? encodeURIComponent(modal.reason) : 'Accepted'
        }&status=${modal.type === 'accept' ? 10 : 11
        }&email=${encodeURIComponent(modal.record.lectureEmail)
        }&roomNumber=${encodeURIComponent(modal.record.roomNumber || '')
        }&description=${encodeURIComponent(modal.record.description || '')
        }&buildingName=${encodeURIComponent(modal.record.buildingName || '')
        }`
      );

      showNotification(
        'success',
        modal.type === 'accept'
          ? 'Booking request accepted successfully'
          : 'Booking request denied successfully',
        'Booking Status Updated'
      );
      closeModal();
      fetchBookings(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('Error updating booking:', error);
      showNotification('error', error.message || 'An error occurred while updating the booking', 'Update Failed');
    }
  };

  const handleTableChange = (newPagination, filters, sorter) => {
    console.log('Page changed to:', newPagination.current);
    console.log('Page size changed to:', newPagination.pageSize);
    console.log('Filters:', filters);
    console.log('Sorter:', sorter);

    // Update pagination state only (no API call)
    setState(prev => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        current: newPagination.current,
        pageSize: newPagination.pageSize,
      }
    }));

    // Handle client-side pagination
    const filteredData = handleClientSideFiltering(allData, filters);
    const sortedData = handleClientSideSorting(filteredData, sorter);
    const paginatedData = handleClientSidePagination(sortedData, newPagination);

    setState(prev => ({
      ...prev,
      orderDetail: paginatedData
    }));
  };

  const handleClientSideFiltering = (data, filters) => {
    if (!filters || Object.keys(filters).length === 0 ||
      !Object.values(filters).some(val => val && val.length > 0)) {
      return data;
    }

    return data.filter(record => {
      return Object.entries(filters).every(([key, values]) => {
        if (!values || values.length === 0) return true;

        // Handle date & time special case
        if (key === 'dateTime') {
          return values.some(value => {
            // Check if filtering by date
            if (filterOptions.dates.some(option => option.value === value)) {
              const recordDate = record.date ? new Date(record.date).toLocaleDateString('en-GB') : '';
              return recordDate === value;
            }

            // Check if filtering by time slot
            if (filterOptions.timeSlots.some(option => option.value === value)) {
              const recordTimeSlot = record.startTime && record.endTime
                ? `${record.startTime.substring(0, 5)} - ${record.endTime.substring(0, 5)}`
                : '';
              return recordTimeSlot === value;
            }

            return false;
          });
        }

        // Handle typeSlot special case
        if (key === 'typeSlot') {
          return values.some(value => Number(record.typeSlot) === Number(value));
        }

        // Handle normal text filters
        if (key === 'description' || key === 'lectureName') {
          return values.some(value => record[key]?.includes(value));
        }

        // Handle exact match filters
        return values.some(value => record[key] === value);
      });
    });
  };

  const handleClientSideSorting = (data, sorter) => {
    if (!sorter || !sorter.order) {
      return data;
    }

    return [...data].sort((a, b) => {
      const field = sorter.field;

      // Handle date fields
      if (field === 'date' || field === 'startDate' || field === 'endDate') {
        return sorter.order === 'ascend'
          ? new Date(a[field]) - new Date(b[field])
          : new Date(b[field]) - new Date(a[field]);
      }

      // Handle string fields
      if (typeof a[field] === 'string') {
        return sorter.order === 'ascend'
          ? a[field].localeCompare(b[field])
          : b[field].localeCompare(a[field]);
      }

      // Handle number fields
      return sorter.order === 'ascend'
        ? a[field] - b[field]
        : b[field] - a[field];
    });
  };

  const handleClientSidePagination = (data, pagination) => {
    const { current, pageSize } = pagination;
    const startIndex = (current - 1) * pageSize;
    return data.slice(startIndex, startIndex + pageSize);
  };

  const handleRowClick = (record) => {
    if (record.studentFileExcel) {
      window.open(record.studentFileExcel, '_blank');
    }
  };

  const columns = [
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: '200px',
      filters: filterOptions.description,
      onFilter: (value, record) => record.description?.includes(value),
      filterSearch: true,
      render: (text) => (
        <div className="max-w-xs truncate" title={text}>
          {text || 'Not specified'}
        </div>
      ),
    },
    {
      title: 'Lecture Name',
      dataIndex: 'lectureName',
      key: 'lectureName',
      render: (text) => text || 'Not specified',
      filters: filterOptions.lectureName,
      onFilter: (value, record) => record.lectureName?.includes(value),
      filterSearch: true,
    },
    {
      title: 'Building',
      dataIndex: 'buildingName',
      key: 'buildingName',
      filters: filterOptions.buildingName,
      onFilter: (value, record) => record.buildingName === value,
      filterSearch: true,
    },
    {
      title: 'Room',
      dataIndex: 'roomNumber',
      key: 'roomNumber',
      filters: filterOptions.roomNumber,
      onFilter: (value, record) => record.roomNumber === value,
      filterSearch: true,
    },
    {
      title: 'Type Slot',
      dataIndex: 'typeSlot',
      key: 'typeSlot',
      render: (typeSlot) => {
        const typeNames = {
          1: 'Old',
          2: 'New',
          3: 'Out Slot',
        };
        const typeColors = {
          1: 'blue',
          2: 'green',
          3: 'purple',
        };
        return (
          <Badge color={typeColors[typeSlot]} text={typeNames[typeSlot] || `Type ${typeSlot}`} />
        );
      },
      filters: filterOptions.typeSlot,
      onFilter: (value, record) => record.typeSlot === value,
    },
    {
      title: 'Date & Time',
      key: 'dateTime',
      filters: [
        {
          text: 'Date',
          value: 'date',
          children: filterOptions.dates,
        },
        {
          text: 'Time Slot',
          value: 'timeSlot',
          children: filterOptions.timeSlots,
        }
      ],
      onFilter: (value, record) => {
        // Check if filtering by date
        if (filterOptions.dates.some(option => option.value === value)) {
          const recordDate = record.date ? new Date(record.date).toLocaleDateString('en-GB') : '';
          return recordDate === value;
        }

        // Check if filtering by time slot
        if (filterOptions.timeSlots.some(option => option.value === value)) {
          const recordTimeSlot = record.startTime && record.endTime
            ? `${record.startTime.substring(0, 5)} - ${record.endTime.substring(0, 5)}`
            : '';
          return recordTimeSlot === value;
        }

        return false;
      },
      render: (_, record) => {
        const date = record.date ? new Date(record.date).toLocaleDateString('en-GB') : '';
        const startTime = record.startTime ? record.startTime.substring(0, 5) : '';
        const endTime = record.endTime ? record.endTime.substring(0, 5) : '';
        return (
          <div>
            <div className="font-medium">{date}</div>
            <div className="text-gray-600 flex items-center text-xs mt-1">
              <ClockCircleOutlined className="mr-1" />
              {startTime} - {endTime}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Students',
      key: 'students',
      render: (_, record) => {
        const recordId = record.id || record.bookingId;
        const isDownloading = downloadingStates[recordId];
        const studentCount = record.students?.length || 0;

        return (
          <div>
            {studentCount > 0 ? (
              <div className="flex items-center">
                <Badge count={studentCount} style={{ backgroundColor: '#1890ff' }} className="mr-2" />
                <Button
                  type="link"
                  icon={isDownloading ? <Spin size="small" /> : <DownloadOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExportStudents(recordId, record.students);
                  }}
                  disabled={isDownloading}
                  className="text-blue-500 hover:text-blue-700 p-0"
                >
                  {isDownloading ? 'Exporting...' : 'Export Excel'}
                </Button>
              </div>
            ) : (
              <span className="text-gray-500 italic">No students</span>
            )}
          </div>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '120px',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Accept Booking">
            <Button
              type="primary"
              onClick={(e) => {
                e.stopPropagation();
                openModal('accept', record);
              }}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-600 border-none shadow-sm"
              icon={<CheckCircleOutlined className="text-lg" />}
            />
          </Tooltip>
          <Tooltip title="Deny Booking">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                openModal('deny', record);
              }}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-rose-500 hover:bg-rose-600 border-none shadow-sm"
              icon={<CloseCircleOutlined className="text-lg" />}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <NotificationPopup
        type={notification.type}
        message={notification.message}
        title={notification.title}
        isOpen={notification.isOpen}
        onClose={closeNotification}
      />
      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8 hover:shadow-md transition-all duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-1 flex items-center">
              <HiOutlineClipboardList className="mr-3 h-6 w-6 text-indigo-600" />
              Booking Requests
            </h2>
            <p className="text-slate-500 text-sm">
              Review and manage room booking requests
            </p>
          </div>
          <Button
            type="primary"
            icon={<HiOutlineRefresh className="mr-2 -ml-1" />}
            onClick={() => fetchBookings()} // Will refresh all data
            className="h-10 px-4 bg-indigo-600 hover:bg-indigo-700 border-none rounded-lg shadow-sm"
          >
            Refresh Data
          </Button>
        </div>
      </div>



      {/* Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800 flex items-center">
            <FilterOutlined className="mr-2 text-indigo-500" />
            Request Details
          </h3>
          <div className="text-sm text-slate-500">
            {pagination.total} total requests
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={orderDetail}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            className: "p-5"
          }}
          onChange={handleTableChange}
          rowKey="id"
          loading={loading}
          className="custom-ant-table"
          rowClassName="hover:bg-slate-50 transition-colors cursor-pointer"
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
          })}
        />
      </div>

      {/* Modal styles improved */}
      <Modal
        title={
          <div className="flex items-center">
            {modal.type === 'accept' ? (
              <CheckCircleOutlined className="text-emerald-500 mr-2 text-xl" />
            ) : (
              <CloseCircleOutlined className="text-rose-500 mr-2 text-xl" />
            )}
            <span>{modal.type === 'accept' ? 'Confirm Accept' : 'Deny Booking'}</span>
          </div>
        }
        open={modal.isOpen && (modal.type === 'accept' || modal.type === 'deny')}
        onOk={handleConfirm}
        onCancel={closeModal}
        okText={modal.type === 'accept' ? 'Accept' : 'Deny'}
        cancelText="Cancel"
        okButtonProps={{
          className: modal.type === 'accept' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700',
        }}
      >
        {modal.type === 'accept' ? (
          <div className="py-3">
            <p className="text-slate-600">Are you sure you want to accept this booking request?</p>

            {modal.record && (
              <div className="mt-4 bg-slate-50 p-4 rounded-lg">
                <p className="font-medium text-slate-800">{modal.record.description}</p>
                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                  <div>
                    <span className="text-slate-500">Room:</span>{" "}
                    <span className="font-medium">{modal.record.roomNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Building:</span>{" "}
                    <span className="font-medium">{modal.record.buildingName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Date:</span>{" "}
                    <span className="font-medium">
                      {modal.record.date ? new Date(modal.record.date).toLocaleDateString('en-GB') : ''}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Time:</span>{" "}
                    <span className="font-medium">
                      {modal.record.startTime?.substring(0, 5)} - {modal.record.endTime?.substring(0, 5)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-3">
            <p className="text-slate-600 mb-4">Please provide a reason for denying this booking request:</p>

            {modal.record && (
              <div className="mb-4 bg-slate-50 p-4 rounded-lg">
                <p className="font-medium text-slate-800">{modal.record.description}</p>
                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                  <div>
                    <span className="text-slate-500">Room:</span>{" "}
                    <span className="font-medium">{modal.record.roomNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Building:</span>{" "}
                    <span className="font-medium">{modal.record.buildingName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Date:</span>{" "}
                    <span className="font-medium">
                      {modal.record.date ? new Date(modal.record.date).toLocaleDateString('en-GB') : ''}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Time:</span>{" "}
                    <span className="font-medium">
                      {modal.record.startTime?.substring(0, 5)} - {modal.record.endTime?.substring(0, 5)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <Input.TextArea
              value={modal.reason}
              onChange={(e) =>
                setState(prev => ({
                  ...prev,
                  modal: { ...prev.modal, reason: e.target.value },
                }))
              }
              rows={4}
              placeholder="Enter reason for denial..."
              className="w-full mt-2"
            />
          </div>
        )}
      </Modal>

      {/* Custom styles for Ant Design components */}
      <style jsx global>{`
        .ant-table-thead > tr > th {
          background-color: #f8fafc !important;
          color: #475569 !important;
          font-weight: 600;
        }
        
        .custom-ant-table .ant-table-tbody > tr:hover > td {
          background-color: #f1f5f9 !important;
        }
        
        .ant-pagination-item-active {
          border-color: #4f46e5 !important;
        }
        
        .ant-pagination-item-active a {
          color: #4f46e5 !important;
        }
        
        .ant-btn-primary {
          background-color: #4f46e5;
        }
        
        .ant-btn-primary:hover {
          background-color: #4338ca;
        }
        
        .ant-badge-status-text {
          margin-left: 6px;
        }
      `}</style>
    </div>
  );
};

export default BookingRequests;