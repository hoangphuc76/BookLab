import React, { useState, useEffect } from 'react';
import { Table, Avatar, Checkbox, Button, message } from 'antd';
import apiClient from '../../services/ApiClient';
import { useParams } from 'react-router-dom';
const MarkAttendance = () => {
  // Sample data - replace with your actual data
  const [dataSource, setDataSource] = useState([]);
  const { id } = useParams(); // Get booking ID from URL
  const [bookingData, setBookingData] = useState(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get(`/Booking/GetStudentList/${id}`);
        const bookingData = response.data;

        // Map the API data to table format
        const mappedData = bookingData.map((student, index) => ({
          key: student.studentId, // Thêm key vào đây
          avatar: student.avatar, // placeholder avatar
          studentId: student.studentId,
          fullname: student.fullName,
          telephone: student.telPhone,
          dateOfBirth: new Date(student.dob).toLocaleDateString(),
          status: student.status || false,
          studentInGroupId: student.studentInGroupId,
          groupInBookingId: student.groupInBookingId
        }));

        setDataSource(mappedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [id]);

  const handleSave = async () => {
    try {
      const attendanceRecords = dataSource.map(student => ({
        studentInGroupId: student.studentInGroupId,
        groupInBookingId: student.groupInBookingId,
        Status: student.status ? "Attendance" : "Absent"
      }));

      const request = {
        AttendanceRecords: attendanceRecords
      };

      await apiClient.post('/Booking/Attendance', request);
      message.success('Attendance saved successfully!');
    } catch (error) {
      console.error('Error saving attendance:', error);
      message.error('Failed to save attendance');
    }
  };


  const handleStatusChange = (record, checked) => {
    const newData = dataSource.map(item => {
      if (item.key === record.key) {
        return { ...item, status: checked };
      }
      return item;
    });
    setDataSource(newData);
  };

  const columns = [
    {
      title: 'Avatar',
      dataIndex: 'avatar',
      key: 'avatar',
      render: (text) => <Avatar src={text} />,
      width: '10%',
    },
    {
      title: 'Student ID',
      dataIndex: 'studentId',
      key: 'studentId',
      width: '15%',
    },
    {
      title: 'Full Name',
      dataIndex: 'fullname',
      key: 'fullname',
      width: '20%',
    },
    {
      title: 'Telephone',
      dataIndex: 'telephone',
      key: 'telephone',
      width: '15%',
    },
    {
      title: 'Date of Birth',
      dataIndex: 'dateOfBirth',
      key: 'dateOfBirth',
      width: '15%',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: '25%',
      render: (_, record) => (
        <div>
          <Checkbox
            checked={record.status}
            onChange={(e) => handleStatusChange(record, true)}
          >
            Present
          </Checkbox>
          <Checkbox
            checked={!record.status}
            onChange={(e) => handleStatusChange(record, false)}
          >
            Absent
          </Checkbox>
        </div>
      ),
    },
  ];
  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Mark Attendance</h1>
      </div>
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        bordered
        size="small"
      />
      <div className='mt-4'>
        <Button
          type="primary"
          onClick={handleSave}
          className="bg-blue-500 hover:bg-blue-600"
        >
          Save Attendance
        </Button>
      </div>

    </div>
  );
};

export default MarkAttendance;