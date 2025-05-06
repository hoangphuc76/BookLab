import React, { useState, useEffect } from 'react'
import { Table, Button, Space, message, Modal, Input } from 'antd'
import ApiClient from '../../services/ApiClient'
import { format } from 'date-fns'
import { DownloadOutlined } from '@ant-design/icons';

const detail = () => {
  const [downloadingStates, setDownloadingStates] = useState({});
  const [state, setState] = useState({
    orderDetail: [],
    modal: {
      isOpen: false,
      type: null,
      record: null,
      reason: ''
    },
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
      showSizeChanger: true,
      showTotal: (total) => `Total ${total} items`
    }
  })

  const { orderDetail, modal, pagination } = state

  useEffect(() => {
    fetchBookings(pagination.current, pagination.pageSize)
  }, [])

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
  const fetchBookings = async (page = 1, pageSize = 10) => {
    try {
      const response = await ApiClient.get(`/Booking/GetBookings`, {
        params: {
          pageNumber: page,
          pageSize: pageSize
        }
      })

      setState(prev => ({
        ...prev,
        orderDetail: response.data.data || response.data,
        pagination: {
          ...prev.pagination,
          current: page,
          total: response.data.total || response.data.length
        }
      }))
    } catch (error) {
      console.error('Error fetching bookings:', error)
    }
  }

  const openModal = (type, record) => {
    setState(prev => ({
      ...prev,
      modal: { ...prev.modal, isOpen: true, type, record }
    }))
  }

  const closeModal = () => {
    setState(prev => ({
      ...prev,
      modal: { isOpen: false, type: null, record: null, reason: '' }
    }))
  }
  console.log(orderDetail, modal, pagination)
  const handleConfirm = async () => {
    try {
      if (modal.type === 'deny' && !modal.reason.trim()) {
        return message.warning('Please provide a reason for denial')
      }

      await ApiClient.put(
        `/Booking/ChangeStatus/${modal.record.id}?reason=${modal.type === 'deny' ? encodeURIComponent(modal.reason) : 'Accepted'
        }&status=${modal.type === 'accept' ? 10 : 11
        }&email=${encodeURIComponent(modal.record.lectureEmail)
        }&roomNumber=${encodeURIComponent(modal.record.roomNumber || '')
        }&description=${encodeURIComponent(modal.record.description || '')
        }&buildingName=${encodeURIComponent(modal.record.buildingName || '')
        }`
      )

      const successMessage = modal.type === 'accept'
        ? 'Booking accepted successfully'
        : 'Booking denied successfully'

      message.success(successMessage)
      closeModal()
      fetchBookings(pagination.current, pagination.pageSize)
    } catch (error) {
      console.error('Error updating booking status:', error)
      message.error(`Failed to ${modal.type} booking`)
    }
  }

  const handleTableChange = (newPagination, filters, sorter) => {
    fetchBookings(newPagination.current, newPagination.pageSize)
  }

  const handleRowClick = (record) => {
    if (record.studentFileExcel) {
      window.open(record.studentFileExcel, '_blank')
    }
  }

  const columns = [
    {
      title: 'Stt',
      dataIndex: 'index',
      key: 'index',
      width: '60px',
      render: (text, record, index) => ((pagination.current - 1) * pagination.pageSize) + index + 1,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: '200px',
    },
    {
      title: 'Lecture Name',
      dataIndex: 'lectureName',
      key: 'lectureName',
      render: (text) => text || 'Not specified',
    },
    {
      title: 'Building',
      dataIndex: 'buildingName',
      key: 'buildingName',
    },
    {
      title: 'Room Number',
      dataIndex: 'roomNumber',
      key: 'roomNumber',
    },
    {
      title: 'Type Slot',
      dataIndex: 'typeSlot',
      key: 'typeSlot',
      render: (typeSlot) => {
        const typeNames = {
          1: 'Regular',
          2: 'Premium',
          3: 'Extended'
        };
        return typeNames[typeSlot] || `Type ${typeSlot}`;
      }
    },
    {
      title: 'Date & Time',
      key: 'dateTime',
      render: (_, record) => {
        // Format date: YYYY-MM-DD -> DD/MM/YYYY
        const date = record.date ? new Date(record.date).toLocaleDateString('en-GB') : '';

        // Format time: remove seconds
        const startTime = record.startTime ? record.startTime.substring(0, 5) : '';
        const endTime = record.endTime ? record.endTime.substring(0, 5) : '';

        return (
          <div>
            <div>{date}</div>
            <div className="text-gray-600">{startTime} - {endTime}</div>
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

        return (
          <div>
            {record.students && record.students.length > 0 ? (
              <div className="flex flex-col">
                <span>{record.students.length} student(s)</span>
                <Button
                  type="link"
                  icon={isDownloading ? <Spin size="small" /> : <DownloadOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExportStudents(recordId, record.students);
                  }}
                  size="small"
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
      width: '100px',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            onClick={(e) => {
              e.stopPropagation(); // Ngăn chặn sự kiện lan truyền
              openModal('accept', record);
            }}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-600 border-none shadow-md"
            icon={<span className="text-white text-lg">✓</span>}
          />
          <Button
            onClick={(e) => {
              e.stopPropagation(); // Ngăn chặn sự kiện lan truyền
              openModal('deny', record);
            }}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-rose-500 hover:bg-rose-600 border-none shadow-md"
            icon={<span className="text-white text-lg">✗</span>}
          />
        </Space>
      ),
    }
  ];

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Booking Requests</h1>
      </div>

      <Table
        columns={columns}
        dataSource={orderDetail}
        pagination={pagination}
        onChange={handleTableChange}
        bordered
        rowKey="bookingId"
      />

      <Modal
        title={modal.type === 'accept' ? 'Confirm Accept' : 'Deny Booking'}
        open={modal.isOpen && (modal.type === 'accept' || modal.type === 'deny')}
        onOk={handleConfirm}
        onCancel={closeModal}
        okText={modal.type === 'accept' ? 'Accept' : 'Deny'}
        cancelText="Cancel"
      >
        {modal.type === 'accept' ? (
          <p>Are you sure you want to accept this booking?</p>
        ) : (
          <>
            <p>Please provide a reason for denial:</p>
            <Input.TextArea
              value={modal.reason}
              onChange={(e) => setState(prev => ({
                ...prev,
                modal: { ...prev.modal, reason: e.target.value }
              }))}
              rows={4}
              placeholder="Enter reason for denial..."
            />
          </>
        )}
      </Modal>

      <Modal
        title="Students List"
        open={modal.isOpen && modal.type === 'students'}
        onCancel={closeModal}
        footer={null}
      >
        {modal.record && modal.record.students && (
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Student ID</th>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                </tr>
              </thead>
              <tbody>
                {modal.record.students.map((student, index) => (
                  <tr key={student.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2">{student.studentId}</td>
                    <td className="px-4 py-2">{student.fullName}</td>
                    <td className="px-4 py-2">{student.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default detail