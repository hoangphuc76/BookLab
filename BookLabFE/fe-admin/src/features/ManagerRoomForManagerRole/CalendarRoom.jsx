import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, Modal, Tooltip, Spin, DatePicker } from 'antd'; import ApiClient from '../../services/ApiClient';
import moment from 'moment';
import { swtoast } from '../../utils/swal';
import ChangeRoomStatusForm from '../../components/ChangeRoomStatusForm';
import {
  HiOutlineCalendarDays,
  HiOutlineClock,
  HiXCircle,
  HiPencilSquare,
  HiOutlineArrowPath,
  HiMagnifyingGlass,
  HiOutlineBuildingOffice2
} from 'react-icons/hi2';
import { CalendarOutlined } from '@ant-design/icons';

const CalendarRoom = () => {
  const [roomSchedules, setRoomSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
  });

  // Modal states for delete confirmation
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    scheduleId: null,
    roomNumber: '',
  });

  const fetchRoomSchedules = async () => {
    setLoading(true);
    try {
      // Use the new API endpoint as specified
      const response = await ApiClient.get('/TemporaryRoomStatus');

      const data = response.data || [];
      setRoomSchedules(data);
      setPagination({
        ...pagination,
        total: data.length,
      });
    } catch (error) {
      console.error('Error fetching room status schedules:', error);
      swtoast.error({
        title: 'Error',
        text: 'Failed to load room schedules'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomSchedules();
  }, []);

  const handleEdit = (record) => {
    setSelectedRoom({
      scheduleId: record.id,
    });
    setIsEditFormOpen(true);
  };

  const handleDelete = (record) => {
    setDeleteModal({
      isOpen: true,
      scheduleId: record.id,
      roomNumber: record.roomNumber || 'Room ' + record.roomId,
    });
  };

  const getUniqueDateFilters = (dataArray, dateField) => {
    // Get all unique dates (as YYYY-MM-DD strings)
    const uniqueDates = Array.from(new Set(
      dataArray.map(item => moment(item[dateField]).format('YYYY-MM-DD'))
    ));

    // Sort dates from newest to oldest
    uniqueDates.sort((a, b) => moment(b).diff(moment(a)));

    // Create filter options
    return uniqueDates.map(dateString => ({
      text: moment(dateString).format('DD MMM YYYY'),
      value: dateString
    }));
  };


  const confirmDelete = async () => {
    try {
      // Use the new DELETE endpoint
      await ApiClient.delete(`/TemporaryRoomStatus/${deleteModal.scheduleId}`);

      swtoast.success({
        title: 'Success',
        text: 'Temporary room status deleted successfully'
      });
      fetchRoomSchedules();
    } catch (error) {
      console.error('Error deleting temporary room status:', error);
      swtoast.error({
        title: 'Error',
        text: error.response?.data?.message || 'Failed to delete temporary room status'
      });
    } finally {
      setDeleteModal({ isOpen: false, scheduleId: null, roomNumber: '' });
    }
  };

  const handleStatusUpdate = async (statusData) => {
    try {
      // Use the new PUT endpoint with just the status value
      await ApiClient.put(
        `/TemporaryRoomStatus/${selectedRoom.scheduleId}?startDate=${encodeURIComponent(statusData.startDate)}&endDate=${encodeURIComponent(statusData.endDate)}`,
        statusData.statusValue,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      swtoast.success({
        title: 'Success',
        text: 'Room temporary status updated successfully'
      });

      setIsEditFormOpen(false);
      fetchRoomSchedules();
    } catch (error) {
      console.error('Error updating room temporary status:', error);
      swtoast.error({
        title: 'Error',
        text: error.response?.data?.message || 'Failed to update room status'
      });
    }
  };

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };



  const handleRefresh = () => {
    setSearchText('');
    fetchRoomSchedules();
  };

  const getStatusTag = (status) => {
    switch (status) {
      case 7:
        return <Tag color="orange">Maintenance</Tag>;
      case 8:
        return <Tag color="red">Locked</Tag>;
      default:
        return <Tag color="default">Unknown ({status})</Tag>;
    }
  };

  // Add local search filtering
  const filteredData = searchText
    ? roomSchedules.filter(item =>
      item.roomNumber?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.buildingName?.toLowerCase().includes(searchText.toLowerCase())
    )
    : roomSchedules;

  const columns = [
    {
      title: 'Room Number',
      dataIndex: 'roomNumber',
      key: 'roomNumber',
      render: (text, record) => (
        <div className="font-medium text-slate-800">
          {text || `Room ${record.roomId.substring(0, 8)}...`}
          <div className="text-xs text-slate-500 mt-1 flex items-center">
            <HiOutlineBuildingOffice2 className="mr-1.5 text-slate-400" />
            {record.buildingName || 'N/A'}
          </div>
        </div>
      ),
      sorter: (a, b) => (a.roomNumber || '').localeCompare(b.roomNumber || ''),
    },
    {
      title: 'Status',
      dataIndex: 'temporaryStatus',
      key: 'temporaryStatus',
      render: (status) => getStatusTag(status),
      filters: [
        { text: 'Maintenance', value: 7 },
        { text: 'Locked', value: 8 },
      ],
      onFilter: (value, record) => record.temporaryStatus === value,
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date) => (
        <div className="font-medium text-slate-800 flex items-center">
          <HiOutlineCalendarDays className="mr-1.5 text-slate-400" />
          {moment(date).format('DD MMM YYYY')}
          <div className="text-xs text-slate-500 mt-1 flex items-center">
            <HiOutlineClock className="mr-1.5 text-slate-400" />
            {moment(date).format('HH:mm')}
          </div>
        </div>
      ),
      sorter: (a, b) => moment(a.startDate).diff(moment(b.startDate)),
      filters: getUniqueDateFilters(roomSchedules, 'startDate'),
      onFilter: (value, record) => {
        // Compare the record's date with the filter value (both in YYYY-MM-DD format)
        const recordDate = moment(record.startDate).format('YYYY-MM-DD');
        return recordDate === value;
      },
      filterIcon: filtered => (
        <HiOutlineCalendarDays style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date) => (
        <div className="font-medium text-slate-800 flex items-center">
          <HiOutlineCalendarDays className="mr-1.5 text-slate-400" />
          {moment(date).format('DD MMM YYYY')}
          <div className="text-xs text-slate-500 mt-1 flex items-center">
            <HiOutlineClock className="mr-1.5 text-slate-400" />
            {moment(date).format('HH:mm')}
          </div>
        </div>
      ),
      sorter: (a, b) => moment(a.endDate).diff(moment(b.endDate)),
      filters: getUniqueDateFilters(roomSchedules, 'endDate'),
      onFilter: (value, record) => {
        // Compare the record's date with the filter value (both in YYYY-MM-DD format)
        const recordDate = moment(record.endDate).format('YYYY-MM-DD');
        return recordDate === value;
      },
      filterIcon: filtered => (
        <HiOutlineCalendarDays style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '120px',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit Schedule">
            <button
              onClick={() => handleEdit(record)}
              className="relative flex items-center justify-center w-9 h-9 rounded-md transition-all duration-200"
            >
              <span className="absolute inset-0 bg-indigo-50 rounded-md"></span>
              <span className="absolute inset-0 bg-indigo-500 rounded-md opacity-0 hover:opacity-100 transition-opacity"></span>
              <HiPencilSquare className="text-indigo-600 text-lg relative z-10" />
              <span className="absolute -inset-0.5 rounded-md border-2 border-indigo-500/0 hover:border-indigo-500 transition-colors"></span>
            </button>
          </Tooltip>

          <Tooltip title="Delete Schedule">
            <button
              onClick={() => handleDelete(record)}
              className="relative flex items-center justify-center w-9 h-9 rounded-md transition-all duration-200"
            >
              <span className="absolute inset-0 bg-rose-50 rounded-md"></span>
              <span className="absolute inset-0 bg-rose-500 rounded-md opacity-0 hover:opacity-100 transition-opacity"></span>
              <HiXCircle className="text-rose-600 text-lg relative z-10" />
              <span className="absolute -inset-0.5 rounded-md border-2 border-rose-500/0 hover:border-rose-500 transition-colors"></span>
            </button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8 hover:shadow-md transition-all duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center">
              <HiOutlineCalendarDays className="mr-3 h-6 w-6 text-indigo-600" />
              Room Status Schedule
            </h1>
            <p className="text-slate-500 mt-1">
              View and manage room maintenance and lock schedules
            </p>
          </div>

          <Button
            type="primary"
            onClick={handleRefresh}
            icon={<HiOutlineArrowPath className="mr-2 -ml-1" />}
            className="h-10 px-4 bg-indigo-600 hover:bg-indigo-700 border-none rounded-lg shadow-sm"
          >
            Refresh Data
          </Button>
        </div>

      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800 flex items-center">
            <CalendarOutlined className="mr-2 text-indigo-500" />
            Schedule Details
          </h3>
          <div className="text-sm text-slate-500">
            {filteredData.length} total schedules
          </div>
        </div>

        {loading ? (
          <div className="p-8 flex flex-col items-center">
            <Spin size="large" />
            <p className="mt-4 text-slate-500">Loading schedules...</p>
          </div>
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
            className="room-schedule-table"
            rowClassName="hover:bg-slate-50 transition-colors cursor-pointer"
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        title={
          <div className="flex items-center text-rose-600">
            <HiXCircle className="mr-2 text-xl" />
            <span>Confirm Deletion</span>
          </div>
        }
        open={deleteModal.isOpen}
        onOk={confirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, scheduleId: null, roomNumber: '' })}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{
          className: "bg-rose-600 hover:bg-rose-700 border-rose-600",
          danger: true
        }}
      >
        <p>
          Are you sure you want to delete the schedule for room <strong>{deleteModal.roomNumber}</strong>?
          This action cannot be undone.
        </p>
      </Modal>

      {/* Edit Form Modal */}
      {selectedRoom && (
        <ChangeRoomStatusForm
          room={selectedRoom}
          isOpen={isEditFormOpen}
          setIsOpen={setIsEditFormOpen}
          onSubmit={handleStatusUpdate}
          onCancel={() => setIsEditFormOpen(false)}
          isResetButtonDisplay={false}
          isScheduleDisplay={true}
        />
      )}

      {/* Custom styles for Ant Design components */}
      <style jsx global>{`
        .room-schedule-table .ant-table-thead > tr > th {
          background-color: #f8fafc !important;
          color: #475569 !important;
          font-weight: 600;
          padding-top: 12px;
          padding-bottom: 12px;
        }
        
        .room-schedule-table .ant-table-tbody > tr > td {
          padding-top: 12px;
          padding-bottom: 12px;
        }
        
        .room-schedule-table .ant-pagination-item-active {
          border-color: #4f46e5 !important;
        }
        
        .room-schedule-table .ant-pagination-item-active a {
          color: #4f46e5 !important;
        }
        
        .ant-select-selection-item {
          color: #4f46e5 !important;
        }
      `}</style>
    </div>
  );
};

export default CalendarRoom;