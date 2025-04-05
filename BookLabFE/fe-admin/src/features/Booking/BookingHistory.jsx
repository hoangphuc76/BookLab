import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Tag, Space } from 'antd';
import ApiClient from '../../services/ApiClient';
import { EyeOutlined, DownloadOutlined } from '@ant-design/icons';

const BookingHistory = () => {
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

  const { bookings, modal, pagination } = state;

  useEffect(() => {
    fetchBookings(pagination.current, pagination.pageSize);
  }, []);

  const fetchBookings = async (page = 1, pageSize = 10) => {
    try {
      const response = await ApiClient.get(`/Booking/GetBookings`, {
        params: {
          pageNumber: page,
          pageSize: pageSize,
        },
      });

      const data = response.data.data || response.data;

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

  const handleTableChange = (newPagination) => {
    fetchBookings(newPagination.current, newPagination.pageSize);
  };

  const getTypeSlotName = (typeSlot) => {
    const typeNames = {
      1: 'Regular',
      2: 'Premium',
      3: 'Extended',
    };
    return typeNames[typeSlot] || `Type ${typeSlot}`;
  };

  const columns = [
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: '200px',
      render: (text) => (
        <span className="text-gray-800 font-medium">{text || 'N/A'}</span>
      ),
    },
    {
      title: 'Lecture Name',
      dataIndex: 'lectureName',
      key: 'lectureName',
      render: (text) => (
        <span className="text-blue-600">{text || 'Not specified'}</span>
      ),
    },
    {
      title: 'Building',
      dataIndex: 'buildingName',
      key: 'buildingName',
      render: (text) => text || 'N/A',
    },
    {
      title: 'Room',
      dataIndex: 'roomNumber',
      key: 'roomNumber',
      render: (text) => text || 'N/A',
    },
    {
      title: 'Type Slot',
      dataIndex: 'typeSlot',
      key: 'typeSlot',
      render: (typeSlot) => (
        <Tag color={typeSlot === 1 ? 'blue' : typeSlot === 2 ? 'green' : 'purple'}>
          {getTypeSlotName(typeSlot)}
        </Tag>
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
            <div className="font-medium">{date}</div>
            <div className="text-gray-600">{startTime} - {endTime}</div>
          </div>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '100px',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            onClick={() => openModal(record)}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 border-none shadow-md"
            icon={<EyeOutlined className="text-white" />}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Booking History</h1>
      </div>

      <div className="bg-white rounded-lg shadow-lg">
        <Table
          columns={columns}
          dataSource={bookings}
          pagination={pagination}
          onChange={handleTableChange}
          bordered
          rowKey="id"
          className="rounded-lg"
          rowClassName="hover:bg-gray-100 transition-colors duration-200"
        />
      </div>

      <Modal
        title={<span className="text-xl font-semibold text-gray-800">Booking Details</span>}
        open={modal.isOpen}
        onCancel={closeModal}
        footer={null}
        width={600}
        className="rounded-lg"
      >
        {modal.record && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="text-lg font-medium text-gray-800">{modal.record.description || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Lecture Name</p>
                <p className="text-lg font-medium text-blue-600">{modal.record.lectureName || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Lecture Email</p>
                <p className="text-lg font-medium text-gray-800">{modal.record.lectureEmail || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Building</p>
                <p className="text-lg font-medium text-gray-800">{modal.record.buildingName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Room</p>
                <p className="text-lg font-medium text-gray-800">{modal.record.roomNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Type Slot</p>
                <p className="text-lg font-medium">
                  <Tag color={modal.record.typeSlot === 1 ? 'blue' : modal.record.typeSlot === 2 ? 'green' : 'purple'}>
                    {getTypeSlotName(modal.record.typeSlot)}
                  </Tag>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="text-lg font-medium text-gray-800">
                  {modal.record.date ? new Date(modal.record.date).toLocaleDateString('en-GB') : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="text-lg font-medium text-gray-800">
                  {modal.record.startTime ? modal.record.startTime.substring(0, 5) : 'N/A'} -{' '}
                  {modal.record.endTime ? modal.record.endTime.substring(0, 5) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Students</p>
                <p className="text-lg font-medium text-gray-800">
                  {modal.record.students && modal.record.students.length > 0 ? (
                    `${modal.record.students.length} student(s)`
                  ) : modal.record.studentFileExcel ? (
                    <a
                      href={modal.record.studentFileExcel}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700"
                    >
                      Download Excel
                    </a>
                  ) : (
                    'No students'
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BookingHistory;