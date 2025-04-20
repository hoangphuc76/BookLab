import React, { useState, useEffect } from 'react';
import ApiClient from '../services/ApiClient'; // Add this import
import { message, DatePicker, Space, Tooltip } from 'antd'; // Add DatePicker import
import { InfoCircleOutlined, CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons'; // Add icons
import moment from 'moment';
import { swtoast } from '../utils/swal'; // Import the custom SweetAlert toast utility

const ChangeRoomStatusForm = ({ room, isOpen, setIsOpen, onSubmit, onCancel }) => {
  const [dateRange, setDateRange] = useState({
    startDate: moment(),
    endDate: moment().add(7, 'days')
  });
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [roomLocked, setRoomLocked] = useState(false);
  const [loading, setLoading] = useState(false); // Add loading state

  const handleMaintenanceToggle = () => {
    setMaintenanceMode(!maintenanceMode);
    if (!maintenanceMode) {
      // If turning on maintenance mode, turn off room lock
      setRoomLocked(false);
    }
  };

  const formatDateForBackend = (momentDate) => {
    if (!momentDate) return '';
    return momentDate.format('YYYY-MM-DDTHH:mm:ss');
  };

  const handleRoomLockToggle = () => {
    setRoomLocked(!roomLocked);
    if (!roomLocked) {
      // If turning on room lock, turn off maintenance mode
      setMaintenanceMode(false);
    }
  };

  useEffect(() => {
    if (room) {
      setDateRange({
        startDate: moment(),
        endDate: moment().add(7, 'days')
      });
      setMaintenanceMode(false);
      setRoomLocked(false);
      setLoading(false);
    }
  }, [room, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Determine status value based on toggle states
    let statusValue = 1; // Default: Available
    if (roomLocked) {
      statusValue = 8; // Unavailable/Locked
    } else if (maintenanceMode) {
      statusValue = 7; // Under Maintenance
    }
  
    // Validate that both dates are selected
    if (!dateRange.startDate || !dateRange.endDate) {
      swtoast.error({
        title: 'Validation Error',
        text: 'Please select both start and end date/time'
      });
      return;
    }
  
    // Validate that end date is after start date
    if (dateRange.endDate.isBefore(dateRange.startDate)) {
      swtoast.error({
        title: 'Invalid Date Range',
        text: 'End date must be after start date'
      });
      return;
    }
  
    setLoading(true);
  
    try {
      // Format dates using the moment objects
      const startDateFormatted = formatDateForBackend(dateRange.startDate);
      const endDateFormatted = formatDateForBackend(dateRange.endDate);
  
      onSubmit({
        roomId: room.id,
        startDate: startDateFormatted,
        endDate: endDateFormatted,
        maintenanceMode: maintenanceMode,
        roomLocked: roomLocked,
        statusValue: statusValue
      });
      

  
    } catch (error) {
      console.error('Error preparing room status data:', error);
      swtoast.error({
        title: 'Error',
        text: 'Error preparing form data'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    onCancel();
  };

  if (!isOpen || !room) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div
        className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-2xl p-8 mx-4"
        style={{
          background: 'linear-gradient(145deg, #f9fafb 0%, #e5e7eb 100%)',
        }}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <svg
            className="w-6 h-6 mr-3 text-indigo-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Room Status Management - {room.name}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Date & Time Range Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
              <CalendarOutlined className="mr-2 text-blue-600" />
              Date & Time Range Selection
            </h3>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <CalendarOutlined className="mr-1 text-blue-600" />
                    Start Date & Time
                  </label>
                  <DatePicker
                    showTime={{ format: 'HH:mm' }}
                    format="YYYY-MM-DD HH:mm"
                    value={dateRange.startDate}
                    onChange={(date) => setDateRange({ ...dateRange, startDate: date })}
                    disabledDate={(current) => current && current < moment().startOf('day')}
                    className="w-full"
                    placeholder="Select start date and time"
                    size="large"
                    style={{ borderRadius: '0.75rem', padding: '0.5rem 1rem' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <ClockCircleOutlined className="mr-1 text-blue-600" />
                    End Date & Time
                  </label>
                  <DatePicker
                    showTime={{ format: 'HH:mm' }}
                    format="YYYY-MM-DD HH:mm"
                    value={dateRange.endDate}
                    onChange={(date) => setDateRange({ ...dateRange, endDate: date })}
                    disabledDate={(current) => current && current < dateRange.startDate}
                    className="w-full"
                    placeholder="Select end date and time"
                    size="large"
                    style={{ borderRadius: '0.75rem', padding: '0.5rem 1rem' }}
                  />
                </div>
              </div>

              <div className="mt-4 flex items-start p-3 bg-blue-50 rounded-lg border border-blue-100">
                <InfoCircleOutlined className="text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-700 font-medium">Important Note</p>
                  <p className="text-xs text-blue-600 mt-1">
                    The room status will change precisely at the times specified above.
                    Your current local time is {moment().format('HH:mm:ss')}.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Toggles */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Room Availability Controls</h3>
            <div className="grid grid-cols-1 gap-4">
              {/* Maintenance Mode Toggle */}
              <div className="p-4 border border-gray-200 rounded-xl bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-800">Maintenance Mode</h4>
                    <p className="text-sm text-gray-500">Set room as under maintenance during selected dates</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={maintenanceMode}
                      onChange={handleMaintenanceToggle}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-indigo-300 transition-all duration-300 ease-in-out peer-checked:bg-amber-500">
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-all duration-300 ease-in-out ${maintenanceMode ? 'translate-x-5' : 'translate-x-0'
                          }`}
                      ></div>
                    </div>
                  </label>
                </div>
                {maintenanceMode && (
                  <div className="mt-3 p-2 bg-amber-50 text-amber-700 text-sm rounded-md border border-amber-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    The room will be unavailable for booking during maintenance.
                  </div>
                )}
              </div>

              {/* Room Lock Toggle */}
              <div className="p-4 border border-gray-200 rounded-xl bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-800">Lock Room</h4>
                    <p className="text-sm text-gray-500">Prevent new bookings during selected dates</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={roomLocked}
                      onChange={handleRoomLockToggle}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-indigo-300 transition-all duration-300 ease-in-out peer-checked:bg-red-500">
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-all duration-300 ease-in-out ${roomLocked ? 'translate-x-5' : 'translate-x-0'
                          }`}
                      ></div>
                    </div>
                  </label>
                </div>
                {roomLocked && (
                  <div className="mt-3 p-2 bg-red-50 text-red-700 text-sm rounded-md border border-red-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Room will be completely locked and unavailable during this period.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center justify-center py-2.5 px-5 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg
                className="w-4 h-4 mr-2 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center py-2.5 px-5 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Apply Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangeRoomStatusForm;